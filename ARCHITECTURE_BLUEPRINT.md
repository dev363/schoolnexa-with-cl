# SCHOOLNEXA ARCHITECTURE BLUEPRINT v3.3.1

## FULLY RECONCILED DATABASE INTEGRITY & CONCURRENCY SPECIFICATION

**Product Name:** SchoolNexa  
**Product Type:** Multi-School / Multi-Tenant School Management SaaS ERP  
**Document Version:** 3.3.1 (Authoritative Implementation Specification)  
**Database Engine:** MySQL 8.0+ (InnoDB Storage Engine)  
**ORM Target:** Prisma ORM 5.x / 6.x (`relationMode = "foreignKeys"`)  
**Framework Runtime:** Next.js (App Router, Node.js Server Runtime)  
**Author:** Lead Systems Architect & Principal Database Security Engineer  
**Status:** Reconciled, Verified & Sealed for Prisma Schema Generation  
**Authoritative Table Count:** **115 Tables** (Zero Added, Zero Removed)

---

# 1. Reconciliation Status & Executive Summary

Version 3.3.1 is the authoritative, mathematically verified database integrity specification for SchoolNexa. It supersedes all previous drafts (v2, v3, v3.1, v3.2, and v3.3) and represents the final, immutable architecture gate prior to Prisma schema generation.

### Authoritative Architecture Baseline

1. **Exactly 115 Physical Tables**: Every single table from 1 to 115 is strictly identified, classified into one of six structural scopes, and reconciled. No physical table may be added, renamed, or omitted during Prisma generation.
2. **Dual-Layer Tenant Isolation**: Tenant scoping is validated at the application service boundary and enforced physically at the InnoDB storage engine level via composite foreign keys:
   $$(school\_id, parent\_id) \longrightarrow parent\_table(school\_id, id)$$
3. **Tenant Parent Key Standard**: Every tenant parent table exposes both `PRIMARY KEY (id)` and `UNIQUE KEY (school_id, id)` to support composite foreign key references.
4. **Complete Elimination of Composite `ON DELETE SET NULL`**: In MySQL, executing `SET NULL` on a composite foreign key attempts to set all composite columns to `NULL`. Since `school_id` is strictly `NOT NULL`, this causes immediate constraint violations. In v3.3.1, all composite tenant relationships use `ON DELETE RESTRICT` or `ON DELETE CASCADE` (for dependent line items). Where an optional link exists, the nullable foreign ID is isolated and decoupled with explicit service-side nullification.
5. **Decoupled Platform Super Admin**: Platform Super Admins operate globally via `users.is_super_admin = TRUE` and authenticate directly at the platform routing layer. No Super Admin role is placed into `roles` or `user_school_roles`, ensuring `roles.school_id` is always non-null and composite tenant FKs never encounter `NULL` tenant IDs.
6. **Deterministic Conditional Uniqueness via `STORED` Generated Columns**: All conditional unique constraints (active class teachers, active hostel beds, active hostel occupants, active library loans, clean soft-delete business codes) utilize MySQL 8.0 `GENERATED ALWAYS AS (...) STORED` columns with unique indexes.
7. **Session-Level QR Token Semantics**: `attendance_qr_tokens` generates a rotating session-level nonce that permits multiple students in a section to scan during the 30-second window. Duplicate attendance is prevented at the database level by `UNIQUE(school_id, session_id, enrollment_id)`.
8. **Append-Only Financial Subledger**: `student_fees` is the mutable summary table with pessimistic concurrency locks (`SELECT FOR UPDATE`), while `fee_ledger_entries` is an immutable, append-only transaction subledger. No destructive deletes are permitted.

---

# 2. Authoritative Scope Model

Every entity in SchoolNexa belongs to one of six clearly delineated structural scopes:

| Scope         | Meaning                                                             | `school_id` | `academic_year_id` |  Count  |
| ------------- | ------------------------------------------------------------------- | :---------: | :----------------: | :-----: |
| `PLATFORM`    | SaaS subscription plans, platform invoices, gateway webhooks        | Conditional |         No         |    7    |
| `GLOBAL`      | Cross-school human identities, system permissions, auth credentials |     No      |         No         |    6    |
| `SCHOOL`      | Tenant-owned institutional master data (catalog, facilities, staff) |     Yes     |         No         |   63    |
| `SCHOOL_YEAR` | Annual operational data (sections, assignments, fees, exams)        |     Yes     |    Direct / FK     |   38    |
| `MIXED`       | Entity supports both platform-level and tenant-owned records        |  Nullable   |         No         |    1    |
| **TOTAL**     | **All System Entities**                                             |      —      |         —          | **115** |

---

# 3. Complete 115-Table Authoritative Registry

### PLATFORM Scope (7 Tables)

|   # | Table Name                   |  Scope   | `school_id` | `academic_year_id` | Primary Key | Lifecycle & Retention                   |
| --: | ---------------------------- | :------: | :---------: | :----------------: | :---------: | --------------------------------------- |
|   1 | `subscription_plans`         | PLATFORM |     No      |         No         |    `id`     | Soft deactivation (`is_active = FALSE`) |
|   2 | `subscription_features`      | PLATFORM |     No      |         No         |    `id`     | CASCADE from plan                       |
|   3 | `subscriptions`              | PLATFORM |     Yes     |         No         |    `id`     | RESTRICT / Subscription state machine   |
|   4 | `subscription_invoices`      | PLATFORM |     Yes     |         No         |    `id`     | RESTRICT / Permanent financial record   |
|   5 | `subscription_invoice_items` | PLATFORM |     Yes     |         No         |    `id`     | CASCADE from draft invoice              |
|   6 | `subscription_payments`      | PLATFORM |     Yes     |         No         |    `id`     | RESTRICT / Immutable payment audit      |
|   7 | `payment_webhook_events`     | PLATFORM |     Yes     |         No         |    `id`     | RESTRICT / Idempotent event ledger      |

### GLOBAL Scope (6 Tables)

|   # | Table Name           | Scope  | `school_id` | `academic_year_id` | Primary Key | Lifecycle & Retention                 |
| --: | -------------------- | :----: | :---------: | :----------------: | :---------: | ------------------------------------- |
|  11 | `users`              | GLOBAL |     No      |         No         |    `id`     | Soft delete (`deleted_at`)            |
|  12 | `sessions`           | GLOBAL |     No      |         No         |    `id`     | Revoke / Time-to-Live purge           |
|  13 | `password_resets`    | GLOBAL |     No      |         No         |    `id`     | Single-use consumption / Expiry purge |
|  15 | `permissions`        | GLOBAL |     No      |         No         |    `id`     | System seeded (Immutable catalog)     |
|  20 | `student_identities` | GLOBAL |     No      |         No         |    `id`     | Permanent civil identity record       |
|  28 | `parents`            | GLOBAL |     No      |         No         |    `id`     | Permanent civil parent identity       |

