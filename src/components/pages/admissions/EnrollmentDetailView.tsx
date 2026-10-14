import React, { useState, useEffect, useMemo } from 'react';
import { Breadcrumb, Button, Card, Row, Col, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  RotateCcw,
  ArrowLeftRight,
  ExternalLink,
  History,
  CheckCircle,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Enrollment } from './types';
import {
  useGetEnrollmentByIdQuery,
  useGetEnrollmentsByStudentIdQuery,
  useUpdateEnrollmentMutation,
  useTransferOutStudentMutation,
} from '@/store/enrollment';
import { useGetStudentByIdQuery, mapDtoToStudentItem } from '@/store/students';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { StatusBadge } from './components/StatusBadge';
import { EditEnrollmentModal } from './components/EditEnrollmentModal';
import { QuickTransferOutModal } from './components/QuickTransferOutModal';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const EnrollmentDetailView: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const {
    data: rtkEnrollmentData,
    isLoading: isEnrollmentLoading,
    refetch: refetchEnrollment,
  } = useGetEnrollmentByIdQuery(enrollmentId || '', { skip: !enrollmentId });
  const [updateEnrollmentMutation] = useUpdateEnrollmentMutation();
  const [transferOutStudentMutation] = useTransferOutStudentMutation();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery();

  const availableClasses = useMemo(() => {
    const raw = Array.isArray(classesData?.data) ? classesData.data : Array.isArray(classesData) ? classesData : [];
    if (raw.length > 0) return raw.map((c: any) => c.name || `Class ${c.numericOrder}`);
    return ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  }, [classesData]);

  const availableSections = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data) ? sectionsData.data : Array.isArray(sectionsData) ? sectionsData : [];
    if (raw.length > 0) {
      const names = Array.from(new Set(raw.map((s: any) => s.sectionName || s.name))).filter(Boolean);
      if (names.length > 0) return names as string[];
    }
    return ['Section A', 'Section B', 'Section C', 'Section D'];
  }, [sectionsData]);

  useEffect(() => {
    if (rtkEnrollmentData) {
      const raw = rtkEnrollmentData.data || rtkEnrollmentData;
      if (raw && (raw.id || raw.enrollmentId)) {
        setEnrollment(raw);
      }
    }
  }, [rtkEnrollmentData]);

  // Student master entity and all academic history
  const { data: rtkStudentData } = useGetStudentByIdQuery(enrollment?.studentId || '', {
    skip: !enrollment?.studentId,
  });
  const student = useMemo(() => {
    if (!rtkStudentData) return null;
    const raw = rtkStudentData.data || rtkStudentData;
    return raw?.studentId && raw?.admissionNumber ? mapDtoToStudentItem(raw) : raw;
  }, [rtkStudentData]);

  const { data: rtkHistoryData, refetch: refetchHistory } = useGetEnrollmentsByStudentIdQuery(
    enrollment?.studentId || '',
    { skip: !enrollment?.studentId },
  );
  const historyList = useMemo(() => {
    if (!rtkHistoryData) return [];
    return Array.isArray(rtkHistoryData?.data) ? rtkHistoryData.data : Array.isArray(rtkHistoryData) ? rtkHistoryData : [];
  }, [rtkHistoryData]);

  const refreshData = () => {
    refetchEnrollment();
    refetchHistory();
  };

  if (isEnrollmentLoading && !enrollment) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" className="mb-2" />
        <div className="text-muted small">Loading enrollment details...</div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="container-fluid py-4 px-3 px-md-4">
        <Alert variant="danger">
          Enrollment record "{enrollmentId}" was not found in the database.
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={() => navigate('/admissions')}>
              Return to Admissions
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const primaryGuardian = student?.guardians?.find((g: any) => g.isPrimary) || student?.guardians?.[0];

  const handleSaveEdit = async (id: string, updates: Partial<Enrollment>) => {
    try {
      await updateEnrollmentMutation({ id, data: updates }).unwrap();
      refreshData();
      setShowEditModal(false);
      setFeedback('Enrollment details updated successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Error updating enrollment'));
    }
  };

  const handleConfirmTransfer = async (payload: {
    enrollmentId: string;
    transferDate: string;
    transferReason: string;
    transferCertificateNumber?: string;
    remarks?: string;
  }) => {
    try {
      await transferOutStudentMutation(payload).unwrap();
      refreshData();
      setShowTransferModal(false);
      setFeedback('Student transfer out recorded successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to record student transfer'));
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '1100px' }}>
      {feedback && (
        <Alert
          variant="success"
          className="py-2 small mb-3"
          dismissible
          onClose={() => setFeedback(null)}
        >
          {feedback}
        </Alert>
      )}

      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <UserCheck size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-0.5">
                  <h5 className="mb-0 fw-bold font-monospace" style={{ fontSize: '1rem' }}>
                    {enrollment.enrollmentId}
                  </h5>
                  <StatusBadge status={enrollment.status} />
                  <Badge bg="primary" className="fw-normal">
                    AY {enrollment.academicYearName}
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Student:{' '}
                  <strong className={isDark ? 'text-light' : 'text-dark'}>
                    {enrollment.studentName}
                  </strong>{' '}
                  • {enrollment.className} ({enrollment.sectionName})
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={() => setShowEditModal(true)}
              >
                <Edit size={14} />
                <span>Edit</span>
              </Button>

              <Button
                variant="outline-success"
                size="sm"
                className="d-flex align-items-center gap-1"
                disabled={enrollment.status === 'TRANSFERRED' || enrollment.status === 'CANCELLED'}
                onClick={() =>
                  navigate(
                    `/admissions/promote?studentId=${enrollment.studentId}&sourceEnrollmentId=${enrollment.enrollmentId}`,
                  )
                }
              >
                <TrendingUp size={14} />
                <span>Promote</span>
              </Button>

              <Button
                variant="outline-warning"
                size="sm"
                className="d-flex align-items-center gap-1"
                disabled={enrollment.status === 'TRANSFERRED' || enrollment.status === 'CANCELLED'}
                onClick={() =>
                  navigate(
                    `/admissions/repeat?studentId=${enrollment.studentId}&sourceEnrollmentId=${enrollment.enrollmentId}`,
                  )
                }
              >
                <RotateCcw size={14} />
                <span>Repeat</span>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="d-flex align-items-center gap-1"
                disabled={enrollment.status === 'TRANSFERRED' || enrollment.status === 'CANCELLED'}
                onClick={() => setShowTransferModal(true)}
              >
                <ArrowLeftRight size={14} />
                <span>Transfer</span>
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={() => navigate(`/students/view/${enrollment.studentId}`)}
              >
                <span>Student Profile</span>
                <ExternalLink size={13} />
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1.5"
                onClick={() => navigate('/admissions')}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
        {/* Section 1: Enrollment Information */}
        <Col xs={12} md={7}>
          <Card className="h-100 border shadow-none">
            <Card.Header className="bg-body-tertiary py-2">
              <span className="small fw-semibold d-flex align-items-center gap-1">
                <Calendar size={15} className="text-primary" />
                <span>1. Academic Enrollment Record</span>
              </span>
            </Card.Header>
            <Card.Body className="p-3">
              <Row className="g-3 small">
                <Col xs={6}>
                  <div className="text-muted">Enrollment ID (Primary Key)</div>
                  <div className="font-monospace fw-bold text-primary">
                    {enrollment.enrollmentId}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Academic Session</div>
                  <div className="fw-semibold">AY {enrollment.academicYearName}</div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Class & Section</div>
                  <div className="fw-bold">
                    {enrollment.className} — {enrollment.sectionName}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Roll Number</div>
                  <div>{enrollment.rollNumber || 'Not assigned'}</div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Admission Ledger No.</div>
                  <div className="font-monospace text-muted">
                    {enrollment.admissionNumber || '—'}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Enrollment Date</div>
                  <div>{enrollment.enrollmentDate}</div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Enrollment Status</div>
                  <div>
                    <StatusBadge status={enrollment.status} size="sm" />
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted">Previous School</div>
                  <div>{enrollment.previousSchool || 'None recorded'}</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted">Administrative Remarks</div>
                  <div className="bg-body-tertiary p-2 rounded border mt-1">
                    {enrollment.remarks || 'No specific remarks entered.'}
                  </div>
                </Col>

                {enrollment.status === 'TRANSFERRED' && (
                  <Col xs={12}>
                    <div className="alert alert-danger py-2 px-3 small mb-0">
                      <strong>Transfer Out Record:</strong>
                      <div>
                        TC Number: <strong>{enrollment.transferCertificateNumber || 'N/A'}</strong>
                      </div>
                      <div>Transfer Date: {enrollment.transferDate}</div>
                      <div>Reason: {enrollment.transferReason}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Section 2: Permanent Student Person Profile */}
        <Col xs={12} md={5}>
          <Card className="h-100 border shadow-none">
            <Card.Header className="bg-body-tertiary py-2 d-flex align-items-center justify-content-between">
              <span className="small fw-semibold d-flex align-items-center gap-1">
                <UserCheck size={15} className="text-success" />
                <span>2. Permanent Student Profile</span>
              </span>
              <button
                type="button"
                onClick={() => navigate(`/students/view/${enrollment.studentId}`)}
                className="btn btn-link p-0 text-decoration-none small"
              >
                View Full
              </button>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '36px', height: '36px' }}
                >
                  {enrollment.studentName.charAt(0)}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{enrollment.studentName}</h6>
                  <span className="font-monospace text-primary small">
                    Code: {enrollment.studentCode}
                  </span>
                </div>
              </div>

              <Row className="g-2 small border-top pt-2">
                <Col xs={6}>
                  <span className="text-muted">System Student ID:</span>
                  <div className="font-monospace text-xs text-truncate">{enrollment.studentId}</div>
                </Col>
                <Col xs={6}>
                  <span className="text-muted">Gender:</span>
                  <div>{student?.gender || '—'}</div>
                </Col>
                <Col xs={6}>
                  <span className="text-muted">Date of Birth:</span>
                  <div>{student?.dateOfBirth || '—'}</div>
                </Col>
                <Col xs={6}>
                  <span className="text-muted">Mobile Contact:</span>
                  <div>{student?.mobile || primaryGuardian?.mobile || '—'}</div>
                </Col>
                <Col xs={12}>
                  <span className="text-muted">Primary Guardian:</span>
                  <div>
                    {primaryGuardian
                      ? `${primaryGuardian.firstName} ${primaryGuardian.lastName} (${primaryGuardian.relationship})`
                      : '—'}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Section 3: Academic History (Multi-year enrollments for this student) */}
      <Card className="border shadow-none mb-3">
        <Card.Header className="bg-body-tertiary py-2">
          <span className="small fw-semibold d-flex align-items-center gap-1">
            <History size={15} className="text-info" />
            <span>3. Complete Multi-Year Enrollment History ({historyList.length} Sessions)</span>
          </span>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Academic Session</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll Number</th>
                  <th>Admission Number</th>
                  <th>Enrollment ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((hist) => {
                  const isCurrent = hist.enrollmentId === enrollment.enrollmentId;

                  return (
                    <tr key={hist.id} className={isCurrent ? 'table-primary-subtle' : undefined}>
                      <td className="fw-semibold">
                        {hist.academicYearName}
                        {isCurrent && (
                          <Badge bg="primary" className="ms-1 text-xs">
                            Active Viewed
                          </Badge>
                        )}
                      </td>
                      <td className="fw-semibold">{hist.className}</td>
                      <td>{hist.sectionName}</td>
                      <td>{hist.rollNumber || '—'}</td>
                      <td className="font-monospace text-muted">{hist.admissionNumber || '—'}</td>
                      <td className="font-monospace fw-bold text-primary">{hist.enrollmentId}</td>
                      <td>
                        <StatusBadge status={hist.status} size="sm" />
                      </td>
                      <td className="text-muted">{hist.enrollmentDate}</td>
                      <td className="text-end pe-3">
                        {!isCurrent ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="py-0 px-2 text-xs"
                            onClick={() => navigate(`/admissions/view/${hist.enrollmentId}`)}
                          >
                            View Record
                          </Button>
                        ) : (
                          <span className="text-muted text-xs">Current</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <EditEnrollmentModal
        show={showEditModal}
        enrollment={enrollment}
        availableClasses={availableClasses}
        availableSections={availableSections}
        onHide={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      {/* Transfer Modal */}
      <QuickTransferOutModal
        show={showTransferModal}
        enrollment={enrollment}
        onHide={() => setShowTransferModal(false)}
        onConfirm={handleConfirmTransfer}
      />
    </div>
  );
};
