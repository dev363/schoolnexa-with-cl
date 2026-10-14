import { UserSummary, SchoolSummary, PermissionNode } from '../types';

export const SYSTEM_PERMISSIONS: PermissionNode[] = [
  // Platform Superadmin
  {
    id: 'perm-p1',
    code: 'platform.schools.manage',
    module: 'Platform',
    action: 'manage',
    description: 'Create, update and manage tenant schools',
  },
  {
    id: 'perm-p2',
    code: 'platform.subscriptions.manage',
    module: 'Platform',
    action: 'manage',
    description: 'Manage SaaS tiers and subscription billing',
  },

  // School Administration & Settings
  {
    id: 'perm-s1',
    code: 'school.settings.view',
    module: 'Settings',
    action: 'view',
    description: 'View school branding, domain, and profile',
  },
  {
    id: 'perm-s2',
    code: 'school.settings.edit',
    module: 'Settings',
    action: 'edit',
    description: 'Modify school settings and configuration',
  },
  {
    id: 'perm-s3',
    code: 'school.academicyears.manage',
    module: 'Academic Year',
    action: 'manage',
    description: 'Create and transition academic years',
  },
  {
    id: 'perm-s4',
    code: 'school.roles.manage',
    module: 'RBAC',
    action: 'manage',
    description: 'Assign roles and configure custom permissions',
  },
  {
    id: 'perm-s5',
    code: 'school.users.manage',
    module: 'Users',
    action: 'manage',
    description: 'Invite and manage school users and staff',
  },

  // Student Admissions & Lifecycle
  {
    id: 'perm-a1',
    code: 'students.admit',
    module: 'Admissions',
    action: 'create',
    description: 'Register and admit new students',
  },
  {
    id: 'perm-a2',
    code: 'students.view',
    module: 'Students',
    action: 'view',
    description: 'View student directory and personal records',
  },
  {
    id: 'perm-a3',
    code: 'students.edit',
    module: 'Students',
    action: 'edit',
    description: 'Edit student profiles, documents and contact',
  },
  {
    id: 'perm-a4',
    code: 'students.promote',
    module: 'Promotions',
    action: 'manage',
    description: 'Process batch promotions and end-of-year rollovers',
  },

  // Teacher & Faculty Management
  {
    id: 'perm-t1',
    code: 'teachers.view',
    module: 'Teachers',
    action: 'view',
    description: 'View teacher profiles, directory and academic assignments',
  },
  {
    id: 'perm-t2',
    code: 'teachers.create',
    module: 'Teachers',
    action: 'create',
    description: 'Register and onboard new teachers and faculty members',
  },
  {
    id: 'perm-t3',
    code: 'teachers.edit',
    module: 'Teachers',
    action: 'edit',
    description: 'Edit teacher qualifications, employment details, and profiles',
  },
  {
    id: 'perm-t4',
    code: 'teachers.deactivate',
    module: 'Teachers',
    action: 'manage',
    description: 'Deactivate, reactivate or update teacher service status',
  },

  // Academics, Attendance & Curriculum
  {
    id: 'perm-c1',
    code: 'academics.sections.manage',
    module: 'Classes',
    action: 'manage',
    description: 'Configure classes, sections and student allocations',
  },
  {
    id: 'perm-c2',
    code: 'academics.curriculum.edit',
    module: 'Curriculum',
    action: 'edit',
    description: 'Manage subjects and syllabus plans',
  },
  {
    id: 'perm-c3',
    code: 'attendance.take',
    module: 'Attendance',
    action: 'create',
    description: 'Mark and submit classroom student attendance',
  },
  {
    id: 'perm-c4',
    code: 'attendance.view',
    module: 'Attendance',
    action: 'view',
    description: 'View attendance analytics and export reports',
  },
  {
    id: 'perm-c5',
    code: 'homework.manage',
    module: 'Homework',
    action: 'manage',
    description: 'Create assignments and grade submissions',
  },

  // Examinations & Transcripts
  {
    id: 'perm-e1',
    code: 'exams.create',
    module: 'Examinations',
    action: 'create',
    description: 'Schedule exam terms and subject papers',
  },
  {
    id: 'perm-e2',
    code: 'exams.marks.enter',
    module: 'Marks',
    action: 'edit',
    description: 'Enter, modify and verify student marks',
  },
  {
    id: 'perm-e3',
    code: 'exams.reportcards.publish',
    module: 'Report Cards',
    action: 'publish',
    description: 'Generate and legally seal report card snapshots',
  },

  // Finance & Subledger
  {
    id: 'perm-f1',
    code: 'finance.feestructures.manage',
    module: 'Fees',
    action: 'manage',
    description: 'Configure fee structures, categories and late penalty rules',
  },
  {
    id: 'perm-f2',
    code: 'finance.payments.collect',
    module: 'Cashier',
    action: 'collect',
    description: 'Collect student fees and issue payment receipts',
  },
  {
    id: 'perm-f3',
    code: 'finance.ledger.view',
    module: 'Subledger',
    action: 'view',
    description: 'View immutable student subledgers and reconciliations',
  },
  {
    id: 'perm-f4',
    code: 'finance.payroll.process',
    module: 'Payroll',
    action: 'manage',
    description: 'Generate monthly payrolls and distribute salary slips',
  },

  // Operations & Logistics
  {
    id: 'perm-o1',
    code: 'operations.library.manage',
    module: 'Library',
    action: 'manage',
    description: 'Catalog book copies and execute circulation loans',
  },
  {
    id: 'perm-o2',
    code: 'operations.transport.manage',
    module: 'Fleet',
    action: 'manage',
    description: 'Route vehicles and record boarding attendance',
  },
  {
    id: 'perm-o3',
    code: 'operations.hostel.manage',
    module: 'Hostel',
    action: 'manage',
    description: 'Assign rooms, monitor curfews, and register visitors',
  },
];