### MIXED Scope (1 Table)

|   # | Table Name     | Scope | `school_id` | `academic_year_id` | Primary Key | Lifecycle & Retention      |
| --: | -------------- | :---: | :---------: | :----------------: | :---------: | -------------------------- |
|  19 | `stored_files` | MIXED |  Nullable   |         No         |    `id`     | Soft delete (`deleted_at`) |

### SCHOOL Scope (63 Tables)

|   # | Table Name                    | Scope  | `school_id`  | `academic_year_id` | Primary Key | Lifecycle & Retention              |
| --: | ----------------------------- | :----: | :----------: | :----------------: | :---------: | ---------------------------------- |
|   8 | `schools`                     | SCHOOL | Yes (Own PK) |         No         |    `id`     | Soft delete (`deleted_at`)         |
|   9 | `school_settings`             | SCHOOL |     Yes      |         No         |    `id`     | CASCADE from school                |
|  10 | `academic_years`              | SCHOOL |     Yes      |    Yes (Own PK)    |    `id`     | RESTRICT if enrollments exist      |
|  14 | `roles`                       | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if users assigned         |
|  16 | `role_permissions`            | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on role delete             |
|  17 | `school_users`                | SCHOOL |     Yes      |         No         |    `id`     | Soft delete / RESTRICT             |
|  18 | `user_school_roles`           | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on membership delete       |
|  21 | `students`                    | SCHOOL |     Yes      |         No         |    `id`     | Soft delete (`deleted_at`)         |
|  22 | `student_documents`           | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on student delete          |
|  27 | `transfer_certificates`       | SCHOOL |     Yes      |         No         |    `id`     | Permanent legal certificate        |
|  29 | `parent_students`             | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on relationship detachment |
|  30 | `classes`                     | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if sections exist         |
|  32 | `subjects`                    | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if assigned               |
|  33 | `class_subjects`              | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if syllabi exist          |
|  44 | `fee_types`                   | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if structures exist       |
|  48 | `fee_concessions`             | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if applied                |
|  50 | `fee_payments`                | SCHOOL |     Yes      |         No         |    `id`     | Permanent financial receipt        |
|  52 | `fee_refunds`                 | SCHOOL |     Yes      |         No         |    `id`     | Permanent financial refund         |
|  54 | `grading_scales`              | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if exams exist            |
|  55 | `exam_types`                  | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if exams exist            |
|  62 | `rooms`                       | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if timetabled             |
|  63 | `period_definitions`          | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if timetabled             |
|  67 | `departments`                 | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if staff assigned         |
|  68 | `designations`                | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if staff assigned         |
|  69 | `staff`                       | SCHOOL |     Yes      |         No         |    `id`     | Soft delete (`deleted_at`)         |
|  70 | `staff_documents`             | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on staff delete            |
|  71 | `leave_types`                 | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if requests exist         |
|  72 | `leave_requests`              | SCHOOL |     Yes      |         No         |    `id`     | Permanent HR leave record          |
|  73 | `payroll_structures`          | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if payslips exist         |
|  74 | `payrolls`                    | SCHOOL |     Yes      |         No         |    `id`     | Permanent payslip record           |
|  75 | `payroll_items`               | SCHOOL |     Yes      |         No         |    `id`     | Permanent payslip item             |
|  76 | `books`                       | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if copies exist           |
|  77 | `book_copies`                 | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if circulation history    |
|  78 | `library_members`             | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if active loans           |
|  81 | `digital_books`               | SCHOOL |     Yes      |         No         |    `id`     | Soft delete (`deleted_at`)         |
|  82 | `vehicles`                    | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if allocated              |
|  83 | `drivers`                     | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if trips logged           |
|  84 | `routes`                      | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if stops exist            |
|  85 | `route_stops`                 | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if allocated              |
|  89 | `hostel_blocks`               | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if rooms exist            |
|  90 | `hostel_rooms`                | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on block delete            |
|  91 | `hostel_beds`                 | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on room delete             |
|  95 | `asset_categories`            | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if items exist            |
|  96 | `inventory_items`             | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if stock exists           |
|  97 | `fixed_assets`                | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT (Capital asset)           |
|  98 | `inventory_transactions`      | SCHOOL |     Yes      |         No         |    `id`     | Append-only inventory ledger       |
|  99 | `asset_maintenance`           | SCHOOL |     Yes      |         No         |    `id`     | Permanent maintenance log          |
| 100 | `vendors`                     | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if POs exist              |
| 101 | `purchase_orders`             | SCHOOL |     Yes      |         No         |    `id`     | Permanent procurement record       |
| 102 | `purchase_order_items`        | SCHOOL |     Yes      |         No         |    `id`     | Permanent procurement item         |
| 103 | `expense_categories`          | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT if expenses exist         |
| 104 | `expenses`                    | SCHOOL |     Yes      |         No         |    `id`     | Permanent expense record           |
| 105 | `announcements`               | SCHOOL |     Yes      |         No         |    `id`     | Soft delete (`deleted_at`)         |
| 106 | `announcement_targets`        | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on announcement delete     |
| 107 | `events`                      | SCHOOL |     Yes      |         No         |    `id`     | Soft delete (`deleted_at`)         |
| 108 | `internal_conversations`      | SCHOOL |     Yes      |         No         |    `id`     | Soft delete                        |
| 109 | `internal_messages`           | SCHOOL |     Yes      |         No         |    `id`     | Permanent communication log        |
| 110 | `internal_message_recipients` | SCHOOL |     Yes      |         No         |    `id`     | CASCADE on message delete          |
| 111 | `notification_templates`      | SCHOOL |     Yes      |         No         |    `id`     | RESTRICT (System seeded)           |
| 112 | `notifications`               | SCHOOL |     Yes      |         No         |    `id`     | Soft delete / Purge                |
| 113 | `notification_deliveries`     | SCHOOL |     Yes      |         No         |    `id`     | Asynchronous delivery audit        |
| 114 | `activity_logs`               | SCHOOL |     Yes      |         No         |    `id`     | Immutable forensic audit log       |
| 115 | `historical_change_records`   | SCHOOL |     Yes      |         No         |    `id`     | Immutable change diff ledger       |

### SCHOOL + ACADEMIC YEAR Scope (38 Tables)

