import { NavigationItem, NotificationItem } from '../types';

export interface NavigationSectionConfig {
  sectionKey: string;
  defaultSection: string;
  items: NavigationItem[];
}

// 1. Overview Module
export const OVERVIEW_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    path: '/',
    labelKey: 'dashboard',
    sectionKey: 'overview',
    defaultLabel: 'Dashboard & Health',
    defaultSection: 'Overview',
    iconName: 'LayoutDashboard',
    description: 'Tenant metrics, active context and system architecture',
  },
];

// 2. Administration Module (Strictly system/administration - no academic mixing)
export const ADMINISTRATION_NAVIGATION: NavigationItem[] = [
  {
    id: 'rbac',
    path: '/rbac',
    labelKey: 'rbac',
    sectionKey: 'administration',
    defaultLabel: 'Roles & Permissions',
    defaultSection: 'Administration',
    iconName: 'ShieldCheck',
    requiredPermission: 'school.roles.manage',
    description: 'Fine-grained RBAC matrix and custom role definitions',
  },
];

// 3. Academic Module (All academic setup, sessions, structure & workload grouped cleanly)
export const ACADEMIC_NAVIGATION: NavigationItem[] = [
  {
    id: 'academic-setup',
    path: '/academic/setup',
    labelKey: 'academicSetup',
    sectionKey: 'academics',
    defaultLabel: 'School & Academic Setup',
    defaultSection: 'Academics',
    iconName: 'School',
    badge: 'Module 1',
    description: 'Institutional profiles, calendar sessions, classes, subjects & teachers',
  },
  {
    id: 'school-profile',
    path: '/academic/profile',
    labelKey: 'schoolProfile',
    sectionKey: 'academics',
    defaultLabel: 'Institutional Profile',
    defaultSection: 'Academics',
    iconName: 'Building',
    requiredPermission: 'school.settings.edit',
    description: 'Campus address, legal affiliation, accreditation and configurations',
  },
  {
    id: 'academic-years',
    path: '/academic/years',
    labelKey: 'academicYears',
    sectionKey: 'academics',
    defaultLabel: 'Academic Sessions',
    defaultSection: 'Academics',
    iconName: 'CalendarRange',
    requiredPermission: 'school.academicyears.manage',
    description: 'Manage current, upcoming and archived school years',
  },
  {
    id: 'classes',
    path: '/academic/classes',
    labelKey: 'classes',
    sectionKey: 'academics',
    defaultLabel: 'Classes & Sections',
    defaultSection: 'Academics',
    iconName: 'Layers',
    requiredPermission: 'academics.sections.manage',
    description: 'Section capacity, timetable slots and room assignments',
  },
  {
    id: 'curriculum',
    path: '/academic/curriculum',
    labelKey: 'curriculum',
    sectionKey: 'academics',
    defaultLabel: 'Subjects & Syllabi',
    defaultSection: 'Academics',
    iconName: 'BookOpenCheck',
    requiredPermission: 'academics.curriculum.edit',
    description: 'Curriculum taxonomy, learning goals and units',
  },
  {
    id: 'teachers',
    path: '/academic/teachers',
    labelKey: 'teachers',
    sectionKey: 'academics',
    defaultLabel: 'Teacher Assignments',
    defaultSection: 'Academics',
    iconName: 'UserCheck',
    requiredPermission: 'academics.curriculum.edit',
    description: 'Class teacher (homeroom) and subject master section workload',
  },
  {
    id: 'attendance',
    path: '/attendance',
    labelKey: 'attendance',
    sectionKey: 'academics',
    defaultLabel: 'Daily Attendance',
    defaultSection: 'Academics',
    iconName: 'CalendarCheck',
    requiredPermission: 'attendance.view',
    description: 'Section rosters, QR nonces and historical audit rolls',
  },
  {
    id: 'homework',
    path: '/homework',
    labelKey: 'homework',
    sectionKey: 'academics',
    defaultLabel: 'Homework & Tasks',
    defaultSection: 'Academics',
    iconName: 'FileText',
    requiredPermission: 'homework.manage',
    description: 'Assignments, submissions and grading',
  },
];

