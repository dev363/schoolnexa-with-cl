/**
 * Teacher & Faculty Domain Types and DTOs
 * Strictly aligned with Prisma Staff, Department, Designation,
 * TeacherAssignment, and TimetableSlot models.
 */

export interface TeacherQualificationDto {
  id?: string;
  degree: string;
  specialization?: string;
  fieldOfStudy?: string;
  institution: string;
  university?: string;
  year?: number | string;
  yearOfPassing?: number | string;
  grade?: string;
  percentageOrGrade?: string;
}

export interface TeacherExperienceDto {
  id?: string;
  organization: string;
  designation?: string;
  startDate?: string;
  endDate?: string;
  totalYears?: number | string;
  description?: string;
}

export interface TeacherEmergencyContactDto {
  id?: string;
  name: string;
  relationship?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
}

export interface TeacherAddressDto {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface TeacherDocumentDto {
  id: string;
  name?: string;
  type: string;
  uploadDate?: string;
  status: 'VERIFIED' | 'PENDING';
  fileUrl: string;
  fileSize?: string;
}

export interface TeacherSubjectAssignmentDto {
  id: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  periodsPerWeek?: number;
  assignmentType?: string;
  isClassTeacher: boolean;
  status: 'Active' | 'Inactive';
}

export interface TeacherClassAssignmentDto {
  id: string;
  academicYearId: string;
  academicYearName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  room?: string;
  isClassTeacher: boolean;
  status: 'Active' | 'Inactive';
}

export interface TeacherTimetableSlotDto {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  periodName: string;
  startTime: string;
  endTime: string;
  className: string;
  sectionName: string;
  subjectName: string;
  room: string;
  isFree?: boolean;
}

/**
 * Compact Teacher representation for master lists & tables
 */
export interface TeacherDto {
  id: string;
  schoolId: string;
  teacherId: string; // Staff employeeCode (e.g. TCH-000101 or FAC-1001)
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  preferredName?: string;
  email: string;
  phone: string;
  mobile: string;
  alternateMobile?: string;
  alternateEmail?: string;
  gender: string;
  dateOfBirth: string;
  dateOfJoining: string;
  joiningDate?: string;
  confirmationDate?: string;
  employmentType: string;
  qualification: string | null;
  status: string; // ACTIVE, INACTIVE, SUSPENDED, RESIGNED, RETIRED, TERMINATED
  profilePhoto: string | null;
  bloodGroup: string | null;
  nationality?: string;
  maritalStatus?: string;
  departmentId: string | null;
  departmentName: string | null;
  designationId: string | null;
  designationName: string | null;
  workLocation?: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  activeAssignmentsCount?: number;
  subjectAssignmentsSummary?: string[];
}

/**
 * Detailed Teacher representation for profile inspect/edit
 */
export interface TeacherDetailDto extends TeacherDto {
  currentAddress?: TeacherAddressDto;
  permanentAddress?: TeacherAddressDto;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  reportingTeacherId?: string;
  reportingTeacherName?: string;
  qualifications: TeacherQualificationDto[];
  experiences: TeacherExperienceDto[];
  emergencyContacts: TeacherEmergencyContactDto[];
  documents: TeacherDocumentDto[];
  subjectAssignments: TeacherSubjectAssignmentDto[];
  classAssignments: TeacherClassAssignmentDto[];
  timetableSlots: TeacherTimetableSlotDto[];
  languages?: string[];
  specialSkills?: string[];
  notes?: string;
  remarks?: string;
  details?: Record<string, any>;
}

export interface CreateTeacherInput {
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
  gender: string;
  dateOfBirth: string;
  dateOfJoining?: string;
  joiningDate?: string;
  confirmationDate?: string;
  employmentType?: string;
  qualification?: string;
  status?: string;
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
  currentAddress?: TeacherAddressDto;
  permanentAddress?: TeacherAddressDto;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: TeacherQualificationDto[];
  experiences?: TeacherExperienceDto[];
  emergencyContacts?: TeacherEmergencyContactDto[];
  documents?: any[];
  languages?: string[];
  specialSkills?: string[];
  notes?: string;
  remarks?: string;
  details?: Record<string, any>;
}

export interface UpdateTeacherInput {
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
  status?: string;
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
  currentAddress?: TeacherAddressDto;
  permanentAddress?: TeacherAddressDto;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: TeacherQualificationDto[];
  experiences?: TeacherExperienceDto[];
  emergencyContacts?: TeacherEmergencyContactDto[];
  documents?: any[];
  languages?: string[];
  specialSkills?: string[];
  notes?: string;
  remarks?: string;
  details?: Record<string, any>;
}

export interface UpdateTeacherStatusInput {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED' | 'RETIRED' | 'TERMINATED';
  reason?: string;
}

export interface TeacherFilterOptions {
  search?: string;
  status?: string;
  employmentType?: string;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationName?: string;
  gender?: string;
  academicYearId?: string;
  sortBy?: 'firstName' | 'lastName' | 'employeeCode' | 'createdAt' | 'dateOfJoining';
  sortOrder?: 'asc' | 'desc';
}

export interface AssignSubjectInput {
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

export interface AssignClassTeacherInput {
  academicYearId?: string;
  academicYearName?: string;
  classId?: string;
  className: string;
  sectionId?: string;
  sectionName: string;
  room?: string;
  transferExisting?: boolean;
}

export interface TeacherWorkloadDto {
  teacherId: string;
  teacherName: string;
  employeeCode: string;
  departmentName: string;
  designationName: string;
  employmentType: string;
  totalWeeklyPeriods: number;
  targetWeeklyPeriods: number;
  workloadStatus: 'UNDERLOADED' | 'BALANCED' | 'OVERLOADED';
  workloadPercentage: number;
  subjectAssignments: TeacherSubjectAssignmentDto[];
  classTeacherAssignment?: TeacherClassAssignmentDto;
  timetableSlotsCount: number;
  distributionByClass: Array<{ className: string; periods: number }>;
  distributionBySubject: Array<{ subjectName: string; periods: number }>;
}

export interface WorkloadSummaryDto {
  totalTeachers: number;
  assignedTeachers: number;
  unassignedTeachers: number;
  averagePeriodsPerTeacher: number;
  totalPeriodsAssigned: number;
  underloadedCount: number;
  balancedCount: number;
  overloadedCount: number;
  teachers: TeacherWorkloadDto[];
}
