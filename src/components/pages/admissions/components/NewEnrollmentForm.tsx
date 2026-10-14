import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentItem } from '@/components/pages/students/types';
import { Enrollment, EnrollmentStatus } from '../types';
import {
  useCreateEnrollmentMutation,
  useGetEnrollmentsByStudentIdQuery,
} from '@/store/enrollment';
import { useGetClassesQuery, useGetSectionsQuery } from '@/store/academic';
import { buildAdmissionNumber, identifierConfig } from '@/config/identifiers';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

interface FormProps {
  student: StudentItem;
  onSuccess: (newEnrollment: Enrollment) => void;
  onCancel: () => void;
}

export const NewEnrollmentForm: React.FC<FormProps> = ({ student, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [createEnrollmentMutation, { isLoading: isSubmitting }] = useCreateEnrollmentMutation();
  const { data: studentEnrollmentsData } = useGetEnrollmentsByStudentIdQuery(student.id, {
    skip: !student.id,
  });
  const { data: classesData } = useGetClassesQuery();
  const { data: sectionsData } = useGetSectionsQuery();

  const availableYears = useMemo(() => ['2026-2027', '2025-2026', '2024-2025'], []);

  const availableClasses = useMemo(() => {
    const raw = Array.isArray(classesData?.data)
      ? classesData.data
      : Array.isArray(classesData)
        ? classesData
        : [];
    if (raw.length > 0) {
      return raw.map((c: any) => c.name || `Class ${c.numericOrder}`);
    }
    return [
      'Class 1',
      'Class 2',
      'Class 3',
      'Class 4',
      'Class 5',
      'Class 6',
      'Class 7',
      'Class 8',
      'Class 9',
      'Class 10',
    ];
  }, [classesData]);

  const availableSections = useMemo(() => {
    const raw = Array.isArray(sectionsData?.data)
      ? sectionsData.data
      : Array.isArray(sectionsData)
        ? sectionsData
        : [];
    if (raw.length > 0) {
      const names = Array.from(new Set(raw.map((s: any) => s.sectionName || s.name))).filter(Boolean);
      if (names.length > 0) return names as string[];
    }
    return ['Section A', 'Section B', 'Section C', 'Section D'];
  }, [sectionsData]);

  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [targetClass, setTargetClass] = useState(student.currentClass || 'Class 5');
  const [targetSection, setTargetSection] = useState(student.currentSection || 'Section A');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState(
    student.admissionNumber || buildAdmissionNumber(2026, Math.floor(100 + Math.random() * 900)),
  );
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>('NEW');
  const [previousSchool, setPreviousSchool] = useState(student.previousSchool || '');
  const [remarks, setRemarks] = useState('');

  // Generated prospective Enrollment ID for preview
  const [previewEnrollmentId, setPreviewEnrollmentId] = useState('');

  useEffect(() => {
    const yearPrefix = academicYear.split('-')[0] || '2026';
    setPreviewEnrollmentId(`ENR-${yearPrefix}-AUTO`);
  }, [academicYear]);

  // Duplicate Check against student enrollments
  const duplicateCheck = useMemo(() => {
    const raw = Array.isArray(studentEnrollmentsData?.data)
      ? studentEnrollmentsData.data
      : Array.isArray(studentEnrollmentsData)
        ? studentEnrollmentsData
        : [];
    const existing = raw.find(
      (e: any) =>
        (e.academicYearName === academicYear || e.academicYearId === academicYear) &&
        e.status !== 'CANCELLED',
    );
    return {
      hasDuplicate: Boolean(existing),
      existingEnrollment: existing || null,
    };
  }, [studentEnrollmentsData, academicYear]);

  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateCheck.hasDuplicate) {
      return;
    }

    try {
      const res = await createEnrollmentMutation({
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: fullName,
        academicYearName: academicYear,
        className: targetClass,
        sectionName: targetSection,
        admissionNumber,
        rollNumber,
        enrollmentDate,
        status: enrollmentStatus,
        previousSchool,
        remarks,
      }).unwrap();

      const created = res?.data || res;
      onSuccess(created);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Error creating enrollment'));
    }
  };

  return (
    <Card className="border shadow-none">
      <Card.Header className="bg-body-tertiary py-2">
        <span className="small fw-semibold d-flex align-items-center gap-1">
          <CheckCircle2 size={15} className="text-primary" />
          <span>Step 2: Enrollment & Class Allocation</span>
        </span>
      </Card.Header>

      <Card.Body className="p-3">
        {duplicateCheck.hasDuplicate && duplicateCheck.existingEnrollment && (
          <Alert variant="danger" className="small py-2 mb-3">
            <div className="d-flex align-items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-grow-1">
                <strong>Duplicate Enrollment Detected:</strong>
                <div>
                  This student already has an active enrollment (
                  <span className="font-monospace fw-bold">
                    {duplicateCheck.existingEnrollment.enrollmentId}
                  </span>{' '}
                  - {duplicateCheck.existingEnrollment.className}{' '}
                  {duplicateCheck.existingEnrollment.sectionName}) for academic year {academicYear}.
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="py-0 px-2 small d-inline-flex align-items-center gap-1"
                    onClick={() =>
                      navigate(
                        `/admissions/view/${duplicateCheck.existingEnrollment?.enrollmentId}`,
                      )
                    }
                  >
                    <span>View Existing Enrollment</span>
                    <ExternalLink size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Read-only System & Identity Identifiers */}
          <div className="bg-body-tertiary p-2 rounded border mb-3 small">
            <Row className="g-2 align-items-center">
              <Col xs={12} sm={4}>
                <span className="text-muted">Student Name:</span> <strong>{fullName}</strong>
              </Col>
              <Col xs={6} sm={4}>
                <span className="text-muted">Student Code:</span>{' '}
                <span className="font-monospace fw-bold text-dark">{student.studentCode}</span>{' '}
                <span className="text-muted text-xs">(Read-only)</span>
              </Col>
              <Col xs={6} sm={4}>
                <span className="text-muted">Enrollment ID:</span>{' '}
                <span className="font-monospace text-primary fw-bold">{previewEnrollmentId}</span>{' '}
                <span className="text-muted text-xs">(System Generated)</span>
              </Col>
            </Row>
          </div>

          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">
                  Academic Year <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  size="sm"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      AY {y} {y === '2026-2027' ? '(Active Session)' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">
                  Class <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  size="sm"
                  required
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

            <Col xs={6} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">
                  Section <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  size="sm"
                  required
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

            <Col xs={6} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Roll Number</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="e.g. 15"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
                <Form.Text className="text-muted text-xs">Section roll number</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={6} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Admission Number</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder={`e.g. ${identifierConfig.businessCodes.admission.examples[0]}`}
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                />
                <Form.Text className="text-muted text-xs">Admission ledger reference</Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">
                  Enrollment Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  required
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Enrollment Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value as EnrollmentStatus)}
                >
                  <option value="NEW">New (Default)</option>
                  <option value="PROMOTED">Promoted</option>
                  <option value="REPEAT">Repeat</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={8}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Previous School / Board</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="e.g. Delhi Public Preparatory, CBSE"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-medium mb-1">Remarks & Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  placeholder="Optional admission remarks or special instructions"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-between pt-3 border-top">
            <Button variant="outline-secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={duplicateCheck.hasDuplicate}
              className="d-flex align-items-center gap-1"
            >
              <span>Create Enrollment</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
