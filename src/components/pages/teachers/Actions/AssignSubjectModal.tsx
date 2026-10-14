import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { BookOpen } from 'lucide-react';
import { Teacher, TeacherSubjectAssignment } from '@/components/pages/teachers/types';
import { useAssignSubjectMutation } from '@/store/teachers';
import {
  useGetClassesQuery,
  useGetSectionsQuery,
  useGetSubjectsQuery,
  useGetCurriculumQuery,
} from '@/store/academic';
import {
  ClassItem,
  AcademicYearSectionItem,
  SubjectItem,
  ClassSubjectItem,
  AcademicYearSummary,
} from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

interface AssignSubjectModalProps {
  show: boolean;
  teacher: Teacher | null;
  onHide: () => void;
  onSuccess: (newAssignment: TeacherSubjectAssignment) => void;
}

// Dynamic assignment types supported across the academic system
const ASSIGNMENT_TYPES = [
  { value: 'Subject Teacher', label: 'Subject Teacher' },
  { value: 'Assistant Teacher', label: 'Assistant Teacher' },
  { value: 'Lab Instructor', label: 'Lab Instructor' },
  { value: 'Co-Teacher', label: 'Co-Teacher' },
  { value: 'Guest Lecturer', label: 'Guest Lecturer' },
] as const;

