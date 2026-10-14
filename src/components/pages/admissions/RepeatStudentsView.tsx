import React, { useState, useMemo, useEffect } from 'react';
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
import { ArrowLeft, RotateCcw, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Enrollment } from './types';
import {
  useGetEnrollmentsQuery,
  useRepeatStudentsMutation,
} from '@/store/enrollment';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { StatusBadge } from './components/StatusBadge';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const RepeatStudentsView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const preselectedEnrollmentId = searchParams.get('sourceEnrollmentId');

  const { data: enrollmentsData } = useGetEnrollmentsQuery();
  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery();
  const [repeatStudentsMutation] = useRepeatStudentsMutation();

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

  // Form State
  const [sourceYear, setSourceYear] = useState('2025-2026');
  const [targetYear, setTargetYear] = useState('2026-2027');
  const [targetClass, setTargetClass] = useState('Class 5');
  const [targetSection, setTargetSection] = useState('Section B');
  const [repeatReason, setRepeatReason] = useState('Academic evaluation retention');

  // Candidates
  const [candidates, setCandidates] = useState<Enrollment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Preview & Processing
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [repeatResults, setRepeatResults] = useState<Enrollment[] | null>(null);

  const isSameYear = sourceYear === targetYear;

  // Load roster
  const handleLoadStudents = () => {
    const raw = Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : Array.isArray(enrollmentsData) ? enrollmentsData : [];
    const filtered = raw.filter(
      (e: any) =>
        (e.academicYearName === sourceYear || e.academicYearId === sourceYear) &&
        e.className === targetClass &&
        e.status !== 'TRANSFERRED' &&
        e.status !== 'CANCELLED',
    );
    setCandidates(filtered);
    if (preselectedEnrollmentId) {
      setSelectedIds(
        filtered.some((f: any) => f.enrollmentId === preselectedEnrollmentId || f.id === preselectedEnrollmentId)
          ? [preselectedEnrollmentId]
          : [],
      );
    } else {
      setSelectedIds([]);
    }
    setHasLoaded(true);
  };

  useEffect(() => {
    if (preselectedEnrollmentId && enrollmentsData) {
      const raw = Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : Array.isArray(enrollmentsData) ? enrollmentsData : [];
      const enr = raw.find((e: any) => e.enrollmentId === preselectedEnrollmentId || e.id === preselectedEnrollmentId);
      if (enr) {
        setSourceYear(enr.academicYearName);
        setTargetClass(enr.className);
        setTargetYear(enr.academicYearName === '2025-2026' ? '2026-2027' : '2027-2028');
        setTargetSection(enr.sectionName);
      }
    }
  }, [preselectedEnrollmentId, enrollmentsData]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(candidates.map((c) => c.enrollmentId));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  // Preview items
  const previewItems = useMemo(() => {
    const yearPrefix = targetYear.split('-')[0] || '2026';
    return selectedIds
      .map((id, index) => {
        const enr = candidates.find((c) => c.enrollmentId === id);
        if (!enr) return null;
        return {
          studentName: enr.studentName,
          studentCode: enr.studentCode,
          studentId: enr.studentId,
          oldEnrollmentId: enr.enrollmentId,
          oldAcademicYear: enr.academicYearName,
          oldClass: enr.className,
          oldSection: enr.sectionName,
          newAcademicYear: targetYear,
          newClass: targetClass,
          newSection: targetSection,
          prospectiveEnrollmentId: `ENR-${yearPrefix}-${String(500 + index + 1).padStart(6, '0')}`,
          status: 'REPEAT' as const,
        };
      })
      .filter(Boolean) as Array<any>;
  }, [selectedIds, candidates, targetYear, targetClass, targetSection]);

  const handleConfirmRepeat = async () => {
    setIsProcessing(true);
    try {
      const payload = previewItems.map((item) => ({
        studentId: item.studentId,
        studentCode: item.studentCode,
        studentName: item.studentName,
        oldEnrollmentId: item.oldEnrollmentId,
        targetAcademicYear: targetYear,
        targetClass: targetClass,
        targetSection: targetSection,
        remarks: repeatReason,
      }));

      const res = await repeatStudentsMutation(payload).unwrap();
      const results = res?.data || res;
      setRepeatResults(results);
      setShowPreview(false);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to process repeat enrollments'));
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
                className="rounded bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <RotateCcw size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Student Repeat Enrollment
                  </h5>
                  <Badge bg="warning" text="dark" className="fw-normal">
                    Session Retention
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Enroll students to repeat a grade in a subsequent academic session. Historical
                  records remain preserved.
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

      {/* Success Notification */}
      {repeatResults ? (
        <Alert variant="success" className="p-3 mb-4">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">
                Generated {repeatResults.length} Repeat Enrollment
                {repeatResults.length > 1 ? 's' : ''}!
              </h6>
              <p className="small mb-2">
                New enrollment records have been established for academic year{' '}
                <strong>{targetYear}</strong> in{' '}
                <strong>
                  {targetClass} ({targetSection})
                </strong>{' '}
                with status <strong className="text-warning">REPEAT</strong>.
              </p>
              <div className="d-flex gap-2 mt-3">
                <Button variant="success" size="sm" onClick={() => navigate('/admissions')}>
                  View All Enrollments
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setRepeatResults(null);
                    setHasLoaded(false);
                    setSelectedIds([]);
                  }}
                >
                  Process More Repeats
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <>
          {/* Criteria Card */}
          <Card className="border shadow-none mb-3">
            <Card.Header className="bg-body-tertiary py-2">
              <span className="small fw-semibold">Step 1: Select Repeat Session & Cohort</span>
            </Card.Header>
            <Card.Body className="p-3">
              {isSameYear && (
                <Alert variant="danger" className="small py-2 mb-3 d-flex align-items-center gap-2">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  <span>Source and target academic years cannot be the same.</span>
                </Alert>
              )}

              <Row className="g-3">
                <Col xs={12} sm={6} md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">From Academic Year</Form.Label>
                    <Form.Select
                      size="sm"
                      value={sourceYear}
                      onChange={(e) => setSourceYear(e.target.value)}
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
                    <Form.Label className="small fw-medium mb-1 text-primary">
                      Repeat in Academic Year
                    </Form.Label>
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
                    <Form.Label className="small fw-medium mb-1">Class</Form.Label>
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

                <Col xs={12} md={9}>
                  <Form.Group>
                    <Form.Label className="small fw-medium mb-1">
                      Repetition Reason / Approval Note
                    </Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      value={repeatReason}
                      onChange={(e) => setRepeatReason(e.target.value)}
                      placeholder="e.g. Academic Council recommendation / attendance shortage / athletic conditioning"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={3} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100 py-2 d-flex align-items-center justify-content-center gap-1"
                    onClick={handleLoadStudents}
                    disabled={isSameYear}
                  >
                    <span>Load Students</span>
                    <ArrowRight size={14} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Roster Table */}
          {hasLoaded && (
            <Card className="border shadow-none mb-3">
              <Card.Header className="bg-body-tertiary py-2 d-flex align-items-center justify-content-between">
                <div className="small fw-semibold d-flex align-items-center gap-2">
                  <span>Select Students for Repetition</span>
                  <Badge bg="primary">{candidates.length} Loaded</Badge>
                  {selectedIds.length > 0 && (
                    <Badge bg="warning" text="dark">
                      Selected: {selectedIds.length}
                    </Badge>
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
                        <th>Current Class</th>
                        <th>Current Section</th>
                        <th>Current Enrollment ID</th>
                        <th>Repeat In Class</th>
                        <th>Repeat In Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4 text-muted">
                            No students found matching this class in AY {sourceYear}.
                          </td>
                        </tr>
                      ) : (
                        candidates.map((c) => {
                          const isSelected = selectedIds.includes(c.enrollmentId);
                          return (
                            <tr
                              key={c.id}
                              className={isSelected ? 'table-warning-subtle' : undefined}
                            >
                              <td className="text-center px-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(c.enrollmentId)}
                                  aria-label={`Select ${c.studentName}`}
                                />
                              </td>
                              <td className="font-monospace text-muted">{c.studentCode}</td>
                              <td className="fw-semibold">{c.studentName}</td>
                              <td>{c.className}</td>
                              <td>{c.sectionName}</td>
                              <td className="font-monospace text-primary">{c.enrollmentId}</td>
                              <td className="fw-bold text-warning">{targetClass}</td>
                              <td>{targetSection}</td>
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
                  Selected <strong>{selectedIds.length}</strong> student(s) to repeat.
                </span>
                <Button
                  variant="warning"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => setShowPreview(true)}
                  className="d-flex align-items-center gap-1"
                >
                  <RotateCcw size={14} />
                  <span>Preview Repetition ({selectedIds.length})</span>
                </Button>
              </Card.Footer>
            </Card>
          )}

          {/* Preview Modal */}
          <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
            <Modal.Header closeButton className="py-2">
              <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2 text-warning">
                <RotateCcw size={18} />
                <span>Repeat Enrollment Preview ({previewItems.length} Students)</span>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
              <Alert variant="info" className="py-2 small mb-3">
                Old enrollment records will remain unchanged as historical records. A new enrollment
                record will be generated in academic session <strong>{targetYear}</strong> with
                status{' '}
                <Badge bg="warning" text="dark">
                  REPEAT
                </Badge>
                .
              </Alert>

              <div className="table-responsive border rounded" style={{ maxHeight: '300px' }}>
                <Table hover className="align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Old Enrollment</th>
                      <th>Class & Sec</th>
                      <th>New Academic Year</th>
                      <th>New Enrollment ID</th>
                      <th>New Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.map((item) => (
                      <tr key={item.oldEnrollmentId}>
                        <td className="fw-semibold">{item.studentName}</td>
                        <td className="font-monospace text-muted">{item.oldEnrollmentId}</td>
                        <td>
                          {item.newClass} ({item.newSection})
                        </td>
                        <td>{item.newAcademicYear}</td>
                        <td className="font-monospace fw-bold text-primary">
                          {item.prospectiveEnrollmentId}
                        </td>
                        <td>
                          <StatusBadge status="REPEAT" size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer className="py-2">
              <Button variant="outline-secondary" size="sm" onClick={() => setShowPreview(false)}>
                Back
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={handleConfirmRepeat}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm & Process Repeat Enrollments'}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};
