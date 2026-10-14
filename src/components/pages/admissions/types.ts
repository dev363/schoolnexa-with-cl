import { StudentItem } from '@/components/pages/students/types';

export type EnrollmentStatus =
  'NEW' | 'PROMOTED' | 'REPEAT' | 'TRANSFERRED' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  id: string; // Internal database ID
  enrollmentId: string; // Unique ERP business key, e.g. ENR-2026-000001
  studentId: string; // Foreign key to Student record (STU-XXX)
  studentCode: string; // Cached for fast display
  studentName: string; // Cached student display name
  studentPhoto?: string;
  studentGender?: string;

  academicYearId: string;
  academicYearName: string; // e.g. "2026-2027" or "2025-2026"

  classId: string;
  className: string; // e.g. "Class 5" or "Grade 9"

  sectionId: string;
  sectionName: string; // e.g. "Section A" or "A"

  admissionNumber?: string; // e.g. "ADM-2026-00125"
  rollNumber?: string; // e.g. "12"

  enrollmentDate: string; // YYYY-MM-DD
  status: EnrollmentStatus;

  previousSchool?: string;
  previousClass?: string;
  transferCertificateNumber?: string;
  transferCertificateDate?: string;
  transferReason?: string;
  transferDate?: string;

  remarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EnrollmentFilterState {
  searchQuery: string;
  academicYear: string;
  className: string;
  sectionName: string;
  status: string; // 'ALL' | EnrollmentStatus
  sortBy: 'date_desc' | 'date_asc' | 'name_asc' | 'id_asc' | 'class_asc';
}

export const DEFAULT_ENROLLMENT_FILTERS: EnrollmentFilterState = {
  searchQuery: '',
  academicYear: '2026-2027',
  className: 'ALL',
  sectionName: 'ALL',
  status: 'ALL',
  sortBy: 'date_desc',
};

export interface PromotionCandidate {
  student: StudentItem;
  currentEnrollment: Enrollment;
  targetClass: string;
  targetSection: string;
  targetRollNumber?: string;
  targetAdmissionNumber?: string;
  targetEnrollmentId: string;
  remarks?: string;
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface RepeatCandidate {
  student: StudentItem;
  currentEnrollment: Enrollment;
  targetClass: string;
  targetSection: string;
  targetRollNumber?: string;
  targetEnrollmentId: string;
  remarks?: string;
}

export interface BulkOperationPreview {
  totalSelected: number;
  newEnrollmentsCount: number;
  skippedCount: number;
  potentialIssuesCount: number;
  issues: Array<{ studentName: string; studentCode: string; reason: string }>;
}
