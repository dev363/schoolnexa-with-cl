import {
  Address,
  TeacherQualification,
  TeacherExperience,
  EmergencyContact,
  TeacherDocument,
  DocumentType,
  DocumentVerificationStatus,
  TeacherStatus,
  EmploymentType,
  Gender,
  BloodGroup,
  MaritalStatus,
  DayOfWeek,
  TeacherFormData,
  Teacher,
} from '@/components/pages/teachers/types';

/**
 * Sub-section: Basic Identity Information
 */
export interface TeacherBasicInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  gender: Gender | string;
  dateOfBirth: string;
  profilePhoto: string;
}

/**
 * Sub-section: Personal Information
 */
export interface TeacherPersonalInfo {
  nationality: string;
  maritalStatus: string;
  bloodGroup: string;
}

/**
 * Sub-section: Contact Information
 */
export interface TeacherContactInfo {
  mobile: string;
  alternateMobile: string;
  email: string;
  alternateEmail: string;
}

/**
 * Sub-section: Address Information
 */
export interface TeacherAddressInfo {
  currentAddress: Address;
  permanentAddress: Address;
  sameAsCurrentAddress: boolean;
}

/**
 * Sub-section: Employment & School Role Information
 */
export interface TeacherEmploymentInfo {
  designationName: string;
  departmentName: string;
  employmentType: EmploymentType;
  joiningDate: string;
  confirmationDate: string;
  status: TeacherStatus;
  workLocation: string;
  reportingTeacherId: string;
}

/**
 * Sub-section: Notes & Remarks
 */
export interface TeacherNotesInfo {
  notes: string;
  remarks: string;
}

/**
 * Comprehensive top-level state model for the Teacher Add/Edit form.
 * Covers all fields managed by TeacherForm.tsx, including core fields,
 * address matching, dynamic arrays (qualifications, experiences,
 * emergency contacts, documents), languages, skills, and notes.
 */
export interface TeacherFormState {
  // Optional authoritative teacher ID (used in edit mode or pre-generated)
  teacherId?: string;

  // Basic Information
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  gender: string;
  dateOfBirth: string;
  profilePhoto: string;

  // Personal Information
  nationality: string;
  maritalStatus: string;
  bloodGroup: string;

  // Contact Information
  mobile: string;
  alternateMobile: string;
  email: string;
  alternateEmail: string;

  // Address
  currentAddress: Address;
  permanentAddress: Address;
  sameAsCurrentAddress: boolean;
  sameAsCurrentAddressChecked?: boolean;

  // Employment
  designationName: string;
  departmentName: string;
  employmentType: EmploymentType;
  joiningDate: string;
  confirmationDate: string;
  status: TeacherStatus;
  workLocation: string;
  reportingTeacherId: string;

  // Dynamic Array Collections
  qualifications: TeacherQualification[];
  experiences: TeacherExperience[];
  emergencyContacts: EmergencyContact[];
  documents: TeacherDocument[];

  // Languages & Special Skills
  languages: string[];
  specialSkills: string[];

  // Notes & Remarks
  notes: string;
  remarks: string;
}

/**
 * Factory function to create a fully initialized TeacherFormState.
 * When an initialTeacher is provided (e.g. edit mode), it maps existing
 * values and falls back to established SchoolNexa defaults.
 */
