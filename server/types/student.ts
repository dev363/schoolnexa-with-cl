/**
 * Student Domain Types and DTOs
 * Strictly aligned with Prisma schema models:
 * Student, StudentIdentity, Parent, ParentStudent, Enrollment, StudentDocument, TransferCertificate
 */

export interface StudentIdentityDto {
  id: string;
  nationalId: string;
  idType: string;
  birthCertNo: string | null;
  nationality: string;
  countryOfBirth: string | null;
  verifiedAt: string | null;
}

export interface StudentGuardianDto {
  id: string;
  parentId: string;
  relationship: string;
  isPrimaryContact: boolean;
  canPickup: boolean;
  parent: {
    id: string;
    primaryPhone: string;
    alternatePhone: string | null;
    occupation: string | null;
    annualIncome: string | null;
    currentAddress: string | null;
    permanentAddress: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    user?: {
      id: string;
      fullName: string;
      email: string;
    } | null;
  };
}

export interface StudentEnrollmentSummaryDto {
  id: string;
  academicYearId: string;
  academicYearName?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  rollNumber: number | null;
  status: string; // ACTIVE, PROMOTED, TRANSFERRED, DROPPED, GRADUATED
}

export interface StudentEnrollmentDetailDto extends StudentEnrollmentSummaryDto {
  createdAt: string;
  updatedAt: string;
}

export interface StudentDocumentDto {
  id: string;
  storedFileId: string;
  documentType: string;
  documentNumber: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface StudentTransferCertificateDto {
  id: string;
  certificateNumber: string;
  issueDate: string;
  reasonForLeaving: string;
  conductRemarks: string | null;
  status: string;
  createdAt: string;
}

/**
 * Compact Student representation for listings.
 */
export interface StudentDto {
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
  fullName: string;
  photoUrl?: string | null;
  gender: string;
  dateOfBirth: string;
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
  transferCertificateDate?: string | null;
  notes?: string | null;
  emergencyContact: string;
  emergencyPhone: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  identity?: {
    nationalId: string;
    idType: string;
    nationality: string;
  };
  currentEnrollment?: StudentEnrollmentSummaryDto | null;
}

/**
 * Detailed Student representation for single record inspection.
 */
export interface StudentDetailDto extends StudentDto {
  identity: StudentIdentityDto;
  guardians: StudentGuardianDto[];
  enrollments: StudentEnrollmentDetailDto[];
  documents: StudentDocumentDto[];
  transferCertificates: StudentTransferCertificateDto[];
}

export interface CreateGuardianInput {
  id?: string;
  relationship: string; // FATHER, MOTHER, GUARDIAN, OTHER
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  mobile?: string;
  primaryPhone?: string;
  alternateMobile?: string;
  alternatePhone?: string;
  email?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  isPrimary?: boolean;
  isPrimaryContact?: boolean;
  isEmergencyContact?: boolean;
  isAuthorizedPickup?: boolean;
  canPickup?: boolean;
  fullName?: string;
}

export interface CreateStudentInput {
  admissionNumber?: string;
  registrationId?: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  photoUrl?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string;
  dateOfBirth: string;
  bloodGroup?: string;
  specialCategory?: string;
  specialCategoryDetails?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  motherTongue?: string;
  placeOfBirth?: string;
  governmentId?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  previousSchool?: string;
  previousClass?: string;
  previousSchoolBoard?: string;
  transferCertificateNumber?: string;
  transferCertificateDate?: string;
  notes?: string;
  status?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Identity attributes (StudentIdentity model)
  nationalId?: string;
  idType?: string;
  birthCertNo?: string;
  countryOfBirth?: string;

  // Guardian attributes (Parent & ParentStudent models)
  guardians?: CreateGuardianInput[];
}

export interface UpdateStudentInput {
  admissionNumber?: string;
  registrationId?: string | null;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  photoUrl?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  dateOfBirth?: string;
  bloodGroup?: string | null;
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
  address?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  country?: string | null;
  postalCode?: string;
  previousSchool?: string | null;
  previousClass?: string | null;
  previousSchoolBoard?: string | null;
  transferCertificateNumber?: string | null;
  transferCertificateDate?: string | null;
  notes?: string | null;
  status?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Identity attributes
  nationalId?: string;
  idType?: string;
  birthCertNo?: string | null;
  countryOfBirth?: string | null;

  // Guardian updates
  guardians?: CreateGuardianInput[];
}

export interface StudentStatusUpdateInput {
  status: 'ACTIVE' | 'INACTIVE';
  reason?: string;
}

export interface StudentFilterOptions {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  gender?: string;
  bloodGroup?: string;
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
  sortBy?: 'firstName' | 'lastName' | 'admissionNumber' | 'createdAt' | 'dateOfBirth';
  sortOrder?: 'asc' | 'desc';
}
