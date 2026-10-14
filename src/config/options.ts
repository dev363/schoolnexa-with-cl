/**
 * Centralized Application Configuration & Select Options
 * Standard format: { id: string | T, label: string }[]
 */

import { DayOfWeek } from '@/types';
import {
  StudentStatus,
  Gender,
  GuardianRelationship,
  AdmissionType,
} from '@/components/pages/students/types';

export interface OptionItem<T = string> {
  id: T;
  label: string;
}

// -----------------------------------------------------------------------------
// 1. Student Status Options
// -----------------------------------------------------------------------------
export const STUDENT_STATUS: OptionItem<StudentStatus>[] = [
  { id: 'ACTIVE', label: 'Active' },
  { id: 'INACTIVE', label: 'Inactive' },
];

// -----------------------------------------------------------------------------
// 2. Special Need / Disability / Medical Condition Categories
// -----------------------------------------------------------------------------
export interface SpecialNeedCategoryOption extends OptionItem {
  id: string;
  label: string;
}

export const SPECIAL_NEED_CATEGORIES: SpecialNeedCategoryOption[] = [
  { id: 'N', label: 'None / Not Applicable' },
  { id: 'LOCOMOTOR', label: 'Physically Handicapped / Locomotor Disability' },
  { id: 'VISUAL', label: 'Visual Impairment (Low Vision / Blindness)' },
  { id: 'HEARING_SPEECH', label: 'Hearing & Speech Impairment' },
  {
    id: 'INTELLECTUAL_LEARNING',
    label: 'Intellectual / Learning Disability (Dyslexia, ADHD, etc.)',
  },
  { id: 'AUTISM', label: 'Autism Spectrum Disorder' },
  {
    id: 'CHRONIC_ILLNESS',
    label: 'Chronic Illness / Specific Disease (Asthma, Diabetes, Epilepsy, etc.)',
  },
  { id: 'MULTIPLE', label: 'Multiple Disabilities' },
  { id: 'OTHER', label: 'Other Special Need / Medical Condition' },
];

// -----------------------------------------------------------------------------
// 3. Week Days for Timetable and Academic Scheduling
// -----------------------------------------------------------------------------
export interface WeekDayOption extends OptionItem<DayOfWeek> {
  day: DayOfWeek;
  short: string;
  order: number;
}

export const WEEK_DAYS: WeekDayOption[] = [
  { id: 'MONDAY', day: 'MONDAY', label: 'Monday', short: 'Mon', order: 1 },
  { id: 'TUESDAY', day: 'TUESDAY', label: 'Tuesday', short: 'Tue', order: 2 },
  { id: 'WEDNESDAY', day: 'WEDNESDAY', label: 'Wednesday', short: 'Wed', order: 3 },
  { id: 'THURSDAY', day: 'THURSDAY', label: 'Thursday', short: 'Thu', order: 4 },
  { id: 'FRIDAY', day: 'FRIDAY', label: 'Friday', short: 'Fri', order: 5 },
  { id: 'SATURDAY', day: 'SATURDAY', label: 'Saturday', short: 'Sat', order: 6 },
];

// -----------------------------------------------------------------------------
// 4. Subject Color Palette for Timetable Scheduling
// -----------------------------------------------------------------------------
export interface SubjectColorStyle {
  bg: string;
  text: string;
  border: string;
}

export const SUBJECT_COLORS: Record<string, SubjectColorStyle> = {
  english: {
    bg: 'bg-primary bg-opacity-10',
    text: 'text-primary',
    border: 'border-primary border-opacity-25',
  },
  mathematics: {
    bg: 'bg-info bg-opacity-10',
    text: 'text-info',
    border: 'border-info border-opacity-25',
  },
  math: { bg: 'bg-info bg-opacity-10', text: 'text-info', border: 'border-info border-opacity-25' },
  punjabi: {
    bg: 'bg-warning bg-opacity-10',
    text: 'text-warning',
    border: 'border-warning border-opacity-25',
  },
  hindi: {
    bg: 'bg-warning bg-opacity-10',
    text: 'text-warning',
    border: 'border-warning border-opacity-25',
  },
  evs: {
    bg: 'bg-success bg-opacity-10',
    text: 'text-success',
    border: 'border-success border-opacity-25',
  },
  science: {
    bg: 'bg-success bg-opacity-10',
    text: 'text-success',
    border: 'border-success border-opacity-25',
  },
  computer: {
    bg: 'bg-primary bg-opacity-10',
    text: 'text-primary',
    border: 'border-primary border-opacity-25',
  },
  pe: {
    bg: 'bg-success bg-opacity-10',
    text: 'text-success',
    border: 'border-success border-opacity-25',
  },
  sports: {
    bg: 'bg-success bg-opacity-10',
    text: 'text-success',
    border: 'border-success border-opacity-25',
  },
  art: {
    bg: 'bg-danger bg-opacity-10',
    text: 'text-danger',
    border: 'border-danger border-opacity-25',
  },
  library: {
    bg: 'bg-info bg-opacity-10',
    text: 'text-info',
    border: 'border-info border-opacity-25',
  },
  activity: {
    bg: 'bg-info bg-opacity-10',
    text: 'text-info',
    border: 'border-info border-opacity-25',
  },
};

export const getSubjectColor = (subjectName: string = ''): SubjectColorStyle => {
  const lower = subjectName.toLowerCase();
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return { bg: 'bg-body-secondary', text: 'text-body', border: 'border-secondary-subtle' };
};