export const AssignSubjectModal: React.FC<AssignSubjectModalProps> = ({
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
  const { data: rtkSubjects = [], isLoading: isLoadingSubjects } = useGetSubjectsQuery(undefined, {
    skip: !show,
  });
  const { data: rtkCurriculum = [], isLoading: isLoadingCurriculum } = useGetCurriculumQuery(undefined, {
    skip: !show,
  });

  const classes = rtkClasses;
  const sections = rtkSections;
  const subjects = rtkSubjects;
  const classSubjects = rtkCurriculum;
  const isLoadingData =
    isLoadingClasses || isLoadingSections || isLoadingSubjects || isLoadingCurriculum;

  const [academicYears, setAcademicYears] = useState<AcademicYearSummary[]>([]);

  // Form selections
  const [academicYear, setAcademicYear] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [sectionName, setSectionName] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(6);
  const [assignmentType, setAssignmentType] = useState<
    'Subject Teacher' | 'Assistant Teacher' | 'Lab Instructor'
  >('Subject Teacher');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [assignSubject, { isLoading: isSubmitting }] = useAssignSubjectMutation();

  // 1. Load dynamic academic data when modal is displayed or school changes
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

  // Pre-select initial class when classes load
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

  // 2. Filter sections dynamically for the selected class
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

  // 3. Dynamic curriculum subjects mapped for the selected class
  const mappedClassSubjects = useMemo(() => {
    if (!selectedClass) return [];
    return classSubjects
      .filter((cs) => cs.classId === selectedClass.id)
      .map((cs) => {
        const fullSubject = subjects.find((s) => s.id === cs.subjectId);
        return {
          id: cs.subjectId,
          name: fullSubject?.name || cs.subjectName || 'Subject',
          code: fullSubject?.code,
          weeklyPeriods: cs.weeklyPeriods || 5,
          isCurriculum: true,
        };
      });
  }, [classSubjects, selectedClass, subjects]);

  // Keep subject selection synchronized
  useEffect(() => {
    if (subjects.length > 0 && !subjectName) {
      if (mappedClassSubjects.length > 0) {
        setSubjectName(mappedClassSubjects[0].name);
        setPeriodsPerWeek(mappedClassSubjects[0].weeklyPeriods);
      } else {
        setSubjectName(subjects[0].name);
      }
    }
  }, [subjects, mappedClassSubjects, subjectName]);

  // Handler for class change (updates class and auto-aligns periods if subject exists)
  const handleClassChange = (newClassName: string) => {
    setClassName(newClassName);
    const targetClass = classes.find((c) => c.name === newClassName);
    if (targetClass) {
      const curMapped = classSubjects.find(
        (cs) =>
          cs.classId === targetClass.id &&
          (cs.subjectName === subjectName || cs.subjectId === subjectName),
      );
      if (curMapped?.weeklyPeriods) {
        setPeriodsPerWeek(curMapped.weeklyPeriods);
      }
    }
  };

  // Handler for subject change (auto-sets recommended weekly periods if mapped)
  const handleSubjectChange = (newSubjectName: string) => {
    setSubjectName(newSubjectName);
    const mapped = mappedClassSubjects.find((m) => m.name === newSubjectName);
    if (mapped && mapped.weeklyPeriods) {
      setPeriodsPerWeek(mapped.weeklyPeriods);
    }
  };

  if (!teacher) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const newAssignment = await assignSubject({
        teacherId: teacher.teacherId,
        academicYearName: academicYear || '2026-27',
        className: className || 'Class 10',
        sectionName: sectionName || 'A',
        subjectName: subjectName || 'Mathematics',
        periodsPerWeek: Number(periodsPerWeek) || 5,
        assignmentType,
      }).unwrap();

      toast.success(`Assigned ${subjectName} to ${className} (${sectionName}) successfully.`);
      onSuccess(newAssignment);
      onHide();
    } catch (err: any) {
      const msg = getApiErrorMessage(
        err,
        'Failed to assign subject. Please verify data.',
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  const fullName = `${teacher.firstName} ${teacher.lastName || ''}`.trim();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <BookOpen size={18} className="text-success" />
            <span>Assign Subject Teaching Load</span>
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

          <div className="mb-3 pb-2 border-bottom">
            <div className="text-muted small">Assigning subject to:</div>
            <div className="fw-bold">{fullName}</div>
            <div className="font-monospace small text-primary">{teacher.teacherId}</div>
          </div>

          <Row className="g-2 mb-2">
            {/* Dynamic Academic Year Dropdown */}
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Academic Year</Form.Label>
                <Form.Select
                  size="sm"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  disabled={isSubmitting || isLoadingData}
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id || ay.name} value={ay.name}>
                      {ay.name} {ay.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Dynamic Assignment Type Dropdown */}
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Assignment Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  disabled={isSubmitting}
                >
                  {ASSIGNMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-2">
            {/* Dynamic Class Dropdown */}
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Class</Form.Label>
                <Form.Select
                  size="sm"
                  value={className}
                  onChange={(e) => handleClassChange(e.target.value)}
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

            {/* Dynamic Section Dropdown (Filtered by selected Class) */}
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Section</Form.Label>
                <Form.Select
                  size="sm"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  disabled={isSubmitting || isLoadingData}
                >
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.sectionName}>
                      Section {sec.sectionName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-3">
            {/* Dynamic Subject Dropdown */}
            <Col xs={8}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Subject</Form.Label>
                <Form.Select
                  size="sm"
                  value={subjectName}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={isSubmitting || isLoadingData}
                >
                  {mappedClassSubjects.length > 0 ? (
                    <>
                      <optgroup label={`Curriculum Subjects for ${className}`}>
                        {mappedClassSubjects.map((sub) => (
                          <option key={`curr-${sub.id}`} value={sub.name}>
                            {sub.name} {sub.code ? `(${sub.code})` : ''} — {sub.weeklyPeriods}{' '}
                            periods/wk
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="All School Subjects">
                        {subjects
                          .filter((s) => !mappedClassSubjects.some((m) => m.name === s.name))
                          .map((sub) => (
                            <option key={sub.id} value={sub.name}>
                              {sub.name} {sub.code ? `(${sub.code})` : ''}
                            </option>
                          ))}
                      </optgroup>
                    </>
                  ) : (
                    subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name} {sub.code ? `(${sub.code})` : ''}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Periods/Wk</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="25"
                  size="sm"
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                  disabled={isSubmitting}
                />
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="light" className="border small py-2 mb-0">
            <strong>Architecture Notice:</strong> Subject assignments are separate operational
            records referencing <span className="font-monospace">{teacher.teacherId}</span>, keeping
            the Teacher master clean and permanent.
          </Alert>
        </Modal.Body>

        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="success" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Assigning...
              </>
            ) : (
              'Assign Subject'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
