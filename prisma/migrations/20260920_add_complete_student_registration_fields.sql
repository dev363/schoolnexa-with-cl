-- ============================================================================
-- SCHOOLNEXA ENTERPRISE ARCHITECTURE
-- STUDENT MODEL ENHANCEMENTS FOR COMPLETE REGISTRATION (MySQL 8.0+)
-- ============================================================================
-- Purpose:
-- Adds complete student registration fields, academic history, identity tracking,
-- and school-tenant scoped registrationId without breaking existing admissionNumber,
-- active_admission_number generated columns, or school-tenant isolation.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Add complete Student demographic, contact, academic, and registration fields
ALTER TABLE `students`
  ADD COLUMN IF NOT EXISTS `registration_id` VARCHAR(64) NULL AFTER `admission_number`,
  ADD COLUMN IF NOT EXISTS `middle_name` VARCHAR(100) NULL AFTER `first_name`,
  ADD COLUMN IF NOT EXISTS `photo_url` VARCHAR(500) NULL AFTER `last_name`,
  ADD COLUMN IF NOT EXISTS `special_category` VARCHAR(100) NULL AFTER `blood_group`,
  ADD COLUMN IF NOT EXISTS `special_category_details` TEXT NULL AFTER `special_category`,
  ADD COLUMN IF NOT EXISTS `nationality` VARCHAR(50) NULL DEFAULT 'Indian' AFTER `special_category_details`,
  ADD COLUMN IF NOT EXISTS `religion` VARCHAR(50) NULL AFTER `nationality`,
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(50) NULL AFTER `religion`,
  ADD COLUMN IF NOT EXISTS `mother_tongue` VARCHAR(50) NULL AFTER `category`,
  ADD COLUMN IF NOT EXISTS `place_of_birth` VARCHAR(100) NULL AFTER `mother_tongue`,
  ADD COLUMN IF NOT EXISTS `government_id` VARCHAR(100) NULL AFTER `place_of_birth`,
  ADD COLUMN IF NOT EXISTS `mobile` VARCHAR(30) NULL AFTER `government_id`,
  ADD COLUMN IF NOT EXISTS `alternate_mobile` VARCHAR(30) NULL AFTER `mobile`,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(191) NULL AFTER `alternate_mobile`,
  ADD COLUMN IF NOT EXISTS `address_line1` VARCHAR(255) NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `address_line2` VARCHAR(255) NULL AFTER `address_line1`,
  ADD COLUMN IF NOT EXISTS `country` VARCHAR(100) NULL DEFAULT 'India' AFTER `state`,
  ADD COLUMN IF NOT EXISTS `previous_school` VARCHAR(200) NULL AFTER `postal_code`,
  ADD COLUMN IF NOT EXISTS `previous_class` VARCHAR(50) NULL AFTER `previous_school`,
  ADD COLUMN IF NOT EXISTS `previous_school_board` VARCHAR(100) NULL AFTER `previous_class`,
  ADD COLUMN IF NOT EXISTS `transfer_certificate_number` VARCHAR(100) NULL AFTER `previous_school_board`,
  ADD COLUMN IF NOT EXISTS `transfer_certificate_date` DATE NULL AFTER `transfer_certificate_number`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT NULL AFTER `transfer_certificate_date`,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' AFTER `notes`;

-- 2. Add School-Scoped Unique Index for Registration ID (allowing multiple NULLs for backward compatibility)
-- Safe addition of index if not already present
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'students' 
               AND index_name = 'uq_students_registration_id');
SET @sqlstmt := IF(@exist = 0, 'CREATE UNIQUE INDEX `uq_students_registration_id` ON `students`(`school_id`, `registration_id`)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