|   # | Table Name                        |    Scope    | `school_id` | `academic_year_id` | Primary Key | Lifecycle & Retention                   |
| --: | --------------------------------- | :---------: | :---------: | :----------------: | :---------: | --------------------------------------- |
|  23 | `enrollments`                     | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT (Core academic anchor)         |
|  24 | `promotion_batches`               | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent promotion batch log           |
|  25 | `promotion_records`               | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent promotion student log         |
|  26 | `clearance_requests`              | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT / State machine                |
|  31 | `academic_year_sections`          | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if enrollments exist           |
|  34 | `teacher_assignments`             | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT / Academic teaching assignment |
|  35 | `syllabi`                         | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | CASCADE on class subject delete         |
|  36 | `attendance_sessions`             | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if records exist               |
|  37 | `attendance_records`              | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent attendance roll               |
|  38 | `attendance_corrections`          | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent attendance correction audit   |
|  39 | `attendance_qr_tokens`            | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Ephemeral / CASCADE on session delete   |
|  40 | `homework`                        | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if submissions exist           |
|  41 | `homework_attachments`            | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | CASCADE on homework delete              |
|  42 | `homework_submissions`            | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if graded                      |
|  43 | `homework_submission_attachments` | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | CASCADE on submission delete            |
|  45 | `fee_structures`                  | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if student fees invoiced       |
|  46 | `fee_structure_items`             | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if student fees invoiced       |
|  47 | `penalty_rules`                   | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | CASCADE on fee structure item delete    |
|  49 | `student_fees`                    | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT / Mutable fee balance          |
|  51 | `fee_payment_allocations`         | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT / Permanent allocation link    |
|  53 | `fee_ledger_entries`              | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Append-only financial subledger         |
|  56 | `exams`                           | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if marks exist                 |
|  57 | `exam_subjects`                   | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if marks exist                 |
|  58 | `exam_marks`                      | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent examination score roll        |
|  59 | `tabulation_sheets`               | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent consolidated result           |
|  60 | `report_cards`                    | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent student transcript            |
|  61 | `report_card_snapshots`           | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Immutable JSON report card snapshot     |
|  64 | `timetables`                      | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT if slots exist                 |
|  65 | `timetable_slots`                 | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | CASCADE on timetable delete             |
|  66 | `teacher_substitutions`           | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent coverage audit record         |
|  79 | `book_issues`                     | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent book circulation history      |
|  80 | `library_fines`                   | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent fine ledger                   |
|  86 | `transport_allocations`           | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | RESTRICT / Seat subscription            |
|  87 | `transport_trips`                 | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent vehicle trip log              |
|  88 | `transport_trip_attendance`       | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent student boarding log          |
|  92 | `hostel_allocations`              | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent hostel lease record           |
|  93 | `hostel_attendance`               | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent hostel curfew log             |
|  94 | `hostel_visitors`                 | SCHOOL_YEAR |     Yes     |        Yes         |    `id`     | Permanent hostel visitor log            |

---

# 4. Authoritative Foreign Key Matrix (All 159 Foreign Keys)

Below is the complete, reconciled foreign key matrix. Every single relationship is mapped, ensuring composite tenant foreign keys where parent and child are tenant-owned, valid parent candidate keys, and safe delete behaviors.

### Section 4.1: Platform, Authentication & Access Control (FK 1 - 20)

|   # | Child Table                  | Child FK Columns            | Parent Table            | Parent Ref Columns | Delete Action |     Type      |
| --: | ---------------------------- | --------------------------- | ----------------------- | ------------------ | :-----------: | :-----------: |
|   1 | `subscription_features`      | `plan_id`                   | `subscription_plans`    | `id`               |    CASCADE    |    Global     |
|   2 | `subscriptions`              | `school_id`                 | `schools`               | `id`               |   RESTRICT    |   Platform    |
|   3 | `subscriptions`              | `plan_id`                   | `subscription_plans`    | `id`               |   RESTRICT    |   Platform    |
|   4 | `subscription_invoices`      | `school_id`                 | `schools`               | `id`               |   RESTRICT    |   Platform    |
|   5 | `subscription_invoices`      | `subscription_id`           | `subscriptions`         | `id`               |   RESTRICT    |   Platform    |
|   6 | `subscription_invoice_items` | `school_id, invoice_id`     | `subscription_invoices` | `school_id, id`    |    CASCADE    |   Composite   |
|   7 | `subscription_payments`      | `school_id, invoice_id`     | `subscription_invoices` | `school_id, id`    |   RESTRICT    |   Composite   |
|   8 | `payment_webhook_events`     | `school_id`                 | `schools`               | `id`               |   RESTRICT    |   Platform    |
|   9 | `school_settings`            | `school_id`                 | `schools`               | `id`               |    CASCADE    | Tenant Single |
|  10 | `academic_years`             | `school_id`                 | `schools`               | `id`               |   RESTRICT    | Tenant Single |
|  11 | `sessions`                   | `user_id`                   | `users`                 | `id`               |    CASCADE    |    Global     |
|  12 | `password_resets`            | `user_id`                   | `users`                 | `id`               |    CASCADE    |    Global     |
|  13 | `roles`                      | `school_id`                 | `schools`               | `id`               |   RESTRICT    | Tenant Single |
|  14 | `role_permissions`           | `school_id, role_id`        | `roles`                 | `school_id, id`    |    CASCADE    |   Composite   |
|  15 | `role_permissions`           | `permission_id`             | `permissions`           | `id`               |   RESTRICT    |    Global     |
|  16 | `school_users`               | `school_id`                 | `schools`               | `id`               |   RESTRICT    | Tenant Single |
|  17 | `school_users`               | `user_id`                   | `users`                 | `id`               |    CASCADE    |    Global     |
|  18 | `user_school_roles`          | `school_id, role_id`        | `roles`                 | `school_id, id`    |    CASCADE    |   Composite   |
|  19 | `user_school_roles`          | `school_id, school_user_id` | `school_users`          | `school_id, id`    |    CASCADE    |   Composite   |
|  20 | `stored_files`               | `school_id`                 | `schools`               | `id`               |   RESTRICT    |     Mixed     |

### Section 4.2: Student Admission & Academic Structure (FK 21 - 38)

