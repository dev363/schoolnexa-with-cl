import {
  Gender,
  EmploymentType,
  TeacherStatus,
  DocumentType,
  DocumentVerificationStatus,
  BloodGroup,
  MaritalStatus,
  DayOfWeek,
} from '@/components/pages/teachers/types';

/**
 * Standard option representation for dropdown and select elements
 */
export interface FormOption<T = string> {
  value: T;
  label: string;
}

/**
 * Authoritative gender options shared across Teacher Add, Edit, and Filters
 */
export const GENDER_OPTIONS: FormOption<Gender>[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

/**
 * Authoritative marital status options shared across Teacher forms
 */
export const MARITAL_STATUS_OPTIONS: FormOption<MaritalStatus>[] = [
  { value: 'Married', label: 'Married' },
  { value: 'Single', label: 'Single' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Divorced', label: 'Divorced' },
];

/**
 * Authoritative blood group list shared across Teacher forms
 */
export const BLOOD_GROUP_OPTIONS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

/**
 * Authoritative employment type options shared across Teacher forms, filters, and badges
 */
export const EMPLOYMENT_TYPE_OPTIONS: FormOption<EmploymentType>[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'VISITING', label: 'Visiting' },
  { value: 'GUEST', label: 'Guest' },
  { value: 'TEMPORARY', label: 'Temporary' },
];

/**
 * Authoritative teacher status options shared across Teacher forms, filters, and badges
 */
export const TEACHER_STATUS_OPTIONS: FormOption<TeacherStatus>[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'RETIRED', label: 'Retired' },
  { value: 'TERMINATED', label: 'Terminated' },
];

/**
 * Authoritative document categories / types for teacher records
 */
export const DOCUMENT_TYPE_OPTIONS: FormOption<DocumentType>[] = [
  { value: 'RESUME', label: 'Resume' },
  { value: 'QUALIFICATION_CERTIFICATE', label: 'Qualification Certificate' },
  { value: 'EXPERIENCE_CERTIFICATE', label: 'Experience Certificate' },
  { value: 'ID_PROOF', label: 'ID Proof' },
  { value: 'JOINING_DOCUMENT', label: 'Joining Document' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Authoritative document verification statuses
 */
export const DOCUMENT_STATUS_OPTIONS: FormOption<DocumentVerificationStatus>[] = [
  { value: 'VERIFIED', label: 'VERIFIED' },
  { value: 'PENDING', label: 'PENDING' },
];

/**
 * Authoritative days of week for teacher timetable slots
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];