// 4. Timetable & Scheduling Module (Standalone module - not mixed with general academics)
export const TIMETABLE_NAVIGATION: NavigationItem[] = [
  {
    id: 'timetable',
    path: '/timetable',
    labelKey: 'timetable',
    sectionKey: 'timetable',
    defaultLabel: 'Timetable Matrix',
    defaultSection: 'Timetable & Schedules',
    iconName: 'CalendarDays',
    requiredPermission: 'academics.sections.manage',
    badge: 'Master',
    description: 'Weekly period schedules for teachers, classes and sections with clash detection',
  },
  // {
  //   id: 'timetable-teacher',
  //   path: '/timetable/teacher',
  //   labelKey: 'timetableTeacher',
  //   sectionKey: 'timetable',
  //   defaultLabel: 'Teacher Schedules',
  //   defaultSection: 'Timetable & Schedules',
  //   iconName: 'UserCheck',
  //   requiredPermission: 'academics.sections.manage',
  //   description: 'Individual faculty period assignments and weekly load',
  // },
  // {
  //   id: 'timetable-class',
  //   path: '/timetable/class',
  //   labelKey: 'timetableClass',
  //   sectionKey: 'timetable',
  //   defaultLabel: 'Class Timetable',
  //   defaultSection: 'Timetable & Schedules',
  //   iconName: 'Layers',
  //   requiredPermission: 'academics.sections.manage',
  //   description: 'Class & section weekly period schedule grids',
  // },
  // {
  //   id: 'timetable-room',
  //   path: '/timetable/room',
  //   labelKey: 'timetableRoom',
  //   sectionKey: 'timetable',
  //   defaultLabel: 'Room & Venues',
  //   defaultSection: 'Timetable & Schedules',
  //   iconName: 'Building',
  //   requiredPermission: 'academics.sections.manage',
  //   description: 'Facility, lab and room availability matrices',
  // },
  {
    id: 'timetable-conflicts',
    path: '/timetable/conflicts',
    labelKey: 'timetableConflicts',
    sectionKey: 'timetable',
    defaultLabel: 'Conflict Auditor',
    defaultSection: 'Timetable & Schedules',
    iconName: 'ShieldCheck',
    requiredPermission: 'academics.sections.manage',
    description: 'Auditor for room overbooking and double-booked periods',
  },
  {
    id: 'timetable-generator',
    path: '/timetable/generator',
    labelKey: 'timetableGenerator',
    sectionKey: 'timetable',
    defaultLabel: 'Schedule Generator',
    defaultSection: 'Timetable & Schedules',
    iconName: 'Sparkles',
    badge: 'AI/Auto',
    requiredPermission: 'academics.sections.manage',
    description: 'Automated constraint-satisfaction schedule builder',
  },
];

// 5. Student Lifecycle & Admissions Module
export const STUDENTS_NAVIGATION: NavigationItem[] = [
  {
    id: 'admissions',
    path: '/admissions',
    labelKey: 'admissions',
    sectionKey: 'admissionsAndStudents',
    defaultLabel: 'Admissions & Enrollment',
    defaultSection: 'Admissions & Students',
    iconName: 'UserPlus',
    description: 'Manage student enrollments, promotions, transfers and repeat sessions',
  },
  {
    id: 'students',
    path: '/students',
    labelKey: 'students',
    sectionKey: 'admissionsAndStudents',
    defaultLabel: 'Student Directory',
    defaultSection: 'Admissions & Students',
    iconName: 'GraduationCap',
    requiredPermission: 'students.view',
    badge: '1,420',
    description: 'Profiles, national identities and person records',
  },
  {
    id: 'teachers-dir',
    path: '/teachers',
    labelKey: 'teachers',
    sectionKey: 'admissionsAndStudents',
    defaultLabel: 'Teacher Directory',
    defaultSection: 'Admissions & Students',
    iconName: 'Users',
    description: 'Faculty directory, teacher profiles, qualifications, workloads and assignments',
  },
];

// 6. Examination & Results Module
export const EXAMINATIONS_NAVIGATION: NavigationItem[] = [
  {
    id: 'exams',
    path: '/exams',
    labelKey: 'exams',
    sectionKey: 'examinations',
    defaultLabel: 'Exams & Marks',
    defaultSection: 'Examinations',
    iconName: 'FileSpreadsheet',
    requiredPermission: 'exams.marks.enter',
    description: 'Exam scheduling, subject papers and marks entry',
  },
  {
    id: 'transcripts',
    path: '/transcripts',
    labelKey: 'transcripts',
    sectionKey: 'examinations',
    defaultLabel: 'Report Card Transcripts',
    defaultSection: 'Examinations',
    iconName: 'Award',
    requiredPermission: 'exams.reportcards.publish',
    description: 'Legally sealed SHA-256 report card snapshots',
  },
];

// 7. Finance & Subledger Module
export const FINANCE_NAVIGATION: NavigationItem[] = [
  {
    id: 'finance-fees',
    path: '/finance-fees',
    labelKey: 'financeFees',
    sectionKey: 'financialSubledger',
    defaultLabel: 'Fee Structures & Items',
    defaultSection: 'Financial Subledger',
    iconName: 'Coins',
    requiredPermission: 'finance.feestructures.manage',
    description: 'Tuition slabs, concessions and late penalty rules',
  },
  {
    id: 'finance-cashier',
    path: '/finance-cashier',
    labelKey: 'financeCashier',
    sectionKey: 'financialSubledger',
    defaultLabel: 'Cashier & Payments',
    defaultSection: 'Financial Subledger',
    iconName: 'Receipt',
    requiredPermission: 'finance.payments.collect',
    description: 'Receipt issuance, payment modes and allocations',
  },
  {
    id: 'finance-ledger',
    path: '/finance-ledger',
    labelKey: 'financeLedger',
    sectionKey: 'financialSubledger',
    defaultLabel: 'Student Fee Subledger',
    defaultSection: 'Financial Subledger',
    iconName: 'Scale',
    requiredPermission: 'finance.ledger.view',
    description: 'Immutable GAAP/IFRS append-only audit trail',
  },
  {
    id: 'finance-payroll',
    path: '/finance-payroll',
    labelKey: 'financePayroll',
    sectionKey: 'financialSubledger',
    defaultLabel: 'Staff Payroll',
    defaultSection: 'Financial Subledger',
    iconName: 'Wallet',
    requiredPermission: 'finance.payroll.process',
    description: 'Monthly payroll generation and salary disbursements',
  },
];