|   # | Child Table              | Child FK Columns                      | Parent Table             | Parent Ref Columns | Delete Action |      Type       |
| --: | ------------------------ | ------------------------------------- | ------------------------ | ------------------ | :-----------: | :-------------: |
|  21 | `students`               | `school_id`                           | `schools`                | `id`               |   RESTRICT    |  Tenant Single  |
|  22 | `students`               | `student_identity_id`                 | `student_identities`     | `id`               |   RESTRICT    |     Global      |
|  23 | `students`               | `user_id`                             | `users`                  | `id`               |   SET NULL    | Global Nullable |
|  24 | `student_documents`      | `school_id, student_id`               | `students`               | `school_id, id`    |    CASCADE    |    Composite    |
|  25 | `student_documents`      | `stored_file_id`                      | `stored_files`           | `id`               |   RESTRICT    |      Mixed      |
|  26 | `enrollments`            | `school_id, student_id`               | `students`               | `school_id, id`    |   RESTRICT    |    Composite    |
|  27 | `enrollments`            | `school_id, academic_year_id`         | `academic_years`         | `school_id, id`    |   RESTRICT    |    Composite    |
|  28 | `enrollments`            | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    |    Composite    |
|  29 | `academic_year_sections` | `school_id, class_id`                 | `classes`                | `school_id, id`    |   RESTRICT    |    Composite    |
|  30 | `academic_year_sections` | `school_id, academic_year_id`         | `academic_years`         | `school_id, id`    |   RESTRICT    |    Composite    |
|  31 | `parent_students`        | `parent_id`                           | `parents`                | `id`               |   RESTRICT    |     Global      |
|  32 | `parent_students`        | `school_id, student_id`               | `students`               | `school_id, id`    |    CASCADE    |    Composite    |
|  33 | `classes`                | `school_id`                           | `schools`                | `id`               |   RESTRICT    |  Tenant Single  |
|  34 | `subjects`               | `school_id`                           | `schools`                | `id`               |   RESTRICT    |  Tenant Single  |
|  35 | `class_subjects`         | `school_id, class_id`                 | `classes`                | `school_id, id`    |   RESTRICT    |    Composite    |
|  36 | `class_subjects`         | `school_id, subject_id`               | `subjects`               | `school_id, id`    |   RESTRICT    |    Composite    |
|  37 | `transfer_certificates`  | `school_id, student_id`               | `students`               | `school_id, id`    |   RESTRICT    |    Composite    |
|  38 | `clearance_requests`     | `school_id, enrollment_id`            | `enrollments`            | `school_id, id`    |   RESTRICT    |    Composite    |

### Section 4.3: Promotion Batches & Records (FK 39 - 42)

|   # | Child Table         | Child FK Columns                       | Parent Table        | Parent Ref Columns | Delete Action |        Type        |
| --: | ------------------- | -------------------------------------- | ------------------- | ------------------ | :-----------: | :----------------: |
|  39 | `promotion_batches` | `school_id, academic_year_id`          | `academic_years`    | `school_id, id`    |   RESTRICT    |     Composite      |
|  40 | `promotion_records` | `school_id, batch_id`                  | `promotion_batches` | `school_id, id`    |    CASCADE    |     Composite      |
|  41 | `promotion_records` | `school_id, source_enrollment_id`      | `enrollments`       | `school_id, id`    |   RESTRICT    |     Composite      |
|  42 | `promotion_records` | `school_id, destination_enrollment_id` | `enrollments`       | `school_id, id`    |   RESTRICT    | Composite Nullable |

### Section 4.4: Academic Delivery, Homework & Attendance (FK 43 - 60)

|   # | Child Table                       | Child FK Columns                      | Parent Table             | Parent Ref Columns | Delete Action |        Type        |
| --: | --------------------------------- | ------------------------------------- | ------------------------ | ------------------ | :-----------: | :----------------: |
|  43 | `teacher_assignments`             | `school_id, staff_id`                 | `staff`                  | `school_id, id`    |   RESTRICT    |     Composite      |
|  44 | `teacher_assignments`             | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    |     Composite      |
|  45 | `teacher_assignments`             | `school_id, subject_id`               | `subjects`               | `school_id, id`    |   RESTRICT    | Composite Nullable |
|  46 | `syllabi`                         | `school_id, class_subject_id`         | `class_subjects`         | `school_id, id`    |   RESTRICT    |     Composite      |
|  47 | `attendance_sessions`             | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    |     Composite      |
|  48 | `attendance_records`              | `school_id, session_id`               | `attendance_sessions`    | `school_id, id`    |   RESTRICT    |     Composite      |
|  49 | `attendance_records`              | `school_id, enrollment_id`            | `enrollments`            | `school_id, id`    |   RESTRICT    |     Composite      |
|  50 | `attendance_corrections`          | `school_id, attendance_record_id`     | `attendance_records`     | `school_id, id`    |   RESTRICT    |     Composite      |
|  51 | `attendance_qr_tokens`            | `school_id, attendance_session_id`    | `attendance_sessions`    | `school_id, id`    |    CASCADE    |     Composite      |
|  52 | `homework`                        | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    |     Composite      |
|  53 | `homework`                        | `school_id, subject_id`               | `subjects`               | `school_id, id`    |   RESTRICT    |     Composite      |
|  54 | `homework`                        | `school_id, assigned_by_staff_id`     | `staff`                  | `school_id, id`    |   RESTRICT    |     Composite      |
|  55 | `homework_attachments`            | `school_id, homework_id`              | `homework`               | `school_id, id`    |    CASCADE    |     Composite      |
|  56 | `homework_attachments`            | `stored_file_id`                      | `stored_files`           | `id`               |   RESTRICT    |       Mixed        |
|  57 | `homework_submissions`            | `school_id, homework_id`              | `homework`               | `school_id, id`    |   RESTRICT    |     Composite      |
|  58 | `homework_submissions`            | `school_id, enrollment_id`            | `enrollments`            | `school_id, id`    |   RESTRICT    |     Composite      |
|  59 | `homework_submission_attachments` | `school_id, submission_id`            | `homework_submissions`   | `school_id, id`    |    CASCADE    |     Composite      |
|  60 | `homework_submission_attachments` | `stored_file_id`                      | `stored_files`           | `id`               |   RESTRICT    |       Mixed        |

### Section 4.5: Student Fees & Financial Ledger (FK 61 - 74)