// -----------------------------------------------------------------------------
// 5. Personal Info: Blood Groups, Genders, Admission Types, Guardians
// -----------------------------------------------------------------------------
export const BLOOD_GROUPS: OptionItem[] = [
  { id: 'A+', label: 'A+' },
  { id: 'A-', label: 'A-' },
  { id: 'B+', label: 'B+' },
  { id: 'B-', label: 'B-' },
  { id: 'O+', label: 'O+' },
  { id: 'O-', label: 'O-' },
  { id: 'AB+', label: 'AB+' },
  { id: 'AB-', label: 'AB-' },
];

export const GENDERS: OptionItem<Gender>[] = [
  { id: 'MALE', label: 'Male' },
  { id: 'FEMALE', label: 'Female' },
  { id: 'OTHER', label: 'Other' },
];

export const GUARDIAN_RELATIONSHIPS: OptionItem<GuardianRelationship>[] = [
  { id: 'Father', label: 'Father' },
  { id: 'Mother', label: 'Mother' },
  { id: 'Guardian', label: 'Legal Guardian' },
  { id: 'Other', label: 'Other' },
];

export const ADMISSION_TYPES: OptionItem<AdmissionType>[] = [
  { id: 'REGULAR', label: 'Regular Admission' },
  { id: 'TRANSFER', label: 'Transfer In' },
  { id: 'MANAGEMENT', label: 'Management Quota' },
  { id: 'DIRECT', label: 'Direct Admission' },
  { id: 'SCHOLARSHIP', label: 'Scholarship' },
  { id: 'OTHER', label: 'Other' },
];

export const ACADEMIC_YEAR_STATUSES: OptionItem[] = [
  { id: 'ACTIVE', label: 'Active (Current)' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'ARCHIVED', label: 'Archived / Past' },
];

export const SOCIAL_CATEGORIES: OptionItem[] = [
  { id: 'General', label: 'General' },
  { id: 'OBC', label: 'OBC (Other Backward Class)' },
  { id: 'SC', label: 'SC (Scheduled Caste)' },
  { id: 'ST', label: 'ST (Scheduled Tribe)' },
  { id: 'EWS', label: 'EWS (Economically Weaker Section)' },
];

export const ADMISSION_STATUS_OPTIONS: OptionItem[] = [
  { id: 'ALL', label: 'All Enrollment' },
  { id: 'ADMITTED', label: 'Admitted / Active' },
  { id: 'PENDING', label: 'Awaiting Admission' },
];

export const GUARDIAN_STATUS_OPTIONS: OptionItem[] = [
  { id: 'ALL', label: 'All Guardianship' },
  { id: 'HAS_GUARDIAN', label: 'Has Guardian' },
  { id: 'NO_GUARDIAN', label: 'No Guardian Recorded' },
];

export const SPECIAL_NEED_FILTER_OPTIONS: OptionItem[] = [
  { id: 'ALL', label: 'All Special Needs' },
  { id: 'ANY_SPECIAL_NEED', label: 'Any Special Need / Condition' },
  { id: 'NONE', label: 'None / Not Applicable' },
  ...SPECIAL_NEED_CATEGORIES.filter((c) => c.id !== 'N'),
];

export const STUDENT_SORT_OPTIONS: OptionItem[] = [
  { id: 'name_asc', label: 'Name (A to Z)' },
  { id: 'name_desc', label: 'Name (Z to A)' },
  { id: 'admission_asc', label: 'Admission Number' },
  { id: 'code_asc', label: 'Student Code' },
  { id: 'class_asc', label: 'Class & Section' },
  { id: 'dob_asc', label: 'Age / DOB (Oldest first)' },
  { id: 'dob_desc', label: 'Age / DOB (Youngest first)' },
  { id: 'created_desc', label: 'Recently Added' },
];

// -----------------------------------------------------------------------------
// 6. Utility Helpers for Standardized Option Lookup
// -----------------------------------------------------------------------------

/**
 * Returns human-readable label from an OptionItem list by ID or legacy label match
 */
export function getOptionLabel<T = string>(
  options: OptionItem<T>[],
  idOrLabel: string | undefined | null,
  fallback = '',
): string {
  if (!idOrLabel) return fallback;
  const match = options.find((opt) => opt.id === idOrLabel || opt.label === idOrLabel);
  return match ? match.label : idOrLabel;
}

/**
 * Checks if a special need category is active (not None/Not Applicable)
 */
export function isSpecialNeedActive(category?: string | null): boolean {
  if (!category) return false;
  return (
    category !== 'N' &&
    category !== 'NONE' &&
    category !== 'None' &&
    category !== 'None / Not Applicable'
  );
}

const AppOptions = {
  STUDENT_STATUS,
  SPECIAL_NEED_CATEGORIES,
  SPECIAL_NEED_FILTER_OPTIONS,
  WEEK_DAYS,
  SUBJECT_COLORS,
  BLOOD_GROUPS,
  GENDERS,
  GUARDIAN_RELATIONSHIPS,
  ADMISSION_TYPES,
  ACADEMIC_YEAR_STATUSES,
  SOCIAL_CATEGORIES,
  ADMISSION_STATUS_OPTIONS,
  GUARDIAN_STATUS_OPTIONS,
  STUDENT_SORT_OPTIONS,
  getSubjectColor,
  getOptionLabel,
  isSpecialNeedActive,
};

export default AppOptions;
