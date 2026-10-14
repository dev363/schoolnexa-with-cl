import dotenv from 'dotenv';
import { ensureStaffSchema, testDatabaseConnection } from '../server/prisma';

dotenv.config();

async function main() {
  console.log('--- SchoolNexa Database Schema Synchronization ---');
  console.log('Checking database connectivity...');

  const conn = await testDatabaseConnection();
  if (!conn.connected) {
    console.warn(`Database not reachable: ${conn.message}`);
    if (conn.error) console.warn(`Details: ${conn.error}`);
    console.log('\nIf running MySQL on MAMP or local server, please execute:');
    console.log(`
ALTER TABLE \`staff\`
  ADD COLUMN IF NOT EXISTS \`status\` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' AFTER \`qualification\`,
  ADD COLUMN IF NOT EXISTS \`profile_photo\` VARCHAR(500) NULL AFTER \`status\`,
  ADD COLUMN IF NOT EXISTS \`blood_group\` VARCHAR(10) NULL AFTER \`profile_photo\`,
  ADD COLUMN IF NOT EXISTS \`address\` TEXT NULL AFTER \`blood_group\`,
  ADD COLUMN IF NOT EXISTS \`city\` VARCHAR(100) NULL AFTER \`address\`,
  ADD COLUMN IF NOT EXISTS \`state\` VARCHAR(100) NULL AFTER \`city\`,
  ADD COLUMN IF NOT EXISTS \`postal_code\` VARCHAR(20) NULL AFTER \`state\`,
  ADD COLUMN IF NOT EXISTS \`emergency_contact_name\` VARCHAR(100) NULL AFTER \`postal_code\`,
  ADD COLUMN IF NOT EXISTS \`emergency_contact_phone\` VARCHAR(30) NULL AFTER \`emergency_contact_name\`,
  ADD COLUMN IF NOT EXISTS \`details\` JSON NULL AFTER \`emergency_contact_phone\`;
    `);
    process.exit(0);
  }

  console.log('Connected to MySQL database. Inspecting `staff` table columns...');
  const result = await ensureStaffSchema();

  if (result.success) {
    if (result.migratedColumns.length > 0) {
      console.log(`Successfully added missing column(s): ${result.migratedColumns.join(', ')}`);
    } else {
      console.log('All required Teacher management columns (status, etc.) already exist.');
    }
  } else {
    console.error(`Schema migration encountered an issue: ${result.error}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal synchronization error:', err);
  process.exit(1);
});
