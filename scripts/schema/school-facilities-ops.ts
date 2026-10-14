// Module 3: School Facilities, Fleet, Inventory, Communication & Audit (32 Tables)

export const schoolFacilitiesOpsSchema = `

// ==========================================
// 5. SCHOOL FACILITIES & OPS SCOPE (32 Tables)
// ==========================================

model Book {

  id              String     @id @default(uuid()) @db.VarChar(36)

  schoolId        String     @map("school_id") @db.VarChar(36)

  title           String     @db.VarChar(200)

  isbn            String     @db.VarChar(50)

  author          String     @db.VarChar(150)

  publisher       String?    @db.VarChar(150)

  edition         String?    @db.VarChar(50)

  category        String     @db.VarChar(100)

  totalCopies     Int        @default(1) @map("total_copies")

  availableCopies Int        @default(1) @map("available_copies")

  createdAt       DateTime   @default(now()) @map("created_at")

  updatedAt       DateTime   @updatedAt @map("updated_at")

  school          School     @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  copies          BookCopy[]

  @@unique([schoolId, id])

  @@unique([schoolId, isbn])

  @@index([schoolId])

  @@map("books")

}

model BookCopy {

  id              String      @id @default(uuid()) @db.VarChar(36)

  schoolId        String      @map("school_id") @db.VarChar(36)

  bookId          String      @map("book_id") @db.VarChar(36)

  barcode         String      @map("barcode") @db.VarChar(64)

  copyNumber      Int         @map("copy_number")

  conditionStatus String      @default("GOOD") @map("condition_status") @db.VarChar(30)

  status          String      @default("AVAILABLE") @db.VarChar(30) // AVAILABLE, ISSUED, LOST

  createdAt       DateTime    @default(now()) @map("created_at")

  book            Book        @relation(fields: [schoolId, bookId], references: [schoolId, id], onDelete: Restrict)

  issues          BookIssue[]

  @@unique([schoolId, id])

  @@unique([schoolId, barcode])

  @@index([schoolId, bookId])

  @@map("book_copies")

}

model LibraryMember {

  id              String      @id @default(uuid()) @db.VarChar(36)

  schoolId        String      @map("school_id") @db.VarChar(36)

  memberType      String      @map("member_type") @db.VarChar(30) // STUDENT, STAFF

  memberRefId     String      @map("member_ref_id") @db.VarChar(36)

  memberCode      String      @map("member_code") @db.VarChar(50)

  maxAllowedBooks Int         @default(3) @map("max_allowed_books")

  status          String      @default("ACTIVE") @db.VarChar(30)

  createdAt       DateTime    @default(now()) @map("created_at")

  school          School      @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  issues          BookIssue[]

  @@unique([schoolId, id])

  @@unique([schoolId, memberCode])

  @@index([schoolId])

  @@map("library_members")

}

model DigitalBook {

  id        String    @id @default(uuid()) @db.VarChar(36)

  schoolId  String    @map("school_id") @db.VarChar(36)

  title     String    @db.VarChar(200)

  author    String    @db.VarChar(150)

  fileUrl   String    @map("file_url") @db.VarChar(500)

  fileSize  BigInt    @map("file_size")

  format    String    @default("PDF") @db.VarChar(20)

  category  String    @db.VarChar(100)

  deletedAt DateTime? @map("deleted_at")

  createdAt DateTime  @default(now()) @map("created_at")

  school    School    @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  @@index([schoolId])

  @@map("digital_books")

}

model Vehicle {

  id              String                @id @default(uuid()) @db.VarChar(36)

  schoolId        String                @map("school_id") @db.VarChar(36)

  vehicleNumber   String                @map("vehicle_number") @db.VarChar(50)

  vehicleModel    String                @map("vehicle_model") @db.VarChar(100)

  capacity        Int

  insuranceExpiry DateTime              @map("insurance_expiry") @db.Date

  fitnessExpiry   DateTime              @map("fitness_expiry") @db.Date

  status          String                @default("ACTIVE") @db.VarChar(30)

  createdAt       DateTime              @default(now()) @map("created_at")

  updatedAt       DateTime              @updatedAt @map("updated_at")

  school          School                @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  allocations     TransportAllocation[]

  trips           TransportTrip[]

  @@unique([schoolId, id])

  @@unique([schoolId, vehicleNumber])

  @@index([schoolId])

  @@map("vehicles")

}

model Driver {

  id            String          @id @default(uuid()) @db.VarChar(36)

  schoolId      String          @map("school_id") @db.VarChar(36)

  name          String          @db.VarChar(150)

  licenseNumber String          @map("license_number") @db.VarChar(50)

  licenseExpiry DateTime        @map("license_expiry") @db.Date

  phone         String          @db.VarChar(30)

  address       String?         @db.Text

  status        String          @default("ACTIVE") @db.VarChar(30)

  createdAt     DateTime        @default(now()) @map("created_at")

  updatedAt     DateTime        @updatedAt @map("updated_at")

  school        School          @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  trips         TransportTrip[]

  @@unique([schoolId, id])

  @@unique([schoolId, licenseNumber])

  @@index([schoolId])

  @@map("drivers")

}

model Route {

  id            String                @id @default(uuid()) @db.VarChar(36)

  schoolId      String                @map("school_id") @db.VarChar(36)

  routeName     String                @map("route_name") @db.VarChar(100)

  routeCode     String                @map("route_code") @db.VarChar(50)

  startLocation String                @map("start_location") @db.VarChar(150)

  endLocation   String                @map("end_location") @db.VarChar(150)

  createdAt     DateTime              @default(now()) @map("created_at")

  updatedAt     DateTime              @updatedAt @map("updated_at")

  school        School                @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  stops         RouteStop[]

  trips         TransportTrip[]

  @@unique([schoolId, id])

  @@unique([schoolId, routeCode])

  @@index([schoolId])

  @@map("routes")

}

model RouteStop {

  id          String                @id @default(uuid()) @db.VarChar(36)

  schoolId    String                @map("school_id") @db.VarChar(36)

  routeId     String                @map("route_id") @db.VarChar(36)

  stopName    String                @map("stop_name") @db.VarChar(100)

  stopOrder   Int                   @map("stop_order")

  pickupTime  String                @map("pickup_time") @db.VarChar(10) // HH:MM

  dropTime    String                @map("drop_time") @db.VarChar(10) // HH:MM

  fareAmount  Decimal               @default(0.00) @map("fare_amount") @db.Decimal(10, 2)

  createdAt   DateTime              @default(now()) @map("created_at")

  route       Route                 @relation(fields: [schoolId, routeId], references: [schoolId, id], onDelete: Restrict)

  allocations TransportAllocation[]

  @@unique([schoolId, id])

  @@index([schoolId, routeId])

  @@map("route_stops")

}

model HostelBlock {

  id            String       @id @default(uuid()) @db.VarChar(36)

  schoolId      String       @map("school_id") @db.VarChar(36)

  name          String       @db.VarChar(100)

  code          String       @db.VarChar(50)

  gender        String       @db.VarChar(20) // MALE, FEMALE, COED

  wardenStaffId String?      @map("warden_staff_id") @db.VarChar(36)

  capacity      Int          @default(100)

  createdAt     DateTime     @default(now()) @map("created_at")

  school        School       @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  warden        Staff?       @relation( "HostelBlockWarden", fields: [schoolId, wardenStaffId], references: [schoolId, id], onDelete: Restrict )

  rooms         HostelRoom[]

  @@unique([schoolId, id])

  @@unique([schoolId, code])

  @@index([schoolId])

  @@index([schoolId, wardenStaffId])

  @@map("hostel_blocks")

}

model HostelRoom {

  id         String      @id @default(uuid()) @db.VarChar(36)

  schoolId   String      @map("school_id") @db.VarChar(36)

  blockId    String      @map("block_id") @db.VarChar(36)

  roomNumber String      @map("room_number") @db.VarChar(50)

  floor      Int         @default(1)

  roomType   String      @default("STANDARD") @map("room_type") @db.VarChar(50)

  capacity   Int         @default(4)

  createdAt  DateTime    @default(now()) @map("created_at")

  block      HostelBlock @relation(fields: [schoolId, blockId], references: [schoolId, id], onDelete: Cascade)

  beds       HostelBed[]

  @@unique([schoolId, id])

  @@unique([schoolId, blockId, roomNumber])

  @@index([schoolId, blockId])

  @@map("hostel_rooms")

}

model HostelBed {

  id          String             @id @default(uuid()) @db.VarChar(36)

  schoolId    String             @map("school_id") @db.VarChar(36)

  roomId      String             @map("room_id") @db.VarChar(36)

  bedNumber   String             @map("bed_number") @db.VarChar(20)

  status      String             @default("AVAILABLE") @db.VarChar(30) // AVAILABLE, OCCUPIED, MAINTENANCE

  createdAt   DateTime           @default(now()) @map("created_at")

  room        HostelRoom         @relation(fields: [schoolId, roomId], references: [schoolId, id], onDelete: Cascade)

  allocations HostelAllocation[]

  @@unique([schoolId, id])

  @@unique([schoolId, roomId, bedNumber])

  @@index([schoolId, roomId])

  @@map("hostel_beds")

}

model AssetCategory {

  id          String          @id @default(uuid()) @db.VarChar(36)

  schoolId    String          @map("school_id") @db.VarChar(36)

  name        String          @db.VarChar(100)

  code        String          @db.VarChar(50)

  description String?         @db.VarChar(255)

  createdAt   DateTime        @default(now()) @map("created_at")

  school      School          @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  items       InventoryItem[]

  @@unique([schoolId, id])

  @@unique([schoolId, code])

  @@index([schoolId])

  @@map("asset_categories")

}

model InventoryItem {

  id             String                 @id @default(uuid()) @db.VarChar(36)

  schoolId       String                 @map("school_id") @db.VarChar(36)

  categoryId     String                 @map("category_id") @db.VarChar(36)

  name           String                 @db.VarChar(150)

  code           String                 @db.VarChar(50)

  unitOfMeasure  String                 @map("unit_of_measure") @db.VarChar(30)

  currentStock   Decimal                @default(0.00) @map("current_stock") @db.Decimal(10, 2)

  reorderLevel   Decimal                @default(5.00) @map("reorder_level") @db.Decimal(10, 2)

  unitPrice      Decimal                @default(0.00) @map("unit_price") @db.Decimal(10, 2)

  createdAt      DateTime               @default(now()) @map("created_at")

  updatedAt      DateTime               @updatedAt @map("updated_at")

  category       AssetCategory          @relation(fields: [schoolId, categoryId], references: [schoolId, id], onDelete: Restrict)

  fixedAssets    FixedAsset[]

  transactions   InventoryTransaction[]

  @@unique([schoolId, id])

  @@unique([schoolId, code])

  @@index([schoolId, categoryId])

  @@map("inventory_items")

}

model FixedAsset {

  id              String             @id @default(uuid()) @db.VarChar(36)

  schoolId        String             @map("school_id") @db.VarChar(36)

  itemId          String             @map("item_id") @db.VarChar(36)

  assignedStaffId String?            @map("assigned_staff_id") @db.VarChar(36)

  roomId          String?            @map("room_id") @db.VarChar(36)

  assetTag        String             @map("asset_tag") @db.VarChar(64)

  serialNumber    String?            @map("serial_number") @db.VarChar(100)

  purchaseDate    DateTime           @map("purchase_date") @db.Date

  purchaseCost    Decimal            @map("purchase_cost") @db.Decimal(12, 2)

  status          String             @default("IN_USE") @db.VarChar(30) // IN_USE, IN_STORAGE, DISPOSED

  createdAt       DateTime           @default(now()) @map("created_at")

  updatedAt       DateTime           @updatedAt @map("updated_at")

  school          School             @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  item            InventoryItem      @relation(fields: [schoolId, itemId], references: [schoolId, id], onDelete: Restrict)

  assignedStaff   Staff?             @relation("FixedAssetStaff", fields: [schoolId, assignedStaffId], references: [schoolId, id], onDelete: Restrict)

  room            Room?              @relation(fields: [schoolId, roomId], references: [schoolId, id], onDelete: Restrict)

  maintenanceLogs AssetMaintenance[]

  @@unique([schoolId, id])

  @@unique([schoolId, assetTag])

  @@index([schoolId])

  @@index([schoolId, itemId])

  @@index([schoolId, assignedStaffId])

  @@index([schoolId, roomId])

  @@map("fixed_assets")

}

model InventoryTransaction {

  id              String        @id @default(uuid()) @db.VarChar(36)

  schoolId        String        @map("school_id") @db.VarChar(36)

  itemId          String        @map("item_id") @db.VarChar(36)

  transactionType String        @map("transaction_type") @db.VarChar(30) // PURCHASE, CONSUMPTION, ADJUSTMENT

  quantity        Decimal       @db.Decimal(10, 2)

  unitCost        Decimal       @map("unit_cost") @db.Decimal(10, 2)

  balanceAfter    Decimal       @map("balance_after") @db.Decimal(10, 2)

  referenceNumber String?       @map("reference_number") @db.VarChar(100)

  notes           String?       @db.Text

  createdAt       DateTime      @default(now()) @map("created_at")

  item            InventoryItem @relation(fields: [schoolId, itemId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, itemId])

  @@map("inventory_transactions")

}

model AssetMaintenance {

  id              String     @id @default(uuid()) @db.VarChar(36)

  schoolId        String     @map("school_id") @db.VarChar(36)

  assetId         String     @map("asset_id") @db.VarChar(36)

  maintenanceDate DateTime   @map("maintenance_date") @db.Date

  serviceProvider String     @map("service_provider") @db.VarChar(150)

  cost            Decimal    @db.Decimal(10, 2)

  description     String     @db.Text

  nextServiceDue  DateTime?  @map("next_service_due") @db.Date

  createdAt       DateTime   @default(now()) @map("created_at")

  asset           FixedAsset @relation(fields: [schoolId, assetId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, assetId])

  @@map("asset_maintenance")

}

model Vendor {

  id            String          @id @default(uuid()) @db.VarChar(36)

  schoolId      String          @map("school_id") @db.VarChar(36)

  name          String          @db.VarChar(150)

  contactPerson String?         @map("contact_person") @db.VarChar(100)

  email         String?         @db.VarChar(191)

  phone         String          @db.VarChar(30)

  address       String?         @db.Text

  taxNumber     String?         @map("tax_number") @db.VarChar(50)

  createdAt     DateTime        @default(now()) @map("created_at")

  updatedAt     DateTime        @updatedAt @map("updated_at")

  school        School          @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  orders        PurchaseOrder[]

  @@unique([schoolId, id])

  @@index([schoolId])

  @@map("vendors")

}

model PurchaseOrder {

  id                   String              @id @default(uuid()) @db.VarChar(36)

  schoolId             String              @map("school_id") @db.VarChar(36)

  vendorId             String              @map("vendor_id") @db.VarChar(36)

  poNumber             String              @map("po_number") @db.VarChar(64)

  orderDate            DateTime            @map("order_date") @db.Date

  expectedDeliveryDate DateTime?           @map("expected_delivery_date") @db.Date

  totalAmount          Decimal             @map("total_amount") @db.Decimal(12, 2)

  status               String              @default("DRAFT") @db.VarChar(30) // DRAFT, ISSUED, RECEIVED, CANCELLED

  remarks              String?             @db.Text

  createdAt            DateTime            @default(now()) @map("created_at")

  updatedAt            DateTime            @updatedAt @map("updated_at")

  school               School              @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  vendor               Vendor              @relation(fields: [schoolId, vendorId], references: [schoolId, id], onDelete: Restrict)

  items                PurchaseOrderItem[]

  @@unique([schoolId, id])

  @@unique([schoolId, poNumber])

  @@index([schoolId])

  @@index([schoolId, vendorId])

  @@map("purchase_orders")

}

model PurchaseOrderItem {

  id              String        @id @default(uuid()) @db.VarChar(36)

  schoolId        String        @map("school_id") @db.VarChar(36)

  purchaseOrderId String        @map("purchase_order_id") @db.VarChar(36)

  itemName        String        @map("item_name") @db.VarChar(150)

  quantity        Decimal       @db.Decimal(10, 2)

  unitPrice       Decimal       @map("unit_price") @db.Decimal(10, 2)

  lineTotal       Decimal       @map("line_total") @db.Decimal(12, 2)

  createdAt       DateTime      @default(now()) @map("created_at")

  purchaseOrder   PurchaseOrder @relation(fields: [schoolId, purchaseOrderId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, purchaseOrderId])

  @@map("purchase_order_items")

}

model ExpenseCategory {

  id          String    @id @default(uuid()) @db.VarChar(36)

  schoolId    String    @map("school_id") @db.VarChar(36)

  name        String    @db.VarChar(100)

  code        String    @db.VarChar(50)

  description String?   @db.VarChar(255)

  createdAt   DateTime  @default(now()) @map("created_at")

  school      School    @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  expenses    Expense[]

  @@unique([schoolId, id])

  @@unique([schoolId, code])

  @@index([schoolId])

  @@map("expense_categories")

}

model Expense {

  id          String          @id @default(uuid()) @db.VarChar(36)

  schoolId    String          @map("school_id") @db.VarChar(36)

  categoryId  String          @map("category_id") @db.VarChar(36)

  amount      Decimal         @db.Decimal(12, 2)

  expenseDate DateTime        @map("expense_date") @db.Date

  paymentMode String          @map("payment_mode") @db.VarChar(50)

  paidTo      String          @map("paid_to") @db.VarChar(150)

  description String?         @db.Text

  receiptUrl  String?         @map("receipt_url") @db.VarChar(500)

  status      String          @default("PAID") @db.VarChar(30)

  createdAt   DateTime        @default(now()) @map("created_at")

  category    ExpenseCategory @relation(fields: [schoolId, categoryId], references: [schoolId, id], onDelete: Restrict)

  @@index([schoolId, categoryId])

  @@map("expenses")

}

model Announcement {

  id          String               @id @default(uuid()) @db.VarChar(36)

  schoolId    String               @map("school_id") @db.VarChar(36)

  title       String               @db.VarChar(200)

  content     String               @db.Text

  priority    String               @default("NORMAL") @db.VarChar(20) // LOW, NORMAL, HIGH, URGENT

  publishAt   DateTime             @default(now()) @map("publish_at")

  expiresAt   DateTime?            @map("expires_at")

  isPinned    Boolean              @default(false) @map("is_pinned")

  deletedAt   DateTime?            @map("deleted_at")

  createdAt   DateTime             @default(now()) @map("created_at")

  updatedAt   DateTime             @updatedAt @map("updated_at")

  school      School               @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  targets     AnnouncementTarget[]

  @@unique([schoolId, id])

  @@index([schoolId])

  @@map("announcements")

}

model AnnouncementTarget {

  id             String       @id @default(uuid()) @db.VarChar(36)

  schoolId       String       @map("school_id") @db.VarChar(36)

  announcementId String       @map("announcement_id") @db.VarChar(36)

  targetType     String       @map("target_type") @db.VarChar(30) // ALL, ROLE, CLASS, STAFF

  targetId       String?      @map("target_id") @db.VarChar(36)

  createdAt      DateTime     @default(now()) @map("created_at")

  announcement   Announcement @relation(fields: [schoolId, announcementId], references: [schoolId, id], onDelete: Cascade)

  @@index([schoolId, announcementId])

  @@map("announcement_targets")

}

model Event {

  id          String    @id @default(uuid()) @db.VarChar(36)

  schoolId    String    @map("school_id") @db.VarChar(36)

  title       String    @db.VarChar(200)

  description String?   @db.Text

  eventType   String    @default("ACADEMIC") @map("event_type") @db.VarChar(50)

  startDate   DateTime  @map("start_date")

  endDate     DateTime  @map("end_date")

  location    String?   @db.VarChar(150)

  isPublic    Boolean   @default(false) @map("is_public")

  deletedAt   DateTime? @map("deleted_at")

  createdAt   DateTime  @default(now()) @map("created_at")

  updatedAt   DateTime  @updatedAt @map("updated_at")

  school      School    @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  @@index([schoolId])

  @@map("events")

}

model InternalConversation {

  id        String            @id @default(uuid()) @db.VarChar(36)

  schoolId  String            @map("school_id") @db.VarChar(36)

  title     String?           @db.VarChar(150)

  isGroup   Boolean           @default(false) @map("is_group")

  deletedAt DateTime?         @map("deleted_at")

  createdAt DateTime          @default(now()) @map("created_at")

  updatedAt DateTime          @updatedAt @map("updated_at")

  school    School            @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  messages  InternalMessage[]

  @@unique([schoolId, id])

  @@index([schoolId])

  @@map("internal_conversations")

}

model InternalMessage {

  id             String                     @id @default(uuid()) @db.VarChar(36)

  schoolId       String                     @map("school_id") @db.VarChar(36)

  conversationId String                     @map("conversation_id") @db.VarChar(36)

  senderUserId   String                     @map("sender_user_id") @db.VarChar(36)

  content        String                     @db.Text

  isDeleted      Boolean                    @default(false) @map("is_deleted")

  createdAt      DateTime                   @default(now()) @map("created_at")

  conversation   InternalConversation       @relation(fields: [schoolId, conversationId], references: [schoolId, id], onDelete: Restrict)

  sender         User                       @relation("SentInternalMessages", fields: [senderUserId], references: [id], onDelete: Restrict)

  recipients     InternalMessageRecipient[]

  @@unique([schoolId, id])

  @@index([schoolId, conversationId])

  @@index([senderUserId])

  @@map("internal_messages")

}

model InternalMessageRecipient {

  id              String          @id @default(uuid()) @db.VarChar(36)

  schoolId        String          @map("school_id") @db.VarChar(36)

  messageId       String          @map("message_id") @db.VarChar(36)

  recipientUserId String          @map("recipient_user_id") @db.VarChar(36)

  readAt          DateTime?       @map("read_at")

  createdAt       DateTime        @default(now()) @map("created_at")

  message         InternalMessage @relation(fields: [schoolId, messageId], references: [schoolId, id], onDelete: Cascade)

  recipient       User            @relation("RecipientInternalMessages", fields: [recipientUserId], references: [id], onDelete: Restrict)

  @@index([schoolId, messageId])

  @@index([recipientUserId])

  @@map("internal_message_recipients")

}

model NotificationTemplate {

  id            String   @id @default(uuid()) @db.VarChar(36)

  schoolId      String   @map("school_id") @db.VarChar(36)

  eventCode     String   @map("event_code") @db.VarChar(100)

  channel       String   @db.VarChar(30) // EMAIL, SMS, PUSH, IN_APP

  titleTemplate String   @map("title_template") @db.VarChar(255)

  bodyTemplate  String   @map("body_template") @db.Text

  isEnabled     Boolean  @default(true) @map("is_enabled")

  createdAt     DateTime @default(now()) @map("created_at")

  school        School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  @@unique([schoolId, id])

  @@unique([schoolId, eventCode, channel])

  @@index([schoolId])

  @@map("notification_templates")

}

model Notification {

  id              String                 @id @default(uuid()) @db.VarChar(36)

  schoolId        String                 @map("school_id") @db.VarChar(36)

  recipientUserId String                 @map("recipient_user_id") @db.VarChar(36)

  title           String                 @db.VarChar(200)

  body            String                 @db.Text

  channel         String                 @default("IN_APP") @db.VarChar(30)

  actionUrl       String?                @map("action_url") @db.VarChar(500)

  isRead          Boolean                @default(false) @map("is_read")

  readAt          DateTime?              @map("read_at")

  deletedAt       DateTime?              @map("deleted_at")

  createdAt       DateTime               @default(now()) @map("created_at")

  school          School                 @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  recipient       User                   @relation(fields: [recipientUserId], references: [id], onDelete: Restrict)

  deliveries      NotificationDelivery[]

  @@unique([schoolId, id])

  @@index([schoolId])

  @@index([recipientUserId])

  @@map("notifications")

}

model NotificationDelivery {

  id              String       @id @default(uuid()) @db.VarChar(36)

  schoolId        String       @map("school_id") @db.VarChar(36)

  notificationId  String       @map("notification_id") @db.VarChar(36)

  attemptNumber   Int          @default(1) @map("attempt_number")

  status          String       @default("SENT") @db.VarChar(30)

  gatewayResponse String?      @map("gateway_response") @db.Text

  deliveredAt     DateTime?    @map("delivered_at")

  createdAt       DateTime     @default(now()) @map("created_at")

  notification    Notification @relation(fields: [schoolId, notificationId], references: [schoolId, id], onDelete: Cascade)

  @@index([schoolId, notificationId])

  @@map("notification_deliveries")

}

model ActivityLog {

  id          String   @id @default(uuid()) @db.VarChar(36)

  schoolId    String   @map("school_id") @db.VarChar(36)

  userId      String?  @map("user_id") @db.VarChar(36)

  module      String   @db.VarChar(50)

  action      String   @db.VarChar(50)

  entityId    String?  @map("entity_id") @db.VarChar(36)

  ipAddress   String?  @map("ip_address") @db.VarChar(45)

  userAgent   String?  @db.Text

  detailsJson String?  @map("details_json") @db.Text

  createdAt   DateTime @default(now()) @map("created_at")

  school      School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  user        User?    @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([schoolId])

  @@index([userId])

  @@map("activity_logs")

}

model HistoricalChangeRecord {

  id         String   @id @default(uuid()) @db.VarChar(36)

  schoolId   String   @map("school_id") @db.VarChar(36)

  userId     String?  @map("user_id") @db.VarChar(36)

  tableName  String   @map("table_name") @db.VarChar(100)

  recordId   String   @map("record_id") @db.VarChar(36)

  operation  String   @db.VarChar(20) // INSERT, UPDATE, DELETE

  beforeJson String?  @map("before_json") @db.LongText

  afterJson  String?  @map("after_json") @db.LongText

  createdAt  DateTime @default(now()) @map("created_at")

  school     School   @relation(fields: [schoolId], references: [id], onDelete: Restrict)

  user       User?    @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([schoolId])

  @@index([userId])

  @@map("historical_change_records")

}

`;
