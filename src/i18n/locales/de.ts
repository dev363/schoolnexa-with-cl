import { TranslationSchema } from '../types';

export const de: TranslationSchema = {
  common: {
    appName: 'SchoolNexa',
    appTagline: 'Unternehmensweite Multi-School-Management-SaaS-Plattform',
    loading: 'Wird geladen...',
    initializing: 'Mandantenfähiger Schulkontext wird initialisiert...',
    save: 'Änderungen speichern',
    cancel: 'Abbrechen',
    create: 'Erstellen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    view: 'Anzeigen',
    manage: 'Verwalten',
    publish: 'Veröffentlichen',
    collect: 'Einziehen',
    close: 'Schließen',
    filter: 'Filtern',
    all: 'Alle',
    unread: 'Ungelesen',
    search: 'Suchen...',
    active: 'Aktiv',
    status: 'Status',
    actions: 'Aktionen',
    date: 'Datum',
    system: 'System',
    tenant: 'Mandant',
    session: 'Sitzung',
    superAdmin: 'Globaler Administrator',
    member: 'Mitglied',
    lightMode: 'Heller Modus',
    darkMode: 'Dunkler Modus',
    language: 'Sprache',
    notifications: 'Benachrichtigungen',
    new: 'neu',
    signOut: 'Abmelden',
    returnToDashboard: 'Zurück zum Dashboard',
    reviewPermissions: 'Berechtigungsmatrix prüfen',
    tenantIsolated: 'MANDANT ISOLIERT',
    invariantsGuarded: '100% Invarianten gesichert',
    current: 'Aktuell',
    upcoming: 'Kommend',
    archived: 'Archiviert',
  },

  navSections: {
    overview: 'Übersicht',
    administration: 'Verwaltung',
    admissionsAndStudents: 'Zulassung & Schüler',
    academics: 'Akademischer Betrieb',
    examinations: 'Prüfungen & Noten',
    financialSubledger: 'Finanz-Nebenbuch',
    campusFacilities: 'Campus-Einrichtungen',
  },

  navModules: {
    dashboard: {
      label: 'Dashboard & Systemstatus',
      desc: 'Mandantenkennzahlen, aktiver Kontext und Systemarchitektur',
    },
    rbac: {
      label: 'Rollen & Berechtigungen',
      desc: 'Detaillierte RBAC-Matrix und rollenbasierte Zugriffssteuerung',
    },
    academicYears: {
      label: 'Schuljahre & Sitzungen',
      desc: 'Aktuelle, kommende und archivierte Schuljahre verwalten',
    },
    admissions: {
      label: 'Zulassung & Einschreibung',
      desc: 'Verwaltung von Schülereinschreibungen, Versetzungen und Wiederholungen',
    },
    students: {
      label: 'Schülerverzeichnis',
      desc: 'Profile, Identitätsnachweise und Schülerakten',
    },
    promotions: {
      label: 'Klassenversetzung',
      desc: 'Jährliche Klassenübergänge und Schülereinstufungen',
    },
    classes: {
      label: 'Klassen & Gruppen',
      desc: 'Kapazitäten, Stundenplan-Slots und Raumzuteilung',
    },
    curriculum: {
      label: 'Fächer & Lehrpläne',
      desc: 'Lehrplan-Taxonomie, Lernziele und Unterrichtseinheiten',
    },
    attendance: {
      label: 'Tägliche Anwesenheit',
      desc: 'Klassenanwesenheit, QR-Tokens und lückenlose Prüfprotokolle',
    },
    homework: {
      label: 'Hausaufgaben & Aufgaben',
      desc: 'Aufgabenvergabe, Abgabenprüfung und Benotung',
    },
    exams: {
      label: 'Prüfungen & Zensuren',
      desc: 'Prüfungstermine, Fachprüfungen und Notenerfassung',
    },
    transcripts: {
      label: 'Zeugnisse & Berichte',
      desc: 'Rechtssichere, kryptografisch mit SHA-256 versiegelte Zeugnisse',
    },
    financeFees: {
      label: 'Gebührenstrukturen',
      desc: 'Schulgelder, Ermäßigungen und Mahngebührenregeln',
    },
    financeCashier: {
      label: 'Zahlkasse & Zahlungen',
      desc: 'Quittungserstellung, Zahlungsarten und Kassenabstimmung',
    },
    financeLedger: {
      label: 'Schüler-Gebührenbuch',
      desc: 'Unveränderlicher GAAP/IFRS-konformer Buchungsprüfpfad',
    },
    financePayroll: {
      label: 'Personalabrechnung',
      desc: 'Monatliche Gehaltsabrechnungen und Lohnüberweisungen',
    },
    library: {
      label: 'Bibliotheksausleihe',
      desc: 'Katalog, Buchexemplare, Ausleihen und Verzugsgebühren',
    },
    transport: {
      label: 'Fahrzeugflotte & Busrouten',
      desc: 'Fahrzeuge, Haltestellen und Fahrtencheckins der Schüler',
    },
    hostel: {
      label: 'Internat & Unterbringung',
      desc: 'Gebäude, Bettenbelegung, Anwesenheit und Besucherprotokolle',
    },
  },

  topbar: {
    selectSchool: 'Schule wählen',
    authorizedCampuses: 'Autorisierte Standorte',
    provisionNewSchool: 'Neue Schule anlegen',
    academicYear: 'Schuljahr',
    academicAnchors: 'Akademische Sitzungen',
    addAcademicSession: 'Schulsitzung hinzufügen',
    securityAndEntitlements: 'Sicherheit & Berechtigungen',
    signOutSession: 'Aus Sitzung abmelden',
    activeEntitlementScope: 'Aktiver Berechtigungsumfang',
    tenantIsolationKey: 'MANDANTEN-ISOLATIONSSCHLÜSSEL',
    grantedPermissions: 'Gewährte Berechtigungen',
    auditLogNotice: 'Audit-Protokollierung für alle sicherheitsrelevanten Vorgänge aktiv',
  },

  modals: {
    provisionSchoolTitle: 'Neue Schule bereitstellen',
    provisionSchoolSubtitle: 'Mandanten-Datenbank und RBAC-Rollen initialisieren',
    schoolName: 'Schulname',
    schoolNamePlaceholder: 'z.B. Internationale Schule Heidelberg',
    schoolCode: 'Schulcode (Mandantenschlüssel)',
    schoolCodePlaceholder: 'z.B. ISH-CAMPUS',
    customDomain: 'Eigene Domain (Optional)',
    customDomainPlaceholder: 'z.B. heidelberg.schoolnexa.com',
    createSchoolBtn: 'Schule erstellen',

    addYearTitle: 'Schuljahr hinzufügen',
    yearTitlePlaceholder: 'z.B. Schuljahr 2026-2027',
    yearCode: 'Sitzungscode',
    yearCodePlaceholder: 'z.B. AY-26-27',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    saveYearBtn: 'Schuljahr speichern',
  },

  dashboard: {
    systemMetricsAndHealth: 'Systemmetriken & Status',
    rbacMatrix: 'RBAC- & Berechtigungsmatrix',
    tenantBoundary: 'Mandantengrenze',
    tenantBoundaryDesc:
      'Geteilte Datenbank mit zusammengesetzten Schlüsseln [school_id, id], die unbefugte Datenabfragen blockieren.',
    academicAnchor: 'Akademischer Zeitanker',
    academicAnchorDesc: 'Alle Bildungsabläufe und Noten sind exakt an dieses Zeitfenster gebunden.',
    assignedRoles: 'Zugewiesene Rollen',
    assignedRolesDesc:
      'Bestimmt aus der Schulmitgliedschaft. Regelt Schnittstellen- und Maskenrechte.',
    invariantsTitle: 'Fundamentale Mandanten- & RBAC-Schutzregeln',
    inv1Title: '100% Fremdschlüsselprüfung auf Datenbankebene',
    inv1Desc:
      'Mit relationMode = "foreignKeys" erzwungen – alle Relationen werden direkt in InnoDB verifiziert.',
    inv2Title: 'Zusammengesetzte Mandanten-Beschränkungen',
    inv2Desc:
      'Untergeordnete Tabellen verweisen auf [schoolId, parentId] -> Parent([schoolId, id]) und verhindern Datenlecks.',
    inv3Title: 'Deterministische STORED-Eindeutigkeitsschlüssel',
    inv3Desc:
      'Emuliert partielle Indizes für aktive Schülerakten, Mitarbeiterkürzel und Klassenlehrer.',
    inv4Title: 'Unveränderliche Finanzbuch-Trigger',
    inv4Desc:
      'Verhindern UPDATE oder DELETE auf fee_ledger_entries und sichern eine lückenlose Rechnungslegung.',
  },

  rbac: {
    title: 'Rollen- & Berechtigungsmatrix',
    subtitle: 'Detaillierte Berechtigungen für Rollen dieses Schulmandanten',
    createCustomRole: 'Eigene Rolle anlegen',
    activeRoles: 'Aktive Rollen',
    permissionsForRole: 'Berechtigungen für',
    systemRoleNotice: 'Systemrollen sind unveränderlich geschützt und können nicht editiert werden',
    allModules: 'Alle Module',
    grantedPerms: 'Gewährte Berechtigungen',
    newRoleModalTitle: 'Eigene Rolle erstellen',
    newRoleModalSubtitle: 'Zugriffsrechte für diese Schule konfigurieren',
    roleName: 'Rollenbezeichnung',
    roleNamePlaceholder: 'z.B. Leitender Studienkoordinator',
    roleCode: 'Rollencode',
    roleCodePlaceholder: 'z.B. ROLE_ACADEMIC_SUPERVISOR',
    roleDescription: 'Beschreibung',
    roleDescriptionPlaceholder: 'Kurze Zusammenfassung der Rollenaufgaben...',
    editRole: 'Rolle bearbeiten',
    editRoleTitle: 'Rollendetails bearbeiten',
    deleteRole: 'Rolle löschen',
    deleteRoleTitle: 'Benutzerdefinierte Rolle löschen',
    confirmDeleteRoleText: 'Sind Sie sicher, dass Sie die Rolle dauerhaft löschen möchten',
    deleteRoleWarning:
      'Diese Aktion entzieht diese Rolle allen zugewiesenen Mitarbeitern und kann nicht rückgängig gemacht werden.',
    saving: 'Speichern...',
    deleting: 'Löschen...',
    roleCreatedSuccess: 'Rolle erfolgreich über API erstellt',
    roleUpdatedSuccess: 'Rolle erfolgreich über API aktualisiert',
    roleDeletedSuccess: 'Rolle erfolgreich über API gelöscht',
    permUpdatedSuccess: 'Berechtigungen erfolgreich über API aktualisiert',
  },

  auth: {
    erpPlatform: 'SchoolNexa ERP',
    erpPlatformSubtitle: 'Unternehmensweite Plattform zur Multi-Schul-Verwaltung',
    emailAddress: 'E-Mail-Adresse',
    password: 'Passwort',
    signInBtn: 'Authentifizieren & ERP öffnen',
    authenticating: 'Authentifizierung läuft...',
    demoProfiles: 'Schnellzugriff-Demokonten (Direktanmeldung)',
    demoHint:
      'Klicken Sie auf ein Testprofil, um die Anmeldedaten automatisch einzutragen und die Sitzung zu wechseln.',
  },

  modulesView: {
    moduleInitialized: 'Modul initialisiert',
    moduleInitializedDesc:
      'Alle Abfragen dieses Teilsystems übertragen automatisch die Mandanten-Header x-school-id und x-academic-year-id.',
    academicContext: 'Akademischer Kontext',
    authGate: 'Berechtigungsprüfung',
    publicModule: 'Öffentliches Modul',
  },

  actions: {
    manage: 'Verwalten',
    create: 'Erstellen',
    edit: 'Bearbeiten',
    view: 'Anzeigen',
    publish: 'Veröffentlichen',
    collect: 'Einziehen',
  },
};
