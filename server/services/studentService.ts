import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { AppError } from '../middleware/errorHandler';
import {
  StudentDto,
  StudentDetailDto,
  StudentIdentityDto,
  StudentGuardianDto,
  StudentEnrollmentSummaryDto,
  StudentEnrollmentDetailDto,
  CreateStudentInput,
  UpdateStudentInput,
  StudentStatusUpdateInput,
  StudentFilterOptions,
} from '../types/student';
import { PaginationParams, PaginationMetadata } from '../types';
import { buildPagination } from '../utils/pagination';
import { getBusinessPrefix, getInternalIdPrefix, buildAdmissionNumber } from '../utils/identifiers';

// ==========================================
// FALLBACK SEED DATA FOR IN-MEMORY / DEMO
// ==========================================

interface FallbackStudent {
  id: string;
  schoolId: string;
  studentIdentityId: string;
  userId: string | null;
  admissionNumber: string;
  activeAdmissionNumber: string | null;
  registrationId?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  photoUrl?: string | null;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string | null;
  specialCategory?: string | null;
  specialCategoryDetails?: string | null;
  nationality?: string | null;
  religion?: string | null;
  category?: string | null;
  motherTongue?: string | null;
  placeOfBirth?: string | null;
  governmentId?: string | null;
  mobile?: string | null;
  alternateMobile?: string | null;
  email?: string | null;
  address: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string;
  state: string;
  country?: string | null;
  postalCode: string;
  previousSchool?: string | null;
  previousClass?: string | null;
  previousSchoolBoard?: string | null;
  transferCertificateNumber?: string | null;
  transferCertificateDate?: Date | null;
  notes?: string | null;
  status?: string;
  emergencyContact: string;
  emergencyPhone: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FallbackIdentity {
  id: string;
  nationalId: string;
  idType: string;
  birthCertNo: string | null;
  nationality: string;
  countryOfBirth: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FallbackParent {
  id: string;
  userId: string | null;
  primaryPhone: string;
  alternatePhone: string | null;
  occupation: string | null;
  annualIncome: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  fullName?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FallbackParentStudent {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  relationship: string;
  isPrimaryContact: boolean;
  canPickup: boolean;
  createdAt: Date;
}

interface FallbackEnrollment {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  rollNumber: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

let fallbackIdentities: FallbackIdentity[] = [
  {
    id: 'ident-001',
    nationalId: 'NAT-IND-4521',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-DEL-154',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: new Date('2026-01-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-002',
    nationalId: 'NAT-IND-9832',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-CHE-890',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: new Date('2026-01-12'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-003',
    nationalId: 'NAT-IND-1145',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-AHM-442',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-004',
    nationalId: 'NAT-IND-7712',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-KOL-913',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: new Date('2026-02-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-005',
    nationalId: 'NAT-IND-6651',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-LKO-204',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-006',
    nationalId: 'NAT-IND-3390',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-PUN-771',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: new Date('2026-01-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-007',
    nationalId: 'NAT-IND-8824',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-JAI-551',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-008',
    nationalId: 'NAT-IND-2291',
    idType: 'NATIONAL_ID',
    birthCertNo: 'BC-COC-119',
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: new Date('2026-01-25'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ident-stx-001',
    nationalId: 'NAT-GBR-9901',
    idType: 'PASSPORT',
    birthCertNo: 'BC-LON-001',
    nationality: 'British',
    countryOfBirth: 'United Kingdom',
    verifiedAt: new Date('2026-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackStudents: FallbackStudent[] = [
  {
    id: 'stu-oak-001',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-001',
    userId: null,
    admissionNumber: 'ADM-2026-001',
    activeAdmissionNumber: 'ADM-2026-001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'MALE',
    dateOfBirth: new Date('2015-04-15'),
    bloodGroup: 'B+',
    address: 'Flat 402, Shivam Residency, Sector 14, Rohini',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110085',
    emergencyContact: 'Ramesh Sharma',
    emergencyPhone: '+1 (555) 201-4452',
    deletedAt: null,
    createdAt: new Date('2026-01-15T08:00:00Z'),
    updatedAt: new Date('2026-01-15T08:00:00Z'),
  },
  {
    id: 'stu-oak-002',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-002',
    userId: null,
    admissionNumber: 'ADM-2026-002',
    activeAdmissionNumber: 'ADM-2026-002',
    firstName: 'Ananya',
    lastName: 'Iyer',
    gender: 'FEMALE',
    dateOfBirth: new Date('2014-08-22'),
    bloodGroup: 'O+',
    address: 'B-12, Greenfield Apartments, Adyar Canal Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600020',
    emergencyContact: 'Raman Iyer',
    emergencyPhone: '+1 (555) 741-2558',
    deletedAt: null,
    createdAt: new Date('2026-01-16T08:00:00Z'),
    updatedAt: new Date('2026-01-16T08:00:00Z'),
  },
  {
    id: 'stu-oak-003',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-003',
    userId: null,
    admissionNumber: 'ADM-2026-003',
    activeAdmissionNumber: 'ADM-2026-003',
    firstName: 'Aarav',
    lastName: 'Patel',
    gender: 'MALE',
    dateOfBirth: new Date('2016-01-10'),
    bloodGroup: 'A+',
    address: '34, Shantiniketan Society, Satellite Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '380015',
    emergencyContact: 'Jayesh Patel',
    emergencyPhone: '+1 (555) 426-0338',
    deletedAt: null,
    createdAt: new Date('2026-01-17T08:00:00Z'),
    updatedAt: new Date('2026-01-17T08:00:00Z'),
  },
  {
    id: 'stu-oak-004',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-004',
    userId: null,
    admissionNumber: 'ADM-2026-004',
    activeAdmissionNumber: 'ADM-2026-004',
    firstName: 'Tanya',
    lastName: 'Sengupta',
    gender: 'FEMALE',
    dateOfBirth: new Date('2013-11-05'),
    bloodGroup: 'AB+',
    address: '58/2, Southern Avenue',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700029',
    emergencyContact: 'Debashish Sengupta',
    emergencyPhone: '+1 (555) 332-9014',
    deletedAt: null,
    createdAt: new Date('2026-01-18T08:00:00Z'),
    updatedAt: new Date('2026-01-18T08:00:00Z'),
  },
  {
    id: 'stu-oak-005',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-005',
    userId: null,
    admissionNumber: 'ADM-2026-005',
    activeAdmissionNumber: 'ADM-2026-005',
    firstName: 'Mohammed',
    lastName: 'Zaid',
    gender: 'MALE',
    dateOfBirth: new Date('2015-09-18'),
    bloodGroup: 'O-',
    address: '14-B, Hazratganj Main Road',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    postalCode: '226001',
    emergencyContact: 'Tariq Zaid',
    emergencyPhone: '+1 (555) 522-7819',
    deletedAt: null,
    createdAt: new Date('2026-01-19T08:00:00Z'),
    updatedAt: new Date('2026-01-19T08:00:00Z'),
  },
  {
    id: 'stu-oak-006',
    schoolId: 'school-oakridge-01',
    studentIdentityId: 'ident-006',
    userId: null,
    admissionNumber: 'ADM-2026-006',
    activeAdmissionNumber: null, // Inactive / Archived demo student
    firstName: 'Priya',
    lastName: 'Deshmukh',
    gender: 'FEMALE',
    dateOfBirth: new Date('2012-07-30'),
    bloodGroup: 'B+',
    address: '202, Prabhat Road, Lane 4, Erandwane',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411004',
    emergencyContact: 'Vilas Deshmukh',
    emergencyPhone: '+1 (555) 202-6110',
    deletedAt: new Date('2026-02-15T10:00:00Z'),
    createdAt: new Date('2026-01-20T08:00:00Z'),
    updatedAt: new Date('2026-02-15T10:00:00Z'),
  },
  // Tenant Isolation check student for St. Xavier school
  {
    id: 'stu-stx-001',
    schoolId: 'school-stxavier-02',
    studentIdentityId: 'ident-stx-001',
    userId: null,
    admissionNumber: 'ADM-STX-001',
    activeAdmissionNumber: 'ADM-STX-001',
    firstName: 'David',
    lastName: 'Miller',
    gender: 'MALE',
    dateOfBirth: new Date('2014-05-10'),
    bloodGroup: 'A+',
    address: '124 Westminster Bridge Rd',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SE1 7XW',
    emergencyContact: 'Sarah Miller',
    emergencyPhone: '+44 20 7946 0991',
    deletedAt: null,
    createdAt: new Date('2026-01-21T08:00:00Z'),
    updatedAt: new Date('2026-01-21T08:00:00Z'),
  },
];

let fallbackParents: FallbackParent[] = [
  {
    id: 'par-001',
    userId: null,
    primaryPhone: '+1 (555) 201-4452',
    alternatePhone: '+1 (555) 201-4453',
    occupation: 'Senior Software Engineer',
    annualIncome: '120000',
    currentAddress: 'Flat 402, Shivam Residency, Sector 14, Rohini',
    permanentAddress: 'Flat 402, Shivam Residency, Sector 14, Rohini',
    emergencyContact: 'Sunita Sharma',
    emergencyPhone: '+1 (555) 201-4454',
    fullName: 'Ramesh Sharma',
    email: 'ramesh.sharma@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'par-002',
    userId: null,
    primaryPhone: '+1 (555) 741-2558',
    alternatePhone: null,
    occupation: 'Chartered Accountant',
    annualIncome: '110000',
    currentAddress: 'B-12, Greenfield Apartments, Adyar Canal Road',
    permanentAddress: 'B-12, Greenfield Apartments, Adyar Canal Road',
    emergencyContact: 'Lakshmi Iyer',
    emergencyPhone: '+1 (555) 741-2559',
    fullName: 'Raman Iyer',
    email: 'raman.iyer@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'par-003',
    userId: null,
    primaryPhone: '+1 (555) 426-0338',
    alternatePhone: null,
    occupation: 'Civil Engineer',
    annualIncome: '95000',
    currentAddress: '34, Shantiniketan Society, Satellite Road',
    permanentAddress: '34, Shantiniketan Society, Satellite Road',
    emergencyContact: 'Meena Patel',
    emergencyPhone: '+1 (555) 426-0339',
    fullName: 'Jayesh Patel',
    email: 'jayesh.patel@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'par-004',
    userId: null,
    primaryPhone: '+1 (555) 332-9014',
    alternatePhone: null,
    occupation: 'Physician',
    annualIncome: '150000',
    currentAddress: '58/2, Southern Avenue',
    permanentAddress: '58/2, Southern Avenue',
    emergencyContact: 'Aparna Sengupta',
    emergencyPhone: '+1 (555) 332-9015',
    fullName: 'Debashish Sengupta',
    email: 'debashish.s@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackParentStudents: FallbackParentStudent[] = [
  {
    id: 'ps-001',
    schoolId: 'school-oakridge-01',
    parentId: 'par-001',
    studentId: 'stu-oak-001',
    relationship: 'FATHER',
    isPrimaryContact: true,
    canPickup: true,
    createdAt: new Date(),
  },
  {
    id: 'ps-002',
    schoolId: 'school-oakridge-01',
    parentId: 'par-002',
    studentId: 'stu-oak-002',
    relationship: 'FATHER',
    isPrimaryContact: true,
    canPickup: true,
    createdAt: new Date(),
  },
  {
    id: 'ps-003',
    schoolId: 'school-oakridge-01',
    parentId: 'par-003',
    studentId: 'stu-oak-003',
    relationship: 'FATHER',
    isPrimaryContact: true,
    canPickup: true,
    createdAt: new Date(),
  },
  {
    id: 'ps-004',
    schoolId: 'school-oakridge-01',
    parentId: 'par-004',
    studentId: 'stu-oak-004',
    relationship: 'FATHER',
    isPrimaryContact: true,
    canPickup: true,
    createdAt: new Date(),
  },
];

let fallbackEnrollments: FallbackEnrollment[] = [
  {
    id: 'enr-001',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-001',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g8',
    className: 'Grade 8',
    sectionId: 'sec-oak-8a',
    sectionName: 'A',
    rollNumber: 12,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-002',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-002',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g8',
    className: 'Grade 8',
    sectionId: 'sec-oak-8b',
    sectionName: 'B',
    rollNumber: 5,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-003',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-003',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g9',
    className: 'Grade 9',
    sectionId: 'sec-oak-9a',
    sectionName: 'A',
    rollNumber: 2,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-004',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-004',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g9',
    className: 'Grade 9',
    sectionId: 'sec-oak-9b',
    sectionName: 'B',
    rollNumber: 18,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-005',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-005',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g10',
    className: 'Grade 10',
    sectionId: 'sec-oak-10a',
    sectionName: 'A',
    rollNumber: 21,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-006',
    schoolId: 'school-oakridge-01',
    studentId: 'stu-oak-006',
    academicYearId: 'ay-oak-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-oak-g10',
    className: 'Grade 10',
    sectionId: 'sec-oak-10b',
    sectionName: 'B',
    rollNumber: 9,
    status: 'DROPPED',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'enr-stx-001',
    schoolId: 'school-stxavier-02',
    studentId: 'stu-stx-001',
    academicYearId: 'ay-stm-2025',
    academicYearName: 'Academic Year 2025-2026',
    classId: 'cls-stx-g10',
    className: 'Grade 10',
    sectionId: 'sec-stx-10a',
    sectionName: 'A',
    rollNumber: 1,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ===================================================
// SAFE INPUT NORMALIZATION HELPERS (CONTROLLED DTO MAPPING)
// ===================================================

function normalizeOptionalString(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredString(val: unknown, fallback: string = ''): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeUpdateOptionalString(val: unknown): string | null | undefined {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeUpdateDate(val: unknown): Date | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === '') return null;
  const parsed = new Date(val as any);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Dynamic generation of unique, tenant-scoped registration IDs.
 * Format: REG-YYYY-NNNNN (e.g. REG-2026-48912)
 *
 * Safe against concurrent requests and tenant-scoped per schoolId.
 * Does not rely solely on table count.
 */
async function generateUniqueRegistrationId(
  schoolId: string,
  txOrPrisma?: any,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const db = txOrPrisma || prisma;

  // Try candidate generation with entropy and tenant uniqueness checks
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const candidate = `REG-${currentYear}-${randomSeq}`;

    let isTaken = false;
    try {
      const existing = await db.student.findFirst({
        where: { schoolId, registrationId: candidate },
        select: { id: true },
      });
      if (existing) {
        isTaken = true;
      }
    } catch {
      // In-memory fallback check
      isTaken = fallbackStudents.some(
        (s) => s.schoolId === schoolId && s.registrationId === candidate,
      );
    }

    if (!isTaken) {
      // Double check in-memory fallback store as well
      const existsInFallback = fallbackStudents.some(
        (s) => s.schoolId === schoolId && s.registrationId === candidate,
      );
      if (!existsInFallback) {
        return candidate;
      }
    }
  }

  // High-entropy timestamp + random suffix fallback for high concurrency
  const timestampPart = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `REG-${currentYear}-${timestampPart}${randomSuffix}`;
}

// Helper to format Student to compact DTO
function formatStudentDto(
  student: FallbackStudent | any,
  identity?: FallbackIdentity | any,
  activeEnrollment?: FallbackEnrollment | any,
): StudentDto {
  const isDeleted = Boolean(student.deletedAt);
  const fullName = student.middleName
    ? `${student.firstName} ${student.middleName} ${student.lastName}`.replace(/\s+/g, ' ').trim()
    : `${student.firstName} ${student.lastName}`.trim();

  return {
    id: student.id,
    schoolId: student.schoolId,
    studentIdentityId: student.studentIdentityId,
    userId: student.userId ?? null,
    admissionNumber: student.admissionNumber,
    activeAdmissionNumber: student.activeAdmissionNumber ?? null,
    registrationId: student.registrationId ?? null,
    firstName: student.firstName,
    middleName: student.middleName ?? null,
    lastName: student.lastName,
    fullName,
    photoUrl: student.photoUrl ?? null,
    gender: student.gender,
    dateOfBirth:
      student.dateOfBirth instanceof Date
        ? student.dateOfBirth.toISOString().split('T')[0]
        : String(student.dateOfBirth).split('T')[0],
    bloodGroup: student.bloodGroup ?? null,
    specialCategory: student.specialCategory ?? null,
    specialCategoryDetails: student.specialCategoryDetails ?? null,
    nationality: student.nationality ?? identity?.nationality ?? 'Indian',
    religion: student.religion ?? null,
    category: student.category ?? null,
    motherTongue: student.motherTongue ?? null,
    placeOfBirth: student.placeOfBirth ?? null,
    governmentId: student.governmentId ?? identity?.nationalId ?? null,
    mobile: student.mobile ?? null,
    alternateMobile: student.alternateMobile ?? null,
    email: student.email ?? null,
    address: student.address,
    addressLine1: student.addressLine1 ?? null,
    addressLine2: student.addressLine2 ?? null,
    city: student.city,
    state: student.state,
    country: student.country ?? 'India',
    postalCode: student.postalCode,
    previousSchool: student.previousSchool ?? null,
    previousClass: student.previousClass ?? null,
    previousSchoolBoard: student.previousSchoolBoard ?? null,
    transferCertificateNumber: student.transferCertificateNumber ?? null,
    transferCertificateDate: student.transferCertificateDate
      ? (student.transferCertificateDate instanceof Date
          ? student.transferCertificateDate.toISOString().split('T')[0]
          : String(student.transferCertificateDate).split('T')[0])
      : null,
    notes: student.notes ?? null,
    emergencyContact: student.emergencyContact,
    emergencyPhone: student.emergencyPhone,
    status: student.status || (isDeleted ? 'INACTIVE' : 'ACTIVE'),
    deletedAt: student.deletedAt ? new Date(student.deletedAt).toISOString() : null,
    createdAt: new Date(student.createdAt).toISOString(),
    updatedAt: new Date(student.updatedAt).toISOString(),
    identity: identity
      ? {
          nationalId: identity.nationalId,
          idType: identity.idType,
          nationality: identity.nationality,
        }
      : undefined,
    currentEnrollment: activeEnrollment
      ? {
          id: activeEnrollment.id,
          academicYearId: activeEnrollment.academicYearId,
          academicYearName:
            activeEnrollment.academicYearName ?? activeEnrollment.academicYear?.name,
          classId: activeEnrollment.classId ?? activeEnrollment.section?.class?.id,
          className: activeEnrollment.className ?? activeEnrollment.section?.class?.name,
          sectionId:
            activeEnrollment.sectionId ??
            activeEnrollment.section?.id ??
            activeEnrollment.academicYearSectionId,
          sectionName: activeEnrollment.sectionName ?? activeEnrollment.section?.sectionName,
          rollNumber: activeEnrollment.rollNumber ?? null,
          status: activeEnrollment.status,
        }
      : null,
  };
}

export const studentService = {
  /**
   * List students with filtering, server-side search, sorting, and pagination.
   * Strictly enforces school-level tenant isolation.
   */
  async listStudents(
    schoolId: string,
    pagination: Partial<PaginationParams> = {},
    filters: StudentFilterOptions = {},
  ): Promise<{ data: StudentDto[]; meta: PaginationMetadata }> {
    const page = pagination.page && pagination.page >= 1 ? pagination.page : 1;
    const pageSize = pagination.pageSize && pagination.pageSize >= 1 ? pagination.pageSize : 20;
    const skip = pagination.skip !== undefined ? pagination.skip : (page - 1) * pageSize;
    const take = pagination.take !== undefined ? pagination.take : pageSize;
    const safePagination = { page, pageSize, skip, take };

    try {
      const where: any = { schoolId };

      // Status filter
      if (filters.status === 'INACTIVE') {
        where.deletedAt = { not: null };
      } else if (filters.status === 'ALL') {
        // No deletedAt filter
      } else {
        // Default to ACTIVE students
        where.deletedAt = null;
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'ALL') {
        where.gender = filters.gender;
      }

      // Blood group filter
      if (filters.bloodGroup && filters.bloodGroup !== 'ALL') {
        where.bloodGroup = filters.bloodGroup;
      }

      // Search query across legitimate student and identity attributes
      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim();
        where.OR = [
          { firstName: { contains: term } },
          { middleName: { contains: term } },
          { lastName: { contains: term } },
          { admissionNumber: { contains: term } },
          { registrationId: { contains: term } },
          { emergencyContact: { contains: term } },
          { identity: { nationalId: { contains: term } } },
        ];
      }

      // Class, Section or Academic Year filter via Enrollment relationship
      if (filters.classId || filters.sectionId || filters.academicYearId) {
        where.enrollments = {
          some: {
            schoolId,
            ...(filters.academicYearId ? { academicYearId: filters.academicYearId } : {}),
            ...(filters.sectionId ? { academicYearSectionId: filters.sectionId } : {}),
            ...(filters.classId ? { section: { classId: filters.classId } } : {}),
          },
        };
      }

      // Sorting
      const sortField = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      const orderBy: any = {};
      if (
        sortField === 'firstName' ||
        sortField === 'lastName' ||
        sortField === 'admissionNumber' ||
        sortField === 'dateOfBirth' ||
        sortField === 'createdAt'
      ) {
        orderBy[sortField] = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      const [total, students] = await Promise.all([
        prisma.student.count({ where }),
        prisma.student.findMany({
          where,
          skip: safePagination.skip,
          take: safePagination.take,
          orderBy,
          include: {
            identity: true,
            enrollments: {
              where: {
                schoolId,
                status: 'ACTIVE',
                ...(filters.academicYearId ? { academicYearId: filters.academicYearId } : {}),
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                academicYear: true,
                section: {
                  include: {
                    class: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const data: StudentDto[] = students.map((s: any) =>
        formatStudentDto(s, s.identity, s.enrollments?.[0]),
      );

      return {
        data,
        meta: buildPagination(total, safePagination.page, safePagination.pageSize),
      };
    } catch {
      // Database not reachable — fallback to memory store
      let filtered = fallbackStudents.filter((s) => s.schoolId === schoolId);

      // Status filter
      if (filters.status === 'INACTIVE') {
        filtered = filtered.filter((s) => s.deletedAt !== null);
      } else if (filters.status === 'ALL') {
        // keep all
      } else {
        // default ACTIVE
        filtered = filtered.filter((s) => s.deletedAt === null);
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'ALL') {
        filtered = filtered.filter((s) => s.gender === filters.gender);
      }

      // Blood group filter
      if (filters.bloodGroup && filters.bloodGroup !== 'ALL') {
        filtered = filtered.filter((s) => s.bloodGroup === filters.bloodGroup);
      }

      // Search filter
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        filtered = filtered.filter((s) => {
          const ident = fallbackIdentities.find((i) => i.id === s.studentIdentityId);
          return (
            s.firstName.toLowerCase().includes(q) ||
            (s.middleName && s.middleName.toLowerCase().includes(q)) ||
            s.lastName.toLowerCase().includes(q) ||
            s.admissionNumber.toLowerCase().includes(q) ||
            (s.registrationId && s.registrationId.toLowerCase().includes(q)) ||
            s.emergencyContact.toLowerCase().includes(q) ||
            (ident && ident.nationalId.toLowerCase().includes(q))
          );
        });
      }

      // Enrollment filter (classId, sectionId, academicYearId)
      if (filters.classId || filters.sectionId || filters.academicYearId) {
        filtered = filtered.filter((s) => {
          const enrs = fallbackEnrollments.filter(
            (e) => e.schoolId === schoolId && e.studentId === s.id,
          );
          return enrs.some((e) => {
            if (filters.academicYearId && e.academicYearId !== filters.academicYearId) return false;
            if (filters.sectionId && e.sectionId !== filters.sectionId) return false;
            if (filters.classId && e.classId !== filters.classId) return false;
            return true;
          });
        });
      }

      // Sort
      const sortField = filters.sortBy || 'createdAt';
      const isAsc = filters.sortOrder === 'asc';
      filtered.sort((a, b) => {
        let valA: any = (a as any)[sortField];
        let valB: any = (b as any)[sortField];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });

      const total = filtered.length;
      const sliced = filtered.slice(safePagination.skip, safePagination.skip + safePagination.take);

      const data: StudentDto[] = sliced.map((s) => {
        const ident = fallbackIdentities.find((i) => i.id === s.studentIdentityId);
        const enr = fallbackEnrollments.find(
          (e) => e.schoolId === schoolId && e.studentId === s.id && e.status === 'ACTIVE',
        );
        return formatStudentDto(s, ident, enr);
      });

      return {
        data,
        meta: buildPagination(total, safePagination.page, safePagination.pageSize),
      };
    }
  },

  /**
   * Helper to format an in-memory fallback student into a complete StudentDetailDto
   */
  formatFallbackStudentDetail(schoolId: string, student: FallbackStudent): StudentDetailDto {
    const ident = fallbackIdentities.find((i) => i.id === student.studentIdentityId) || {
      id: `${getInternalIdPrefix('identity')}auto`,
      nationalId: `${getBusinessPrefix('nationalIdentity')}AUTOGEN`,
      idType: 'NATIONAL_ID',
      birthCertNo: null,
      nationality: 'Indian',
      countryOfBirth: 'India',
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const enrs = fallbackEnrollments.filter(
      (e) => e.studentId === student.id && e.schoolId === schoolId,
    );
    const activeEnrollment = enrs.find((e) => e.status === 'ACTIVE') || enrs[0];

    const parentRels = fallbackParentStudents.filter(
      (ps) => ps.studentId === student.id && ps.schoolId === schoolId,
    );
    const guardians: StudentGuardianDto[] = parentRels.map((ps) => {
      const par = fallbackParents.find((p) => p.id === ps.parentId) || {
        id: ps.parentId,
        userId: null,
        primaryPhone: student.emergencyPhone,
        alternatePhone: null,
        occupation: 'Parent/Guardian',
        annualIncome: null,
        currentAddress: student.address,
        permanentAddress: student.address,
        emergencyContact: student.emergencyContact,
        emergencyPhone: student.emergencyPhone,
        fullName: student.emergencyContact,
        email: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        id: ps.id,
        parentId: par.id,
        relationship: ps.relationship,
        isPrimaryContact: ps.isPrimaryContact,
        canPickup: ps.canPickup,
        parent: {
          id: par.id,
          primaryPhone: par.primaryPhone,
          alternatePhone: par.alternatePhone,
          occupation: par.occupation,
          annualIncome: par.annualIncome,
          currentAddress: par.currentAddress,
          permanentAddress: par.permanentAddress,
          emergencyContact: par.emergencyContact,
          emergencyPhone: par.emergencyPhone,
          user: par.fullName
            ? { id: 'usr-par', fullName: par.fullName, email: par.email || '' }
            : null,
        },
      };
    });

    const enrollments: StudentEnrollmentDetailDto[] = enrs.map((e) => ({
      id: e.id,
      academicYearId: e.academicYearId,
      academicYearName: e.academicYearName,
      classId: e.classId,
      className: e.className,
      sectionId: e.sectionId,
      sectionName: e.sectionName,
      rollNumber: e.rollNumber,
      status: e.status,
      createdAt: new Date(e.createdAt).toISOString(),
      updatedAt: new Date(e.updatedAt).toISOString(),
    }));

    const baseDto = formatStudentDto(student, ident, activeEnrollment);

    return {
      ...baseDto,
      identity: {
        id: ident.id,
        nationalId: ident.nationalId,
        idType: ident.idType,
        birthCertNo: ident.birthCertNo,
        nationality: ident.nationality,
        countryOfBirth: ident.countryOfBirth,
        verifiedAt: ident.verifiedAt ? ident.verifiedAt.toISOString() : null,
      },
      guardians,
      enrollments,
      documents: [],
      transferCertificates: [],
    };
  },

  /**
   * Retrieve full student details including identity, guardians, enrollments, and documents.
   */
  async getStudentById(schoolId: string, studentId: string): Promise<StudentDetailDto> {
    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId },
        include: {
          identity: true,
          parents: {
            include: {
              parent: {
                include: {
                  user: true,
                },
              },
            },
          },
          enrollments: {
            include: {
              academicYear: true,
              section: {
                include: {
                  class: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          documents: true,
          transferCertificates: true,
        },
      });

      if (!student) {
        const fallback = fallbackStudents.find(
          (s) => s.id === studentId && s.schoolId === schoolId,
        );
        if (fallback) {
          return this.formatFallbackStudentDetail(schoolId, fallback);
        }

        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      const activeEnrollment =
        student.enrollments.find((e: any) => e.status === 'ACTIVE') || student.enrollments[0];
      const baseDto = formatStudentDto(student, student.identity, activeEnrollment);

      const guardians: StudentGuardianDto[] = student.parents.map((ps: any) => ({
        id: ps.id,
        parentId: ps.parentId,
        relationship: ps.relationship,
        isPrimaryContact: ps.isPrimaryContact,
        canPickup: ps.canPickup,
        parent: {
          id: ps.parent.id,
          primaryPhone: ps.parent.primaryPhone,
          alternatePhone: ps.parent.alternatePhone,
          occupation: ps.parent.occupation,
          annualIncome: ps.parent.annualIncome ? String(ps.parent.annualIncome) : null,
          currentAddress: ps.parent.currentAddress,
          permanentAddress: ps.parent.permanentAddress,
          emergencyContact: ps.parent.emergencyContact,
          emergencyPhone: ps.parent.emergencyPhone,
          user: ps.parent.user
            ? {
                id: ps.parent.user.id,
                fullName: ps.parent.user.fullName || '',
                email: ps.parent.user.email,
              }
            : null,
        },
      }));

      const enrollments: StudentEnrollmentDetailDto[] = student.enrollments.map((e: any) => ({
        id: e.id,
        academicYearId: e.academicYearId,
        academicYearName: e.academicYear?.name,
        classId: e.section?.class?.id,
        className: e.section?.class?.name,
        sectionId: e.section?.id ?? e.academicYearSectionId,
        sectionName: e.section?.sectionName,
        rollNumber: e.rollNumber ?? null,
        status: e.status,
        createdAt: new Date(e.createdAt).toISOString(),
        updatedAt: new Date(e.updatedAt).toISOString(),
      }));

      const documents = student.documents.map((d: any) => ({
        id: d.id,
        storedFileId: d.storedFileId,
        documentType: d.documentType,
        documentNumber: d.documentNumber,
        verifiedAt: d.verifiedAt ? new Date(d.verifiedAt).toISOString() : null,
        createdAt: new Date(d.createdAt).toISOString(),
      }));

      const transferCertificates = student.transferCertificates.map((tc: any) => ({
        id: tc.id,
        certificateNumber: tc.certificateNumber,
        issueDate: new Date(tc.issueDate).toISOString().split('T')[0],
        reasonForLeaving: tc.reasonForLeaving,
        conductRemarks: tc.conductRemarks,
        status: tc.status,
        createdAt: new Date(tc.createdAt).toISOString(),
      }));

      return {
        ...baseDto,
        identity: {
          id: student.identity.id,
          nationalId: student.identity.nationalId,
          idType: student.identity.idType,
          birthCertNo: student.identity.birthCertNo,
          nationality: student.identity.nationality,
          countryOfBirth: student.identity.countryOfBirth,
          verifiedAt: student.identity.verifiedAt
            ? new Date(student.identity.verifiedAt).toISOString()
            : null,
        },
        guardians,
        enrollments,
        documents,
        transferCertificates,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      const student = fallbackStudents.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      return this.formatFallbackStudentDetail(schoolId, student);
    }
  },

  /**
   * Create a new student master record.
   * Checks uniqueness of admission number within the school.
   */
  async createStudent(schoolId: string, input: CreateStudentInput): Promise<StudentDetailDto> {
    // 1. Controlled input normalization
    const firstName = normalizeRequiredString(input.firstName);
    const lastName = normalizeRequiredString(input.lastName, firstName);
    const middleName = normalizeOptionalString(input.middleName);
    const photoUrl = normalizeOptionalString(input.photoUrl);
    const gender = normalizeRequiredString(input.gender, 'OTHER');
    const dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : new Date();
    const bloodGroup = normalizeOptionalString(input.bloodGroup);
    const specialCategory = normalizeOptionalString(input.specialCategory) || 'N';
    const specialCategoryDetails = normalizeOptionalString(input.specialCategoryDetails);
    const nationality = normalizeOptionalString(input.nationality) || 'Indian';
    const religion = normalizeOptionalString(input.religion);
    const category = normalizeOptionalString(input.category);
    const motherTongue = normalizeOptionalString(input.motherTongue);
    const placeOfBirth = normalizeOptionalString(input.placeOfBirth);
    const governmentId = normalizeOptionalString(input.governmentId);
    const mobile = normalizeOptionalString(input.mobile);
    const alternateMobile = normalizeOptionalString(input.alternateMobile);
    const email = normalizeOptionalString(input.email);
    const addressLine1 = normalizeOptionalString(input.addressLine1);
    const addressLine2 = normalizeOptionalString(input.addressLine2);
    const city = normalizeRequiredString(input.city, 'City');
    const state = normalizeRequiredString(input.state, 'State');
    const country = normalizeOptionalString(input.country) || 'India';
    const postalCode = normalizeRequiredString(input.postalCode, '100000');
    const address =
      normalizeOptionalString(input.address) ||
      [addressLine1, addressLine2].filter(Boolean).join(', ') ||
      'Address not specified';
    const previousSchool = normalizeOptionalString(input.previousSchool);
    const previousClass = normalizeOptionalString(input.previousClass);
    const previousSchoolBoard = normalizeOptionalString(input.previousSchoolBoard);
    const transferCertificateNumber = normalizeOptionalString(input.transferCertificateNumber);
    const transferCertificateDate = input.transferCertificateDate
      ? new Date(input.transferCertificateDate)
      : null;
    const notes = normalizeOptionalString(input.notes);
    const status = normalizeRequiredString(input.status, 'ACTIVE');

    // Registration ID: unique, tenant-scoped, auto-generated if missing or invalid
    const rawRegId = normalizeOptionalString(input.registrationId);
    let registrationId: string | null = null;

    // Reject temporary frontend IDs or admission numbers accidentally provided as registrationId
    const isTempId = Boolean(rawRegId && /^(temp|tmp|g-|stu-temp)/i.test(rawRegId));
    const isAdmissionNumber = Boolean(
      rawRegId && (/^ADM-/i.test(rawRegId) || rawRegId === input.admissionNumber),
    );

    if (rawRegId && !isTempId && !isAdmissionNumber) {
      registrationId = rawRegId;
    } else {
      registrationId = await generateUniqueRegistrationId(schoolId);
    }

    // Admission Number: auto-generated if missing
    let admissionNumber = normalizeOptionalString(input.admissionNumber);
    if (!admissionNumber) {
      admissionNumber = buildAdmissionNumber(
        new Date().getFullYear(),
        Math.floor(1000 + Math.random() * 9000),
      );
    }

    // Emergency contact & phone fallbacks
    const primaryGuardian =
      input.guardians?.find((g) => g.isPrimary || g.isPrimaryContact || g.isEmergencyContact) ||
      input.guardians?.[0];
    const primaryFullName = primaryGuardian
      ? normalizeOptionalString(primaryGuardian.fullName) ||
        [primaryGuardian.firstName, primaryGuardian.middleName, primaryGuardian.lastName]
          .filter(Boolean)
          .join(' ')
          .trim()
      : '';
    const primaryPhone =
      primaryGuardian?.mobile?.trim() ||
      primaryGuardian?.primaryPhone?.trim() ||
      '';

    const emergencyContact =
      normalizeOptionalString(input.emergencyContact) ||
      primaryFullName ||
      `${firstName}'s Contact`;
    const emergencyPhone =
      normalizeOptionalString(input.emergencyPhone) ||
      primaryPhone ||
      mobile ||
      '+1 (555) 000-0000';

    try {
      // 1. Verify admissionNumber uniqueness for active students in school
      const existingAdm = await prisma.student.findFirst({
        where: {
          schoolId,
          activeAdmissionNumber: admissionNumber,
          deletedAt: null,
        },
      });

      if (existingAdm) {
        throw new AppError('Admission number already exists in this school', 409, [
          {
            message: `An active student with admission number '${admissionNumber}' already exists`,
            code: 'DUPLICATE_ADMISSION_NUMBER',
          },
        ]);
      }

      // 1b. Verify registrationId uniqueness in school if provided/generated
      if (registrationId) {
        const existingReg = await prisma.student.findFirst({
          where: {
            schoolId,
            registrationId,
          },
        });
        if (existingReg) {
          // If collision occurred, generate timestamp-based ID
          registrationId = `REG-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        }
      }

      // 2. Resolve nationalId for StudentIdentity
      const natPrefix = getBusinessPrefix('nationalIdentity');
      const nationalId =
        governmentId ||
        (input.nationalId && input.nationalId.trim()) ||
        `${natPrefix}${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      // 3. Atomically execute Student + Identity + Guardian (Parent) + StudentGuardian (ParentStudent)
      const createdStudentId = await prisma.$transaction(async (tx) => {
        let identity = await tx.studentIdentity.findUnique({
          where: { nationalId },
        });

        if (!identity) {
          identity = await tx.studentIdentity.create({
            data: {
              nationalId,
              idType: input.idType || 'NATIONAL_ID',
              birthCertNo: input.birthCertNo?.trim() || null,
              nationality,
              countryOfBirth: input.countryOfBirth?.trim() || placeOfBirth || null,
            },
          });
        }

        // Ensure registrationId is dynamically assigned or verified unique inside transaction
        let finalRegId = registrationId;
        if (!finalRegId) {
          finalRegId = await generateUniqueRegistrationId(schoolId, tx);
        } else {
          const collision = await tx.student.findFirst({
            where: { schoolId, registrationId: finalRegId },
            select: { id: true },
          });
          if (collision) {
            finalRegId = await generateUniqueRegistrationId(schoolId, tx);
          }
        }

        // Controlled mapping to Prisma Student model
        const student = await tx.student.create({
          data: {
            schoolId,
            studentIdentityId: identity.id,
            admissionNumber,
            registrationId: finalRegId,
            firstName,
            middleName,
            lastName,
            photoUrl,
            gender,
            dateOfBirth,
            bloodGroup,
            specialCategory,
            specialCategoryDetails,
            nationality,
            religion,
            category,
            motherTongue,
            placeOfBirth,
            governmentId,
            mobile,
            alternateMobile,
            email,
            address,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode,
            previousSchool,
            previousClass,
            previousSchoolBoard,
            transferCertificateNumber,
            transferCertificateDate,
            notes,
            status,
            emergencyContact,
            emergencyPhone,
          },
        });

        // Handle optional guardians creation & linking with all supported fields
        if (input.guardians && input.guardians.length > 0) {
          for (const g of input.guardians) {
            const gFirstName = normalizeOptionalString(g.firstName) || '';
            const gMiddleName = normalizeOptionalString(g.middleName) || '';
            const gLastName = normalizeOptionalString(g.lastName) || '';
            const gFullName =
              normalizeOptionalString(g.fullName) ||
              [gFirstName, gMiddleName, gLastName].filter(Boolean).join(' ').trim() ||
              'Guardian';

            const gMobile =
              normalizeOptionalString(g.mobile) ||
              normalizeOptionalString(g.primaryPhone) ||
              emergencyPhone;

            const gAlternateMobile =
              normalizeOptionalString(g.alternateMobile) ||
              normalizeOptionalString(g.alternatePhone);

            const gEmail = normalizeOptionalString(g.email);
            const gOccupation = normalizeOptionalString(g.occupation);

            // Construct full address from components if present
            const gAddressLine = normalizeOptionalString(g.address);
            const gCity = normalizeOptionalString(g.city);
            const gState = normalizeOptionalString(g.state);
            const gCountry = normalizeOptionalString(g.country);
            const gPostalCode = normalizeOptionalString(g.postalCode);
            const gFormattedAddress =
              [gAddressLine, gCity, gState, gCountry, gPostalCode].filter(Boolean).join(', ') ||
              normalizeOptionalString(g.currentAddress) ||
              address;

            // Optional User linking if email provided
            let userId: string | null = null;
            if (gEmail) {
              const existingUser = await tx.user.findUnique({
                where: { email: gEmail.toLowerCase() },
              });
              if (existingUser) {
                userId = existingUser.id;
              } else {
                try {
                  const newUser = await tx.user.create({
                    data: {
                      email: gEmail.toLowerCase(),
                      fullName: gFullName,
                      phone: gMobile,
                      passwordHash: 'NOPASSWORD_PARENT_CONTACT',
                      isActive: true,
                    },
                  });
                  userId = newUser.id;
                } catch {
                  userId = null;
                }
              }
            }

            // Create Parent (Guardian) record using standard DB UUID (ignore frontend temp IDs)
            const parent = await tx.parent.create({
              data: {
                userId,
                primaryPhone: gMobile,
                alternatePhone: gAlternateMobile,
                occupation: gOccupation,
                currentAddress: gFormattedAddress,
                permanentAddress: gFormattedAddress,
                emergencyContact: gFullName,
                emergencyPhone: gMobile,
              },
            });

            // Create ParentStudent (StudentGuardian) relationship record
            const isPrimary =
              g.isPrimary !== undefined
                ? Boolean(g.isPrimary)
                : g.isPrimaryContact !== false;
            const canPickup =
              g.isAuthorizedPickup !== undefined
                ? Boolean(g.isAuthorizedPickup)
                : g.canPickup !== false;

            await tx.parentStudent.create({
              data: {
                schoolId,
                parentId: parent.id,
                studentId: student.id,
                relationship: (g.relationship || 'GUARDIAN').toUpperCase(),
                isPrimaryContact: isPrimary,
                canPickup: canPickup,
              },
            });
          }
        }

        return student.id;
      });

      return await this.getStudentById(schoolId, createdStudentId);
    } catch (err) {
      if (err instanceof AppError) throw err;

      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = String(err.meta?.target || '');
        if (target.includes('admission') || target.includes('uq_students_active_admission')) {
          throw new AppError('Admission number already exists in this school', 409, [
            {
              message: `An active student with admission number '${admissionNumber}' already exists`,
              code: 'DUPLICATE_ADMISSION_NUMBER',
            },
          ]);
        }
        if (target.includes('registration')) {
          throw new AppError('Registration ID already exists in this school', 409, [
            {
              message: `A student with this registration ID already exists in this school`,
              code: 'DUPLICATE_REGISTRATION_ID',
            },
          ]);
        }
      }

      // In-memory fallback
      const duplicate = fallbackStudents.find(
        (s) =>
          s.schoolId === schoolId &&
          s.activeAdmissionNumber?.toLowerCase() === admissionNumber.toLowerCase() &&
          s.deletedAt === null,
      );

      if (duplicate) {
        throw new AppError('Admission number already exists in this school', 409, [
          {
            message: `An active student with admission number '${admissionNumber}' already exists`,
            code: 'DUPLICATE_ADMISSION_NUMBER',
          },
        ]);
      }

      const identId = `${getInternalIdPrefix('identity')}${crypto.randomUUID().slice(0, 8)}`;
      const natId =
        governmentId ||
        (input.nationalId && input.nationalId.trim()) ||
        `${getBusinessPrefix('nationalIdentity')}${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      const newIdent: FallbackIdentity = {
        id: identId,
        nationalId: natId,
        idType: input.idType || 'NATIONAL_ID',
        birthCertNo: input.birthCertNo?.trim() || null,
        nationality,
        countryOfBirth: input.countryOfBirth?.trim() || placeOfBirth || null,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackIdentities.push(newIdent);

      // In-memory fallback: Ensure registrationId is unique in fallback store
      let fallbackRegId = registrationId;
      if (
        !fallbackRegId ||
        fallbackStudents.some(
          (s) => s.schoolId === schoolId && s.registrationId === fallbackRegId,
        )
      ) {
        fallbackRegId = await generateUniqueRegistrationId(schoolId);
      }

      const studentId = `${getInternalIdPrefix('student')}${crypto.randomUUID().slice(0, 8)}`;
      const newStudent: FallbackStudent = {
        id: studentId,
        schoolId,
        studentIdentityId: identId,
        userId: null,
        admissionNumber,
        activeAdmissionNumber: admissionNumber,
        registrationId: fallbackRegId,
        firstName,
        middleName,
        lastName,
        photoUrl,
        gender,
        dateOfBirth,
        bloodGroup,
        specialCategory,
        specialCategoryDetails,
        nationality,
        religion,
        category,
        motherTongue,
        placeOfBirth,
        governmentId,
        mobile,
        alternateMobile,
        email,
        address,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        previousSchool,
        previousClass,
        previousSchoolBoard,
        transferCertificateNumber,
        transferCertificateDate,
        notes,
        status,
        emergencyContact,
        emergencyPhone,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackStudents.unshift(newStudent);

      if (input.guardians && input.guardians.length > 0) {
        for (const g of input.guardians) {
          const parId = `${getInternalIdPrefix('parent')}${crypto.randomUUID().slice(0, 8)}`;
          const gFirstName = normalizeOptionalString(g.firstName) || '';
          const gMiddleName = normalizeOptionalString(g.middleName) || '';
          const gLastName = normalizeOptionalString(g.lastName) || '';
          const gFullName =
            normalizeOptionalString(g.fullName) ||
            [gFirstName, gMiddleName, gLastName].filter(Boolean).join(' ').trim() ||
            'Guardian';

          const gMobile =
            normalizeOptionalString(g.mobile) ||
            normalizeOptionalString(g.primaryPhone) ||
            emergencyPhone;

          const gAlternateMobile =
            normalizeOptionalString(g.alternateMobile) ||
            normalizeOptionalString(g.alternatePhone);

          const gEmail = normalizeOptionalString(g.email);
          const gOccupation = normalizeOptionalString(g.occupation);

          const gAddressLine = normalizeOptionalString(g.address);
          const gCity = normalizeOptionalString(g.city);
          const gState = normalizeOptionalString(g.state);
          const gCountry = normalizeOptionalString(g.country);
          const gPostalCode = normalizeOptionalString(g.postalCode);
          const gFormattedAddress =
            [gAddressLine, gCity, gState, gCountry, gPostalCode].filter(Boolean).join(', ') ||
            normalizeOptionalString(g.currentAddress) ||
            address;

          fallbackParents.push({
            id: parId,
            userId: null,
            primaryPhone: gMobile,
            alternatePhone: gAlternateMobile,
            occupation: gOccupation,
            annualIncome: null,
            currentAddress: gFormattedAddress,
            permanentAddress: gFormattedAddress,
            emergencyContact: gFullName,
            emergencyPhone: gMobile,
            fullName: gFullName,
            email: gEmail || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          const isPrimary =
            g.isPrimary !== undefined
              ? Boolean(g.isPrimary)
              : g.isPrimaryContact !== false;
          const canPickup =
            g.isAuthorizedPickup !== undefined
              ? Boolean(g.isAuthorizedPickup)
              : g.canPickup !== false;

          fallbackParentStudents.push({
            id: `${getInternalIdPrefix('parentStudent')}${crypto.randomUUID().slice(0, 8)}`,
            schoolId,
            parentId: parId,
            studentId,
            relationship: (g.relationship || 'GUARDIAN').toUpperCase(),
            isPrimaryContact: isPrimary,
            canPickup: canPickup,
            createdAt: new Date(),
          });
        }
      }

      return this.formatFallbackStudentDetail(schoolId, newStudent);
    }
  },

  /**
   * Update student master information.
   * Verifies school tenancy and checks admission number uniqueness if changed.
   */
  async updateStudent(
    schoolId: string,
    studentId: string,
    input: UpdateStudentInput,
  ): Promise<StudentDetailDto> {
    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId },
      });

      if (!student) {
        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      // If admission number is changed, check uniqueness
      if (input.admissionNumber && input.admissionNumber.trim() !== student.admissionNumber) {
        const newAdm = input.admissionNumber.trim();
        const conflict = await prisma.student.findFirst({
          where: {
            schoolId,
            activeAdmissionNumber: newAdm,
            id: { not: studentId },
            deletedAt: null,
          },
        });

        if (conflict) {
          throw new AppError('Admission number already in use', 409, [
            {
              message: `An active student with admission number '${newAdm}' already exists`,
              code: 'DUPLICATE_ADMISSION_NUMBER',
            },
          ]);
        }
      }

      // If registrationId is explicitly updated and changed, check uniqueness
      if (input.registrationId !== undefined && input.registrationId !== null) {
        const trimmedReg = input.registrationId.trim();
        if (trimmedReg && trimmedReg !== student.registrationId) {
          const regConflict = await prisma.student.findFirst({
            where: {
              schoolId,
              registrationId: trimmedReg,
              id: { not: studentId },
            },
          });
          if (regConflict) {
            throw new AppError('Registration ID already in use', 409, [
              {
                message: `A student with registration ID '${trimmedReg}' already exists in this school`,
                code: 'DUPLICATE_REGISTRATION_ID',
              },
            ]);
          }
        }
      }

      // Explicit, safe partial update mapping (undefined fields are omitted, preserving existing values)
      const updateData: any = {};
      if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
      if (input.middleName !== undefined)
        updateData.middleName = normalizeUpdateOptionalString(input.middleName);
      if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
      if (input.photoUrl !== undefined)
        updateData.photoUrl = normalizeUpdateOptionalString(input.photoUrl);
      if (input.gender !== undefined) updateData.gender = input.gender;
      if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
      if (input.bloodGroup !== undefined)
        updateData.bloodGroup = normalizeUpdateOptionalString(input.bloodGroup);
      if (input.specialCategory !== undefined)
        updateData.specialCategory = normalizeUpdateOptionalString(input.specialCategory);
      if (input.specialCategoryDetails !== undefined)
        updateData.specialCategoryDetails = normalizeUpdateOptionalString(input.specialCategoryDetails);
      if (input.nationality !== undefined)
        updateData.nationality = normalizeUpdateOptionalString(input.nationality);
      if (input.religion !== undefined)
        updateData.religion = normalizeUpdateOptionalString(input.religion);
      if (input.category !== undefined)
        updateData.category = normalizeUpdateOptionalString(input.category);
      if (input.motherTongue !== undefined)
        updateData.motherTongue = normalizeUpdateOptionalString(input.motherTongue);
      if (input.placeOfBirth !== undefined)
        updateData.placeOfBirth = normalizeUpdateOptionalString(input.placeOfBirth);
      if (input.governmentId !== undefined)
        updateData.governmentId = normalizeUpdateOptionalString(input.governmentId);
      if (input.mobile !== undefined)
        updateData.mobile = normalizeUpdateOptionalString(input.mobile);
      if (input.alternateMobile !== undefined)
        updateData.alternateMobile = normalizeUpdateOptionalString(input.alternateMobile);
      if (input.email !== undefined)
        updateData.email = normalizeUpdateOptionalString(input.email);
      if (input.address !== undefined) updateData.address = input.address.trim();
      if (input.addressLine1 !== undefined)
        updateData.addressLine1 = normalizeUpdateOptionalString(input.addressLine1);
      if (input.addressLine2 !== undefined)
        updateData.addressLine2 = normalizeUpdateOptionalString(input.addressLine2);
      if (input.city !== undefined) updateData.city = input.city.trim();
      if (input.state !== undefined) updateData.state = input.state.trim();
      if (input.country !== undefined)
        updateData.country = normalizeUpdateOptionalString(input.country);
      if (input.postalCode !== undefined) updateData.postalCode = input.postalCode.trim();
      if (input.previousSchool !== undefined)
        updateData.previousSchool = normalizeUpdateOptionalString(input.previousSchool);
      if (input.previousClass !== undefined)
        updateData.previousClass = normalizeUpdateOptionalString(input.previousClass);
      if (input.previousSchoolBoard !== undefined)
        updateData.previousSchoolBoard = normalizeUpdateOptionalString(input.previousSchoolBoard);
      if (input.transferCertificateNumber !== undefined)
        updateData.transferCertificateNumber = normalizeUpdateOptionalString(input.transferCertificateNumber);
      if (input.transferCertificateDate !== undefined)
        updateData.transferCertificateDate = normalizeUpdateDate(input.transferCertificateDate);
      if (input.notes !== undefined)
        updateData.notes = normalizeUpdateOptionalString(input.notes);
      if (input.status !== undefined) updateData.status = input.status;
      if (input.emergencyContact !== undefined)
        updateData.emergencyContact = input.emergencyContact.trim();
      if (input.emergencyPhone !== undefined)
        updateData.emergencyPhone = input.emergencyPhone.trim();

      // Only update registrationId if explicitly provided; do NOT generate a new one on update!
      if (input.registrationId !== undefined) {
        updateData.registrationId = normalizeUpdateOptionalString(input.registrationId);
      }

      if (input.admissionNumber !== undefined) {
        const trimmed = input.admissionNumber.trim();
        updateData.admissionNumber = trimmed;
      }

      // If address is not provided directly, but address lines are updated, combine them
      if (
        input.address === undefined &&
        (input.addressLine1 !== undefined || input.addressLine2 !== undefined)
      ) {
        const line1 =
          input.addressLine1 !== undefined
            ? normalizeUpdateOptionalString(input.addressLine1)
            : student.addressLine1;
        const line2 =
          input.addressLine2 !== undefined
            ? normalizeUpdateOptionalString(input.addressLine2)
            : student.addressLine2;
        const combined = [line1, line2].filter(Boolean).join(', ');
        if (combined) {
          updateData.address = combined;
        }
      }

      await prisma.student.update({
        where: { id: studentId },
        data: updateData,
      });

      // Update StudentIdentity if provided
      if (
        input.nationalId !== undefined ||
        input.idType !== undefined ||
        input.birthCertNo !== undefined ||
        input.nationality !== undefined ||
        input.countryOfBirth !== undefined
      ) {
        const identUpdate: any = {};
        if (input.nationalId !== undefined) identUpdate.nationalId = input.nationalId.trim();
        if (input.idType !== undefined) identUpdate.idType = input.idType.trim();
        if (input.birthCertNo !== undefined)
          identUpdate.birthCertNo = input.birthCertNo ? input.birthCertNo.trim() : null;
        if (input.nationality !== undefined) identUpdate.nationality = input.nationality.trim();
        if (input.countryOfBirth !== undefined)
          identUpdate.countryOfBirth = input.countryOfBirth ? input.countryOfBirth.trim() : null;

        await prisma.studentIdentity.update({
          where: { id: student.studentIdentityId },
          data: identUpdate,
        });
      }

      // Update Guardians if provided
      if (input.guardians && input.guardians.length > 0) {
        for (const g of input.guardians) {
          const gFirstName = normalizeOptionalString(g.firstName) || '';
          const gMiddleName = normalizeOptionalString(g.middleName) || '';
          const gLastName = normalizeOptionalString(g.lastName) || '';
          const gFullName =
            normalizeOptionalString(g.fullName) ||
            [gFirstName, gMiddleName, gLastName].filter(Boolean).join(' ').trim();

          const gMobile =
            normalizeOptionalString(g.mobile) ||
            normalizeOptionalString(g.primaryPhone);

          const gAlternateMobile =
            normalizeOptionalString(g.alternateMobile) ||
            normalizeOptionalString(g.alternatePhone);

          const gEmail = normalizeOptionalString(g.email);
          const gOccupation = normalizeOptionalString(g.occupation);

          const gAddressLine = normalizeOptionalString(g.address);
          const gCity = normalizeOptionalString(g.city);
          const gState = normalizeOptionalString(g.state);
          const gCountry = normalizeOptionalString(g.country);
          const gPostalCode = normalizeOptionalString(g.postalCode);
          const gFormattedAddress =
            [gAddressLine, gCity, gState, gCountry, gPostalCode].filter(Boolean).join(', ') ||
            normalizeOptionalString(g.currentAddress);

          const isPrimary =
            g.isPrimary !== undefined
              ? Boolean(g.isPrimary)
              : g.isPrimaryContact !== undefined
              ? Boolean(g.isPrimaryContact)
              : undefined;

          const canPickup =
            g.isAuthorizedPickup !== undefined
              ? Boolean(g.isAuthorizedPickup)
              : g.canPickup !== undefined
              ? Boolean(g.canPickup)
              : undefined;

          const rel = (g.relationship || 'GUARDIAN').toUpperCase();

          const existingPs = await prisma.parentStudent.findFirst({
            where: { schoolId, studentId, relationship: rel },
            include: { parent: { include: { user: true } } },
          });

          if (existingPs) {
            // Update User if email or fullName exists
            if (gEmail && existingPs.parent.userId) {
              await prisma.user.update({
                where: { id: existingPs.parent.userId },
                data: {
                  email: gEmail.toLowerCase(),
                  fullName: gFullName || undefined,
                  phone: gMobile || undefined,
                },
              }).catch(() => {});
            }

            const parentUpdate: any = {};
            if (gMobile) parentUpdate.primaryPhone = gMobile;
            if (gAlternateMobile !== undefined) parentUpdate.alternatePhone = gAlternateMobile;
            if (gOccupation !== undefined) parentUpdate.occupation = gOccupation;
            if (gFormattedAddress) {
              parentUpdate.currentAddress = gFormattedAddress;
              parentUpdate.permanentAddress = gFormattedAddress;
            }
            if (gFullName) parentUpdate.emergencyContact = gFullName;
            if (gMobile) parentUpdate.emergencyPhone = gMobile;

            if (Object.keys(parentUpdate).length > 0) {
              await prisma.parent.update({
                where: { id: existingPs.parentId },
                data: parentUpdate,
              });
            }

            const psUpdate: any = {};
            if (isPrimary !== undefined) psUpdate.isPrimaryContact = isPrimary;
            if (canPickup !== undefined) psUpdate.canPickup = canPickup;

            if (Object.keys(psUpdate).length > 0) {
              await prisma.parentStudent.update({
                where: { id: existingPs.id },
                data: psUpdate,
              });
            }
          } else {
            const parent = await prisma.parent.create({
              data: {
                primaryPhone: gMobile || student.emergencyPhone,
                alternatePhone: gAlternateMobile || null,
                occupation: gOccupation || null,
                currentAddress: gFormattedAddress || student.address,
                permanentAddress: gFormattedAddress || student.address,
                emergencyContact: gFullName || student.emergencyContact,
                emergencyPhone: gMobile || student.emergencyPhone,
              },
            });
            await prisma.parentStudent.create({
              data: {
                schoolId,
                parentId: parent.id,
                studentId,
                relationship: rel,
                isPrimaryContact: isPrimary !== undefined ? isPrimary : true,
                canPickup: canPickup !== undefined ? canPickup : true,
              },
            });
          }
        }
      }

      return await this.getStudentById(schoolId, studentId);
    } catch (err) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      const student = fallbackStudents.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      if (input.admissionNumber && input.admissionNumber.trim() !== student.admissionNumber) {
        const newAdm = input.admissionNumber.trim();
        const conflict = fallbackStudents.find(
          (s) =>
            s.schoolId === schoolId &&
            s.id !== studentId &&
            s.activeAdmissionNumber?.toLowerCase() === newAdm.toLowerCase() &&
            s.deletedAt === null,
        );
        if (conflict) {
          throw new AppError('Admission number already in use', 409, [
            {
              message: `An active student with admission number '${newAdm}' already exists`,
              code: 'DUPLICATE_ADMISSION_NUMBER',
            },
          ]);
        }
        student.admissionNumber = newAdm;
        if (!student.deletedAt) {
          student.activeAdmissionNumber = newAdm;
        }
      }

      if (input.firstName !== undefined) student.firstName = input.firstName.trim();
      if (input.middleName !== undefined)
        student.middleName = normalizeUpdateOptionalString(input.middleName);
      if (input.lastName !== undefined) student.lastName = input.lastName.trim();
      if (input.photoUrl !== undefined)
        student.photoUrl = normalizeUpdateOptionalString(input.photoUrl);
      if (input.gender !== undefined) student.gender = input.gender;
      if (input.dateOfBirth !== undefined) student.dateOfBirth = new Date(input.dateOfBirth);
      if (input.bloodGroup !== undefined)
        student.bloodGroup = normalizeUpdateOptionalString(input.bloodGroup);
      if (input.specialCategory !== undefined)
        student.specialCategory = normalizeUpdateOptionalString(input.specialCategory);
      if (input.specialCategoryDetails !== undefined)
        student.specialCategoryDetails = normalizeUpdateOptionalString(input.specialCategoryDetails);
      if (input.nationality !== undefined)
        student.nationality = normalizeUpdateOptionalString(input.nationality);
      if (input.religion !== undefined)
        student.religion = normalizeUpdateOptionalString(input.religion);
      if (input.category !== undefined)
        student.category = normalizeUpdateOptionalString(input.category);
      if (input.motherTongue !== undefined)
        student.motherTongue = normalizeUpdateOptionalString(input.motherTongue);
      if (input.placeOfBirth !== undefined)
        student.placeOfBirth = normalizeUpdateOptionalString(input.placeOfBirth);
      if (input.governmentId !== undefined)
        student.governmentId = normalizeUpdateOptionalString(input.governmentId);
      if (input.mobile !== undefined)
        student.mobile = normalizeUpdateOptionalString(input.mobile);
      if (input.alternateMobile !== undefined)
        student.alternateMobile = normalizeUpdateOptionalString(input.alternateMobile);
      if (input.email !== undefined)
        student.email = normalizeUpdateOptionalString(input.email);
      if (input.address !== undefined) student.address = input.address.trim();
      if (input.addressLine1 !== undefined)
        student.addressLine1 = normalizeUpdateOptionalString(input.addressLine1);
      if (input.addressLine2 !== undefined)
        student.addressLine2 = normalizeUpdateOptionalString(input.addressLine2);
      if (input.city !== undefined) student.city = input.city.trim();
      if (input.state !== undefined) student.state = input.state.trim();
      if (input.country !== undefined)
        student.country = normalizeUpdateOptionalString(input.country);
      if (input.postalCode !== undefined) student.postalCode = input.postalCode.trim();
      if (input.previousSchool !== undefined)
        student.previousSchool = normalizeUpdateOptionalString(input.previousSchool);
      if (input.previousClass !== undefined)
        student.previousClass = normalizeUpdateOptionalString(input.previousClass);
      if (input.previousSchoolBoard !== undefined)
        student.previousSchoolBoard = normalizeUpdateOptionalString(input.previousSchoolBoard);
      if (input.transferCertificateNumber !== undefined)
        student.transferCertificateNumber = normalizeUpdateOptionalString(input.transferCertificateNumber);
      if (input.transferCertificateDate !== undefined)
        student.transferCertificateDate = normalizeUpdateDate(input.transferCertificateDate);
      if (input.notes !== undefined)
        student.notes = normalizeUpdateOptionalString(input.notes);
      if (input.status !== undefined) student.status = input.status;
      if (input.emergencyContact !== undefined)
        student.emergencyContact = input.emergencyContact.trim();
      if (input.emergencyPhone !== undefined)
        student.emergencyPhone = input.emergencyPhone.trim();
      if (input.registrationId !== undefined) {
        student.registrationId = normalizeUpdateOptionalString(input.registrationId);
      }
      student.updatedAt = new Date();

      const ident = fallbackIdentities.find((i) => i.id === student.studentIdentityId);
      if (ident) {
        if (input.nationalId !== undefined) ident.nationalId = input.nationalId.trim();
        if (input.idType !== undefined) ident.idType = input.idType.trim();
        if (input.birthCertNo !== undefined)
          ident.birthCertNo = input.birthCertNo ? input.birthCertNo.trim() : null;
        if (input.nationality !== undefined) ident.nationality = input.nationality.trim();
        if (input.countryOfBirth !== undefined)
          ident.countryOfBirth = input.countryOfBirth ? input.countryOfBirth.trim() : null;
        ident.updatedAt = new Date();
      }

      // Update guardians in fallback if provided
      if (input.guardians && input.guardians.length > 0) {
        for (const g of input.guardians) {
          const gFirstName = normalizeOptionalString(g.firstName) || '';
          const gMiddleName = normalizeOptionalString(g.middleName) || '';
          const gLastName = normalizeOptionalString(g.lastName) || '';
          const gFullName =
            normalizeOptionalString(g.fullName) ||
            [gFirstName, gMiddleName, gLastName].filter(Boolean).join(' ').trim();

          const gMobile =
            normalizeOptionalString(g.mobile) ||
            normalizeOptionalString(g.primaryPhone);

          const gAlternateMobile =
            normalizeOptionalString(g.alternateMobile) ||
            normalizeOptionalString(g.alternatePhone);

          const gEmail = normalizeOptionalString(g.email);
          const gOccupation = normalizeOptionalString(g.occupation);

          const gAddressLine = normalizeOptionalString(g.address);
          const gCity = normalizeOptionalString(g.city);
          const gState = normalizeOptionalString(g.state);
          const gCountry = normalizeOptionalString(g.country);
          const gPostalCode = normalizeOptionalString(g.postalCode);
          const gFormattedAddress =
            [gAddressLine, gCity, gState, gCountry, gPostalCode].filter(Boolean).join(', ') ||
            normalizeOptionalString(g.currentAddress);

          const isPrimary =
            g.isPrimary !== undefined
              ? Boolean(g.isPrimary)
              : g.isPrimaryContact !== undefined
              ? Boolean(g.isPrimaryContact)
              : undefined;

          const canPickup =
            g.isAuthorizedPickup !== undefined
              ? Boolean(g.isAuthorizedPickup)
              : g.canPickup !== undefined
              ? Boolean(g.canPickup)
              : undefined;

          const rel = (g.relationship || 'GUARDIAN').toUpperCase();

          const existingPs = fallbackParentStudents.find(
            (ps) => ps.schoolId === schoolId && ps.studentId === studentId && ps.relationship === rel,
          );

          if (existingPs) {
            const par = fallbackParents.find((p) => p.id === existingPs.parentId);
            if (par) {
              if (gMobile) par.primaryPhone = gMobile;
              if (gAlternateMobile !== undefined) par.alternatePhone = gAlternateMobile;
              if (gOccupation !== undefined) par.occupation = gOccupation;
              if (gFormattedAddress) {
                par.currentAddress = gFormattedAddress;
                par.permanentAddress = gFormattedAddress;
              }
              if (gFullName) {
                par.fullName = gFullName;
                par.emergencyContact = gFullName;
              }
              if (gMobile) par.emergencyPhone = gMobile;
              if (gEmail) par.email = gEmail;
              par.updatedAt = new Date();
            }
            if (isPrimary !== undefined) existingPs.isPrimaryContact = isPrimary;
            if (canPickup !== undefined) existingPs.canPickup = canPickup;
          } else {
            const parId = `${getInternalIdPrefix('parent')}${crypto.randomUUID().slice(0, 8)}`;
            fallbackParents.push({
              id: parId,
              userId: null,
              primaryPhone: gMobile || student.emergencyPhone,
              alternatePhone: gAlternateMobile || null,
              occupation: gOccupation || null,
              annualIncome: null,
              currentAddress: gFormattedAddress || student.address,
              permanentAddress: gFormattedAddress || student.address,
              emergencyContact: gFullName || student.emergencyContact,
              emergencyPhone: gMobile || student.emergencyPhone,
              fullName: gFullName || student.emergencyContact,
              email: gEmail || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            fallbackParentStudents.push({
              id: `${getInternalIdPrefix('parentStudent')}${crypto.randomUUID().slice(0, 8)}`,
              schoolId,
              parentId: parId,
              studentId,
              relationship: rel,
              isPrimaryContact: isPrimary !== undefined ? isPrimary : true,
              canPickup: canPickup !== undefined ? canPickup : true,
              createdAt: new Date(),
            });
          }
        }
      }

      return await this.getStudentById(schoolId, studentId);
    }
  },

  /**
   * Update student status (Activate or Deactivate / Archive).
   * Inactivates the record by setting deletedAt and clearing activeAdmissionNumber.
   * Reactivating restores activeAdmissionNumber, checking for any conflicts.
   */
  async updateStudentStatus(
    schoolId: string,
    studentId: string,
    input: StudentStatusUpdateInput,
  ): Promise<StudentDto> {
    const isActivating = input.status === 'ACTIVE';

    try {
      const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId },
      });

      if (!student) {
        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      if (isActivating) {
        // Ensure no active student has the same admissionNumber
        const conflict = await prisma.student.findFirst({
          where: {
            schoolId,
            activeAdmissionNumber: student.admissionNumber,
            id: { not: studentId },
            deletedAt: null,
          },
        });

        if (conflict) {
          throw new AppError('Cannot activate student: admission number already in use', 409, [
            {
              message: `Another active student already uses admission number '${student.admissionNumber}'`,
              code: 'DUPLICATE_ADMISSION_NUMBER',
            },
          ]);
        }

        const updated = await prisma.student.update({
          where: { id: studentId },
          data: {
            deletedAt: null,
          },
          include: { identity: true },
        });

        return formatStudentDto(updated, updated.identity);
      } else {
        // Deactivate / archive
        const updated = await prisma.student.update({
          where: { id: studentId },
          data: {
            deletedAt: new Date(),
          },
          include: { identity: true },
        });

        return formatStudentDto(updated, updated.identity);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      const student = fallbackStudents.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        throw new AppError('Student not found', 404, [
          {
            message: `Student with ID '${studentId}' does not exist in this school`,
            code: 'STUDENT_NOT_FOUND',
          },
        ]);
      }

      if (isActivating) {
        const conflict = fallbackStudents.find(
          (s) =>
            s.schoolId === schoolId &&
            s.id !== studentId &&
            s.activeAdmissionNumber?.toLowerCase() === student.admissionNumber.toLowerCase() &&
            s.deletedAt === null,
        );
        if (conflict) {
          throw new AppError('Cannot activate student: admission number already in use', 409, [
            {
              message: `Another active student already uses admission number '${student.admissionNumber}'`,
              code: 'DUPLICATE_ADMISSION_NUMBER',
            },
          ]);
        }
        student.deletedAt = null;
        student.activeAdmissionNumber = student.admissionNumber;
      } else {
        student.deletedAt = new Date();
        student.activeAdmissionNumber = null;
      }
      student.updatedAt = new Date();

      const ident = fallbackIdentities.find((i) => i.id === student.studentIdentityId);
      return formatStudentDto(student, ident);
    }
  },

  /**
   * Soft-deletes a student record. Preserves historical references (enrollments, exams, fees).
   */
  async deleteStudent(schoolId: string, studentId: string): Promise<void> {
    await this.updateStudentStatus(schoolId, studentId, { status: 'INACTIVE' });
  },

  /**
   * Generates a dynamic, unique, tenant-scoped registration ID (e.g. REG-YYYY-NNNNN).
   */
  async generateUniqueRegistrationId(schoolId: string): Promise<string> {
    return generateUniqueRegistrationId(schoolId);
  },
};

export { generateUniqueRegistrationId };
