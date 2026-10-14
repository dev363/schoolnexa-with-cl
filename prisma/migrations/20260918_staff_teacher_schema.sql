-- ============================================================================
-- SCHOOLNEXA ENTERPRISE ARCHITECTURE
-- STAFF MODEL ENHANCEMENTS FOR TEACHER MANAGEMENT (MySQL 8.0+)
-- ============================================================================
-- Purpose:
-- Supports Teacher profile fields, nullable department/designation, and details JSON
-- on the canonical Staff entity without breaking existing FAC-XXXX staff,
-- active_employee_code generated columns, or school-tenant isolation.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Modify department_id and designation_id to be nullable
ALTER TABLE `staff`
  MODIFY COLUMN `department_id` VARCHAR(36) NULL,
  MODIFY COLUMN `designation_id` VARCHAR(36) NULL;

-- 2. Add Teacher/Staff profile and portfolio fields
ALTER TABLE `staff`
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' AFTER `qualification`,
  ADD COLUMN IF NOT EXISTS `profile_photo` VARCHAR(500) NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `blood_group` VARCHAR(10) NULL AFTER `profile_photo`,
  ADD COLUMN IF NOT EXISTS `address` TEXT NULL AFTER `blood_group`,
  ADD COLUMN IF NOT EXISTS `city` VARCHAR(100) NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `state` VARCHAR(100) NULL AFTER `city`,
  ADD COLUMN IF NOT EXISTS `postal_code` VARCHAR(20) NULL AFTER `state`,
  ADD COLUMN IF NOT EXISTS `emergency_contact_name` VARCHAR(100) NULL AFTER `postal_code`,
  ADD COLUMN IF NOT EXISTS `emergency_contact_phone` VARCHAR(30) NULL AFTER `emergency_contact_name`,
  ADD COLUMN IF NOT EXISTS `details` JSON NULL AFTER `emergency_contact_phone`;
