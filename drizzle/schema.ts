import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extended with gamification, profile, and credentials fields.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"), // Nullable for backwards compatibility / local mock OAuth
  avatar: text("avatar"), // URL to avatar image
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  
  // Gamification
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  currentStreak: integer("currentStreak").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  lastPracticeDate: integer("lastPracticeDate", { mode: "timestamp" }),
  
  // Settings
  difficultyLevel: text("difficultyLevel", { enum: ["beginner", "intermediate", "advanced"] }).default("beginner").notNull(),
  theme: text("theme", { enum: ["light", "dark", "system"] }).default("system").notNull(),
  notificationsEnabled: integer("notificationsEnabled", { mode: "boolean" }).default(true).notNull(),
  
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Word database - curated words for practice
 */
export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull().unique(),
  definition: text("definition"),
  exampleSentence: text("exampleSentence"),
  pronunciation: text("pronunciation"), // IPA or phonetic spelling
  category: text("category"), // e.g., "Science", "Literature"
  gradeLevel: integer("gradeLevel"), // 1-12, representing school grade
  difficulty: integer("difficulty").default(5), // 1-10 scale
  commonMistakes: text("commonMistakes", { mode: "json" }), // Array of common misspellings (stored as JSON text)
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Word = typeof words.$inferSelect;
export type InsertWord = typeof words.$inferInsert;

/**
 * Word lists/packs - curated collections
 */
export const wordLists = sqliteTable("wordLists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  gradeLevel: integer("gradeLevel"),
  isPublic: integer("isPublic", { mode: "boolean" }).default(true).notNull(),
  createdBy: integer("createdBy").notNull(), // User ID
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type WordList = typeof wordLists.$inferSelect;
export type InsertWordList = typeof wordLists.$inferInsert;

/**
 * Word list items - many-to-many relationship
 */
export const wordListItems = sqliteTable("wordListItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listId: integer("listId").notNull(),
  wordId: integer("wordId").notNull(),
  position: integer("position"), // Order in list
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type WordListItem = typeof wordListItems.$inferSelect;
export type InsertWordListItem = typeof wordListItems.$inferInsert;

/**
 * User word mastery tracking
 */
export const userWordMastery = sqliteTable("userWordMastery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  wordId: integer("wordId").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  correct: integer("correct").default(0).notNull(),
  accuracy: real("accuracy").default(0), // 0-100
  masteryScore: real("masteryScore").default(0), // 0-100
  lastAttemptDate: integer("lastAttemptDate", { mode: "timestamp" }),
  nextReviewDate: integer("nextReviewDate", { mode: "timestamp" }), // For spaced repetition
  difficulty: integer("difficulty").default(5), // 1-10, personalized
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type UserWordMastery = typeof userWordMastery.$inferSelect;
export type InsertUserWordMastery = typeof userWordMastery.$inferInsert;

/**
 * Practice exercises/sessions
 */
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  wordId: integer("wordId").notNull(),
  type: text("type", { enum: ["type_the_word", "fill_in_blank", "audio_to_text", "multiple_choice"] }).notNull(),
  difficulty: integer("difficulty").default(5), // 1-10
  xpReward: integer("xpReward").default(10).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

/**
 * Exercise attempts - user responses
 */
export const exerciseAttempts = sqliteTable("exerciseAttempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exerciseId").notNull(),
  userId: integer("userId").notNull(),
  wordId: integer("wordId").notNull(),
  userAnswer: text("userAnswer"),
  isCorrect: integer("isCorrect", { mode: "boolean" }).notNull(),
  responseTime: integer("responseTime"), // milliseconds
  xpEarned: integer("xpEarned").default(0).notNull(),
  confidence: integer("confidence"), // 1-5 scale, user's confidence
  hint: text("hint"), // AI-generated hint if used
  explanation: text("explanation"), // AI-generated explanation
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = typeof exerciseAttempts.$inferInsert;

/**
 * Practice sessions - grouped attempts
 */
export const practiceSessions = sqliteTable("practiceSessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  startTime: integer("startTime", { mode: "timestamp" }).defaultNow().notNull(),
  endTime: integer("endTime", { mode: "timestamp" }),
  totalAttempts: integer("totalAttempts").default(0).notNull(),
  correctAttempts: integer("correctAttempts").default(0).notNull(),
  accuracy: real("accuracy").default(0),
  xpEarned: integer("xpEarned").default(0).notNull(),
  streakBefore: integer("streakBefore").default(0).notNull(),
  streakAfter: integer("streakAfter").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = typeof practiceSessions.$inferInsert;

/**
 * Achievements and badges
 */
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // URL or emoji
  type: text("type", { enum: ["milestone", "streak", "accuracy", "speed", "special"] }).notNull(),
  requirement: integer("requirement"), // e.g., 100 words mastered
  xpReward: integer("xpReward").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements - unlocked badges
 */
export const userAchievements = sqliteTable("userAchievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  unlockedAt: integer("unlockedAt", { mode: "timestamp" }).defaultNow().notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Leaderboard entries (denormalized for performance)
 */
export const leaderboard = sqliteTable("leaderboard", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  rank: integer("rank"),
  period: text("period", { enum: ["all_time", "monthly", "weekly"] }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

/**
 * User statistics - aggregated for performance
 */
export const userStatistics = sqliteTable("userStatistics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  totalAttempts: integer("totalAttempts").default(0).notNull(),
  correctAttempts: integer("correctAttempts").default(0).notNull(),
  overallAccuracy: real("overallAccuracy").default(0),
  wordsAttempted: integer("wordsAttempted").default(0).notNull(),
  wordsMastered: integer("wordsMastered").default(0).notNull(),
  totalSessions: integer("totalSessions").default(0).notNull(),
  totalMinutesPracticed: integer("totalMinutesPracticed").default(0).notNull(),
  lastUpdated: integer("lastUpdated", { mode: "timestamp" }).defaultNow().notNull(),
});

export type UserStatistics = typeof userStatistics.$inferSelect;
export type InsertUserStatistics = typeof userStatistics.$inferInsert;

/**
 * Daily activity log for heatmap
 */
export const dailyActivity = sqliteTable("dailyActivity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  attempts: integer("attempts").default(0).notNull(),
  correctAttempts: integer("correctAttempts").default(0).notNull(),
  xpEarned: integer("xpEarned").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type DailyActivity = typeof dailyActivity.$inferSelect;
export type InsertDailyActivity = typeof dailyActivity.$inferInsert;