export const MOCK_SEED_SCHOOLS: SchoolSummary[] = [
  {
    id: 'school-oakridge-01',
    name: 'Oakridge International Academy',
    code: 'OAK-ACAD',
    domain: 'oakridge.schoolnexa.com',
    status: 'ACTIVE',
    academicYears: [
      {
        id: 'ay-oak-2024',
        schoolId: 'school-oakridge-01',
        name: 'Academic Year 2024-2025',
        code: 'AY-24-25',
        startDate: '2024-08-15',
        endDate: '2025-06-15',
        isCurrent: false,
        status: 'ARCHIVED',
      },
      {
        id: 'ay-oak-2025',
        schoolId: 'school-oakridge-01',
        name: 'Academic Year 2025-2026',
        code: 'AY-25-26',
        startDate: '2025-08-15',
        endDate: '2026-06-15',
        isCurrent: true,
        status: 'ACTIVE',
      },
      {
        id: 'ay-oak-2026',
        schoolId: 'school-oakridge-01',
        name: 'Academic Year 2026-2027',
        code: 'AY-26-27',
        startDate: '2026-08-15',
        endDate: '2027-06-15',
        isCurrent: false,
        status: 'UPCOMING',
      },
    ],
    roles: [
      {
        id: 'role-oak-admin',
        name: 'School Principal & Director',
        code: 'PRINCIPAL',
        isSystem: true,
        permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
          (p) => p.code,
        ),
      },
      {
        id: 'role-oak-teacher',
        name: 'Senior Academic Faculty',
        code: 'TEACHER',
        isSystem: false,
        permissions: [
          'teachers.view',
          'students.view',
          'attendance.take',
          'attendance.view',
          'homework.manage',
          'exams.marks.enter',
          'academics.curriculum.edit',
        ],
      },
      {
        id: 'role-oak-accountant',
        name: 'Bursar & Finance Lead',
        code: 'BURSAR',
        isSystem: false,
        permissions: [
          'students.view',
          'finance.feestructures.manage',
          'finance.payments.collect',
          'finance.ledger.view',
          'finance.payroll.process',
        ],
      },
    ],
  },
  {
    id: 'school-stmarys-02',
    name: "St. Mary's Grammar School",
    code: 'STM-GRAM',
    domain: 'stmarys.schoolnexa.com',
    status: 'ACTIVE',
    academicYears: [
      {
        id: 'ay-stm-2025',
        schoolId: 'school-stmarys-02',
        name: 'Academic Session 2025-2026',
        code: 'AY-25-26',
        startDate: '2025-09-01',
        endDate: '2026-07-01',
        isCurrent: true,
        status: 'ACTIVE',
      },
    ],
    roles: [
      {
        id: 'role-stm-admin',
        name: 'Headmaster Administrator',
        code: 'HEADMASTER',
        isSystem: true,
        permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
          (p) => p.code,
        ),
      },
      {
        id: 'role-stm-teacher',
        name: 'Class Tutor',
        code: 'TUTOR',
        isSystem: false,
        permissions: [
          'teachers.view',
          'students.view',
          'attendance.take',
          'attendance.view',
          'homework.manage',
          'exams.marks.enter',
        ],
      },
    ],
  },
  {
    id: 'school-horizon-03',
    name: 'Horizon STEM Collegiate',
    code: 'HRZ-STEM',
    domain: 'horizon.schoolnexa.com',
    status: 'ACTIVE',
    academicYears: [
      {
        id: 'ay-hrz-2025',
        schoolId: 'school-horizon-03',
        name: 'Annual Year 2025-2026',
        code: 'AY-25-26',
        startDate: '2025-07-01',
        endDate: '2026-05-31',
        isCurrent: true,
        status: 'ACTIVE',
      },
    ],
    roles: [
      {
        id: 'role-hrz-admin',
        name: 'Superintendent',
        code: 'SUPERINTENDENT',
        isSystem: true,
        permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
          (p) => p.code,
        ),
      },
    ],
  },
];

