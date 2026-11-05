-- One-time import from the original snake_case schema into the Prisma schema.
-- Run only after the Prisma tables exist and the production database is backed up.
-- The legacy tables remain untouched and serve as an immediate data fallback.
START TRANSACTION;

INSERT INTO `User` (`id`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `role`, `isActive`, `isEmailVerified`, `avatarUrl`, `createdAt`, `updatedAt`)
SELECT `id`, `email`, `password_hash`, `first_name`, `last_name`, NULLIF(`phone`, ''), `role`, `is_active`, `is_email_verified`, `avatar_url`, `created_at`, `updated_at`
FROM `users`;

INSERT INTO `StudentProfile` (`id`, `userId`, `currentLevel`, `learningGoal`, `preferredLanguage`, `dailyGoalMinutes`, `streakCount`, `lastActiveDate`, `createdAt`, `updatedAt`)
SELECT `id`, `user_id`, `current_level`, `learning_goal`, `preferred_language`, `daily_goal_minutes`, `streak_count`, `last_active_date`, `created_at`, `updated_at`
FROM `student_profiles`;

INSERT INTO `TeacherProfile` (`id`, `userId`, `bio`, `qualifications`, `specialization`, `maxBatches`, `createdAt`, `updatedAt`)
SELECT `id`, `user_id`, `bio`, `qualifications`, `specialization`, `max_batches`, `created_at`, `updated_at`
FROM `teacher_profiles`;

INSERT INTO `Course` (`id`, `slug`, `title`, `description`, `level`, `learningObjectives`, `estimatedHours`, `thumbnailUrl`, `status`, `order`, `createdAt`, `updatedAt`)
SELECT `id`, `slug`, `title`, `description`, `level`, `learning_objectives`, `estimated_hours`, `thumbnail_url`, `status`, `order_index`, `created_at`, `updated_at`
FROM `courses`;

INSERT INTO `CourseUnit` (`id`, `courseId`, `title`, `description`, `order`, `createdAt`, `updatedAt`)
SELECT `id`, `course_id`, `title`, `description`, `order_index`, `created_at`, `updated_at`
FROM `course_units`;

INSERT INTO `Lesson` (`id`, `unitId`, `title`, `description`, `durationMinutes`, `order`, `status`, `createdAt`, `updatedAt`)
SELECT `id`, `unit_id`, `title`, `description`, `duration_minutes`, `order_index`, `status`, `created_at`, `updated_at`
FROM `lessons`;

INSERT INTO `TeacherBatch` (`id`, `name`, `level`, `description`, `startDate`, `endDate`, `maxStudents`, `isActive`, `createdAt`, `updatedAt`)
SELECT `id`, `name`, `level`, `description`, `start_date`, `end_date`, `max_students`, `is_active`, `created_at`, `updated_at`
FROM `teacher_batches`;

INSERT INTO `TeacherBatchAssignment` (`id`, `batchId`, `teacherId`, `isPrimary`, `assignedAt`)
SELECT `id`, `batch_id`, `teacher_id`, `is_primary`, `assigned_at`
FROM `teacher_batch_assignments`;

INSERT INTO `BatchMembership` (`id`, `batchId`, `userId`, `status`, `joinedAt`)
SELECT `id`, `batch_id`, `user_id`, `status`, `joined_at`
FROM `batch_memberships`;

INSERT INTO `VocabularyWord` (`id`, `categoryId`, `german`, `english`, `hindi`, `article`, `plural`, `partOfSpeech`, `level`, `category`, `exampleSentenceDe`, `exampleSentenceEn`, `exampleSentenceHi`, `ipa`, `audioUrl`, `tags`, `difficulty`, `status`, `createdAt`, `updatedAt`)
SELECT `id`, NULL, `german`, `english`, `hindi`, `article`, `plural`, `part_of_speech`, `level`, `category`, `example_sentence_de`, `example_sentence_en`, `example_sentence_hi`, `ipa`, `audio_url`, `tags`, `difficulty`, `status`, `created_at`, `updated_at`
FROM `vocabulary_words`;

INSERT INTO `SiteSetting` (`id`, `key`, `value`, `description`, `updatedAt`)
SELECT `id`, `setting_key`, `setting_value`, `description`, `updated_at`
FROM `site_settings`;

INSERT INTO `AuditLog` (`id`, `userId`, `action`, `entityType`, `entityId`, `details`, `ipAddress`, `userAgent`, `createdAt`)
SELECT `id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `user_agent`, `created_at`
FROM `audit_logs`;

COMMIT;
