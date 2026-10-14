import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  FileText,
  UploadCloud,
  Check,
  X,
  Info,
  Users,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { StudentFormData, Guardian } from '../types';
import {
  SPECIAL_NEED_CATEGORIES,
  STUDENT_STATUS,
  BLOOD_GROUPS,
  GENDERS,
  isSpecialNeedActive,
} from '@/config/Options';
import { StudentAvatar } from './StudentAvatar';
import { GuardianList } from './GuardianList';
import { GuardianModal } from './GuardianModal';
import { useTheme } from '@/context/ThemeContext';

interface StudentFormProps {
  initialData?: Partial<StudentFormData> & { studentCode?: string };
  isEdit?: boolean;
  onSubmit: (data: StudentFormData) => void;
  onCancel?: () => void;
}

const DEFAULT_FORM_DATA: StudentFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  photoUrl: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  specialCategory: 'N',
  specialCategoryDetails: '',
  nationality: 'Indian',
  religion: '',
  category: '',
  motherTongue: '',
  placeOfBirth: '',
  governmentId: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  guardians: [],
  previousSchool: '',
  previousClass: '',
  previousSchoolBoard: '',
  transferCertificateNumber: '',
  transferCertificateDate: '',
  notes: '',
  status: 'ACTIVE',
};

