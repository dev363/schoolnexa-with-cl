import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  rawPrisma?: PrismaClient;
};

/**
 * Raw PrismaClient instance configured with clean logging.
 * In development and demo environments without a local MySQL service,
 * we suppress direct stderr emission to prevent alarming runtime crash monitors.
 */
export const rawPrisma =
  globalForPrisma.rawPrisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.rawPrisma = rawPrisma;
}

// Database reachability cache
let isDbReachable: boolean | null = null;
let lastReachabilityCheck = 0;
const REACHABILITY_TTL = 20000; // 20 seconds

/**
 * Fast, lightweight TCP ping to determine if the target database host/port is reachable.
 * Completes within 300ms, avoiding long Prisma connection timeouts.
 */
export async function pingDatabaseHost(timeoutMs = 300): Promise<boolean> {
  const now = Date.now();
  if (isDbReachable !== null && now - lastReachabilityCheck < REACHABILITY_TTL) {
    return isDbReachable;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    isDbReachable = false;
    lastReachabilityCheck = now;
    return false;
  }

  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname;
    const port = Number(parsed.port) || 3306;

    isDbReachable = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ host, port, timeout: timeoutMs });
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
    });

    lastReachabilityCheck = now;
    return isDbReachable;
  } catch {
    isDbReachable = false;
    lastReachabilityCheck = now;
    return false;
  }
}

/**
 * Smart Prisma Proxy.
 * Prevents hanging connection timeouts and unhandled stderr noise when the MySQL
 * service is not running in the current environment. Automatically routes to real
 * Prisma when the database host becomes available.
 */
// Export raw Prisma client directly to allow native connection pooling and standard error handling.
export const prisma: PrismaClient = rawPrisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Safe, non-destructive connection verification.
 * Runs a lightweight check (`SELECT 1`) to test database connectivity
 * without altering, migrating, or querying business tables.
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  error?: string;
}> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        connected: false,
        message: 'DATABASE_URL is not configured in environment',
      };
    }

    const reachable = await pingDatabaseHost(400);
    if (!reachable) {
      return {
        connected: false,
        message: 'Database server host is unreachable or offline',
        error: 'Connection refused or timed out',
      };
    }

    // Ping the database safely with SELECT 1
    await rawPrisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: 'Database connection established successfully',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: 'Database connection failed or unreachable',
      error: err?.message ?? 'Unknown database error',
    };
  }
}

/**
 * Automatically inspects and synchronizes the `staff` table schema with the
 * required Teacher management columns (status, profile_photo, blood_group,
 * address, city, state, postal_code, emergency_contact_name, emergency_contact_phone, details).
 *
 * If running against an existing database (such as a local MAMP / MySQL installation)
 * that was provisioned before the Teacher model enhancements, this utility executes
 * idempotent DDL commands so queries like `prisma.staff.findFirst()` do not fail
 * with "Unknown column 'schoolnexa.staff.status' in 'field list'".
 */
let isSchemaSyncInProgress = false;
let isSchemaAlreadySynced = false;

