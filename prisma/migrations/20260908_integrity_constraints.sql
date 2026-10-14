-- ============================================================================
-- SCHOOLNEXA ENTERPRISE ARCHITECTURE v3.3.1
-- ADVANCED INTEGRITY CONSTRAINTS, GENERATED COLUMNS & TRIGGERS (MySQL 8.0+)
-- ============================================================================
-- Purpose:
-- This SQL migration script establishes advanced data integrity rules,
-- conditional uniqueness constraints via STORED generated columns, and
-- procedural audit / financial immutability triggers that cannot be natively
-- expressed within standard Prisma schema syntax.
--
-- Target Database: MySQL 8.0+ / InnoDB
-- Multi-Tenancy: Shared Database, Shared Schema with Tenant Scoping
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- PART 1: DETERMINISTIC STORED GENERATED COLUMNS & CONDITIONAL UNIQUE KEYS
-- ============================================================================
-- MySQL 8.0 does not support standard PostgreSQL-style partial unique indexes
-- (e.g. CREATE UNIQUE INDEX ... WHERE condition). Instead, MySQL requires
-- deterministic STORED generated virtual columns that evaluate to NULL when
-- inactive, paired with a composite UNIQUE KEY (since NULL values do not collide).

-- ----------------------------------------------------------------------------
-- 1.1 Students: Active Admission Number (Re-usable upon soft-delete)
-- ----------------------------------------------------------------------------
-- Ensures admission numbers are unique per school among active students.
-- If deleted_at is set, active_admission_number evaluates to NULL.
ALTER TABLE `students`
  DROP INDEX `uq_students_active_admission`,
  DROP COLUMN `active_admission_number`;

ALTER TABLE `students`
  ADD COLUMN `active_admission_number` VARCHAR(64)
  GENERATED ALWAYS AS (IF(`deleted_at` IS NULL, `admission_number`, NULL)) STORED;

ALTER TABLE `students`
  ADD CONSTRAINT `uq_students_active_admission`
  UNIQUE (`school_id`, `active_admission_number`);


-- ----------------------------------------------------------------------------
-- 1.2 Staff: Active Employee Code (Re-usable upon soft-delete / offboarding)
-- ----------------------------------------------------------------------------
-- Ensures employee codes are unique per school among active staff members.
ALTER TABLE `staff`
  DROP INDEX `uq_staff_active_code`,
  DROP COLUMN `active_employee_code`;

ALTER TABLE `staff`
  ADD COLUMN `active_employee_code` VARCHAR(64)
  GENERATED ALWAYS AS (IF(`deleted_at` IS NULL, `employee_code`, NULL)) STORED;

ALTER TABLE `staff`
  ADD CONSTRAINT `uq_staff_active_code`
  UNIQUE (`school_id`, `active_employee_code`);


-- ----------------------------------------------------------------------------
-- 1.3 Teacher Assignments: Single Active Class Teacher per Section
-- ----------------------------------------------------------------------------
-- Prevents assigning more than one active class teacher to a section.
ALTER TABLE `teacher_assignments`
  DROP INDEX `uq_ta_active_class_teacher`,
  DROP COLUMN `class_teacher_unique_key`;

ALTER TABLE `teacher_assignments`
  ADD COLUMN `class_teacher_unique_key` VARCHAR(36)
  GENERATED ALWAYS AS (IF(`is_class_teacher` = 1 AND `is_active` = 1, `academic_year_section_id`, NULL)) STORED;

ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `uq_ta_active_class_teacher`
  UNIQUE (`school_id`, `class_teacher_unique_key`);


-- ----------------------------------------------------------------------------
-- 1.4 Library: Single Active Book Loan per Copy
-- ----------------------------------------------------------------------------
-- Guarantees a physical copy of a book cannot be issued to another member
-- until its previous issue is returned (i.e. returned_at IS NOT NULL).
ALTER TABLE `book_issues`
  DROP INDEX `uq_library_active_loan`,
  DROP COLUMN `active_copy_key`;

ALTER TABLE `book_issues`
  ADD COLUMN `active_copy_key` VARCHAR(36)
  GENERATED ALWAYS AS (IF(`returned_at` IS NULL, `book_copy_id`, NULL)) STORED;

