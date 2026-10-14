import { TranslationSchema } from '../types';

export const es: TranslationSchema = {
  common: {
    appName: 'SchoolNexa',
    appTagline: 'Plataforma SaaS de Gestión Multi-Escolar Empresarial',
    loading: 'Cargando...',
    initializing: 'Inicializando contexto escolar multi-inquilino...',
    save: 'Guardar Cambios',
    cancel: 'Cancelar',
    create: 'Crear',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    manage: 'Gestionar',
    publish: 'Publicar',
    collect: 'Cobrar',
    close: 'Cerrar',
    filter: 'Filtrar',
    all: 'Todos',
    unread: 'No leídos',
    search: 'Buscar...',
    active: 'Activo',
    status: 'Estado',
    actions: 'Acciones',
    date: 'Fecha',
    system: 'Sistema',
    tenant: 'Inquilino',
    session: 'Sesión',
    superAdmin: 'Admin Global',
    member: 'Miembro',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    language: 'Idioma',
    notifications: 'Notificaciones',
    new: 'nuevo',
    signOut: 'Cerrar Sesión',
    returnToDashboard: 'Volver al Panel',
    reviewPermissions: 'Revisar Matriz de Permisos',
    tenantIsolated: 'INQUILINO AISLADO',
    invariantsGuarded: '100% Invariantes Protegidas',
    current: 'Actual',
    upcoming: 'Próximo',
    archived: 'Archivado',
  },

  navSections: {
    overview: 'Visión General',
    administration: 'Administración',
    admissionsAndStudents: 'Admisiones y Estudiantes',
    academics: 'Académico',
    examinations: 'Exámenes',
    financialSubledger: 'Libro Mayor Financiero',
    campusFacilities: 'Instalaciones del Campus',
  },

  navModules: {
    dashboard: {
      label: 'Panel y Estado',
      desc: 'Métricas de inquilino, contexto activo y arquitectura del sistema',
    },
    rbac: {
      label: 'Roles y Permisos',
      desc: 'Matriz RBAC granular y definiciones de roles personalizados',
    },
    academicYears: {
      label: 'Sesiones Académicas',
      desc: 'Gestionar años escolares actuales, próximos y archivados',
    },
    admissions: {
      label: 'Admisiones y Matrícula',
      desc: 'Gestión de inscripciones, promociones, traslados y repeticiones',
    },
    students: {
      label: 'Directorio de Estudiantes',
      desc: 'Perfiles, documentos de identidad y registros de estudiantes',
    },
    promotions: {
      label: 'Lotes de Promoción',
      desc: 'Traspasos anuales de clase y aprobación de estudiantes',
    },
    classes: {
      label: 'Clases y Secciones',
      desc: 'Capacidad de secciones, horarios y asignación de aulas',
    },
    curriculum: {
      label: 'Materias y Planes de Estudio',
      desc: 'Taxonomía curricular, objetivos de aprendizaje y unidades',
    },
    attendance: {
      label: 'Asistencia Diaria',
      desc: 'Listas de sección, tokens QR y registros de auditoría',
    },
    homework: {
      label: 'Tareas y Deberes',
      desc: 'Asignaciones, entregas y calificaciones',
    },
    exams: {
      label: 'Exámenes y Calificaciones',
      desc: 'Programación de exámenes, exámenes temáticos y actas de notas',
    },
    transcripts: {
      label: 'Boletines de Notas',
      desc: 'Instantáneas de boletines selladas criptográficamente con SHA-256',
    },
    financeFees: {
      label: 'Estructuras de Tarifas',
      desc: 'Planes de matrícula, becas y reglas de penalización por mora',
    },
    financeCashier: {
      label: 'Caja y Cobros',
      desc: 'Emisión de recibos, métodos de pago y conciliación',
    },
    financeLedger: {
      label: 'Libro Auxiliar de Tarifas',
      desc: 'Pista de auditoría inmutable conforme a GAAP/NIIF',
    },
    financePayroll: {
      label: 'Nómina de Personal',
      desc: 'Generación mensual de nóminas y pagos salariales',
    },
    library: {
      label: 'Circulación de Biblioteca',
      desc: 'Catálogo, copias físicas, préstamos y control de multas',
    },
    transport: {
      label: 'Flota y Rutas de Autobús',
      desc: 'Vehículos, paradas de ruta y registro de viajes de alumnos',
    },
    hostel: {
      label: 'Residencia y Alojamiento',
      desc: 'Bloques, camas individuales y registros de visitantes con toque de queda',
    },
  },

  topbar: {
    selectSchool: 'Seleccionar Escuela',
    authorizedCampuses: 'Campus Autorizados',
    provisionNewSchool: 'Aprovisionar Nueva Escuela',
    academicYear: 'Año Académico',
    academicAnchors: 'Anclajes Académicos',
    addAcademicSession: 'Añadir Sesión Académica',
    securityAndEntitlements: 'Seguridad y Permisos',
    signOutSession: 'Cerrar Sesión Actual',
    activeEntitlementScope: 'Alcance de Permisos Activo',
    tenantIsolationKey: 'CLAVE DE AISLAMIENTO DE INQUILINO',
    grantedPermissions: 'Permisos Otorgados',
    auditLogNotice: 'Registro de auditoría activo para todas las operaciones de riesgo',
  },

  modals: {
    provisionSchoolTitle: 'Aprovisionar Nueva Escuela',
    provisionSchoolSubtitle: 'Inicializar base de datos de inquilino y roles RBAC',
    schoolName: 'Nombre de la Escuela',
    schoolNamePlaceholder: 'ej. Academia Internacional Cambridge',
    schoolCode: 'Código de Escuela (Clave de Inquilino)',
    schoolCodePlaceholder: 'ej. CAM-ACAD',
    customDomain: 'Dominio Personalizado (Opcional)',
    customDomainPlaceholder: 'ej. cambridge.schoolnexa.com',
    createSchoolBtn: 'Crear Escuela',

    addYearTitle: 'Añadir Año Académico',
    yearTitlePlaceholder: 'ej. Año Académico 2026-2027',
    yearCode: 'Código de Sesión',
    yearCodePlaceholder: 'ej. AY-26-27',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    saveYearBtn: 'Guardar Año Académico',
  },

  dashboard: {
    systemMetricsAndHealth: 'Métricas del Sistema y Estado',
    rbacMatrix: 'Matriz RBAC y Permisos',
    tenantBoundary: 'Límite de Inquilino',
    tenantBoundaryDesc:
      'Base de datos compartida y esquema con claves compuestas [school_id, id] que impiden uniones entre escuelas.',
    academicAnchor: 'Anclaje Académico',
    academicAnchorDesc:
      'Todas las operaciones académicas e historiales están vinculados a este marco temporal.',
    assignedRoles: 'Roles Asignados',
    assignedRolesDesc:
      'Evaluados a partir de las membresías de usuario-escuela. Determinan las puertas de permisos.',
    invariantsTitle: 'Invariantes Fundamentales de Aislamiento y RBAC',
    inv1Title: '100% Claves Foráneas en el Motor Relacional',
    inv1Desc:
      'Configurado con relationMode = "foreignKeys". Todas las relaciones se aplican directamente en InnoDB.',
    inv2Title: 'Alcance Único Compuesto de Inquilino',
    inv2Desc:
      'Los modelos hijos referencian [schoolId, parentId] -> Padre([schoolId, id]) impidiendo cruce de datos.',
    inv3Title: 'Claves Únicas Generadas Deterministas (STORED)',
    inv3Desc:
      'Emula índices parciales para matrículas activas, códigos de personal y asignaciones.',
    inv4Title: 'Disparadores Inmutables de Libro Financiero',
    inv4Desc: 'Triggers de solo adición impiden UPDATE o DELETE en transacciones contables.',
  },

  rbac: {
    title: 'Matriz de Roles y Permisos',
    subtitle: 'Permisos granulares asignados a roles para este inquilino escolar',
    createCustomRole: 'Crear Rol Personalizado',
    activeRoles: 'Roles Activos',
    permissionsForRole: 'Permisos para',
    systemRoleNotice: 'Los permisos de roles del sistema son inmutables y no se pueden modificar',
    allModules: 'Todos los Módulos',
    grantedPerms: 'Permisos Otorgados',
    newRoleModalTitle: 'Crear Rol Personalizado',
    newRoleModalSubtitle: 'Configurar rol granular de inquilino',
    roleName: 'Nombre del Rol',
    roleNamePlaceholder: 'ej. Supervisor Académico Senior',
    roleCode: 'Código del Rol',
    roleCodePlaceholder: 'ej. ROLE_ACADEMIC_SUPERVISOR',
    roleDescription: 'Descripción',
    roleDescriptionPlaceholder: 'Breve resumen de responsabilidades del rol...',
    editRole: 'Editar Rol',
    editRoleTitle: 'Editar Detalles del Rol',
    deleteRole: 'Eliminar Rol',
    deleteRoleTitle: 'Eliminar Rol Personalizado',
    confirmDeleteRoleText: '¿Está seguro de que desea eliminar permanentemente el rol',
    deleteRoleWarning:
      'Esta acción revocará este rol de todo el personal asignado y no se puede deshacer.',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    roleCreatedSuccess: 'Rol creado exitosamente vía API',
    roleUpdatedSuccess: 'Rol actualizado exitosamente vía API',
    roleDeletedSuccess: 'Rol eliminado exitosamente vía API',
    permUpdatedSuccess: 'Permisos actualizados exitosamente vía API',
  },

  auth: {
    erpPlatform: 'SchoolNexa ERP',
    erpPlatformSubtitle: 'Plataforma Empresarial de Gestión Multi-Escolar',
    emailAddress: 'Correo Electrónico',
    password: 'Contraseña',
    signInBtn: 'Autenticar y Acceder al ERP',
    authenticating: 'Autenticando...',
    demoProfiles: 'Perfiles de Demostración (Acceso Instantáneo)',
    demoHint:
      'Al hacer clic en cualquier perfil demo se completarán automáticamente las credenciales y se cambiará la sesión.',
  },

  modulesView: {
    moduleInitialized: 'Módulo Inicializado',
    moduleInitializedDesc:
      'Todas las solicitudes a este subsistema agregan automáticamente los encabezados multi-inquilino x-school-id y x-academic-year-id.',
    academicContext: 'Contexto Académico',
    authGate: 'Puerta de Autorización',
    publicModule: 'Módulo Público',
  },

  actions: {
    manage: 'Gestionar',
    create: 'Crear',
    edit: 'Editar',
    view: 'Ver',
    publish: 'Publicar',
    collect: 'Cobrar',
  },
};
