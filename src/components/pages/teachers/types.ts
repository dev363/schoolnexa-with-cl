export type TeacherStatus =
  'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED' | 'RETIRED' | 'TERMINATED';

export type EmploymentType =
  'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING' | 'GUEST' | 'TEMPORARY';

export type Gender = 'Male' | 'Female' | 'Other';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type MaritalStatus = 'Married' | 'Single' | 'Widowed' | 'Divorced';

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface TeacherQualification {
  id: string;
  degree: string;
  specialization?: string;
  institution?: string;
  university?: string;
  year?: number;
  grade?: string;
}

export interface TeacherExperience {
  id: string;
  organization: string;
  designation?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
}

export type DocumentType =
  | 'RESUME'
  | 'QUALIFICATION_CERTIFICATE'
  | 'EXPERIENCE_CERTIFICATE'
  | 'ID_PROOF'
  | 'JOINING_DOCUMENT'
  | 'OTHER';

export type DocumentVerificationStatus = 'VERIFIED' | 'PENDING';

export interface TeacherDocument {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  status: DocumentVerificationStatus;
  fileSize?: string;
  fileUrl?: string;
}

/**
 * Teacher Master Record
 *
 * CRITICAL ARCHITECTURAL RULES:
 * - Permanent school-specific master record.
 * - Primary identity: teacherId (e.g. TCH-000123).
 * - There is NO generic userId.
 * - There is NO employeeId.
 * - Assignments (Subject, Class, Timetable, Attendance, Leave, Payroll) are SEPARATE entities.
 */
export interface Teacher {
  id: string;
  teacherId: string; // TCH-000123 (Permanent unique identity)

  firstName: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;

  gender?: Gender | string;
  dateOfBirth?: string;
  profilePhoto?: string;

  mobile?: string;
  alternateMobile?: string;
  email?: string;
  alternateEmail?: string;

  nationality?: string;
  maritalStatus?: string;
  bloodGroup?: string;

  currentAddress?: Address;
  permanentAddress?: Address;

  designationId?: string;
  designationName?: string;

  departmentId?: string;
  departmentName?: string;

  employmentType: EmploymentType;

  joiningDate?: string;
  confirmationDate?: string;

  status: TeacherStatus;

  workLocation?: string;
  reportingTeacherId?: string;
  reportingTeacherName?: string;

  qualifications: TeacherQualification[];
  experiences: TeacherExperience[];
  emergencyContacts: EmergencyContact[];
  documents?: TeacherDocument[];

  languages?: string[];
  specialSkills?: string[];

  notes?: string;
  remarks?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Subject Assignment entity (Separate from Teacher master)
 */
export interface TeacherSubjectAssignment {
  id: string;
  teacherId: string; // references Teacher.teacherId
  academicYear: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  periodsPerWeek: number;
  assignmentType: 'Subject Teacher' | 'Assistant Teacher' | 'Lab Instructor';
  status: 'Active' | 'Inactive';
}

/**
 * Class Teacher Assignment entity (Separate from Teacher master)
 */
export interface TeacherClassAssignment {
  id: string;
  teacherId: string; // references Teacher.teacherId
  academicYear: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  room?: string;
  isClassTeacher: boolean;
  status: 'Active' | 'Inactive';
}

/**
 * Days of week supported for teacher timetables
 */
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

/**
 * Timetable Slot representation for Teacher's weekly preview
 */
export interface TeacherTimetableSlot {
  id: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
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
 * Activity audit entry
 */
export interface TeacherActivityLog {
  id: string;
  teacherId: string;
  action: string;
  date: string;
  description: string;
  actor?: string;
}

/**
 * Teacher Master Filter State
 */
export interface TeacherFilters {
  searchTerm: string;
  status: string;
  employmentType: string;
  department: string;
  designation: string;
  gender: string;
  qualification: string;
  joiningYear: string;
}

/**
 * Teacher Form Data (for add / edit)
 */
export interface TeacherFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  gender: string;
  dateOfBirth: string;
  profilePhoto: string;

  // Personal
  nationality: string;
  maritalStatus: string;
  bloodGroup: string;
  languages: string[];
  specialSkills: string[];

  // Contact
  mobile: string;
  alternateMobile: string;
  email: string;
  alternateEmail: string;

  // Address
  currentAddress: Address;
  permanentAddress: Address;
  sameAsCurrentAddress: boolean;

  // Employment
  designationName: string;
  departmentName: string;
  employmentType: EmploymentType;
  joiningDate: string;
  confirmationDate: string;
  status: TeacherStatus;
  workLocation: string;
  reportingTeacherId: string;

  // Notes
  notes: string;
  remarks: string;
}

export interface DesignationItem {
  id: string;
  name: string;
  category?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
}

export type WorkloadStatus = 'UNDERLOADED' | 'BALANCED' | 'OVERLOADED';

export interface TeacherWorkload {
  teacherId: string;
  teacherName: string;
  employeeCode: string;
  departmentName?: string;
  designationName?: string;
  employmentType: EmploymentType;
  totalWeeklyPeriods: number;
  targetWeeklyPeriods: number;
  workloadStatus: WorkloadStatus;
  workloadPercentage: number;
  subjectAssignments: TeacherSubjectAssignment[];
  classTeacherAssignment?: TeacherClassAssignment;
  timetableSlotsCount: number;
  distributionByClass: Array<{ className: string; periods: number }>;
  distributionBySubject: Array<{ subjectName: string; periods: number }>;
}

export interface WorkloadSummary {
  totalTeachers: number;
  assignedTeachers: number;
  unassignedTeachers: number;
  averagePeriodsPerTeacher: number;
  totalPeriodsAssigned: number;
  underloadedCount: number;
  balancedCount: number;
  overloadedCount: number;
  teachers: TeacherWorkload[];
}
