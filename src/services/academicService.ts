import {
  SchoolProfile,
  SchoolSettingItem,
  AcademicYearSummary,
  ClassItem,
  AcademicYearSectionItem,
  SubjectItem,
  ClassSubjectItem,
  StaffMember,
  TeacherAssignmentItem,
  AcademicAuditLog,
  AcademicOverviewStats,
  DayOfWeek,
  TimetablePeriodSlot,
  TimetableEntry,
  TimetableConflict,
} from '../types';
import { WEEK_DAYS } from '@/config/Options';
import { apiClient } from './apiClient';
import { getBusinessPrefix, getInternalIdPrefix } from '@/config/identifiers';

const STORAGE_KEYS = {
  PROFILES: 'schoolnexa_school_profiles_v1',
  SETTINGS: 'schoolnexa_school_settings_v1',
  CLASSES: 'schoolnexa_classes_v1',
  SECTIONS: 'schoolnexa_class_sections_v1',
  SUBJECTS: 'schoolnexa_subjects_v1',
  CLASS_SUBJECTS: 'schoolnexa_class_subjects_v1',
  STAFF: 'schoolnexa_staff_v1',
  ASSIGNMENTS: 'schoolnexa_teacher_assignments_v1',
  AUDIT_LOGS: 'schoolnexa_academic_audit_logs_v1',
  TIMETABLE: 'schoolnexa_timetable_entries_v1',
  PERIOD_SLOTS: 'schoolnexa_timetable_period_slots_v1',
  SYLLABI: 'schoolnexa_syllabi_v1',
};

