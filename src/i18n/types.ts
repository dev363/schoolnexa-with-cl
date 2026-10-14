// Language and Translation Types for SchoolNexa
export type LanguageCode = 'en' | 'es' | 'fr' | 'ar' | 'hi' | 'zh' | 'de';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  // { code: 'es', label: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  // { code: 'fr', label: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  // { code: 'ar', label: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  // { code: 'de', label: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  // { code: 'zh', label: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
];

export interface TranslationSchema {
  common: {
    appName: string;
    appTagline: string;
    loading: string;
    initializing: string;
    save: string;
    cancel: string;
    create: string;
    delete: string;
    edit: string;
    view: string;
    manage: string;
    publish: string;
    collect: string;
    close: string;
    filter: string;
    all: string;
    unread: string;
    search: string;
    active: string;
    status: string;
    actions: string;
    date: string;
    system: string;
    tenant: string;
    session: string;
    superAdmin: string;
    member: string;
    lightMode: string;
    darkMode: string;
    language: string;
    notifications: string;
    new: string;
    signOut: string;
    returnToDashboard: string;
    reviewPermissions: string;
    tenantIsolated: string;
    invariantsGuarded: string;
    current: string;
    upcoming: string;
    archived: string;
  };

  navSections: {
    overview: string;
    administration: string;
    admissionsAndStudents: string;
    academics: string;
    timetable?: string;
    examinations: string;
    financialSubledger: string;
    campusFacilities: string;
  };

  navModules: {
    dashboard: { label: string; desc: string };
    rbac: { label: string; desc: string };
    academicYears: { label: string; desc: string };
    admissions: { label: string; desc: string };
    students?: { label: string; desc: string };
    promotions?: { label: string; desc: string };
    classes: { label: string; desc: string };
    curriculum: { label: string; desc: string };
    attendance: { label: string; desc: string };
    homework: { label: string; desc: string };
    exams: { label: string; desc: string };
    transcripts: { label: string; desc: string };
    financeFees: { label: string; desc: string };
    financeCashier: { label: string; desc: string };
    financeLedger: { label: string; desc: string };
    financePayroll: { label: string; desc: string };
    library: { label: string; desc: string };
    transport: { label: string; desc: string };
    hostel: { label: string; desc: string };
  };

  topbar: {
    selectSchool: string;
    authorizedCampuses: string;
    provisionNewSchool: string;
    academicYear: string;
    academicAnchors: string;
    addAcademicSession: string;
    securityAndEntitlements: string;
    signOutSession: string;
    activeEntitlementScope: string;
    tenantIsolationKey: string;
    grantedPermissions: string;
    auditLogNotice: string;
  };

  modals: {
    provisionSchoolTitle: string;
    provisionSchoolSubtitle: string;
    schoolName: string;
    schoolNamePlaceholder: string;
    schoolCode: string;
    schoolCodePlaceholder: string;
    customDomain: string;
    customDomainPlaceholder: string;
    createSchoolBtn: string;

    addYearTitle: string;
    yearTitlePlaceholder: string;
    yearCode: string;
    yearCodePlaceholder: string;
    startDate: string;
    endDate: string;
    saveYearBtn: string;
  };

  dashboard: {
    systemMetricsAndHealth: string;
    rbacMatrix: string;
    tenantBoundary: string;
    tenantBoundaryDesc: string;
    academicAnchor: string;
    academicAnchorDesc: string;
    assignedRoles: string;
    assignedRolesDesc: string;
    invariantsTitle: string;
    inv1Title: string;
    inv1Desc: string;
    inv2Title: string;
    inv2Desc: string;
    inv3Title: string;
    inv3Desc: string;
    inv4Title: string;
    inv4Desc: string;
  };

  rbac: {
    title: string;
    subtitle: string;
    createCustomRole: string;
    activeRoles: string;
    permissionsForRole: string;
    systemRoleNotice: string;
    allModules: string;
    grantedPerms: string;
    newRoleModalTitle: string;
    newRoleModalSubtitle: string;
    roleName: string;
    roleNamePlaceholder: string;
    roleCode: string;
    roleCodePlaceholder: string;
    roleDescription: string;
    roleDescriptionPlaceholder: string;
    editRole: string;
    editRoleTitle: string;
    deleteRole: string;
    deleteRoleTitle: string;
    confirmDeleteRoleText: string;
    deleteRoleWarning: string;
    saving: string;
    deleting: string;
    roleCreatedSuccess: string;
    roleUpdatedSuccess: string;
    roleDeletedSuccess: string;
    permUpdatedSuccess: string;
  };

  auth: {
    erpPlatform: string;
    erpPlatformSubtitle: string;
    emailAddress: string;
    password: string;
    signInBtn: string;
    authenticating: string;
    demoProfiles: string;
    demoHint: string;
  };

  modulesView: {
    moduleInitialized: string;
    moduleInitializedDesc: string;
    academicContext: string;
    authGate: string;
    publicModule: string;
  };

  actions: {
    manage: string;
    create: string;
    edit: string;
    view: string;
    publish: string;
    collect: string;
  };
}