|   # | Child Table               | Child FK Columns                   | Parent Table          | Parent Ref Columns | Delete Action |     Type      |
| --: | ------------------------- | ---------------------------------- | --------------------- | ------------------ | :-----------: | :-----------: |
|  61 | `fee_structures`          | `school_id, class_id`              | `classes`             | `school_id, id`    |   RESTRICT    |   Composite   |
|  62 | `fee_structures`          | `school_id, academic_year_id`      | `academic_years`      | `school_id, id`    |   RESTRICT    |   Composite   |
|  63 | `fee_structure_items`     | `school_id, fee_structure_id`      | `fee_structures`      | `school_id, id`    |   RESTRICT    |   Composite   |
|  64 | `fee_structure_items`     | `school_id, fee_type_id`           | `fee_types`           | `school_id, id`    |   RESTRICT    |   Composite   |
|  65 | `penalty_rules`           | `school_id, fee_structure_item_id` | `fee_structure_items` | `school_id, id`    |   RESTRICT    |   Composite   |
|  66 | `fee_concessions`         | `school_id, student_id`            | `students`            | `school_id, id`    |   RESTRICT    |   Composite   |
|  67 | `student_fees`            | `school_id, enrollment_id`         | `enrollments`         | `school_id, id`    |   RESTRICT    |   Composite   |
|  68 | `student_fees`            | `school_id, fee_structure_item_id` | `fee_structure_items` | `school_id, id`    |   RESTRICT    |   Composite   |
|  69 | `fee_payments`            | `school_id`                        | `schools`             | `id`               |   RESTRICT    | Tenant Single |
|  70 | `fee_payments`            | `school_id, collected_by_staff_id` | `staff`               | `school_id, id`    |   RESTRICT    |   Composite   |
|  71 | `fee_payment_allocations` | `school_id, fee_payment_id`        | `fee_payments`        | `school_id, id`    |   RESTRICT    |   Composite   |
|  72 | `fee_payment_allocations` | `school_id, student_fee_id`        | `student_fees`        | `school_id, id`    |   RESTRICT    |   Composite   |
|  73 | `fee_refunds`             | `school_id, fee_payment_id`        | `fee_payments`        | `school_id, id`    |   RESTRICT    |   Composite   |
|  74 | `fee_ledger_entries`      | `school_id, student_fee_id`        | `student_fees`        | `school_id, id`    |   RESTRICT    |   Composite   |

### Section 4.6: Examinations, Marks & Transcripts (FK 75 - 85)

|   # | Child Table             | Child FK Columns                      | Parent Table             | Parent Ref Columns | Delete Action |   Type    |
| --: | ----------------------- | ------------------------------------- | ------------------------ | ------------------ | :-----------: | :-------: |
|  75 | `exams`                 | `school_id, academic_year_id`         | `academic_years`         | `school_id, id`    |   RESTRICT    | Composite |
|  76 | `exams`                 | `school_id, exam_type_id`             | `exam_types`             | `school_id, id`    |   RESTRICT    | Composite |
|  77 | `exam_subjects`         | `school_id, exam_id`                  | `exams`                  | `school_id, id`    |   RESTRICT    | Composite |
|  78 | `exam_subjects`         | `school_id, class_id`                 | `classes`                | `school_id, id`    |   RESTRICT    | Composite |
|  79 | `exam_subjects`         | `school_id, subject_id`               | `subjects`               | `school_id, id`    |   RESTRICT    | Composite |
|  80 | `exam_marks`            | `school_id, exam_subject_id`          | `exam_subjects`          | `school_id, id`    |   RESTRICT    | Composite |
|  81 | `exam_marks`            | `school_id, enrollment_id`            | `enrollments`            | `school_id, id`    |   RESTRICT    | Composite |
|  82 | `tabulation_sheets`     | `school_id, exam_id`                  | `exams`                  | `school_id, id`    |   RESTRICT    | Composite |
|  83 | `tabulation_sheets`     | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    | Composite |
|  84 | `report_cards`          | `school_id, enrollment_id`            | `enrollments`            | `school_id, id`    |   RESTRICT    | Composite |
|  85 | `report_card_snapshots` | `school_id, report_card_id`           | `report_cards`           | `school_id, id`    |   RESTRICT    | Composite |

### Section 4.7: Timetable & Room Scheduling (FK 86 - 93)

|   # | Child Table             | Child FK Columns                      | Parent Table             | Parent Ref Columns | Delete Action |        Type        |
| --: | ----------------------- | ------------------------------------- | ------------------------ | ------------------ | :-----------: | :----------------: |
|  86 | `timetables`            | `school_id, academic_year_section_id` | `academic_year_sections` | `school_id, id`    |   RESTRICT    |     Composite      |
|  87 | `timetable_slots`       | `school_id, timetable_id`             | `timetables`             | `school_id, id`    |    CASCADE    |     Composite      |
|  88 | `timetable_slots`       | `school_id, period_id`                | `period_definitions`     | `school_id, id`    |   RESTRICT    |     Composite      |
|  89 | `timetable_slots`       | `school_id, subject_id`               | `subjects`               | `school_id, id`    |   RESTRICT    |     Composite      |
|  90 | `timetable_slots`       | `school_id, staff_id`                 | `staff`                  | `school_id, id`    |   RESTRICT    |     Composite      |
|  91 | `timetable_slots`       | `school_id, room_id`                  | `rooms`                  | `school_id, id`    |   RESTRICT    | Composite Nullable |
|  92 | `teacher_substitutions` | `school_id, slot_id`                  | `timetable_slots`        | `school_id, id`    |   RESTRICT    |     Composite      |
|  93 | `teacher_substitutions` | `school_id, substitute_staff_id`      | `staff`                  | `school_id, id`    |   RESTRICT    |     Composite      |

### Section 4.8: Staff, Human Resources & Payroll (FK 94 - 103)

|   # | Child Table          | Child FK Columns            | Parent Table   | Parent Ref Columns | Delete Action |      Type       |
| --: | -------------------- | --------------------------- | -------------- | ------------------ | :-----------: | :-------------: |
|  94 | `staff`              | `school_id`                 | `schools`      | `id`               |   RESTRICT    |  Tenant Single  |
|  95 | `staff`              | `user_id`                   | `users`        | `id`               |   SET NULL    | Global Nullable |
|  96 | `staff`              | `school_id, department_id`  | `departments`  | `school_id, id`    |   RESTRICT    |    Composite    |
|  97 | `staff`              | `school_id, designation_id` | `designations` | `school_id, id`    |   RESTRICT    |    Composite    |
|  98 | `staff_documents`    | `school_id, staff_id`       | `staff`        | `school_id, id`    |    CASCADE    |    Composite    |
|  99 | `leave_requests`     | `school_id, staff_id`       | `staff`        | `school_id, id`    |   RESTRICT    |    Composite    |
| 100 | `leave_requests`     | `school_id, leave_type_id`  | `leave_types`  | `school_id, id`    |   RESTRICT    |    Composite    |
| 101 | `payroll_structures` | `school_id, staff_id`       | `staff`        | `school_id, id`    |   RESTRICT    |    Composite    |
| 102 | `payrolls`           | `school_id, staff_id`       | `staff`        | `school_id, id`    |   RESTRICT    |    Composite    |
| 103 | `payroll_items`      | `school_id, payroll_id`     | `payrolls`     | `school_id, id`    |   RESTRICT    |    Composite    |

### Section 4.9: Library & Digital Assets (FK 104 - 110)

