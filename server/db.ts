import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, words, userWordMastery, practiceSessions, exerciseAttempts, userStatistics, userAchievements, achievements, leaderboard, dailyActivity } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the libsql connection
export async function getDb() {
  if (!_db) {
    try {
      const client = createClient({ url: "file:sqlite.db" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect LibSQL/SQLite:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "password"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Gamification helpers
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(userStatistics).where(eq(userStatistics.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrCreateUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  let stats = await getUserStats(userId);
  if (!stats) {
    await db.insert(userStatistics).values({ userId });
    stats = await getUserStats(userId);
  }
  return stats;
}

// Practice session helpers
export async function getRecentPracticeSessions(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(limit);
}

export async function getTodayPracticeSession(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db.select().from(practiceSessions)
    .where(and(
      eq(practiceSessions.userId, userId),
      gte(practiceSessions.createdAt, today),
      lte(practiceSessions.createdAt, tomorrow)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Word mastery helpers
export async function getUserWordMastery(userId: number, wordId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(userWordMastery)
    .where(and(
      eq(userWordMastery.userId, userId),
      eq(userWordMastery.wordId, wordId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getWordsForReview(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db.select().from(userWordMastery)
    .where(and(
      eq(userWordMastery.userId, userId),
      lte(userWordMastery.nextReviewDate, now)
    ))
    .orderBy(desc(userWordMastery.nextReviewDate))
    .limit(limit);
}

// Achievement helpers
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    achievement: achievements,
    unlockedAt: userAchievements.unlockedAt,
  })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
}

export async function hasAchievement(userId: number, achievementId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);

  return result.length > 0;
}

// Leaderboard helpers
export async function getLeaderboard(period: "all_time" | "monthly" | "weekly", limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    user: users,
    rank: leaderboard.rank,
    xp: leaderboard.xp,
    level: leaderboard.level,
  })
    .from(leaderboard)
    .innerJoin(users, eq(leaderboard.userId, users.id))
    .where(eq(leaderboard.period, period))
    .orderBy(leaderboard.rank)
    .limit(limit);
}

export async function getUserLeaderboardRank(userId: number, period: "all_time" | "monthly" | "weekly") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(leaderboard)
    .where(and(
      eq(leaderboard.userId, userId),
      eq(leaderboard.period, period)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Daily activity helpers
export async function getDailyActivity(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(dailyActivity)
    .where(and(
      eq(dailyActivity.userId, userId),
      eq(dailyActivity.date, date)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getActivityHeatmap(userId: number, days: number = 365) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split('T')[0];

  return db.select().from(dailyActivity)
    .where(and(
      eq(dailyActivity.userId, userId),
      gte(dailyActivity.date, dateStr)
    ))
    .orderBy(dailyActivity.date);
}

// Exercise attempt helpers
export async function getRecentAttempts(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(exerciseAttempts)
    .where(eq(exerciseAttempts.userId, userId))
    .orderBy(desc(exerciseAttempts.createdAt))
    .limit(limit);
}

export async function getAccuracyByWord(userId: number, wordId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(exerciseAttempts)
    .where(and(
      eq(exerciseAttempts.userId, userId),
      eq(exerciseAttempts.wordId, wordId)
    ));

  if (result.length === 0) return null;

  const correct = result.filter(r => r.isCorrect).length;
  return {
    total: result.length,
    correct,
    accuracy: (correct / result.length) * 100,
  };
}
