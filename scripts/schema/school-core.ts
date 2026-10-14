// Module 2: School Core Scope (31 Tables)

export const schoolCoreSchema = `
// ==========================================
// 4. SCHOOL CORE SCOPE (31 Tables)
// ==========================================

model School {
  id          String    @id @default(uuid()) @db.VarChar(36)
  name        String    @db.VarChar(150)
  code        String    @unique @db.VarChar(50)
  domain      String?   @unique @db.VarChar(100)
  address     String    @db.Text
  city        String    @db.VarChar(100)
  state       String    @db.VarChar(100)
  country     String    @default("US") @db.VarChar(50)
  postalCode  String    @map("postal_code") @db.VarChar(20)
  phone       String    @db.VarChar(30)
  email       String    @db.VarChar(191)
  currency    String    @default("USD") @db.VarChar(3)
  timezone    String    @default("UTC") @db.VarChar(50)
  logoUrl     String?   @map("logo_url") @db.VarChar(500)
  status      String    @default("ACTIVE") @db.VarChar(30)
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  subscriptions          Subscription[]
  subscriptionInvoices   SubscriptionInvoice[]
  paymentWebhookEvents   PaymentWebhookEvent[]
  storedFiles            StoredFile[]
  settings               SchoolSetting[]
  academicYears          AcademicYear[]
  roles                  Role[]
  schoolUsers            SchoolUser[]
  students               Student[]
  classes                Class[]
  subjects               Subject[]
  feeTypes               FeeType[]
  feePayments            FeePayment[]
  gradingScales          GradingScale[]
  examTypes              ExamType[]
  rooms                  Room[]
  periodDefinitions      PeriodDefinition[]
  departments            Department[]
  designations           Designation[]
  staffMembers           Staff[]
  leaveTypes             LeaveType[]
  books                  Book[]
  libraryMembers         LibraryMember[]
  digitalBooks           DigitalBook[]
  vehicles               Vehicle[]
  drivers                Driver[]
  routes                 Route[]
  hostelBlocks           HostelBlock[]
  assetCategories        AssetCategory[]
  fixedAssets            FixedAsset[]
  vendors                Vendor[]
  purchaseOrders         PurchaseOrder[]
  expenseCategories      ExpenseCategory[]
  announcements          Announcement[]
  events                 Event[]
  internalConversations  InternalConversation[]
  notificationTemplates  NotificationTemplate[]
  notifications          Notification[]
  activityLogs           ActivityLog[]
  historicalChangeRecords HistoricalChangeRecord[]
  enrollments            Enrollment[]
  promotionBatches       PromotionBatch[]

  @@map("schools")
}

model SchoolSetting {
  id           String   @id @default(uuid()) @db.VarChar(36)
  schoolId     String   @map("school_id") @db.VarChar(36)
  settingKey   String   @map("setting_key") @db.VarChar(100)
  settingValue String   @map("setting_value") @db.Text
  dataType     String   @default("STRING") @map("data_type") @db.VarChar(30)
  isEncrypted  Boolean  @default(false) @map("is_encrypted")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  school       School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@unique([schoolId, settingKey])
  @@map("school_settings")
}

model AcademicYear {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  startDate   DateTime @map("start_date") @db.Date
  endDate     DateTime @map("end_date") @db.Date
  isCurrent   Boolean  @default(false) @map("is_current")
  status      String   @default("UPCOMING") @db.VarChar(30) // UPCOMING, ACTIVE, CLOSED
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school                 School                  @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  academicYearSections   AcademicYearSection[]
  enrollments            Enrollment[]
  promotionBatches       PromotionBatch[]
  feeStructures          FeeStructure[]
  exams                  Exam[]
  syllabi                Syllabus[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("academic_years")
}

model Role {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  description String?  @db.VarChar(255)
  isSystem    Boolean  @default(false) @map("is_system")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school          School             @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  rolePermissions RolePermission[]
  userSchoolRoles UserSchoolRole[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("roles")
}

model RolePermission {
  id           String     @id @default(uuid()) @db.VarChar(36)
  schoolId     String     @map("school_id") @db.VarChar(36)
  roleId       String     @map("role_id") @db.VarChar(36)
  permissionId String     @map("permission_id") @db.VarChar(36)
  createdAt    DateTime   @default(now()) @map("created_at")

  role         Role       @relation(fields: [schoolId, roleId], references: [schoolId, id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Restrict)

  @@unique([schoolId, roleId, permissionId])
  @@index([schoolId, roleId])
  @@index([permissionId])
  @@map("role_permissions")
}

model SchoolUser {
  id        String    @id @default(uuid()) @db.VarChar(36)
  schoolId  String    @map("school_id") @db.VarChar(36)
  userId    String    @map("user_id") @db.VarChar(36)
  status    String    @default("ACTIVE") @db.VarChar(30)
  joinedAt  DateTime  @default(now()) @map("joined_at")
  leftAt    DateTime? @map("left_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  school    School           @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userRoles UserSchoolRole[]

  @@unique([schoolId, id])
  @@unique([schoolId, userId])
  @@index([schoolId])
  @@index([userId])
  @@map("school_users")
}

model UserSchoolRole {
  id           String     @id @default(uuid()) @db.VarChar(36)
  schoolId     String     @map("school_id") @db.VarChar(36)
  schoolUserId String     @map("school_user_id") @db.VarChar(36)
  roleId       String     @map("role_id") @db.VarChar(36)
  createdAt    DateTime   @default(now()) @map("created_at")

  schoolUser   SchoolUser @relation(fields: [schoolId, schoolUserId], references: [schoolId, id], onDelete: Cascade)
  role         Role       @relation(fields: [schoolId, roleId], references: [schoolId, id], onDelete: Cascade)

  @@unique([schoolId, schoolUserId, roleId])
  @@index([schoolId, schoolUserId])
  @@index([schoolId, roleId])
  @@map("user_school_roles")
}

model Student {
  id                         String    @id @default(uuid()) @db.VarChar(36)
  schoolId                   String    @map("school_id") @db.VarChar(36)
  studentIdentityId          String    @map("student_identity_id") @db.VarChar(36)
  userId                     String?   @map("user_id") @db.VarChar(36)
  admissionNumber            String    @map("admission_number") @db.VarChar(64)
  registrationId             String?   @map("registration_id") @db.VarChar(64)
  firstName                  String    @map("first_name") @db.VarChar(100)
  middleName                 String?   @map("middle_name") @db.VarChar(100)
  lastName                   String    @map("last_name") @db.VarChar(100)
  photoUrl                   String?   @map("photo_url") @db.VarChar(500)
  gender                     String    @db.VarChar(20)
  dateOfBirth                DateTime  @map("date_of_birth") @db.Date
  bloodGroup                 String?   @map("blood_group") @db.VarChar(10)
  specialCategory            String?   @map("special_category") @db.VarChar(100)
  specialCategoryDetails     String?   @map("special_category_details") @db.Text
  nationality                String?   @default("Indian") @db.VarChar(50)
  religion                   String?   @db.VarChar(50)
  category                   String?   @db.VarChar(50)
  motherTongue               String?   @map("mother_tongue") @db.VarChar(50)
  placeOfBirth               String?   @map("place_of_birth") @db.VarChar(100)
  governmentId               String?   @map("government_id") @db.VarChar(100)
  mobile                     String?   @db.VarChar(30)
  alternateMobile            String?   @map("alternate_mobile") @db.VarChar(30)
  email                      String?   @db.VarChar(191)
  address                    String    @db.Text
  addressLine1               String?   @map("address_line1") @db.VarChar(255)
  addressLine2               String?   @map("address_line2") @db.VarChar(255)
  city                       String    @db.VarChar(100)
  state                      String    @db.VarChar(100)
  country                    String?   @default("India") @db.VarChar(100)
  postalCode                 String    @map("postal_code") @db.VarChar(20)
  previousSchool             String?   @map("previous_school") @db.VarChar(200)
  previousClass              String?   @map("previous_class") @db.VarChar(50)
  previousSchoolBoard        String?   @map("previous_school_board") @db.VarChar(100)
  transferCertificateNumber  String?   @map("transfer_certificate_number") @db.VarChar(100)
  transferCertificateDate    DateTime? @map("transfer_certificate_date") @db.Date
  notes                      String?   @db.Text
  status                     String    @default("ACTIVE") @db.VarChar(30)
  emergencyContact           String    @map("emergency_contact") @db.VarChar(100)
  emergencyPhone             String    @map("emergency_phone") @db.VarChar(30)
  activeAdmissionNumber      String?   @map("active_admission_number") @db.VarChar(64)
  deletedAt                  DateTime? @map("deleted_at")
  createdAt                  DateTime  @default(now()) @map("created_at")
  updatedAt                  DateTime  @updatedAt @map("updated_at")

  school                School                @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  identity              StudentIdentity       @relation(fields: [studentIdentityId], references: [id], onDelete: Restrict)
  user                  User?                 @relation(fields: [userId], references: [id], onDelete: SetNull)
  documents             StudentDocument[]
  parents               ParentStudent[]
  enrollments           Enrollment[]
  transferCertificates  TransferCertificate[]
  feeConcessions        FeeConcession[]

  @@unique([schoolId, id])
  @@unique([schoolId, activeAdmissionNumber], map: "uq_students_active_admission")
  @@unique([schoolId, registrationId], map: "uq_students_registration_id")
  @@index([schoolId])
  @@index([studentIdentityId])
  @@index([userId])
  @@map("students")
}

model StudentDocument {
  id             String     @id @default(uuid()) @db.VarChar(36)
  schoolId       String     @map("school_id") @db.VarChar(36)
  studentId      String     @map("student_id") @db.VarChar(36)
  storedFileId   String     @map("stored_file_id") @db.VarChar(36)
  documentType   String     @map("document_type") @db.VarChar(50)
  documentNumber String?    @map("document_number") @db.VarChar(100)
  verifiedAt     DateTime?  @map("verified_at")
  createdAt      DateTime   @default(now()) @map("created_at")

  student        Student    @relation(fields: [schoolId, studentId], references: [schoolId, id], onDelete: Cascade)
  storedFile     StoredFile @relation(fields: [storedFileId], references: [id], onDelete: Restrict)

  @@index([schoolId, studentId])
  @@index([storedFileId])
  @@map("student_documents")
}

model TransferCertificate {
  id                String   @id @default(uuid()) @db.VarChar(36)
  schoolId          String   @map("school_id") @db.VarChar(36)
  studentId         String   @map("student_id") @db.VarChar(36)
  certificateNumber String   @map("certificate_number") @db.VarChar(100)
  issueDate         DateTime @map("issue_date") @db.Date
  reasonForLeaving  String   @map("reason_for_leaving") @db.Text
  conductRemarks    String?  @map("conduct_remarks") @db.VarChar(255)
  status            String   @default("ISSUED") @db.VarChar(30)
  createdAt         DateTime @default(now()) @map("created_at")

  student           Student  @relation(fields: [schoolId, studentId], references: [schoolId, id], onDelete: Restrict)

  @@unique([schoolId, certificateNumber])
  @@index([schoolId, studentId])
  @@map("transfer_certificates")
}

model ParentStudent {
  id               String   @id @default(uuid()) @db.VarChar(36)
  schoolId         String   @map("school_id") @db.VarChar(36)
  parentId         String   @map("parent_id") @db.VarChar(36)
  studentId        String   @map("student_id") @db.VarChar(36)
  relationship     String   @db.VarChar(50) // FATHER, MOTHER, GUARDIAN
  isPrimaryContact Boolean  @default(true) @map("is_primary_contact")
  canPickup        Boolean  @default(true) @map("can_pickup")
  createdAt        DateTime @default(now()) @map("created_at")

  parent           Parent   @relation(fields: [parentId], references: [id], onDelete: Restrict)
  student          Student  @relation(fields: [schoolId, studentId], references: [schoolId, id], onDelete: Cascade)

  @@unique([schoolId, parentId, studentId])
  @@index([parentId])
  @@index([schoolId, studentId])
  @@map("parent_students")
}

model Class {
  id           String        @id @default(uuid()) @db.VarChar(36)
  schoolId     String        @map("school_id") @db.VarChar(36)
  name         String        @db.VarChar(100)
  code         String        @db.VarChar(50)
  numericOrder Int           @map("numeric_order")
  stream       String?       @db.VarChar(50) // SCIENCE, ARTS, COMMERCE
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  school               School                @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  academicYearSections AcademicYearSection[]
  classSubjects        ClassSubject[]
  feeStructures        FeeStructure[]
  examSubjects         ExamSubject[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("classes")
}

model Subject {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  subjectType String   @default("THEORY") @map("subject_type") @db.VarChar(30)
  credits     Decimal  @default(1.0) @db.Decimal(4, 2)
  isElective  Boolean  @default(false) @map("is_elective")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school             School              @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  classSubjects      ClassSubject[]
  teacherAssignments TeacherAssignment[]
  homeworkList       Homework[]
  examSubjects       ExamSubject[]
  timetableSlots     TimetableSlot[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("subjects")
}

model ClassSubject {
  id            String   @id @default(uuid()) @db.VarChar(36)
  schoolId      String   @map("school_id") @db.VarChar(36)
  classId       String   @map("class_id") @db.VarChar(36)
  subjectId     String   @map("subject_id") @db.VarChar(36)
  isMandatory   Boolean  @default(true) @map("is_mandatory")
  weeklyPeriods Int      @default(4) @map("weekly_periods")
  createdAt     DateTime @default(now()) @map("created_at")

  class         Class    @relation(fields: [schoolId, classId], references: [schoolId, id], onDelete: Restrict)
  subject       Subject  @relation(fields: [schoolId, subjectId], references: [schoolId, id], onDelete: Restrict)
  syllabi       Syllabus[]

  @@unique([schoolId, id])
  @@unique([schoolId, classId, subjectId])
  @@index([schoolId, classId])
  @@index([schoolId, subjectId])
  @@map("class_subjects")
}

model FeeType {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  description String?  @db.VarChar(255)
  isRecurring Boolean  @default(true) @map("is_recurring")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school             School             @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  feeStructureItems  FeeStructureItem[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("fee_types")
}

model FeeConcession {
  id             String    @id @default(uuid()) @db.VarChar(36)
  schoolId       String    @map("school_id") @db.VarChar(36)
  studentId      String    @map("student_id") @db.VarChar(36)
  concessionType String    @map("concession_type") @db.VarChar(50)
  amount         Decimal?  @db.Decimal(10, 2)
  percentage     Decimal?  @db.Decimal(5, 2)
  reason         String    @db.VarChar(255)
  status         String    @default("PENDING") @db.VarChar(30)
  approvedAt     DateTime? @map("approved_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  student        Student   @relation(fields: [schoolId, studentId], references: [schoolId, id], onDelete: Restrict)

  @@unique([schoolId, id])
  @@index([schoolId, studentId])
  @@map("fee_concessions")
}

model FeePayment {
  id                   String                 @id @default(uuid()) @db.VarChar(36)
  schoolId             String                 @map("school_id") @db.VarChar(36)
  collectedByStaffId   String?                @map("collected_by_staff_id") @db.VarChar(36)
  receiptNumber        String                 @map("receipt_number") @db.VarChar(64)
  amount               Decimal                @db.Decimal(10, 2)
  paymentMode          String                 @map("payment_mode") @db.VarChar(50)
  transactionReference String?                @map("transaction_reference") @db.VarChar(100)
  paymentDate          DateTime               @default(now()) @map("payment_date")
  remarks              String?                @db.VarChar(255)
  status               String                 @default("COMPLETED") @db.VarChar(30)
  createdAt            DateTime               @default(now()) @map("created_at")

  school               School                 @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  collectedBy          Staff?                 @relation("FeePaymentCollector", fields: [schoolId, collectedByStaffId], references: [schoolId, id], onDelete: Restrict)
  allocations          FeePaymentAllocation[]
  refunds              FeeRefund[]

  @@unique([schoolId, id])
  @@unique([schoolId, receiptNumber], map: "uq_fee_payments_receipt")
  @@index([schoolId])
  @@index([schoolId, collectedByStaffId])
  @@map("fee_payments")
}

model FeeRefund {
  id           String     @id @default(uuid()) @db.VarChar(36)
  schoolId     String     @map("school_id") @db.VarChar(36)
  feePaymentId String     @map("fee_payment_id") @db.VarChar(36)
  refundAmount Decimal    @map("refund_amount") @db.Decimal(10, 2)
  reason       String     @db.VarChar(255)
  refundMode   String     @map("refund_mode") @db.VarChar(50)
  approvedAt   DateTime   @default(now()) @map("approved_at")
  createdAt    DateTime   @default(now()) @map("created_at")

  feePayment   FeePayment @relation(fields: [schoolId, feePaymentId], references: [schoolId, id], onDelete: Restrict)

  @@unique([schoolId, id])
  @@index([schoolId, feePaymentId])
  @@map("fee_refunds")
}

model GradingScale {
  id            String   @id @default(uuid()) @db.VarChar(36)
  schoolId      String   @map("school_id") @db.VarChar(36)
  name          String   @db.VarChar(50) // A+, A, B
  code          String   @db.VarChar(20)
  minPercentage Decimal  @map("min_percentage") @db.Decimal(5, 2)
  maxPercentage Decimal  @map("max_percentage") @db.Decimal(5, 2)
  gradePoint    Decimal  @map("grade_point") @db.Decimal(4, 2)
  description   String?  @db.VarChar(100)
  createdAt     DateTime @default(now()) @map("created_at")

  school        School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("grading_scales")
}

model ExamType {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  weightage   Decimal  @default(100.0) @db.Decimal(5, 2)
  description String?  @db.VarChar(255)
  createdAt   DateTime @default(now()) @map("created_at")

  school      School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  exams       Exam[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("exam_types")
}

model Room {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  roomNumber  String   @map("room_number") @db.VarChar(50)
  building    String?  @db.VarChar(100)
  floor       Int?
  capacity    Int      @default(40)
  roomType    String   @default("CLASSROOM") @map("room_type") @db.VarChar(50)
  isAvailable Boolean  @default(true) @map("is_available")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school         School          @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  fixedAssets    FixedAsset[]
  timetableSlots TimetableSlot[]

  @@unique([schoolId, id])
  @@unique([schoolId, roomNumber])
  @@index([schoolId])
  @@map("rooms")
}

model PeriodDefinition {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  periodName  String   @map("period_name") @db.VarChar(50)
  periodOrder Int      @map("period_order")
  startTime   String   @map("start_time") @db.VarChar(10) // HH:MM
  endTime     String   @map("end_time") @db.VarChar(10)   // HH:MM
  isBreak     Boolean  @default(false) @map("is_break")
  createdAt   DateTime @default(now()) @map("created_at")

  school         School          @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  timetableSlots TimetableSlot[]

  @@unique([schoolId, id])
  @@unique([schoolId, periodName])
  @@index([schoolId])
  @@map("period_definitions")
}

model Department {
  id          String   @id @default(uuid()) @db.VarChar(36)
  schoolId    String   @map("school_id") @db.VarChar(36)
  name        String   @db.VarChar(100)
  code        String   @db.VarChar(50)
  description String?  @db.VarChar(255)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  school      School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  staffList   Staff[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("departments")
}

model Designation {
  id             String   @id @default(uuid()) @db.VarChar(36)
  schoolId       String   @map("school_id") @db.VarChar(36)
  title          String   @db.VarChar(100)
  code           String   @db.VarChar(50)
  description    String?  @db.VarChar(255)
  hierarchyLevel Int      @default(1) @map("hierarchy_level")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  school         School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  staffList      Staff[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("designations")
}

model Staff {
  id                 String    @id @default(uuid()) @db.VarChar(36)
  schoolId           String    @map("school_id") @db.VarChar(36)
  userId             String?   @map("user_id") @db.VarChar(36)
  departmentId       String    @map("department_id") @db.VarChar(36)
  designationId      String    @map("designation_id") @db.VarChar(36)
  employeeCode       String    @map("employee_code") @db.VarChar(64)
  firstName          String    @map("first_name") @db.VarChar(100)
  lastName           String    @map("last_name") @db.VarChar(100)
  email              String    @db.VarChar(191)
  phone              String    @db.VarChar(30)
  gender             String    @db.VarChar(20)
  dateOfBirth        DateTime  @map("date_of_birth") @db.Date
  dateOfJoining      DateTime  @map("date_of_joining") @db.Date
  employmentType     String    @default("FULL_TIME") @map("employment_type") @db.VarChar(30)
  qualification      String?   @db.VarChar(150)
  activeEmployeeCode String?   @map("active_employee_code") @db.VarChar(64)
  deletedAt          DateTime? @map("deleted_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  school                School                @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  user                  User?                 @relation(fields: [userId], references: [id], onDelete: SetNull)
  department            Department            @relation(fields: [schoolId, departmentId], references: [schoolId, id], onDelete: Restrict)
  designation           Designation           @relation(fields: [schoolId, designationId], references: [schoolId, id], onDelete: Restrict)
  documents             StaffDocument[]
  leaveRequests         LeaveRequest[]
  payrollStructures     PayrollStructure[]
  payrolls              Payroll[]
  collectedFeePayments  FeePayment[]          @relation("FeePaymentCollector")
  fixedAssetsAssigned   FixedAsset[]          @relation("FixedAssetStaff")
  teacherAssignments    TeacherAssignment[]
  homeworkAssigned      Homework[]            @relation("HomeworkAssigner")
  timetableSlots        TimetableSlot[]       @relation("StaffTimetableSlot")
  substituteAssignments TeacherSubstitution[] @relation("SubstituteStaff")
  hostelBlocksWarden    HostelBlock[]         @relation("HostelBlockWarden")

  @@unique([schoolId, id])
  @@unique([schoolId, activeEmployeeCode], map: "uq_staff_active_code")
  @@index([schoolId])
  @@index([userId])
  @@index([schoolId, departmentId])
  @@index([schoolId, designationId])
  @@map("staff")
}

model StaffDocument {
  id             String    @id @default(uuid()) @db.VarChar(36)
  schoolId       String    @map("school_id") @db.VarChar(36)
  staffId        String    @map("staff_id") @db.VarChar(36)
  documentType   String    @map("document_type") @db.VarChar(50)
  documentNumber String?   @map("document_number") @db.VarChar(100)
  fileUrl        String    @map("file_url") @db.VarChar(500)
  verifiedAt     DateTime? @map("verified_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  staff          Staff     @relation(fields: [schoolId, staffId], references: [schoolId, id], onDelete: Cascade)

  @@index([schoolId, staffId])
  @@map("staff_documents")
}

model LeaveType {
  id             String         @id @default(uuid()) @db.VarChar(36)
  schoolId       String         @map("school_id") @db.VarChar(36)
  name           String         @db.VarChar(100)
  code           String         @db.VarChar(50)
  maxDaysPerYear Int            @default(12) @map("max_days_per_year")
  isPaid         Boolean        @default(true) @map("is_paid")
  createdAt      DateTime       @default(now()) @map("created_at")

  school         School         @relation(fields: [schoolId], references: [id], onDelete: Restrict)
  requests       LeaveRequest[]

  @@unique([schoolId, id])
  @@unique([schoolId, code])
  @@index([schoolId])
  @@map("leave_types")
}

model LeaveRequest {
  id          String    @id @default(uuid()) @db.VarChar(36)
  schoolId    String    @map("school_id") @db.VarChar(36)
  staffId     String    @map("staff_id") @db.VarChar(36)
  leaveTypeId String    @map("leave_type_id") @db.VarChar(36)
  startDate   DateTime  @map("start_date") @db.Date
  endDate     DateTime  @map("end_date") @db.Date
  totalDays   Decimal   @map("total_days") @db.Decimal(4, 1)
  reason      String    @db.Text
  status      String    @default("PENDING") @db.VarChar(30)
  approvedAt  DateTime? @map("approved_at")
  remarks     String?   @db.VarChar(255)
  createdAt   DateTime  @default(now()) @map("created_at")

  staff       Staff     @relation(fields: [schoolId, staffId], references: [schoolId, id], onDelete: Restrict)
  leaveType   LeaveType @relation(fields: [schoolId, leaveTypeId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, staffId])
  @@index([schoolId, leaveTypeId])
  @@map("leave_requests")
}

model PayrollStructure {
  id            String   @id @default(uuid()) @db.VarChar(36)
  schoolId      String   @map("school_id") @db.VarChar(36)
  staffId       String   @map("staff_id") @db.VarChar(36)
  basicSalary   Decimal  @map("basic_salary") @db.Decimal(12, 2)
  allowances    Decimal  @default(0.00) @db.Decimal(12, 2)
  deductions    Decimal  @default(0.00) @db.Decimal(12, 2)
  netSalary     Decimal  @map("net_salary") @db.Decimal(12, 2)
  effectiveDate DateTime @map("effective_date") @db.Date
  createdAt     DateTime @default(now()) @map("created_at")

  staff         Staff    @relation(fields: [schoolId, staffId], references: [schoolId, id], onDelete: Restrict)

  @@unique([schoolId, id])
  @@index([schoolId, staffId])
  @@map("payroll_structures")
}

model Payroll {
  id              String        @id @default(uuid()) @db.VarChar(36)
  schoolId        String        @map("school_id") @db.VarChar(36)
  staffId         String        @map("staff_id") @db.VarChar(36)
  payrollYear     Int           @map("payroll_year")
  payrollMonth    Int           @map("payroll_month")
  grossAmount     Decimal       @map("gross_amount") @db.Decimal(12, 2)
  deductionAmount Decimal       @map("deduction_amount") @db.Decimal(12, 2)
  netAmount       Decimal       @map("net_amount") @db.Decimal(12, 2)
  paymentMode     String        @default("BANK_TRANSFER") @map("payment_mode") @db.VarChar(50)
  paymentStatus   String        @default("PENDING") @map("payment_status") @db.VarChar(30)
  paidAt          DateTime?     @map("paid_at")
  createdAt       DateTime      @default(now()) @map("created_at")

  staff           Staff         @relation(fields: [schoolId, staffId], references: [schoolId, id], onDelete: Restrict)
  items           PayrollItem[]

  @@unique([schoolId, id])
  @@unique([schoolId, staffId, payrollYear, payrollMonth], map: "uq_payrolls_staff_period")
  @@index([schoolId, staffId])
  @@map("payrolls")
}

model PayrollItem {
  id        String   @id @default(uuid()) @db.VarChar(36)
  schoolId  String   @map("school_id") @db.VarChar(36)
  payrollId String   @map("payroll_id") @db.VarChar(36)
  itemType  String   @map("item_type") @db.VarChar(30) // EARNING, DEDUCTION
  itemName  String   @map("item_name") @db.VarChar(100)
  amount    Decimal  @db.Decimal(12, 2)
  createdAt DateTime @default(now()) @map("created_at")

  payroll   Payroll  @relation(fields: [schoolId, payrollId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, payrollId])
  @@map("payroll_items")
}
`;
