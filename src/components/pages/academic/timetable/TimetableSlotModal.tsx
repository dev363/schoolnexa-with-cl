import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { CalendarDays, AlertTriangle, Trash2, Sparkles, Info } from 'lucide-react';
import {
  TimetableEntry,
  TimetablePeriodSlot,
  DayOfWeek,
  AcademicYearSectionItem,
  StaffMember,
  SubjectItem,
  ClassSubjectItem,
  TeacherAssignmentItem,
  TimetableConflict,
} from '@/types';
import { TIMETABLE_DAYS, academicService } from '@/services/academicService';

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Partial<TimetableEntry> | null;
  section: AcademicYearSectionItem;
  schoolId: string;
  academicYearId: string;
  availableClassSubjects: ClassSubjectItem[];
  allSubjects: SubjectItem[];
  teacherAssignments: TeacherAssignmentItem[];
  staffList: StaffMember[];
  periodSlots: TimetablePeriodSlot[];
  onSave: (savedEntry: Partial<TimetableEntry>) => void;
  onDelete?: (entryId: string) => void;
  isDark: boolean;
}

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  entry,
  section,
  schoolId,
  academicYearId,
  availableClassSubjects,
  allSubjects,
  teacherAssignments,
  staffList,
  periodSlots,
  onSave,
  onDelete,
  isDark,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [periodId, setPeriodId] = useState<string>('p1');
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [room, setRoom] = useState<string>('Room 101');
  const [periodType, setPeriodType] = useState<TimetableEntry['periodType']>('REGULAR');
  const [notes, setNotes] = useState<string>('');
  const [isTeacherOverridden, setIsTeacherOverridden] = useState(false);
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);

  // Initialize or update form whenever entry changes
  useEffect(() => {
    if (!isOpen) return;

    if (entry) {
      setDayOfWeek(entry.dayOfWeek || 'MONDAY');
      setPeriodId(entry.periodId || periodSlots[0]?.id || 'p1');

      const defaultSubId =
        entry.subjectId || availableClassSubjects[0]?.subjectId || allSubjects[0]?.id || '';
      setSubjectId(defaultSubId);

      // Determine default teacher
      if (entry.teacherId) {
        setTeacherId(entry.teacherId);
      } else if (defaultSubId) {
        // Auto-assign from Section Teacher Assignment
        const assigned = teacherAssignments.find(
          (a) => a.academicYearSectionId === section.id && a.subjectId === defaultSubId,
        );
        if (assigned) {
          setTeacherId(assigned.staffId);
        } else {
          // Fallback to first staff
          setTeacherId(staffList[0]?.id || '');
        }
      }

      setRoom(entry.room || `Room ${section.className?.replace('Grade ', '') || '10'}1`);
      setPeriodType(entry.periodType || 'REGULAR');
      setNotes(entry.notes || '');
      setIsTeacherOverridden(false);
    }
  }, [
    isOpen,
    entry,
    section,
    availableClassSubjects,
    allSubjects,
    teacherAssignments,
    periodSlots,
    staffList,
  ]);

  // When subject changes, automatically look up mapped teacher for this class/section!
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);

    // Auto-assignment rule: Find the assigned teacher for this section + subject
    const assignment = teacherAssignments.find(
      (a) => a.academicYearSectionId === section.id && a.subjectId === newSubjectId,
    );

    if (assignment) {
      setTeacherId(assignment.staffId);
      setIsTeacherOverridden(false);
    } else {
      // If no assignment yet, keep existing or choose first staff
      if (!teacherId && staffList.length > 0) {
        setTeacherId(staffList[0].id);
      }
    }
  };

  // Find currently mapped master teacher for display
  const masterAssignedStaffId = teacherAssignments.find(
    (a) => a.academicYearSectionId === section.id && a.subjectId === subjectId,
  )?.staffId;
  const masterAssignedStaff = staffList.find((s) => s.id === masterAssignedStaffId);

  // Real-time clash detection whenever Day, Period, Teacher, or Room changes
  useEffect(() => {
    if (!isOpen || !teacherId || !periodId) {
      setConflicts([]);
      return;
    }

    const detected = academicService.checkTimetableConflicts(schoolId, {
      id: entry?.id,
      academicYearId,
      academicYearSectionId: section.id,
      dayOfWeek,
      periodId,
      teacherId,
      room,
    });

    setConflicts(detected);
  }, [
    isOpen,
    schoolId,
    academicYearId,
    section.id,
    entry?.id,
    dayOfWeek,
    periodId,
    teacherId,
    room,
  ]);

  const currentSlot = periodSlots.find((p) => p.id === periodId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !teacherId) return;

    onSave({
      id: entry?.id,
      academicYearId,
      academicYearSectionId: section.id,
      dayOfWeek,
      periodId,
      startTime: currentSlot?.startTime || '08:30',
      endTime: currentSlot?.endTime || '09:15',
      subjectId,
      teacherId,
      room: room.trim() || `Room ${section.className?.replace('Grade ', '') || '10'}1`,
      periodType,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className={isDark ? 'bg-dark text-white border-secondary' : ''}>
          <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <div>
              <div className="fw-bold">
                {entry?.id ? 'Edit Timetable Period' : 'Schedule Timetable Period'}
              </div>
              <div className="text-muted small fw-normal" style={{ fontSize: '0.75rem' }}>
                {section.className} — Section {section.sectionName}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={isDark ? 'bg-dark text-white' : ''}>
          {/* Conflict Alert Banner */}
          {conflicts.length > 0 && (
            <Alert variant="danger" className="py-2 px-3 mb-3 d-flex align-items-start gap-2 small">
              <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                <span className="fw-bold">Scheduling Clash:</span> {conflicts[0].message}
              </div>
            </Alert>
          )}

          <Row className="g-2 mb-2.5">
            <Col sm={6}>
              <Form.Group controlId="slotDayOfWeek" className="mb-2.5">
                <Form.Label className="small fw-semibold mb-1">Day of Week: *</Form.Label>
                <Form.Select
                  size="sm"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                >
                  {TIMETABLE_DAYS.map((d) => (
                    <option key={d.day} value={d.day}>
                      {d.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group controlId="slotPeriod" className="mb-2.5">
                <Form.Label className="small fw-semibold mb-1">Period Slot: *</Form.Label>
                <Form.Select
                  size="sm"
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                >
                  {periodSlots
                    .filter((p) => !p.isBreak)
                    .map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.name} ({slot.startTime}-{slot.endTime})
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Subject Selector */}
          <Form.Group controlId="slotSubject" className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">Curriculum Subject: *</Form.Label>
            <Form.Select
              size="sm"
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Select Subject --
              </option>
              {availableClassSubjects.length > 0
                ? availableClassSubjects.map((cs) => (
                    <option key={cs.subjectId} value={cs.subjectId}>
                      {cs.subjectName} ({cs.subjectCode}) — {cs.weeklyPeriods || 4} periods/wk
                    </option>
                  ))
                : allSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
            </Form.Select>
          </Form.Group>

          {/* Auto-Assigned Teacher with Override option */}
          <Form.Group controlId="slotTeacher" className="mb-2.5">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <Form.Label className="small fw-semibold mb-0">
                Assigned Faculty Teacher: *
              </Form.Label>
              {masterAssignedStaff && (
                <Badge
                  bg="success"
                  className="d-inline-flex align-items-center gap-1 fw-normal"
                  style={{ fontSize: '0.65rem' }}
                >
                  <Sparkles size={10} />
                  <span>Auto-mapped from Section</span>
                </Badge>
              )}
            </div>

            <Form.Select
              size="sm"
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
                setIsTeacherOverridden(true);
              }}
              required
            >
              <option value="" disabled>
                -- Select Faculty Teacher --
              </option>
              {staffList.map((stf) => {
                const isMasterTeacher = masterAssignedStaffId === stf.id;
                return (
                  <option key={stf.id} value={stf.id}>
                    {stf.firstName} {stf.lastName} ({stf.departmentName}){' '}
                    {isMasterTeacher ? '★ [Default Section Teacher]' : ''}
                  </option>
                );
              })}
            </Form.Select>

            {isTeacherOverridden && (
              <Form.Text className="text-warning small d-flex align-items-center gap-1 mt-1">
                <Info size={12} className="flex-shrink-0" />
                <span>
                  Override active: Applies only to this timetable period (e.g. proxy teacher).
                </span>
              </Form.Text>
            )}
          </Form.Group>

          {/* Room & Period Type */}
          <Row className="g-2 mb-2.5">
            <Col sm={6}>
              <Form.Group controlId="slotRoom" className="mb-2.5">
                <Form.Label className="small fw-semibold mb-1">Room / Venue:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 201, Physics Lab"
                />
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group controlId="slotType" className="mb-2.5">
                <Form.Label className="small fw-semibold mb-1">Period Type:</Form.Label>
                <Form.Select
                  size="sm"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                >
                  <option value="REGULAR">Regular Lecture</option>
                  <option value="PRACTICAL_LAB">Practical Lab</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="ACTIVITY">Activity / Sports</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Notes */}
          <Form.Group controlId="slotNotes" className="mb-2.5">
            <Form.Label className="small fw-semibold mb-1">Notes (Optional):</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Weekly lab test, Bring textbook"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer
          className={`d-flex justify-content-between ${isDark ? 'bg-dark text-white border-secondary' : ''}`}
        >
          {entry?.id && onDelete ? (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                if (window.confirm('Clear this period from the timetable?')) {
                  onDelete(entry.id!);
                  onClose();
                }
              }}
              className="d-inline-flex align-items-center gap-1"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {entry?.id ? 'Update Period' : 'Save Period'}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
