-- ==============================================================================
-- DeutschWelt German Language Learning & Coaching Platform
-- Complete Production MySQL Database Export & Schema
-- Compatible with MySQL 8.0+, MariaDB 10.5+, phpMyAdmin, and MySQL Workbench
-- ==============================================================================
-- How to Import:
-- 1. Via Command Line:
--    mysql -u [username] -p < deutschwelt_mysql_schema.sql
-- 2. Via MySQL Workbench / DBeaver:
--    Open File -> Run SQL Script -> deutschwelt_mysql_schema.sql
-- 3. Via phpMyAdmin:
--    Click 'Import' tab -> Select deutschwelt_mysql_schema.sql -> Execute
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `deutschwelt`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `deutschwelt`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLE: users
-- Captures required registration info: email, mobile number (phone), password,
-- first name, last name, address, plus telemetry: registration_ip, last_login_ip, user_agent.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `avatar_url` VARCHAR(255) NULL,
  `registration_ip` VARCHAR(64) NULL,
  `last_login_ip` VARCHAR(64) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_registration_ip` (`registration_ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLE: student_profiles
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_profiles`;
CREATE TABLE `student_profiles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `current_level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL DEFAULT 'A1',
  `learning_goal` VARCHAR(255) NULL,
  `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `daily_goal_minutes` INT NOT NULL DEFAULT 20,
  `streak_count` INT NOT NULL DEFAULT 0,
  `last_active_date` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_student_profiles_user_id` (`user_id`),
  CONSTRAINT `fk_student_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLE: teacher_profiles
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_profiles`;
CREATE TABLE `teacher_profiles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `bio` TEXT NULL,
  `qualifications` VARCHAR(255) NULL,
  `specialization` VARCHAR(255) NULL,
  `max_batches` INT NOT NULL DEFAULT 5,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_teacher_profiles_user_id` (`user_id`),
  CONSTRAINT `fk_teacher_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLE: sessions
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `user_agent` TEXT NULL,
  `ip_address` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sessions_token` (`token`),
  KEY `idx_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLE: password_reset_tokens
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_password_reset_tokens_hash` (`token_hash`),
  KEY `idx_password_reset_tokens_user` (`user_id`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLE: courses
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` VARCHAR(36) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `learning_objectives` JSON NOT NULL,
  `estimated_hours` INT NOT NULL DEFAULT 40,
  `thumbnail_url` VARCHAR(255) NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_courses_slug` (`slug`),
  KEY `idx_courses_level` (`level`),
  KEY `idx_courses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLE: course_units
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `course_units`;
CREATE TABLE `course_units` (
  `id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_units_course_id` (`course_id`),
  CONSTRAINT `fk_course_units_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLE: lessons
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` VARCHAR(36) NOT NULL,
  `unit_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 15,
  `order_index` INT NOT NULL DEFAULT 0,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_unit_id` (`unit_id`),
  CONSTRAINT `fk_lessons_unit` FOREIGN KEY (`unit_id`) REFERENCES `course_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLE: lesson_content_blocks
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `lesson_content_blocks`;
CREATE TABLE `lesson_content_blocks` (
  `id` VARCHAR(36) NOT NULL,
  `lesson_id` VARCHAR(36) NOT NULL,
  `type` ENUM('TEXT', 'VOCABULARY', 'GRAMMAR', 'READING', 'LISTENING', 'EXERCISE', 'WRITING_PROMPT', 'SPEAKING_PROMPT') NOT NULL,
  `title` VARCHAR(255) NULL,
  `content` LONGTEXT NOT NULL,
  `media_url` VARCHAR(255) NULL,
  `transcript` LONGTEXT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `meta` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lesson_content_blocks_lesson` (`lesson_id`),
  CONSTRAINT `fk_content_blocks_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABLE: vocabulary_categories
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `vocabulary_categories`;
CREATE TABLE `vocabulary_categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_vocab_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. TABLE: vocabulary_words
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `vocabulary_words`;
CREATE TABLE `vocabulary_words` (
  `id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NULL,
  `german` VARCHAR(100) NOT NULL,
  `english` VARCHAR(100) NOT NULL,
  `hindi` VARCHAR(100) NULL,
  `article` ENUM('DER', 'DIE', 'DAS', 'PLURAL', 'NONE') NOT NULL DEFAULT 'NONE',
  `plural` VARCHAR(100) NULL,
  `part_of_speech` ENUM('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 'PRONOUN', 'CONJUNCTION', 'PHRASE', 'IDIOM') NOT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `example_sentence_de` TEXT NOT NULL,
  `example_sentence_en` TEXT NOT NULL,
  `example_sentence_hi` TEXT NULL,
  `ipa` VARCHAR(100) NULL,
  `audio_url` VARCHAR(255) NULL,
  `tags` JSON NOT NULL,
  `difficulty` INT NOT NULL DEFAULT 1,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vocab_words_german` (`german`),
  KEY `idx_vocab_words_level` (`level`),
  KEY `idx_vocab_words_category` (`category`),
  KEY `idx_vocab_words_article` (`article`),
  CONSTRAINT `fk_vocab_words_category` FOREIGN KEY (`category_id`) REFERENCES `vocabulary_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. TABLE: student_vocabulary_progress (Leitner 5-box system)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_vocabulary_progress`;
CREATE TABLE `student_vocabulary_progress` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `word_id` VARCHAR(36) NOT NULL,
  `status` ENUM('NEW', 'LEARNING', 'REVIEWING', 'MASTERED') NOT NULL DEFAULT 'LEARNING',
  `box` INT NOT NULL DEFAULT 1,
  `times_reviewed` INT NOT NULL DEFAULT 0,
  `times_correct` INT NOT NULL DEFAULT 0,
  `last_reviewed_at` DATETIME NULL,
  `next_review_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_student_vocab_unique` (`user_id`, `word_id`),
  KEY `idx_student_vocab_user` (`user_id`),
  KEY `idx_student_vocab_next_review` (`next_review_at`),
  CONSTRAINT `fk_student_vocab_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_vocab_word` FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. TABLE: exercises
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `exercises`;
CREATE TABLE `exercises` (
  `id` VARCHAR(36) NOT NULL,
  `lesson_id` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `type` ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SENTENCE_ORDERING', 'MATCHING', 'TRANSLATION', 'GRAMMAR_CORRECTION', 'READING_COMPREHENSION', 'LISTENING_COMPREHENSION', 'WRITING') NOT NULL,
  `passing_score` FLOAT NOT NULL DEFAULT 70.0,
  `order_index` INT NOT NULL DEFAULT 0,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercises_lesson_id` (`lesson_id`),
  KEY `idx_exercises_level` (`level`),
  CONSTRAINT `fk_exercises_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. TABLE: exercise_questions
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `exercise_questions`;
CREATE TABLE `exercise_questions` (
  `id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `type` ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SENTENCE_ORDERING', 'MATCHING', 'TRANSLATION', 'GRAMMAR_CORRECTION', 'READING_COMPREHENSION', 'LISTENING_COMPREHENSION', 'WRITING') NOT NULL,
  `prompt` TEXT NOT NULL,
  `instructions` TEXT NULL,
  `hint` TEXT NULL,
  `explanation` TEXT NULL,
  `points` INT NOT NULL DEFAULT 1,
  `order_index` INT NOT NULL DEFAULT 0,
  `context_passage` TEXT NULL,
  `audio_url` VARCHAR(255) NULL,
  `correct_answer` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercise_questions_exercise` (`exercise_id`),
  CONSTRAINT `fk_exercise_questions_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. TABLE: exercise_options
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `exercise_options`;
CREATE TABLE `exercise_options` (
  `id` VARCHAR(36) NOT NULL,
  `question_id` VARCHAR(36) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_exercise_options_question` (`question_id`),
  CONSTRAINT `fk_exercise_options_question` FOREIGN KEY (`question_id`) REFERENCES `exercise_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. TABLE: exercise_attempts
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `exercise_attempts`;
CREATE TABLE `exercise_attempts` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `score` FLOAT NOT NULL,
  `max_score` FLOAT NOT NULL,
  `percentage` FLOAT NOT NULL,
  `passed` TINYINT(1) NOT NULL,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exercise_attempts_user` (`user_id`),
  KEY `idx_exercise_attempts_exercise` (`exercise_id`),
  CONSTRAINT `fk_exercise_attempts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exercise_attempts_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 17. TABLE: speaking_prompts
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `speaking_prompts`;
CREATE TABLE `speaking_prompts` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `scenario` TEXT NOT NULL,
  `instructions` TEXT NOT NULL,
  `sample_answer_de` TEXT NULL,
  `sample_answer_en` TEXT NULL,
  `min_duration_seconds` INT NOT NULL DEFAULT 15,
  `max_duration_seconds` INT NOT NULL DEFAULT 120,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_speaking_prompts_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. TABLE: speaking_attempts
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `speaking_attempts`;
CREATE TABLE `speaking_attempts` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `prompt_id` VARCHAR(36) NOT NULL,
  `audio_url` VARCHAR(255) NULL,
  `duration_seconds` INT NULL,
  `transcript_text` TEXT NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'REVISION_REQUESTED') NOT NULL DEFAULT 'SUBMITTED',
  `score` FLOAT NULL,
  `teacher_feedback` TEXT NULL,
  `teacher_id` VARCHAR(36) NULL,
  `rubric_scores` JSON NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `evaluated_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_speaking_attempts_user` (`user_id`),
  KEY `idx_speaking_attempts_prompt` (`prompt_id`),
  CONSTRAINT `fk_speaking_attempts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_speaking_attempts_prompt` FOREIGN KEY (`prompt_id`) REFERENCES `speaking_prompts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_speaking_attempts_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 19. TABLE: teacher_batches
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_batches`;
CREATE TABLE `teacher_batches` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `description` TEXT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NULL,
  `max_students` INT NOT NULL DEFAULT 25,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 20. TABLE: batch_memberships
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `batch_memberships`;
CREATE TABLE `batch_memberships` (
  `id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_batch_memberships_unique` (`batch_id`, `user_id`),
  KEY `idx_batch_memberships_batch` (`batch_id`),
  KEY `idx_batch_memberships_user` (`user_id`),
  CONSTRAINT `fk_batch_memberships_batch` FOREIGN KEY (`batch_id`) REFERENCES `teacher_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_batch_memberships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 21. TABLE: teacher_batch_assignments (Enables multi-teacher isolation)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_batch_assignments`;
CREATE TABLE `teacher_batch_assignments` (
  `id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 1,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_teacher_batch_unique` (`batch_id`, `teacher_id`),
  KEY `idx_teacher_batch_batch` (`batch_id`),
  KEY `idx_teacher_batch_teacher` (`teacher_id`),
  CONSTRAINT `fk_teacher_batch_batch` FOREIGN KEY (`batch_id`) REFERENCES `teacher_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_batch_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 22. TABLE: teacher_lectures (Recorded lectures & live classes uploaded by teachers)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_lectures`;
CREATE TABLE `teacher_lectures` (
  `id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL DEFAULT 'A1',
  `video_url` VARCHAR(255) NULL,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `scheduled_for` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_live` TINYINT(1) NOT NULL DEFAULT 0,
  `meeting_url` VARCHAR(255) NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_lectures_teacher` (`teacher_id`),
  KEY `idx_teacher_lectures_batch` (`batch_id`),
  CONSTRAINT `fk_teacher_lectures_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_lectures_batch` FOREIGN KEY (`batch_id`) REFERENCES `teacher_batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 23. TABLE: teacher_materials (Worksheets, PDFs, handouts uploaded by teachers)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_materials`;
CREATE TABLE `teacher_materials` (
  `id` VARCHAR(36) NOT NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `batch_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'WORKSHEET',
  `description` TEXT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(20) NOT NULL DEFAULT 'PDF',
  `file_size` VARCHAR(50) NOT NULL DEFAULT '1.5 MB',
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL DEFAULT 'A1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_materials_teacher` (`teacher_id`),
  KEY `idx_teacher_materials_batch` (`batch_id`),
  CONSTRAINT `fk_teacher_materials_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_materials_batch` FOREIGN KEY (`batch_id`) REFERENCES `teacher_batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 24. TABLE: assignments
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` VARCHAR(36) NOT NULL,
  `course_id` VARCHAR(36) NULL,
  `batch_id` VARCHAR(36) NULL,
  `teacher_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL,
  `due_date` DATETIME NOT NULL,
  `max_points` INT NOT NULL DEFAULT 100,
  `instructions` TEXT NOT NULL,
  `rubric_criteria` JSON NOT NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_teacher` (`teacher_id`),
  KEY `idx_assignments_course` (`course_id`),
  KEY `idx_assignments_batch` (`batch_id`),
  CONSTRAINT `fk_assignments_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignments_batch` FOREIGN KEY (`batch_id`) REFERENCES `teacher_batches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 25. TABLE: assignment_submissions
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `assignment_submissions`;
CREATE TABLE `assignment_submissions` (
  `id` VARCHAR(36) NOT NULL,
  `assignment_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `attachment_url` VARCHAR(255) NULL,
  `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'REVISION_REQUESTED') NOT NULL DEFAULT 'SUBMITTED',
  `score` FLOAT NULL,
  `teacher_feedback` TEXT NULL,
  `rubric_scores` JSON NULL,
  `evaluated_at` DATETIME NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignment_submissions_assignment` (`assignment_id`),
  KEY `idx_assignment_submissions_user` (`user_id`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 26. TABLE: notifications
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'INFO',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `link_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 27. TABLE: contact_enquiries
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `contact_enquiries`;
CREATE TABLE `contact_enquiries` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `level` ENUM('BEGINNER', 'A1', 'A2', 'B1', 'B2', 'UNSURE') NOT NULL DEFAULT 'A1',
  `message` TEXT NOT NULL,
  `status` ENUM('NEW', 'CONTACTED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  `admin_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enquiries_status` (`status`),
  KEY `idx_enquiries_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 28. TABLE: site_settings
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` VARCHAR(36) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_site_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 29. TABLE: audit_logs (Captures all security, authentication & administrative events)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(100) NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(64) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_entity` (`entity_type`),
  KEY `idx_audit_logs_created` (`created_at`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================================================
-- INITIAL SEED DATA
-- Default Passwords:
-- Admin:   AdminDeutschWelt2026!
-- Teacher: TeacherDeutschWelt2026!
-- Student: StudentDeutschWelt2026!
-- ==============================================================================

-- 1. Insert Core Users with Telemetry (IP, Phone, Address, User Agent)
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `role`, `is_active`, `is_email_verified`, `avatar_url`, `registration_ip`, `last_login_ip`, `user_agent`) VALUES
('usr-admin-1', 'admin@deutschwelt.de', '$2b$10$eal3FZr.iiTSasiR/lh2JeLprQYZp1aOpOoQ9dVyp4U30sZT1Tnpa', 'Dr. Marcus', 'Vogel', '+49 30 98765432', 'Unter den Linden 42, 10117 Berlin, Germany', 'ADMIN', 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', '127.0.0.1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'),
('usr-teacher-1', 'teacher@deutschwelt.de', '$2b$10$IY9eWUOeTwF5nnid6ahtleLJm33dOs8ImUqjsOzzKbacoTCMmiOQK', 'Frau Anja', 'Schneider', '+49 151 98765432', 'Kurfürstendamm 102, 10711 Berlin, Germany', 'TEACHER', 1, 1, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', '127.0.0.1', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15'),
('usr-teacher-2', 'teacher2@deutschwelt.de', '$2b$10$IY9eWUOeTwF5nnid6ahtleLJm33dOs8ImUqjsOzzKbacoTCMmiOQK', 'Herr Stefan', 'Müller', '+49 160 5551234', 'Leopoldstraße 28, 80802 München, Germany', 'TEACHER', 1, 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', '127.0.0.1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0'),
('usr-student-1', 'student@deutschwelt.de', '$2b$10$.RYGsDh9NcSGh8WGF3/h4unTmhtCV6X70OhUhNqkgVofIzNAt5BhO', 'Elena', 'Rostova', '+49 176 1234567', 'Alexanderplatz 7, 10178 Berlin, Germany', 'STUDENT', 1, 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250', '127.0.0.1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0'),
('usr-student-2', 'student2@deutschwelt.de', '$2b$10$.RYGsDh9NcSGh8WGF3/h4unTmhtCV6X70OhUhNqkgVofIzNAt5BhO', 'Arjun', 'Patel', '+91 9820012345', 'MG Road 14, 400001 Mumbai, India', 'STUDENT', 1, 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', '127.0.0.1', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 14) Mobile Safari/537.36');

-- 2. Insert Student Profiles
INSERT INTO `student_profiles` (`id`, `user_id`, `current_level`, `learning_goal`, `preferred_language`, `daily_goal_minutes`, `streak_count`) VALUES
('prof-student-1', 'usr-student-1', 'A1', 'Pass Goethe-Zertifikat A1 for Master Degree admission in Munich', 'en', 30, 7),
('prof-student-2', 'usr-student-2', 'A2', 'Prepare for Blue Card visa and German workplace communication', 'en', 25, 4);

-- 3. Insert Teacher Profiles
INSERT INTO `teacher_profiles` (`id`, `user_id`, `bio`, `qualifications`, `specialization`, `max_batches`) VALUES
('prof-teacher-1', 'usr-teacher-1', 'Senior Germanist with 12+ years preparing students for Goethe and telc exams. Specializes in grammar structures and speaking fluency.', 'MA Germanistik (Humboldt Universität zu Berlin), Goethe Examiner License', 'A1–B1 Fast-Track, Phonetics, Case Mastery', 5),
('prof-teacher-2', 'usr-teacher-2', 'DaF specialist with a focus on intermediate and advanced conversation, medical German, and TestDaF preparation.', 'State Exam in Modern Languages (LMU Munich)', 'B1–B2 Grammar, Konjunktiv II, Business German', 5);

-- 4. Insert Teacher Batches
INSERT INTO `teacher_batches` (`id`, `name`, `level`, `description`, `start_date`, `end_date`, `max_students`, `is_active`) VALUES
('batch-a1-berlin', 'A1 Berlin Intensiv — Cohort Alpha', 'A1', 'Rigorous daily evening cohort covering A1 Nominative and Accusative grammar.', '2026-03-01 18:00:00', '2026-05-15 19:30:00', 25, 1),
('batch-a2-munich', 'A2 München Dialoge — Cohort Beta', 'A2', 'Focus on two-way prepositions, Perfekt tense, and everyday German living situations.', '2026-03-15 17:00:00', '2026-06-01 18:30:00', 20, 1),
('batch-b1-mastery', 'B1 Goethe Zertifikat Vorbereitung', 'B1', 'Comprehensive intermediate preparation for the 4-module Goethe-Zertifikat B1 exam.', '2026-04-01 19:00:00', '2026-07-01 20:30:00', 18, 1);

-- 5. Link Teachers to Batches (Multi-Teacher Isolation)
INSERT INTO `teacher_batch_assignments` (`id`, `batch_id`, `teacher_id`, `is_primary`) VALUES
('tba-1', 'batch-a1-berlin', 'prof-teacher-1', 1),
('tba-2', 'batch-a2-munich', 'prof-teacher-2', 1),
('tba-3', 'batch-b1-mastery', 'prof-teacher-1', 1);

-- 6. Link Students to Batches
INSERT INTO `batch_memberships` (`id`, `batch_id`, `user_id`, `status`) VALUES
('bm-1', 'batch-a1-berlin', 'usr-student-1', 'ACTIVE'),
('bm-2', 'batch-a2-munich', 'usr-student-2', 'ACTIVE');

-- 7. Insert Teacher Lectures (Video & Live Classes uploaded by teachers)
INSERT INTO `teacher_lectures` (`id`, `teacher_id`, `batch_id`, `title`, `description`, `level`, `video_url`, `duration_minutes`, `scheduled_for`, `is_live`, `meeting_url`, `status`) VALUES
('lec-1', 'prof-teacher-1', 'batch-a1-berlin', 'Lecture 1: The Secret of German Gender & Articles (der, die, das)', 'Detailed breakdown of noun gender rules, endings, and phonetic clues with Frau Schneider.', 'A1', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 45, '2026-03-05 18:00:00', 0, NULL, 'PUBLISHED'),
('lec-2', 'prof-teacher-1', 'batch-a1-berlin', 'Live Session: Q&A and Nominative vs. Accusative Drills', 'Interactive speaking clinic for Cohort Alpha to practice ordering in a cafe.', 'A1', NULL, 60, '2026-03-12 18:30:00', 1, 'https://meet.jit.si/DeutschWelt-A1-Alpha', 'PUBLISHED'),
('lec-3', 'prof-teacher-2', 'batch-a2-munich', 'Lecture 1: Mastering Wechselpräpositionen (Two-Way Prepositions)', 'Comprehensive visual guide to Dative vs Accusative positional verbs (liegen/legen, stehen/stellen).', 'A2', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 50, '2026-03-20 17:00:00', 0, NULL, 'PUBLISHED');

-- 8. Insert Teacher Study Materials (Worksheets & PDF Files uploaded by teachers)
INSERT INTO `teacher_materials` (`id`, `teacher_id`, `batch_id`, `title`, `category`, `description`, `file_url`, `file_type`, `file_size`, `level`) VALUES
('mat-1', 'prof-teacher-1', 'batch-a1-berlin', 'A1 Core Vocabulary & Grammar Cheat Sheet', 'CHEAT_SHEET', 'Essential summary of definite/indefinite articles, negation with kein vs. nicht, and pronouns.', '/uploads/materials/a1_grammar_cheatsheet.pdf', 'PDF', '1.8 MB', 'A1'),
('mat-2', 'prof-teacher-1', 'batch-a1-berlin', 'Nominative & Accusative Practice Worksheet', 'WORKSHEET', '30 fill-in-the-blank sentences and translation exercises with full answer key.', '/uploads/materials/a1_cases_worksheet.pdf', 'PDF', '2.4 MB', 'A1'),
('mat-3', 'prof-teacher-2', 'batch-a2-munich', 'A2 Prepositions & Dative Motion Chart', 'HANDOUT', 'Visual mind-map of an/auf/hinter/in/neben/über/unter/vor/zwischen with 3D room schematics.', '/uploads/materials/a2_prepositions_chart.pdf', 'PDF', '3.1 MB', 'A2');

-- 9. Insert Courses (A1, A2, B1, B2)
INSERT INTO `courses` (`id`, `slug`, `title`, `description`, `level`, `learning_objectives`, `estimated_hours`, `thumbnail_url`, `status`, `order_index`) VALUES
('crs-a1', 'deutsch-a1-beginner-intensiv', 'Deutsch A1: Beginner Intensiv', 'Complete beginner curriculum covering phonetics, daily greetings, Nominative and Accusative cases, and cafe dialogues.', 'A1', '["Master German alphabet and phonetic pronunciation", "Hold conversations introducing yourself and your profession", "Accurately apply Nominative and Accusative case articles", "Pass the official Goethe-Zertifikat A1 exam"]', 60, 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&q=80&w=600', 'PUBLISHED', 1),
('crs-a2', 'deutsch-a2-elementary-dialoge', 'Deutsch A2: Elementary Dialoge', 'Conversational mastery with the Dative case, two-way prepositions (Wechselpräpositionen), and the Perfekt past tense.', 'A2', '["Express past events using the Perfekt tense and auxiliary verbs", "Navigate directions, transport, and public authorities in Germany", "Command all Dative prepositions and pronoun declensions", "Ace the Goethe-Zertifikat A2 / telc A2 examinations"]', 75, 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600', 'PUBLISHED', 2),
('crs-b1', 'deutsch-b1-intermediate-mastery', 'Deutsch B1: Intermediate Mastery', 'Official German citizenship and permanent residence level. Konjunktiv II, passive voice, and complex subordinate clauses.', 'B1', '["Express polite hypothetical wishes and recommendations using Konjunktiv II", "Construct passive voice sentences for official correspondence", "Confidently debate contemporary cultural and professional themes", "Attain Goethe-Zertifikat B1 or DTZ certificate for Einbürgerung"]', 90, 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600', 'PUBLISHED', 3),
('crs-b2', 'deutsch-b2-professional-fluency', 'Deutsch B2: Professional & Academic Fluency', 'Advanced fluency for German universities, clinical medical licensing, and corporate engineering roles.', 'B2', '["Understand complex technical, scientific, and academic lectures", "Synthesize arguments and draft formal business correspondence in Nominalstil", "Produce fluent, natural idiomatic expressions with native prosody", "Achieve TestDaF 4x4 or Goethe-Zertifikat B2 clearance"]', 120, 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=600', 'PUBLISHED', 4);

-- 10. Insert Course Units & Lessons
INSERT INTO `course_units` (`id`, `course_id`, `title`, `description`, `order_index`) VALUES
('unit-a1-1', 'crs-a1', 'Einheit 1: Erste Schritte (First Steps & Introductions)', 'Phonetics, greetings, countries, and regular present-tense verb conjugation.', 1),
('unit-a1-2', 'crs-a1', 'Einheit 2: Im Café & Einkaufen (Ordering & Shopping)', 'Nouns, grammatical genders (der, die, das), and the Accusative case.', 2);

INSERT INTO `lessons` (`id`, `unit_id`, `title`, `description`, `duration_minutes`, `order_index`, `status`) VALUES
('les-a1-1-1', 'unit-a1-1', 'Guten Tag! Begrüßung & Alphabet', 'Learn German greetings and pronounce vowels, umlauts (ä, ö, ü), and diphthongs.', 15, 1, 'PUBLISHED'),
('les-a1-1-2', 'unit-a1-1', 'Wer bist du? Personalpronomen & sein', 'Master personal pronouns (ich, du, er, sie, es, wir, ihr, sie, Sie) and the irregular verb sein.', 20, 2, 'PUBLISHED'),
('les-a1-2-1', 'unit-a1-2', 'Einen Kaffee, bitte! Der Akkusativ', 'Understanding direct objects and how masculine der changes to den in the Accusative case.', 25, 1, 'PUBLISHED');

-- 11. Insert Vocabulary Words with CEFR levels and IPA
INSERT INTO `vocabulary_words` (`id`, `category_id`, `german`, `english`, `hindi`, `article`, `plural`, `part_of_speech`, `level`, `category`, `example_sentence_de`, `example_sentence_en`, `example_sentence_hi`, `ipa`, `tags`, `difficulty`, `status`) VALUES
('voc-1', NULL, 'Kaffee', 'Coffee', 'कॉफ़ी', 'DER', 'die Kaffees', 'NOUN', 'A1', 'Food & Drink', 'Ich trinke morgens gerne einen heißen Kaffee.', 'I like drinking hot coffee in the morning.', 'मुझे सुबह गर्म कॉफ़ी पीना पसंद है।', '/ˈkafe/', '["beverage", "daily", "cafe"]', 1, 'PUBLISHED'),
('voc-2', NULL, 'Wasser', 'Water', 'पानी', 'DAS', 'die Wässer', 'NOUN', 'A1', 'Food & Drink', 'Ein Glas stilles Wasser, bitte!', 'A glass of still water, please!', 'कृपया एक गिलास सादा पानी दीजिए!', '/ˈvasɐ/', '["beverage", "essential"]', 1, 'PUBLISHED'),
('voc-3', NULL, 'Wohnung', 'Apartment', 'अपार्टमेंट', 'DIE', 'die Wohnungen', 'NOUN', 'A2', 'Housing', 'Unsere neue Wohnung hat einen sonnigen Balkon.', 'Our new apartment has a sunny balcony.', 'हमारे नए अपार्टमेंट में एक धूप वाली बालकनी है।', '/ˈvoːnʊŋ/', '["home", "city"]', 2, 'PUBLISHED'),
('voc-4', NULL, 'Erfolg', 'Success', 'सफलता', 'DER', 'die Erfolge', 'NOUN', 'B1', 'Work & Career', 'Fleiß und Disziplin führen zum Erfolg.', 'Diligence and discipline lead to success.', 'मेहनत और अनुशासन सफलता की ओर ले जाते हैं।', '/ɛɐ̯ˈfɔlk/', '["career", "abstract"]', 3, 'PUBLISHED'),
('voc-5', NULL, 'Voraussetzung', 'Prerequisite', 'पूर्वशर्त', 'DIE', 'die Voraussetzungen', 'NOUN', 'B2', 'Academic & Career', 'Gute Deutschkenntnisse sind eine Voraussetzung für die Stelle.', 'Good German skills are a prerequisite for the job position.', 'अच्छी जर्मन भाषा का ज्ञान इस नौकरी के लिए एक पूर्वशर्त है।', '/ˈfoːɐ̯ʔaʊ̯szɛtsʊŋ/', '["advanced", "formal"]', 4, 'PUBLISHED');

-- 12. Insert Exercises & Questions
INSERT INTO `exercises` (`id`, `lesson_id`, `title`, `description`, `level`, `type`, `passing_score`, `order_index`, `status`) VALUES
('ex-a1-akk', 'les-a1-2-1', 'Akkusativ Artikel Quiz', 'Test your understanding of masculine, feminine, and neuter articles in the Accusative case.', 'A1', 'MULTIPLE_CHOICE', 70.0, 1, 'PUBLISHED');

INSERT INTO `exercise_questions` (`id`, `exercise_id`, `type`, `prompt`, `instructions`, `hint`, `explanation`, `points`, `order_index`, `correct_answer`) VALUES
('q-1', 'ex-a1-akk', 'MULTIPLE_CHOICE', 'Ich bestelle _____ (der) Kaffee.', 'Select the correct article for the masculine noun in the Accusative case.', 'Remember: only masculine articles change in the Accusative (der -> den).', 'Kaffee is masculine (der Kaffee). In the direct object position, der becomes den.', 1, 1, '{"correctOptionId": "opt-1-1"}'),
('q-2', 'ex-a1-akk', 'MULTIPLE_CHOICE', 'Wir trinken _____ (das) Wasser.', 'Select the correct neuter article in the Accusative case.', 'Neuter articles remain unchanged in the Accusative case.', 'Das Wasser remains das in the Accusative case.', 1, 2, '{"correctOptionId": "opt-2-1"}');

INSERT INTO `exercise_options` (`id`, `question_id`, `label`, `is_correct`, `order_index`) VALUES
('opt-1-1', 'q-1', 'den', 1, 1),
('opt-1-2', 'q-1', 'dem', 0, 2),
('opt-1-3', 'q-1', 'der', 0, 3),
('opt-2-1', 'q-2', 'das', 1, 1),
('opt-2-2', 'q-2', 'dem', 0, 2),
('opt-2-3', 'q-2', 'den', 0, 3);

-- 13. Insert Speaking Prompt
INSERT INTO `speaking_prompts` (`id`, `title`, `topic`, `level`, `scenario`, `instructions`, `sample_answer_de`, `sample_answer_en`, `min_duration_seconds`, `max_duration_seconds`, `status`) VALUES
('spk-1', 'Im Café bestellen', 'Food & Ordering', 'A1', 'You are at a cafe in Berlin. Order a coffee and a slice of cake, and ask for the bill.', 'State your greeting, place your order politely with "Ich möchte...", and ask "Was kostet das?"', 'Hallo! Ich möchte bitte einen Kaffee mit Milch und ein Stück Apfelkuchen. Zahlen, bitte!', 'Hello! I would like a coffee with milk and a piece of apple cake, please. The bill, please!', 15, 60, 'PUBLISHED');

-- 14. Insert Assignments
INSERT INTO `assignments` (`id`, `course_id`, `batch_id`, `teacher_id`, `title`, `description`, `level`, `due_date`, `max_points`, `instructions`, `rubric_criteria`, `status`) VALUES
('asg-1', 'crs-a1', 'batch-a1-berlin', 'prof-teacher-1', 'Sich Vorstellen: Written Introduction Essay', 'Write a short self-introduction paragraph (50–80 words) in German.', 'A1', '2026-04-15 23:59:59', 100, 'Include your name, country of origin, residence, age, hobbies, and why you are learning German.', '[{"name": "Grammar & Conjugation", "maxPoints": 40}, {"name": "Vocabulary Variety", "maxPoints": 30}, {"name": "Word Order & Coherence", "maxPoints": 30}]', 'PUBLISHED');

-- 15. Insert Site Settings
INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `description`) VALUES
('set-1', 'site_name', 'DeutschWelt', 'Platform Brand Name'),
('set-2', 'tagline', 'Your journey to German fluency.', 'Official Tagline'),
('set-3', 'contact_email', 'kontakt@deutschwelt.de', 'Admissions and Support Email'),
('set-4', 'support_phone', '+49 30 12345678', 'Berlin Academy Telephone Number'),
('set-5', 'content_gating_enabled', 'true', 'Require account registration to access courses and syllabus materials');

-- 16. Insert Sample Audit Logs
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
('aud-1', 'usr-admin-1', 'SYSTEM_INITIALIZE', 'SYSTEM', 'system', '{"event": "Database schema created and initial seed executed successfully."}', '127.0.0.1', 'System Provisioner', '2026-03-01 10:00:00'),
('aud-2', 'usr-teacher-1', 'TEACHER_BATCH_ASSIGN', 'TEACHER_BATCH', 'batch-a1-berlin', '{"teacherId": "prof-teacher-1", "batchId": "batch-a1-berlin", "isPrimary": true}', '127.0.0.1', 'Mozilla/5.0 Admin Console', '2026-03-01 10:05:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- End of DeutschWelt MySQL Export
-- ==============================================================================