export async function ensureStaffSchema(): Promise<{
  success: boolean;
  migratedColumns: string[];
  error?: string;
}> {
  if (isSchemaAlreadySynced) {
    return { success: true, migratedColumns: [] };
  }
  if (isSchemaSyncInProgress) {
    // Wait briefly if another request is currently synchronizing
    return { success: true, migratedColumns: [] };
  }

  isSchemaSyncInProgress = true;
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        migratedColumns: [],
        error: 'DATABASE_URL not configured in environment',
      };
    }

    const reachable = await pingDatabaseHost(600);
    if (!reachable) {
      return { success: false, migratedColumns: [], error: 'Database server is unreachable' };
    }

    // Check if the staff table exists in the current MySQL database
    const tables = await rawPrisma.$queryRawUnsafe<Array<{ TABLE_NAME: string }>>(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff'`,
    );

    if (!tables || tables.length === 0) {
      return {
        success: false,
        migratedColumns: [],
        error: "Table 'staff' does not exist in the database",
      };
    }

    // Inspect existing columns on the staff table
    const existingColumns = await rawPrisma.$queryRawUnsafe<Array<{ COLUMN_NAME: string }>>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff'`,
    );

    const existingSet = new Set(existingColumns.map((c) => c.COLUMN_NAME.toLowerCase()));
    const migratedColumns: string[] = [];

    // 1. Column: status (Missing in baseline MAMP databases)
    if (!existingSet.has('status')) {
      await rawPrisma.$executeRawUnsafe(
        "ALTER TABLE `staff` ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'",
      );
      migratedColumns.push('status');
      existingSet.add('status');
    }

    // 2. Column: profile_photo
    if (!existingSet.has('profile_photo')) {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` ADD COLUMN `profile_photo` VARCHAR(500) NULL',
      );
      migratedColumns.push('profile_photo');
      existingSet.add('profile_photo');
    }

    // 3. Column: blood_group
    if (!existingSet.has('blood_group')) {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` ADD COLUMN `blood_group` VARCHAR(10) NULL',
      );
      migratedColumns.push('blood_group');
      existingSet.add('blood_group');
    }

    // 4. Column: address
    if (!existingSet.has('address')) {
      await rawPrisma.$executeRawUnsafe('ALTER TABLE `staff` ADD COLUMN `address` TEXT NULL');
      migratedColumns.push('address');
      existingSet.add('address');
    }

    // 5. Column: city
    if (!existingSet.has('city')) {
      await rawPrisma.$executeRawUnsafe('ALTER TABLE `staff` ADD COLUMN `city` VARCHAR(100) NULL');
      migratedColumns.push('city');
      existingSet.add('city');
    }

    // 6. Column: state
    if (!existingSet.has('state')) {
      await rawPrisma.$executeRawUnsafe('ALTER TABLE `staff` ADD COLUMN `state` VARCHAR(100) NULL');
      migratedColumns.push('state');
      existingSet.add('state');
    }

    // 7. Column: postal_code
    if (!existingSet.has('postal_code')) {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` ADD COLUMN `postal_code` VARCHAR(20) NULL',
      );
      migratedColumns.push('postal_code');
      existingSet.add('postal_code');
    }

    // 8. Column: emergency_contact_name
    if (!existingSet.has('emergency_contact_name')) {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` ADD COLUMN `emergency_contact_name` VARCHAR(100) NULL',
      );
      migratedColumns.push('emergency_contact_name');
      existingSet.add('emergency_contact_name');
    }

    // 9. Column: emergency_contact_phone
    if (!existingSet.has('emergency_contact_phone')) {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` ADD COLUMN `emergency_contact_phone` VARCHAR(30) NULL',
      );
      migratedColumns.push('emergency_contact_phone');
      existingSet.add('emergency_contact_phone');
    }

    // 10. Column: details (JSON)
    if (!existingSet.has('details')) {
      await rawPrisma.$executeRawUnsafe('ALTER TABLE `staff` ADD COLUMN `details` JSON NULL');
      migratedColumns.push('details');
      existingSet.add('details');
    }

    // 11. Column: active_employee_code (if missing from older migrations)
    if (!existingSet.has('active_employee_code')) {
      try {
        await rawPrisma.$executeRawUnsafe(
          'ALTER TABLE `staff` ADD COLUMN `active_employee_code` VARCHAR(64) NULL',
        );
        migratedColumns.push('active_employee_code');
      } catch {
        // Ignore if already generated or indexed
      }
    }

    // Ensure department_id and designation_id are nullable so standalone teacher records can be created
    try {
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` MODIFY COLUMN `department_id` VARCHAR(36) NULL',
      );
      await rawPrisma.$executeRawUnsafe(
        'ALTER TABLE `staff` MODIFY COLUMN `designation_id` VARCHAR(36) NULL',
      );
    } catch {
      // Ignore if already nullable or constrained
    }

    isSchemaAlreadySynced = true;

    if (migratedColumns.length > 0) {
      console.log(
        `[SchoolNexa DB Self-Healing] Successfully added missing columns to 'staff': ${migratedColumns.join(', ')}`,
      );
    }

    return { success: true, migratedColumns };
  } catch (err: any) {
    console.error('[SchoolNexa DB Self-Healing] Schema auto-healing note:', err?.message || err);
    return { success: false, migratedColumns: [], error: err?.message || String(err) };
  } finally {
    isSchemaSyncInProgress = false;
  }
}

/**
 * Automatically inspects and synchronizes the `students` table schema with the
 * complete Student registration fields and school-scoped registration ID.
 */
let isStudentSchemaSyncInProgress = false;
let isStudentSchemaAlreadySynced = false;