ALTER TABLE `book_issues`
  ADD CONSTRAINT `uq_library_active_loan`
  UNIQUE (`school_id`, `active_copy_key`);


-- ----------------------------------------------------------------------------
-- 1.5 Hostel: Single Active Bed Allocation (Double-Booking Prevention)
-- ----------------------------------------------------------------------------
-- Prevents more than one active occupant from occupying the exact same hostel bed.
ALTER TABLE `hostel_allocations`
  DROP INDEX `uq_hostel_active_bed`,
  DROP COLUMN `active_bed_key`;

ALTER TABLE `hostel_allocations`
  ADD COLUMN `active_bed_key` VARCHAR(36)
  GENERATED ALWAYS AS (IF(`status` = 'ACTIVE', `bed_id`, NULL)) STORED;

ALTER TABLE `hostel_allocations`
  ADD CONSTRAINT `uq_hostel_active_bed`
  UNIQUE (`school_id`, `active_bed_key`);


-- ----------------------------------------------------------------------------
-- 1.6 Hostel: Single Active Bed per Student (Prevent Multiple Bed Hoarding)
-- ----------------------------------------------------------------------------
-- Prevents a student enrollment from having multiple active hostel beds simultaneously.
ALTER TABLE `hostel_allocations`
  DROP INDEX `uq_hostel_active_occupant`,
  DROP COLUMN `active_enrollment_key`;

ALTER TABLE `hostel_allocations`
  ADD COLUMN `active_enrollment_key` VARCHAR(36)
  GENERATED ALWAYS AS (IF(`status` = 'ACTIVE', `enrollment_id`, NULL)) STORED;

ALTER TABLE `hostel_allocations`
  ADD CONSTRAINT `uq_hostel_active_occupant`
  UNIQUE (`school_id`, `active_enrollment_key`);


-- ============================================================================
-- PART 2: PROCEDURAL DATA INTEGRITY TRIGGERS
-- ============================================================================
-- These triggers enforce complex business constraints across multiple tables,
-- including cross-tenant leak prevention, date/temporal order verification,
-- immutability of financial ledgers, and capacity exhaustion protection.

DELIMITER $$

-- ----------------------------------------------------------------------------
-- 2.1 Section Capacity Protection Trigger
-- ----------------------------------------------------------------------------
-- Guarantees an academic year section does not exceed max_capacity upon enrollment.
DROP TRIGGER IF EXISTS `trg_enrollments_before_insert_capacity`$$
CREATE TRIGGER `trg_enrollments_before_insert_capacity`
BEFORE INSERT ON `enrollments`
FOR EACH ROW
BEGIN
  DECLARE current_enrolled INT DEFAULT 0;
  DECLARE section_capacity INT DEFAULT 40;

  SELECT `max_capacity`, `current_count` 
    INTO section_capacity, current_enrolled
    FROM `academic_year_sections`
   WHERE `school_id` = NEW.school_id 
     AND `id` = NEW.academic_year_section_id;

  IF current_enrolled >= section_capacity THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Integrity Error: Target academic section has reached its maximum student capacity.';
  END IF;
END$$

DROP TRIGGER IF EXISTS `trg_enrollments_after_insert_increment_count`$$
CREATE TRIGGER `trg_enrollments_after_insert_increment_count`
AFTER INSERT ON `enrollments`
FOR EACH ROW
BEGIN
  IF NEW.status = 'ACTIVE' THEN
    UPDATE `academic_year_sections`
       SET `current_count` = `current_count` + 1
     WHERE `school_id` = NEW.school_id
       AND `id` = NEW.academic_year_section_id;
  END IF;
END$$

DROP TRIGGER IF EXISTS `trg_enrollments_after_update_recount`$$
CREATE TRIGGER `trg_enrollments_after_update_recount`
AFTER UPDATE ON `enrollments`
FOR EACH ROW
BEGIN
  IF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
    UPDATE `academic_year_sections`
       SET `current_count` = GREATEST(0, `current_count` - 1)
     WHERE `school_id` = NEW.school_id
       AND `id` = NEW.academic_year_section_id;
  ELSEIF OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
    UPDATE `academic_year_sections`
       SET `current_count` = `current_count` + 1
     WHERE `school_id` = NEW.school_id
       AND `id` = NEW.academic_year_section_id;
  END IF;
END$$