const INTIAL_STATE_DEMO = {
  id: 'c231d3c6-7363-4f2a-a52d-69ed3ff1246e',
  schoolId: 'school-horizon-03',
  studentIdentityId: 'dad27c57-3cb6-48ed-b013-f89b457eab83',
  userId: null,
  admissionNumber: 'ADM-2026-7058',
  activeAdmissionNumber: null,
  registrationId: 'REG-2026-48336',
  firstName: 'Radha',
  middleName: 'Rani',
  lastName: 'Verma',
  fullName: 'Radha Rani Verma',
  photoUrl:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWml9psKxL-Iue24ZCavhccPGHmShASKvpY6qeK-7CRlh9DeOY-8EZOYw&s=10',
  gender: 'FEMALE',
  dateOfBirth: '1990-01-01',
  bloodGroup: 'O+',
  specialCategory: 'HEARING_SPEECH',
  specialCategoryDetails: '30% Leg',
  nationality: 'Indian',
  religion: 'Hinduism',
  category: 'General',
  motherTongue: 'Punjabi',
  placeOfBirth: 'Barnala',
  governmentId: 'AD 1234-2345-1123',
  mobile: '02323232323',
  alternateMobile: '02323232323',
  email: 'studentradha@student.schoolnexa',
  address: 'Flat no 156 , 1st floor, Tower no. 8, Sector No 115, City of Dream SBP colony',
  addressLine1: 'Flat no 156 , 1st floor, Tower no. 8',
  addressLine2: 'Sector No 115, City of Dream SBP colony',
  city: 'Sante Majra , Kharar (Punjab)',
  state: 'Punjab',
  country: 'India',
  postalCode: '140307',
  previousSchool: 'Govt Primary School',
  previousClass: 'Class 5',
  previousSchoolBoard: 'PSEB',
  transferCertificateNumber: 'TC-SKD-1234-44',
  transferCertificateDate: '2026-09-01',
  notes: 'Hello Additional Note',
  emergencyContact: 'Satnam Singh Bhullar',
  emergencyPhone: '02323232323',
  status: 'ACTIVE',
  deletedAt: null,
  createdAt: '2026-09-21T08:00:47.318Z',
  updatedAt: '2026-09-21T08:00:47.318Z',
  identity: {
    id: 'dad27c57-3cb6-48ed-b013-f89b457eab83',
    nationalId: 'AD 1234-2345-1123',
    idType: 'NATIONAL_ID',
    birthCertNo: null,
    nationality: 'Indian',
    countryOfBirth: 'India',
    verifiedAt: null,
  },
  currentEnrollment: null,
  guardians: [
    {
      id: '443c7036-66c5-482d-a83e-b53699fe58f9',
      parentId: '5092d6fd-1bfa-41ee-bb49-cc9d7c09b38a',
      relationship: 'FATHER',
      isPrimaryContact: true,
      canPickup: true,
      parent: {
        id: '5092d6fd-1bfa-41ee-bb49-cc9d7c09b38a',
        primaryPhone: '02323232323',
        alternatePhone: '01123456789',
        occupation: null,
        annualIncome: null,
        currentAddress:
          'Flat no 156 , 1st floor, Tower no. 8, Sante Majra , Kharar (Punjab), Punjab, India, 140307',
        permanentAddress:
          'Flat no 156 , 1st floor, Tower no. 8, Sante Majra , Kharar (Punjab), Punjab, India, 140307',
        emergencyContact: 'Satnam Singh Bhullar',
        emergencyPhone: '02323232323',
        user: {
          id: 'b74cfd74-4d32-46fc-a830-d99bf8772fcd',
          fullName: 'Satnam Singh Bhullar',
          email: 'guardian@student.schoolnexa',
        },
      },
    },
  ],
  enrollments: [],
  documents: [],
  transferCertificates: [],
};
export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<StudentFormData>(() => {
    const rawCategory = initialData?.specialCategory;
    const resolvedCategory = rawCategory
      ? SPECIAL_NEED_CATEGORIES.find((c) => c.id === rawCategory || c.label === rawCategory)?.id ||
        rawCategory
      : 'N';
    return {
      ...DEFAULT_FORM_DATA,
      ...initialData,
      specialCategory: resolvedCategory,
      guardians: initialData?.guardians || [],
    };
  });

  useEffect(() => {
    if (initialData) {
      const rawCategory = initialData.specialCategory;
      const resolvedCategory = rawCategory
        ? SPECIAL_NEED_CATEGORIES.find((c) => c.id === rawCategory || c.label === rawCategory)
            ?.id || rawCategory
        : 'N';
      setFormData({
        ...DEFAULT_FORM_DATA,
        ...initialData,
        specialCategory: resolvedCategory,
        guardians: initialData.guardians || [],
      });
    }
  }, [initialData]);

  const [validated, setValidated] = useState(false);

  // Guardian Modal State
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  // Field change helper
  const handleChange = (field: keyof StudentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Guardian Management handlers
  const handleOpenAddGuardian = () => {
    setEditingGuardian(null);
    setShowGuardianModal(true);
  };

  const handleOpenEditGuardian = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setShowGuardianModal(true);
  };

  const handleRemoveGuardian = (guardianId: string) => {
    setFormData((prev) => ({
      ...prev,
      guardians: prev.guardians.filter((g) => g.id !== guardianId),
    }));
  };

  const handleSaveGuardian = (guardian: Guardian) => {
    setFormData((prev) => {
      let updatedGuardians = [...prev.guardians];
      const existingIndex = updatedGuardians.findIndex((g) => g.id === guardian.id);

      // If set as primary guardian, update other guardians to not be primary
      if (guardian.isPrimary) {
        updatedGuardians = updatedGuardians.map((g) => ({
          ...g,
          isPrimary: false,
        }));
      }

      if (existingIndex >= 0) {
        updatedGuardians[existingIndex] = guardian;
      } else {
        // If this is the first guardian, make it primary by default if none exists
        if (updatedGuardians.length === 0 && !guardian.isPrimary) {
          guardian.isPrimary = true;
        }
        updatedGuardians.push(guardian);
      }

      return {
        ...prev,
        guardians: updatedGuardians,
      };
    });
  };

  // Validation flags
  const isFirstNameInvalid = validated && !formData.firstName.trim();
  const isDobInvalid = validated && !formData.dateOfBirth;
  const isGenderInvalid = validated && !formData.gender;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);

    if (!formData.firstName.trim() || !formData.dateOfBirth || !formData.gender) {
      return;
    }

    onSubmit(formData);
  };

  const handleDefaultCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/students');
    }
  };

  const previewName = `${formData.firstName || 'Student'} ${formData.lastName || ''}`.trim();

  return (
    <>
      <Form noValidate onSubmit={handleSubmit}>
        {/* SECTION 1: Basic Information */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 font-semibold">
                <User size={16} className="text-primary" />
                <span>Section 1: Basic Information</span>
              </div>
              {isEdit && initialData?.studentCode ? (
                <div className="d-flex align-items-center gap-1.5 small text-muted">
                  <span>Student Code:</span>
                  <Badge bg="secondary" className="font-monospace">
                    {initialData.studentCode}
                  </Badge>
                </div>
              ) : null}
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            {/* Auto-generated Student Code Notice for Student Creation */}
            {!isEdit && (
              <Alert
                variant="info"
                className={`py-2 px-3 small d-flex align-items-center gap-2 mb-4 ${
                  isDark ? 'bg-info bg-opacity-10 border-info border-opacity-25 text-info' : ''
                }`}
              >
                <ShieldCheck size={16} className="flex-shrink-0" />
                <div>
                  <strong>System Notice:</strong> Student Code will be generated automatically.
                  Admission Number and Class Enrollment are assigned during the separate Admission
                  process.
                </div>
              </Alert>
            )}

            {/* Photo Preview & URL */}
            <Row className="g-3 align-items-center mb-3 pb-2.5 border-bottom border-light-subtle">
              <Col xs={12} sm={4} md={3} className="text-center text-sm-start">
                <div className="d-inline-flex flex-column align-items-center">
                  <StudentAvatar
                    name={previewName}
                    photoUrl={formData.photoUrl}
                    size="xl"
                    className="mb-2 shadow-sm"
                  />
                  <div className="small font-medium text-muted">Student Photo</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    JPG or PNG (max 2MB)
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={8} md={9}>
                <Form.Group controlId="studentPhoto" className="mb-2.5">
                  <Form.Label className="small font-medium text-muted mb-1">
                    Photo URL or Sample
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.photoUrl}
                      onChange={(e) => handleChange('photoUrl', e.target.value)}
                      className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    />
                    <Button
                      variant={isDark ? 'outline-secondary' : 'outline-primary'}
                      size="sm"
                      className="d-inline-flex align-items-center gap-1 flex-shrink-0"
                      type="button"
                      onClick={() => {
                        handleChange(
                          'photoUrl',
                          formData.photoUrl
                            ? ''
                            : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
                        );
                      }}
                    >
                      <UploadCloud size={14} />
                      <span>{formData.photoUrl ? 'Clear' : 'Sample'}</span>
                    </Button>
                  </div>
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Paste a direct image URL or leave blank to use the initials avatar.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Basic Info Fields */}
            <Row className="g-2.5">
              <Col xs={12} md={4}>
                <Form.Group controlId="firstName" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    isInvalid={isFirstNameInvalid}
                    isValid={validated && !!formData.firstName.trim()}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    First name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="middleName" className="mb-2.5">
                  <Form.Label className="small font-medium">Middle Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Kumar"
                    value={formData.middleName}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="lastName" className="mb-2.5">
                  <Form.Label className="small font-medium">Last Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="dateOfBirth" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Date of Birth <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    isInvalid={isDobInvalid}
                    isValid={validated && !!formData.dateOfBirth}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Date of birth is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="gender" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Gender <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    isInvalid={isGenderInvalid}
                    isValid={validated && !!formData.gender}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    required
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Gender selection is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="bloodGroup" className="mb-2.5">
                  <Form.Label className="small font-medium">Blood Group</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg.id} value={bg.id}>
                        {bg.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Special Category / Disability / Disease - Placed right after Blood Group */}
              <Col xs={12} md={3}>
                <Form.Group controlId="specialCategory" className="mb-2.5">
                  <Form.Label
                    className="small font-medium text-truncate d-block"
                    title="Special Category (Handicap / Disability / Specific Disease)"
                  >
                    Special / Disability Category
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.specialCategory}
                    onChange={(e) => handleChange('specialCategory', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  >
                    {SPECIAL_NEED_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Conditional Specific Condition / Disability Details */}
              {isSpecialNeedActive(formData.specialCategory) && (
                <Col xs={12}>
                  <Form.Group controlId="specialCategoryDetails" className="mb-2.5">
                    <Form.Label className="small font-medium">
                      Disability / Specific Disease Details (Optional)
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="e.g. 40% Locomotor Disability, Type 1 Diabetes, Asthma (requires inhaler), Wheelchair access"
                      value={formData.specialCategoryDetails}
                      onChange={(e) => handleChange('specialCategoryDetails', e.target.value)}
                      className={isDark ? 'bg-dark text-white border-secondary' : ''}
                    />
                    <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                      Mention medical details, assistive equipment, or accommodation needs if
                      applicable.
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

              <Col xs={12} md={3}>
                <Form.Group controlId="nationality" className="mb-2.5">
                  <Form.Label className="small font-medium">Nationality</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Indian"
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="religion" className="mb-2.5">
                  <Form.Label className="small font-medium">Religion</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Hinduism, Islam, Christianity"
                    value={formData.religion}
                    onChange={(e) => handleChange('religion', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={2}>
                <Form.Group controlId="category" className="mb-2.5">
                  <Form.Label className="small font-medium">Category</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={2}>
                <Form.Group controlId="motherTongue" className="mb-2.5">
                  <Form.Label className="small font-medium">Mother Tongue</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Hindi, English"
                    value={formData.motherTongue}
                    onChange={(e) => handleChange('motherTongue', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={2}>
                <Form.Group controlId="placeOfBirth" className="mb-2.5">
                  <Form.Label className="small font-medium">Place of Birth</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 2: Personal Information / Identification */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <Info size={16} className="text-primary" />
              <span>Section 2: Personal Information & Identification</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <Row className="g-2.5">
              <Col xs={12} md={6}>
                <Form.Group controlId="governmentId" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Government ID Number / National ID (e.g. Aadhaar)
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. 1234-5678-9012"
                    value={formData.governmentId}
                    onChange={(e) => handleChange('governmentId', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Permanent citizen/national identification reference.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 3: Contact Information */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <Phone size={16} className="text-primary" />
              <span>Section 3: Contact Information</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <Row className="g-2.5">
              <Col xs={12} md={4}>
                <Form.Group controlId="mobile" className="mb-2.5">
                  <Form.Label className="small font-medium">Student Mobile Number</Form.Label>
                  <Form.Control
                    size="sm"
                    type="tel"
                    placeholder="e.g. 9820144521"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="alternateMobile" className="mb-2.5">
                  <Form.Label className="small font-medium">Alternate Mobile</Form.Label>
                  <Form.Control
                    size="sm"
                    type="tel"
                    placeholder="e.g. 9820144522"
                    value={formData.alternateMobile}
                    onChange={(e) => handleChange('alternateMobile', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="email" className="mb-2.5">
                  <Form.Label className="small font-medium">Student Email Address</Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    placeholder="e.g. student@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 4: Address */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <MapPin size={16} className="text-primary" />
              <span>Section 4: Address</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <Row className="g-2.5">
              <Col xs={12} md={6}>
                <Form.Group controlId="addressLine1" className="mb-2.5">
                  <Form.Label className="small font-medium">Address Line 1</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="House / Flat No., Building Name, Street"
                    value={formData.addressLine1}
                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="addressLine2" className="mb-2.5">
                  <Form.Label className="small font-medium">Address Line 2</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Locality, Sector, Landmark"
                    value={formData.addressLine2}
                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="city" className="mb-2.5">
                  <Form.Label className="small font-medium">City</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="state" className="mb-2.5">
                  <Form.Label className="small font-medium">State</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Delhi, Maharashtra"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="country" className="mb-2.5">
                  <Form.Label className="small font-medium">Country</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. India"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="postalCode" className="mb-2.5">
                  <Form.Label className="small font-medium">Postal Code</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. 110085"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 5: Parent / Guardian Information */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <Users size={16} className="text-primary" />
              <span>Section 5: Parent / Guardian Information</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <GuardianList
              guardians={formData.guardians}
              onAddClick={handleOpenAddGuardian}
              onEditClick={handleOpenEditGuardian}
              onRemoveClick={handleRemoveGuardian}
            />
          </Card.Body>
        </Card>

        {/* SECTION 6: Previous School / Background (Optional) */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <Building2 size={16} className="text-primary" />
              <span>Section 6: Previous School / Background (Optional)</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <Row className="g-2.5">
              <Col xs={12} md={4}>
                <Form.Group controlId="previousSchool" className="mb-2.5">
                  <Form.Label className="small font-medium">Previous School Name</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Delhi Public Preparatory"
                    value={formData.previousSchool}
                    onChange={(e) => handleChange('previousSchool', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="previousClass" className="mb-2.5">
                  <Form.Label className="small font-medium">Previous Class</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. Class 4"
                    value={formData.previousClass}
                    onChange={(e) => handleChange('previousClass', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="previousSchoolBoard" className="mb-2.5">
                  <Form.Label className="small font-medium">Previous Board</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. CBSE, ICSE, State Board"
                    value={formData.previousSchoolBoard}
                    onChange={(e) => handleChange('previousSchoolBoard', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="transferCertificateNumber" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Transfer Certificate (TC) Number
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="e.g. TC-DEL-2026-891"
                    value={formData.transferCertificateNumber}
                    onChange={(e) => handleChange('transferCertificateNumber', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="transferCertificateDate" className="mb-2.5">
                  <Form.Label className="small font-medium">TC Date</Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={formData.transferCertificateDate}
                    onChange={(e) => handleChange('transferCertificateDate', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 7: Additional Information */}
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border mb-3 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-2.5 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <FileText size={16} className="text-primary" />
              <span>Section 7: Additional Information</span>
            </div>
          </Card.Header>
          <Card.Body className="p-3 sm:p-3.5">
            <Row className="g-2.5">
              <Col xs={12} md={8}>
                <Form.Group controlId="notes" className="mb-2.5">
                  <Form.Label className="small font-medium">
                    Medical Notes / Allergies / Remarks
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Any health allergies, extracurricular interests, or special instructions..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="status" className="mb-2.5">
                  <Form.Label className="small font-medium">Student Status</Form.Label>
                  <Form.Select
                    size="sm"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as any)}
                    className={isDark ? 'bg-dark text-white border-secondary' : ''}
                  >
                    {STUDENT_STATUS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Active students appear in all standard school directories.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Action Controls */}
        <div className="d-flex align-items-center justify-content-end gap-2 pt-1 pb-3">
          <Button
            variant="outline-secondary"
            size="sm"
            type="button"
            onClick={handleDefaultCancel}
            className="d-inline-flex align-items-center gap-1.5 px-3"
          >
            <X size={15} />
            <span>Cancel</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            className="d-inline-flex align-items-center gap-1.5 px-4 shadow-sm"
          >
            <Check size={15} />
            <span>{isEdit ? 'Save Changes' : 'Save Student'}</span>
          </Button>
        </div>
      </Form>

      {/* Reusable Guardian Modal */}
      <GuardianModal
        show={showGuardianModal}
        onHide={() => setShowGuardianModal(false)}
        onSave={handleSaveGuardian}
        initialGuardian={editingGuardian}
        studentAddress={{
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        }}
      />
    </>
  );
};