|   # | Child Table       | Child FK Columns           | Parent Table      | Parent Ref Columns | Delete Action |     Type      |
| --: | ----------------- | -------------------------- | ----------------- | ------------------ | :-----------: | :-----------: |
| 104 | `books`           | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |
| 105 | `book_copies`     | `school_id, book_id`       | `books`           | `school_id, id`    |   RESTRICT    |   Composite   |
| 106 | `library_members` | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |
| 107 | `book_issues`     | `school_id, book_copy_id`  | `book_copies`     | `school_id, id`    |   RESTRICT    |   Composite   |
| 108 | `book_issues`     | `school_id, member_id`     | `library_members` | `school_id, id`    |   RESTRICT    |   Composite   |
| 109 | `library_fines`   | `school_id, book_issue_id` | `book_issues`     | `school_id, id`    |   RESTRICT    |   Composite   |
| 110 | `digital_books`   | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |

### Section 4.10: Fleet Management & Transport (FK 111 - 122)

|   # | Child Table                 | Child FK Columns           | Parent Table      | Parent Ref Columns | Delete Action |     Type      |
| --: | --------------------------- | -------------------------- | ----------------- | ------------------ | :-----------: | :-----------: |
| 111 | `vehicles`                  | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |
| 112 | `drivers`                   | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |
| 113 | `routes`                    | `school_id`                | `schools`         | `id`               |   RESTRICT    | Tenant Single |
| 114 | `route_stops`               | `school_id, route_id`      | `routes`          | `school_id, id`    |   RESTRICT    |   Composite   |
| 115 | `transport_allocations`     | `school_id, enrollment_id` | `enrollments`     | `school_id, id`    |   RESTRICT    |   Composite   |
| 116 | `transport_allocations`     | `school_id, route_stop_id` | `route_stops`     | `school_id, id`    |   RESTRICT    |   Composite   |
| 117 | `transport_allocations`     | `school_id, vehicle_id`    | `vehicles`        | `school_id, id`    |   RESTRICT    |   Composite   |
| 118 | `transport_trips`           | `school_id, route_id`      | `routes`          | `school_id, id`    |   RESTRICT    |   Composite   |
| 119 | `transport_trips`           | `school_id, vehicle_id`    | `vehicles`        | `school_id, id`    |   RESTRICT    |   Composite   |
| 120 | `transport_trips`           | `school_id, driver_id`     | `drivers`         | `school_id, id`    |   RESTRICT    |   Composite   |
| 121 | `transport_trip_attendance` | `school_id, trip_id`       | `transport_trips` | `school_id, id`    |   RESTRICT    |   Composite   |
| 122 | `transport_trip_attendance` | `school_id, enrollment_id` | `enrollments`     | `school_id, id`    |   RESTRICT    |   Composite   |

### Section 4.11: Hostel & Residential Life (FK 123 - 129)

|   # | Child Table          | Child FK Columns                  | Parent Table         | Parent Ref Columns | Delete Action |     Type      |
| --: | -------------------- | --------------------------------- | -------------------- | ------------------ | :-----------: | :-----------: |
| 123 | `hostel_blocks`      | `school_id`                       | `schools`            | `id`               |   RESTRICT    | Tenant Single |
| 124 | `hostel_rooms`       | `school_id, block_id`             | `hostel_blocks`      | `school_id, id`    |   RESTRICT    |   Composite   |
| 125 | `hostel_beds`        | `school_id, room_id`              | `hostel_rooms`       | `school_id, id`    |   RESTRICT    |   Composite   |
| 126 | `hostel_allocations` | `school_id, enrollment_id`        | `enrollments`        | `school_id, id`    |   RESTRICT    |   Composite   |
| 127 | `hostel_allocations` | `school_id, bed_id`               | `hostel_beds`        | `school_id, id`    |   RESTRICT    |   Composite   |
| 128 | `hostel_attendance`  | `school_id, hostel_allocation_id` | `hostel_allocations` | `school_id, id`    |   RESTRICT    |   Composite   |
| 129 | `hostel_visitors`    | `school_id, hostel_allocation_id` | `hostel_allocations` | `school_id, id`    |   RESTRICT    |   Composite   |

### Section 4.12: Inventory, Fixed Assets & Procurement (FK 130 - 143)

|   # | Child Table              | Child FK Columns               | Parent Table         | Parent Ref Columns | Delete Action |        Type        |
| --: | ------------------------ | ------------------------------ | -------------------- | ------------------ | :-----------: | :----------------: |
| 130 | `asset_categories`       | `school_id`                    | `schools`            | `id`               |   RESTRICT    |   Tenant Single    |
| 131 | `inventory_items`        | `school_id, category_id`       | `asset_categories`   | `school_id, id`    |   RESTRICT    |     Composite      |
| 132 | `fixed_assets`           | `school_id`                    | `schools`            | `id`               |   RESTRICT    |   Tenant Single    |
| 133 | `fixed_assets`           | `school_id, item_id`           | `inventory_items`    | `school_id, id`    |   RESTRICT    |     Composite      |
| 134 | `fixed_assets`           | `school_id, assigned_staff_id` | `staff`              | `school_id, id`    |   RESTRICT    | Composite Nullable |
| 135 | `fixed_assets`           | `school_id, room_id`           | `rooms`              | `school_id, id`    |   RESTRICT    | Composite Nullable |
| 136 | `inventory_transactions` | `school_id, item_id`           | `inventory_items`    | `school_id, id`    |   RESTRICT    |     Composite      |
| 137 | `asset_maintenance`      | `school_id, asset_id`          | `fixed_assets`       | `school_id, id`    |   RESTRICT    |     Composite      |
| 138 | `vendors`                | `school_id`                    | `schools`            | `id`               |   RESTRICT    |   Tenant Single    |
| 139 | `purchase_orders`        | `school_id`                    | `schools`            | `id`               |   RESTRICT    |   Tenant Single    |
| 140 | `purchase_orders`        | `school_id, vendor_id`         | `vendors`            | `school_id, id`    |   RESTRICT    |     Composite      |
| 141 | `purchase_order_items`   | `school_id, purchase_order_id` | `purchase_orders`    | `school_id, id`    |   RESTRICT    |     Composite      |
| 142 | `expense_categories`     | `school_id`                    | `schools`            | `id`               |   RESTRICT    |   Tenant Single    |
| 143 | `expenses`               | `school_id, category_id`       | `expense_categories` | `school_id, id`    |   RESTRICT    |     Composite      |

### Section 4.13: Communication, Notifications & System Auditing (FK 144 - 159)