-- ----------------------------------------------------------------------------
-- 2.2 Financial Subledger Immutability Triggers (`fee_ledger_entries`)
-- ----------------------------------------------------------------------------
-- SchoolNexa financial ledger entries are strictly append-only.
-- Updates and deletes are prohibited to maintain strict compliance with GAAP/IFRS.
DROP TRIGGER IF EXISTS `trg_fee_ledger_no_update`$$
CREATE TRIGGER `trg_fee_ledger_no_update`
BEFORE UPDATE ON `fee_ledger_entries`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Financial ledger entries are immutable and cannot be updated.';
END$$

DROP TRIGGER IF EXISTS `trg_fee_ledger_no_delete`$$
CREATE TRIGGER `trg_fee_ledger_no_delete`
BEFORE DELETE ON `fee_ledger_entries`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Financial ledger entries are immutable and cannot be deleted.';
END$$

-- Enforce monotonic sequence numbers on insert
DROP TRIGGER IF EXISTS `trg_fee_ledger_monotonic_sequence`$$
CREATE TRIGGER `trg_fee_ledger_monotonic_sequence`
BEFORE INSERT ON `fee_ledger_entries`
FOR EACH ROW
BEGIN
  DECLARE max_seq INT DEFAULT 0;

  SELECT COALESCE(MAX(`sequence_number`), 0) INTO max_seq
    FROM `fee_ledger_entries`
   WHERE `school_id` = NEW.school_id
     AND `student_fee_id` = NEW.student_fee_id;

  IF NEW.sequence_number != (max_seq + 1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Integrity Error: Fee ledger sequence number must increment monotonically by 1.';
  END IF;
END$$


-- ----------------------------------------------------------------------------
-- 2.3 Report Card Snapshot Immutability Triggers (`report_card_snapshots`)
-- ----------------------------------------------------------------------------
-- Published academic transcripts with sha256 hashes must never be tampered with.
DROP TRIGGER IF EXISTS `trg_report_card_snapshot_no_update`$$
CREATE TRIGGER `trg_report_card_snapshot_no_update`
BEFORE UPDATE ON `report_card_snapshots`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Published report card snapshots are legally sealed and immutable.';
END$$

DROP TRIGGER IF EXISTS `trg_report_card_snapshot_no_delete`$$
CREATE TRIGGER `trg_report_card_snapshot_no_delete`
BEFORE DELETE ON `report_card_snapshots`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Published report card snapshots cannot be deleted.';
END$$


-- ----------------------------------------------------------------------------
-- 2.4 Forensic Audit Log Immutability Triggers (`activity_logs`)
-- ----------------------------------------------------------------------------
-- Activity logs provide non-repudiation audit trails and must never be altered.
DROP TRIGGER IF EXISTS `trg_activity_logs_no_update`$$
CREATE TRIGGER `trg_activity_logs_no_update`
BEFORE UPDATE ON `activity_logs`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Forensic activity logs cannot be updated.';
END$$

DROP TRIGGER IF EXISTS `trg_activity_logs_no_delete`$$
CREATE TRIGGER `trg_activity_logs_no_delete`
BEFORE DELETE ON `activity_logs`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Security Violation: Forensic activity logs cannot be deleted.';
END$$


-- ----------------------------------------------------------------------------
-- 2.5 Library Book Circulation Integrity
-- ----------------------------------------------------------------------------
-- Adjusts available_copies in `books` table automatically upon issue and return,
-- and verifies available_copies > 0 before allowing an issue.
DROP TRIGGER IF EXISTS `trg_book_issues_before_insert`$$
CREATE TRIGGER `trg_book_issues_before_insert`
BEFORE INSERT ON `book_issues`
FOR EACH ROW
BEGIN
  DECLARE available_qty INT DEFAULT 0;
  DECLARE target_book_id VARCHAR(36);

  SELECT `book_id` INTO target_book_id
    FROM `book_copies`
   WHERE `school_id` = NEW.school_id AND `id` = NEW.book_copy_id;

  SELECT `available_copies` INTO available_qty
    FROM `books`
   WHERE `school_id` = NEW.school_id AND `id` = target_book_id;

  IF available_qty <= 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Inventory Error: All physical copies of this book are currently on loan.';
  END IF;

  -- Update book copy status to ISSUED
  UPDATE `book_copies`
     SET `status` = 'ISSUED'
   WHERE `school_id` = NEW.school_id AND `id` = NEW.book_copy_id;

  -- Decrement available copies
  UPDATE `books`
     SET `available_copies` = GREATEST(0, `available_copies` - 1)
   WHERE `school_id` = NEW.school_id AND `id` = target_book_id;
END$$

DROP TRIGGER IF EXISTS `trg_book_issues_after_return`$$
CREATE TRIGGER `trg_book_issues_after_return`
AFTER UPDATE ON `book_issues`
FOR EACH ROW
BEGIN
  DECLARE target_book_id VARCHAR(36);

  IF OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
    SELECT `book_id` INTO target_book_id
      FROM `book_copies`
     WHERE `school_id` = NEW.school_id AND `id` = NEW.book_copy_id;

    -- Update book copy status to AVAILABLE
    UPDATE `book_copies`
       SET `status` = 'AVAILABLE'
     WHERE `school_id` = NEW.school_id AND `id` = NEW.book_copy_id;

    -- Increment available copies
    UPDATE `books`
       SET `available_copies` = LEAST(`total_copies`, `available_copies` + 1)
     WHERE `school_id` = NEW.school_id AND `id` = target_book_id;
  END IF;
END$$


-- ----------------------------------------------------------------------------
-- 2.6 Examination Marks Boundary Enforcement
-- ----------------------------------------------------------------------------
-- Ensures marks_obtained does not exceed the maximum allowed marks for the subject.
DROP TRIGGER IF EXISTS `trg_exam_marks_before_save`$$
CREATE TRIGGER `trg_exam_marks_before_save`
BEFORE INSERT ON `exam_marks`
FOR EACH ROW
BEGIN
  DECLARE exam_max_marks DECIMAL(5,2);

  SELECT `max_marks` INTO exam_max_marks
    FROM `exam_subjects`
   WHERE `school_id` = NEW.school_id AND `id` = NEW.exam_subject_id;

  IF NEW.marks_obtained IS NOT NULL AND NEW.marks_obtained > exam_max_marks THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Validation Error: Marks obtained cannot exceed the maximum marks configured for the subject.';
  END IF;

  IF NEW.marks_obtained IS NOT NULL AND NEW.marks_obtained < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Validation Error: Marks obtained cannot be negative.';
  END IF;
END$$

DROP TRIGGER IF EXISTS `trg_exam_marks_before_update`$$
CREATE TRIGGER `trg_exam_marks_before_update`
BEFORE UPDATE ON `exam_marks`
FOR EACH ROW
BEGIN
  DECLARE exam_max_marks DECIMAL(5,2);

  SELECT `max_marks` INTO exam_max_marks
    FROM `exam_subjects`
   WHERE `school_id` = NEW.school_id AND `id` = NEW.exam_subject_id;

  IF NEW.marks_obtained IS NOT NULL AND NEW.marks_obtained > exam_max_marks THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Validation Error: Marks obtained cannot exceed the maximum marks configured for the subject.';
  END IF;

  IF NEW.marks_obtained IS NOT NULL AND NEW.marks_obtained < 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Validation Error: Marks obtained cannot be negative.';
  END IF;
END$$


-- ----------------------------------------------------------------------------
-- 2.7 Cross-Tenant Consistency Guard: Academic Section vs Student Enrollment
-- ----------------------------------------------------------------------------
-- Guarantees the student enrollment being referenced belongs to the exact same school
-- as the parent academic section and session.
DROP TRIGGER IF EXISTS `trg_attendance_records_tenant_guard`$$
CREATE TRIGGER `trg_attendance_records_tenant_guard`
BEFORE INSERT ON `attendance_records`
FOR EACH ROW
BEGIN
  DECLARE enrollment_school_id VARCHAR(36);

  SELECT `school_id` INTO enrollment_school_id
    FROM `enrollments`
   WHERE `id` = NEW.enrollment_id;

  IF enrollment_school_id IS NULL OR enrollment_school_id != NEW.school_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Security Violation: Cross-tenant enrollment reference detected in attendance record.';
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- VERIFICATION CONFIRMATION
-- ============================================================================
SELECT 'SchoolNexa v3.3.1 SQL Integrity Migration successfully prepared.' AS `Status`;
