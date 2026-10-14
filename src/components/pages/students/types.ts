export type StudentStatus = 'ACTIVE' | 'INACTIVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AdmissionType =
  'REGULAR' | 'TRANSFER' | 'MANAGEMENT' | 'DIRECT' | 'SCHOLARSHIP' | 'OTHER';
export type GuardianRelationship = 'Father' | 'Mother' | 'Guardian' | 'Other';

export interface Guardian {
  id: string;
  relationship: GuardianRelationship;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: Gender | '';
  mobile: string;
  alternateMobile?: string;
  email?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
  isAuthorizedPickup: boolean;
}

export interface StudentItem {
  id: string;
  studentCode: string;
  admissionNumber?: string;
  hasActiveAdmission?: boolean;
  currentClass?: string;
  currentSection?: string;
  className?: string;
  sectionName?: string;
  academicYear?: string;
  rollNumber?: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  photoUrl?: string;

  // Personal Information
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: string;
  specialCategory?: string;
  specialCategoryDetails?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  motherTongue?: string;
  placeOfBirth?: string;

  // Identification
  governmentId?: string;

  // Contact Information
  mobile: string;
  alternateMobile?: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Parent / Guardians
  guardians: Guardian[];

  // Previous School / Background (Optional)
  previousSchool?: string;
  previousClass?: string;
  previousSchoolBoard?: string;
  transferCertificateNumber?: string;
  transferCertificateDate?: string;

  // Additional Information
  notes?: string;
  status: StudentStatus;
  createdAt: string;

  // Optional admission info when admitted
  admissionDate?: string;
  admissionType?: AdmissionType;
}

export interface StudentFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  photoUrl: string;

  // 1. Basic Information
  dateOfBirth: string;
  gender: Gender | '';
  bloodGroup: string;
  specialCategory: string;
  specialCategoryDetails: string;
  nationality: string;
  religion: string;
  category: string;
  motherTongue: string;
  placeOfBirth: string;

  // 2. Personal Information / Identification
  governmentId: string;

  // 3. Contact Information
  mobile: string;
  alternateMobile: string;
  email: string;

  // 4. Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  // 5. Parent / Guardian Information
  guardians: Guardian[];

  // 6. Previous School / Background (Optional)
  previousSchool: string;
  previousClass: string;
  previousSchoolBoard: string;
  transferCertificateNumber: string;
  transferCertificateDate: string;

  // 7. Additional Information
  notes: string;
  status: StudentStatus;
}

export interface StudentFilterState {
  searchQuery: string;
  status: 'ALL' | StudentStatus;
  gender: 'ALL' | Gender;
  admissionType: 'ALL' | AdmissionType;
  // Advanced Filter Attributes
  currentClass: string; // 'ALL' | 'UNASSIGNED' | string (e.g., 'Class 5')
  currentSection: string; // 'ALL' | string (e.g., 'Section A')
  admissionStatus: 'ALL' | 'ADMITTED' | 'PENDING';
  bloodGroup: string; // 'ALL' | 'A+', etc.
  specialCategory: string; // 'ALL' | 'ANY_SPECIAL_NEED' | 'NONE' | specific category id/label
  category: string; // 'ALL' | 'General' | 'OBC' | 'SC' | 'ST' | etc.
  guardianStatus: 'ALL' | 'HAS_GUARDIAN' | 'NO_GUARDIAN';
  academicYear: string; // 'ALL' | '2026-2027', etc.
  sortBy: string; // 'name_asc' | 'name_desc' | 'admission_asc' | 'code_asc' | 'class_asc' | 'dob_asc' | 'dob_desc' | 'created_desc'
}

export const DEFAULT_STUDENT_FILTER_STATE: StudentFilterState = {
  searchQuery: '',
  status: 'ALL',
  gender: 'ALL',
  admissionType: 'ALL',
  currentClass: 'ALL',
  currentSection: 'ALL',
  admissionStatus: 'ALL',
  bloodGroup: 'ALL',
  specialCategory: 'ALL',
  category: 'ALL',
  guardianStatus: 'ALL',
  academicYear: 'ALL',
  sortBy: 'name_asc',
};

export {
  SPECIAL_NEED_CATEGORIES,
  STUDENT_STATUS,
  BLOOD_GROUPS,
  GENDERS,
  ADMISSION_TYPES,
  SOCIAL_CATEGORIES,
  ADMISSION_STATUS_OPTIONS,
  GUARDIAN_STATUS_OPTIONS,
  SPECIAL_NEED_FILTER_OPTIONS,
  STUDENT_SORT_OPTIONS,
  type OptionItem,
  type SpecialNeedCategoryOption,
} from '@/config/Options';
