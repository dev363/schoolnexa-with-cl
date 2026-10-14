-- AlterTable
ALTER TABLE `students` ADD COLUMN `address_line1` VARCHAR(255) NULL,
    ADD COLUMN `address_line2` VARCHAR(255) NULL,
    ADD COLUMN `alternate_mobile` VARCHAR(30) NULL,
    ADD COLUMN `category` VARCHAR(50) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL DEFAULT 'India',
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `government_id` VARCHAR(100) NULL,
    ADD COLUMN `middle_name` VARCHAR(100) NULL,
    ADD COLUMN `mobile` VARCHAR(30) NULL,
    ADD COLUMN `mother_tongue` VARCHAR(50) NULL,
    ADD COLUMN `nationality` VARCHAR(50) NULL DEFAULT 'Indian',
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `photo_url` VARCHAR(500) NULL,
    ADD COLUMN `place_of_birth` VARCHAR(100) NULL,
    ADD COLUMN `previous_class` VARCHAR(50) NULL,
    ADD COLUMN `previous_school` VARCHAR(200) NULL,
    ADD COLUMN `previous_school_board` VARCHAR(100) NULL,
    ADD COLUMN `registration_id` VARCHAR(64) NULL,
    ADD COLUMN `religion` VARCHAR(50) NULL,
    ADD COLUMN `special_category` VARCHAR(100) NULL,
    ADD COLUMN `special_category_details` TEXT NULL,
    ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `transfer_certificate_date` DATE NULL,
    ADD COLUMN `transfer_certificate_number` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `uq_students_registration_id` ON `students`(`school_id`, `registration_id`);
