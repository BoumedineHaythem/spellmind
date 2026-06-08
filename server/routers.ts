import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb, getUserById, getUserStats, getOrCreateUserStats, getRecentPracticeSessions, getUserWordMastery, getWordsForReview, getUserAchievements, getLeaderboard, getUserLeaderboardRank, getActivityHeatmap, getRecentAttempts, getAccuracyByWord, getUserByEmail, getUserByOpenId, upsertUser } from "./db";
import { users, practiceSessions, userWordMastery, exerciseAttempts, userStatistics, userAchievements, achievements, dailyActivity, words } from "../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { sdk } from "./_core/sdk";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || user.password !== input.password) {
          throw new Error("Invalid email or password");
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user };
      }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new Error("Email already registered");
        }

        const openId = `local_${Math.random().toString(36).substring(2, 11)}`;

        await upsertUser({
          openId,
          name: input.name,
          email: input.email,
          password: input.password,
          loginMethod: "credentials",
          role: "user",
          lastSignedIn: new Date(),
        });

        const user = await getUserByOpenId(openId);
        if (!user) {
          throw new Error("Failed to create user");
        }

        // Initialize user stats
        await getOrCreateUserStats(user.id);

        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user };
      }),
  }),

  // User profile and settings
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return user || null;
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
        difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
        notificationsEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.avatar !== undefined) updateData.avatar = input.avatar;
        if (input.difficultyLevel !== undefined) updateData.difficultyLevel = input.difficultyLevel;
        if (input.theme !== undefined) updateData.theme = input.theme;
        if (input.notificationsEnabled !== undefined) updateData.notificationsEnabled = input.notificationsEnabled;

        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // Dashboard and statistics
  dashboard: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const user = await getUserById(ctx.user.id);
      const stats = await getOrCreateUserStats(ctx.user.id);
      const recentSessions = await getRecentPracticeSessions(ctx.user.id, 5);

      return {
        user,
        stats,
        recentSessions,
        currentStreak: user?.currentStreak || 0,
        xp: user?.xp || 0,
        level: user?.level || 1,
      };
    }),

    getActivityHeatmap: protectedProcedure
      .input(z.object({ days: z.number().default(365) }))
      .query(async ({ ctx, input }) => {
        return getActivityHeatmap(ctx.user.id, input.days);
      }),
  }),

  // Practice and exercises
  practice: router({
    startSession: protectedProcedure
      .input(z.object({
        wordListId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const session = await db.insert(practiceSessions).values({
          userId: ctx.user.id,
          startTime: new Date(),
        });

        return { sessionId: session[0] };
      }),

    recordAttempt: protectedProcedure
      .input(z.object({
        exerciseId: z.number(),
        wordId: z.number(),
        userAnswer: z.string(),
        isCorrect: z.boolean(),
        responseTime: z.number(),
        confidence: z.number().min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Calculate XP reward
        let xpEarned = 10;
        if (input.isCorrect) {
          xpEarned = 20 + (input.confidence * 5);
        }

        // Record the attempt
        const attempt = await db.insert(exerciseAttempts).values({
          exerciseId: input.exerciseId,
          userId: ctx.user.id,
          wordId: input.wordId,
          userAnswer: input.userAnswer,
          isCorrect: input.isCorrect,
          responseTime: input.responseTime,
          xpEarned,
          confidence: input.confidence,
        });

        // Update user XP and level
        const user = await getUserById(ctx.user.id);
        if (user) {
          const newXp = (user.xp || 0) + xpEarned;
          const newLevel = Math.floor(newXp / 1000) + 1;

          await db.update(users).set({
            xp: newXp,
            level: newLevel,
          }).where(eq(users.id, ctx.user.id));
        }

        // Update word mastery
        const mastery = await getUserWordMastery(ctx.user.id, input.wordId);
        if (mastery) {
          const newAttempts = mastery.attempts + 1;
          const newCorrect = mastery.correct + (input.isCorrect ? 1 : 0);
          const accuracy = (newCorrect / newAttempts) * 100;

          // Calculate next review date using spaced repetition
          let nextReviewDate = new Date();
          if (input.isCorrect) {
            if (newCorrect === 1) nextReviewDate.setDate(nextReviewDate.getDate() + 1);
            else if (newCorrect === 2) nextReviewDate.setDate(nextReviewDate.getDate() + 3);
            else if (newCorrect === 3) nextReviewDate.setDate(nextReviewDate.getDate() + 7);
            else if (newCorrect === 4) nextReviewDate.setDate(nextReviewDate.getDate() + 14);
            else nextReviewDate.setDate(nextReviewDate.getDate() + 30);
          } else {
            nextReviewDate.setHours(nextReviewDate.getHours() + 1);
          }

          await db.update(userWordMastery).set({
            attempts: newAttempts,
            correct: newCorrect,
            accuracy: accuracy.toString(),
            masteryScore: accuracy.toString(),
            lastAttemptDate: new Date(),
            nextReviewDate,
          }).where(and(
            eq(userWordMastery.userId, ctx.user.id),
            eq(userWordMastery.wordId, input.wordId)
          ));
        } else {
          // Create new mastery record
          await db.insert(userWordMastery).values({
            userId: ctx.user.id,
            wordId: input.wordId,
            attempts: 1,
            correct: input.isCorrect ? 1 : 0,
            accuracy: input.isCorrect ? "100" : "0",
            masteryScore: input.isCorrect ? "100" : "0",
            lastAttemptDate: new Date(),
            nextReviewDate: input.isCorrect ? new Date(Date.now() + 86400000) : new Date(),
          });
        }

        return { xpEarned, success: true };
      }),

    getNextWords: protectedProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        // Get words due for review
        const wordsForReview = await getWordsForReview(ctx.user.id, input.limit);
        if (wordsForReview.length > 0) {
          return db.select().from(words).where(
            eq(words.id, wordsForReview[0].wordId)
          );
        }

        // Otherwise get random words
        return db.select().from(words).limit(input.limit);
      }),

    generateHint: protectedProcedure
      .input(z.object({ word: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a helpful spelling tutor. Provide a brief, encouraging hint to help someone spell the word correctly. Keep it under 50 words.",
            },
            {
              role: "user",
              content: `Give me a hint for spelling the word: "${input.word}"`,
            },
          ],
        });

        return {
          hint: response.choices[0]?.message.content || "Try breaking the word into smaller parts!",
        };
      }),

    generateExplanation: protectedProcedure
      .input(z.object({ word: z.string(), userAnswer: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a friendly spelling tutor. Explain why the correct spelling is right and what the user did wrong. Be encouraging and helpful. Keep it under 100 words.",
            },
            {
              role: "user",
              content: `The correct spelling is "${input.word}" but the user wrote "${input.userAnswer}". Explain the difference.`,
            },
          ],
        });

        return {
          explanation: response.choices[0]?.message.content || "Keep practicing! You're doing great.",
        };
      }),
  }),

  // Gamification
  gamification: router({
    getLeaderboard: publicProcedure
      .input(z.object({
        period: z.enum(["all_time", "monthly", "weekly"]).default("all_time"),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return getLeaderboard(input.period, input.limit);
      }),

    getUserRank: protectedProcedure
      .input(z.object({
        period: z.enum(["all_time", "monthly", "weekly"]),
      }))
      .query(async ({ ctx, input }) => {
        return getUserLeaderboardRank(ctx.user.id, input.period);
      }),

    getAchievements: protectedProcedure.query(async ({ ctx }) => {
      return getUserAchievements(ctx.user.id);
    }),
  }),

  // Statistics
  statistics: router({
    getAccuracyTrend: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const attempts = await db.select().from(exerciseAttempts)
          .where(and(
            eq(exerciseAttempts.userId, ctx.user.id),
            gte(exerciseAttempts.createdAt, startDate)
          ))
          .orderBy(exerciseAttempts.createdAt);

        // Group by date and calculate accuracy
        const grouped: Record<string, { correct: number; total: number }> = {};
        attempts.forEach(attempt => {
          const date = attempt.createdAt.toISOString().split('T')[0];
          if (!grouped[date]) grouped[date] = { correct: 0, total: 0 };
          grouped[date].total++;
          if (attempt.isCorrect) grouped[date].correct++;
        });

        return Object.entries(grouped).map(([date, data]) => ({
          date,
          accuracy: (data.correct / data.total) * 100,
          attempts: data.total,
        }));
      }),

    getWeakAreas: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const attempts = await getRecentAttempts(ctx.user.id, 100);
      const wordStats: Record<number, { correct: number; total: number }> = {};

      attempts.forEach(attempt => {
        if (!wordStats[attempt.wordId]) {
          wordStats[attempt.wordId] = { correct: 0, total: 0 };
        }
        wordStats[attempt.wordId].total++;
        if (attempt.isCorrect) wordStats[attempt.wordId].correct++;
      });

      // Find words with lowest accuracy
      const weakWords = Object.entries(wordStats)
        .map(([wordId, stats]) => ({
          wordId: parseInt(wordId),
          accuracy: (stats.correct / stats.total) * 100,
          attempts: stats.total,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10);

      return weakWords;
    }),
  }),
});

export type AppRouter = typeof appRouter;