export const createInitialTeacherFormState = (
  initialTeacher?: Teacher | null,
  options?: { teacherId?: string },
): TeacherFormState => {
  const currentAddr: Address = {
    addressLine1: initialTeacher?.currentAddress?.addressLine1 || '',
    addressLine2: initialTeacher?.currentAddress?.addressLine2 || '',
    city: initialTeacher?.currentAddress?.city || 'Chandigarh',
    state: initialTeacher?.currentAddress?.state || 'Punjab',
    country: initialTeacher?.currentAddress?.country || 'India',
    postalCode: initialTeacher?.currentAddress?.postalCode || '160022',
  };

  const permanentAddr: Address = {
    addressLine1: initialTeacher?.permanentAddress?.addressLine1 || '',
    addressLine2: initialTeacher?.permanentAddress?.addressLine2 || '',
    city: initialTeacher?.permanentAddress?.city || 'Chandigarh',
    state: initialTeacher?.permanentAddress?.state || 'Punjab',
    country: initialTeacher?.permanentAddress?.country || 'India',
    postalCode: initialTeacher?.permanentAddress?.postalCode || '160022',
  };

  return {
    teacherId: initialTeacher?.teacherId || options?.teacherId || '',

    // Basic Information
    firstName: initialTeacher?.firstName || '',
    middleName: initialTeacher?.middleName || '',
    lastName: initialTeacher?.lastName || '',
    preferredName: initialTeacher?.preferredName || '',
    gender: initialTeacher?.gender || 'Male',
    dateOfBirth: initialTeacher?.dateOfBirth || '1990-01-01',
    profilePhoto: initialTeacher?.profilePhoto || '',

    // Personal Information
    nationality: initialTeacher?.nationality || 'Indian',
    maritalStatus: initialTeacher?.maritalStatus || 'Married',
    bloodGroup: initialTeacher?.bloodGroup || 'O+',

    // Contact Information
    mobile: initialTeacher?.mobile || '',
    alternateMobile: initialTeacher?.alternateMobile || '',
    email: initialTeacher?.email || '',
    alternateEmail: initialTeacher?.alternateEmail || '',

    // Address
    currentAddress: currentAddr,
    permanentAddress: permanentAddr,
    sameAsCurrentAddress: Boolean(
      (initialTeacher as { sameAsCurrentAddress?: boolean })?.sameAsCurrentAddress ??
      (initialTeacher?.currentAddress &&
        initialTeacher?.permanentAddress &&
        initialTeacher.currentAddress.addressLine1 &&
        initialTeacher.currentAddress.addressLine1 === initialTeacher.permanentAddress.addressLine1 &&
        initialTeacher.currentAddress.city === initialTeacher.permanentAddress.city &&
        initialTeacher.currentAddress.postalCode === initialTeacher.permanentAddress.postalCode)
    ),
    sameAsCurrentAddressChecked: false,

    // Employment
    designationName: initialTeacher?.designationName || 'Teacher',
    departmentName: initialTeacher?.departmentName || 'Mathematics',
    employmentType: initialTeacher?.employmentType || 'FULL_TIME',
    joiningDate: initialTeacher?.joiningDate || new Date().toISOString().split('T')[0],
    confirmationDate: initialTeacher?.confirmationDate || '',
    status: initialTeacher?.status || 'ACTIVE',
    workLocation: initialTeacher?.workLocation || '',
    reportingTeacherId: initialTeacher?.reportingTeacherId || '',

    // Qualifications & Experiences
    qualifications: initialTeacher?.qualifications || [],
    experiences: initialTeacher?.experiences || [],

    // Emergency Contacts
    emergencyContacts: initialTeacher?.emergencyContacts || [],

    // Documents
    documents: initialTeacher?.documents || [],

    // Languages & Special Skills
    languages: initialTeacher?.languages || ['English', 'Hindi'],
    specialSkills: initialTeacher?.specialSkills || [],

    // Notes & Remarks
    notes: initialTeacher?.notes || '',
    remarks: initialTeacher?.remarks || '',
  };
};

/**
 * Constant for default empty/initial TeacherFormState
 */
export const DEFAULT_TEACHER_FORM_STATE: TeacherFormState = createInitialTeacherFormState();

// Re-export core Teacher types for convenience
export type {
  Address,
  TeacherQualification,
  TeacherExperience,
  EmergencyContact,
  TeacherDocument,
  DocumentType,
  DocumentVerificationStatus,
  TeacherStatus,
  EmploymentType,
  Gender,
  BloodGroup,
  MaritalStatus,
  DayOfWeek,
  TeacherFormData,
  Teacher,
};
