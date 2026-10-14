/**
 * Teacher & Faculty RTK Query API Types
 *
 * Types for requests, responses, filters, and cache payloads for the Teacher module.
 * Fully aligned with backend Express/Prisma teacher models and frontend Teacher types.
 */

import type {
  Teacher,
  TeacherStatus,
  EmploymentType,
  Gender,
  BloodGroup,
  MaritalStatus,
  Address,
  TeacherQualification,
  TeacherExperience,
  EmergencyContact,
  TeacherDocument,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  TeacherTimetableSlot,
  DepartmentItem,
  DesignationItem,
  TeacherWorkload,
  WorkloadSummary,
  TeacherActivityLog,
} from '@/components/pages/teachers/types';

// Re-export core entity types for convenient consumption
export type {
  Teacher,
  TeacherStatus,
  EmploymentType,
  Gender,
  BloodGroup,
  MaritalStatus,
  Address,
  TeacherQualification,
  TeacherExperience,
  EmergencyContact,
  TeacherDocument,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  TeacherTimetableSlot,
  DepartmentItem,
  DesignationItem,
  TeacherWorkload,
  WorkloadSummary,
  TeacherActivityLog,
};

/**
 * Query parameters supported by GET /api/teachers
 */
export interface TeacherQueryParams {
  [key: string]: any;
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  status?: 'ALL' | TeacherStatus | string;
  employmentType?: string;
  departmentId?: string;
  designationId?: string;
  gender?: string;
  academicYearId?: string;
  sortBy?: 'firstName' | 'lastName' | 'employeeCode' | 'createdAt' | 'dateOfJoining' | string;
  sortOrder?: 'asc' | 'desc';
  schoolId?: string;
  token?: string;
}

/**
 * Standard pagination metadata returned by SchoolNexa backend
 */
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Response structure for GET /api/teachers
 */
export interface TeacherListResponse {
  teachers: Teacher[];
  pagination: PaginationMetadata;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Detailed Teacher profile response for GET /api/teachers/:teacherId
 */
export interface TeacherDetailResponse {
  teacher: Teacher;
  subjectAssignments: TeacherSubjectAssignment[];
  classAssignment?: TeacherClassAssignment;
  timetableSlots: TeacherTimetableSlot[];
  documents: TeacherDocument[];
}

/**
 * Response for GET /api/teachers/metadata
 */
export interface TeacherMetadataResponse {
  departments: DepartmentItem[];
  designations: DesignationItem[];
}

/**
 * Response for GET /api/teachers/next-id
 */
export interface NextTeacherIdResponse {
  nextTeacherId: string;
}

/**
 * Request payload for POST /api/teachers
 */
export interface CreateTeacherRequest {
  teacherId?: string;
  employeeCode?: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  alternateMobile?: string;
  alternateEmail?: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  joiningDate?: string;
  confirmationDate?: string;
  employmentType?: string;
  qualification?: string;
  status?: TeacherStatus | string;
  profilePhoto?: string;
  bloodGroup?: string;
  nationality?: string;
  maritalStatus?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  designationId?: string | null;
  designationName?: string | null;
  workLocation?: string;
  reportingTeacherId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  currentAddress?: Address;
  permanentAddress?: Address;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: TeacherQualification[];
  experiences?: TeacherExperience[];
  emergencyContacts?: EmergencyContact[];
  documents?: any[];
  languages?: string[];
  specialSkills?: string[];
  notes?: string;
  remarks?: string;
  details?: Record<string, any>;
}

/**
 * Request payload for PUT /api/teachers/:teacherId
 */
export interface UpdateTeacherRequest {
  teacherId?: string;
  employeeCode?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  alternateMobile?: string;
  alternateEmail?: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  joiningDate?: string;
  confirmationDate?: string;
  employmentType?: string;
  qualification?: string;
  status?: TeacherStatus | string;
  profilePhoto?: string;
  bloodGroup?: string;
  nationality?: string;
  maritalStatus?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  designationId?: string | null;
  designationName?: string | null;
  workLocation?: string;
  reportingTeacherId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  currentAddress?: Address;
  permanentAddress?: Address;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: TeacherQualification[];
  experiences?: TeacherExperience[];
  emergencyContacts?: EmergencyContact[];
  documents?: any[];
  languages?: string[];
  specialSkills?: string[];
  notes?: string;
  remarks?: string;
  details?: Record<string, any>;
}

/**
 * Request payload for PATCH /api/teachers/:teacherId/status
 */
export interface UpdateTeacherStatusRequest {
  status: TeacherStatus;
  reason?: string;
}

/**
 * Request payload for POST /api/teachers/:teacherId/assignments/subjects
 */
export interface AssignSubjectRequest {
  academicYearId?: string;
  academicYearName?: string;
  classId?: string;
  className: string;
  sectionId?: string;
  sectionName: string;
  subjectId?: string;
  subjectName: string;
  periodsPerWeek: number;
  assignmentType?: 'Subject Teacher' | 'Assistant Teacher' | 'Lab Instructor';
}

/**
 * Request payload for POST /api/teachers/:teacherId/assignments/class-teacher
 */
export interface AssignClassTeacherRequest {
  academicYearId?: string;
  academicYearName?: string;
  classId?: string;
  className: string;
  sectionId?: string;
  sectionName: string;
  room?: string;
  transferExisting?: boolean;
}

/**
 * Teacher Qualifications requests
 */
export interface CreateTeacherQualificationRequest {
  degree: string;
  institution?: string;
  university?: string;
  year?: string;
  grade?: string;
  specialization?: string;
}

export interface UpdateTeacherQualificationRequest extends Partial<CreateTeacherQualificationRequest> {}

/**
 * Teacher Experience requests
 */
export interface CreateTeacherExperienceRequest {
  organization: string;
  designation: string;
  fromDate?: string;
  toDate?: string;
  duration?: string;
  responsibilities?: string;
}

export interface UpdateTeacherExperienceRequest extends Partial<CreateTeacherExperienceRequest> {}

/**
 * Teacher Document requests
 */
export interface CreateTeacherDocumentRequest {
  name: string;
  type?: string;
  documentNumber?: string;
  fileUrl?: string;
  fileSize?: string;
  status?: 'VERIFIED' | 'PENDING';
}

/**
 * Teacher Assignments response
 */
export interface TeacherAssignmentsResponse {
  subjectAssignments: TeacherSubjectAssignment[];
  classAssignment?: TeacherClassAssignment | null;
  classAssignments: TeacherClassAssignment[];
}

export type ListFilterType =
  | 'Like'
  | 'Equals'
  | 'NotEquals'
  | 'StartsWith'
  | 'EndsWith'
  | 'In'
  | 'NotIn'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'Between'
  | 'IsNull'
  | 'IsNotNull';

export interface ListOrderRule {
  orderTo: string;
  orderBy: 'asc' | 'desc';
}

export interface ListFilterRule {
  column: string;
  value?: any;
  type: ListFilterType;
}

export interface ListPageRequest {
  page?: number;
  pageSize?: number;
  order?: ListOrderRule[];
  filter?: ListFilterRule[];
  search?: string;
}

export interface ListPageResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}