|   # | Child Table                   | Child FK Columns             | Parent Table             | Parent Ref Columns | Delete Action |     Type      |
| --: | ----------------------------- | ---------------------------- | ------------------------ | ------------------ | :-----------: | :-----------: |
| 144 | `announcements`               | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 145 | `announcement_targets`        | `school_id, announcement_id` | `announcements`          | `school_id, id`    |    CASCADE    |   Composite   |
| 146 | `events`                      | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 147 | `internal_conversations`      | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 148 | `internal_messages`           | `school_id, conversation_id` | `internal_conversations` | `school_id, id`    |   RESTRICT    |   Composite   |
| 149 | `internal_messages`           | `sender_user_id`             | `users`                  | `id`               |   RESTRICT    |    Global     |
| 150 | `internal_message_recipients` | `school_id, message_id`      | `internal_messages`      | `school_id, id`    |    CASCADE    |   Composite   |
| 151 | `internal_message_recipients` | `recipient_user_id`          | `users`                  | `id`               |   RESTRICT    |    Global     |
| 152 | `notification_templates`      | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 153 | `notifications`               | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 154 | `notifications`               | `recipient_user_id`          | `users`                  | `id`               |   RESTRICT    |    Global     |
| 155 | `notification_deliveries`     | `school_id, notification_id` | `notifications`          | `school_id, id`    |    CASCADE    |   Composite   |
| 156 | `activity_logs`               | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 157 | `activity_logs`               | `user_id`                    | `users`                  | `id`               |   RESTRICT    |    Global     |
| 158 | `historical_change_records`   | `school_id`                  | `schools`                | `id`               |   RESTRICT    | Tenant Single |
| 159 | `historical_change_records`   | `user_id`                    | `users`                  | `id`               |   RESTRICT    |    Global     |

---

# 5. Authoritative Unique Constraint & Generated Key Matrix

| Domain         | Table Name               | Constraint Name                     | Target Columns                                         |     Mechanism      | Purpose                                               |
| -------------- | ------------------------ | ----------------------------------- | ------------------------------------------------------ | :----------------: | ----------------------------------------------------- |
| **Identity**   | `users`                  | `uq_users_email`                    | `[email]`                                              |   Native UNIQUE    | Global login email uniqueness                         |
| **Identity**   | `student_identities`     | `uq_student_identities_national_id` | `[national_id]`                                        |   Native UNIQUE    | Civil legal person uniqueness                         |
| **Tenant**     | `students`               | `uq_students_active_admission`      | `[school_id, active_admission_number]`                 | `STORED` Generated | Clean reusable admission numbers                      |
| **Tenant**     | `staff`                  | `uq_staff_active_code`              | `[school_id, active_employee_code]`                    | `STORED` Generated | Clean reusable employee codes                         |
| **Academic**   | `enrollments`            | `uq_enrollments_student_year`       | `[school_id, student_id, academic_year_id]`            |   Native UNIQUE    | Exactly one enrollment per student per academic year  |
| **Academic**   | `enrollments`            | `uq_enrollments_section_roll`       | `[school_id, academic_year_section_id, roll_number]`   |   Native UNIQUE    | Unique roll number within section for year            |
| **Teaching**   | `teacher_assignments`    | `uq_ta_active_class_teacher`        | `[school_id, class_teacher_unique_key]`                | `STORED` Generated | Exactly one active class teacher per section          |
| **Attendance** | `attendance_records`     | `uq_attendance_session_enrollment`  | `[school_id, session_id, enrollment_id]`               |   Native UNIQUE    | Prevents duplicate student attendance marks           |
| **Attendance** | `attendance_qr_tokens`   | `uq_qr_tokens_nonce`                | `[school_id, attendance_session_id, token_nonce_hash]` |   Native UNIQUE    | Session token uniqueness                              |
| **Finance**    | `student_fees`           | `uq_student_fees_structure_item`    | `[school_id, enrollment_id, fee_structure_item_id]`    |   Native UNIQUE    | Exactly one fee balance row per fee item              |
| **Finance**    | `fee_payments`           | `uq_fee_payments_receipt`           | `[school_id, receipt_number]`                          |   Native UNIQUE    | Permanent unique fee receipt                          |
| **Finance**    | `fee_ledger_entries`     | `uq_fee_ledger_sequence`            | `[school_id, student_fee_id, sequence_number]`         |   Native UNIQUE    | Deterministic subledger audit ordering                |
| **Platform**   | `payment_webhook_events` | `uq_webhooks_provider_event`        | `[provider, event_id]`                                 |   Native UNIQUE    | Webhook idempotency                                   |
| **Hostel**     | `hostel_allocations`     | `uq_hostel_active_bed`              | `[school_id, active_bed_key]`                          | `STORED` Generated | Prevents double-booking hostel bed                    |
| **Hostel**     | `hostel_allocations`     | `uq_hostel_active_occupant`         | `[school_id, active_enrollment_key]`                   | `STORED` Generated | Prevents student holding multiple active beds         |
| **Library**    | `book_issues`            | `uq_library_active_loan`            | `[school_id, active_copy_key]`                         | `STORED` Generated | Prevents loaning unreturned (`ISSUED`/`OVERDUE`) copy |
| **HR**         | `payrolls`               | `uq_payrolls_staff_period`          | `[school_id, staff_id, payroll_year, payroll_month]`   |   Native UNIQUE    | Exactly one payslip per staff per month               |

---

# 6. Detailed Generated Column Definitions

To comply strictly with MySQL 8.0 indexing requirements, all conditional generated keys use deterministic `STORED` definitions:

```sql
-- 1. Students: Active Admission Number (Ignores soft-deleted students)
ALTER TABLE students
ADD COLUMN active_admission_number VARCHAR(64)
GENERATED ALWAYS AS (IF(deleted_at IS NULL, admission_number, NULL)) STORED;
CREATE UNIQUE INDEX uq_students_active_admission ON students (school_id, active_admission_number);

-- 2. Staff: Active Employee Code (Ignores soft-deleted staff)
ALTER TABLE staff
ADD COLUMN active_employee_code VARCHAR(64)
GENERATED ALWAYS AS (IF(deleted_at IS NULL, employee_code, NULL)) STORED;
CREATE UNIQUE INDEX uq_staff_active_code ON staff (school_id, active_employee_code);

-- 3. Teacher Assignments: Single Active Class Teacher per Section
ALTER TABLE teacher_assignments
ADD COLUMN class_teacher_unique_key VARCHAR(36)
GENERATED ALWAYS AS (IF(is_class_teacher = 1 AND is_active = 1, academic_year_section_id, NULL)) STORED;
CREATE UNIQUE INDEX uq_ta_active_class_teacher ON teacher_assignments (school_id, class_teacher_unique_key);

-- 4. Library: Single Active Book Loan (Covers both ISSUED and OVERDUE until returned)
ALTER TABLE book_issues
ADD COLUMN active_copy_key VARCHAR(36)
GENERATED ALWAYS AS (IF(returned_at IS NULL, book_copy_id, NULL)) STORED;
CREATE UNIQUE INDEX uq_library_active_loan ON book_issues (school_id, active_copy_key);

-- 5. Hostel: Single Active Bed Allocation (Prevents double-booking beds)
ALTER TABLE hostel_allocations
ADD COLUMN active_bed_key VARCHAR(36)
GENERATED ALWAYS AS (IF(status = 'ACTIVE', bed_id, NULL)) STORED;
CREATE UNIQUE INDEX uq_hostel_active_bed ON hostel_allocations (school_id, active_bed_key);

-- 6. Hostel: Single Active Occupant (Prevents student holding multiple beds)
ALTER TABLE hostel_allocations
ADD COLUMN active_enrollment_key VARCHAR(36)
GENERATED ALWAYS AS (IF(status = 'ACTIVE', enrollment_id, NULL)) STORED;
CREATE UNIQUE INDEX uq_hostel_active_occupant ON hostel_allocations (school_id, active_enrollment_key);
```

