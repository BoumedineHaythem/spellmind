CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` text,
	`type` enum('milestone','streak','accuracy','speed','special') NOT NULL,
	`requirement` int,
	`xpReward` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyActivity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`correctAttempts` int NOT NULL DEFAULT 0,
	`xpEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyActivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exerciseAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exerciseId` int NOT NULL,
	`userId` int NOT NULL,
	`wordId` int NOT NULL,
	`userAnswer` text,
	`isCorrect` boolean NOT NULL,
	`responseTime` int,
	`xpEarned` int NOT NULL DEFAULT 0,
	`confidence` int,
	`hint` text,
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exerciseAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wordId` int NOT NULL,
	`type` enum('type_the_word','fill_in_blank','audio_to_text','multiple_choice') NOT NULL,
	`difficulty` int DEFAULT 5,
	`xpReward` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`rank` int,
	`period` enum('all_time','monthly','weekly') NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practiceSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp,
	`totalAttempts` int NOT NULL DEFAULT 0,
	`correctAttempts` int NOT NULL DEFAULT 0,
	`accuracy` decimal(5,2) DEFAULT '0',
	`xpEarned` int NOT NULL DEFAULT 0,
	`streakBefore` int NOT NULL DEFAULT 0,
	`streakAfter` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practiceSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStatistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalAttempts` int NOT NULL DEFAULT 0,
	`correctAttempts` int NOT NULL DEFAULT 0,
	`overallAccuracy` decimal(5,2) DEFAULT '0',
	`wordsAttempted` int NOT NULL DEFAULT 0,
	`wordsMastered` int NOT NULL DEFAULT 0,
	`totalSessions` int NOT NULL DEFAULT 0,
	`totalMinutesPracticed` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStatistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userWordMastery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wordId` int NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`correct` int NOT NULL DEFAULT 0,
	`accuracy` decimal(5,2) DEFAULT '0',
	`masteryScore` decimal(5,2) DEFAULT '0',
	`lastAttemptDate` timestamp,
	`nextReviewDate` timestamp,
	`difficulty` int DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userWordMastery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wordListItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`wordId` int NOT NULL,
	`position` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wordListItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wordLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`gradeLevel` int,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wordLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`definition` text,
	`exampleSentence` text,
	`pronunciation` text,
	`category` varchar(100),
	`gradeLevel` int,
	`difficulty` int DEFAULT 5,
	`commonMistakes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `words_id` PRIMARY KEY(`id`),
	CONSTRAINT `words_word_unique` UNIQUE(`word`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `xp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `level` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `longestStreak` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastPracticeDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `difficultyLevel` enum('beginner','intermediate','advanced') DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `theme` enum('light','dark','system') DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notificationsEnabled` boolean DEFAULT true NOT NULL;