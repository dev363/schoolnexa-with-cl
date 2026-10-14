import fs from 'fs';
import path from 'path';
import { platformAndGlobalSchema } from './schema/platform-global';
import { schoolCoreSchema } from './schema/school-core';
import { schoolFacilitiesOpsSchema } from './schema/school-facilities-ops';
import { schoolYearAcademicsSchema } from './schema/school-year-academics';

const header = `// ==============================================================================
// SCHOOLNEXA — ENTERPRISE DATABASE SCHEMA (PRISMA v5/v6)
// Authoritative Architecture: v3.3.1 (115 Physical Tables)
// Database Engine: MySQL 8.0+
// Isolation Model: Shared DB / Shared Schema / Application-Level Multi-Tenancy
// Foreign Key Mode: Native Foreign Keys (relationMode = "foreignKeys")
// ==============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "foreignKeys"
}
`;

function generateSchema() {
  const fullSchema = [
    header,
    platformAndGlobalSchema,
    schoolCoreSchema,
    schoolFacilitiesOpsSchema,
    schoolYearAcademicsSchema,
  ].join('\n');

  const prismaDir = path.join(process.cwd(), 'prisma');
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }

  const outputPath = path.join(prismaDir, 'schema.prisma');
  fs.writeFileSync(outputPath, fullSchema, 'utf8');
  console.log(`Successfully generated schema.prisma at ${outputPath}`);
}

generateSchema();
