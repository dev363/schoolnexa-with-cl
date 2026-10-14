import React, { useState, useMemo } from 'react';
import { Card, Button, Table, Form, Badge, Alert, Modal, Row, Col } from 'react-bootstrap';
import {
  Zap,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { LessonRequirement, TimetableSetupConfig } from '@/services/timetable/types';
import { AcademicYearSectionItem, ClassItem, StaffMember, SubjectItem } from '@/types';

interface TimetableAssignmentProps {
  requirements: LessonRequirement[];
  onChangeRequirements: (updated: LessonRequirement[]) => void;
  config: TimetableSetupConfig;
  classes: ClassItem[];
  sections: AcademicYearSectionItem[];
  subjects: SubjectItem[];
  staff: StaffMember[];
  onAutoSetup: () => void;
  onSeedBenchmark: () => void;
  onApplyToSections: (sourceSectionId: string, targetSectionIds: string[]) => void;
  onCopyPreviousYear: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const TimetableAssignment: React.FC<TimetableAssignmentProps> = ({
  requirements,
  onChangeRequirements,
  config,
  classes,
  sections,
  subjects,
  staff,
  onAutoSetup,
  onSeedBenchmark,
  onApplyToSections,
  onCopyPreviousYear,
  onNext,
  onBack,
}) => {
  // Selected section to view/edit in table
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
    return sections[0]?.id || '';
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState<string>('');
  const [newTeacherId, setNewTeacherId] = useState<string>('');
  const [newPeriodsPerWeek, setNewPeriodsPerWeek] = useState<number>(5);

  // For copy modal
  const [targetSectionsToApply, setTargetSectionsToApply] = useState<string[]>([]);

  // Capacity calculations
  const totalWeeklyCapacity = config.workingDays.length * config.periodsPerDay;

  // Currently selected section requirements
  const currentSectionReqs = useMemo(() => {
    return requirements.filter((r) => r.sectionId === selectedSectionId);
  }, [requirements, selectedSectionId]);

  const currentSectionObj = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId);
  }, [sections, selectedSectionId]);

  const currentClassObj = useMemo(() => {
    return classes.find((c) => c.id === currentSectionObj?.classId);
  }, [classes, currentSectionObj]);

  const currentTotalPeriods = useMemo(() => {
    return currentSectionReqs.reduce((sum, r) => sum + r.periodsPerWeek, 0);
  }, [currentSectionReqs]);

  // Handle row changes
  const handleUpdateRequirement = (id: string, updates: Partial<LessonRequirement>) => {
    const updated = requirements.map((r) => {
      if (r.id === id) {
        let teacherName = r.teacherName;
        if (updates.teacherId !== undefined) {
          const t = staff.find((s) => s.id === updates.teacherId);
          teacherName = t ? `${t.firstName} ${t.lastName}` : 'Unassigned';
        }
        return { ...r, ...updates, teacherName };
      }
      return r;
    });
    onChangeRequirements(updated);
  };

  const handleDeleteRequirement = (id: string) => {
    onChangeRequirements(requirements.filter((r) => r.id !== id));
  };

  // Add custom subject row to current section
  const handleAddSubjectToSection = () => {
    if (!selectedSectionId || !newSubjectId) return;

    const sub = subjects.find((s) => s.id === newSubjectId);
    if (!sub) return;

    const t = staff.find((s) => s.id === newTeacherId);
    const teacherName = t ? `${t.firstName} ${t.lastName}` : '';

    const newReq: LessonRequirement = {
      id: `req-${selectedSectionId}-${sub.id}-${Date.now()}`,
      schoolId: sub.schoolId,
      academicYearId: config.academicYearId,
      classId: currentSectionObj?.classId || '',
      className: currentClassObj?.name || 'Class',
      sectionId: selectedSectionId,
      sectionName: currentSectionObj?.sectionName || 'A',
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacherId: newTeacherId,
      teacherName,
      room: `Room ${currentClassObj?.numericOrder || 1}01`,
      periodsPerWeek: Math.max(1, newPeriodsPerWeek),
      maxPeriodsPerDay: 2,
      allowConsecutive: false,
      priority: 'NORMAL',
      isCore: false,
      isActivity: false,
    };

    onChangeRequirements([...requirements, newReq]);
    setIsAddModalOpen(false);
    setNewSubjectId('');
    setNewTeacherId('');
    setNewPeriodsPerWeek(5);
  };

  // Sections of same class for quick "Apply to Sections"
  const sisterSections = useMemo(() => {
    if (!currentSectionObj) return [];
    return sections.filter(
      (s) => s.classId === currentSectionObj.classId && s.id !== currentSectionObj.id,
    );
  }, [sections, currentSectionObj]);

  const openApplyModal = () => {
    setTargetSectionsToApply(sisterSections.map((s) => s.id));
    setIsApplyModalOpen(true);
  };

  const handleExecuteApply = () => {
    if (!selectedSectionId || targetSectionsToApply.length === 0) return;
    onApplyToSections(selectedSectionId, targetSectionsToApply);
    setIsApplyModalOpen(false);
  };

  return (
    <div
      id="timetable-assignment-container"
      className="d-flex flex-column gap-4 max-w-5xl mx-auto w-100"
    >
      {/* Top Banner & Quick Actions */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div>
            <Badge
              bg="primary-subtle"
              text="primary"
              className="mb-2 d-inline-flex align-items-center gap-1"
            >
              <Users size={12} />
              <span>Step 2 of 5</span>
            </Badge>
            <h2 className="h4 fw-bold mb-1">Subject & Teacher Assignments</h2>
            <p className="text-muted small mb-0">
              Specify weekly periods for each subject and assign teachers. SchoolNexa distributes
              them clash-free across the week.
            </p>
          </div>

          {/* Primary Action: ⚡ Auto Setup */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button
              id="btn-auto-setup"
              variant="warning"
              size="sm"
              onClick={onAutoSetup}
              className="fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm text-dark"
            >
              <Zap size={14} className="fill-current" />
              <span>⚡ Auto Setup</span>
            </Button>

            <Button
              id="btn-seed-benchmark"
              variant="outline-primary"
              size="sm"
              onClick={onSeedBenchmark}
              className="fw-semibold d-inline-flex align-items-center gap-1.5"
              title="Loads standard Classes 1-A to 5-B (10 subjects, real teachers, 36 periods/week)"
            >
              <Sparkles size={14} />
              <span>Load Benchmark (10 Classes)</span>
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onCopyPreviousYear}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Copy Previous Year</span>
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Class & Section Selection Bar */}
      <Card className="shadow-sm border">
        <Card.Body className="p-3 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <div
              className="small fw-bold text-muted text-uppercase d-flex align-items-center gap-1.5"
              style={{ fontSize: '0.75rem' }}
            >
              <Layers size={14} className="text-muted" />
              <span>Select Section to Review</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              {sisterSections.length > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={openApplyModal}
                  className="d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Copy size={12} />
                  <span>
                    Apply to Sister Sections ({sisterSections.map((s) => s.sectionName).join(', ')})
                  </span>
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="d-inline-flex align-items-center gap-1.5 fw-semibold"
                style={{ fontSize: '0.75rem' }}
              >
                <Plus size={12} />
                <span>+ Add Subject</span>
              </Button>
            </div>
          </div>

          {/* Section Pills */}
          <div className="d-flex align-items-center gap-2 overflow-x-auto pb-1">
            {sections.map((sec) => {
              const isSelected = sec.id === selectedSectionId;
              const secReqs = requirements.filter((r) => r.sectionId === sec.id);
              const secTotal = secReqs.reduce((sum, r) => sum + r.periodsPerWeek, 0);
              const isComplete = secTotal === totalWeeklyCapacity;

              return (
                <Button
                  key={sec.id}
                  variant={isSelected ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setSelectedSectionId(sec.id)}
                  className="d-flex align-items-center gap-2 text-nowrap"
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>
                    {sec.className || 'Class'} - Section {sec.sectionName}
                  </span>
                  <Badge
                    bg={isSelected ? 'light' : isComplete ? 'success' : 'warning'}
                    text={isSelected ? 'dark' : undefined}
                    className="font-monospace"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {secTotal}/{totalWeeklyCapacity}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-sm border overflow-hidden">
        {/* Table Header with Status Badge */}
        <Card.Header className="py-3 px-4 bg-body-tertiary d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div>
            <h3 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
              <span>
                {currentClassObj?.name || 'Class'} — Section {currentSectionObj?.sectionName}
              </span>
              <span className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
                ({currentSectionReqs.length} subjects configured)
              </span>
            </h3>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Weekly Allocation:
            </span>
            <Badge
              bg={
                currentTotalPeriods === totalWeeklyCapacity
                  ? 'success'
                  : currentTotalPeriods > totalWeeklyCapacity
                    ? 'danger'
                    : 'warning'
              }
              className="d-inline-flex align-items-center gap-1 py-1.5 px-2"
              style={{ fontSize: '0.75rem' }}
            >
              {currentTotalPeriods === totalWeeklyCapacity ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
              <span>
                {currentTotalPeriods} of {totalWeeklyCapacity} periods
              </span>
            </Badge>
          </div>
        </Card.Header>

        {/* Clean Table */}
        {currentSectionReqs.length === 0 ? (
          <Card.Body className="p-5 text-center">
            <div
              className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: '48px', height: '48px' }}
            >
              <Zap size={24} />
            </div>
            <h4 className="h6 fw-bold mb-1">No Subjects Configured for this Section</h4>
            <p
              className="text-muted small max-w-md mx-auto mb-3"
              style={{ maxWidth: '380px', fontSize: '0.8rem' }}
            >
              Click Auto Setup to automatically import school subjects and teachers, or add subjects
              manually.
            </p>
            <Button
              variant="warning"
              size="sm"
              onClick={onAutoSetup}
              className="fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm text-dark"
            >
              <Zap size={14} className="fill-current" />
              <span>⚡ Auto Setup Now</span>
            </Button>
          </Card.Body>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-body-tertiary">
              <tr
                className="border-bottom small text-uppercase text-muted"
                style={{ fontSize: '0.72rem' }}
              >
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Teacher</th>
                <th className="py-2.5 px-3 text-center">Periods / Week</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSectionReqs.map((req) => {
                const hasTeacher = Boolean(req.teacherId && req.teacherId.trim() !== '');
                const hasValidPeriods = req.periodsPerWeek > 0;
                const isHealthy = hasTeacher && hasValidPeriods;

                return (
                  <tr key={req.id}>
                    {/* Subject */}
                    <td className="py-2.5 px-3">
                      <div className="fw-semibold small">{req.subjectName}</div>
                      <div
                        className="text-muted small font-monospace"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {req.subjectCode}{' '}
                        {req.isCore ? '• Core' : req.isActivity ? '• Activity' : ''}
                      </div>
                    </td>

                    {/* Teacher Dropdown */}
                    <td className="py-2.5 px-3" style={{ maxWidth: '280px' }}>
                      <Form.Select
                        size="sm"
                        value={req.teacherId || ''}
                        onChange={(e) =>
                          handleUpdateRequirement(req.id, { teacherId: e.target.value })
                        }
                        className={!hasTeacher ? 'border-warning' : ''}
                      >
                        <option value="">-- Select Teacher --</option>
                        {staff.map((stf) => (
                          <option key={stf.id} value={stf.id}>
                            {stf.firstName} {stf.lastName} ({stf.designationName || 'Faculty'})
                          </option>
                        ))}
                      </Form.Select>
                      {!hasTeacher && (
                        <div
                          className="text-warning small mt-0.5 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.68rem' }}
                        >
                          <AlertTriangle size={10} />
                          <span>No teacher assigned</span>
                        </div>
                      )}
                    </td>

                    {/* Periods / Week Input */}
                    <td className="py-2.5 px-3 text-center">
                      <Form.Control
                        type="number"
                        size="sm"
                        min={1}
                        max={12}
                        value={req.periodsPerWeek}
                        onChange={(e) =>
                          handleUpdateRequirement(req.id, {
                            periodsPerWeek: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="mx-auto text-center font-monospace fw-bold"
                        style={{ width: '64px' }}
                      />
                    </td>

                    {/* Status Icon / Badge */}
                    <td className="py-2.5 px-3 text-center">
                      {isHealthy ? (
                        <Badge
                          bg="success-subtle"
                          text="success"
                          className="d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.68rem' }}
                        >
                          <Check size={10} />
                          <span>Ready</span>
                        </Badge>
                      ) : (
                        <Badge
                          bg="warning-subtle"
                          text="warning"
                          className="d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.68rem' }}
                        >
                          <AlertTriangle size={10} />
                          <span>Needs Teacher</span>
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-end">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDeleteRequirement(req.id)}
                        className="text-muted p-1 text-decoration-none"
                        title="Remove Subject"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Warnings & Suggestions (Human Friendly) */}
      {currentTotalPeriods !== totalWeeklyCapacity && currentSectionReqs.length > 0 && (
        <Alert variant="warning" className="mb-0 p-3 d-flex align-items-start gap-2.5 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="small">
            <div className="fw-bold">
              {currentTotalPeriods > totalWeeklyCapacity
                ? `Total periods (${currentTotalPeriods}) exceed weekly capacity (${totalWeeklyCapacity})`
                : `Total periods (${currentTotalPeriods}) is less than weekly capacity (${totalWeeklyCapacity})`}
            </div>
            <p className="mb-0 mt-0.5 opacity-90" style={{ fontSize: '0.78rem' }}>
              {currentTotalPeriods > totalWeeklyCapacity
                ? `Please reduce periods on some subjects so they fit into the ${totalWeeklyCapacity} total slots of the week.`
                : `There are ${totalWeeklyCapacity - currentTotalPeriods} unassigned slots. SchoolNexa will leave those periods as free periods, or you can increase weekly periods on core subjects.`}
            </p>
          </div>
        </Alert>
      )}

      {/* Navigation Footer */}
      <div className="d-flex align-items-center justify-content-between pt-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onBack}
          className="d-inline-flex align-items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Setup</span>
        </Button>

        <Button
          id="btn-step2-next"
          variant="primary"
          onClick={onNext}
          className="d-inline-flex align-items-center gap-1.5 fw-semibold px-4 shadow-sm"
        >
          <span>Ready to Generate</span>
          <ArrowRight size={14} />
        </Button>
      </div>

      {/* Add Subject Modal */}
      <Modal show={isAddModalOpen} onHide={() => setIsAddModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-bold mb-0">
            Add Subject to {currentClassObj?.name} - {currentSectionObj?.sectionName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 d-flex flex-column gap-2.5">
          <Form.Group controlId="add-subject-select" className="mb-2.5">
            <Form.Label className="small fw-medium mb-1">Select Subject</Form.Label>
            <Form.Select
              size="sm"
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="add-teacher-select" className="mb-2.5">
            <Form.Label className="small fw-medium mb-1">Assign Teacher (Optional)</Form.Label>
            <Form.Select
              size="sm"
              value={newTeacherId}
              onChange={(e) => setNewTeacherId(e.target.value)}
            >
              <option value="">-- Choose Teacher --</option>
              {staff.map((stf) => (
                <option key={stf.id} value={stf.id}>
                  {stf.firstName} {stf.lastName} ({stf.departmentName || 'Faculty'})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="add-periods-input" className="mb-2.5">
            <Form.Label className="small fw-medium mb-1">Periods Per Week</Form.Label>
            <Form.Control
              type="number"
              size="sm"
              min={1}
              max={12}
              value={newPeriodsPerWeek}
              onChange={(e) => setNewPeriodsPerWeek(parseInt(e.target.value) || 5)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddSubjectToSection}
            disabled={!newSubjectId}
            className="fw-bold"
          >
            Add Subject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Apply to Sections Modal */}
      <Modal show={isApplyModalOpen} onHide={() => setIsApplyModalOpen(false)} centered>
        <Modal.Header closeButton>
          <div>
            <Modal.Title className="h6 fw-bold mb-0">Apply Subject Setup to Sections</Modal.Title>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Copy all subjects and period counts from Section {currentSectionObj?.sectionName} to
              other sections.
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="py-3">
          <Form.Label className="small fw-medium mb-2 d-block">Select Target Sections</Form.Label>
          <div
            className="d-flex flex-column gap-2"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {sections
              .filter((s) => s.id !== selectedSectionId)
              .map((targetSec) => {
                const isChecked = targetSectionsToApply.includes(targetSec.id);
                return (
                  <div
                    key={targetSec.id}
                    className={`p-2.5 rounded border d-flex align-items-center gap-2 ${
                      isChecked ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-body'
                    }`}
                  >
                    <Form.Check
                      type="checkbox"
                      id={`target-sec-${targetSec.id}`}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetSectionsToApply([...targetSectionsToApply, targetSec.id]);
                        } else {
                          setTargetSectionsToApply(
                            targetSectionsToApply.filter((id) => id !== targetSec.id),
                          );
                        }
                      }}
                      label={
                        <span className="small fw-semibold">
                          {targetSec.className || 'Class'} - Section {targetSec.sectionName}
                        </span>
                      }
                    />
                  </div>
                );
              })}
          </div>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setIsApplyModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteApply}
            disabled={targetSectionsToApply.length === 0}
            className="fw-bold"
          >
            Apply to {targetSectionsToApply.length} Section
            {targetSectionsToApply.length > 1 ? 's' : ''}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