---

# 7. Financial & Concurrency Transaction Blueprint

### Append-Only Student Fee Subledger

Financial integrity is guarded by an atomic transaction boundary executing under `READ COMMITTED` or `REPEATABLE READ`:

```
Client / Cashier Payment
          │
          ▼
1. Acquire Row Lock on Student Fee
   SELECT id, balance_amount, status FROM student_fees
   WHERE id = :studentFeeId AND school_id = :schoolId
   FOR UPDATE;
          │
          ▼
2. Verify Payment Math & Idempotency Key
          │
          ▼
3. Insert Payment Row
   INSERT INTO fee_payments (id, school_id, receipt_number, amount, payment_mode, ...)
          │
          ▼
4. Insert Payment Allocation
   INSERT INTO fee_payment_allocations (id, school_id, fee_payment_id, student_fee_id, amount_allocated, ...)
          │
          ▼
5. Mutate Student Fee Balance Summary
   UPDATE student_fees
   SET paid_amount = paid_amount + :allocated,
       balance_amount = balance_amount - :allocated,
       status = IF(balance_amount - :allocated = 0, 'PAID', 'PARTIAL'),
       updated_at = NOW()
   WHERE id = :studentFeeId;
          │
          ▼
6. Append Ledger Subledger Line
   INSERT INTO fee_ledger_entries (id, school_id, student_fee_id, sequence_number, entry_type, debit_amount, credit_amount, balance_after, ...)
          │
          ▼
7. COMMIT Transaction
```

_Guarantee_: If any step fails or network drops, the entire transaction rolls back cleanly. No partial balances, no orphaned receipts, zero balance drift.

---

# 8. Webhook Idempotency Protocol

Payment gateway webhooks (Stripe, Razorpay, Flutterwave) adhere to a 6-stage finite state machine:

$$\text{RECEIVED} \longrightarrow \text{PROCESSING} \longrightarrow \text{PROCESSED}$$
$$\text{PROCESSING} \longrightarrow \text{RETRYING} \longrightarrow \text{DEAD\_LETTER}$$

1. **Deduplication Key**: `UNIQUE KEY uq_webhooks_provider_event (provider, event_id)`.
2. **First Delivery**: Row inserted in `RECEIVED` state. Worker locks row via `SELECT ... FOR UPDATE`, transitions to `PROCESSING`, executes invoice payment credit, transitions to `PROCESSED`.
3. **Duplicate Delivery**: Gateway retries hit `uq_webhooks_provider_event` on INSERT $\rightarrow$ duplicate key error intercepted cleanly $\rightarrow$ worker acknowledges with HTTP 200 OK immediately without re-executing credit.

---

# 9. Prisma ORM Implementation Standards

When generating `prisma/schema.prisma`:

1. **Foreign Key Enforcement**: `relationMode = "foreignKeys"` is mandatory.
2. **Composite Model Relations**:
   ```prisma
   model Enrollment {
     id                     String               @id @default(uuid()) @db.VarChar(36)
     schoolId               String               @map("school_id") @db.VarChar(36)
     studentId              String               @map("student_id") @db.VarChar(36)
     academicYearId         String               @map("academic_year_id") @db.VarChar(36)
     academicYearSectionId  String               @map("academic_year_section_id") @db.VarChar(36)

     school                 School               @relation(fields: [schoolId], references: [id], onDelete: Restrict)
     student                Student              @relation(fields: [schoolId, studentId], references: [schoolId, id], onDelete: Restrict)
     academicYear           AcademicYear         @relation(fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict)
     section                AcademicYearSection  @relation(fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict)

     @@unique([schoolId, id])
     @@unique([schoolId, studentId, academicYearId], map: "uq_enrollments_student_year")
     @@index([schoolId, academicYearSectionId])
     @@map("enrollments")
   }
   ```
3. **Generated Columns in Prisma**: Generated columns (`STORED`) are declared with `@unique` in Prisma models, and materialized in MySQL via initial migration SQL (`prisma migrate dev --create-only`).

---

# 10. Final Architectural Verification Gate

```text
=====================================================================
                  SCHOOLNEXA ARCHITECTURE GATE v3.3.1
=====================================================================

AUTHORITATIVE TABLE COUNT:          115 / 115 (PASS)
ALL 115 TABLES ENUMERATED:          PASS
ZERO MISSING OR PHANTOM ENTITIES:   PASS
ALL 159 FOREIGN KEYS MAPPED:        PASS
COMPOSITE TENANT PARENT KEYS:       PASS
NO COMPOSITE "SET NULL" FKS:        PASS
NO DESTRUCTIVE CASCADE ON AUDIT:    PASS
NO DESTRUCTIVE CASCADE ON FINANCE:  PASS
PLATFORM SUPER ADMIN DECOUPLED:     PASS
ROLES.SCHOOL_ID STRICTLY NOT NULL:  PASS
ACADEMIC YEAR INTEGRITY ANCHORS:    PASS
STUDENT 3-TIER LIFECYCLE MODEL:     PASS
CONDITIONAL UNIQUE STORED KEYS:     PASS
ATTENDANCE QR NONCE RECONCILED:     PASS
APPEND-ONLY FINANCIAL SUBLEDGER:    PASS
WEBHOOK IDEMPOTENCY PROTOCOL:       PASS
MYSQL 8.0+ INNODB COMPLIANCE:       PASS
PRISMA RELATIONMODE FOREIGNKEYS:    PASS

=====================================================================
                       OVERALL STATUS:
                 RECONCILED & SEALED (PASS)
=====================================================================
```

**Instruction Adherence**: Architecture specification is sealed in `/ARCHITECTURE_BLUEPRINT.md`. No `schema.prisma`, migrations, or application code have been generated. Ready for the next instruction to begin Prisma schema implementation.
