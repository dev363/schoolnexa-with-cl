import { TranslationSchema } from '../types';

export const en: TranslationSchema = {
  common: {
    appName: 'SchoolNexa',
    appTagline: 'Enterprise Multi-School Management SaaS Platform',
    loading: 'Loading...',
    initializing: 'Initializing Multi-Tenant School Context...',
    save: 'Save Changes',
    cancel: 'Cancel',
    create: 'Create',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    manage: 'Manage',
    publish: 'Publish',
    collect: 'Collect',
    close: 'Close',
    filter: 'Filter',
    all: 'All',
    unread: 'Unread',
    search: 'Search...',
    active: 'Active',
    status: 'Status',
    actions: 'Actions',
    date: 'Date',
    system: 'System',
    tenant: 'Tenant',
    session: 'Session',
    superAdmin: 'Global Admin',
    member: 'Member',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    new: 'new',
    signOut: 'Sign Out',
    returnToDashboard: 'Return to Dashboard',
    reviewPermissions: 'Review Permissions Matrix',
    tenantIsolated: 'TENANT ISOLATED',
    invariantsGuarded: '100% Invariants Guarded',
    current: 'Current',
    upcoming: 'Upcoming',
    archived: 'Archived',
  },

  navSections: {
    overview: 'Overview',
    administration: 'Administration',
    admissionsAndStudents: 'Admissions & Students',
    academics: 'Academics',
    timetable: 'Timetable & Schedules',
    examinations: 'Examinations',
    financialSubledger: 'Financial Subledger',
    campusFacilities: 'Campus Facilities',
  },

  navModules: {
    dashboard: {
      label: 'Dashboard & Health',
      desc: 'Tenant metrics, active context and system architecture',
    },
    rbac: {
      label: 'Roles & Permissions',
      desc: 'Fine-grained RBAC matrix and custom role definitions',
    },
    academicYears: {
      label: 'Academic Sessions',
      desc: 'Manage current, upcoming and archived school years',
    },
    admissions: {
      label: 'Admissions & Enrollment',
      desc: 'Manage student admissions, promotions, transfers and repeat enrollments',
    },
    students: {
      label: 'Student Directory',
      desc: 'Profiles, national identities and person records',
    },
    promotions: {
      label: 'Promotion Batches',
      desc: 'Annual class rollovers and student batch clearance',
    },
    classes: {
      label: 'Classes & Sections',
      desc: 'Section capacity, timetable slots and room assignments',
    },
    curriculum: {
      label: 'Subjects & Syllabi',
      desc: 'Curriculum taxonomy, learning goals and units',
    },
    attendance: {
      label: 'Daily Attendance',
      desc: 'Section rosters, QR nonces and historical audit rolls',
    },
    homework: {
      label: 'Homework & Tasks',
      desc: 'Assignments, submissions and grading',
    },
    exams: {
      label: 'Exams & Marks',
      desc: 'Exam scheduling, subject papers and marks entry',
    },
    transcripts: {
      label: 'Report Card Transcripts',
      desc: 'Legally sealed SHA-256 report card snapshots',
    },
    financeFees: {
      label: 'Fee Structures & Items',
      desc: 'Tuition slabs, concessions and late penalty rules',
    },
    financeCashier: {
      label: 'Cashier & Payments',
      desc: 'Receipt issuance, payment modes and allocations',
    },
    financeLedger: {
      label: 'Student Fee Subledger',
      desc: 'Immutable GAAP/IFRS append-only audit trail',
    },
    financePayroll: {
      label: 'Staff Payroll',
      desc: 'Monthly payroll generation and salary disbursements',
    },
    library: {
      label: 'Library Circulation',
      desc: 'Catalog, book copies, checkouts and fine tracking',
    },
    transport: {
      label: 'Fleet & Bus Routes',
      desc: 'Vehicles, route stops and student trip check-ins',
    },
    hostel: {
      label: 'Hostel & Housing',
      desc: 'Blocks, single-occupant beds and curfew visitor logs',
    },
  },

  topbar: {
    selectSchool: 'Select School',
    authorizedCampuses: 'Authorized Campuses',
    provisionNewSchool: 'Provision New School',
    academicYear: 'Academic Year',
    academicAnchors: 'Academic Anchors',
    addAcademicSession: 'Add Academic Session',
    securityAndEntitlements: 'Security & Entitlements',
    signOutSession: 'Sign Out of Session',
    activeEntitlementScope: 'Active Entitlement Scope',
    tenantIsolationKey: 'TENANT ISOLATION KEY',
    grantedPermissions: 'Granted Permissions',
    auditLogNotice: 'Audit logging enabled for all high-risk operations',
  },

  modals: {
    provisionSchoolTitle: 'Provision New School',
    provisionSchoolSubtitle: 'Initialize tenant database & default RBAC roles',
    schoolName: 'School Name',
    schoolNamePlaceholder: 'e.g. Cambridge High School',
    schoolCode: 'School Code (Tenant Key)',
    schoolCodePlaceholder: 'e.g. CAM-HIGH',
    customDomain: 'Custom Domain (Optional)',
    customDomainPlaceholder: 'e.g. cambridge.schoolnexa.com',
    createSchoolBtn: 'Create School',

    addYearTitle: 'Add Academic Year',
    yearTitlePlaceholder: 'e.g. Academic Year 2026-2027',
    yearCode: 'Session Code',
    yearCodePlaceholder: 'e.g. AY-26-27',
    startDate: 'Start Date',
    endDate: 'End Date',
    saveYearBtn: 'Save Academic Year',
  },

  dashboard: {
    systemMetricsAndHealth: 'System Metrics & Health',
    rbacMatrix: 'RBAC & Permissions Matrix',
    tenantBoundary: 'Tenant Boundary',
    tenantBoundaryDesc:
      'Shared Database, Shared Schema with composite candidate keys [school_id, id] enforcing zero cross-tenant joins.',
    academicAnchor: 'Academic Anchor',
    academicAnchorDesc:
      'All academic operations and student progress records are scoped to this timeframe.',
    assignedRoles: 'Assigned Roles',
    assignedRolesDesc:
      'Evaluated from user-school memberships. Determines API endpoint and UI permission gates.',
    invariantsTitle: 'Core Multi-Tenant & RBAC Invariants',
    inv1Title: '100% Relational Engine Foreign Keys',
    inv1Desc:
      'Configured with relationMode = "foreignKeys". All relations enforce constraints directly in InnoDB.',
    inv2Title: 'Composite Unique Tenant Scoping',
    inv2Desc:
      'Child models reference [schoolId, parentId] -> Parent([schoolId, id]) guaranteeing cross-tenant data joins are rejected at the DB engine.',
    inv3Title: 'Deterministic STORED Generated Unique Keys',
    inv3Desc:
      'Provides MySQL partial index emulation for active admissions, staff codes, class teachers, and copy keys.',
    inv4Title: 'Immutable Financial Subledger Triggers',
    inv4Desc:
      'Append-only triggers prevent UPDATE or DELETE on fee_ledger_entries and ensure monotonic sequence increments.',
  },

  rbac: {
    title: 'Roles & Entitlements Matrix',
    subtitle: 'Fine-grained permissions assigned to roles for this school tenant',
    createCustomRole: 'Create Custom Role',
    activeRoles: 'Active Roles',
    permissionsForRole: 'Permissions for',
    systemRoleNotice: 'System role permissions are immutable and cannot be modified',
    allModules: 'All Modules',
    grantedPerms: 'Granted Permissions',
    newRoleModalTitle: 'Create Custom Role',
    newRoleModalSubtitle: 'Configure fine-grained tenant role',
    roleName: 'Role Name',
    roleNamePlaceholder: 'e.g. Senior Academic Supervisor',
    roleCode: 'Role Code',
    roleCodePlaceholder: 'e.g. ROLE_ACADEMIC_SUPERVISOR',
    roleDescription: 'Description',
    roleDescriptionPlaceholder: 'Brief summary of role responsibilities...',
    editRole: 'Edit Role',
    editRoleTitle: 'Edit Role Details',
    deleteRole: 'Delete Role',
    deleteRoleTitle: 'Delete Custom Role',
    confirmDeleteRoleText: 'Are you sure you want to permanently delete role',
    deleteRoleWarning:
      'This action will revoke this role from all assigned staff members and cannot be undone.',
    saving: 'Saving...',
    deleting: 'Deleting...',
    roleCreatedSuccess: 'Role created successfully via API',
    roleUpdatedSuccess: 'Role updated successfully via API',
    roleDeletedSuccess: 'Role deleted successfully via API',
    permUpdatedSuccess: 'Permissions updated successfully via API',
  },

  auth: {
    erpPlatform: 'SchoolNexa ERP',
    erpPlatformSubtitle: 'Enterprise Multi-School Management Platform',
    emailAddress: 'Email Address',
    password: 'Password',
    signInBtn: 'Authenticate & Access ERP',
    authenticating: 'Authenticating...',
    demoProfiles: 'Quick-Switch Demo Profiles (Instant Login)',
    demoHint:
      'Clicking any demo user automatically populates credentials and switches your authorized tenant session.',
  },

  modulesView: {
    moduleInitialized: 'Module Initialized',
    moduleInitializedDesc:
      'All requests to this sub-system automatically append the multi-tenant HTTP headers x-school-id and x-academic-year-id.',
    academicContext: 'Academic Context',
    authGate: 'Authorization Gate',
    publicModule: 'Public Module',
  },

  actions: {
    manage: 'Manage',
    create: 'Create',
    edit: 'Edit',
    view: 'View',
    publish: 'Publish',
    collect: 'Collect',
  },
};
