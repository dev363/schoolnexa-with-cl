import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Card, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { UserCheck, Star, BookOpen, Plus, Activity, Clock, Award, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  StaffMember,
  AcademicYearSectionItem,
  ClassSubjectItem,
  TeacherAssignmentItem,
} from '@/types';
import { useGetTeacherAssignmentsQuery } from '@/store/teachers';

interface AssignFacultyModalProps {
  show: boolean;
  onHide: () => void;
  sections: AcademicYearSectionItem[];
  staffList: StaffMember[];
  classSubjects: ClassSubjectItem[];
  assignments: TeacherAssignmentItem[];
  initialSectionId?: string;
  initialStaffId?: string;
  onOpenQuickAddTeacher: () => void;
  onSubmit: (formData: {
    academicYearSectionId: string;
    staffId: string;
    subjectId: string | null;
    isClassTeacher: boolean;
  }) => Promise<void>;
  isProcessing: boolean;
}

export const AssignFacultyModal: React.FC<AssignFacultyModalProps> = ({
  show,
  onHide,
  sections,
  staffList,
  classSubjects,
  assignments,
  initialSectionId,
  initialStaffId,
  onOpenQuickAddTeacher,
  onSubmit,
  isProcessing,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({
    academicYearSectionId: '',
    staffId: '',
    subjectId: '',
    isClassTeacher: false,
  });

  // Set initial form state when modal opens or sections/staff change
  useEffect(() => {
    if (show) {
      const selectedSecId = initialSectionId || sections[0]?.id || '';
      const selectedSec = sections.find((s) => s.id === selectedSecId);
      const availableSubs = selectedSec
        ? classSubjects.filter((cs) => cs.classId === selectedSec.classId)
        : [];

      setForm({
        academicYearSectionId: selectedSecId,
        staffId: initialStaffId || staffList[0]?.id || '',
        subjectId: availableSubs[0]?.subjectId || '',
        isClassTeacher: false,
      });
    }
  }, [show, initialSectionId, initialStaffId, sections, staffList]);

  const selectedSection = sections.find((s) => s.id === form.academicYearSectionId);
  const availableSubjects = selectedSection
    ? classSubjects.filter((cs) => cs.classId === selectedSection.classId)
    : [];

  const selectedStaff = staffList.find(
    (s) => s.id === form.staffId || s.employeeCode === form.staffId,
  );

  // Check if this section already has a class teacher
  const currentSectionClassTeacherAsg = assignments.find(
    (a) => a.academicYearSectionId === form.academicYearSectionId && a.isClassTeacher,
  );

  // Check teacher's current workload via RTK Query
  const teacherId = selectedStaff?.employeeCode || selectedStaff?.id || '';
  const { data: teacherAssignmentsData } = useGetTeacherAssignmentsQuery(teacherId, {
    skip: !teacherId,
  });
  const teacherWorkloadSubjects = teacherAssignmentsData?.subjectAssignments || [];
  const teacherCT = teacherAssignmentsData?.classAssignment;
  const currentWeeklyPeriods = teacherWorkloadSubjects
    .filter((a) => a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.periodsPerWeek) || 5), 0);

  const handleSectionChange = (secId: string) => {
    const sec = sections.find((s) => s.id === secId);
    const validSubs = sec ? classSubjects.filter((cs) => cs.classId === sec.classId) : [];
    setForm((prev) => ({
      ...prev,
      academicYearSectionId: secId,
      subjectId: validSubs[0]?.subjectId || '',
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.academicYearSectionId || !form.staffId) return;

    await onSubmit({
      academicYearSectionId: form.academicYearSectionId,
      staffId: form.staffId,
      subjectId: form.subjectId ? form.subjectId : null,
      isClassTeacher: form.isClassTeacher,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className={isDark ? 'bg-dark text-white border-secondary' : ''}>
        <Modal.Title
          style={{ fontSize: '1rem' }}
          className="fw-bold d-flex align-items-center gap-2"
        >
          <UserCheck size={18} className="text-primary" />
          <span>Assign Faculty to Section</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body className={isDark ? 'bg-dark text-white' : ''}>
          <p className="text-muted small mb-3">
            Allocate a teacher as Homeroom Class Teacher or Subject Master for this academic
            section.
          </p>

          <Row className="g-3">
            {/* Classroom Section Selection */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Classroom Section *</Form.Label>
                <Form.Select
                  size="sm"
                  required
                  value={form.academicYearSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.className} - Section {s.sectionName}
                    </option>
                  ))}
                </Form.Select>
                {currentSectionClassTeacherAsg && (
                  <div
                    className="text-muted small mt-1 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Award size={12} className="text-warning" />
                    <span>
                      Current Class Teacher:{' '}
                      <strong>{currentSectionClassTeacherAsg.staffName}</strong>
                    </span>
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Faculty Teacher Selection */}
            <Col md={6}>
              <Form.Group>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label className="small fw-semibold mb-0">Faculty Teacher *</Form.Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                    onClick={onOpenQuickAddTeacher}
                  >
                    <Plus size={12} />
                    <span>+ Add New Teacher</span>
                  </Button>
                </div>
                <Form.Select
                  size="sm"
                  required
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({stf.employeeCode}) - {stf.departmentName} [
                      {stf.designationName}]
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Selected Teacher Workload & Allocation Summary Card */}
            {selectedStaff && (
              <Col xs={12}>
                <Card
                  className={`border ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light'}`}
                >
                  <Card.Body className="p-2.5">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded bg-primary bg-opacity-10 text-primary p-1.5 d-flex align-items-center justify-content-center">
                          <Activity size={16} />
                        </div>
                        <div>
                          <div className="fw-semibold small">
                            {selectedStaff.firstName} {selectedStaff.lastName}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {selectedStaff.departmentName} • {selectedStaff.designationName} •{' '}
                            {selectedStaff.qualification || 'B.Ed'}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="info" className="text-dark fw-normal px-2 py-1 font-monospace">
                          <Clock size={11} className="me-1" />
                          {currentWeeklyPeriods} / 24 Periods/Wk
                        </Badge>

                        {teacherCT ? (
                          <Badge bg="warning" text="dark" className="fw-normal px-2 py-1">
                            <Star size={11} className="me-1 fill-current" />
                            CT: {teacherCT.className}-{teacherCT.sectionName}
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="fw-normal px-2 py-1">
                            No Homeroom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}

            {/* Homeroom / Class Teacher Designation */}
            <Col xs={12}>
              <Card className="border-warning bg-warning bg-opacity-10">
                <Card.Body className="p-2.5">
                  <Form.Check
                    type="checkbox"
                    id="isClassTeacherCheckbox"
                    checked={form.isClassTeacher}
                    onChange={(e) => setForm({ ...form, isClassTeacher: e.target.checked })}
                    label={
                      <span className="small fw-semibold text-warning-emphasis d-flex align-items-center gap-1.5">
                        <Star size={14} className="fill-current" />
                        Designate as Section Class Teacher (Homeroom)
                      </span>
                    }
                  />
                  <div
                    className="text-muted small mt-1"
                    style={{ fontSize: '0.75rem', paddingLeft: '1.5rem' }}
                  >
                    {currentSectionClassTeacherAsg ? (
                      <span className="text-warning-emphasis">
                        <AlertCircle size={12} className="me-1 d-inline" />
                        Note: Section currently has{' '}
                        <strong>{currentSectionClassTeacherAsg.staffName}</strong> designated.
                        Confirming will transfer Homeroom duty.
                      </span>
                    ) : (
                      'Enforces maximum one active Class Teacher per section for student roster management and attendance.'
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Subject Assignment */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-semibold mb-1">Subject Assignment</Form.Label>
                <Form.Select
                  size="sm"
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                >
                  <option value="">None (Homeroom / Class Teacher Only)</option>
                  {availableSubjects.map((cs) => {
                    const existingAsg = assignments.find(
                      (a) =>
                        a.academicYearSectionId === form.academicYearSectionId &&
                        a.subjectId === cs.subjectId,
                    );
                    return (
                      <option key={cs.subjectId} value={cs.subjectId}>
                        {cs.subjectCode} - {cs.subjectName} ({cs.weeklyPeriods} periods/wk)
                        {existingAsg ? ` [Currently: ${existingAsg.staffName}]` : ''}
                      </option>
                    );
                  })}
                </Form.Select>
                <Form.Text className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  Select a curriculum subject mapped to this class standard, or choose None if
                  assigning only homeroom duties.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className={isDark ? 'bg-dark text-white border-secondary' : ''}>
          <Button variant="secondary" size="sm" onClick={onHide} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Assigning...
              </>
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
