import React, { useState, useMemo } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Row,
  Col,
  Form,
  Table,
  Alert,
  Badge,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Enrollment } from './types';
import {
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
} from '@/store/enrollment';
import { useGetStudentsQuery, mapDtoToStudentItem } from '@/store/students';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { buildAdmissionNumber } from '@/config/identifiers';

export const BulkEnrollmentView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const { data: studentsData } = useGetStudentsQuery();
  const { data: enrollmentsData } = useGetEnrollmentsQuery();
  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery();
  const [createEnrollmentMutation] = useCreateEnrollmentMutation();

  const availableYears = useMemo(() => ['2026-2027', '2025-2026', '2024-2025'], []);
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

  const [targetYear, setTargetYear] = useState('2026-2027');
  const [targetClass, setTargetClass] = useState('Class 1');
  const [targetSection, setTargetSection] = useState('Section A');
  const [rollNumberStart, setRollNumberStart] = useState('1');

  // Candidate students who don't have an enrollment for targetYear yet
  const [candidates, setCandidates] = useState<
    Array<{
      studentId: string;
      studentCode: string;
      studentName: string;
      gender: string;
      rollNumber: string;
      admissionNumber: string;
    }>
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Preview & Processing
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ created: Enrollment[]; duplicates: number } | null>(
    null,
  );

  const handleLoadEligibleStudents = () => {
    const rawStudents = Array.isArray(studentsData?.data) ? studentsData.data : Array.isArray(studentsData) ? studentsData : [];
    const allStudents = rawStudents.map((item: any) =>
      item.studentId && item.admissionNumber ? mapDtoToStudentItem(item) : item,
    );

    const rawEnrollments = Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : Array.isArray(enrollmentsData) ? enrollmentsData : [];
    const enrolledStudentIdsInTargetYear = new Set(
      rawEnrollments
        .filter((e: any) => (e.academicYearName === targetYear || e.academicYearId === targetYear) && e.status !== 'CANCELLED')
        .map((e: any) => e.studentId),
    );

    const startNum = parseInt(rollNumberStart, 10) || 1;

    // Filter students without enrollment in targetYear
    const eligible = allStudents
      .filter((s) => !enrolledStudentIdsInTargetYear.has(s.id))
      .map((s, idx) => ({
        studentId: s.id,
        studentCode: s.studentCode || s.admissionNumber || `STU-${s.id.slice(0, 6)}`,
        studentName: `${s.firstName} ${s.middleName ? s.middleName + ' ' : ''}${s.lastName}`,
        gender: s.gender || 'MALE',
        rollNumber: String(startNum + idx),
        admissionNumber:
          s.admissionNumber ||
          buildAdmissionNumber(
            targetYear.split('-')[0] || 2026,
            Math.floor(100 + Math.random() * 900),
          ),
      }));

    setCandidates(eligible);
    setSelectedIds(eligible.map((e) => e.studentId));
    setHasLoaded(true);
  };

  const handleToggleSelect = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(candidates.map((c) => c.studentId));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleUpdateRoll = (studentId: string, roll: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.studentId === studentId ? { ...c, rollNumber: roll } : c)),
    );
  };

  const handleUpdateAdmission = (studentId: string, adm: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.studentId === studentId ? { ...c, admissionNumber: adm } : c)),
    );
  };

  const previewItems = useMemo(() => {
    const yearPrefix = targetYear.split('-')[0] || '2026';
    return candidates
      .filter((c) => selectedIds.includes(c.studentId))
      .map((c, idx) => ({
        ...c,
        prospectiveEnrollmentId: `ENR-${yearPrefix}-${String(600 + idx + 1).padStart(6, '0')}`,
        className: targetClass,
        sectionName: targetSection,
        academicYearName: targetYear,
      }));
  }, [candidates, selectedIds, targetYear, targetClass, targetSection]);

  const handleConfirmBulkEnrollment = async () => {
    setIsProcessing(true);
    try {
      const createdList: Enrollment[] = [];
      let duplicateCount = 0;

      for (const item of previewItems) {
        try {
          const res = await createEnrollmentMutation({
            studentId: item.studentId,
            studentCode: item.studentCode,
            studentName: item.studentName,
            academicYearName: item.academicYearName,
            className: item.className,
            sectionName: item.sectionName,
            rollNumber: item.rollNumber,
            admissionNumber: item.admissionNumber,
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'NEW',
            remarks: 'Batch initial cohort intake',
          }).unwrap();
          createdList.push(res?.data || res);
        } catch (itemErr: any) {
          if (itemErr?.status === 409 || itemErr?.data?.message?.includes('already')) {
            duplicateCount++;
          } else {
            console.error('Failed to enroll student:', item.studentName, itemErr);
          }
        }
      }

      setResults({ created: createdList, duplicates: duplicateCount });
      setShowPreview(false);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Error executing bulk enrollment'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <Layers size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Batch Cohort Enrollment
                  </h5>
                  <Badge bg="primary" className="fw-normal">
                    Bulk Intake
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Enroll multiple students simultaneously into an academic session, class, and
                  section.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1.5"
                onClick={() => navigate('/admissions')}
              >
                <ArrowLeft size={14} />
                <span>Back to Admissions</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {results ? (
        <Alert variant="success" className="p-3 mb-4">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">Bulk Enrollment Processing Completed!</h6>
              <div className="bg-body p-2 rounded border small mb-3">
                <Row className="g-2 text-center">
                  <Col xs={4}>
                    <span className="text-muted">Total Processed:</span>{' '}
                    <strong>{results.created.length + results.duplicates}</strong>
                  </Col>
                  <Col xs={4}>
                    <span className="text-muted">Successfully Created:</span>{' '}
                    <strong className="text-success">{results.created.length}</strong>
                  </Col>
                  <Col xs={4}>
                    <span className="text-muted">Skipped (Duplicate):</span>{' '}
                    <strong className="text-muted">{results.duplicates}</strong>
                  </Col>
                </Row>
              </div>
              <div className="d-flex gap-2">
                <Button variant="success" size="sm" onClick={() => navigate('/admissions')}>
                  View All Enrollments
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setResults(null);
                    setHasLoaded(false);
                    setSelectedIds([]);
                  }}
                >
                  Create Another Batch
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <>
          {/* Step 1: Target Cohort Parameters */}
          <Card className="border shadow-none mb-3">
            <Card.Header className="bg-body-tertiary py-2">
              <span className="small fw-semibold">Step 1: Define Target Academic Cohort</span>
            </Card.Header>
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">Target Academic Year</Form.Label>
                    <Form.Select
                      size="sm"
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          AY {y}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">Target Class</Form.Label>
                    <Form.Select
                      size="sm"
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                    >
                      {availableClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">Target Section</Form.Label>
                    <Form.Select
                      size="sm"
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                    >
                      {availableSections.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">
                      Roll Number Starting At
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      min="1"
                      value={rollNumberStart}
                      onChange={(e) => setRollNumberStart(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="d-flex align-items-center gap-1"
                    onClick={handleLoadEligibleStudents}
                  >
                    <span>Load Unenrolled Students for AY {targetYear}</span>
                    <ArrowRight size={14} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Step 2: Student Allocation Table */}
          {hasLoaded && (
            <Card className="border shadow-none mb-3">
              <Card.Header className="bg-body-tertiary py-2 d-flex align-items-center justify-content-between">
                <div className="small fw-semibold d-flex align-items-center gap-2">
                  <span>Step 2: Review Candidates & Assign Details</span>
                  <Badge bg="primary">{candidates.length} Available</Badge>
                  {selectedIds.length > 0 && (
                    <Badge bg="success">Selected: {selectedIds.length}</Badge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-0 px-2 text-xs"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-0 px-2 text-xs"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '40px' }} className="text-center px-2">
                          #
                        </th>
                        <th>Student Code</th>
                        <th>Student Name</th>
                        <th>Gender</th>
                        <th style={{ width: '130px' }}>Roll Number</th>
                        <th style={{ width: '180px' }}>Admission Number</th>
                        <th>Class & Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            All students in the database currently have active enrollments in{' '}
                            {targetYear}.
                          </td>
                        </tr>
                      ) : (
                        candidates.map((c) => {
                          const isSelected = selectedIds.includes(c.studentId);
                          return (
                            <tr
                              key={c.studentId}
                              className={isSelected ? 'table-primary-subtle' : undefined}
                            >
                              <td className="text-center px-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(c.studentId)}
                                  aria-label={`Select ${c.studentName}`}
                                />
                              </td>
                              <td className="font-monospace text-muted">{c.studentCode}</td>
                              <td className="fw-semibold">{c.studentName}</td>
                              <td>{c.gender}</td>
                              <td>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={c.rollNumber}
                                  onChange={(e) => handleUpdateRoll(c.studentId, e.target.value)}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={c.admissionNumber}
                                  onChange={(e) =>
                                    handleUpdateAdmission(c.studentId, e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                {targetClass} ({targetSection})
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>

              <Card.Footer className="bg-body py-2 d-flex align-items-center justify-content-between border-top">
                <span className="small text-muted">
                  Ready to enroll <strong>{selectedIds.length}</strong> student(s).
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => setShowPreview(true)}
                  className="d-flex align-items-center gap-1"
                >
                  <Layers size={14} />
                  <span>Preview Bulk Enrollment ({selectedIds.length})</span>
                </Button>
              </Card.Footer>
            </Card>
          )}

          {/* Preview Modal */}
          <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
            <Modal.Header closeButton className="py-2">
              <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2 text-primary">
                <Layers size={18} />
                <span>Bulk Enrollment Preview ({previewItems.length} Students)</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
              <Alert variant="info" className="py-2 small mb-3">
                <ShieldCheck size={16} className="inline me-1" />
                Review prospective enrollment IDs and class assignments before committing.
              </Alert>

              <div className="table-responsive border rounded" style={{ maxHeight: '300px' }}>
                <Table hover className="align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Student Code</th>
                      <th>Class & Sec</th>
                      <th>Roll #</th>
                      <th>Admission #</th>
                      <th>Prospective Enrollment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.map((item) => (
                      <tr key={item.studentId}>
                        <td className="fw-semibold">{item.studentName}</td>
                        <td className="font-monospace text-muted">{item.studentCode}</td>
                        <td>
                          {item.className} ({item.sectionName})
                        </td>
                        <td>{item.rollNumber}</td>
                        <td className="font-monospace text-muted small">{item.admissionNumber}</td>
                        <td className="font-monospace fw-bold text-primary">
                          {item.prospectiveEnrollmentId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer className="py-2">
              <Button variant="outline-secondary" size="sm" onClick={() => setShowPreview(false)}>
                Back & Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmBulkEnrollment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Batch...' : 'Confirm & Create Enrollments'}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};