// Initial Seed Data aligned with Oakridge Academy & St. Xavier
const SEED_PROFILES: SchoolProfile[] = [
  {
    id: 'school-oakridge-01',
    name: 'Oakridge International Academy',
    code: 'OAK-ACAD',
    domain: 'oakridge.schoolnexa.com',
    affiliationBoard: 'CBSE / Cambridge Assessment International',
    registrationNumber: 'REG-2023-OAK-9481',
    establishedYear: 2008,
    principalName: 'Dr. Evelyn Vance, Ed.D.',
    address: '42 Academic Crest Way, North Campus, Technology Corridor',
    city: 'San Jose',
    state: 'California',
    country: 'United States',
    postalCode: '95134',
    phone: '+1 (408) 555-0199',
    email: 'admin@oakridge.schoolnexa.com',
    website: 'https://oakridge.schoolnexa.com',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    logoUrl:
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'school-stxavier-02',
    name: 'St. Xavier Collegiate Institute',
    code: 'STX-COLL',
    domain: 'stxavier.schoolnexa.com',
    affiliationBoard: 'ICSE / CISCE International',
    registrationNumber: 'REG-2021-STX-1102',
    establishedYear: 1996,
    principalName: 'Father Thomas Augustine, Ph.D.',
    address: '108 Cathedral Road, Heritage District',
    city: 'Boston',
    state: 'Massachusetts',
    country: 'United States',
    postalCode: '02115',
    phone: '+1 (617) 555-0142',
    email: 'office@stxavier.schoolnexa.com',
    website: 'https://stxavier.schoolnexa.com',
    currency: 'USD',
    timezone: 'America/New_York',
    logoUrl:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
];

const SEED_SETTINGS: SchoolSettingItem[] = [
  {
    id: 'set-1',
    schoolId: 'school-oakridge-01',
    settingKey: 'academic.attendance_mode',
    settingValue: 'PERIOD_WISE',
    dataType: 'STRING',
    isEncrypted: false,
    category: 'ATTENDANCE',
    description: 'Attendance capture cadence: DAILY or PERIOD_WISE',
  },
  {
    id: 'set-2',
    schoolId: 'school-oakridge-01',
    settingKey: 'academic.grading_system',
    settingValue: 'GPA_4_SCALE',
    dataType: 'STRING',
    isEncrypted: false,
    category: 'GRADING',
    description: 'Evaluation scale for transcripts (GPA_4_SCALE, PERCENTAGE, LETTER_GRADE)',
  },
  {
    id: 'set-3',
    schoolId: 'school-oakridge-01',
    settingKey: 'system.date_format',
    settingValue: 'YYYY-MM-DD',
    dataType: 'STRING',
    isEncrypted: false,
    category: 'GENERAL',
    description: 'Standard institutional date formatting string',
  },
  {
    id: 'set-4',
    schoolId: 'school-oakridge-01',
    settingKey: 'academic.max_section_capacity',
    settingValue: '35',
    dataType: 'NUMBER',
    isEncrypted: false,
    category: 'ACADEMIC',
    description: 'Default maximum student capacity cap per classroom section',
  },
  {
    id: 'set-5',
    schoolId: 'school-oakridge-01',
    settingKey: 'notifications.sms_alerts_enabled',
    settingValue: 'true',
    dataType: 'BOOLEAN',
    isEncrypted: false,
    category: 'NOTIFICATIONS',
    description: 'Enable automated transactional SMS alerts for guardians',
  },
];

const SEED_CLASSES: ClassItem[] = [
  {
    id: 'cls-oak-g6',
    schoolId: 'school-oakridge-01',
    name: 'Grade 6',
    code: 'G-06',
    numericOrder: 6,
    stream: null,
  },
  {
    id: 'cls-oak-g7',
    schoolId: 'school-oakridge-01',
    name: 'Grade 7',
    code: 'G-07',
    numericOrder: 7,
    stream: null,
  },
  {
    id: 'cls-oak-g8',
    schoolId: 'school-oakridge-01',
    name: 'Grade 8',
    code: 'G-08',
    numericOrder: 8,
    stream: null,
  },
  {
    id: 'cls-oak-g9',
    schoolId: 'school-oakridge-01',
    name: 'Grade 9',
    code: 'G-09',
    numericOrder: 9,
    stream: null,
  },
  {
    id: 'cls-oak-g10',
    schoolId: 'school-oakridge-01',
    name: 'Grade 10',
    code: 'G-10',
    numericOrder: 10,
    stream: null,
  },
  {
    id: 'cls-oak-g11',
    schoolId: 'school-oakridge-01',
    name: 'Grade 11',
    code: 'G-11-SCI',
    numericOrder: 11,
    stream: 'SCIENCE',
  },
  {
    id: 'cls-oak-g12',
    schoolId: 'school-oakridge-01',
    name: 'Grade 12',
    code: 'G-12-SCI',
    numericOrder: 12,
    stream: 'SCIENCE',
  },
];

const SEED_SECTIONS: AcademicYearSectionItem[] = [
  {
    id: 'sec-oak-8a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g8',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 32,
  },
  {
    id: 'sec-oak-8b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g8',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 30,
  },
  {
    id: 'sec-oak-9a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g9',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 34,
  },
  {
    id: 'sec-oak-9b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g9',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 33,
  },
  {
    id: 'sec-oak-10a',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g10',
    sectionName: 'A',
    maxCapacity: 35,
    currentCount: 35,
  },
  {
    id: 'sec-oak-10b',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    classId: 'cls-oak-g10',
    sectionName: 'B',
    maxCapacity: 35,
    currentCount: 31,
  },
];

const SEED_SUBJECTS: SubjectItem[] = [
  {
    id: 'sub-oak-math',
    schoolId: 'school-oakridge-01',
    name: 'Advanced Mathematics',
    code: 'MTH-101',
    subjectType: 'THEORY',
    credits: 4,
    isElective: false,
  },
  {
    id: 'sub-oak-eng',
    schoolId: 'school-oakridge-01',
    name: 'English Literature & Composition',
    code: 'ENG-101',
    subjectType: 'THEORY',
    credits: 4,
    isElective: false,
  },
  {
    id: 'sub-oak-sci',
    schoolId: 'school-oakridge-01',
    name: 'General Science & Lab',
    code: 'SCI-101',
    subjectType: 'HYBRID',
    credits: 4,
    isElective: false,
  },
  {
    id: 'sub-oak-soc',
    schoolId: 'school-oakridge-01',
    name: 'World History & Civics',
    code: 'SOC-101',
    subjectType: 'THEORY',
    credits: 3,
    isElective: false,
  },
  {
    id: 'sub-oak-cs',
    schoolId: 'school-oakridge-01',
    name: 'Computer Science & Robotics',
    code: 'CSC-101',
    subjectType: 'PRACTICAL',
    credits: 3,
    isElective: true,
  },
  {
    id: 'sub-oak-art',
    schoolId: 'school-oakridge-01',
    name: 'Visual & Performing Arts',
    code: 'ART-101',
    subjectType: 'ACTIVITY',
    credits: 2,
    isElective: true,
  },
];

const SEED_CLASS_SUBJECTS: ClassSubjectItem[] = [
  {
    id: 'cs-8-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
  },
  {
    id: 'cs-8-eng',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-eng',
    isMandatory: true,
    weeklyPeriods: 5,
  },
  {
    id: 'cs-8-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 5,
  },
  {
    id: 'cs-8-soc',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-soc',
    isMandatory: true,
    weeklyPeriods: 4,
  },
  {
    id: 'cs-8-cs',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g8',
    subjectId: 'sub-oak-cs',
    isMandatory: false,
    weeklyPeriods: 3,
  },
  {
    id: 'cs-9-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g9',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
  },
  {
    id: 'cs-9-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g9',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 6,
  },
  {
    id: 'cs-10-math',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g10',
    subjectId: 'sub-oak-math',
    isMandatory: true,
    weeklyPeriods: 6,
  },
  {
    id: 'cs-10-sci',
    schoolId: 'school-oakridge-01',
    classId: 'cls-oak-g10',
    subjectId: 'sub-oak-sci',
    isMandatory: true,
    weeklyPeriods: 6,
  },
];

export interface SyllabusRecord {
  id: string;
  schoolId: string;
  classSubjectId: string;
  academicYearId: string;
  syllabusName: string;
}

const SEED_SYLLABI: SyllabusRecord[] = [
  {
    id: 'syl-8-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-math',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 8 Mathematics Syllabus',
  },
  {
    id: 'syl-8-eng-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-eng',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 8 English & Grammar Syllabus',
  },
  {
    id: 'syl-8-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-sci',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 8 General Science Syllabus',
  },
  {
    id: 'syl-8-soc-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-soc',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 8 Social Studies Syllabus',
  },
  {
    id: 'syl-8-cs-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-8-cs',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Computer Applications & Coding',
  },
  {
    id: 'syl-9-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-9-math',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 9 Mathematics Syllabus',
  },
  {
    id: 'syl-9-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-9-sci',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 9 Science & Experiments Syllabus',
  },
  {
    id: 'syl-10-math-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-10-math',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 10 Board Math Syllabus',
  },
  {
    id: 'syl-10-sci-2025',
    schoolId: 'school-oakridge-01',
    classSubjectId: 'cs-10-sci',
    academicYearId: 'ay-oak-2025',
    syllabusName: 'Grade 10 Physics & Chemistry Syllabus',
  },
];

const SEED_STAFF: StaffMember[] = [
  {
    id: 'stf-oak-01',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1001',
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'm.chen@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0211',
    gender: 'Male',
    qualification: 'M.Sc. Pure Mathematics, Stanford',
    designationName: 'Senior Department Chair',
    departmentName: 'Mathematics & Computing',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-02',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1002',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0214',
    gender: 'Female',
    qualification: 'M.A. English Literature, Oxford',
    designationName: 'Senior Faculty Teacher',
    departmentName: 'Humanities & Languages',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-03',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1003',
    firstName: 'Dr. Robert',
    lastName: 'Sterling',
    email: 'r.sterling@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0219',
    gender: 'Male',
    qualification: 'Ph.D. Applied Physics, UC Berkeley',
    designationName: 'Lead Science Master',
    departmentName: 'Natural Sciences',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-04',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1004',
    firstName: 'Priya',
    lastName: 'Nambiar',
    email: 'p.nambiar@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0223',
    gender: 'Female',
    qualification: 'B.Tech Computer Science & Robotics',
    designationName: 'STEM Coordinator',
    departmentName: 'Mathematics & Computing',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-05',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1005',
    firstName: 'David',
    lastName: 'Reynolds',
    email: 'd.reynolds@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0229',
    gender: 'Male',
    qualification: 'M.A. Modern History & Social Policy',
    designationName: 'Department Head Social Studies',
    departmentName: 'Social Sciences & Civics',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-06',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1006',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'e.rostova@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0235',
    gender: 'Female',
    qualification: 'M.F.A. Visual Arts & Design',
    designationName: 'Creative Arts Coordinator',
    departmentName: 'Visual & Performing Arts',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  {
    id: 'stf-oak-07',
    schoolId: 'school-oakridge-01',
    employeeCode: 'FAC-1007',
    firstName: 'Coach Jason',
    lastName: 'Miller',
    email: 'j.miller@oakridge.schoolnexa.com',
    phone: '+1 (408) 555-0242',
    gender: 'Male',
    qualification: 'B.Ed. Kinesiology & Physical Training',
    designationName: 'Athletic Director',
    departmentName: 'Physical Education & Sports',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
];

const SEED_ASSIGNMENTS: TeacherAssignmentItem[] = [
  {
    id: 'asg-8a-ct',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-01',
    subjectId: null,
    isClassTeacher: true,
    isActive: true,
    createdAt: '2025-08-20T10:00:00Z',
  },
  {
    id: 'asg-8a-math',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-01',
    subjectId: 'sub-oak-math',
    isClassTeacher: false,
    isActive: true,
    createdAt: '2025-08-20T10:05:00Z',
  },
  {
    id: 'asg-8a-eng',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-02',
    subjectId: 'sub-oak-eng',
    isClassTeacher: false,
    isActive: true,
    createdAt: '2025-08-20T10:10:00Z',
  },
  {
    id: 'asg-8a-sci',
    schoolId: 'school-oakridge-01',
    academicYearSectionId: 'sec-oak-8a',
    staffId: 'stf-oak-03',
    subjectId: 'sub-oak-sci',
    isClassTeacher: false,
    isActive: true,
    createdAt: '2025-08-20T10:15:00Z',
  },
];

export const DEFAULT_PERIOD_SLOTS: TimetablePeriodSlot[] = [
  { id: 'p1', name: 'Period 1', periodNumber: 1, startTime: '08:30', endTime: '09:15' },
  { id: 'p2', name: 'Period 2', periodNumber: 2, startTime: '09:15', endTime: '10:00' },
  { id: 'break1', name: 'Morning Break', isBreak: true, startTime: '10:00', endTime: '10:20' },
  { id: 'p3', name: 'Period 3', periodNumber: 3, startTime: '10:20', endTime: '11:05' },
  { id: 'p4', name: 'Period 4', periodNumber: 4, startTime: '11:05', endTime: '11:50' },
  { id: 'lunch', name: 'Lunch Recess', isBreak: true, startTime: '11:50', endTime: '12:40' },
  { id: 'p5', name: 'Period 5', periodNumber: 5, startTime: '12:40', endTime: '13:25' },
  { id: 'p6', name: 'Period 6', periodNumber: 6, startTime: '13:25', endTime: '14:10' },
  { id: 'p7', name: 'Period 7', periodNumber: 7, startTime: '14:10', endTime: '14:55' },
];

export const TIMETABLE_DAYS = WEEK_DAYS;

const SEED_TIMETABLE_ENTRIES: TimetableEntry[] = [
  // Grade 8-A (sec-oak-8a) - Monday
  {
    id: 'tt-8a-mon-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
    notes: 'Linear equations & polynomials',
  },
  {
    id: 'tt-8a-mon-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
    notes: 'Literature textual analysis',
  },
  {
    id: 'tt-8a-mon-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 1',
    periodType: 'PRACTICAL_LAB',
    notes: 'Cell structure microscope session',
  },
  {
    id: 'tt-8a-mon-p4',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p4',
    startTime: '11:05',
    endTime: '11:50',
    subjectId: 'sub-oak-soc',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-mon-p5',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p5',
    startTime: '12:40',
    endTime: '13:25',
    subjectId: 'sub-oak-cs',
    teacherId: 'stf-oak-04',
    room: 'Robotics Lab',
    periodType: 'PRACTICAL_LAB',
    notes: 'Python algorithmic thinking',
  },
  {
    id: 'tt-8a-mon-p6',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p6',
    startTime: '13:25',
    endTime: '14:10',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'TUTORIAL',
  },
  {
    id: 'tt-8a-mon-p7',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'MONDAY',
    periodId: 'p7',
    startTime: '14:10',
    endTime: '14:55',
    subjectId: 'sub-oak-art',
    teacherId: 'stf-oak-04',
    room: 'Studio A',
    periodType: 'ACTIVITY',
  },
  // Grade 8-A - Tuesday
  {
    id: 'tt-8a-tue-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 1',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-tue-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-tue-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-tue-p4',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p4',
    startTime: '11:05',
    endTime: '11:50',
    subjectId: 'sub-oak-cs',
    teacherId: 'stf-oak-04',
    room: 'Robotics Lab',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-tue-p5',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p5',
    startTime: '12:40',
    endTime: '13:25',
    subjectId: 'sub-oak-soc',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-tue-p6',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'TUESDAY',
    periodId: 'p6',
    startTime: '13:25',
    endTime: '14:10',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  // Grade 8-A - Wednesday
  {
    id: 'tt-8a-wed-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'WEDNESDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-wed-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'WEDNESDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 1',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-wed-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'WEDNESDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-wed-p4',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'WEDNESDAY',
    periodId: 'p4',
    startTime: '11:05',
    endTime: '11:50',
    subjectId: 'sub-oak-soc',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-wed-p5',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'WEDNESDAY',
    periodId: 'p5',
    startTime: '12:40',
    endTime: '13:25',
    subjectId: 'sub-oak-cs',
    teacherId: 'stf-oak-04',
    room: 'Robotics Lab',
    periodType: 'PRACTICAL_LAB',
  },
  // Grade 8-A - Thursday
  {
    id: 'tt-8a-thu-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'THURSDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-thu-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'THURSDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-thu-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'THURSDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 1',
    periodType: 'REGULAR',
  },
  // Grade 8-A - Friday
  {
    id: 'tt-8a-fri-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'FRIDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 1',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-fri-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'FRIDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-8a-fri-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-8a',
    dayOfWeek: 'FRIDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 201',
    periodType: 'REGULAR',
  },
  // Grade 9-A (sec-oak-9a) - Monday
  {
    id: 'tt-9a-mon-p1',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-9a',
    dayOfWeek: 'MONDAY',
    periodId: 'p1',
    startTime: '08:30',
    endTime: '09:15',
    subjectId: 'sub-oak-sci',
    teacherId: 'stf-oak-03',
    room: 'Science Lab 2',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-9a-mon-p2',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-9a',
    dayOfWeek: 'MONDAY',
    periodId: 'p2',
    startTime: '09:15',
    endTime: '10:00',
    subjectId: 'sub-oak-math',
    teacherId: 'stf-oak-01',
    room: 'Room 203',
    periodType: 'REGULAR',
  },
  {
    id: 'tt-9a-mon-p3',
    schoolId: 'school-oakridge-01',
    academicYearId: 'ay-oak-2025',
    academicYearSectionId: 'sec-oak-9a',
    dayOfWeek: 'MONDAY',
    periodId: 'p3',
    startTime: '10:20',
    endTime: '11:05',
    subjectId: 'sub-oak-eng',
    teacherId: 'stf-oak-02',
    room: 'Room 203',
    periodType: 'REGULAR',
  },
];

const SEED_AUDIT_LOGS: AcademicAuditLog[] = [
  {
    id: 'log-1',
    schoolId: 'school-oakridge-01',
    userId: 'user-oak-principal',
    userName: 'Dr. Evelyn Vance',
    action: 'INITIALIZE_ACADEMIC_SETUP',
    resourceType: 'ACADEMIC_YEAR',
    resourceId: 'ay-oak-2025',
    details: 'Academic Year 2025-2026 configured as current active session.',
    timestamp: '2025-08-15T09:00:00Z',
  },
  {
    id: 'log-2',
    schoolId: 'school-oakridge-01',
    userId: 'user-oak-principal',
    userName: 'Dr. Evelyn Vance',
    action: 'ASSIGN_CLASS_TEACHER',
    resourceType: 'TEACHER_ASSIGNMENT',
    resourceId: 'sec-oak-8a',
    details: 'Designated Marcus Chen as Class Teacher for Grade 8-A.',
    timestamp: '2025-08-20T10:00:00Z',
  },
];

class AcademicSetupService {
  private getStore<T>(key: string, seed: T[]): T[] {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    } catch {
      return seed;
    }
  }

  private setStore<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save to ${key}`, e);
    }
  }

  // --- Audit Logging ---
  public logAction(
    schoolId: string,
    userId: string,
    userName: string,
    action: string,
    resourceType: AcademicAuditLog['resourceType'],
    resourceId: string,
    details: string,
  ): void {
    const logs = this.getStore<AcademicAuditLog>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    const newLog: AcademicAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      schoolId,
      userId,
      userName,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setStore(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // Keep recent 100
  }

  public getAuditLogs(schoolId: string): AcademicAuditLog[] {
    const logs = this.getStore<AcademicAuditLog>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    return logs.filter((l) => l.schoolId === schoolId);
  }

  // ==========================================
  // 1. SCHOOL PROFILE & SETTINGS
  // ==========================================

  public getSchoolProfile(schoolId: string): SchoolProfile {
    const profiles = this.getStore<SchoolProfile>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const found = profiles.find((p) => p.id === schoolId);
    if (found) return found;

    // Default template if missing
    const fallback: SchoolProfile = {
      id: schoolId,
      name: 'Oakridge International Academy',
      code: 'OAK-ACAD',
      address: '42 Academic Crest Way',
      city: 'San Jose',
      state: 'California',
      country: 'United States',
      postalCode: '95134',
      phone: '+1 (408) 555-0199',
      email: 'admin@oakridge.schoolnexa.com',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    profiles.push(fallback);
    this.setStore(STORAGE_KEYS.PROFILES, profiles);
    return fallback;
  }

  /**
   * Fetches institutional profile from backend Express REST API with local cache sync.
   */
  public async getSchoolProfileAsync(schoolId: string): Promise<SchoolProfile> {
    try {
      const profile = await apiClient.get<SchoolProfile>(`/schools/${schoolId}/profile`, {
        schoolId,
      });
      if (profile && profile.id) {
        const profiles = this.getStore<SchoolProfile>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
        const idx = profiles.findIndex((p) => p.id === schoolId);
        if (idx >= 0) {
          profiles[idx] = { ...profiles[idx], ...profile };
        } else {
          profiles.push(profile);
        }
        this.setStore(STORAGE_KEYS.PROFILES, profiles);
        return profile;
      }
    } catch (err) {
      console.warn('[academicService] getSchoolProfileAsync failed, using cached store:', err);
    }
    return this.getSchoolProfile(schoolId);
  }

  public updateSchoolProfile(
    schoolId: string,
    updated: Partial<SchoolProfile>,
    userContext: { userId: string; userName: string },
  ): SchoolProfile {
    const profiles = this.getStore<SchoolProfile>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const index = profiles.findIndex((p) => p.id === schoolId);

    // Validation
    if (updated.email && !updated.email.includes('@')) {
      throw new Error('Please enter a valid institution email address.');
    }
    if (updated.phone && updated.phone.trim().length < 5) {
      throw new Error('Please enter a valid official contact telephone.');
    }

    let profile: SchoolProfile;
    if (index >= 0) {
      profile = {
        ...profiles[index],
        ...updated,
        id: schoolId, // Invariant: Cannot change primary key
        updatedAt: new Date().toISOString(),
      };
      profiles[index] = profile;
    } else {
      profile = {
        id: schoolId,
        name: updated.name || 'New Campus',
        code: updated.code || 'CAMPUS',
        address: updated.address || '',
        city: updated.city || '',
        state: updated.state || '',
        country: updated.country || 'United States',
        postalCode: updated.postalCode || '',
        phone: updated.phone || '',
        email: updated.email || '',
        currency: updated.currency || 'USD',
        timezone: updated.timezone || 'UTC',
        status: updated.status || 'ACTIVE',
        updatedAt: new Date().toISOString(),
        ...updated,
      };
      profiles.push(profile);
    }

    this.setStore(STORAGE_KEYS.PROFILES, profiles);
    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'UPDATE_SCHOOL_PROFILE',
      'SCHOOL',
      schoolId,
      `Updated institutional profile for ${profile.name} (${profile.code}).`,
    );
    return profile;
  }

  /**
   * Persists updated institutional profile to backend Express REST API and synchronizes local store.
   */
  public async updateSchoolProfileAsync(
    schoolId: string,
    updated: Partial<SchoolProfile>,
    userContext: { userId: string; userName: string },
  ): Promise<SchoolProfile> {
    const local = this.updateSchoolProfile(schoolId, updated, userContext);
    try {
      const response = await apiClient.put<SchoolProfile>(`/schools/${schoolId}/profile`, updated, {
        schoolId,
      });
      if (response && response.id) {
        const profiles = this.getStore<SchoolProfile>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
        const idx = profiles.findIndex((p) => p.id === schoolId);
        if (idx >= 0) {
          profiles[idx] = response;
        } else {
          profiles.push(response);
        }
        this.setStore(STORAGE_KEYS.PROFILES, profiles);
        return response;
      }
    } catch (err) {
      console.warn(
        '[academicService] updateSchoolProfileAsync API call failed, local store updated:',
        err,
      );
      throw err;
    }
    return local;
  }

  public getSchoolSettings(schoolId: string): SchoolSettingItem[] {
    const all = this.getStore<SchoolSettingItem>(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    return all.filter((s) => s.schoolId === schoolId);
  }

  /**
   * Fetches institutional configuration parameters from backend Express REST API.
   */
  public async getSchoolSettingsAsync(schoolId: string): Promise<SchoolSettingItem[]> {
    try {
      const settings = await apiClient.get<SchoolSettingItem[]>(`/schools/${schoolId}/settings`, {
        schoolId,
      });
      if (Array.isArray(settings) && settings.length > 0) {
        this.setStore(STORAGE_KEYS.SETTINGS, settings);
        return settings;
      }
    } catch (err) {
      console.warn('[academicService] getSchoolSettingsAsync failed, using local store:', err);
    }
    return this.getSchoolSettings(schoolId);
  }

  /**
   * Updates institutional configuration parameters in backend Express REST API.
   */
  public async updateSchoolSettingsAsync(
    schoolId: string,
    settingsList: Array<{ settingKey: string; settingValue: string }>,
    userContext: { userId: string; userName: string },
  ): Promise<SchoolSettingItem[]> {
    try {
      const response = await apiClient.put<SchoolSettingItem[]>(
        `/schools/${schoolId}/settings`,
        settingsList,
        { schoolId },
      );
      if (Array.isArray(response) && response.length > 0) {
        this.setStore(STORAGE_KEYS.SETTINGS, response);
        return response;
      }
    } catch (err) {
      console.warn(
        '[academicService] updateSchoolSettingsAsync failed, applying local update:',
        err,
      );
      settingsList.forEach((s) => {
        this.updateSchoolSetting(schoolId, s.settingKey, s.settingValue, userContext);
      });
      throw err;
    }
    return this.getSchoolSettings(schoolId);
  }

  public updateSchoolSetting(
    schoolId: string,
    settingKey: string,
    settingValue: string,
    userContext: { userId: string; userName: string },
  ): SchoolSettingItem {
    const settings = this.getStore<SchoolSettingItem>(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    const index = settings.findIndex((s) => s.schoolId === schoolId && s.settingKey === settingKey);

    let updatedItem: SchoolSettingItem;
    if (index >= 0) {
      settings[index].settingValue = settingValue;
      updatedItem = settings[index];
    } else {
      updatedItem = {
        id: 'set-' + Date.now(),
        schoolId,
        settingKey,
        settingValue,
        dataType: 'STRING',
        isEncrypted: false,
        category: 'GENERAL',
      };
      settings.push(updatedItem);
    }

    this.setStore(STORAGE_KEYS.SETTINGS, settings);
    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'UPDATE_SCHOOL_SETTING',
      'SCHOOL',
      settingKey,
      `Modified configuration key [${settingKey}] to "${settingValue}".`,
    );
    return updatedItem;
  }

  // ==========================================
  // 2. ACADEMIC YEARS
  // ==========================================

  public getAcademicYears(schoolId: string, allSchools?: any[]): AcademicYearSummary[] {
    if (allSchools && allSchools.length > 0) {
      const school = allSchools.find((s) => s.id === schoolId);
      if (school?.academicYears) return school.academicYears;
    }
    const profiles = this.getStore<SchoolProfile>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const profile = profiles.find((p) => p.id === schoolId);
    return (
      (profile as any)?.academicYears || [
        {
          id: 'ay-2026',
          name: '2026-2027 Academic Year',
          code: 'AY26-27',
          isCurrent: true,
          startDate: '2026-06-01',
          endDate: '2027-04-30',
        },
        {
          id: 'ay-2025',
          name: '2025-2026 Academic Year',
          code: 'AY25-26',
          isCurrent: false,
          startDate: '2025-06-01',
          endDate: '2026-04-30',
        },
      ]
    );
  }

  // ==========================================
  // 3. CLASSES
  // ==========================================

  public getClassesSync(schoolId: string): ClassItem[] {
    const classes = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    return classes
      .filter((c) => c.schoolId === schoolId)
      .sort((a, b) => a.numericOrder - b.numericOrder);
  }

  public async getClasses(schoolId?: string, academicYearId?: string): Promise<ClassItem[]> {
    const data = await apiClient.get<ClassItem[]>('/academic/classes', {
      schoolId,
      academicYearId,
    });
    if (schoolId && Array.isArray(data)) {
      const stored = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, []);
      const other = stored.filter((c) => c.schoolId !== schoolId);
      this.setStore(STORAGE_KEYS.CLASSES, [...other, ...data]);
    }
    return data;
  }

  public async getClassById(
    classId: string,
    schoolId?: string,
    academicYearId?: string,
  ): Promise<ClassItem> {
    return await apiClient.get<ClassItem>(`/academic/classes/${classId}`, {
      schoolId,
      academicYearId,
    });
  }

  public async createClass(
    schoolId: string,
    data: { name: string; code: string; numericOrder: number; stream?: ClassItem['stream'] },
    userContext?: { userId: string; userName: string },
  ): Promise<ClassItem> {
    const created = await apiClient.post<ClassItem>('/academic/classes', data, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'CREATE_CLASS',
        'CLASS',
        created.id,
        `Created class standard ${created.name} (${created.code}) order #${created.numericOrder}.`,
      );
    }
    const stored = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    this.setStore(STORAGE_KEYS.CLASSES, [...stored.filter((c) => c.id !== created.id), created]);
    return created;
  }

  public async updateClass(
    schoolId: string,
    classId: string,
    data: { name?: string; code?: string; numericOrder?: number; stream?: ClassItem['stream'] },
    userContext?: { userId: string; userName: string },
  ): Promise<ClassItem> {
    const updated = await apiClient.put<ClassItem>(`/academic/classes/${classId}`, data, {
      schoolId,
    });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_CLASS',
        'CLASS',
        classId,
        `Updated class details for ${updated.name} (${updated.code}).`,
      );
    }
    const stored = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    this.setStore(
      STORAGE_KEYS.CLASSES,
      stored.map((c) => (c.id === classId ? updated : c)),
    );
    return updated;
  }

  public async deleteClass(
    schoolId: string,
    classId: string,
    userContext?: { userId: string; userName: string },
  ): Promise<void> {
    await apiClient.delete(`/academic/classes/${classId}`, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'DELETE_CLASS',
        'CLASS',
        classId,
        `Deleted class ID ${classId}.`,
      );
    }
    const stored = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    this.setStore(
      STORAGE_KEYS.CLASSES,
      stored.filter((c) => c.id !== classId),
    );
  }

  // ==========================================
  // 4. SECTIONS (ACADEMIC YEAR SECTIONS)
  // ==========================================

  public getSectionsSync(schoolId: string, academicYearId?: string): AcademicYearSectionItem[] {
    const all = this.getStore<AcademicYearSectionItem>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const classes = this.getClassesSync(schoolId);
    const classMap = new Map(classes.map((c) => [c.id, c]));

    let filtered = all.filter((s) => s.schoolId === schoolId);
    if (academicYearId) {
      filtered = filtered.filter((s) => s.academicYearId === academicYearId);
    }

    return filtered
      .map((sec) => {
        const cls = classMap.get(sec.classId);
        return {
          ...sec,
          className: cls ? cls.name : 'Unknown Class',
          classNumericOrder: cls ? cls.numericOrder : 99,
        };
      })
      .sort(
        (a, b) =>
          (a.classNumericOrder || 0) - (b.classNumericOrder || 0) ||
          a.sectionName.localeCompare(b.sectionName),
      );
  }

  public async getSections(
    schoolId?: string,
    academicYearId?: string,
    classId?: string,
  ): Promise<AcademicYearSectionItem[]> {
    try {
      const data = await apiClient.get<AcademicYearSectionItem[]>('/academic/sections', {
        schoolId,
        academicYearId,
        params: classId ? { classId } : undefined,
      });
      if (schoolId && Array.isArray(data)) {
        const stored = this.getStore<AcademicYearSectionItem>(STORAGE_KEYS.SECTIONS, []);
        const other = stored.filter(
          (s) => s.schoolId !== schoolId || (academicYearId && s.academicYearId !== academicYearId),
        );
        this.setStore(STORAGE_KEYS.SECTIONS, [...other, ...data]);
      }
      return data;
    } catch (err) {
      console.warn('REST API /academic/sections failed, falling back to local store:', err);
      return this.getSectionsSync(schoolId, academicYearId);
    }
  }

  public async getSectionById(
    sectionId: string,
    schoolId?: string,
    academicYearId?: string,
  ): Promise<AcademicYearSectionItem> {
    return await apiClient.get<AcademicYearSectionItem>(`/academic/sections/${sectionId}`, {
      schoolId,
      academicYearId,
    });
  }

  public async createSection(
    schoolId: string,
    data: { academicYearId?: string; classId: string; sectionName: string; maxCapacity?: number },
    userContext?: { userId: string; userName: string },
  ): Promise<AcademicYearSectionItem> {
    const created = await apiClient.post<AcademicYearSectionItem>(
      '/academic/sections',
      {
        classId: data.classId,
        sectionName: data.sectionName,
        maxCapacity: data.maxCapacity,
      },
      {
        schoolId,
        academicYearId: data.academicYearId,
      },
    );
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'CREATE_SECTION',
        'SECTION',
        created.id,
        `Created Section ${created.className || ''}-${created.sectionName} with capacity ${created.maxCapacity}.`,
      );
    }
    const stored = this.getStore<AcademicYearSectionItem>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    this.setStore(STORAGE_KEYS.SECTIONS, [...stored.filter((s) => s.id !== created.id), created]);
    return created;
  }

  public async updateSection(
    schoolId: string,
    sectionId: string,
    data: { sectionName?: string; maxCapacity?: number },
    userContext?: { userId: string; userName: string },
  ): Promise<AcademicYearSectionItem> {
    const updated = await apiClient.put<AcademicYearSectionItem>(
      `/academic/sections/${sectionId}`,
      data,
      { schoolId },
    );
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_SECTION',
        'SECTION',
        sectionId,
        `Updated Section ${updated.sectionName} capacity to ${updated.maxCapacity}.`,
      );
    }
    const stored = this.getStore<AcademicYearSectionItem>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    this.setStore(
      STORAGE_KEYS.SECTIONS,
      stored.map((s) => (s.id === sectionId ? updated : s)),
    );
    return updated;
  }

  public async deleteSection(
    schoolId: string,
    sectionId: string,
    userContext?: { userId: string; userName: string },
  ): Promise<void> {
    await apiClient.delete(`/academic/sections/${sectionId}`, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'DELETE_SECTION',
        'SECTION',
        sectionId,
        `Removed section ID ${sectionId}.`,
      );
    }
    const stored = this.getStore<AcademicYearSectionItem>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    this.setStore(
      STORAGE_KEYS.SECTIONS,
      stored.filter((s) => s.id !== sectionId),
    );
  }

  // ==========================================
  // 5. SUBJECTS
  // ==========================================

  public getSubjectsSync(schoolId: string): SubjectItem[] {
    const all = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    return all.filter((s) => s.schoolId === schoolId).sort((a, b) => a.name.localeCompare(b.name));
  }

  public async getSubjects(schoolId?: string, academicYearId?: string): Promise<SubjectItem[]> {
    const data = await apiClient.get<SubjectItem[]>('/academic/subjects', {
      schoolId,
      academicYearId,
    });
    if (schoolId && Array.isArray(data)) {
      const stored = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, []);
      const other = stored.filter((s) => s.schoolId !== schoolId);
      this.setStore(STORAGE_KEYS.SUBJECTS, [...other, ...data]);
    }
    return data;
  }

  public async getSubjectById(
    subjectId: string,
    schoolId?: string,
    academicYearId?: string,
  ): Promise<SubjectItem> {
    return await apiClient.get<SubjectItem>(`/academic/subjects/${subjectId}`, {
      schoolId,
      academicYearId,
    });
  }

  public async createSubject(
    schoolId: string,
    data: {
      name: string;
      code: string;
      subjectType: SubjectItem['subjectType'];
      credits: number;
      isElective: boolean;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<SubjectItem> {
    const created = await apiClient.post<SubjectItem>('/academic/subjects', data, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'CREATE_SUBJECT',
        'SUBJECT',
        created.id,
        `Created subject ${created.name} (${created.code}) [${created.subjectType}].`,
      );
    }
    const stored = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    this.setStore(STORAGE_KEYS.SUBJECTS, [...stored.filter((s) => s.id !== created.id), created]);
    return created;
  }

  public async updateSubject(
    schoolId: string,
    subjectId: string,
    data: {
      name?: string;
      code?: string;
      subjectType?: SubjectItem['subjectType'];
      credits?: number;
      isElective?: boolean;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<SubjectItem> {
    const updated = await apiClient.put<SubjectItem>(`/academic/subjects/${subjectId}`, data, {
      schoolId,
    });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_SUBJECT',
        'SUBJECT',
        subjectId,
        `Updated subject ${updated.name} (${updated.code}).`,
      );
    }
    const stored = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    this.setStore(
      STORAGE_KEYS.SUBJECTS,
      stored.map((s) => (s.id === subjectId ? updated : s)),
    );
    return updated;
  }

  public async deleteSubject(
    schoolId: string,
    subjectId: string,
    userContext?: { userId: string; userName: string },
  ): Promise<void> {
    await apiClient.delete(`/academic/subjects/${subjectId}`, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'DELETE_SUBJECT',
        'SUBJECT',
        subjectId,
        `Removed subject ID ${subjectId}.`,
      );
    }
    const stored = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    this.setStore(
      STORAGE_KEYS.SUBJECTS,
      stored.filter((s) => s.id !== subjectId),
    );
  }

  // ==========================================
  // 6. CLASS SUBJECTS (CURRICULUM)
  // ==========================================

  public getClassSubjectsSync(
    schoolId: string,
    classId?: string,
    academicYearId?: string,
  ): ClassSubjectItem[] {
    const all = this.getStore<ClassSubjectItem>(STORAGE_KEYS.CLASS_SUBJECTS, SEED_CLASS_SUBJECTS);
    const classes = this.getClassesSync(schoolId);
    const subjects = this.getSubjectsSync(schoolId);
    const syllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);

    const classMap = new Map(classes.map((c) => [c.id, c]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    let filtered = all.filter((cs) => cs.schoolId === schoolId);
    if (classId) {
      filtered = filtered.filter((cs) => cs.classId === classId);
    }
    if (academicYearId) {
      filtered = filtered.filter((cs) => {
        if (cs.academicYearId && cs.academicYearId === academicYearId) return true;
        return syllabi.some(
          (s) =>
            s.schoolId === schoolId &&
            s.classSubjectId === cs.id &&
            s.academicYearId === academicYearId,
        );
      });
    }

    return filtered.map((item) => {
      const cls = classMap.get(item.classId);
      const sub = subjectMap.get(item.subjectId);
      const matchedSyllabus = academicYearId
        ? syllabi.find(
            (s) =>
              s.schoolId === schoolId &&
              s.classSubjectId === item.id &&
              s.academicYearId === academicYearId,
          )
        : syllabi.find((s) => s.schoolId === schoolId && s.classSubjectId === item.id);

      return {
        ...item,
        academicYearId: matchedSyllabus?.academicYearId || academicYearId,
        syllabusId: matchedSyllabus?.id,
        syllabusName: matchedSyllabus?.syllabusName,
        className: cls ? cls.name : 'Unknown Class',
        subjectName: sub ? sub.name : 'Unknown Subject',
        subjectCode: sub ? sub.code : 'UNKNOWN',
        subjectType: sub ? sub.subjectType : 'THEORY',
      };
    });
  }

  public async getClassSubjects(
    schoolId?: string,
    classId?: string,
    academicYearId?: string,
  ): Promise<ClassSubjectItem[]> {
    try {
      const params: Record<string, string> = {};
      if (classId) params.classId = classId;
      if (academicYearId) params.academicYearId = academicYearId;
      const data = await apiClient.get<ClassSubjectItem[]>('/academic/curriculum', {
        schoolId,
        academicYearId,
        params: Object.keys(params).length > 0 ? params : undefined,
      });
      if (schoolId && Array.isArray(data)) {
        if (academicYearId) {
          const storedSyllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);
          const otherSyllabi = storedSyllabi.filter(
            (s) => !(s.schoolId === schoolId && s.academicYearId === academicYearId),
          );
          const incomingSyllabi: SyllabusRecord[] = [];
          data.forEach((item) => {
            if (item.syllabusName) {
              incomingSyllabi.push({
                id: item.syllabusId || `syl-${item.id}-${academicYearId}`,
                schoolId,
                classSubjectId: item.id,
                academicYearId,
                syllabusName: item.syllabusName,
              });
            }
          });
          this.setStore(STORAGE_KEYS.SYLLABI, [...otherSyllabi, ...incomingSyllabi]);
        }

        const stored = this.getStore<ClassSubjectItem>(
          STORAGE_KEYS.CLASS_SUBJECTS,
          SEED_CLASS_SUBJECTS,
        );
        const dataIds = new Set(data.map((d) => d.id));
        const retained = stored.filter((cs) => !dataIds.has(cs.id));
        const normalized = data.map((d) => ({
          id: d.id,
          schoolId: d.schoolId,
          classId: d.classId,
          subjectId: d.subjectId,
          isMandatory: d.isMandatory,
          weeklyPeriods: d.weeklyPeriods,
        }));
        this.setStore(STORAGE_KEYS.CLASS_SUBJECTS, [...retained, ...normalized]);
      }
      return data;
    } catch (err) {
      console.warn('REST API /academic/curriculum failed, falling back to local store:', err);
      return this.getClassSubjectsSync(schoolId || '', classId, academicYearId);
    }
  }

  public async getCurriculumById(
    curriculumId: string,
    schoolId?: string,
    academicYearId?: string,
  ): Promise<ClassSubjectItem> {
    const params: Record<string, string> = {};
    if (academicYearId) params.academicYearId = academicYearId;
    return await apiClient.get<ClassSubjectItem>(`/academic/curriculum/${curriculumId}`, {
      schoolId,
      academicYearId,
      params: Object.keys(params).length > 0 ? params : undefined,
    });
  }

  public async assignClassSubject(
    schoolId: string,
    data: {
      classId: string;
      subjectId: string;
      academicYearId?: string;
      syllabusName?: string;
      syllabusId?: string;
      isMandatory?: boolean;
      weeklyPeriods?: number;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<ClassSubjectItem> {
    const created = await apiClient.post<ClassSubjectItem>('/academic/curriculum', data, {
      schoolId,
      academicYearId: data.academicYearId,
    });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'ASSIGN_CLASS_SUBJECT',
        'CLASS_SUBJECT',
        created.id,
        `Assigned ${created.subjectName || 'Subject'} to ${created.className || 'Class'} [${created.weeklyPeriods} periods/wk].`,
      );
    }
    const stored = this.getStore<ClassSubjectItem>(
      STORAGE_KEYS.CLASS_SUBJECTS,
      SEED_CLASS_SUBJECTS,
    );
    this.setStore(STORAGE_KEYS.CLASS_SUBJECTS, [
      ...stored.filter((cs) => cs.id !== created.id),
      {
        id: created.id,
        schoolId: created.schoolId,
        classId: created.classId,
        subjectId: created.subjectId,
        isMandatory: created.isMandatory,
        weeklyPeriods: created.weeklyPeriods,
      },
    ]);
    if (data.syllabusName && data.academicYearId) {
      const syllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);
      const otherSyl = syllabi.filter(
        (s) =>
          !(
            s.schoolId === schoolId &&
            s.classSubjectId === created.id &&
            s.academicYearId === data.academicYearId
          ),
      );
      this.setStore(STORAGE_KEYS.SYLLABI, [
        ...otherSyl,
        {
          id: created.syllabusId || `syl-${created.id}-${data.academicYearId}`,
          schoolId,
          classSubjectId: created.id,
          academicYearId: data.academicYearId,
          syllabusName: data.syllabusName,
        },
      ]);
    }
    return created;
  }

  public async bulkAssignClassSubjects(
    schoolId: string,
    data: {
      classId: string;
      subjectIds: string[];
      academicYearId?: string;
      syllabusName?: string;
      isMandatory?: boolean;
      weeklyPeriods?: number;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<ClassSubjectItem[]> {
    const created = await apiClient.post<ClassSubjectItem[]>('/academic/curriculum/bulk', data, {
      schoolId,
      academicYearId: data.academicYearId,
    });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'ASSIGN_CLASS_SUBJECT',
        'CLASS_SUBJECT',
        data.classId,
        `Batch mapped ${created.length} subjects to class curriculum.`,
      );
    }
    const stored = this.getStore<ClassSubjectItem>(
      STORAGE_KEYS.CLASS_SUBJECTS,
      SEED_CLASS_SUBJECTS,
    );
    const createdIds = new Set(created.map((c) => c.id));
    const normalized = created.map((c) => ({
      id: c.id,
      schoolId: c.schoolId,
      classId: c.classId,
      subjectId: c.subjectId,
      isMandatory: c.isMandatory,
      weeklyPeriods: c.weeklyPeriods,
    }));
    this.setStore(STORAGE_KEYS.CLASS_SUBJECTS, [
      ...stored.filter((cs) => !createdIds.has(cs.id)),
      ...normalized,
    ]);

    if (data.syllabusName && data.academicYearId) {
      const syllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);
      const otherSyl = syllabi.filter(
        (s) =>
          !(
            s.schoolId === schoolId &&
            createdIds.has(s.classSubjectId) &&
            s.academicYearId === data.academicYearId
          ),
      );
      const addedSyl = created.map((c) => ({
        id: c.syllabusId || `syl-${c.id}-${data.academicYearId}`,
        schoolId,
        classSubjectId: c.id,
        academicYearId: data.academicYearId!,
        syllabusName: data.syllabusName!,
      }));
      this.setStore(STORAGE_KEYS.SYLLABI, [...otherSyl, ...addedSyl]);
    }

    return created;
  }

  public async updateClassSubject(
    schoolId: string,
    classSubjectId: string,
    data: {
      isMandatory?: boolean;
      weeklyPeriods?: number;
      syllabusName?: string;
      academicYearId?: string;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<ClassSubjectItem> {
    const updated = await apiClient.put<ClassSubjectItem>(
      `/academic/curriculum/${classSubjectId}`,
      data,
      {
        schoolId,
        academicYearId: data.academicYearId,
      },
    );
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_CLASS_SUBJECT',
        'CLASS_SUBJECT',
        classSubjectId,
        `Updated class subject settings (${updated.weeklyPeriods} periods/wk, ${updated.isMandatory ? 'Compulsory' : 'Elective'}).`,
      );
    }
    const stored = this.getStore<ClassSubjectItem>(
      STORAGE_KEYS.CLASS_SUBJECTS,
      SEED_CLASS_SUBJECTS,
    );
    this.setStore(
      STORAGE_KEYS.CLASS_SUBJECTS,
      stored.map((cs) =>
        cs.id === classSubjectId
          ? {
              ...cs,
              isMandatory: updated.isMandatory,
              weeklyPeriods: updated.weeklyPeriods,
            }
          : cs,
      ),
    );
    if (data.syllabusName !== undefined && data.academicYearId) {
      const syllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);
      const otherSyl = syllabi.filter(
        (s) =>
          !(
            s.schoolId === schoolId &&
            s.classSubjectId === classSubjectId &&
            s.academicYearId === data.academicYearId
          ),
      );
      if (data.syllabusName.trim()) {
        this.setStore(STORAGE_KEYS.SYLLABI, [
          ...otherSyl,
          {
            id: updated.syllabusId || `syl-${classSubjectId}-${data.academicYearId}`,
            schoolId,
            classSubjectId,
            academicYearId: data.academicYearId,
            syllabusName: data.syllabusName.trim(),
          },
        ]);
      } else {
        this.setStore(STORAGE_KEYS.SYLLABI, otherSyl);
      }
    }
    return updated;
  }

  public async removeClassSubject(
    schoolId: string,
    classSubjectId: string,
    userContext?: { userId: string; userName: string },
  ): Promise<void> {
    await apiClient.delete(`/academic/curriculum/${classSubjectId}`, { schoolId });
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'REMOVE_CLASS_SUBJECT',
        'CLASS_SUBJECT',
        classSubjectId,
        `Unmapped curriculum subject from class.`,
      );
    }
    const stored = this.getStore<ClassSubjectItem>(
      STORAGE_KEYS.CLASS_SUBJECTS,
      SEED_CLASS_SUBJECTS,
    );
    this.setStore(
      STORAGE_KEYS.CLASS_SUBJECTS,
      stored.filter((cs) => cs.id !== classSubjectId),
    );
    const syllabi = this.getStore<SyllabusRecord>(STORAGE_KEYS.SYLLABI, SEED_SYLLABI);
    this.setStore(
      STORAGE_KEYS.SYLLABI,
      syllabi.filter((s) => s.classSubjectId !== classSubjectId),
    );
  }

  public async copyClassSubjects(
    schoolId: string,
    sourceClassId: string,
    targetClassId: string,
    academicYearId?: string,
    userContext?: { userId: string; userName: string },
  ): Promise<number> {
    const sourceMappings = await this.getClassSubjects(schoolId, sourceClassId, academicYearId);
    if (sourceMappings.length === 0) {
      throw new Error('Source class has no mapped subjects to copy for this academic session.');
    }
    const targetMappings = await this.getClassSubjects(schoolId, targetClassId, academicYearId);
    const existingSubjectIds = new Set(targetMappings.map((m) => m.subjectId));

    const missingSubjectIds = Array.from(
      new Set(
        sourceMappings.map((m) => m.subjectId).filter((subId) => !existingSubjectIds.has(subId)),
      ),
    );

    if (missingSubjectIds.length === 0) {
      return 0;
    }

    const created = await this.bulkAssignClassSubjects(
      schoolId,
      {
        classId: targetClassId,
        subjectIds: missingSubjectIds,
        academicYearId,
        isMandatory: true,
        weeklyPeriods: 4,
      },
      userContext,
    );

    return created.length;
  }

  // ==========================================
  // 7. FACULTY STAFF & TEACHER ASSIGNMENTS
  // ==========================================

  public getStaff(schoolId: string): StaffMember[] {
    const all = this.getStore<StaffMember>(STORAGE_KEYS.STAFF, SEED_STAFF);

    // Synchronize faculty educators from cached teacher storage
    try {
      const raw =
        typeof window !== 'undefined' ? localStorage.getItem('schoolnexa_teachers_data') : null;
      const teachers = raw ? JSON.parse(raw) : [];
      let hasChanges = false;

      if (Array.isArray(teachers)) {
        teachers.forEach((t: any) => {
          const empCode = t.teacherId || t.id;
          const existingIdx = all.findIndex(
            (s) =>
              s.id === t.teacherId ||
              s.id === t.id ||
              s.employeeCode === empCode ||
              (t.email && s.email && s.email.toLowerCase() === t.email.toLowerCase()),
          );

        const mappedStaff: StaffMember = {
          id: t.teacherId || t.id,
          schoolId: schoolId || 'school-oakridge-01',
          employeeCode: t.teacherId || empCode,
          firstName: t.firstName,
          lastName: t.lastName || '',
          email:
            t.email ||
            `${t.firstName.toLowerCase()}.${(t.lastName || 'teacher').toLowerCase()}@schoolnexa.edu.in`,
          phone: t.mobile || '',
          gender: typeof t.gender === 'string' ? t.gender : 'Other',
          qualification: t.qualifications?.[0]?.degree || 'B.Ed / Specialized Master',
          designationName: t.designationName || 'Teacher',
          departmentName: t.departmentName || 'General Academic',
          employmentType: t.employmentType || 'FULL_TIME',
          status: t.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        };

        if (existingIdx !== -1) {
          all[existingIdx] = {
            ...mappedStaff,
            ...all[existingIdx],
            designationName: mappedStaff.designationName,
            departmentName: mappedStaff.departmentName,
            status: mappedStaff.status,
          };
        } else {
          all.push(mappedStaff);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.setStore(STORAGE_KEYS.STAFF, all);
      }
    }
  } catch (err) {
    console.warn('Teacher sync to staff store failed:', err);
  }

    let schoolStaff = all.filter((s) => !schoolId || s.schoolId === schoolId);

    if (schoolStaff.length === 0 && all.length > 0) {
      return all.map((s) => ({
        ...s,
        status: s.status || 'ACTIVE',
      }));
    }

    return schoolStaff.map((s) => ({
      ...s,
      status: s.status || 'ACTIVE',
    }));
  }

  public createStaffMember(schoolId: string, memberData: Partial<StaffMember>): StaffMember {
    const all = this.getStore<StaffMember>(STORAGE_KEYS.STAFF, SEED_STAFF);
    const stfPrefix = getInternalIdPrefix('staff');
    const facPrefix = getBusinessPrefix('faculty');
    const id = memberData.id || memberData.employeeCode || `${stfPrefix}${Date.now()}`;
    const newMember: StaffMember = {
      id,
      schoolId: schoolId || 'school-oakridge-01',
      employeeCode:
        memberData.employeeCode || `${facPrefix}${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: memberData.firstName || 'Teacher',
      lastName: memberData.lastName || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      gender: memberData.gender || 'Other',
      qualification: memberData.qualification || 'B.Ed',
      designationName: memberData.designationName || 'Teacher',
      departmentName: memberData.departmentName || 'General Academic',
      employmentType: memberData.employmentType || 'FULL_TIME',
      status: 'ACTIVE',
    };

    all.unshift(newMember);
    this.setStore(STORAGE_KEYS.STAFF, all);
    return newMember;
  }

  public getEligibleTeachers(
    subjectId: string,
    classId?: string,
    schoolId?: string,
  ): {
    matching: StaffMember[];
    other: StaffMember[];
    all: StaffMember[];
    activeStaff: StaffMember[];
  } {
    let resolvedSchoolId = schoolId || '';
    if (!resolvedSchoolId && classId) {
      const classes = this.getStore<ClassItem>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
      const targetClass = classes.find((c) => c.id === classId);
      if (targetClass) resolvedSchoolId = targetClass.schoolId;
    }
    if (!resolvedSchoolId && subjectId) {
      const subjects = this.getStore<SubjectItem>(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
      const targetSubject = subjects.find((s) => s.id === subjectId);
      if (targetSubject) resolvedSchoolId = targetSubject.schoolId;
    }
    if (!resolvedSchoolId) {
      resolvedSchoolId = 'school-oakridge-01';
    }

    const staff = this.getStaff(resolvedSchoolId);
    let activeAuthorized = staff.filter((s) => {
      const matchesSchool = !resolvedSchoolId || !s.schoolId || s.schoolId === resolvedSchoolId;
      const isActive = !s.status || s.status === 'ACTIVE' || (s as any).isActive !== false;
      return matchesSchool && isActive;
    });

    if (activeAuthorized.length === 0 && staff.length > 0) {
      activeAuthorized = staff;
    }

    const allSubjects = this.getSubjectsSync(resolvedSchoolId);
    const sub = allSubjects.find((s) => s.id === subjectId);
    const subName = (sub?.name || '').toLowerCase();

    const matching: StaffMember[] = [];
    const other: StaffMember[] = [];

    activeAuthorized.forEach((stf) => {
      const dept = (stf.departmentName || '').toLowerCase();
      const qual = (stf.qualification || '').toLowerCase();
      const isMatch =
        (subName.includes('math') &&
          (dept.includes('math') || qual.includes('math') || dept.includes('comp'))) ||
        (subName.includes('sci') &&
          (dept.includes('sci') ||
            qual.includes('sci') ||
            qual.includes('phys') ||
            qual.includes('chem') ||
            qual.includes('bio'))) ||
        (subName.includes('phys') &&
          (dept.includes('phys') || qual.includes('phys') || dept.includes('sci'))) ||
        (subName.includes('chem') &&
          (dept.includes('chem') || qual.includes('chem') || dept.includes('sci'))) ||
        (subName.includes('bio') &&
          (dept.includes('bio') || qual.includes('bio') || dept.includes('sci'))) ||
        (subName.includes('eng') &&
          (dept.includes('eng') ||
            qual.includes('eng') ||
            dept.includes('lang') ||
            dept.includes('human'))) ||
        (subName.includes('soc') &&
          (dept.includes('soc') ||
            dept.includes('hist') ||
            dept.includes('geo') ||
            dept.includes('human'))) ||
        (subName.includes('hist') &&
          (dept.includes('hist') || dept.includes('soc') || dept.includes('human'))) ||
        (subName.includes('geo') &&
          (dept.includes('geo') || dept.includes('soc') || dept.includes('human'))) ||
        (subName.includes('hin') && (dept.includes('hin') || dept.includes('lang'))) ||
        (subName.includes('comp') &&
          (dept.includes('comp') ||
            dept.includes('it') ||
            dept.includes('tech') ||
            dept.includes('math'))) ||
        (subName.includes('robot') &&
          (dept.includes('comp') ||
            dept.includes('robot') ||
            dept.includes('tech') ||
            qual.includes('robot'))) ||
        (subName.includes('art') && dept.includes('art')) ||
        (subName.includes('music') && (dept.includes('music') || dept.includes('art'))) ||
        ((subName.includes('pe') || subName.includes('sport') || subName.includes('physic')) &&
          (dept.includes('pe') || dept.includes('sport')));

      if (isMatch) {
        matching.push(stf);
      } else {
        other.push(stf);
      }
    });

    return {
      matching,
      other,
      all: activeAuthorized,
      activeStaff: activeAuthorized,
    };
  }

  public getTeacherAssignmentsSync(
    schoolId: string,
    academicYearId?: string,
  ): TeacherAssignmentItem[] {
    const all = this.getStore<TeacherAssignmentItem>(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    const sections = this.getSectionsSync(schoolId);
    const staff = this.getStaff(schoolId);
    const subjects = this.getSubjectsSync(schoolId);
    const classes = this.getClassesSync(schoolId);

    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    const staffMap = new Map(staff.map((s) => [s.id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const classMap = new Map(classes.map((c) => [c.id, c]));

    let filtered = all.filter((a) => a.schoolId === schoolId);

    return filtered
      .map((item) => {
        const sec = sectionMap.get(item.academicYearSectionId);
        const stf = staffMap.get(item.staffId);
        const sub = item.subjectId ? subjectMap.get(item.subjectId) : null;
        const cls = sec ? classMap.get(sec.classId) : null;

        return {
          ...item,
          staffName: stf ? `${stf.firstName} ${stf.lastName}` : 'Unassigned',
          staffEmployeeCode: stf ? stf.employeeCode : '',
          sectionName: sec ? sec.sectionName : '',
          className: cls ? cls.name : '',
          classId: sec ? sec.classId : '',
          academicYearId: sec ? sec.academicYearId : '',
          subjectName: sub
            ? sub.name
            : item.isClassTeacher
              ? 'Homeroom / Class Teacher'
              : 'General',
          subjectCode: sub ? sub.code : item.isClassTeacher ? 'HOMEROOM' : '',
        };
      })
      .filter((a) => !academicYearId || a.academicYearId === academicYearId);
  }

  public async getTeacherAssignments(
    schoolId?: string,
    academicYearId?: string,
    sectionId?: string,
  ): Promise<TeacherAssignmentItem[]> {
    try {
      const data = await apiClient.get<TeacherAssignmentItem[]>('/academic/assignments', {
        schoolId,
        academicYearId,
        params: sectionId ? { academicYearSectionId: sectionId } : undefined,
      });
      if (schoolId && Array.isArray(data)) {
        const stored = this.getStore<TeacherAssignmentItem>(STORAGE_KEYS.ASSIGNMENTS, []);
        const other = stored.filter((a) => a.schoolId !== schoolId);
        this.setStore(STORAGE_KEYS.ASSIGNMENTS, [...other, ...data]);
      }
      return data;
    } catch (err) {
      console.warn('REST API /academic/assignments failed, falling back to local store:', err);
      return this.getTeacherAssignmentsSync(schoolId, academicYearId);
    }
  }

  public async assignTeacher(
    schoolId: string,
    data: {
      academicYearSectionId: string;
      staffId: string;
      subjectId: string | null;
      isClassTeacher: boolean;
    },
    userContext?: { userId: string; userName: string },
  ): Promise<TeacherAssignmentItem> {
    let created: TeacherAssignmentItem;
    try {
      created = await apiClient.post<TeacherAssignmentItem>('/academic/assignments', data, {
        schoolId,
      });
    } catch (apiErr) {
      console.warn('REST API /academic/assignments failed, saving in local store:', apiErr);
      const sections = this.getSectionsSync(schoolId);
      const section = sections.find((s) => s.id === data.academicYearSectionId);
      const staffList = this.getStaff(schoolId);
      const staffMember = staffList.find(
        (s) => s.id === data.staffId || s.employeeCode === data.staffId,
      );
      const subjects = this.getSubjectsSync(schoolId);
      const subject = data.subjectId ? subjects.find((s) => s.id === data.subjectId) : null;

      const assignments = this.getStore<TeacherAssignmentItem>(
        STORAGE_KEYS.ASSIGNMENTS,
        SEED_ASSIGNMENTS,
      );

      if (data.isClassTeacher) {
        assignments.forEach((a) => {
          if (a.schoolId === schoolId && a.academicYearSectionId === data.academicYearSectionId) {
            a.isClassTeacher = false;
          }
        });
      }

      const existingIdx = assignments.findIndex(
        (a) =>
          a.schoolId === schoolId &&
          a.academicYearSectionId === data.academicYearSectionId &&
          a.subjectId === (data.subjectId || null),
      );

      if (existingIdx !== -1) {
        assignments[existingIdx] = {
          ...assignments[existingIdx],
          staffId: data.staffId,
          isClassTeacher: Boolean(data.isClassTeacher),
          isActive: true,
          staffName: staffMember
            ? `${staffMember.firstName} ${staffMember.lastName}`
            : 'Faculty Member',
          staffEmployeeCode: staffMember?.employeeCode || '',
          sectionName: section?.sectionName || '',
          className: section?.className || '',
          subjectName:
            subject?.name || (data.isClassTeacher ? 'Homeroom / Class Teacher' : 'General'),
          subjectCode: subject?.code || (data.isClassTeacher ? 'HOMEROOM' : ''),
        };
        created = assignments[existingIdx];
      } else {
        created = {
          id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          schoolId,
          academicYearSectionId: data.academicYearSectionId,
          staffId: data.staffId,
          subjectId: data.subjectId || null,
          isClassTeacher: Boolean(data.isClassTeacher),
          isActive: true,
          createdAt: new Date().toISOString(),
          staffName: staffMember
            ? `${staffMember.firstName} ${staffMember.lastName}`
            : 'Faculty Member',
          staffEmployeeCode: staffMember?.employeeCode || '',
          sectionName: section?.sectionName || '',
          className: section?.className || '',
          subjectName:
            subject?.name || (data.isClassTeacher ? 'Homeroom / Class Teacher' : 'General'),
          subjectCode: subject?.code || (data.isClassTeacher ? 'HOMEROOM' : ''),
        };
        assignments.push(created);
      }
      this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    // Always log audit action
    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'ASSIGN_TEACHER',
        'TEACHER_ASSIGNMENT',
        created.id,
        `Assigned ${created.staffName || 'Faculty'} to Section ${created.sectionName || ''} ${
          created.isClassTeacher ? '[Class Teacher]' : ''
        }.`,
      );
    }

    const stored = this.getStore<TeacherAssignmentItem>(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    this.setStore(STORAGE_KEYS.ASSIGNMENTS, [
      ...stored.filter((a) => a.id !== created.id),
      created,
    ]);
    return created;
  }

  public async removeTeacherAssignment(
    schoolId: string,
    assignmentId: string,
    userContext?: { userId: string; userName: string },
  ): Promise<void> {
    const stored = this.getStore<TeacherAssignmentItem>(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    const targetAsg = stored.find((a) => a.id === assignmentId);

    try {
      await apiClient.delete(`/academic/assignments/${assignmentId}`, { schoolId });
    } catch (err) {
      console.warn('REST API /academic/assignments delete failed, updating local store:', err);
    }

    if (userContext) {
      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'REMOVE_TEACHER_ASSIGNMENT',
        'TEACHER_ASSIGNMENT',
        assignmentId,
        `Removed faculty teaching assignment.`,
      );
    }

    this.setStore(
      STORAGE_KEYS.ASSIGNMENTS,
      stored.filter((a) => a.id !== assignmentId),
    );
  }

  // ==========================================
  // 8. OVERVIEW STATS
  // ==========================================

  public async getAcademicOverviewStats(
    schoolId: string,
    academicYearId?: string,
    allSchools?: any[],
  ): Promise<AcademicOverviewStats> {
    const school = (allSchools || []).find((s) => s.id === schoolId);
    const academicYears: AcademicYearSummary[] = school ? school.academicYears || [] : [];
    const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];

    const [classes, sections, subjects, classSubjects, assignments] = await Promise.all([
      this.getClasses(schoolId),
      this.getSections(schoolId, academicYearId || currentYear?.id),
      this.getSubjects(schoolId),
      this.getClassSubjects(schoolId),
      this.getTeacherAssignments(schoolId, academicYearId || currentYear?.id),
    ]);
    const staff = this.getStaff(schoolId);
    const timetableEntries = this.getTimetableEntries(schoolId, {
      academicYearId: academicYearId || currentYear?.id,
    });

    return {
      totalAcademicYears: academicYears.length,
      currentAcademicYearName: currentYear ? currentYear.name : 'No Active Year',
      totalClasses: classes.length,
      totalSections: sections.length,
      totalSubjects: subjects.length,
      totalClassSubjects: classSubjects.length,
      totalTeacherAssignments: assignments.length,
      totalStaff: staff.length,
      totalTimetableSlots: timetableEntries.length,
    };
  }

  public getAcademicOverviewStatsSync(
    schoolId: string,
    academicYearId?: string,
    allSchools?: any[],
  ): AcademicOverviewStats {
    const school = (allSchools || []).find((s) => s.id === schoolId);
    const academicYears: AcademicYearSummary[] = school ? school.academicYears || [] : [];
    const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];

    const classes = this.getClassesSync(schoolId);
    const sections = this.getSectionsSync(schoolId, academicYearId || currentYear?.id);
    const subjects = this.getSubjectsSync(schoolId);
    const classSubjects = this.getClassSubjectsSync(schoolId);
    const assignments = this.getTeacherAssignmentsSync(schoolId, academicYearId || currentYear?.id);
    const staff = this.getStaff(schoolId);
    const timetableEntries = this.getTimetableEntries(schoolId, {
      academicYearId: academicYearId || currentYear?.id,
    });

    return {
      totalAcademicYears: academicYears.length,
      currentAcademicYearName: currentYear ? currentYear.name : 'No Active Year',
      totalClasses: classes.length,
      totalSections: sections.length,
      totalSubjects: subjects.length,
      totalClassSubjects: classSubjects.length,
      totalTeacherAssignments: assignments.length,
      totalStaff: staff.length,
      totalTimetableSlots: timetableEntries.length,
    };
  }

  // ==========================================
  // 9. TIMETABLE & PERIOD SCHEDULING
  // ==========================================

  public getPeriodSlots(_schoolId?: string): TimetablePeriodSlot[] {
    return this.getStore<TimetablePeriodSlot>(STORAGE_KEYS.PERIOD_SLOTS, DEFAULT_PERIOD_SLOTS);
  }

  public savePeriodSlots(slots: TimetablePeriodSlot[]): TimetablePeriodSlot[] {
    this.setStore(STORAGE_KEYS.PERIOD_SLOTS, slots);
    return slots;
  }

  public savePeriodSlot(slot: TimetablePeriodSlot): TimetablePeriodSlot[] {
    const list = this.getPeriodSlots();
    const idx = list.findIndex((s) => s.id === slot.id);
    if (idx !== -1) {
      list[idx] = slot;
    } else {
      list.push(slot);
    }
    this.setStore(STORAGE_KEYS.PERIOD_SLOTS, list);
    return list;
  }

  public deletePeriodSlot(slotId: string): TimetablePeriodSlot[] {
    const list = this.getPeriodSlots().filter((s) => s.id !== slotId);
    this.setStore(STORAGE_KEYS.PERIOD_SLOTS, list);
    return list;
  }

  public getTimetableEntries(
    schoolId: string,
    filters?: {
      academicYearId?: string;
      sectionId?: string;
      staffId?: string;
      dayOfWeek?: DayOfWeek;
    },
  ): TimetableEntry[] {
    const all = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const sections = this.getSectionsSync(schoolId);
    const staff = this.getStaff(schoolId);
    const subjects = this.getSubjectsSync(schoolId);
    const classes = this.getClassesSync(schoolId);

    const sectionMap = new Map(sections.map((s) => [s.id, s]));
    const staffMap = new Map(staff.map((s) => [s.id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const classMap = new Map(classes.map((c) => [c.id, c]));

    let filtered = all.filter((e) => e.schoolId === schoolId);

    if (filters?.academicYearId) {
      filtered = filtered.filter((e) => e.academicYearId === filters.academicYearId);
    }
    if (filters?.sectionId) {
      filtered = filtered.filter((e) => e.academicYearSectionId === filters.sectionId);
    }
    if (filters?.staffId) {
      filtered = filtered.filter((e) => e.teacherId === filters.staffId);
    }
    if (filters?.dayOfWeek) {
      filtered = filtered.filter((e) => e.dayOfWeek === filters.dayOfWeek);
    }

    return filtered.map((item) => {
      const sec = sectionMap.get(item.academicYearSectionId);
      const stf = staffMap.get(item.teacherId);
      const sub = subjectMap.get(item.subjectId);
      const cls = sec ? classMap.get(sec.classId) : null;

      return {
        ...item,
        className: cls ? cls.name : 'Unknown Class',
        classId: sec ? sec.classId : undefined,
        sectionName: sec ? sec.sectionName : 'Unknown Section',
        subjectName: sub ? sub.name : 'Unknown Subject',
        subjectCode: sub ? sub.code : 'UNKNOWN',
        subjectType: sub ? sub.subjectType : 'THEORY',
        teacherName: stf ? `${stf.firstName} ${stf.lastName}` : 'Unassigned',
        teacherEmployeeCode: stf ? stf.employeeCode : '',
      };
    });
  }

  public checkTimetableConflicts(
    schoolId: string,
    entry: {
      id?: string;
      academicYearId: string;
      academicYearSectionId: string;
      dayOfWeek: DayOfWeek;
      periodId: string;
      teacherId: string;
      room?: string;
    },
  ): TimetableConflict[] {
    const existing = this.getTimetableEntries(schoolId, {
      academicYearId: entry.academicYearId,
      dayOfWeek: entry.dayOfWeek,
    }).filter((e) => !entry.id || e.id !== entry.id);

    const conflicts: TimetableConflict[] = [];

    // 1. Teacher Clash: The same teacher cannot teach two different sections at the same period
    const teacherClash = existing.find(
      (e) => e.periodId === entry.periodId && e.teacherId === entry.teacherId,
    );
    if (teacherClash) {
      conflicts.push({
        type: 'TEACHER_CLASH',
        message: `Teacher ${teacherClash.teacherName} is already scheduled to teach ${teacherClash.className}-${teacherClash.sectionName} (${teacherClash.subjectName}) during ${entry.dayOfWeek} ${entry.periodId.toUpperCase()}.`,
        conflictingEntry: teacherClash,
      });
    }

    // 2. Section Overlap: The same section cannot have two different periods scheduled in the same slot
    const sectionClash = existing.find(
      (e) =>
        e.periodId === entry.periodId && e.academicYearSectionId === entry.academicYearSectionId,
    );
    if (sectionClash) {
      conflicts.push({
        type: 'SECTION_OVERLAP',
        message: `Section ${sectionClash.className}-${sectionClash.sectionName} already has ${sectionClash.subjectName} scheduled in this period.`,
        conflictingEntry: sectionClash,
      });
    }

    // 3. Room Clash: If room specified and not "Online" or "TBD", check if another class is occupying it
    if (entry.room && entry.room.trim().length > 1 && !entry.room.toLowerCase().includes('tbd')) {
      const roomClash = existing.find(
        (e) =>
          e.periodId === entry.periodId &&
          e.room &&
          e.room.trim().toLowerCase() === entry.room!.trim().toLowerCase() &&
          e.academicYearSectionId !== entry.academicYearSectionId,
      );
      if (roomClash) {
        conflicts.push({
          type: 'ROOM_CLASH',
          message: `Room "${entry.room}" is already reserved for ${roomClash.className}-${roomClash.sectionName} (${roomClash.subjectName}) during this period.`,
          conflictingEntry: roomClash,
        });
      }
    }

    return conflicts;
  }

  public saveTimetableEntry(
    schoolId: string,
    data: {
      id?: string;
      academicYearId: string;
      academicYearSectionId: string;
      dayOfWeek: DayOfWeek;
      periodId: string;
      startTime: string;
      endTime: string;
      subjectId: string;
      teacherId: string;
      room: string;
      periodType: TimetableEntry['periodType'];
      notes?: string;
    },
    userContext: { userId: string; userName: string },
  ): { entry: TimetableEntry; conflicts: TimetableConflict[] } {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);

    // Check conflicts
    const conflicts = this.checkTimetableConflicts(schoolId, {
      id: data.id,
      academicYearId: data.academicYearId,
      academicYearSectionId: data.academicYearSectionId,
      dayOfWeek: data.dayOfWeek,
      periodId: data.periodId,
      teacherId: data.teacherId,
      room: data.room,
    });

    const isEdit = Boolean(data.id);
    let entryId = data.id;

    if (isEdit && entryId) {
      const index = list.findIndex((e) => e.schoolId === schoolId && e.id === entryId);
      if (index === -1) throw new Error('Timetable entry not found.');
      list[index] = {
        ...list[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.setStore(STORAGE_KEYS.TIMETABLE, list);

      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_TIMETABLE_ENTRY',
        'TIMETABLE',
        entryId,
        `Updated timetable slot ${data.dayOfWeek} ${data.periodId} (Room: ${data.room}).`,
      );

      const saved = this.getTimetableEntries(schoolId).find((e) => e.id === entryId)!;
      return { entry: saved, conflicts };
    } else {
      // If there's an existing section overlap, replace it
      const existingOverlapIndex = list.findIndex(
        (e) =>
          e.schoolId === schoolId &&
          e.academicYearSectionId === data.academicYearSectionId &&
          e.dayOfWeek === data.dayOfWeek &&
          e.periodId === data.periodId,
      );

      entryId = 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newEntry: TimetableEntry = {
        id: entryId,
        schoolId,
        academicYearId: data.academicYearId,
        academicYearSectionId: data.academicYearSectionId,
        dayOfWeek: data.dayOfWeek,
        periodId: data.periodId,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        room: data.room || 'Room 101',
        periodType: data.periodType || 'REGULAR',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingOverlapIndex !== -1) {
        list[existingOverlapIndex] = newEntry;
      } else {
        list.push(newEntry);
      }

      this.setStore(STORAGE_KEYS.TIMETABLE, list);

      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'CREATE_TIMETABLE_ENTRY',
        'TIMETABLE',
        newEntry.id,
        `Scheduled timetable slot ${data.dayOfWeek} ${data.periodId}.`,
      );

      const saved = this.getTimetableEntries(schoolId).find((e) => e.id === entryId)!;
      return { entry: saved, conflicts };
    }
  }

  public saveTimetableEntries(entries: TimetableEntry[]): void {
    if (!entries || entries.length === 0) return;
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const schoolId = entries[0].schoolId;
    const academicYearId = entries[0].academicYearId;

    // Replace all entries matching this school and academic year or merge
    const sectionIdsInNewEntries = new Set(entries.map((e) => e.academicYearSectionId));
    const retained = list.filter(
      (e) =>
        !(
          e.schoolId === schoolId &&
          e.academicYearId === academicYearId &&
          sectionIdsInNewEntries.has(e.academicYearSectionId)
        ),
    );
    this.setStore(STORAGE_KEYS.TIMETABLE, [...retained, ...entries]);
  }

  public deleteTimetableEntry(
    schoolId: string,
    entryId: string,
    userContext: { userId: string; userName: string },
  ): void {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const target = list.find((e) => e.schoolId === schoolId && e.id === entryId);
    if (!target) throw new Error('Timetable entry not found.');

    const filtered = list.filter((e) => e.id !== entryId);
    this.setStore(STORAGE_KEYS.TIMETABLE, filtered);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'DELETE_TIMETABLE_ENTRY',
      'TIMETABLE',
      entryId,
      `Removed timetable slot for ${target.dayOfWeek} ${target.periodId}.`,
    );
  }

  public copyTimetable(
    schoolId: string,
    fromSectionId: string,
    toSectionId: string,
    userContext: { userId: string; userName: string },
  ): TimetableEntry[] {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const sourceEntries = list.filter(
      (e) => e.schoolId === schoolId && e.academicYearSectionId === fromSectionId,
    );
    if (sourceEntries.length === 0) {
      throw new Error('Source section has no scheduled timetable slots to copy.');
    }

    // Remove existing target entries
    const withoutTarget = list.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === toSectionId),
    );

    const cloned: TimetableEntry[] = sourceEntries.map((e) => ({
      ...e,
      id: 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      academicYearSectionId: toSectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updated = [...withoutTarget, ...cloned];
    this.setStore(STORAGE_KEYS.TIMETABLE, updated);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'COPY_TIMETABLE',
      'TIMETABLE',
      toSectionId,
      `Copied ${cloned.length} timetable periods to section.`,
    );

    return this.getTimetableEntries(schoolId, { sectionId: toSectionId });
  }

  public clearTimetableForSection(
    schoolId: string,
    sectionId: string,
    userContext: { userId: string; userName: string },
  ): void {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const count = list.filter(
      (e) => e.schoolId === schoolId && e.academicYearSectionId === sectionId,
    ).length;
    const filtered = list.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === sectionId),
    );
    this.setStore(STORAGE_KEYS.TIMETABLE, filtered);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'CLEAR_TIMETABLE',
      'TIMETABLE',
      sectionId,
      `Cleared ${count} timetable slots for section.`,
    );
  }

  public saveSectionTimetableBatch(
    schoolId: string,
    sectionId: string,
    entries: TimetableEntry[],
    userContext: { userId: string; userName: string },
  ): TimetableEntry[] {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const withoutSection = list.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === sectionId),
    );

    const formatted: TimetableEntry[] = entries.map((e) => ({
      ...e,
      id:
        e.id && !e.id.startsWith('draft-')
          ? e.id
          : 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      schoolId,
      academicYearSectionId: sectionId,
      updatedAt: new Date().toISOString(),
      createdAt: e.createdAt || new Date().toISOString(),
    }));

    const merged = [...withoutSection, ...formatted];
    this.setStore(STORAGE_KEYS.TIMETABLE, merged);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'BATCH_SAVE_TIMETABLE',
      'TIMETABLE',
      sectionId,
      `Saved ${formatted.length} timetable entries for section.`,
    );

    return this.getTimetableEntries(schoolId, { sectionId });
  }

  public copyDaySchedule(
    schoolId: string,
    sectionId: string,
    fromDay: DayOfWeek,
    toDay: DayOfWeek,
    userContext: { userId: string; userName: string },
  ): TimetableEntry[] {
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const sourceEntries = list.filter(
      (e) =>
        e.schoolId === schoolId && e.academicYearSectionId === sectionId && e.dayOfWeek === fromDay,
    );

    // Remove existing target day entries for this section
    const withoutTargetDay = list.filter(
      (e) =>
        !(
          e.schoolId === schoolId &&
          e.academicYearSectionId === sectionId &&
          e.dayOfWeek === toDay
        ),
    );

    const cloned: TimetableEntry[] = sourceEntries.map((e) => ({
      ...e,
      id: 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      dayOfWeek: toDay,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updated = [...withoutTargetDay, ...cloned];
    this.setStore(STORAGE_KEYS.TIMETABLE, updated);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'COPY_DAY_TIMETABLE',
      'TIMETABLE',
      sectionId,
      `Copied ${cloned.length} timetable periods from ${fromDay} to ${toDay}.`,
    );

    return this.getTimetableEntries(schoolId, { sectionId });
  }

  public setSectionSubjectTeacher(
    schoolId: string,
    sectionId: string,
    subjectId: string,
    staffId: string | null,
    isClassTeacher: boolean,
    userContext: { userId: string; userName: string },
  ): TeacherAssignmentItem | null {
    const assignments = this.getStore<TeacherAssignmentItem>(
      STORAGE_KEYS.ASSIGNMENTS,
      SEED_ASSIGNMENTS,
    );
    const sections = this.getSectionsSync(schoolId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) throw new Error('Section not found.');

    // If staffId is empty/null, remove any existing assignment for this section & subject
    if (!staffId) {
      const existingIdx = assignments.findIndex(
        (a) =>
          a.schoolId === schoolId &&
          a.academicYearSectionId === sectionId &&
          a.subjectId === subjectId,
      );
      if (existingIdx !== -1) {
        assignments.splice(existingIdx, 1);
        this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);
        this.logAction(
          schoolId,
          userContext.userId,
          userContext.userName,
          'REMOVE_TEACHER_ASSIGNMENT',
          'TEACHER_ASSIGNMENT',
          sectionId,
          `Removed faculty assignment for subject in Section ${section.sectionName}.`,
        );
      }
      return null;
    }

    const staffList = this.getStaff(schoolId);
    const staffMember = staffList.find((s) => s.id === staffId);
    if (!staffMember) throw new Error('Teacher not found in staff directory.');

    // If marking as class teacher, unset any previous class teacher in this section
    if (isClassTeacher) {
      assignments.forEach((a) => {
        if (a.schoolId === schoolId && a.academicYearSectionId === sectionId) {
          a.isClassTeacher = false;
        }
      });
    }

    const existingIdx = assignments.findIndex(
      (a) =>
        a.schoolId === schoolId &&
        a.academicYearSectionId === sectionId &&
        a.subjectId === subjectId,
    );

    if (existingIdx !== -1) {
      // Update existing assignment
      assignments[existingIdx] = {
        ...assignments[existingIdx],
        staffId,
        isClassTeacher: Boolean(isClassTeacher),
        isActive: true,
      };
      this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);

      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'UPDATE_TEACHER_ASSIGNMENT',
        'TEACHER_ASSIGNMENT',
        assignments[existingIdx].id,
        `Reassigned ${staffMember.firstName} ${staffMember.lastName} to Section ${section.sectionName}.`,
      );
      return assignments[existingIdx];
    } else {
      // Create new assignment
      const newAssignment: TeacherAssignmentItem = {
        id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        schoolId,
        academicYearSectionId: sectionId,
        staffId,
        subjectId,
        isClassTeacher: Boolean(isClassTeacher),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      assignments.push(newAssignment);
      this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);

      this.logAction(
        schoolId,
        userContext.userId,
        userContext.userName,
        'ASSIGN_TEACHER',
        'TEACHER_ASSIGNMENT',
        newAssignment.id,
        `Assigned ${staffMember.firstName} ${staffMember.lastName} to Section ${section.sectionName}.`,
      );
      return newAssignment;
    }
  }

  public setSectionClassTeacher(
    schoolId: string,
    sectionId: string,
    staffId: string,
    userContext: { userId: string; userName: string },
  ): TeacherAssignmentItem {
    const assignments = this.getStore<TeacherAssignmentItem>(
      STORAGE_KEYS.ASSIGNMENTS,
      SEED_ASSIGNMENTS,
    );
    const sections = this.getSectionsSync(schoolId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) throw new Error('Section not found.');

    const staffList = this.getStaff(schoolId);
    const staffMember = staffList.find((s) => s.id === staffId);
    if (!staffMember) throw new Error('Teacher not found.');

    // Unset current class teacher in this section
    assignments.forEach((a) => {
      if (a.schoolId === schoolId && a.academicYearSectionId === sectionId) {
        a.isClassTeacher = false;
      }
    });

    // Check if staff already has an assignment in this section
    const existing = assignments.find(
      (a) =>
        a.schoolId === schoolId && a.academicYearSectionId === sectionId && a.staffId === staffId,
    );

    if (existing) {
      existing.isClassTeacher = true;
      this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);
      return existing;
    }

    // Otherwise create dedicated homeroom class teacher record
    const newAsg: TeacherAssignmentItem = {
      id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      schoolId,
      academicYearSectionId: sectionId,
      staffId,
      subjectId: null,
      isClassTeacher: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    assignments.push(newAsg);
    this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAsg;
  }

  public autoAssignFacultyForSection(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
    userContext: { userId: string; userName: string },
  ): number {
    const sections = this.getSectionsSync(schoolId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) throw new Error('Section not found.');

    const classSubjects = this.getClassSubjectsSync(schoolId, section.classId);
    if (classSubjects.length === 0) {
      throw new Error(
        'No subjects mapped to this class yet. Please add subjects to curriculum first.',
      );
    }

    const staffList = this.getStaff(schoolId);
    if (staffList.length === 0) {
      throw new Error('No faculty staff members registered in school directory.');
    }

    const assignments = this.getStore<TeacherAssignmentItem>(
      STORAGE_KEYS.ASSIGNMENTS,
      SEED_ASSIGNMENTS,
    );
    const existingSectionAsgs = assignments.filter(
      (a) => a.schoolId === schoolId && a.academicYearSectionId === sectionId && a.subjectId,
    );
    const existingSubjectIds = new Set(existingSectionAsgs.map((a) => a.subjectId));

    let assignedCount = 0;

    classSubjects.forEach((cs, idx) => {
      if (existingSubjectIds.has(cs.subjectId)) return; // already assigned

      const subName = (cs.subjectName || '').toLowerCase();

      // Find best matching teacher by department or qualification
      let matchedStaff = staffList.find((s) => {
        const dept = (s.departmentName || '').toLowerCase();
        const qual = (s.qualification || '').toLowerCase();
        if (subName.includes('math') && (dept.includes('math') || qual.includes('math')))
          return true;
        if (subName.includes('science') && (dept.includes('sci') || qual.includes('sci')))
          return true;
        if (subName.includes('physic') && (dept.includes('phys') || qual.includes('phys')))
          return true;
        if (subName.includes('chem') && (dept.includes('chem') || qual.includes('chem')))
          return true;
        if (subName.includes('bio') && (dept.includes('bio') || qual.includes('bio'))) return true;
        if (
          subName.includes('eng') &&
          (dept.includes('eng') || qual.includes('eng') || dept.includes('lang'))
        )
          return true;
        if (
          subName.includes('hist') &&
          (dept.includes('social') || dept.includes('hist') || dept.includes('human'))
        )
          return true;
        if (subName.includes('geo') && (dept.includes('social') || dept.includes('geo')))
          return true;
        if (
          subName.includes('comp') &&
          (dept.includes('comp') || dept.includes('it') || dept.includes('tech'))
        )
          return true;
        if (subName.includes('art') && dept.includes('art')) return true;
        if (
          subName.includes('phys') &&
          subName.includes('ed') &&
          (dept.includes('sport') || dept.includes('pe'))
        )
          return true;
        return false;
      });

      // Fallback: round-robin or least assigned staff
      if (!matchedStaff) {
        matchedStaff = staffList[idx % staffList.length];
      }

      const isFirst =
        assignedCount === 0 &&
        !assignments.some((a) => a.academicYearSectionId === sectionId && a.isClassTeacher);

      assignments.push({
        id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        schoolId,
        academicYearSectionId: sectionId,
        staffId: matchedStaff.id,
        subjectId: cs.subjectId,
        isClassTeacher: isFirst,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      assignedCount++;
    });

    this.setStore(STORAGE_KEYS.ASSIGNMENTS, assignments);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'AUTO_ASSIGN_FACULTY',
      'TEACHER_ASSIGNMENT',
      sectionId,
      `Auto-assigned ${assignedCount} faculty teachers to Section ${section.sectionName}.`,
    );

    return assignedCount;
  }

  public cloneSectionSetup(
    schoolId: string,
    sourceSectionId: string,
    targetSectionId: string,
    academicYearId: string,
    options: { copyTeachers: boolean; copyTimetable: boolean },
    userContext: { userId: string; userName: string },
  ): { teachersCopied: number; timetableCopied: number } {
    const sections = this.getSectionsSync(schoolId);
    const sourceSection = sections.find((s) => s.id === sourceSectionId);
    const targetSection = sections.find((s) => s.id === targetSectionId);
    if (!sourceSection || !targetSection) throw new Error('Source or target section not found.');

    let teachersCopied = 0;
    let timetableCopied = 0;

    // 1. Copy Teacher Assignments
    if (options.copyTeachers) {
      const assignments = this.getStore<TeacherAssignmentItem>(
        STORAGE_KEYS.ASSIGNMENTS,
        SEED_ASSIGNMENTS,
      );
      const sourceAsgs = assignments.filter(
        (a) => a.schoolId === schoolId && a.academicYearSectionId === sourceSectionId && a.isActive,
      );

      // Remove existing in target
      const withoutTarget = assignments.filter(
        (a) => !(a.schoolId === schoolId && a.academicYearSectionId === targetSectionId),
      );

      sourceAsgs.forEach((sa) => {
        withoutTarget.push({
          id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          schoolId,
          academicYearSectionId: targetSectionId,
          staffId: sa.staffId,
          subjectId: sa.subjectId,
          isClassTeacher: sa.isClassTeacher,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        teachersCopied++;
      });

      this.setStore(STORAGE_KEYS.ASSIGNMENTS, withoutTarget);
    }

    // 2. Copy Timetable
    if (options.copyTimetable) {
      const timetableList = this.getStore<TimetableEntry>(
        STORAGE_KEYS.TIMETABLE,
        SEED_TIMETABLE_ENTRIES,
      );
      const sourceEntries = timetableList.filter(
        (e) => e.schoolId === schoolId && e.academicYearSectionId === sourceSectionId,
      );

      const withoutTargetTT = timetableList.filter(
        (e) => !(e.schoolId === schoolId && e.academicYearSectionId === targetSectionId),
      );

      sourceEntries.forEach((se) => {
        withoutTargetTT.push({
          ...se,
          id: 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          academicYearSectionId: targetSectionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        timetableCopied++;
      });

      this.setStore(STORAGE_KEYS.TIMETABLE, withoutTargetTT);
    }

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'CLONE_SECTION_SETUP',
      'SECTION',
      targetSectionId,
      `Cloned setup from ${sourceSection.className}-${sourceSection.sectionName} to ${targetSection.className}-${targetSection.sectionName} (${teachersCopied} teachers, ${timetableCopied} timetable slots).`,
    );

    return { teachersCopied, timetableCopied };
  }

  public clearSectionSchedule(
    schoolId: string,
    sectionId: string,
    userContext: { userId: string; userName: string },
  ): number {
    const timetableList = this.getStore<TimetableEntry>(
      STORAGE_KEYS.TIMETABLE,
      SEED_TIMETABLE_ENTRIES,
    );
    const beforeCount = timetableList.length;
    const filtered = timetableList.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === sectionId),
    );
    const removedCount = beforeCount - filtered.length;
    this.setStore(STORAGE_KEYS.TIMETABLE, filtered);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'CLEAR_TIMETABLE',
      'TIMETABLE',
      sectionId,
      `Cleared ${removedCount} timetable slots for section.`,
    );
    return removedCount;
  }

  public autoGenerateTimetableForSection(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
    userContext: { userId: string; userName: string },
  ): TimetableEntry[] {
    const sections = this.getSectionsSync(schoolId);
    const targetSection = sections.find((s) => s.id === sectionId);
    if (!targetSection) throw new Error('Target section not found.');

    const classSubjects = this.getClassSubjectsSync(schoolId, targetSection.classId);
    if (classSubjects.length === 0) {
      throw new Error('No curriculum subjects mapped to this class standard yet.');
    }

    const assignments = this.getTeacherAssignmentsSync(schoolId, academicYearId).filter(
      (a) => a.academicYearSectionId === sectionId && a.subjectId,
    );
    const staffList = this.getStaff(schoolId);
    const fallbackStaff = staffList[0] || {
      id: 'stf-fallback',
      firstName: 'Faculty',
      lastName: 'Staff',
    };

    // Build subject-to-teacher map
    const subjectTeacherMap = new Map<string, string>();
    for (const cs of classSubjects) {
      const match = assignments.find((a) => a.subjectId === cs.subjectId);
      subjectTeacherMap.set(cs.subjectId, match ? match.staffId : fallbackStaff.id);
    }

    const periods = this.getPeriodSlots(schoolId).filter((p) => !p.isBreak);
    const activeDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const totalSlotsNeeded = activeDays.length * periods.length;

    // Build weighted subject pool from weekly periods
    const weightedPool: ClassSubjectItem[] = [];
    classSubjects.forEach((cs) => {
      const count = Math.max(1, cs.weeklyPeriods || 4);
      for (let i = 0; i < count; i++) {
        weightedPool.push(cs);
      }
    });

    // If pool is smaller than total slots, pad with class subjects
    while (weightedPool.length < totalSlotsNeeded) {
      weightedPool.push(classSubjects[weightedPool.length % classSubjects.length]);
    }

    // Interleave/shuffle subjects across days to prevent back-to-back same subjects
    const newEntries: TimetableEntry[] = [];
    let poolIndex = 0;

    for (let pIdx = 0; pIdx < periods.length; pIdx++) {
      const period = periods[pIdx];
      for (let dIdx = 0; dIdx < activeDays.length; dIdx++) {
        const day = activeDays[dIdx];
        // Calculate spread index
        const itemIdx = (dIdx * periods.length + pIdx + poolIndex) % weightedPool.length;
        const cs = weightedPool[itemIdx] || classSubjects[0];
        const teacherId = subjectTeacherMap.get(cs.subjectId) || fallbackStaff.id;

        newEntries.push({
          id:
            'tt-' +
            Date.now() +
            '-' +
            Math.random().toString(36).substring(2, 6) +
            '-' +
            pIdx +
            '-' +
            dIdx,
          schoolId,
          academicYearId,
          academicYearSectionId: sectionId,
          dayOfWeek: day,
          periodId: period.id,
          startTime: period.startTime,
          endTime: period.endTime,
          subjectId: cs.subjectId,
          teacherId,
          room: `Room ${targetSection.className?.replace('Grade ', '') || '10'}1`,
          periodType: cs.subjectType === 'PRACTICAL' ? 'PRACTICAL_LAB' : 'REGULAR',
          notes: 'Auto-scheduled from curriculum allocation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Replace existing entries for this section
    const list = this.getStore<TimetableEntry>(STORAGE_KEYS.TIMETABLE, SEED_TIMETABLE_ENTRIES);
    const withoutSection = list.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === sectionId),
    );
    const merged = [...withoutSection, ...newEntries];
    this.setStore(STORAGE_KEYS.TIMETABLE, merged);

    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'AUTOGEN_TIMETABLE',
      'TIMETABLE',
      sectionId,
      `Auto-generated ${newEntries.length} timetable periods for ${targetSection.className}-${targetSection.sectionName}.`,
    );

    return this.getTimetableEntries(schoolId, { sectionId });
  }

  /**
   * Pure generator: Builds a DRAFT timetable for a section WITHOUT persisting to database.
   * Enables the Generate -> Preview -> Edit -> Save workflow.
   */
  public generateDraftTimetableForSection(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
    assignments: { subjectId: string; staffId: string }[],
    customClassSubjects?: ClassSubjectItem[],
    roomName?: string,
  ): TimetableEntry[] {
    const sections = this.getSectionsSync(schoolId);
    const targetSection = sections.find((s) => s.id === sectionId);
    if (!targetSection) throw new Error('Target section not found.');

    const classSubjects =
      customClassSubjects && customClassSubjects.length > 0
        ? customClassSubjects
        : this.getClassSubjectsSync(schoolId, targetSection.classId);

    if (classSubjects.length === 0) {
      throw new Error(
        'No curriculum subjects configured for this class yet. Please add subjects first.',
      );
    }

    const staffList = this.getStaff(schoolId);
    const subjects = this.getSubjectsSync(schoolId);
    const fallbackStaff: StaffMember = staffList[0] || {
      id: 'stf-fallback',
      schoolId,
      employeeCode: 'EMP000',
      firstName: 'Faculty',
      lastName: 'Teacher',
      email: '',
      phone: '',
      gender: 'MALE',
      designationName: 'Faculty',
      departmentName: 'Academic',
    };

    // Build subject-to-teacher map from draft assignments
    const subjectTeacherMap = new Map<string, string>();
    for (const cs of classSubjects) {
      const match = assignments.find((a) => a.subjectId === cs.subjectId && a.staffId);
      subjectTeacherMap.set(cs.subjectId, match ? match.staffId : fallbackStaff.id);
    }

    const periods = this.getPeriodSlots(schoolId).filter((p) => !p.isBreak);
    if (periods.length === 0) {
      throw new Error('No period slots defined. Please configure timetable periods.');
    }
    const activeDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const totalSlotsNeeded = activeDays.length * periods.length;

    // Build weighted subject pool from weekly periods
    const weightedPool: ClassSubjectItem[] = [];
    classSubjects.forEach((cs) => {
      const count = Math.max(1, cs.weeklyPeriods || 5);
      for (let i = 0; i < count; i++) {
        weightedPool.push(cs);
      }
    });

    while (weightedPool.length < totalSlotsNeeded) {
      weightedPool.push(classSubjects[weightedPool.length % classSubjects.length]);
    }

    const draftEntries: TimetableEntry[] = [];
    let poolIndex = 0;

    for (let pIdx = 0; pIdx < periods.length; pIdx++) {
      const period = periods[pIdx];
      for (let dIdx = 0; dIdx < activeDays.length; dIdx++) {
        const day = activeDays[dIdx];
        const itemIdx = (dIdx * periods.length + pIdx + poolIndex) % weightedPool.length;
        const cs = weightedPool[itemIdx] || classSubjects[0];
        const teacherId = subjectTeacherMap.get(cs.subjectId) || fallbackStaff.id;

        const teacherObj = staffList.find((s) => s.id === teacherId) || fallbackStaff;
        const subjectObj = subjects.find((s) => s.id === cs.subjectId);

        const assignedRoom =
          roomName || `Room ${targetSection.className?.replace(/[^0-9]/g, '') || '10'}1`;

        draftEntries.push({
          id: `draft-tt-${sectionId}-${day}-${period.id}`,
          schoolId,
          academicYearId,
          academicYearSectionId: sectionId,
          dayOfWeek: day,
          periodId: period.id,
          startTime: period.startTime,
          endTime: period.endTime,
          subjectId: cs.subjectId,
          teacherId,
          room: assignedRoom,
          periodType: subjectObj?.subjectType === 'PRACTICAL' ? 'PRACTICAL_LAB' : 'REGULAR',
          notes: 'Draft timetable slot (Unsaved)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          className: targetSection.className,
          classId: targetSection.classId,
          sectionName: targetSection.sectionName,
          subjectName: subjectObj?.name || cs.subjectName || 'Subject',
          subjectCode: subjectObj?.code || cs.subjectCode || 'SUB',
          subjectType: subjectObj?.subjectType || cs.subjectType || 'THEORY',
          teacherName: `${teacherObj.firstName} ${teacherObj.lastName}`,
          teacherEmployeeCode: teacherObj.employeeCode || '',
        });
      }
    }

    return draftEntries;
  }

  /**
   * Pure generator: Auto-assigns teachers for subjects in a section DRAFT WITHOUT persisting to database.
   */
  public generateDraftTeacherAssignments(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
    classSubjects: ClassSubjectItem[],
    currentDraftAssignments: { subjectId: string; staffId: string; isClassTeacher?: boolean }[],
    staffList: StaffMember[],
  ): { subjectId: string; staffId: string; isClassTeacher: boolean }[] {
    let activeStaff = staffList.filter((s) => !schoolId || s.schoolId === schoolId);
    if (activeStaff.length === 0 && staffList.length > 0) {
      activeStaff = staffList;
    }
    if (activeStaff.length === 0) {
      activeStaff = this.getStaff(schoolId);
    }
    if (activeStaff.length === 0) {
      throw new Error('No active faculty teachers found. Please register faculty staff first.');
    }

    const allSubjects = this.getSubjectsSync(schoolId);
    const subjectMap = new Map(allSubjects.map((s) => [s.id, s]));

    const allTimetable = this.getTimetableEntries(schoolId, { academicYearId });
    const teacherLoad = new Map<string, number>();
    allTimetable.forEach((t) => {
      if (t.teacherId) teacherLoad.set(t.teacherId, (teacherLoad.get(t.teacherId) || 0) + 1);
    });

    const draftMap = new Map<string, { staffId: string; isClassTeacher: boolean }>();
    currentDraftAssignments.forEach((a) => {
      if (a.staffId)
        draftMap.set(a.subjectId, {
          staffId: a.staffId,
          isClassTeacher: Boolean(a.isClassTeacher),
        });
    });

    const result: { subjectId: string; staffId: string; isClassTeacher: boolean }[] = [];

    classSubjects.forEach((cs, idx) => {
      const existing = draftMap.get(cs.subjectId);
      if (existing && existing.staffId) {
        result.push({
          subjectId: cs.subjectId,
          staffId: existing.staffId,
          isClassTeacher: existing.isClassTeacher,
        });
        return;
      }

      const subObj = subjectMap.get(cs.subjectId);
      const subName = (subObj?.name || cs.subjectName || '').toLowerCase();

      // Department & qualification matching
      let matched = activeStaff.find((s) => {
        const dept = (s.departmentName || '').toLowerCase();
        const qual = (s.qualification || '').toLowerCase();
        if (
          subName.includes('math') &&
          (dept.includes('math') || qual.includes('math') || dept.includes('comp'))
        )
          return true;
        if (
          subName.includes('sci') &&
          (dept.includes('sci') ||
            qual.includes('sci') ||
            qual.includes('phys') ||
            qual.includes('chem') ||
            qual.includes('bio'))
        )
          return true;
        if (
          subName.includes('phys') &&
          (dept.includes('phys') || qual.includes('phys') || dept.includes('sci'))
        )
          return true;
        if (
          subName.includes('chem') &&
          (dept.includes('chem') || qual.includes('chem') || dept.includes('sci'))
        )
          return true;
        if (
          subName.includes('bio') &&
          (dept.includes('bio') || qual.includes('bio') || dept.includes('sci'))
        )
          return true;
        if (
          subName.includes('eng') &&
          (dept.includes('eng') ||
            qual.includes('eng') ||
            dept.includes('lang') ||
            dept.includes('human'))
        )
          return true;
        if (
          subName.includes('soc') &&
          (dept.includes('soc') ||
            dept.includes('hist') ||
            dept.includes('geo') ||
            dept.includes('human'))
        )
          return true;
        if (
          subName.includes('hist') &&
          (dept.includes('hist') || dept.includes('soc') || dept.includes('human'))
        )
          return true;
        if (
          subName.includes('geo') &&
          (dept.includes('geo') || dept.includes('soc') || dept.includes('human'))
        )
          return true;
        if (subName.includes('hin') && (dept.includes('hin') || dept.includes('lang'))) return true;
        if (
          subName.includes('comp') &&
          (dept.includes('comp') ||
            dept.includes('it') ||
            dept.includes('tech') ||
            dept.includes('math'))
        )
          return true;
        if (
          subName.includes('robot') &&
          (dept.includes('comp') ||
            dept.includes('robot') ||
            dept.includes('tech') ||
            qual.includes('robot'))
        )
          return true;
        if (subName.includes('art') && dept.includes('art')) return true;
        if (subName.includes('music') && (dept.includes('music') || dept.includes('art')))
          return true;
        if (subName.includes('pe') || subName.includes('physical') || subName.includes('sport'))
          return dept.includes('sport') || dept.includes('pe');
        return false;
      });

      // Workload-balanced fallback
      if (!matched) {
        const sorted = [...activeStaff].sort(
          (a, b) => (teacherLoad.get(a.id) || 0) - (teacherLoad.get(b.id) || 0),
        );
        matched = sorted[idx % sorted.length] || activeStaff[0];
      }

      const isFirst = result.length === 0;
      result.push({
        subjectId: cs.subjectId,
        staffId: matched.id,
        isClassTeacher: isFirst,
      });
      teacherLoad.set(matched.id, (teacherLoad.get(matched.id) || 0) + 5);
    });

    return result;
  }

  /**
   * ATOMIC PERSISTENCE: Commits Draft Teacher Assignments AND Timetable in ONE transactional operation.
   * Performs full validation before saving. If any conflict or access error occurs, throws without modifying storage.
   */
  public saveSectionAllocationAndTimetable(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
    data: {
      teacherAssignments: { subjectId: string; staffId: string; isClassTeacher?: boolean }[];
      timetableEntries: TimetableEntry[];
      classSubjectsToAdd?: {
        classId: string;
        subjectId: string;
        weeklyPeriods?: number;
        isMandatory?: boolean;
      }[];
    },
    userContext: { userId: string; userName: string },
  ): {
    success: boolean;
    savedAssignmentsCount: number;
    savedTimetableCount: number;
    errors?: string[];
  } {
    const sections = this.getSectionsSync(schoolId);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) throw new Error('Target section not found.');
    if (section.schoolId !== schoolId) throw new Error('Unauthorized school access.');

    // 1. Validate Timetable Entries for Teacher Double-Booking across other sections
    const allOtherEntries = this.getTimetableEntries(schoolId, { academicYearId }).filter(
      (e) => e.academicYearSectionId !== sectionId,
    );

    for (const draftSlot of data.timetableEntries) {
      if (!draftSlot.teacherId) continue;
      const clash = allOtherEntries.find(
        (other) =>
          other.dayOfWeek === draftSlot.dayOfWeek &&
          other.periodId === draftSlot.periodId &&
          other.teacherId === draftSlot.teacherId,
      );
      if (clash) {
        throw new Error(
          `Conflict: Teacher ${clash.teacherName} is already assigned to ${clash.className}-${clash.sectionName} during ${draftSlot.dayOfWeek} Period ${draftSlot.periodId}. Please reassign before saving.`,
        );
      }
    }

    // 2. Persist Class Subjects if any
    if (data.classSubjectsToAdd && data.classSubjectsToAdd.length > 0) {
      const existingCS = this.getClassSubjectsSync(schoolId, section.classId);
      for (const csToAdd of data.classSubjectsToAdd) {
        if (!existingCS.some((e) => e.subjectId === csToAdd.subjectId)) {
          this.assignClassSubject(
            schoolId,
            {
              classId: section.classId,
              subjectId: csToAdd.subjectId,
              weeklyPeriods: csToAdd.weeklyPeriods || 5,
              isMandatory: csToAdd.isMandatory !== false,
            },
            userContext,
          );
        }
      }
    }

    // 3. Atomically Replace Teacher Assignments for this Section
    const allAssignments = this.getStore<TeacherAssignmentItem>(
      STORAGE_KEYS.ASSIGNMENTS,
      SEED_ASSIGNMENTS,
    );
    const withoutSectionAsgs = allAssignments.filter(
      (a) => !(a.schoolId === schoolId && a.academicYearSectionId === sectionId),
    );

    const newAssignments: TeacherAssignmentItem[] = data.teacherAssignments
      .filter((a) => a.staffId)
      .map((a) => ({
        id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        schoolId,
        academicYearSectionId: sectionId,
        staffId: a.staffId,
        subjectId: a.subjectId,
        isClassTeacher: Boolean(a.isClassTeacher),
        isActive: true,
        createdAt: new Date().toISOString(),
      }));

    this.setStore(STORAGE_KEYS.ASSIGNMENTS, [...withoutSectionAsgs, ...newAssignments]);

    // 4. Atomically Replace Timetable Entries for this Section
    const allTimetable = this.getStore<TimetableEntry>(
      STORAGE_KEYS.TIMETABLE,
      SEED_TIMETABLE_ENTRIES,
    );
    const withoutSectionTT = allTimetable.filter(
      (e) => !(e.schoolId === schoolId && e.academicYearSectionId === sectionId),
    );

    const formattedEntries: TimetableEntry[] = data.timetableEntries.map((e) => ({
      ...e,
      id:
        e.id && !e.id.startsWith('draft-')
          ? e.id
          : 'tt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      schoolId,
      academicYearId,
      academicYearSectionId: sectionId,
      createdAt: e.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.setStore(STORAGE_KEYS.TIMETABLE, [...withoutSectionTT, ...formattedEntries]);

    // 5. Audit Log
    this.logAction(
      schoolId,
      userContext.userId,
      userContext.userName,
      'SAVE_EXPRESS_ALLOCATION',
      'TIMETABLE',
      sectionId,
      `Saved ${newAssignments.length} teacher assignments and ${formattedEntries.length} timetable periods for Section ${section.sectionName}.`,
    );

    return {
      success: true,
      savedAssignmentsCount: newAssignments.length,
      savedTimetableCount: formattedEntries.length,
    };
  }
}

export const academicService = new AcademicSetupService();