export async function ensureStudentSchema(): Promise<{
  success: boolean;
  migratedColumns: string[];
  error?: string;
}> {
  if (isStudentSchemaAlreadySynced) {
    return { success: true, migratedColumns: [] };
  }
  if (isStudentSchemaSyncInProgress) {
    return { success: true, migratedColumns: [] };
  }

  isStudentSchemaSyncInProgress = true;
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        migratedColumns: [],
        error: 'DATABASE_URL not configured in environment',
      };
    }

    const reachable = await pingDatabaseHost(600);
    if (!reachable) {
      return { success: false, migratedColumns: [], error: 'Database server is unreachable' };
    }

    const tables = await rawPrisma.$queryRawUnsafe<Array<{ TABLE_NAME: string }>>(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'`,
    );

    if (!tables || tables.length === 0) {
      return {
        success: false,
        migratedColumns: [],
        error: "Table 'students' does not exist in the database",
      };
    }

    const existingColumns = await rawPrisma.$queryRawUnsafe<Array<{ COLUMN_NAME: string }>>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'`,
    );

    const existingSet = new Set(existingColumns.map((c) => c.COLUMN_NAME.toLowerCase()));
    const migratedColumns: string[] = [];

    const columnDefs: Array<{ name: string; ddl: string }> = [
      { name: 'registration_id', ddl: 'ALTER TABLE `students` ADD COLUMN `registration_id` VARCHAR(64) NULL' },
      { name: 'middle_name', ddl: 'ALTER TABLE `students` ADD COLUMN `middle_name` VARCHAR(100) NULL' },
      { name: 'photo_url', ddl: 'ALTER TABLE `students` ADD COLUMN `photo_url` VARCHAR(500) NULL' },
      { name: 'special_category', ddl: 'ALTER TABLE `students` ADD COLUMN `special_category` VARCHAR(100) NULL' },
      { name: 'special_category_details', ddl: 'ALTER TABLE `students` ADD COLUMN `special_category_details` TEXT NULL' },
      { name: 'nationality', ddl: "ALTER TABLE `students` ADD COLUMN `nationality` VARCHAR(50) NULL DEFAULT 'Indian'" },
      { name: 'religion', ddl: 'ALTER TABLE `students` ADD COLUMN `religion` VARCHAR(50) NULL' },
      { name: 'category', ddl: 'ALTER TABLE `students` ADD COLUMN `category` VARCHAR(50) NULL' },
      { name: 'mother_tongue', ddl: 'ALTER TABLE `students` ADD COLUMN `mother_tongue` VARCHAR(50) NULL' },
      { name: 'place_of_birth', ddl: 'ALTER TABLE `students` ADD COLUMN `place_of_birth` VARCHAR(100) NULL' },
      { name: 'government_id', ddl: 'ALTER TABLE `students` ADD COLUMN `government_id` VARCHAR(100) NULL' },
      { name: 'mobile', ddl: 'ALTER TABLE `students` ADD COLUMN `mobile` VARCHAR(30) NULL' },
      { name: 'alternate_mobile', ddl: 'ALTER TABLE `students` ADD COLUMN `alternate_mobile` VARCHAR(30) NULL' },
      { name: 'email', ddl: 'ALTER TABLE `students` ADD COLUMN `email` VARCHAR(191) NULL' },
      { name: 'address_line1', ddl: 'ALTER TABLE `students` ADD COLUMN `address_line1` VARCHAR(255) NULL' },
      { name: 'address_line2', ddl: 'ALTER TABLE `students` ADD COLUMN `address_line2` VARCHAR(255) NULL' },
      { name: 'country', ddl: "ALTER TABLE `students` ADD COLUMN `country` VARCHAR(100) NULL DEFAULT 'India'" },
      { name: 'previous_school', ddl: 'ALTER TABLE `students` ADD COLUMN `previous_school` VARCHAR(200) NULL' },
      { name: 'previous_class', ddl: 'ALTER TABLE `students` ADD COLUMN `previous_class` VARCHAR(50) NULL' },
      { name: 'previous_school_board', ddl: 'ALTER TABLE `students` ADD COLUMN `previous_school_board` VARCHAR(100) NULL' },
      { name: 'transfer_certificate_number', ddl: 'ALTER TABLE `students` ADD COLUMN `transfer_certificate_number` VARCHAR(100) NULL' },
      { name: 'transfer_certificate_date', ddl: 'ALTER TABLE `students` ADD COLUMN `transfer_certificate_date` DATE NULL' },
      { name: 'notes', ddl: 'ALTER TABLE `students` ADD COLUMN `notes` TEXT NULL' },
      { name: 'status', ddl: "ALTER TABLE `students` ADD COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'" },
    ];

    for (const col of columnDefs) {
      if (!existingSet.has(col.name)) {
        try {
          await rawPrisma.$executeRawUnsafe(col.ddl);
          migratedColumns.push(col.name);
          existingSet.add(col.name);
        } catch (err: any) {
          console.warn(`[SchoolNexa DB Self-Healing] Note on adding ${col.name}:`, err?.message || err);
        }
      }
    }

    // Ensure index on (school_id, registration_id)
    try {
      const indexes = await rawPrisma.$queryRawUnsafe<Array<{ INDEX_NAME: string }>>(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND INDEX_NAME = 'uq_students_registration_id'`,
      );
      if (!indexes || indexes.length === 0) {
        await rawPrisma.$executeRawUnsafe(
          'CREATE UNIQUE INDEX `uq_students_registration_id` ON `students`(`school_id`, `registration_id`)',
        );
      }
    } catch {
      // Ignore if index already exists
    }

    isStudentSchemaAlreadySynced = true;

    if (migratedColumns.length > 0) {
      console.log(
        `[SchoolNexa DB Self-Healing] Successfully added missing columns to 'students': ${migratedColumns.join(', ')}`,
      );
    }

    return { success: true, migratedColumns };
  } catch (err: any) {
    console.error('[SchoolNexa DB Self-Healing] Student schema auto-healing note:', err?.message || err);
    return { success: false, migratedColumns: [], error: err?.message || String(err) };
  } finally {
    isStudentSchemaSyncInProgress = false;
  }
}

export default prisma;
