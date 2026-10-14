import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { Teacher, TeacherClassAssignment } from '@/components/pages/teachers/types';
import { useAssignClassTeacherMutation } from '@/store/teachers';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { AcademicYearSectionItem, AcademicYearSummary, ClassItem } from '@/types';

interface AssignClassTeacherModalProps {
  show: boolean;
  teacher: Teacher | null;
  onHide: () => void;
  onSuccess: (newAssignment: TeacherClassAssignment) => void;
}

export const AssignClassTeacherModal: React.FC<AssignClassTeacherModalProps> = ({
  show,
  teacher,
  onHide,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { activeSchool, activeAcademicYear, schools } = useAuth();

  const { data: rtkClasses = [], isLoading: isLoadingClasses } = useGetClassesQuery(undefined, {
    skip: !show,
  });
  const { data: rtkSections = [], isLoading: isLoadingSections } = useGetSectionsQuery(undefined, {
    skip: !show,
  });

  const classes = rtkClasses;
  const sections = rtkSections;
  const isLoadingData = isLoadingClasses || isLoadingSections;

  const [academicYears, setAcademicYears] = useState<AcademicYearSummary[]>([]);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [className, setClassName] = useState('Class 10');
  const [sectionName, setSectionName] = useState('A');
  const [room, setRoom] = useState('Room 304');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{
    existingTeacherId: string;
    existingTeacherName?: string;
  } | null>(null);

  const [assignClassTeacher, { isLoading: isSubmitting }] = useAssignClassTeacherMutation();

  useEffect(() => {
    if (!show) return;

    // Load available academic years
    let loadedYears: AcademicYearSummary[] = [];
    if (activeSchool?.academicYears && activeSchool.academicYears.length > 0) {
      loadedYears = activeSchool.academicYears;
    } else if (schools) {
      const sch = schools.find((s) => s.id === activeSchool?.id);
      if (sch?.academicYears && sch.academicYears.length > 0) {
        loadedYears = sch.academicYears;
      }
    }

    if (loadedYears.length === 0 && activeAcademicYear) {
      loadedYears = [activeAcademicYear];
    }
    if (loadedYears.length === 0) {
      loadedYears = [
        {
          id: 'ay-curr',
          schoolId: activeSchool?.id || 'school-01',
          name: '2026-27',
          code: '2026-27',
          startDate: '2026-04-01',
          endDate: '2027-03-31',
          isCurrent: true,
          status: 'ACTIVE',
        },
      ];
    }

    setAcademicYears(loadedYears);

    // Default academic year
    const defaultYear =
      activeAcademicYear?.name ||
      loadedYears.find((y) => y.isCurrent)?.name ||
      loadedYears[0]?.name ||
      '2026-27';
    setAcademicYear(defaultYear);
  }, [show, activeSchool, activeAcademicYear, schools]);

  // Set initial class when classes load
  useEffect(() => {
    if (classes && classes.length > 0) {
      setClassName((prev) => {
        if (prev && classes.some((c) => c.name === prev)) return prev;
        return classes[0].name;
      });
    }
  }, [classes]);

  // Selected Class Item
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.name === className || c.id === className);
  }, [classes, className]);

  // Filter sections dynamically for the selected class
  const availableSections = useMemo(() => {
    if (!selectedClass) {
      return ['A', 'B', 'C', 'D'].map((s) => ({
        id: `sec-${s.toLowerCase()}`,
        sectionName: s,
        classId: '',
        academicYearId: '',
        schoolId: activeSchool?.id || '',
        maxCapacity: 35,
        currentCount: 0,
      }));
    }

    const matched = sections.filter(
      (s) => s.classId === selectedClass.id || s.className === selectedClass.name,
    );

    if (matched.length > 0) {
      return matched;
    }

    // Default fallback sections for the selected class if not explicitly seeded
    return ['A', 'B', 'C', 'D'].map((s) => ({
      id: `sec-${selectedClass.id}-${s.toLowerCase()}`,
      sectionName: s,
      classId: selectedClass.id,
      academicYearId: '',
      schoolId: activeSchool?.id || '',
      maxCapacity: 35,
      currentCount: 0,
    }));
  }, [sections, selectedClass, activeSchool?.id]);

  // Keep section selection synchronized with available sections
  useEffect(() => {
    if (availableSections.length > 0) {
      if (!sectionName || !availableSections.some((s) => s.sectionName === sectionName)) {
        setSectionName(availableSections[0].sectionName);
      }
    }
  }, [availableSections, sectionName]);

  if (!teacher) return null;

  const performAssignment = async (transferExisting = false) => {
    setErrorMessage(null);

    try {
      const newAssignment = await assignClassTeacher({
        teacherId: teacher.teacherId,
        academicYearName: academicYear,
        className,
        sectionName,
        room: room.trim() || 'Room 101',
        transferExisting,
      }).unwrap();

      toast.success(`Designated as Class Teacher for ${className} (${sectionName}) successfully.`);
      setConflictData(null);
      onSuccess(newAssignment);
      onHide();
    } catch (err: any) {
      const errData = err?.data || err;
      if (errData?.code === 'CLASS_TEACHER_CONFLICT' || errData?.existingTeacherId) {
        setConflictData({
          existingTeacherId: errData.existingTeacherId || 'another teacher',
          existingTeacherName: errData.existingTeacherName,
        });
      } else {
        const msg = errData?.message || err?.message || 'Failed to designate Class Teacher.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performAssignment(false);
  };

  const fullName = `${teacher.firstName} ${teacher.lastName || ''}`.trim();

  return (
    <Modal
      show={show}
      onHide={() => {
        setConflictData(null);
        setErrorMessage(null);
        onHide();
      }}
      centered
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Award size={18} className="text-warning" />
            <span>Class Teacher Assignment</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-3">
          {errorMessage && (
            <Alert
              variant="danger"
              className="small py-2 mb-3"
              dismissible
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {conflictData && (
            <Alert variant="warning" className="small py-2 mb-3">
              <div className="d-flex align-items-start gap-2">
                <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-1" />
                <div>
                  <strong>Assignment Conflict Detected:</strong>
                  <div className="mt-1">
                    {className} Section {sectionName} is already assigned to{' '}
                    <span className="fw-semibold">
                      {conflictData.existingTeacherName || conflictData.existingTeacherId}
                    </span>
                    .
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      className="text-dark fw-semibold"
                      disabled={isSubmitting}
                      onClick={() => performAssignment(true)}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Transferring...
                        </>
                      ) : (
                        <>
                          Transfer Assignment <ArrowRight size={14} className="ms-1" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => setConflictData(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <div className="mb-3 pb-2 border-bottom">
            <div className="text-muted small">Designating Class Teacher:</div>
            <div className="fw-bold">{fullName}</div>
            <div className="font-monospace small text-primary">{teacher.teacherId}</div>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Academic Year</Form.Label>
            <Form.Select
              size="sm"
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setConflictData(null);
              }}
              disabled={isSubmitting || isLoadingData}
            >
              {academicYears.map((ay) => (
                <option key={ay.id || ay.name} value={ay.name}>
                  {ay.name} {ay.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="g-2 mb-2">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Class</Form.Label>
                <Form.Select
                  size="sm"
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    setConflictData(null);
                  }}
                  disabled={isSubmitting || isLoadingData}
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} {cls.code ? `(${cls.code})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Section</Form.Label>
                <Form.Select
                  size="sm"
                  value={sectionName}
                  onChange={(e) => {
                    setSectionName(e.target.value);
                    setConflictData(null);
                  }}
                  disabled={isSubmitting || isLoadingData}
                >
                  {availableSections.map((sec) => (
                    <option key={sec.id || sec.sectionName} value={sec.sectionName}>
                      Section {sec.sectionName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Designated Class Room</Form.Label>
            <Form.Control
              size="sm"
              placeholder="e.g. Room 304 / Senior Wing"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Alert variant="light" className="border small py-2 mb-0">
            <strong>Policy Rule:</strong> Each class section can only have one primary Class Teacher
            per academic session. If a conflict occurs, you may transfer the role.
          </Alert>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setConflictData(null);
              setErrorMessage(null);
              onHide();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="warning"
            size="sm"
            type="submit"
            className="text-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Assigning...
              </>
            ) : (
              'Assign as Class Teacher'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
