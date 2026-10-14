// Module 1: Platform (7) + Global (6) + Mixed (1) = 14 Tables

export const platformAndGlobalSchema = `

// ==========================================
// 1. PLATFORM SCOPE (7 Tables)
// ==========================================

model SubscriptionPlan {

  id          String   @id @default(uuid()) @db.VarChar(36)

  name        String   @db.VarChar(100)

  code        String   @unique @db.VarChar(50)

  description String?  @db.Text

  price       Decimal  @db.Decimal(10, 2)

  currency    String   @default("USD") @db.VarChar(3)

  billingCycle String  @map("billing_cycle") @db.VarChar(20) // MONTHLY, ANNUAL

  maxStudents Int      @default(500) @map("max_students")

  maxStaff    Int      @default(50) @map("max_staff")

  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")

  updatedAt   DateTime @updatedAt @map("updated_at")

  features      SubscriptionFeature[]

  subscriptions Subscription[]

  @@map("subscription_plans")

}

model SubscriptionFeature {

  id           String           @id @default(uuid()) @db.VarChar(36)

  planId       String           @map("plan_id") @db.VarChar(36)

  featureKey   String           @map("feature_key") @db.VarChar(100)

  featureValue String?          @map("feature_value") @db.VarChar(255)

  isEnabled    Boolean          @default(true) @map("is_enabled")

  createdAt    DateTime         @default(now()) @map("created_at")

  plan         SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@unique([planId, featureKey])

  @@map("subscription_features")

}

model Subscription {

  id                String               @id @default(uuid()) @db.VarChar(36)

  schoolId          String               @map("school_id") @db.VarChar(36)

  planId            String               @map("plan_id") @db.VarChar(36)

  status            String               @default("TRIALING") @db.VarChar(30) // TRIALING, ACTIVE, PAST_DUE, CANCELLED

  currentPeriodStart DateTime            @map("current_period_start")

  currentPeriodEnd   DateTime            @map("current_period_end")

  cancelAtPeriodEnd  Boolean             @default(false) @map("cancel_at_period_end")

  createdAt          DateTime             @default(now()) @map("created_at")

  updatedAt          DateTime             @updatedAt @map("updated_at")

  school             School              @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  plan               SubscriptionPlan    @relation(fields: [planId], references: [id], onDelete: Restrict)

  invoices           SubscriptionInvoice[]

  // Required candidate key for tenant-safe composite child relations.
  @@unique([schoolId, id])

  @@index([schoolId])

  @@index([planId])

  @@map("subscriptions")

}

model SubscriptionInvoice {

  id             String                    @id @default(uuid()) @db.VarChar(36)

  schoolId       String                    @map("school_id") @db.VarChar(36)

  subscriptionId String                    @map("subscription_id") @db.VarChar(36)

  invoiceNumber  String                    @unique @map("invoice_number") @db.VarChar(50)

  subtotal       Decimal                   @db.Decimal(10, 2)

  taxAmount      Decimal                   @default(0.00) @map("tax_amount") @db.Decimal(10, 2)

  totalAmount    Decimal                   @map("total_amount") @db.Decimal(10, 2)

  status         String                    @default("DRAFT") @db.VarChar(30) // DRAFT, ISSUED, PAID, VOID

  dueDate        DateTime                  @map("due_date")

  paidAt         DateTime?                 @map("paid_at")

  createdAt      DateTime                  @default(now()) @map("created_at")

  updatedAt      DateTime                  @updatedAt @map("updated_at")

  school         School                    @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  // IMPORTANT:
  // Tenant-safe relation. Both school_id and subscription_id
  // must match the parent Subscription.
  subscription   Subscription              @relation( fields: [schoolId, subscriptionId], references: [schoolId, id], onDelete: Restrict )

  items          SubscriptionInvoiceItem[]

  payments       SubscriptionPayment[]

  @@unique([schoolId, id])

  @@index([schoolId])

  @@index([schoolId, subscriptionId])

  @@index([subscriptionId])

  @@map("subscription_invoices")

}

model SubscriptionInvoiceItem {

  id          String              @id @default(uuid()) @db.VarChar(36)

  schoolId    String              @map("school_id") @db.VarChar(36)

  invoiceId   String              @map("invoice_id") @db.VarChar(36)

  description String              @db.VarChar(255)

  quantity    Int                 @default(1)

  unitPrice   Decimal             @map("unit_price") @db.Decimal(10, 2)

  amount      Decimal             @db.Decimal(10, 2)

  createdAt   DateTime            @default(now()) @map("created_at")

  invoice     SubscriptionInvoice @relation( fields: [schoolId, invoiceId], references: [schoolId, id], onDelete: Cascade )

  @@index([schoolId, invoiceId])

  @@map("subscription_invoice_items")

}

model SubscriptionPayment {

  id            String              @id @default(uuid()) @db.VarChar(36)

  schoolId      String              @map("school_id") @db.VarChar(36)

  invoiceId     String              @map("invoice_id") @db.VarChar(36)

  amount        Decimal             @db.Decimal(10, 2)

  paymentMethod String              @map("payment_method") @db.VarChar(50)

  transactionRef String?            @map("transaction_ref") @db.VarChar(100)

  status        String              @default("SUCCESS") @db.VarChar(30)

  paidAt        DateTime            @default(now()) @map("paid_at")

  createdAt     DateTime            @default(now()) @map("created_at")

  invoice       SubscriptionInvoice @relation( fields: [schoolId, invoiceId], references: [schoolId, id], onDelete: Restrict )

  @@index([schoolId, invoiceId])

  @@map("subscription_payments")

}

model PaymentWebhookEvent {

  id          String   @id @default(uuid()) @db.VarChar(36)

  schoolId    String?  @map("school_id") @db.VarChar(36)

  provider    String   @db.VarChar(50) // STRIPE, RAZORPAY, FLUTTERWAVE

  eventId     String   @map("event_id") @db.VarChar(150)

  eventType   String   @map("event_type") @db.VarChar(100)

  payload     String   @db.LongText

  status      String   @default("RECEIVED") @db.VarChar(30) // RECEIVED, PROCESSING, PROCESSED, FAILED

  processedAt DateTime? @map("processed_at")

  createdAt   DateTime @default(now()) @map("created_at")

  school      School?  @relation( fields: [schoolId], references: [id], onDelete: Restrict )

  @@unique([provider, eventId], map: "uq_webhooks_provider_event")

  @@index([schoolId])

  @@map("payment_webhook_events")

}

// ==========================================
// 2. GLOBAL SCOPE (6 Tables)
// ==========================================

model User {

  id           String    @id @default(uuid()) @db.VarChar(36)

  email        String    @unique(map: "uq_users_email") @db.VarChar(191)

  passwordHash String    @map("password_hash") @db.VarChar(255)

  fullName     String    @map("full_name") @db.VarChar(150)

  phone        String?   @db.VarChar(30)

  avatarUrl    String?   @map("avatar_url") @db.VarChar(500)

  isSuperAdmin Boolean   @default(false) @map("is_super_admin")

  isActive     Boolean   @default(true) @map("is_active")

  deletedAt    DateTime? @map("deleted_at")

  createdAt    DateTime  @default(now()) @map("created_at")

  updatedAt    DateTime  @updatedAt @map("updated_at")

  sessions                Session[]

  passwordResets          PasswordReset[]

  schoolMemberships       SchoolUser[]

  staffProfiles            Staff[]

  studentProfiles          Student[]

  parentProfile            Parent?

  sentMessages             InternalMessage[]          @relation("SentInternalMessages")

  receivedMessages         InternalMessageRecipient[] @relation("RecipientInternalMessages")

  notifications            Notification[]

  activityLogs             ActivityLog[]

  historicalChangeRecords  HistoricalChangeRecord[]

  @@map("users")

}

model Session {

  id           String    @id @default(uuid()) @db.VarChar(36)

  userId       String    @map("user_id") @db.VarChar(36)

  sessionToken String    @unique @map("session_token") @db.VarChar(255)

  ipAddress    String?   @map("ip_address") @db.VarChar(45)

  userAgent    String?   @db.Text

  expiresAt    DateTime  @map("expires_at")

  createdAt    DateTime  @default(now()) @map("created_at")

  user         User      @relation( fields: [userId], references: [id], onDelete: Cascade )

  @@index([userId])

  @@map("sessions")

}

model PasswordReset {

  id        String    @id @default(uuid()) @db.VarChar(36)

  userId    String    @map("user_id") @db.VarChar(36)

  tokenHash String    @unique @map("token_hash") @db.VarChar(255)

  expiresAt DateTime  @map("expires_at")

  usedAt    DateTime? @map("used_at")

  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation( fields: [userId], references: [id], onDelete: Cascade )

  @@index([userId])

  @@map("password_resets")

}

model Permission {

  id          String           @id @default(uuid()) @db.VarChar(36)

  code        String           @unique @db.VarChar(100)

  module      String           @db.VarChar(50)

  action      String           @db.VarChar(50)

  description String?          @db.VarChar(255)

  createdAt   DateTime         @default(now()) @map("created_at")

  rolePermissions RolePermission[]

  @@map("permissions")

}

model StudentIdentity {

  id             String    @id @default(uuid()) @db.VarChar(36)

  nationalId     String    @unique(map: "uq_student_identities_national_id") @map("national_id") @db.VarChar(100)

  idType         String    @default("NATIONAL_ID") @map("id_type") @db.VarChar(50)

  birthCertNo    String?   @map("birth_cert_no") @db.VarChar(100)

  nationality    String    @default("US") @db.VarChar(50)

  countryOfBirth String?   @map("country_of_birth") @db.VarChar(50)

  verifiedAt     DateTime? @map("verified_at")

  createdAt      DateTime  @default(now()) @map("created_at")

  updatedAt      DateTime  @updatedAt @map("updated_at")

  students       Student[]

  @@map("student_identities")

}

model Parent {

  id                 String          @id @default(uuid()) @db.VarChar(36)

  userId             String?         @unique @map("user_id") @db.VarChar(36)

  primaryPhone       String          @map("primary_phone") @db.VarChar(30)

  alternatePhone     String?         @map("alternate_phone") @db.VarChar(30)

  occupation         String?         @db.VarChar(100)

  annualIncome       Decimal?        @map("annual_income") @db.Decimal(12, 2)

  currentAddress     String?         @map("current_address") @db.Text

  permanentAddress   String?         @map("permanent_address") @db.Text

  emergencyContact   String?         @map("emergency_contact") @db.VarChar(100)

  emergencyPhone     String?         @map("emergency_phone") @db.VarChar(30)

  createdAt          DateTime        @default(now()) @map("created_at")

  updatedAt          DateTime        @updatedAt @map("updated_at")

  user               User?           @relation( fields: [userId], references: [id], onDelete: SetNull )

  children           ParentStudent[]

  @@map("parents")

}

// ==========================================
// 3. MIXED SCOPE (1 Table)
// ==========================================

model StoredFile {

  id           String    @id @default(uuid()) @db.VarChar(36)

  schoolId     String?   @map("school_id") @db.VarChar(36)

  storageKey   String    @unique @map("storage_key") @db.VarChar(255)

  fileName     String    @map("file_name") @db.VarChar(255)

  fileSize     BigInt    @map("file_size")

  mimeType     String    @map("mime_type") @db.VarChar(100)

  bucket       String    @db.VarChar(100)

  isPublic     Boolean   @default(false) @map("is_public")

  deletedAt    DateTime? @map("deleted_at")

  createdAt    DateTime  @default(now()) @map("created_at")

  updatedAt    DateTime  @updatedAt @map("updated_at")

  school                         School?                       @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  studentDocuments              StudentDocument[]

  homeworkAttachments            HomeworkAttachment[]

  homeworkSubmissionAttachments  HomeworkSubmissionAttachment[]

  @@index([schoolId])

  @@map("stored_files")

}

`;