export const DEMO_USERS: (UserSummary & {
  password: string;
  schoolMemberships: { schoolId: string; roleCodes: string[] }[];
})[] = [
  {
    id: 'user-alex-super',
    email: 'alex.director@schoolnexa.com',
    password: 'password123',
    fullName: 'Dr. Alexander Wright',
    phone: '+1 (555) 234-5678',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isSuperAdmin: true,
    isActive: true,
    schoolMemberships: [
      { schoolId: 'school-oakridge-01', roleCodes: ['PRINCIPAL'] },
      { schoolId: 'school-stmarys-02', roleCodes: ['HEADMASTER'] },
      { schoolId: 'school-horizon-03', roleCodes: ['SUPERINTENDENT'] },
    ],
  },
  {
    id: 'user-clara-teacher',
    email: 'clara.mendez@oakridge.edu',
    password: 'password123',
    fullName: 'Clara Mendez (M.Sc.)',
    phone: '+1 (555) 890-1234',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isSuperAdmin: false,
    isActive: true,
    schoolMemberships: [{ schoolId: 'school-oakridge-01', roleCodes: ['TEACHER'] }],
  },
  {
    id: 'user-marcus-finance',
    email: 'marcus.vance@oakridge.edu',
    password: 'password123',
    fullName: 'Marcus Vance, CPA',
    phone: '+1 (555) 456-7890',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isSuperAdmin: false,
    isActive: true,
    schoolMemberships: [{ schoolId: 'school-oakridge-01', roleCodes: ['BURSAR'] }],
  },
  {
    id: 'user-sarah-tutor',
    email: 'sarah.jenkins@stmarys.org',
    password: 'password123',
    fullName: 'Sarah Jenkins (B.Ed)',
    phone: '+1 (555) 345-6789',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isSuperAdmin: false,
    isActive: true,
    schoolMemberships: [{ schoolId: 'school-stmarys-02', roleCodes: ['TUTOR'] }],
  },
];
