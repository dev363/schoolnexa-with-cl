import { TranslationSchema } from '../types';

export const fr: TranslationSchema = {
  common: {
    appName: 'SchoolNexa',
    appTagline: 'Plateforme SaaS de Gestion Multi-Établissements',
    loading: 'Chargement...',
    initializing: 'Initialisation du contexte scolaire multi-tenant...',
    save: 'Enregistrer les Modifications',
    cancel: 'Annuler',
    create: 'Créer',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    manage: 'Gérer',
    publish: 'Publier',
    collect: 'Encaisser',
    close: 'Fermer',
    filter: 'Filtrer',
    all: 'Tous',
    unread: 'Non lus',
    search: 'Rechercher...',
    active: 'Actif',
    status: 'Statut',
    actions: 'Actions',
    date: 'Date',
    system: 'Système',
    tenant: 'Locataire',
    session: 'Session',
    superAdmin: 'Admin Global',
    member: 'Membre',
    lightMode: 'Mode Clair',
    darkMode: 'Mode Sombre',
    language: 'Langue',
    notifications: 'Notifications',
    new: 'nouveau',
    signOut: 'Déconnexion',
    returnToDashboard: 'Retour au Tableau de Bord',
    reviewPermissions: 'Examiner la Matrice des Permissions',
    tenantIsolated: 'LOCATAIRE ISOLÉ',
    invariantsGuarded: '100% Invariants Protégés',
    current: 'Actuel',
    upcoming: 'À venir',
    archived: 'Archivé',
  },

  navSections: {
    overview: 'Aperçu Général',
    administration: 'Administration',
    admissionsAndStudents: 'Admissions et Élèves',
    academics: 'Pédagogie',
    examinations: 'Examens',
    financialSubledger: 'Grand Livre Financier',
    campusFacilities: 'Infrastructures du Campus',
  },

  navModules: {
    dashboard: {
      label: 'Tableau de Bord & Santé',
      desc: 'Métriques des locataires, contexte actif et architecture système',
    },
    rbac: {
      label: 'Rôles & Permissions',
      desc: 'Matrice RBAC granulaire et rôles personnalisés',
    },
    academicYears: {
      label: 'Sessions Académiques',
      desc: 'Gérer les années scolaires actuelles, futures et archivées',
    },
    admissions: {
      label: 'Admissions et Inscriptions',
      desc: 'Gestion des inscriptions, promotions, transferts et redoublements',
    },
    students: {
      label: 'Répertoire des Élèves',
      desc: 'Profils, identités nationales et dossiers scolaires',
    },
    promotions: {
      label: 'Passages de Classe',
      desc: "Rollovers annuels et validation des cohortes d'élèves",
    },
    classes: {
      label: 'Classes & Sections',
      desc: 'Capacité des sections, créneaux horaires et affectation des salles',
    },
    curriculum: {
      label: 'Matières & Programmes',
      desc: "Taxonomie des programmes, objectifs et unités d'apprentissage",
    },
    attendance: {
      label: 'Présences Quotidiennes',
      desc: "Feuilles d'appel, jetons QR et journaux d'audit d'assiduité",
    },
    homework: {
      label: 'Devoirs & Tâches',
      desc: "Devoirs assignés, rendus d'élèves et notations",
    },
    exams: {
      label: 'Examens & Notes',
      desc: 'Calendrier des examens, épreuves et saisie des notes',
    },
    transcripts: {
      label: 'Bulletins Scolaires',
      desc: 'Instantanés officiels scellés cryptographiquement en SHA-256',
    },
    financeFees: {
      label: 'Grilles Tarifaires',
      desc: 'Barèmes de scolarité, bourses et pénalités de retard',
    },
    financeCashier: {
      label: 'Caisse & Règlements',
      desc: 'Émission de reçus, modes de paiement et ventilation',
    },
    financeLedger: {
      label: 'Grand Livre des Frais',
      desc: "Piste d'audit immuable conforme aux normes GAAP/IFRS",
    },
    financePayroll: {
      label: 'Paie du Personnel',
      desc: 'Génération mensuelle des paies et virements des salaires',
    },
    library: {
      label: 'Circulation Médiathèque',
      desc: 'Catalogue, exemplaires physiques, emprunts et gestion des amendes',
    },
    transport: {
      label: 'Flotte & Circuits de Bus',
      desc: "Véhicules, arrêts d'itinéraires et pointage des trajets d'élèves",
    },
    hostel: {
      label: 'Internat & Hébergement',
      desc: 'Bâtiments, dortoirs individuels et registre des couvre-feux et visiteurs',
    },
  },

  topbar: {
    selectSchool: "Sélectionner l'Établissement",
    authorizedCampuses: 'Campus Autorisés',
    provisionNewSchool: 'Créer un Nouvel Établissement',
    academicYear: 'Année Scolaire',
    academicAnchors: 'Ancrages Scolaires',
    addAcademicSession: 'Ajouter une Session Scolaire',
    securityAndEntitlements: "Sécurité & Droits d'Accès",
    signOutSession: 'Se Déconnecter de la Session',
    activeEntitlementScope: "Périmètre d'Habilitation Actif",
    tenantIsolationKey: "CLÉ D'ISOLATION DU LOCATAIRE",
    grantedPermissions: 'Permissions Accordées',
    auditLogNotice: "Journalisation d'audit active pour toute opération à risque élevé",
  },

  modals: {
    provisionSchoolTitle: 'Créer un Nouvel Établissement',
    provisionSchoolSubtitle: 'Initialiser la base de données isolée et les rôles RBAC',
    schoolName: "Nom de l'Établissement",
    schoolNamePlaceholder: 'ex: Académie Internationale Victor Hugo',
    schoolCode: 'Code Établissement (Clé Locataire)',
    schoolCodePlaceholder: 'ex: VH-ACAD',
    customDomain: 'Domaine Personnalisé (Optionnel)',
    customDomainPlaceholder: 'ex: hugo.schoolnexa.com',
    createSchoolBtn: "Créer l'Établissement",

    addYearTitle: 'Ajouter une Année Scolaire',
    yearTitlePlaceholder: 'ex: Année Scolaire 2026-2027',
    yearCode: 'Code Session',
    yearCodePlaceholder: 'ex: AS-26-27',
    startDate: 'Date de Début',
    endDate: 'Date de Fin',
    saveYearBtn: "Enregistrer l'Année Scolaire",
  },

  dashboard: {
    systemMetricsAndHealth: 'Métriques et Santé du Système',
    rbacMatrix: 'Matrice RBAC & Permissions',
    tenantBoundary: "Frontière d'Isolation",
    tenantBoundaryDesc:
      'Base partagée et schéma avec clés composites [school_id, id] interdisant les jointures croisées.',
    academicAnchor: 'Ancre Temporelle Académique',
    academicAnchorDesc:
      "Toutes les opérations d'enseignement et les notes sont scellées à cet intervalle.",
    assignedRoles: 'Rôles Attribués',
    assignedRolesDesc:
      "Évalués selon les adhésions utilisateur-école. Déterminent les accès aux fonctions et à l'API.",
    invariantsTitle: 'Invariants Fondamentaux Multi-Tenants & RBAC',
    inv1Title: 'Clés Étrangères 100% au Niveau du Moteur Relationnel',
    inv1Desc:
      'Configuré avec relationMode = "foreignKeys". Toutes les contraintes sont imposées directement dans InnoDB.',
    inv2Title: "Contraintes d'Isolation Composites",
    inv2Desc:
      'Les entités dépendantes pointent sur [schoolId, parentId] -> Parent([schoolId, id]) empêchant les fuites.',
    inv3Title: 'Clés Uniques Générées Déterministes (STORED)',
    inv3Desc:
      "Émule les index partiels pour les admissions actives, les identifiants d'agents et les enseignants référents.",
    inv4Title: 'Déclencheurs Immuables du Grand Livre',
    inv4Desc:
      'Déclencheurs interdisant UPDATE ou DELETE sur fee_ledger_entries garantissant un historique comptable inviolable.',
  },

  rbac: {
    title: 'Matrice des Rôles & Habilitations',
    subtitle: 'Permissions détaillées attribuées aux rôles pour cet établissement scolaire',
    createCustomRole: 'Créer un Rôle Personnalisé',
    activeRoles: 'Rôles Actifs',
    permissionsForRole: 'Permissions attribuées à',
    systemRoleNotice: 'Les rôles système sont protégés et ne peuvent pas être modifiés',
    allModules: 'Tous les Modules',
    grantedPerms: 'Permissions Accordées',
    newRoleModalTitle: 'Créer un Rôle Personnalisé',
    newRoleModalSubtitle: 'Configurer les habilitations pour ce locataire',
    roleName: 'Nom du Rôle',
    roleNamePlaceholder: 'ex: Responsable Pédagogique Principal',
    roleCode: 'Code du Rôle',
    roleCodePlaceholder: 'ex: ROLE_RESP_PEDAGOGIQUE',
    roleDescription: 'Description',
    roleDescriptionPlaceholder: 'Bref résumé des responsabilités du rôle...',
    editRole: 'Modifier le Rôle',
    editRoleTitle: 'Modifier les Détails du Rôle',
    deleteRole: 'Supprimer le Rôle',
    deleteRoleTitle: 'Supprimer le Rôle Personnalisé',
    confirmDeleteRoleText: 'Êtes-vous sûr de vouloir supprimer définitivement le rôle',
    deleteRoleWarning:
      'Cette action révoquera ce rôle pour tous les membres du personnel assignés et ne peut pas être annulée.',
    saving: 'Enregistrement...',
    deleting: 'Suppression...',
    roleCreatedSuccess: "Rôle créé avec succès via l'API",
    roleUpdatedSuccess: "Rôle mis à jour avec succès via l'API",
    roleDeletedSuccess: "Rôle supprimé avec succès via l'API",
    permUpdatedSuccess: "Permissions mises à jour avec succès via l'API",
  },

  auth: {
    erpPlatform: 'SchoolNexa ERP',
    erpPlatformSubtitle: 'Plateforme Entreprise de Gestion Multi-Établissements',
    emailAddress: 'Adresse E-mail',
    password: 'Mot de Passe',
    signInBtn: "S'authentifier et Accéder à l'ERP",
    authenticating: 'Authentification en cours...',
    demoProfiles: 'Profils Démo (Connexion Rapide)',
    demoHint:
      'Cliquez sur un compte de démonstration pour remplir automatiquement les identifiants et basculer de session.',
  },

  modulesView: {
    moduleInitialized: 'Module Initialisé',
    moduleInitializedDesc:
      'Toutes les requêtes envoyées à ce composant injectent systématiquement les en-têtes HTTP x-school-id et x-academic-year-id.',
    academicContext: 'Contexte Académique',
    authGate: "Contrôle d'Habilitation",
    publicModule: 'Module Ouvert',
  },

  actions: {
    manage: 'Gérer',
    create: 'Créer',
    edit: 'Modifier',
    view: 'Voir',
    publish: 'Publier',
    collect: 'Encaisser',
  },
};
