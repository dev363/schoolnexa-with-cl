import { TranslationSchema } from '../types';

export const hi: TranslationSchema = {
  common: {
    appName: 'स्कूलनेक्सा',
    appTagline: 'एंटरप्राइज मल्टी-स्कूल मैनेजमेंट सास प्लेटफ़ॉर्म',
    loading: 'लोड हो रहा है...',
    initializing: 'मल्टी-टेनेंट स्कूल संदर्भ प्रारंभ हो रहा है...',
    save: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    create: 'बनाएं',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    manage: 'प्रबंधित करें',
    publish: 'प्रकाशित करें',
    collect: 'वसूली करें',
    close: 'बंद करें',
    filter: 'फ़िल्टर',
    all: 'सभी',
    unread: 'अपठित',
    search: 'खोजें...',
    active: 'सक्रिय',
    status: 'स्थिति',
    actions: 'क्रियाएँ',
    date: 'दिनांक',
    system: 'सिस्टम',
    tenant: 'संस्थान (टेनेंट)',
    session: 'सत्र',
    superAdmin: 'ग्लोबल व्यवस्थापक',
    member: 'सदस्य',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    new: 'नया',
    signOut: 'साइन आउट',
    returnToDashboard: 'डैशबोर्ड पर लौटें',
    reviewPermissions: 'अनुमतियों की समीक्षा करें',
    tenantIsolated: 'सुरक्षित पृथक संस्थान',
    invariantsGuarded: '100% सुरक्षा नियम सत्यापित',
    current: 'वर्तमान',
    upcoming: 'आगामी',
    archived: 'अभिलेखागार',
  },

  navSections: {
    overview: 'अवलोकन',
    administration: 'प्रशासन एवं नियंत्रण',
    admissionsAndStudents: 'प्रवेश एवं छात्र',
    academics: 'शैक्षणिक कार्यप्रणाली',
    examinations: 'परीक्षा एवं परिणाम',
    financialSubledger: 'वित्तीय सबलेजर एवं शुल्क',
    campusFacilities: 'परिसर सुविधाएं',
  },

  navModules: {
    dashboard: {
      label: 'डैशबोर्ड एवं सिस्टम स्थिति',
      desc: 'संस्थान मेट्रिक्स, सक्रिय सत्र एवं सुरक्षित बहु-स्तरीय वास्तुकला',
    },
    rbac: {
      label: 'भूमिकाएं एवं अनुमतियां (RBAC)',
      desc: 'विस्तृत भूमिका-आधारित पहुंच नियंत्रण और कस्टम अधिकार आवंटन',
    },
    academicYears: {
      label: 'शैक्षणिक सत्र',
      desc: 'वर्तमान, आगामी और संग्रहीत शैक्षणिक वर्षों का प्रबंधन',
    },
    admissions: {
      label: 'प्रवेश एवं नामांकन',
      desc: 'छात्र नामांकन, पदोन्नति, स्थानांतरण और पुनरावृत्ति प्रबंधन',
    },
    students: {
      label: 'छात्र निर्देशिका',
      desc: 'विद्यार्थी प्रोफ़ाइल, पहचान प्रमाण एवं छात्र रिकॉर्ड',
    },
    promotions: {
      label: 'कक्षा पदोन्नति (प्रमोशन)',
      desc: 'वार्षिक कक्षा रोलओवर और छात्रों का सामूहिक उन्नयन',
    },
    classes: {
      label: 'कक्षाएं एवं अनुभाग (सेक्शन)',
      desc: 'कक्षा क्षमता, समय सारिणी स्लॉट और कमरे का आवंटन',
    },
    curriculum: {
      label: 'विषय एवं पाठ्यक्रम',
      desc: 'पाठ्यक्रम संरचना, सीखने के लक्ष्य और शैक्षणिक इकाइयां',
    },
    attendance: {
      label: 'दैनिक उपस्थिति',
      desc: 'कक्षा उपस्थिति रजिस्टर, क्यूआर टोकन और ऑडिट रिकॉर्ड',
    },
    homework: {
      label: 'गृहकार्य एवं कार्यभार',
      desc: 'असाइनमेंट आवंटन, सबमिशन जांच और ग्रेडिंग',
    },
    exams: {
      label: 'परीक्षा एवं अंक तालिका',
      desc: 'परीक्षा समय सारिणी, प्रश्न पत्र और प्राप्तांक प्रविष्टि',
    },
    transcripts: {
      label: 'प्रगति पत्रक (रिपोर्ट कार्ड)',
      desc: 'SHA-256 सुरक्षित, डिजिटल रूप से प्रमाणित आधिकारिक रिपोर्ट कार्ड',
    },
    financeFees: {
      label: 'शुल्क संरचना एवं घटक',
      desc: 'ट्यूशन स्लैब, छूट नीतियां एवं विलंब दंड नियम',
    },
    financeCashier: {
      label: 'कैशियर एवं भुगतान काउंटर',
      desc: 'रसीद जारी करना, भुगतान माध्यम और दैनिक समाधान',
    },
    financeLedger: {
      label: 'छात्र शुल्क सबलेजर',
      desc: 'अपरिवर्तनीय GAAP/IFRS प्रमाणित पारदर्शी खाता बही',
    },
    financePayroll: {
      label: 'कर्मचारी वेतन (पेरोल)',
      desc: 'मासिक वेतन गणना, भत्ते और वेतन पर्ची वितरण',
    },
    library: {
      label: 'पुस्तकालय संचालन',
      desc: 'पुस्तक सूची, भौतिक प्रतियां, ऋण एवं विलंब शुल्क निगरानी',
    },
    transport: {
      label: 'वाहन बेड़ा एवं बस मार्ग',
      desc: 'स्कूल वाहन, स्टॉप मार्ग और छात्रों की यात्रा निगरानी',
    },
    hostel: {
      label: 'छात्रावास एवं आवास',
      desc: 'ब्लॉक, बिस्तर आवंटन, उपस्थिति एवं आगंतुक रजिस्टर',
    },
  },

  topbar: {
    selectSchool: 'विद्यालय चुनें',
    authorizedCampuses: 'अधिकृत विद्यालय परिसर',
    provisionNewSchool: 'नया विद्यालय जोड़ें',
    academicYear: 'शैक्षणिक वर्ष',
    academicAnchors: 'सक्रिय शैक्षणिक सत्र',
    addAcademicSession: 'नया शैक्षणिक सत्र जोड़ें',
    securityAndEntitlements: 'सुरक्षा एवं अधिकार',
    signOutSession: 'वर्तमान सत्र से लॉग आउट करें',
    activeEntitlementScope: 'सक्रिय अनुमतियों का दायरा',
    tenantIsolationKey: 'विद्यालय पृथक्करण कुंजी (Tenant Key)',
    grantedPermissions: 'प्रदत्त अनुमतियां',
    auditLogNotice: 'सभी उच्च-जोखिम कार्यों के लिए स्वचालित ऑडिट लॉगिंग सक्रिय है',
  },

  modals: {
    provisionSchoolTitle: 'नया विद्यालय परिसर जोड़ें',
    provisionSchoolSubtitle: 'नया टेनेंट डेटाबेस और डिफ़ॉल्ट भूमिकाएं बनाएं',
    schoolName: 'विद्यालय का नाम',
    schoolNamePlaceholder: 'उदा. कैम्ब्रिज इंटरनेशनल स्कूल',
    schoolCode: 'स्कूल कोड (टेनेंट कुंजी)',
    schoolCodePlaceholder: 'उदा. CAM-HIGH',
    customDomain: 'कस्टम डोमेन (वैकल्पिक)',
    customDomainPlaceholder: 'उदा. cambridge.schoolnexa.com',
    createSchoolBtn: 'विद्यालय बनाएं',

    addYearTitle: 'नया शैक्षणिक सत्र जोड़ें',
    yearTitlePlaceholder: 'उदा. शैक्षणिक सत्र 2026-2027',
    yearCode: 'सत्र कोड',
    yearCodePlaceholder: 'उदा. AY-26-27',
    startDate: 'आरंभ तिथि',
    endDate: 'समाप्ति तिथि',
    saveYearBtn: 'शैक्षणिक सत्र सहेजें',
  },

  dashboard: {
    systemMetricsAndHealth: 'सिस्टम मेट्रिक्स एवं स्थिति',
    rbacMatrix: 'भूमिकाएं एवं अनुमतियां मैट्रिक्स (RBAC)',
    tenantBoundary: 'टेनेंट सुरक्षा सीमा',
    tenantBoundaryDesc:
      'साझा डेटाबेस में समग्र कुंजी [school_id, id] जो किसी भी क्रॉस-स्कूल डेटा मिलान को रोकती है।',
    academicAnchor: 'शैक्षणिक आधार',
    academicAnchorDesc:
      'सभी छात्र प्रगति रिकॉर्ड और शैक्षणिक संचालन इस समय-सीमा के अंतर्गत सुरक्षित हैं।',
    assignedRoles: 'प्रदत्त भूमिकाएं',
    assignedRolesDesc:
      'उपयोगकर्ता सदस्यता से निर्धारित, जो स्क्रीन नियंत्रण और एपीआई सुरक्षा तय करती हैं।',
    invariantsTitle: 'प्रमुख बहु-टेनेंट एवं RBAC सुरक्षा नियम',
    inv1Title: 'रिलेशनल इंजन में 100% फॉरेन की (Foreign Keys)',
    inv1Desc:
      'InnoDB स्तर पर सभी संबंधों की वैधता अनिवार्य है, जिससे डेटा अखंडता अक्षुण्ण रहती है।',
    inv2Title: 'समग्र टेनेंट स्कोपिंग (Composite Constraints)',
    inv2Desc:
      'आश्रित रिकॉर्ड स्कूल आईडी से जुड़े होते हैं जिससे अन्य स्कूल के डेटा का उपयोग असंभव है।',
    inv3Title: 'डिटरमिनिस्टिक स्टोर्ड यूनिक कीज़ (STORED)',
    inv3Desc: 'सक्रिय प्रवेश, कर्मचारी कोड और शिक्षकों के लिए सटीक आंशिक सूचकांक अनुकरण।',
    inv4Title: 'अपरिवर्तनीय वित्तीय सबलेजर ट्रिगर्स',
    inv4Desc:
      'लेजर प्रविष्टियों पर UPDATE या DELETE को रोकते हैं ताकि वित्तीय रिकॉर्ड में कोई छेड़छाड़ न हो।',
  },

  rbac: {
    title: 'भूमिकाएं एवं अधिकार मैट्रिक्स',
    subtitle: 'इस विद्यालय के लिए विभिन्न भूमिकाओं को आवंटित विस्तृत अनुमतियां',
    createCustomRole: 'कस्टम भूमिका बनाएं',
    activeRoles: 'सक्रिय भूमिकाएं',
    permissionsForRole: 'अनुमतियां इसके लिए:',
    systemRoleNotice: 'सिस्टम की मूलभूत भूमिकाएं संरक्षित हैं और उन्हें बदला नहीं जा सकता',
    allModules: 'सभी मॉड्यूल',
    grantedPerms: 'स्वीकृत अनुमतियां',
    newRoleModalTitle: 'कस्टम भूमिका जोड़ें',
    newRoleModalSubtitle: 'संस्थान के अनुसार विशेष अनुमतियां परिभाषित करें',
    roleName: 'भूमिका का नाम',
    roleNamePlaceholder: 'उदा. वरिष्ठ शैक्षणिक समन्वयक',
    roleCode: 'भूमिका कोड',
    roleCodePlaceholder: 'उदा. ROLE_ACADEMIC_SUPERVISOR',
    roleDescription: 'विवरण',
    roleDescriptionPlaceholder: 'भूमिका की जिम्मेदारियों का संक्षिप्त सारांश...',
    editRole: 'भूमिका संपादित करें',
    editRoleTitle: 'भूमिका विवरण संपादित करें',
    deleteRole: 'भूमिका हटाएं',
    deleteRoleTitle: 'कस्टम भूमिका हटाएं',
    confirmDeleteRoleText: 'क्या आप वाकई भूमिका को स्थायी रूप से हटाना चाहते हैं',
    deleteRoleWarning:
      'यह क्रिया सभी संबंधित कर्मचारियों से यह भूमिका रद्द कर देगी और इसे पूर्ववत नहीं किया जा सकता।',
    saving: 'सहेजा जा रहा है...',
    deleting: 'हटाया जा रहा है...',
    roleCreatedSuccess: 'एपीआई के माध्यम से भूमिका सफलतापूर्वक बनाई गई',
    roleUpdatedSuccess: 'एपीआई के माध्यम से भूमिका सफलतापूर्वक अपडेट की गई',
    roleDeletedSuccess: 'एपीआई के माध्यम से भूमिका सफलतापूर्वक हटाई गई',
    permUpdatedSuccess: 'एपीआई के माध्यम से अनुमतियां सफलतापूर्वक अपडेट की गईं',
  },

  auth: {
    erpPlatform: 'स्कूलनेक्सा ईआरपी',
    erpPlatformSubtitle: 'एंटरप्राइज मल्टी-स्कूल मैनेजमेंट प्लेटफ़ॉर्म',
    emailAddress: 'ईमेल पता',
    password: 'पासवर्ड',
    signInBtn: 'सत्यापित करें एवं प्रवेश करें',
    authenticating: 'पहचान सत्यापित हो रही है...',
    demoProfiles: 'त्वरित डेमो खाते (एक क्लिक में लॉगिन)',
    demoHint: 'क्रेडेंशियल स्वतः भरने और टेनेंट सत्र बदलने के लिए किसी भी डेमो खाते पर क्लिक करें।',
  },

  modulesView: {
    moduleInitialized: 'मॉड्यूल सक्रिय हो गया',
    moduleInitializedDesc:
      'इस सब-सिस्टम के सभी अनुरोधों में स्वचालित रूप से x-school-id और x-academic-year-id हेडर शामिल होते हैं।',
    academicContext: 'शैक्षणिक संदर्भ',
    authGate: 'प्राधिकार सुरक्षा गेट',
    publicModule: 'सार्वजनिक मॉड्यूल',
  },

  actions: {
    manage: 'प्रबंधित करें',
    create: 'बनाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    publish: 'प्रकाशित करें',
    collect: 'वसूली करें',
  },
};
