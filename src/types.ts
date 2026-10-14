export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  name?: string; // alias for fullName
  role?: string;
  phone?: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
}

export interface PermissionNode {
  id: string;
  code: string;
  module: string;
  action: string;
  description?: string;
}

export interface RoleSummary {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  permissions: string[]; // List of permission codes
}

export interface AcademicYearSummary {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'ARCHIVED';
}

export interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  domain?: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED';
  logoUrl?: string;
  roles: RoleSummary[];
  academicYears: AcademicYearSummary[];
  currentAcademicYear?: AcademicYearSummary;
}

export interface UserSchoolMembership {
  school: SchoolSummary;
  roles: RoleSummary[];
  permissions: string[];
}

export interface AuthContextState {
  user: UserSummary | null;
  schools: SchoolSummary[];
  activeSchool: SchoolSummary | null;
  activeAcademicYear: AcademicYearSummary | null;
  currentRoles: RoleSummary[];
  currentPermissions: string[];
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NotificationItem {
  id: string;
  schoolId: string;
  title: string;
  message: string;
  category: 'ACADEMIC' | 'FINANCE' | 'SYSTEM' | 'SECURITY' | 'ATTENDANCE';
  createdAt: string;
  isRead: boolean;
  linkTo?: string;
}

export interface NavigationItem {
  id: string;
  path?: string;
  labelKey: string;
  sectionKey: string;
  defaultLabel: string;
  defaultSection: string;
  iconName: string;
  requiredPermission?: string;
  badge?: string | number;
  description?: string;
}

export type ThemeMode = 'dark' | 'light';

// ==========================================
// MODULE 1: SCHOOL & ACADEMIC SETUP TYPES
// ==========================================

export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  domain?: string;
  affiliationBoard?: string;
  registrationNumber?: string;
  establishedYear?: number;
  principalName?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  timezone: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  updatedAt?: string;
}

export interface SchoolSettingItem {
  id: string;
  schoolId: string;
  settingKey: string;
  settingValue: string;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER' | 'JSON';
  isEncrypted: boolean;
  category: 'GENERAL' | 'ACADEMIC' | 'ATTENDANCE' | 'GRADING' | 'NOTIFICATIONS';
  description?: string;
}

export interface ClassItem {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  numericOrder: number;
  stream: 'SCIENCE' | 'COMMERCE' | 'ARTS' | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearSectionItem {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionName: string;
  name?: string; // alias for sectionName
  maxCapacity: number;
  currentCount: number;
  createdAt?: string;
  updatedAt?: string;
  // Computed / Join fields for UI convenience
  className?: string;
  classNumericOrder?: number;
}

export interface SubjectItem {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  subjectType: 'THEORY' | 'PRACTICAL' | 'HYBRID' | 'ACTIVITY';
  credits: number;
  isElective: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSubjectItem {
  id: string;
  schoolId: string;
  academicYearId?: string;
  academicYearName?: string;
  classId: string;
  subjectId: string;
  syllabusId?: string;
  syllabusName?: string;
  isMandatory: boolean;
  weeklyPeriods: number;
  createdAt?: string;
  // Computed / Join fields
  className?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectType?: string;
}

export interface StaffMember {
  id: string;
  schoolId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  qualification?: string;
  designationName: string;
  departmentName: string;
  employmentType?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

export interface TeacherAssignmentItem {
  id: string;
  schoolId: string;
  academicYearSectionId: string;
  staffId: string;
  subjectId: string | null;
  isClassTeacher: boolean;
  isActive: boolean;
  createdAt?: string;
  // Computed / Join fields
  staffName?: string;
  staffEmployeeCode?: string;
  className?: string;
  sectionName?: string;
  classId?: string;
  academicYearId?: string;
  subjectName?: string;
  subjectCode?: string;
}

export interface AcademicAuditLog {
  id: string;
  schoolId: string;
  userId: string;
  userName: string;
  action: string;
  resourceType:
    | 'SCHOOL'
    | 'ACADEMIC_YEAR'
    | 'CLASS'
    | 'SECTION'
    | 'SUBJECT'
    | 'CLASS_SUBJECT'
    | 'TEACHER_ASSIGNMENT'
    | 'TIMETABLE';
  resourceId: string;
  details: string;
  timestamp: string;
}

export interface AcademicOverviewStats {
  totalAcademicYears: number;
  currentAcademicYearName: string;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  totalClassSubjects: number;
  totalTeacherAssignments: number;
  totalStaff: number;
  totalTimetableSlots?: number;
}

// ==========================================
// TIMETABLE & SCHEDULING TYPES
// ==========================================

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetablePeriodSlot {
  id: string;
  name: string;
  periodNumber?: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  periodType?:
    'REGULAR' | 'PRACTICAL_LAB' | 'TUTORIAL' | 'SEMINAR' | 'ACTIVITY' | 'BREAK' | 'LUNCH' | string;
}

export interface TimetableEntry {
  id: string;
  schoolId: string;
  academicYearId: string;
  academicYearSectionId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room: string;
  periodType: 'REGULAR' | 'PRACTICAL_LAB' | 'TUTORIAL' | 'SEMINAR' | 'ACTIVITY';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Computed / Join fields
  className?: string;
  classId?: string;
  sectionName?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectType?: string;
  teacherName?: string;
  teacherEmployeeCode?: string;
}

export interface TimetableConflict {
  type: 'TEACHER_CLASH' | 'ROOM_CLASH' | 'SECTION_OVERLAP';
  message: string;
  conflictingEntry: TimetableEntry;
  dayOfWeek?: DayOfWeek;
  periodId?: string;
}
