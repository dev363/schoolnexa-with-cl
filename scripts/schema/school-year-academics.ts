// Module 4: School + Academic Year Operational Scope (38 Tables)

export const schoolYearAcademicsSchema = `

// ==========================================
// 6. SCHOOL + ACADEMIC YEAR SCOPE (38 Tables)
// ==========================================

// ==========================================
// ENROLLMENT & PROMOTION
// ==========================================

model Enrollment {

  id                    String              @id @default(uuid()) @db.VarChar(36)

  schoolId              String              @map("school_id") @db.VarChar(36)
  studentId             String              @map("student_id") @db.VarChar(36)
  academicYearId        String              @map("academic_year_id") @db.VarChar(36)
  academicYearSectionId String              @map("academic_year_section_id") @db.VarChar(36)

  rollNumber            Int?                @map("roll_number")

  status                String              @default("ACTIVE") @db.VarChar(30)
  // ACTIVE, PROMOTED, TRANSFERRED, DROPPED, GRADUATED

  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")

  school                School              @relation( fields: [schoolId], references: [id], onDelete: Restrict )

  student               Student             @relation( fields: [schoolId, studentId], references: [schoolId, id], onDelete: Restrict )

  academicYear          AcademicYear        @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  section               AcademicYearSection @relation( fields: [schoolId, academicYearId, academicYearSectionId], references: [schoolId, academicYearId, id], onDelete: Restrict )

  clearanceRequests     ClearanceRequest[]

  promotionAsSource     PromotionRecord[]   @relation("PromotionSource")
  promotionAsDest       PromotionRecord[]   @relation("PromotionDestination")

  attendanceRecords     AttendanceRecord[]

  homeworkSubmissions   HomeworkSubmission[]

  studentFees           StudentFee[]

  examMarks             ExamMark[]

  reportCard            ReportCard?

  transportAllocation   TransportAllocation?

  tripAttendance        TransportTripAttendance[]

  hostelAllocations     HostelAllocation[]

  @@unique([schoolId, id])

  @@unique( [schoolId, studentId, academicYearId], map: "uq_enrollments_student_year" )

  @@unique( [schoolId, academicYearId, academicYearSectionId, rollNumber], map: "uq_enrollments_section_roll" )

  @@index([schoolId])

  @@index([schoolId, studentId])

  @@index([schoolId, academicYearId])

  @@index([schoolId, academicYearSectionId])

  @@map("enrollments")
}

model PromotionBatch {

  id                 String            @id @default(uuid()) @db.VarChar(36)

  schoolId           String            @map("school_id") @db.VarChar(36)
  academicYearId     String            @map("academic_year_id") @db.VarChar(36)

  fromClassId        String            @map("from_class_id") @db.VarChar(36)
  toClassId          String            @map("to_class_id") @db.VarChar(36)

  processedByStaffId String            @map("processed_by_staff_id") @db.VarChar(36)

  status             String            @default("COMPLETED") @db.VarChar(30)
  // DRAFT, PROCESSING, COMPLETED, FAILED, CANCELLED

  createdAt          DateTime          @default(now()) @map("created_at")
  updatedAt          DateTime          @updatedAt @map("updated_at")

  school             School            @relation( fields: [schoolId], references: [id], onDelete: Restrict )

  academicYear       AcademicYear      @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  records            PromotionRecord[]

  @@unique([schoolId, id])

  @@index([schoolId, academicYearId])

  @@index([schoolId, fromClassId])

  @@index([schoolId, toClassId])

  @@index([schoolId, processedByStaffId])

  @@map("promotion_batches")
}

model PromotionRecord {

  id                      String          @id @default(uuid()) @db.VarChar(36)

  schoolId               String          @map("school_id") @db.VarChar(36)

  batchId                 String          @map("batch_id") @db.VarChar(36)

  sourceEnrollmentId      String          @map("source_enrollment_id") @db.VarChar(36)

  destinationEnrollmentId String?         @map("destination_enrollment_id") @db.VarChar(36)

  status                  String          @default("PROMOTED") @db.VarChar(30)
  // PROMOTED, RETAINED, GRADUATED, FAILED

  remarks                 String?         @db.VarChar(255)

  createdAt               DateTime        @default(now()) @map("created_at")

  batch                   PromotionBatch  @relation( fields: [schoolId, batchId], references: [schoolId, id], onDelete: Cascade )

  sourceEnrollment        Enrollment      @relation( "PromotionSource", fields: [schoolId, sourceEnrollmentId], references: [schoolId, id], onDelete: Restrict )

  destinationEnrollment   Enrollment?     @relation( "PromotionDestination", fields: [schoolId, destinationEnrollmentId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, batchId, sourceEnrollmentId], map: "uq_promotion_batch_source" )

  @@index([schoolId, batchId])

  @@index([schoolId, sourceEnrollmentId])

  @@index([schoolId, destinationEnrollmentId])

  @@map("promotion_records")
}

model ClearanceRequest {

  id            String     @id @default(uuid()) @db.VarChar(36)

  schoolId      String     @map("school_id") @db.VarChar(36)

  enrollmentId  String     @map("enrollment_id") @db.VarChar(36)

  clearanceType String     @map("clearance_type") @db.VarChar(50)
  // LIBRARY, FEES, HOSTEL, SPORTS, TRANSPORT, ACADEMIC

  status        String     @default("PENDING") @db.VarChar(30)
  // PENDING, APPROVED, REJECTED

  approvedAt    DateTime?  @map("approved_at")

  remarks       String?    @db.VarChar(255)

  createdAt     DateTime   @default(now()) @map("created_at")

  updatedAt     DateTime   @updatedAt @map("updated_at")

  enrollment    Enrollment @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@index([schoolId, enrollmentId])

  @@index([schoolId, status])

  @@map("clearance_requests")
}

// ==========================================
// ACADEMIC YEAR SECTIONS
// ==========================================

model AcademicYearSection {

  id             String               @id @default(uuid()) @db.VarChar(36)

  schoolId       String               @map("school_id") @db.VarChar(36)

  academicYearId String               @map("academic_year_id") @db.VarChar(36)

  classId        String               @map("class_id") @db.VarChar(36)

  sectionName    String               @map("section_name") @db.VarChar(20)

  maxCapacity    Int                  @default(40) @map("max_capacity")

  currentCount   Int                  @default(0) @map("current_count")

  createdAt      DateTime             @default(now()) @map("created_at")
  updatedAt      DateTime             @updatedAt @map("updated_at")

  class          Class                @relation( fields: [schoolId, classId], references: [schoolId, id], onDelete: Restrict )

  academicYear   AcademicYear         @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  enrollments    Enrollment[]

  assignments    TeacherAssignment[]

  attendance     AttendanceSession[]

  homeworkList   Homework[]

  tabulations    TabulationSheet[]

  timetables     Timetable[]

  @@unique([schoolId, id])

  @@unique( [schoolId, academicYearId, classId, sectionName], map: "uq_academic_year_section" )

  // Required for Enrollment's composite academic-year-safe relation.
  @@unique( [schoolId, academicYearId, id], map: "uq_academic_year_section_context" )

  @@index([schoolId, classId])

  @@index([schoolId, academicYearId])

  @@map("academic_year_sections")
}

model TeacherAssignment {

  id                    String              @id @default(uuid()) @db.VarChar(36)

  schoolId              String              @map("school_id") @db.VarChar(36)

  academicYearSectionId String              @map("academic_year_section_id") @db.VarChar(36)

  staffId               String              @map("staff_id") @db.VarChar(36)

  subjectId             String?             @map("subject_id") @db.VarChar(36)

  isClassTeacher        Boolean             @default(false) @map("is_class_teacher")

  isActive              Boolean             @default(true) @map("is_active")

  classTeacherUniqueKey String?             @map("class_teacher_unique_key") @db.VarChar(36)

  createdAt             DateTime            @default(now()) @map("created_at")

  updatedAt             DateTime            @updatedAt @map("updated_at")

  staff                 Staff               @relation( fields: [schoolId, staffId], references: [schoolId, id], onDelete: Restrict )

  section               AcademicYearSection @relation( fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict )

  subject               Subject?            @relation( fields: [schoolId, subjectId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, classTeacherUniqueKey], map: "uq_ta_active_class_teacher" )

  @@unique( [schoolId, academicYearSectionId, staffId, subjectId], map: "uq_teacher_assignment" )

  @@index([schoolId, staffId])

  @@index([schoolId, academicYearSectionId])

  @@index([schoolId, subjectId])

  @@map("teacher_assignments")
}

model Syllabus {

  id             String       @id @default(uuid()) @db.VarChar(36)

  schoolId       String       @map("school_id") @db.VarChar(36)

  classSubjectId String       @map("class_subject_id") @db.VarChar(36)

  academicYearId String       @map("academic_year_id") @db.VarChar(36)

  term           String       @db.VarChar(50)

  chapterNumber  Int          @map("chapter_number")

  chapterTitle   String       @map("chapter_title") @db.VarChar(200)

  totalHours     Decimal      @default(5.0) @map("total_hours") @db.Decimal(4, 1)

  status         String       @default("PLANNED") @db.VarChar(30)
  // PLANNED, IN_PROGRESS, COMPLETED

  createdAt      DateTime     @default(now()) @map("created_at")

  updatedAt      DateTime     @updatedAt @map("updated_at")

  classSubject   ClassSubject @relation( fields: [schoolId, classSubjectId], references: [schoolId, id], onDelete: Restrict )

  academicYear   AcademicYear @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, academicYearId, classSubjectId, term, chapterNumber], map: "uq_syllabus_chapter" )

  @@index([schoolId, classSubjectId])

  @@index([schoolId, academicYearId])

  @@map("syllabi")
}

// ==========================================
// ATTENDANCE
// ==========================================

model AttendanceSession {

  id                    String                @id @default(uuid()) @db.VarChar(36)

  schoolId              String                @map("school_id") @db.VarChar(36)

  academicYearSectionId String                @map("academic_year_section_id") @db.VarChar(36)

  sessionDate           DateTime              @map("session_date") @db.Date

  sessionType           String                @default("MORNING") @map("session_type") @db.VarChar(30)
  // MORNING, AFTERNOON, FULL_DAY

  status                String                @default("OPEN") @db.VarChar(30)
  // OPEN, SUBMITTED, LOCKED

  takenByStaffId        String?               @map("taken_by_staff_id") @db.VarChar(36)

  createdAt             DateTime              @default(now()) @map("created_at")

  updatedAt             DateTime              @updatedAt @map("updated_at")

  section               AcademicYearSection   @relation( fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict )

  records               AttendanceRecord[]

  qrTokens              AttendanceQrToken[]

  @@unique([schoolId, id])

  @@unique( [schoolId, academicYearSectionId, sessionDate, sessionType], map: "uq_attendance_session" )

  @@index([schoolId, academicYearSectionId])

  @@index([schoolId, sessionDate])

  @@map("attendance_sessions")
}

model AttendanceRecord {

  id           String                 @id @default(uuid()) @db.VarChar(36)

  schoolId     String                 @map("school_id") @db.VarChar(36)

  sessionId    String                 @map("session_id") @db.VarChar(36)

  enrollmentId String                 @map("enrollment_id") @db.VarChar(36)

  status       String                 @db.VarChar(30)
  // PRESENT, ABSENT, LATE, EXCUSED

  checkInTime  DateTime?              @map("check_in_time")

  remarks      String?                @db.VarChar(255)

  createdAt    DateTime               @default(now()) @map("created_at")

  updatedAt    DateTime               @updatedAt @map("updated_at")

  session      AttendanceSession      @relation( fields: [schoolId, sessionId], references: [schoolId, id], onDelete: Restrict )

  enrollment   Enrollment             @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  corrections  AttendanceCorrection[]

  @@unique([schoolId, id])

  @@unique( [schoolId, sessionId, enrollmentId], map: "uq_attendance_session_enrollment" )

  @@index([schoolId, sessionId])

  @@index([schoolId, enrollmentId])

  @@map("attendance_records")
}

model AttendanceCorrection {

  id                 String           @id @default(uuid()) @db.VarChar(36)

  schoolId           String           @map("school_id") @db.VarChar(36)

  attendanceRecordId String           @map("attendance_record_id") @db.VarChar(36)

  oldStatus          String           @map("old_status") @db.VarChar(30)

  newStatus          String           @map("new_status") @db.VarChar(30)

  reason             String           @db.VarChar(255)

  requestedByStaffId String           @map("requested_by_staff_id") @db.VarChar(36)

  approvedAt         DateTime?        @map("approved_at")

  createdAt          DateTime         @default(now()) @map("created_at")

  record             AttendanceRecord @relation( fields: [schoolId, attendanceRecordId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@index([schoolId, attendanceRecordId])

  @@index([schoolId, requestedByStaffId])

  @@map("attendance_corrections")
}

model AttendanceQrToken {

  id                  String            @id @default(uuid()) @db.VarChar(36)

  schoolId            String            @map("school_id") @db.VarChar(36)

  attendanceSessionId String            @map("attendance_session_id") @db.VarChar(36)

  tokenNonceHash      String            @map("token_nonce_hash") @db.VarChar(128)

  expiresAt           DateTime          @map("expires_at")

  createdAt           DateTime          @default(now()) @map("created_at")

  session             AttendanceSession @relation( fields: [schoolId, attendanceSessionId], references: [schoolId, id], onDelete: Cascade )

  @@unique( [schoolId, attendanceSessionId, tokenNonceHash], map: "uq_qr_tokens_nonce" )

  @@index([schoolId, attendanceSessionId])

  @@index([schoolId, expiresAt])

  @@map("attendance_qr_tokens")
}

// ==========================================
// HOMEWORK
// ==========================================

model Homework {

  id                    String                 @id @default(uuid()) @db.VarChar(36)

  schoolId              String                 @map("school_id") @db.VarChar(36)

  academicYearSectionId String                 @map("academic_year_section_id") @db.VarChar(36)

  subjectId             String                 @map("subject_id") @db.VarChar(36)

  assignedByStaffId     String                 @map("assigned_by_staff_id") @db.VarChar(36)

  title                 String                 @db.VarChar(200)

  description           String                 @db.Text

  dueDate               DateTime               @map("due_date") @db.Date

  maxMarks              Decimal?               @map("max_marks") @db.Decimal(5, 2)

  createdAt             DateTime               @default(now()) @map("created_at")

  updatedAt             DateTime               @updatedAt @map("updated_at")

  section               AcademicYearSection    @relation( fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict )

  subject               Subject                @relation( fields: [schoolId, subjectId], references: [schoolId, id], onDelete: Restrict )

  assignedByStaff       Staff                  @relation( "HomeworkAssigner", fields: [schoolId, assignedByStaffId], references: [schoolId, id], onDelete: Restrict )

  attachments           HomeworkAttachment[]

  submissions           HomeworkSubmission[]

  @@unique([schoolId, id])

  @@index([schoolId, academicYearSectionId])

  @@index([schoolId, subjectId])

  @@index([schoolId, assignedByStaffId])

  @@index([schoolId, dueDate])

  @@map("homework")
}

model HomeworkAttachment {

  id           String     @id @default(uuid()) @db.VarChar(36)

  schoolId     String     @map("school_id") @db.VarChar(36)

  homeworkId   String     @map("homework_id") @db.VarChar(36)

  storedFileId String     @map("stored_file_id") @db.VarChar(36)

  createdAt    DateTime   @default(now()) @map("created_at")

  homework     Homework   @relation( fields: [schoolId, homeworkId], references: [schoolId, id], onDelete: Cascade )

  file         StoredFile @relation( fields: [storedFileId], references: [id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, homeworkId, storedFileId], map: "uq_homework_attachment" )

  @@index([schoolId, homeworkId])

  @@index([storedFileId])

  @@map("homework_attachments")
}

model HomeworkSubmission {

  id            String                         @id @default(uuid()) @db.VarChar(36)

  schoolId      String                         @map("school_id") @db.VarChar(36)

  homeworkId    String                         @map("homework_id") @db.VarChar(36)

  enrollmentId  String                         @map("enrollment_id") @db.VarChar(36)

  submittedAt   DateTime                       @default(now()) @map("submitted_at")

  marksObtained Decimal?                       @map("marks_obtained") @db.Decimal(5, 2)

  feedback      String?                        @db.Text

  status        String                         @default("SUBMITTED") @db.VarChar(30)
  // SUBMITTED, GRADED, RESUBMIT_REQUESTED

  createdAt     DateTime                       @default(now()) @map("created_at")

  updatedAt     DateTime                       @updatedAt @map("updated_at")

  homework      Homework                       @relation( fields: [schoolId, homeworkId], references: [schoolId, id], onDelete: Restrict )

  enrollment    Enrollment                     @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  attachments   HomeworkSubmissionAttachment[]

  @@unique([schoolId, id])

  @@unique( [schoolId, homeworkId, enrollmentId], map: "uq_homework_submission" )

  @@index([schoolId, homeworkId])

  @@index([schoolId, enrollmentId])

  @@index([schoolId, submittedAt])

  @@map("homework_submissions")
}

model HomeworkSubmissionAttachment {

  id           String             @id @default(uuid()) @db.VarChar(36)

  schoolId     String             @map("school_id") @db.VarChar(36)

  submissionId String             @map("submission_id") @db.VarChar(36)

  storedFileId String             @map("stored_file_id") @db.VarChar(36)

  createdAt    DateTime           @default(now()) @map("created_at")

  submission   HomeworkSubmission @relation( fields: [schoolId, submissionId], references: [schoolId, id], onDelete: Cascade )

  file         StoredFile         @relation( fields: [storedFileId], references: [id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, submissionId, storedFileId], map: "uq_submission_attachment" )

  @@index([schoolId, submissionId])

  @@index([storedFileId])

  @@map("homework_submission_attachments")
}

// ==========================================
// FEES
// ==========================================

model FeeStructure {

  id             String             @id @default(uuid()) @db.VarChar(36)

  schoolId       String             @map("school_id") @db.VarChar(36)

  classId        String             @map("class_id") @db.VarChar(36)

  academicYearId String             @map("academic_year_id") @db.VarChar(36)

  name           String             @db.VarChar(100)

  dueDate        DateTime           @map("due_date") @db.Date

  createdAt      DateTime           @default(now()) @map("created_at")

  updatedAt      DateTime           @updatedAt @map("updated_at")

  class          Class              @relation( fields: [schoolId, classId], references: [schoolId, id], onDelete: Restrict )

  academicYear   AcademicYear       @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  items          FeeStructureItem[]

  @@unique([schoolId, id])

  @@unique( [schoolId, academicYearId, classId, name], map: "uq_fee_structure" )

  @@index([schoolId, classId])

  @@index([schoolId, academicYearId])

  @@map("fee_structures")
}

model FeeStructureItem {

  id             String        @id @default(uuid()) @db.VarChar(36)

  schoolId       String        @map("school_id") @db.VarChar(36)

  feeStructureId String        @map("fee_structure_id") @db.VarChar(36)

  feeTypeId      String        @map("fee_type_id") @db.VarChar(36)

  amount         Decimal       @db.Decimal(10, 2)

  frequency      String        @default("MONTHLY") @db.VarChar(30)
  // ONETIME, MONTHLY, QUARTERLY, ANNUAL

  createdAt      DateTime      @default(now()) @map("created_at")

  updatedAt      DateTime      @updatedAt @map("updated_at")

  feeStructure   FeeStructure  @relation( fields: [schoolId, feeStructureId], references: [schoolId, id], onDelete: Restrict )

  feeType        FeeType       @relation( fields: [schoolId, feeTypeId], references: [schoolId, id], onDelete: Restrict )

  penaltyRules   PenaltyRule[]

  studentFees    StudentFee[]

  @@unique([schoolId, id])

  @@unique( [schoolId, feeStructureId, feeTypeId], map: "uq_fee_structure_item" )

  @@index([schoolId, feeStructureId])

  @@index([schoolId, feeTypeId])

  @@map("fee_structure_items")
}

model PenaltyRule {

  id                 String           @id @default(uuid()) @db.VarChar(36)

  schoolId           String           @map("school_id") @db.VarChar(36)

  feeStructureItemId String           @map("fee_structure_item_id") @db.VarChar(36)

  gracePeriodDays    Int              @default(7) @map("grace_period_days")

  penaltyType        String           @default("FIXED") @map("penalty_type") @db.VarChar(30)
  // FIXED, PERCENTAGE, DAILY

  penaltyAmount      Decimal          @map("penalty_amount") @db.Decimal(10, 2)

  maxPenaltyAmount   Decimal?         @map("max_penalty_amount") @db.Decimal(10, 2)

  createdAt          DateTime         @default(now()) @map("created_at")

  updatedAt          DateTime         @updatedAt @map("updated_at")

  item               FeeStructureItem @relation( fields: [schoolId, feeStructureItemId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, feeStructureItemId, penaltyType], map: "uq_fee_penalty_rule" )

  @@index([schoolId, feeStructureItemId])

  @@map("penalty_rules")
}

model StudentFee {

  id                 String                 @id @default(uuid()) @db.VarChar(36)

  schoolId           String                 @map("school_id") @db.VarChar(36)

  enrollmentId       String                 @map("enrollment_id") @db.VarChar(36)

  feeStructureItemId String                 @map("fee_structure_item_id") @db.VarChar(36)

  netAmount          Decimal                @map("net_amount") @db.Decimal(10, 2)

  paidAmount         Decimal                @default(0.00) @map("paid_amount") @db.Decimal(10, 2)

  balanceAmount      Decimal                @map("balance_amount") @db.Decimal(10, 2)

  status             String                 @default("PENDING") @db.VarChar(30)
  // PENDING, PARTIAL, PAID, OVERDUE, WAIVED

  dueDate            DateTime               @map("due_date") @db.Date

  createdAt          DateTime               @default(now()) @map("created_at")

  updatedAt          DateTime               @updatedAt @map("updated_at")

  enrollment         Enrollment             @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  feeStructureItem   FeeStructureItem       @relation( fields: [schoolId, feeStructureItemId], references: [schoolId, id], onDelete: Restrict )

  allocations        FeePaymentAllocation[]

  ledgerEntries      FeeLedgerEntry[]

  @@unique([schoolId, id])

  @@unique( [schoolId, enrollmentId, feeStructureItemId], map: "uq_student_fees_structure_item" )

  @@index([schoolId, enrollmentId])

  @@index([schoolId, feeStructureItemId])

  @@index([schoolId, status])

  @@index([schoolId, dueDate])

  @@map("student_fees")
}

model FeePaymentAllocation {

  id              String     @id @default(uuid()) @db.VarChar(36)

  schoolId        String     @map("school_id") @db.VarChar(36)

  feePaymentId    String     @map("fee_payment_id") @db.VarChar(36)

  studentFeeId    String     @map("student_fee_id") @db.VarChar(36)

  amountAllocated Decimal    @map("amount_allocated") @db.Decimal(10, 2)

  createdAt       DateTime   @default(now()) @map("created_at")

  payment         FeePayment @relation( fields: [schoolId, feePaymentId], references: [schoolId, id], onDelete: Restrict )

  studentFee      StudentFee @relation( fields: [schoolId, studentFeeId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, feePaymentId, studentFeeId], map: "uq_fee_payment_allocation" )

  @@index([schoolId, feePaymentId])

  @@index([schoolId, studentFeeId])

  @@map("fee_payment_allocations")
}

model FeeLedgerEntry {

  id             String     @id @default(uuid()) @db.VarChar(36)

  schoolId       String     @map("school_id") @db.VarChar(36)

  studentFeeId   String     @map("student_fee_id") @db.VarChar(36)

  sequenceNumber Int        @map("sequence_number")

  entryType      String     @map("entry_type") @db.VarChar(30)
  // INVOICE, PAYMENT, CONCESSION, REFUND, PENALTY, WAIVER

  debitAmount    Decimal    @default(0.00) @map("debit_amount") @db.Decimal(10, 2)

  creditAmount   Decimal    @default(0.00) @map("credit_amount") @db.Decimal(10, 2)

  balanceAfter   Decimal    @map("balance_after") @db.Decimal(10, 2)

  notes          String?    @db.VarChar(255)

  createdAt      DateTime   @default(now()) @map("created_at")

  studentFee     StudentFee @relation( fields: [schoolId, studentFeeId], references: [schoolId, id], onDelete: Restrict )

  @@unique( [schoolId, studentFeeId, sequenceNumber], map: "uq_fee_ledger_sequence" )

  @@index([schoolId, studentFeeId])

  @@map("fee_ledger_entries")
}

// ==========================================
// EXAMINATION
// ==========================================

model Exam {

  id             String            @id @default(uuid()) @db.VarChar(36)

  schoolId       String            @map("school_id") @db.VarChar(36)

  academicYearId String            @map("academic_year_id") @db.VarChar(36)

  examTypeId     String            @map("exam_type_id") @db.VarChar(36)

  name           String            @db.VarChar(100)

  startDate      DateTime          @map("start_date") @db.Date

  endDate        DateTime          @map("end_date") @db.Date

  status         String            @default("UPCOMING") @db.VarChar(30)
  // UPCOMING, ONGOING, COMPLETED, PUBLISHED, CANCELLED

  createdAt      DateTime          @default(now()) @map("created_at")

  updatedAt      DateTime          @updatedAt @map("updated_at")

  academicYear   AcademicYear      @relation( fields: [schoolId, academicYearId], references: [schoolId, id], onDelete: Restrict )

  examType       ExamType          @relation( fields: [schoolId, examTypeId], references: [schoolId, id], onDelete: Restrict )

  subjects       ExamSubject[]

  tabulations    TabulationSheet[]

  @@unique([schoolId, id])

  @@unique( [schoolId, academicYearId, name], map: "uq_exam_name_year" )

  @@index([schoolId, academicYearId])

  @@index([schoolId, examTypeId])

  @@index([schoolId, startDate])

  @@map("exams")
}

model ExamSubject {

  id        String     @id @default(uuid()) @db.VarChar(36)

  schoolId  String     @map("school_id") @db.VarChar(36)

  examId    String     @map("exam_id") @db.VarChar(36)

  classId   String     @map("class_id") @db.VarChar(36)

  subjectId String     @map("subject_id") @db.VarChar(36)

  examDate  DateTime   @map("exam_date") @db.Date

  maxMarks  Decimal    @default(100.0) @map("max_marks") @db.Decimal(5, 2)

  passMarks Decimal    @default(40.0) @map("pass_marks") @db.Decimal(5, 2)

  createdAt DateTime   @default(now()) @map("created_at")

  updatedAt DateTime   @updatedAt @map("updated_at")

  exam      Exam       @relation( fields: [schoolId, examId], references: [schoolId, id], onDelete: Restrict )

  class     Class      @relation( fields: [schoolId, classId], references: [schoolId, id], onDelete: Restrict )

  subject   Subject    @relation( fields: [schoolId, subjectId], references: [schoolId, id], onDelete: Restrict )

  marks     ExamMark[]

  @@unique([schoolId, id])

  @@unique( [schoolId, examId, classId, subjectId], map: "uq_exam_subject" )

  @@index([schoolId, examId])

  @@index([schoolId, classId])

  @@index([schoolId, subjectId])

  @@map("exam_subjects")
}

model ExamMark {

  id            String      @id @default(uuid()) @db.VarChar(36)

  schoolId      String      @map("school_id") @db.VarChar(36)

  examSubjectId String      @map("exam_subject_id") @db.VarChar(36)

  enrollmentId  String      @map("enrollment_id") @db.VarChar(36)

  marksObtained Decimal?    @map("marks_obtained") @db.Decimal(5, 2)

  isAbsent      Boolean     @default(false) @map("is_absent")

  grade         String?     @db.VarChar(10)

  remarks       String?     @db.VarChar(255)

  createdAt     DateTime    @default(now()) @map("created_at")

  updatedAt     DateTime    @updatedAt @map("updated_at")

  examSubject   ExamSubject @relation( fields: [schoolId, examSubjectId], references: [schoolId, id], onDelete: Restrict )

  enrollment    Enrollment  @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, examSubjectId, enrollmentId], map: "uq_exam_mark" )

  @@index([schoolId, examSubjectId])

  @@index([schoolId, enrollmentId])

  @@map("exam_marks")
}

model TabulationSheet {

  id                    String              @id @default(uuid()) @db.VarChar(36)

  schoolId              String              @map("school_id") @db.VarChar(36)

  examId                String              @map("exam_id") @db.VarChar(36)

  academicYearSectionId String              @map("academic_year_section_id") @db.VarChar(36)

  status                String              @default("DRAFT") @db.VarChar(30)
  // DRAFT, GENERATED, VERIFIED, PUBLISHED

  generatedAt           DateTime            @default(now()) @map("generated_at")

  createdAt             DateTime            @default(now()) @map("created_at")

  updatedAt             DateTime            @updatedAt @map("updated_at")

  exam                  Exam                @relation( fields: [schoolId, examId], references: [schoolId, id], onDelete: Restrict )

  section               AcademicYearSection @relation( fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, examId, academicYearSectionId], map: "uq_tabulation_exam_section" )

  @@index([schoolId, examId])

  @@index([schoolId, academicYearSectionId])

  @@map("tabulation_sheets")
}

model ReportCard {

  id           String               @id @default(uuid()) @db.VarChar(36)

  schoolId     String               @map("school_id") @db.VarChar(36)

  enrollmentId String               @map("enrollment_id") @db.VarChar(36)

  totalMarks   Decimal              @map("total_marks") @db.Decimal(7, 2)

  percentage   Decimal              @db.Decimal(5, 2)

  gpa          Decimal?             @db.Decimal(4, 2)

  rank         Int?

  status       String               @default("PUBLISHED") @db.VarChar(30)
  // DRAFT, GENERATED, VERIFIED, PUBLISHED

  publishedAt  DateTime?            @map("published_at")

  createdAt    DateTime             @default(now()) @map("created_at")

  updatedAt    DateTime             @updatedAt @map("updated_at")

  enrollment   Enrollment           @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  snapshot     ReportCardSnapshot?

  @@unique([schoolId, id])

  @@unique( [schoolId, enrollmentId], map: "uq_report_card_enrollment" )

  @@index([schoolId, enrollmentId])

  @@map("report_cards")
}

model ReportCardSnapshot {

  id           String     @id @default(uuid()) @db.VarChar(36)

  schoolId     String     @map("school_id") @db.VarChar(36)

  reportCardId String     @map("report_card_id") @db.VarChar(36)

  snapshotJson String     @map("snapshot_json") @db.LongText

  hash         String     @db.VarChar(128)

  createdAt    DateTime   @default(now()) @map("created_at")

  reportCard   ReportCard @relation( fields: [schoolId, reportCardId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, reportCardId], map: "uq_report_card_snapshot" )

  @@index([schoolId, reportCardId])

  @@map("report_card_snapshots")
}

// ==========================================
// TIMETABLE
// ==========================================

model Timetable {

  id                    String              @id @default(uuid()) @db.VarChar(36)

  schoolId              String              @map("school_id") @db.VarChar(36)

  academicYearSectionId String              @map("academic_year_section_id") @db.VarChar(36)

  effectiveFrom         DateTime            @map("effective_from") @db.Date

  effectiveTo           DateTime?           @map("effective_to") @db.Date

  isActive              Boolean             @default(true) @map("is_active")

  createdAt             DateTime            @default(now()) @map("created_at")

  updatedAt             DateTime            @updatedAt @map("updated_at")

  section               AcademicYearSection @relation( fields: [schoolId, academicYearSectionId], references: [schoolId, id], onDelete: Restrict )

  slots                 TimetableSlot[]

  @@unique([schoolId, id])

  @@index([schoolId, academicYearSectionId])

  @@index([schoolId, isActive])

  @@map("timetables")
}

model TimetableSlot {

  id            String                @id @default(uuid()) @db.VarChar(36)

  schoolId      String                @map("school_id") @db.VarChar(36)

  timetableId   String                @map("timetable_id") @db.VarChar(36)

  periodId      String                @map("period_id") @db.VarChar(36)

  subjectId     String                @map("subject_id") @db.VarChar(36)

  staffId       String                @map("staff_id") @db.VarChar(36)

  roomId        String?               @map("room_id") @db.VarChar(36)

  dayOfWeek     String                @map("day_of_week") @db.VarChar(15)

  createdAt     DateTime              @default(now()) @map("created_at")

  updatedAt     DateTime              @updatedAt @map("updated_at")

  timetable     Timetable             @relation( fields: [schoolId, timetableId], references: [schoolId, id], onDelete: Cascade )

  period        PeriodDefinition      @relation( fields: [schoolId, periodId], references: [schoolId, id], onDelete: Restrict )

  subject       Subject               @relation( fields: [schoolId, subjectId], references: [schoolId, id], onDelete: Restrict )

  staff         Staff                 @relation( "StaffTimetableSlot", fields: [schoolId, staffId], references: [schoolId, id], onDelete: Restrict )

  room          Room?                 @relation( fields: [schoolId, roomId], references: [schoolId, id], onDelete: Restrict )

  substitutions TeacherSubstitution[]

  @@unique([schoolId, id])

  @@unique( [schoolId, timetableId, periodId, dayOfWeek], map: "uq_timetable_slot" )

  @@index([schoolId, timetableId])

  @@index([schoolId, periodId])

  @@index([schoolId, subjectId])

  @@index([schoolId, staffId])

  @@index([schoolId, roomId])

  @@map("timetable_slots")
}

model TeacherSubstitution {

  id                String        @id @default(uuid()) @db.VarChar(36)

  schoolId          String        @map("school_id") @db.VarChar(36)

  slotId            String        @map("slot_id") @db.VarChar(36)

  substituteStaffId String        @map("substitute_staff_id") @db.VarChar(36)

  substitutionDate  DateTime      @map("substitution_date") @db.Date

  reason            String?       @db.VarChar(255)

  status            String        @default("CONFIRMED") @db.VarChar(30)
  // REQUESTED, CONFIRMED, CANCELLED

  createdAt          DateTime      @default(now()) @map("created_at")

  updatedAt          DateTime      @updatedAt @map("updated_at")

  slot              TimetableSlot @relation( fields: [schoolId, slotId], references: [schoolId, id], onDelete: Restrict )

  substituteStaff   Staff         @relation( "SubstituteStaff", fields: [schoolId, substituteStaffId], references: [schoolId, id], onDelete: Restrict )

  @@unique( [schoolId, slotId, substitutionDate], map: "uq_teacher_substitution" )

  @@index([schoolId, slotId])

  @@index([schoolId, substituteStaffId])

  @@index([schoolId, substitutionDate])

  @@map("teacher_substitutions")
}

// ==========================================
// LIBRARY
// ==========================================

model BookIssue {

  id            String        @id @default(uuid()) @db.VarChar(36)

  schoolId      String        @map("school_id") @db.VarChar(36)

  bookCopyId    String        @map("book_copy_id") @db.VarChar(36)

  memberId      String        @map("member_id") @db.VarChar(36)

  issueDate     DateTime      @map("issue_date") @db.Date

  dueDate       DateTime      @map("due_date") @db.Date

  returnedAt    DateTime?     @map("returned_at")

  status        String        @default("ISSUED") @db.VarChar(30)
  // ISSUED, RETURNED, OVERDUE, LOST

  activeCopyKey String?       @map("active_copy_key") @db.VarChar(36)

  createdAt      DateTime      @default(now()) @map("created_at")

  updatedAt      DateTime      @updatedAt @map("updated_at")

  copy          BookCopy      @relation( fields: [schoolId, bookCopyId], references: [schoolId, id], onDelete: Restrict )

  member        LibraryMember @relation( fields: [schoolId, memberId], references: [schoolId, id], onDelete: Restrict )

  fines         LibraryFine[]

  @@unique([schoolId, id])

  // activeCopyKey must be NULL when the book is returned.
  // This creates one active loan per physical copy.

  @@unique( [schoolId, activeCopyKey], map: "uq_library_active_loan" )

  @@index([schoolId, bookCopyId])

  @@index([schoolId, memberId])

  @@index([schoolId, status])

  @@index([schoolId, dueDate])

  @@map("book_issues")
}

model LibraryFine {

  id          String    @id @default(uuid()) @db.VarChar(36)

  schoolId    String    @map("school_id") @db.VarChar(36)

  bookIssueId String    @map("book_issue_id") @db.VarChar(36)

  fineAmount  Decimal   @map("fine_amount") @db.Decimal(10, 2)

  paidAmount  Decimal   @default(0.00) @map("paid_amount") @db.Decimal(10, 2)

  status      String    @default("UNPAID") @db.VarChar(30)
  // UNPAID, PARTIAL, PAID, WAIVED

  paidAt      DateTime? @map("paid_at")

  createdAt   DateTime  @default(now()) @map("created_at")

  updatedAt   DateTime  @updatedAt @map("updated_at")

  issue       BookIssue @relation( fields: [schoolId, bookIssueId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@index([schoolId, bookIssueId])

  @@index([schoolId, status])

  @@map("library_fines")
}

// ==========================================
// TRANSPORT
// ==========================================

model TransportAllocation {

  id           String     @id @default(uuid()) @db.VarChar(36)

  schoolId     String     @map("school_id") @db.VarChar(36)

  enrollmentId String     @map("enrollment_id") @db.VarChar(36)

  routeStopId  String     @map("route_stop_id") @db.VarChar(36)

  vehicleId    String     @map("vehicle_id") @db.VarChar(36)

  seatNumber   String?    @map("seat_number") @db.VarChar(20)

  startDate    DateTime   @map("start_date") @db.Date

  endDate      DateTime?  @map("end_date") @db.Date

  status       String     @default("ACTIVE") @db.VarChar(30)
  // ACTIVE, ENDED, CANCELLED

  createdAt    DateTime   @default(now()) @map("created_at")

  updatedAt    DateTime   @updatedAt @map("updated_at")

  enrollment   Enrollment @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  stop         RouteStop  @relation( fields: [schoolId, routeStopId], references: [schoolId, id], onDelete: Restrict )

  vehicle      Vehicle    @relation( fields: [schoolId, vehicleId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, enrollmentId], map: "uq_transport_enrollment" )

  @@index([schoolId, enrollmentId])

  @@index([schoolId, routeStopId])

  @@index([schoolId, vehicleId])

  @@index([schoolId, status])

  @@map("transport_allocations")
}

model TransportTrip {

  id          String                    @id @default(uuid()) @db.VarChar(36)

  schoolId    String                    @map("school_id") @db.VarChar(36)

  routeId     String                    @map("route_id") @db.VarChar(36)

  vehicleId   String                    @map("vehicle_id") @db.VarChar(36)

  driverId    String                    @map("driver_id") @db.VarChar(36)

  tripType    String                    @map("trip_type") @db.VarChar(30)
  // MORNING_PICKUP, EVENING_DROP

  tripDate    DateTime                  @map("trip_date") @db.Date

  startTime   String?                   @map("start_time") @db.VarChar(10)

  endTime     String?                   @map("end_time") @db.VarChar(10)

  status      String                    @default("SCHEDULED") @db.VarChar(30)
  // SCHEDULED, STARTED, COMPLETED, CANCELLED

  createdAt   DateTime                  @default(now()) @map("created_at")

  updatedAt   DateTime                  @updatedAt @map("updated_at")

  route       Route                     @relation( fields: [schoolId, routeId], references: [schoolId, id], onDelete: Restrict )

  vehicle     Vehicle                   @relation( fields: [schoolId, vehicleId], references: [schoolId, id], onDelete: Restrict )

  driver      Driver                    @relation( fields: [schoolId, driverId], references: [schoolId, id], onDelete: Restrict )

  attendance  TransportTripAttendance[]

  @@unique([schoolId, id])

  @@unique( [schoolId, routeId, vehicleId, tripType, tripDate], map: "uq_transport_trip" )

  @@index([schoolId, routeId])

  @@index([schoolId, vehicleId])

  @@index([schoolId, driverId])

  @@index([schoolId, tripDate])

  @@map("transport_trips")
}

model TransportTripAttendance {

  id           String        @id @default(uuid()) @db.VarChar(36)

  schoolId     String        @map("school_id") @db.VarChar(36)

  tripId       String        @map("trip_id") @db.VarChar(36)

  enrollmentId String        @map("enrollment_id") @db.VarChar(36)

  boardedAt    DateTime?     @map("boarded_at")

  droppedAt    DateTime?     @map("dropped_at")

  isPresent    Boolean       @default(true) @map("is_present")

  createdAt    DateTime      @default(now()) @map("created_at")

  updatedAt    DateTime      @updatedAt @map("updated_at")

  trip         TransportTrip @relation( fields: [schoolId, tripId], references: [schoolId, id], onDelete: Restrict )

  enrollment   Enrollment    @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, tripId, enrollmentId], map: "uq_transport_trip_attendance" )

  @@index([schoolId, tripId])

  @@index([schoolId, enrollmentId])

  @@map("transport_trip_attendance")
}

// ==========================================
// HOSTEL
// ==========================================

model HostelAllocation {

  id                  String             @id @default(uuid()) @db.VarChar(36)

  schoolId            String             @map("school_id") @db.VarChar(36)

  enrollmentId        String             @map("enrollment_id") @db.VarChar(36)

  bedId               String             @map("bed_id") @db.VarChar(36)

  startDate           DateTime           @map("start_date") @db.Date

  endDate             DateTime?          @map("end_date") @db.Date

  status              String             @default("ACTIVE") @db.VarChar(30)
  // ACTIVE, ENDED, CANCELLED

  activeBedKey        String?            @map("active_bed_key") @db.VarChar(36)

  activeEnrollmentKey String?            @map("active_enrollment_key") @db.VarChar(36)

  createdAt           DateTime           @default(now()) @map("created_at")

  updatedAt           DateTime           @updatedAt @map("updated_at")

  enrollment          Enrollment         @relation( fields: [schoolId, enrollmentId], references: [schoolId, id], onDelete: Restrict )

  bed                 HostelBed          @relation( fields: [schoolId, bedId], references: [schoolId, id], onDelete: Restrict )

  attendanceLogs      HostelAttendance[]

  visitors            HostelVisitor[]

  @@unique([schoolId, id])

  // Application must set these keys to NULL when allocation ends.
  // This enforces one active occupant per bed and one active bed per enrollment.

  @@unique( [schoolId, activeBedKey], map: "uq_hostel_active_bed" )

  @@unique( [schoolId, activeEnrollmentKey], map: "uq_hostel_active_occupant" )

  @@index([schoolId, enrollmentId])

  @@index([schoolId, bedId])

  @@index([schoolId, status])

  @@map("hostel_allocations")
}

model HostelAttendance {

  id                 String           @id @default(uuid()) @db.VarChar(36)

  schoolId           String           @map("school_id") @db.VarChar(36)

  hostelAllocationId String           @map("hostel_allocation_id") @db.VarChar(36)

  checkDate          DateTime         @map("check_date") @db.Date

  isPresent          Boolean          @default(true) @map("is_present")

  remarks            String?          @db.VarChar(255)

  createdAt          DateTime         @default(now()) @map("created_at")

  updatedAt          DateTime         @updatedAt @map("updated_at")

  allocation         HostelAllocation @relation( fields: [schoolId, hostelAllocationId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@unique( [schoolId, hostelAllocationId, checkDate], map: "uq_hostel_attendance" )

  @@index([schoolId, hostelAllocationId])

  @@index([schoolId, checkDate])

  @@map("hostel_attendance")
}

model HostelVisitor {

  id                 String           @id @default(uuid()) @db.VarChar(36)

  schoolId           String           @map("school_id") @db.VarChar(36)

  hostelAllocationId String           @map("hostel_allocation_id") @db.VarChar(36)

  visitorName        String           @map("visitor_name") @db.VarChar(150)

  relationship       String           @db.VarChar(50)

  phone              String           @db.VarChar(30)

  visitDate          DateTime         @map("visit_date") @db.Date

  inTime             String           @map("in_time") @db.VarChar(10)

  outTime            String?          @map("out_time") @db.VarChar(10)

  idProofType        String?          @map("id_proof_type") @db.VarChar(50)

  idProofNumber      String?          @map("id_proof_number") @db.VarChar(100)

  remarks            String?          @db.VarChar(255)

  createdAt          DateTime         @default(now()) @map("created_at")

  updatedAt          DateTime         @updatedAt @map("updated_at")

  allocation         HostelAllocation @relation( fields: [schoolId, hostelAllocationId], references: [schoolId, id], onDelete: Restrict )

  @@unique([schoolId, id])

  @@index([schoolId, hostelAllocationId])

  @@index([schoolId, visitDate])

  @@map("hostel_visitors")
}

`;
