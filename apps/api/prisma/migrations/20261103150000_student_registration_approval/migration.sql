-- Additive student registration approval fields.
-- Import only after the base DeutschWelt Prisma schema has been applied.
-- Existing profiles remain APPROVED for backward compatibility.

-- AlterTable
ALTER TABLE `User` ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `StudentProfile` ADD COLUMN `registrationRequestedAt` DATETIME(3) NULL,
    ADD COLUMN `registrationReviewNote` TEXT NULL,
    ADD COLUMN `registrationReviewedAt` DATETIME(3) NULL,
    ADD COLUMN `registrationReviewedById` VARCHAR(191) NULL,
    ADD COLUMN `registrationStatus` ENUM('ONBOARDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED';

