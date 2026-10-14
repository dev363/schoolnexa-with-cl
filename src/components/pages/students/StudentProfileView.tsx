import React, { useState, useEffect } from 'react';
import { Card, Nav, Row, Col, Alert, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Phone,
  FileText,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Building2,
  GraduationCap,
} from 'lucide-react';
import {
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  mapDtoToStudentItem,
} from '@/store/students';
import { StudentProfileHeader } from './components/StudentProfileHeader';
import { StudentStatusBadge } from './components/StudentStatusBadge';
import { GuardianList } from './components/GuardianList';
import { GuardianModal } from './components/GuardianModal';
import { Guardian, StudentItem } from './types';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { SPECIAL_NEED_CATEGORIES, getOptionLabel, isSpecialNeedActive } from '@/config/Options';

export const StudentProfileView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const [student, setStudent] = useState<StudentItem | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'personal' | 'guardians' | 'contact' | 'admission'
  >('overview');
  const [showCreatedAlert, setShowCreatedAlert] = useState(
    Boolean((location.state as any)?.justCreated),
  );

  // Guardian Modal State for adding/editing directly from profile
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  const {
    data: rtkStudentData,
    isLoading: isRtkLoading,
    isError: isRtkError,
    refetch: refetchStudent,
  } = useGetStudentByIdQuery(studentId || '', { skip: !studentId });
  const [updateStudentMutation] = useUpdateStudentMutation();

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkStudentData) {
      const raw = rtkStudentData.data || rtkStudentData;
      if (raw && raw.id) {
        setStudent(raw.studentId && raw.admissionNumber ? mapDtoToStudentItem(raw) : raw);
      }
    }
  }, [rtkStudentData]);

  const isLoading = isRtkLoading && !student;
  const hasError = isRtkError && !student;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" className="mb-2" />
        <div className="text-muted small">Loading student profile...</div>
      </div>
    );
  }

  if (hasError || !student) {
    return (
      <div
        className={`p-5 text-center rounded border ${
          isDark ? 'bg-dark border-secondary text-white' : 'bg-white border-light-subtle shadow-sm'
        }`}
      >
        <AlertCircle size={32} className="text-danger mb-2" />
        <h2 className="h6 fw-semibold text-danger">Student not found.</h2>
        <p className="text-muted small mb-3">The requested student profile could not be loaded.</p>
        <div className="d-flex justify-content-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate('/students')}
            className="d-inline-flex align-items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Students</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => refetchStudent()}
            className="d-inline-flex align-items-center gap-1"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  const fullName =
    `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.trim();
  const hasAdmission = student.hasActiveAdmission && Boolean(student.admissionNumber);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      case 'OTHER':
        return 'Other';
      default:
        return gender;
    }
  };

  const formatAdmissionType = (type?: string) => {
    if (!type) return '—';
    switch (type) {
      case 'REGULAR':
        return 'Regular Admission';
      case 'TRANSFER':
        return 'Transfer Student';
      case 'MANAGEMENT':
        return 'Management Quota';
      case 'DIRECT':
        return 'Direct Admission';
      case 'SCHOLARSHIP':
        return 'Scholarship Seat';
      case 'OTHER':
        return 'Other';
      default:
        return type;
    }
  };

  // Primary and Emergency guardians
  const primaryGuardian = student.guardians?.find((g) => g.isPrimary) || student.guardians?.[0];
  const emergencyGuardian = student.guardians?.find((g) => g.isEmergencyContact);

  const handleCreateAdmission = () => {
    // SchoolNexa Admission workflow trigger
    alert(
      `Starting Admission placement for ${fullName} (${student.studentCode}). The Admission Module will assign Academic Year, Class, Section, and Admission Number.`,
    );
  };

  const handleOpenAddGuardian = () => {
    setEditingGuardian(null);
    setShowGuardianModal(true);
  };

  const handleOpenEditGuardian = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setShowGuardianModal(true);
  };

  const handleRemoveGuardian = async (guardianId: string) => {
    const updatedGuardians = (student.guardians || []).filter((g) => g.id !== guardianId);
    try {
      const res = await updateStudentMutation({
        studentId: student.id,
        data: { guardians: updatedGuardians },
      }).unwrap();
      const updated = res?.data || res;
      setStudent(updated);
      toast.success('Guardian removed successfully.');
    } catch (err) {
      console.error('Failed to remove guardian via API:', err);
      toast.error(getApiErrorMessage(err, 'Failed to remove guardian.'));
    }
  };

  const handleSaveGuardian = async (guardian: Guardian) => {
    let updatedGuardians = [...(student.guardians || [])];
    if (guardian.isPrimary) {
      updatedGuardians = updatedGuardians.map((g) => ({ ...g, isPrimary: false }));
    }
    const idx = updatedGuardians.findIndex((g) => g.id === guardian.id);
    if (idx >= 0) {
      updatedGuardians[idx] = guardian;
    } else {
      if (updatedGuardians.length === 0 && !guardian.isPrimary) {
        guardian.isPrimary = true;
      }
      updatedGuardians.push(guardian);
    }

    try {
      const res = await updateStudentMutation({
        studentId: student.id,
        data: { guardians: updatedGuardians },
      }).unwrap();
      const updated = res?.data || res;
      setStudent(updated);
      toast.success('Guardian details saved successfully.');
    } catch (err) {
      console.error('Failed to save guardian via API:', err);
      toast.error(getApiErrorMessage(err, 'Failed to save guardian information.'));
    }
  };

  return (
    <div>
      {/* Header Profile Banner */}
      <StudentProfileHeader student={student} onCreateAdmission={handleCreateAdmission} />

      {/* Post-Creation Success Banner with Primary Next Step */}
      {showCreatedAlert && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setShowCreatedAlert(false)}
          className={`d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3 p-3 border ${
            isDark ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success' : ''
          }`}
        >
          <div className="d-flex align-items-center gap-2.5">
            <CheckCircle size={20} className="flex-shrink-0 text-success" />
            <div>
              <div className="fw-semibold">Student Record Created Successfully!</div>
              <div className="small text-muted">
                Permanent record registered with Student Code{' '}
                <span className="font-monospace fw-semibold">{student.studentCode}</span>. Next
                step: Place this student into an academic class.
              </div>
            </div>
          </div>
          {!hasAdmission && (
            <Button
              variant="success"
              size="sm"
              onClick={handleCreateAdmission}
              className="d-inline-flex align-items-center gap-1.5 px-3"
            >
              <span>Create Admission Now</span>
              <ArrowRight size={14} />
            </Button>
          )}
        </Alert>
      )}

      {/* Profile Navigation Tabs */}
      <div className="mb-4">
        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab((k as any) || 'overview')}
          className="border-bottom"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="overview"
              className={`d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
                activeTab === 'overview'
                  ? isDark
                    ? 'bg-dark text-white border-secondary border-bottom-0'
                    : 'bg-white text-primary border-light-subtle border-bottom-0'
                  : 'text-muted'
              }`}
            >
              <User size={15} />
              <span>Overview</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="personal"
              className={`d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
                activeTab === 'personal'
                  ? isDark
                    ? 'bg-dark text-white border-secondary border-bottom-0'
                    : 'bg-white text-primary border-light-subtle border-bottom-0'
                  : 'text-muted'
              }`}
            >
              <Calendar size={15} />
              <span>Personal Info</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="guardians"
              className={`d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
                activeTab === 'guardians'
                  ? isDark
                    ? 'bg-dark text-white border-secondary border-bottom-0'
                    : 'bg-white text-primary border-light-subtle border-bottom-0'
                  : 'text-muted'
              }`}
            >
              <Users size={15} />
              <span>Guardians ({student.guardians?.length || 0})</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="contact"
              className={`d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
                activeTab === 'contact'
                  ? isDark
                    ? 'bg-dark text-white border-secondary border-bottom-0'
                    : 'bg-white text-primary border-light-subtle border-bottom-0'
                  : 'text-muted'
              }`}
            >
              <Phone size={15} />
              <span>Contact & Address</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="admission"
              className={`d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
                activeTab === 'admission'
                  ? isDark
                    ? 'bg-dark text-white border-secondary border-bottom-0'
                    : 'bg-white text-primary border-light-subtle border-bottom-0'
                  : 'text-muted'
              }`}
            >
              <FileText size={15} />
              <span>Admission Status</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Tab Panels */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <Row className="g-4">
          <Col xs={12} lg={8}>
            {/* Student Information Summary Card */}
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border mb-4 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
            >
              <Card.Header
                className={`py-3 ${
                  isDark
                    ? 'bg-secondary bg-opacity-25 border-secondary'
                    : 'bg-light border-light-subtle'
                }`}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 font-semibold">
                    <User size={16} className="text-primary" />
                    <span>Basic Details</span>
                  </div>
                  <StudentStatusBadge status={student.status} />
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Student Full Name</div>
                    <div className="fw-semibold text-base">{fullName}</div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Student Code (Permanent)</div>
                    <div className="font-monospace fw-semibold text-primary">
                      {student.studentCode}
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Date of Birth</div>
                    <div className="fw-medium">{formatDate(student.dateOfBirth)}</div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Gender</div>
                    <div className="fw-medium">{formatGender(student.gender)}</div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Blood Group</div>
                    <div className="fw-medium">{student.bloodGroup || '—'}</div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Special / Disability Category</div>
                    <div className="fw-medium">
                      {isSpecialNeedActive(student.specialCategory) ? (
                        <div>
                          <Badge
                            bg="warning"
                            text="dark"
                            className="fw-normal"
                            style={{ fontSize: '11px' }}
                          >
                            {getOptionLabel(SPECIAL_NEED_CATEGORIES, student.specialCategory)}
                          </Badge>
                          {student.specialCategoryDetails && (
                            <div className="small text-muted mt-0.5">
                              {student.specialCategoryDetails}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">None / Not Applicable</span>
                      )}
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="text-muted small">Nationality</div>
                    <div className="fw-medium">{student.nationality || '—'}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Guardians Quick Section */}
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border mb-4 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
            >
              <Card.Header
                className={`py-3 ${
                  isDark
                    ? 'bg-secondary bg-opacity-25 border-secondary'
                    : 'bg-light border-light-subtle'
                }`}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 font-semibold">
                    <Users size={16} className="text-primary" />
                    <span>Parent & Guardian Overview</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none small text-primary"
                    onClick={() => setActiveTab('guardians')}
                  >
                    View All ({student.guardians?.length || 0})
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {student.guardians && student.guardians.length > 0 ? (
                  <Row className="g-3">
                    {primaryGuardian && (
                      <Col xs={12} sm={6}>
                        <div className="p-3 rounded border border-light-subtle h-100">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="small text-muted">Primary Guardian:</span>
                            <Badge bg="primary" className="fw-normal" style={{ fontSize: '10px' }}>
                              {primaryGuardian.relationship}
                            </Badge>
                          </div>
                          <div className="fw-semibold">
                            {primaryGuardian.firstName} {primaryGuardian.lastName}
                          </div>
                          <div className="small font-monospace text-muted mt-1">
                            {primaryGuardian.mobile}
                          </div>
                          {primaryGuardian.email && (
                            <div className="small text-muted text-truncate mt-0.5">
                              {primaryGuardian.email}
                            </div>
                          )}
                        </div>
                      </Col>
                    )}

                    {emergencyGuardian && emergencyGuardian.id !== primaryGuardian?.id ? (
                      <Col xs={12} sm={6}>
                        <div className="p-3 rounded border border-light-subtle h-100">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="small text-muted">Emergency Contact:</span>
                            <Badge bg="danger" className="fw-normal" style={{ fontSize: '10px' }}>
                              {emergencyGuardian.relationship}
                            </Badge>
                          </div>
                          <div className="fw-semibold">
                            {emergencyGuardian.firstName} {emergencyGuardian.lastName}
                          </div>
                          <div className="small font-monospace text-muted mt-1">
                            {emergencyGuardian.mobile}
                          </div>
                        </div>
                      </Col>
                    ) : (
                      <Col xs={12} sm={6}>
                        <div className="p-3 rounded border border-light-subtle h-100 d-flex flex-column justify-content-center">
                          <div className="text-muted small">Total Guardians:</div>
                          <div className="fw-semibold fs-5">
                            {student.guardians.length} Registered
                          </div>
                          <div className="text-muted small">
                            Includes verified contact & pickup authorization.
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                ) : (
                  <div className="text-center py-3 text-muted small">
                    No guardian registered yet. Switch to the Guardians tab to add one.
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Notes & Remarks */}
            {student.notes && (
              <Card
                bg={isDark ? 'dark' : 'white'}
                text={isDark ? 'white' : 'dark'}
                className={`border mb-4 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
              >
                <Card.Header
                  className={`py-3 ${
                    isDark
                      ? 'bg-secondary bg-opacity-25 border-secondary'
                      : 'bg-light border-light-subtle'
                  }`}
                >
                  <div className="d-flex align-items-center gap-2 font-semibold">
                    <FileText size={16} className="text-primary" />
                    <span>Medical Notes & Remarks</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-3">
                  <p className="mb-0 text-muted small">{student.notes}</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Right Column: Admission Status & Contact Card */}
          <Col xs={12} lg={4}>
            {/* Primary Action Card: Admission Status */}
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border mb-4 ${
                hasAdmission
                  ? isDark
                    ? 'border-secondary'
                    : 'border-light-subtle shadow-sm'
                  : 'border-warning border-opacity-50 shadow-sm'
              }`}
            >
              <Card.Header
                className={`py-3 ${
                  hasAdmission
                    ? isDark
                      ? 'bg-secondary bg-opacity-25 border-secondary'
                      : 'bg-light border-light-subtle'
                    : isDark
                      ? 'bg-warning bg-opacity-10 border-warning border-opacity-25'
                      : 'bg-warning bg-opacity-10 border-warning border-opacity-25'
                }`}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 font-semibold">
                    <Clock size={16} className={hasAdmission ? 'text-primary' : 'text-warning'} />
                    <span>Academic Admission</span>
                  </div>
                  {hasAdmission ? (
                    <Badge bg="success" className="fw-normal">
                      Enrolled
                    </Badge>
                  ) : (
                    <Badge bg="warning" text="dark" className="fw-normal">
                      Not Enrolled
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {hasAdmission ? (
                  <div>
                    <div className="mb-3">
                      <div className="text-muted small">Admission Number</div>
                      <div className="font-monospace fw-semibold">{student.admissionNumber}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-muted small">Assigned Class & Section</div>
                      <div className="fw-semibold">
                        {student.className} {student.sectionName ? `(${student.sectionName})` : ''}
                      </div>
                    </div>
                    {student.rollNumber && (
                      <div className="mb-3">
                        <div className="text-muted small">Roll Number</div>
                        <div className="font-monospace fw-medium">{student.rollNumber}</div>
                      </div>
                    )}
                    <div className="mb-3">
                      <div className="text-muted small">Admission Date</div>
                      <div>{formatDate(student.admissionDate)}</div>
                    </div>
                    <div>
                      <div className="text-muted small">Admission Type</div>
                      <div>{formatAdmissionType(student.admissionType)}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-start gap-2 mb-3">
                      <AlertCircle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                      <div className="small text-muted">
                        This student is registered in the permanent database but has no active
                        enrollment record.
                      </div>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleCreateAdmission}
                      className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 py-2 shadow-sm"
                    >
                      <PlusCircle size={15} />
                      <span>Create Admission</span>
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Contact Summary */}
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border mb-4 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
            >
              <Card.Header
                className={`py-3 ${
                  isDark
                    ? 'bg-secondary bg-opacity-25 border-secondary'
                    : 'bg-light border-light-subtle'
                }`}
              >
                <div className="d-flex align-items-center gap-2 font-semibold">
                  <Phone size={16} className="text-primary" />
                  <span>Contact Summary</span>
                </div>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="mb-3">
                  <div className="text-muted small">Student Mobile</div>
                  <div className="font-monospace fw-medium">{student.mobile || '—'}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted small">Student Email</div>
                  <div className="small text-truncate">{student.email || '—'}</div>
                </div>
                <div>
                  <div className="text-muted small">City & State</div>
                  <div className="small">
                    {[student.city, student.state].filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 2. PERSONAL TAB */}
      {activeTab === 'personal' && (
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-3 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center gap-2 font-semibold">
              <User size={16} className="text-primary" />
              <span>Personal Information & Identification</span>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4">
              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Date of Birth</div>
                <div className="fw-medium">{formatDate(student.dateOfBirth)}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Gender</div>
                <div className="fw-medium">{formatGender(student.gender)}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Blood Group</div>
                <div className="fw-medium">{student.bloodGroup || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Special / Disability Category</div>
                <div className="fw-medium">
                  {isSpecialNeedActive(student.specialCategory) ? (
                    <span
                      className={`badge fw-normal ${
                        isDark
                          ? 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-25'
                          : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                      }`}
                      style={{ fontSize: '11px' }}
                    >
                      {getOptionLabel(SPECIAL_NEED_CATEGORIES, student.specialCategory)}
                    </span>
                  ) : (
                    <span>
                      {getOptionLabel(
                        SPECIAL_NEED_CATEGORIES,
                        student.specialCategory,
                        'None / Not Applicable',
                      )}
                    </span>
                  )}
                </div>
              </Col>

              {student.specialCategoryDetails && (
                <Col xs={12}>
                  <div className="text-muted small">Disability / Specific Disease Details</div>
                  <div
                    className={`small p-2.5 rounded border mt-1 ${
                      isDark
                        ? 'bg-dark bg-opacity-50 text-light border-secondary'
                        : 'bg-light text-dark border-light-subtle'
                    }`}
                  >
                    {student.specialCategoryDetails}
                  </div>
                </Col>
              )}

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Nationality</div>
                <div className="fw-medium">{student.nationality || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Religion</div>
                <div className="fw-medium">{student.religion || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Category</div>
                <div className="fw-medium">{student.category || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Mother Tongue</div>
                <div className="fw-medium">{student.motherTongue || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Place of Birth</div>
                <div className="fw-medium">{student.placeOfBirth || '—'}</div>
              </Col>

              <Col xs={12} sm={6} md={4}>
                <div className="text-muted small">Government ID / National ID (Aadhaar)</div>
                <div className="font-monospace fw-medium">{student.governmentId || '—'}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* 3. GUARDIANS TAB */}
      {activeTab === 'guardians' && (
        <Card
          bg={isDark ? 'dark' : 'white'}
          text={isDark ? 'white' : 'dark'}
          className={`border ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
        >
          <Card.Header
            className={`py-3 ${
              isDark
                ? 'bg-secondary bg-opacity-25 border-secondary'
                : 'bg-light border-light-subtle'
            }`}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2 font-semibold">
                <Users size={16} className="text-primary" />
                <span>Parents & Authorized Guardians</span>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <GuardianList
              guardians={student.guardians || []}
              onAddClick={handleOpenAddGuardian}
              onEditClick={handleOpenEditGuardian}
              onRemoveClick={handleRemoveGuardian}
            />
          </Card.Body>
        </Card>
      )}

      {/* 4. CONTACT & ADDRESS TAB */}
      {activeTab === 'contact' && (
        <Row className="g-4">
          <Col xs={12} md={6}>
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border h-100 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
            >
              <Card.Header
                className={`py-3 ${
                  isDark
                    ? 'bg-secondary bg-opacity-25 border-secondary'
                    : 'bg-light border-light-subtle'
                }`}
              >
                <div className="d-flex align-items-center gap-2 font-semibold">
                  <Phone size={16} className="text-primary" />
                  <span>Communication Details</span>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="text-muted small">Student Mobile Number</div>
                  <div className="font-monospace fw-medium">{student.mobile || '—'}</div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Alternate Mobile</div>
                  <div className="font-monospace fw-medium">{student.alternateMobile || '—'}</div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Student Email Address</div>
                  <div className="fw-medium">{student.email || '—'}</div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Emergency Contact</div>
                  <div className="fw-medium">{student.emergencyContact || '—'}</div>
                </div>

                <div>
                  <div className="text-muted small">Emergency Phone</div>
                  <div className="font-monospace fw-medium">{student.emergencyPhone || '—'}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card
              bg={isDark ? 'dark' : 'white'}
              text={isDark ? 'white' : 'dark'}
              className={`border h-100 ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
            >
              <Card.Header
                className={`py-3 ${
                  isDark
                    ? 'bg-secondary bg-opacity-25 border-secondary'
                    : 'bg-light border-light-subtle'
                }`}
              >
                <div className="d-flex align-items-center gap-2 font-semibold">
                  <MapPin size={16} className="text-primary" />
                  <span>Permanent Residential Address</span>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="text-muted small">Address Line 1</div>
                  <div className="fw-medium">{student.addressLine1 || '—'}</div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small">Address Line 2</div>
                  <div className="fw-medium">{student.addressLine2 || '—'}</div>
                </div>

                <Row className="g-3">
                  <Col xs={6}>
                    <div className="text-muted small">City</div>
                    <div className="fw-medium">{student.city || '—'}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">State</div>
                    <div className="fw-medium">{student.state || '—'}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Country</div>
                    <div className="fw-medium">{student.country || '—'}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="text-muted small">Postal Code</div>
                    <div className="font-monospace fw-medium">{student.postalCode || '—'}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* 5. ADMISSION TAB */}
      {activeTab === 'admission' && (
        <div className="d-flex flex-column gap-4">
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className={`border ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
          >
            <Card.Header
              className={`py-3 ${
                isDark
                  ? 'bg-secondary bg-opacity-25 border-secondary'
                  : 'bg-light border-light-subtle'
              }`}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2 font-semibold">
                  <GraduationCap size={16} className="text-primary" />
                  <span>Academic Admission & Enrollment Record</span>
                </div>
                {!hasAdmission && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleCreateAdmission}
                    className="d-inline-flex align-items-center gap-1.5 px-3"
                  >
                    <PlusCircle size={14} />
                    <span>Create Admission</span>
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {!hasAdmission ? (
                <div
                  className={`text-center py-5 px-3 rounded border border-dashed ${
                    isDark
                      ? 'border-secondary bg-secondary bg-opacity-10'
                      : 'border-light-subtle bg-light bg-opacity-50'
                  }`}
                >
                  <ShieldAlert size={36} className="text-warning mb-2 opacity-75" />
                  <div className="h5 fw-semibold mb-1">No Active Admission Record</div>
                  <p
                    className="text-muted small mb-4"
                    style={{ maxWidth: '460px', margin: '0 auto' }}
                  >
                    This student is registered in SchoolNexa as an individual, but has not yet been
                    admitted into an Academic Year, Class, or Section.
                  </p>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleCreateAdmission}
                    className="d-inline-flex align-items-center gap-1.5 px-3 py-2 shadow-sm"
                  >
                    <PlusCircle size={16} />
                    <span>Create Admission for {fullName}</span>
                  </Button>
                </div>
              ) : (
                <Row className="g-4">
                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Admission Number</div>
                    <div className="font-monospace fw-semibold text-primary">
                      {student.admissionNumber}
                    </div>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Assigned Class</div>
                    <div className="fw-semibold">{student.className || '—'}</div>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Section</div>
                    <div className="fw-semibold">{student.sectionName || '—'}</div>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Roll Number</div>
                    <div className="font-monospace fw-medium">{student.rollNumber || '—'}</div>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Admission Date</div>
                    <div className="fw-medium">{formatDate(student.admissionDate)}</div>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <div className="text-muted small">Admission Type</div>
                    <div className="fw-medium">{formatAdmissionType(student.admissionType)}</div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Previous Education & Background History */}
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className={`border ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
          >
            <Card.Header
              className={`py-3 ${
                isDark
                  ? 'bg-secondary bg-opacity-25 border-secondary'
                  : 'bg-light border-light-subtle'
              }`}
            >
              <div className="d-flex align-items-center gap-2 font-semibold">
                <Building2 size={16} className="text-primary" />
                <span>Previous School & Transfer Certificate (TC) Details</span>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col xs={12} sm={6} md={4}>
                  <div className="text-muted small">Previous School</div>
                  <div className="fw-medium">{student.previousSchool || '—'}</div>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <div className="text-muted small">Previous Class</div>
                  <div className="fw-medium">{student.previousClass || '—'}</div>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <div className="text-muted small">Previous School Board</div>
                  <div className="fw-medium">{student.previousSchoolBoard || '—'}</div>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <div className="text-muted small">Transfer Certificate (TC) Number</div>
                  <div className="font-monospace fw-medium">
                    {student.transferCertificateNumber || '—'}
                  </div>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <div className="text-muted small">TC Issue Date</div>
                  <div className="fw-medium">{formatDate(student.transferCertificateDate)}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Reusable Guardian Modal */}
      <GuardianModal
        show={showGuardianModal}
        onHide={() => setShowGuardianModal(false)}
        onSave={handleSaveGuardian}
        initialGuardian={editingGuardian}
        studentAddress={{
          addressLine1: student.addressLine1,
          addressLine2: student.addressLine2,
          city: student.city,
          state: student.state,
          country: student.country,
          postalCode: student.postalCode,
        }}
      />
    </div>
  );
};
