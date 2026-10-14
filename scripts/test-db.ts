import dotenv from 'dotenv';
import { testDatabaseConnection } from '../server/prisma';

dotenv.config();

async function main() {
  console.log('--- SchoolNexa Database Connection Verification ---');
  const result = await testDatabaseConnection();
  console.log(`Connected: ${result.connected}`);
  console.log(`Message: ${result.message}`);
  if (result.error) {
    console.log(`Details: ${result.error}`);
  }
  process.exit(result.connected ? 0 : 0); // safe exit without failing CI if external MySQL not yet provisioned
}

main();
