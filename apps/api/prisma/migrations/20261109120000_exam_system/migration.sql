-- CreateTable
CREATE TABLE `Exam` (
    `id` VARCHAR(191) NOT NULL,
    `teacherProfileId` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `format` VARCHAR(191) NOT NULL DEFAULT 'GOETHE',
    `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `passPercent` DOUBLE NOT NULL DEFAULT 60,
    `maxAttempts` INTEGER NOT NULL DEFAULT 1,
    `opensAt` DATETIME(3) NULL,
    `closesAt` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `questions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Exam_teacherProfileId_idx`(`teacherProfileId`),
    INDEX `Exam_batchId_status_idx`(`batchId`, `status`),
    INDEX `Exam_opensAt_closesAt_idx`(`opensAt`, `closesAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExamAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `attemptNumber` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('IN_PROGRESS', 'NEEDS_REVIEW', 'GRADED') NOT NULL DEFAULT 'IN_PROGRESS',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `answers` JSON NOT NULL,
    `manualScores` JSON NULL,
    `score` DOUBLE NULL,
    `maxScore` DOUBLE NOT NULL DEFAULT 0,
    `percentage` DOUBLE NULL,
    `passed` BOOLEAN NULL,
    `teacherFeedback` TEXT NULL,

    INDEX `ExamAttempt_userId_status_idx`(`userId`, `status`),
    INDEX `ExamAttempt_examId_status_idx`(`examId`, `status`),
    UNIQUE INDEX `ExamAttempt_examId_userId_attemptNumber_key`(`examId`, `userId`, `attemptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exam` ADD CONSTRAINT `Exam_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `TeacherBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamAttempt` ADD CONSTRAINT `ExamAttempt_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExamAttempt` ADD CONSTRAINT `ExamAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