// 8. Operations & Facilities Module
export const FACILITIES_NAVIGATION: NavigationItem[] = [
  {
    id: 'library',
    path: '/library',
    labelKey: 'library',
    sectionKey: 'campusFacilities',
    defaultLabel: 'Library Circulation',
    defaultSection: 'Campus Facilities',
    iconName: 'BookMarked',
    requiredPermission: 'operations.library.manage',
    description: 'Catalog, book copies, checkouts and fine tracking',
  },
  {
    id: 'transport',
    path: '/transport',
    labelKey: 'transport',
    sectionKey: 'campusFacilities',
    defaultLabel: 'Fleet & Bus Routes',
    defaultSection: 'Campus Facilities',
    iconName: 'Bus',
    requiredPermission: 'operations.transport.manage',
    description: 'Vehicles, route stops and student trip check-ins',
  },
  {
    id: 'hostel',
    path: '/hostel',
    labelKey: 'hostel',
    sectionKey: 'campusFacilities',
    defaultLabel: 'Hostel & Housing',
    defaultSection: 'Campus Facilities',
    iconName: 'Building',
    requiredPermission: 'operations.hostel.manage',
    description: 'Blocks, single-occupant beds and curfew visitor logs',
  },
];

/**
 * Clean, unmixed modular sections configuration for the sidebar
 */
export const NAVIGATION_SECTIONS: NavigationSectionConfig[] = [
  {
    sectionKey: 'overview',
    defaultSection: 'Overview',
    items: OVERVIEW_NAVIGATION,
  },
  {
    sectionKey: 'administration',
    defaultSection: 'Administration',
    items: ADMINISTRATION_NAVIGATION,
  },
  {
    sectionKey: 'academics',
    defaultSection: 'Academics',
    items: ACADEMIC_NAVIGATION,
  },
  {
    sectionKey: 'timetable',
    defaultSection: 'Timetable & Schedules',
    items: TIMETABLE_NAVIGATION,
  },
  {
    sectionKey: 'admissionsAndStudents',
    defaultSection: 'Admissions & Students',
    items: STUDENTS_NAVIGATION,
  },
  {
    sectionKey: 'examinations',
    defaultSection: 'Examinations',
    items: EXAMINATIONS_NAVIGATION,
  },
  {
    sectionKey: 'financialSubledger',
    defaultSection: 'Financial Subledger',
    items: FINANCE_NAVIGATION,
  },
  {
    sectionKey: 'campusFacilities',
    defaultSection: 'Campus Facilities',
    items: FACILITIES_NAVIGATION,
  },
];

/**
 * Flattened complete navigation list
 */
export const APP_NAVIGATION: NavigationItem[] = NAVIGATION_SECTIONS.flatMap((s) => s.items);

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    schoolId: 'school-oakridge-01',
    title: 'Audit Invariant Guard',
    message: 'Composite foreign key rules validated. 0 cross-tenant joins permitted.',
    category: 'SECURITY',
    createdAt: '10 mins ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    schoolId: 'school-oakridge-01',
    title: 'Fee Collection Milestone',
    message: 'Term 1 fee collection crossed $142,500 with automated receipt reconciliation.',
    category: 'FINANCE',
    createdAt: '1 hour ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    schoolId: 'school-oakridge-01',
    title: 'Exam Schedule Published',
    message: 'Mid-term examination dates and room allocations finalized for Grade 9 & 10.',
    category: 'ACADEMIC',
    createdAt: '3 hours ago',
    isRead: true,
  },
  {
    id: 'notif-4',
    schoolId: 'school-oakridge-01',
    title: 'Daily Attendance Audit',
    message: '98.4% attendance recorded across all 42 classroom sections.',
    category: 'ATTENDANCE',
    createdAt: '5 hours ago',
    isRead: true,
  },
  {
    id: 'notif-5',
    schoolId: 'school-oakridge-01',
    title: 'Academic Year Rollover Ready',
    message: 'AY 2026-2027 schema initialized. Class rosters ready for promotion staging.',
    category: 'SYSTEM',
    createdAt: '1 day ago',
    isRead: true,
  },
];
