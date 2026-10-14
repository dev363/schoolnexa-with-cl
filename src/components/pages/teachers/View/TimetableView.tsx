import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Stack,
  Modal,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Card, InfoCard, InfoRow } from '@/components/common';
import {
  Calendar,
  Printer,
  Download,
  ExternalLink,
  UserCheck,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  Filter,
  Copy,
  Layers,
  Sparkles,
  School,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Teacher,
  TeacherTimetableSlot,
  TeacherSubjectAssignment,
  DayOfWeek,
} from '@/components/pages/teachers/types';
import { DAYS_OF_WEEK } from '@/components/pages/teachers/constants';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useGetTeacherTimetableQuery } from '@/store/teachers';

interface ProfileTimetableTabProps {
  timetableSlots?: TeacherTimetableSlot[];
  teacher?: Teacher;
  teacherId?: string;
  subjectAssignments?: TeacherSubjectAssignment[];
}

interface PeriodDef {
  num: number;
  name: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

const ALL_DAYS: DayOfWeek[] = DAYS_OF_WEEK;

const PERIOD_DEFINITIONS: PeriodDef[] = [
  { num: 1, name: 'Period 1', startTime: '08:30', endTime: '09:15' },
  { num: 2, name: 'Period 2', startTime: '09:15', endTime: '10:00' },
  { num: 3, name: 'Period 3', startTime: '10:00', endTime: '10:45' },
  { num: -1, name: 'Recess', startTime: '10:45', endTime: '11:05', isBreak: true },
  { num: 4, name: 'Period 4', startTime: '11:05', endTime: '11:50' },
  { num: 5, name: 'Period 5', startTime: '11:50', endTime: '12:35' },
  { num: -2, name: 'Lunch', startTime: '12:35', endTime: '01:15', isBreak: true },
  { num: 6, name: 'Period 6', startTime: '01:15', endTime: '02:00' },
  { num: 7, name: 'Period 7', startTime: '02:00', endTime: '02:45' },
];

export const ProfileTimetableTab: React.FC<ProfileTimetableTabProps> = ({
  timetableSlots: propTimetableSlots,
  teacher,
  teacherId,
  subjectAssignments = [],
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const effectiveTeacherId = teacherId || teacher?.teacherId || teacher?.id;
  const { data: remoteTimetableSlots } = useGetTeacherTimetableQuery(effectiveTeacherId!, {
    skip: !effectiveTeacherId,
  });
  const timetableSlots =
    remoteTimetableSlots && remoteTimetableSlots.length > 0
      ? remoteTimetableSlots
      : propTimetableSlots || [];

  // State
  const [highlightSubstitution, setHighlightSubstitution] = useState(true);
  const [selectedDayFilter, setSelectedDayFilter] = useState<'ALL' | DayOfWeek>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'AGENDA'>('GRID');
  const [selectedSlot, setSelectedSlot] = useState<TeacherTimetableSlot | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Compute teaching vs free counts
  const { occupiedSlotsCount, freeSlotsCount, totalGridSlotsCount, daysWithTeaching } =
    useMemo(() => {
      let occupied = 0;
      let free = 0;
      const teachingDays = new Set<string>();

      ALL_DAYS.forEach((day) => {
        const daySlots = day === 'SATURDAY' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];
        daySlots.forEach((pNum) => {
          const slot = timetableSlots.find(
            (s) => s.dayOfWeek.toUpperCase() === day && s.periodNumber === pNum,
          );
          if (slot && !slot.isFree && slot.className) {
            occupied++;
            teachingDays.add(day);
          } else {
            free++;
          }
        });
      });

      return {
        occupiedSlotsCount: occupied,
        freeSlotsCount: free,
        totalGridSlotsCount: occupied + free,
        daysWithTeaching: teachingDays.size,
      };
    }, [timetableSlots]);

  // Filtered days list
  const displayedDays = useMemo(() => {
    if (selectedDayFilter === 'ALL') return ALL_DAYS;
    return [selectedDayFilter];
  }, [selectedDayFilter]);

  // Helper to find slot
  const findSlot = (day: DayOfWeek, periodNum: number): TeacherTimetableSlot => {
    const existing = timetableSlots.find(
      (s) => s.dayOfWeek.toUpperCase() === day && s.periodNumber === periodNum,
    );
    if (existing) return existing;

    const periodDef = PERIOD_DEFINITIONS.find((p) => p.num === periodNum);
    return {
      id: `virtual-${day}-${periodNum}`,
      teacherId: teacher?.teacherId || '',
      dayOfWeek: day,
      periodNumber: periodNum,
      periodName: periodDef?.name || `Period ${periodNum}`,
      startTime: periodDef?.startTime || '',
      endTime: periodDef?.endTime || '',
      className: '',
      sectionName: '',
      subjectName: 'Free / Available',
      room: 'Staff Room',
      isFree: true,
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      [
        'Day',
        'Period',
        'Timings',
        'Class',
        'Section',
        'Subject',
        'Room',
        'Status',
        'Substitution Ready',
      ],
    ];

    ALL_DAYS.forEach((day) => {
      const periods = day === 'SATURDAY' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];
      periods.forEach((pNum) => {
        const slot = findSlot(day, pNum);
        const isFree = Boolean(slot.isFree || !slot.className);
        rows.push([
          day,
          slot.periodName || `Period ${pNum}`,
          `${slot.startTime} - ${slot.endTime}`,
          slot.className || '—',
          slot.sectionName || '—',
          isFree ? 'Free Period' : slot.subjectName || 'Teaching',
          slot.room || (isFree ? 'Staff Room' : 'Classroom'),
          isFree ? 'FREE' : 'OCCUPIED',
          isFree ? 'YES' : 'NO',
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Teacher_Timetable_${teacher?.teacherId || 'Schedule'}_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Weekly timetable exported to CSV successfully.');
  };

  // Copy Substitution Details
  const handleCopySubstitutionInfo = (slot: TeacherTimetableSlot) => {
    const text = `Teacher Available for Substitution:\nTeacher: ${teacher?.firstName} ${teacher?.lastName || ''} (${teacher?.teacherId})\nDay: ${slot.dayOfWeek}\nPeriod: ${slot.periodName || `Period ${slot.periodNumber}`} (${slot.startTime} - ${slot.endTime})\nLocation: ${slot.room || 'Staff Room'}`;
    navigator.clipboard.writeText(text);
    toast.success('Substitution availability copied to clipboard.');
  };

  const teacherFullName = teacher
    ? `${teacher.firstName} ${teacher.middleName ? teacher.middleName + ' ' : ''}${teacher.lastName || ''}`.trim()
    : 'Faculty Member';

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Metric Cards */}
      <Row className="g-2">
        <Col sm={6} lg={3}>
          <InfoCard
            label="Teaching Periods"
            value={`${occupiedSlotsCount} / week`}
            description={`Across ${daysWithTeaching} active days`}
            icon={BookOpen}
            iconColor="text-primary"
            valueClassName="h5 fw-bold text-primary mb-1"
          />
        </Col>

        <Col sm={6} lg={3}>
          <InfoCard
            label="Substitution Ready"
            value={`${freeSlotsCount} free slots`}
            description="Available for cover duties"
            icon={UserCheck}
            iconColor="text-success"
            valueClassName="h5 fw-bold text-success mb-1"
          />
        </Col>

        <Col sm={6} lg={3}>
          <InfoCard
            label="Schedule Density"
            value={`${totalGridSlotsCount > 0 ? Math.round((occupiedSlotsCount / totalGridSlotsCount) * 100) : 0}%`}
            description={`${occupiedSlotsCount} of ${totalGridSlotsCount} weekly slots`}
            icon={Layers}
            iconColor="text-info"
            valueClassName="h5 fw-bold text-info mb-1"
          />
        </Col>

        <Col sm={6} lg={3}>
          <InfoCard
            label="Working Days"
            value="6 Days"
            description="Mon – Sat (CBSE standard)"
            icon={Calendar}
            iconColor="text-secondary"
            valueClassName="h5 fw-bold text-secondary mb-1"
          />
        </Col>
      </Row>

      {/* Main Timetable Card */}
      <Card className="border shadow-sm">
        {/* Header with Title and Quick Actions */}
        <div className="py-2.5 px-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span className="fw-bold">Weekly Teaching Schedule (6-Day Grid)</span>
            <Badge bg="secondary" className="fw-normal">
              AY 2026-27
            </Badge>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Highlight Substitution Readiness Switch */}
            <Form.Check
              type="switch"
              id="highlight-substitution-switch"
              label={
                <span className="small d-inline-flex align-items-center gap-1">
                  <Sparkles size={13} className="text-success" />
                  <span>Highlight Substitution Readiness</span>
                  <Badge bg="success" pill style={{ fontSize: '0.65rem' }}>
                    {freeSlotsCount}
                  </Badge>
                </span>
              }
              checked={highlightSubstitution}
              onChange={(e) => setHighlightSubstitution(e.target.checked)}
              className="me-2 mb-0"
            />

            {/* View Mode */}
            <ButtonGroup size="sm">
              <Button
                variant={
                  viewMode === 'GRID' ? 'primary' : isDark ? 'outline-light' : 'outline-secondary'
                }
                onClick={() => setViewMode('GRID')}
              >
                Matrix
              </Button>
              <Button
                variant={
                  viewMode === 'AGENDA' ? 'primary' : isDark ? 'outline-light' : 'outline-secondary'
                }
                onClick={() => setViewMode('AGENDA')}
              >
                Agenda
              </Button>
            </ButtonGroup>

            {/* Print Preview Button */}
            <Button
              variant={isDark ? 'outline-light' : 'outline-secondary'}
              size="sm"
              onClick={() => setShowPrintModal(true)}
              className="d-inline-flex align-items-center gap-1"
            >
              <Printer size={14} />
              <span>Print</span>
            </Button>

            {/* Export CSV */}
            <Button
              variant={isDark ? 'outline-light' : 'outline-secondary'}
              size="sm"
              onClick={handleExportCSV}
              className="d-inline-flex align-items-center gap-1"
            >
              <Download size={14} />
              <span>Export</span>
            </Button>

            {/* Direct Link to Central Timetable Module */}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate('/timetable/teacher')}
              className="d-inline-flex align-items-center gap-1 fw-medium"
            >
              <ExternalLink size={14} />
              <span>Central Timetable</span>
            </Button>
          </div>
        </div>

        {/* Day Filter Pills */}
        <div className="px-3 py-2 border-bottom d-flex align-items-center gap-1 flex-wrap bg-light bg-opacity-10">
          <span className="small text-muted me-1 d-inline-flex align-items-center gap-1">
            <Filter size={12} /> Day:
          </span>
          <Button
            size="sm"
            variant={selectedDayFilter === 'ALL' ? 'primary' : isDark ? 'dark' : 'light'}
            className="py-0 px-2 small border"
            onClick={() => setSelectedDayFilter('ALL')}
          >
            All 6 Days
          </Button>
          {ALL_DAYS.map((day) => (
            <Button
              key={day}
              size="sm"
              variant={selectedDayFilter === day ? 'primary' : isDark ? 'dark' : 'light'}
              className="py-0 px-2 small border"
              onClick={() => setSelectedDayFilter(day)}
            >
              {day.charAt(0) + day.slice(1, 3).toLowerCase()}
            </Button>
          ))}
        </div>

        <div>
          {viewMode === 'GRID' ? (
            /* 6-Day Grid View */
            <div className="table-responsive">
              <Table bordered hover size="sm" className="mb-0 text-center align-middle">
                <thead className={isDark ? 'table-dark' : 'table-light'}>
                  <tr>
                    <th style={{ width: '110px', minWidth: '100px' }} className="py-2.5">
                      Day
                    </th>
                    {PERIOD_DEFINITIONS.map((p) => {
                      if (p.isBreak) {
                        return (
                          <th
                            key={p.name}
                            className="table-secondary py-2"
                            style={{ width: '60px', minWidth: '55px', fontSize: '0.75rem' }}
                          >
                            <span className="text-uppercase fw-semibold">{p.name}</span>
                            <div className="text-muted fw-normal" style={{ fontSize: '0.65rem' }}>
                              {p.startTime}
                            </div>
                          </th>
                        );
                      }
                      return (
                        <th key={p.num} style={{ minWidth: '135px' }} className="py-2">
                          <div className="fw-semibold">{p.name}</div>
                          <div className="text-muted fw-normal" style={{ fontSize: '0.7rem' }}>
                            {p.startTime} - {p.endTime}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {displayedDays.map((day) => {
                    const isSaturday = day === 'SATURDAY';

                    return (
                      <tr key={day}>
                        {/* Day label */}
                        <td className="fw-bold bg-light bg-opacity-25 text-start ps-3">
                          <div>{day}</div>
                          {isSaturday && (
                            <span
                              className="badge bg-secondary-subtle text-secondary border mt-0.5"
                              style={{ fontSize: '0.62rem' }}
                            >
                              Half Day
                            </span>
                          )}
                        </td>

                        {/* Periods */}
                        {PERIOD_DEFINITIONS.map((p) => {
                          if (p.isBreak) {
                            return (
                              <td
                                key={`${day}-${p.name}`}
                                className="table-secondary text-muted align-middle"
                                style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: isDark ? '#2b3035' : '#f8f9fa',
                                }}
                              >
                                <span
                                  className="text-uppercase fw-medium"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                  }}
                                >
                                  {p.name}
                                </span>
                              </td>
                            );
                          }

                          // Saturday only has periods 1 to 4
                          if (isSaturday && p.num > 4) {
                            return (
                              <td
                                key={`${day}-p${p.num}`}
                                className="text-muted align-middle bg-light bg-opacity-10"
                                style={{ fontSize: '0.72rem' }}
                              >
                                <span className="opacity-50">Dispersal</span>
                              </td>
                            );
                          }

                          const slot = findSlot(day, p.num);
                          const isFree = Boolean(slot.isFree || !slot.className);

                          if (isFree) {
                            return (
                              <td
                                key={`${day}-p${p.num}`}
                                onClick={() => setSelectedSlot(slot)}
                                style={{ cursor: 'pointer' }}
                                className={`p-2 transition-all ${
                                  highlightSubstitution
                                    ? isDark
                                      ? 'bg-success bg-opacity-10 border-success-subtle'
                                      : 'bg-success bg-opacity-10 border-success-subtle'
                                    : ''
                                }`}
                              >
                                {highlightSubstitution ? (
                                  <div className="py-1">
                                    <Badge
                                      bg="success"
                                      className="d-inline-flex align-items-center gap-1 py-1 px-1.5 fw-normal"
                                      style={{ fontSize: '0.68rem' }}
                                    >
                                      <UserCheck size={11} />
                                      <span>Ready for Substitution</span>
                                    </Badge>
                                    <div
                                      className="text-muted mt-1"
                                      style={{ fontSize: '0.66rem' }}
                                    >
                                      {slot.room || 'Staff Room'}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-2 text-muted" style={{ fontSize: '0.75rem' }}>
                                    <span className="badge bg-light text-muted border">Free</span>
                                  </div>
                                )}
                              </td>
                            );
                          }

                          // Occupied teaching slot
                          return (
                            <td
                              key={`${day}-p${p.num}`}
                              onClick={() => setSelectedSlot(slot)}
                              style={{ cursor: 'pointer' }}
                              className="p-2"
                            >
                              <div className="d-flex flex-column align-items-center gap-0.5">
                                <span
                                  className="badge bg-primary px-2 py-0.5 fw-semibold"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {slot.className} - {slot.sectionName}
                                </span>
                                <div
                                  className="fw-semibold text-truncate text-center mt-1"
                                  style={{ maxWidth: 125, fontSize: '0.78rem' }}
                                >
                                  {slot.subjectName}
                                </div>
                                <div
                                  className="d-inline-flex align-items-center gap-1 text-muted mt-0.5"
                                  style={{ fontSize: '0.68rem' }}
                                >
                                  <MapPin size={10} />
                                  <span>{slot.room || 'Room'}</span>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            /* Day Agenda / Timeline View */
            <div className="p-3 d-flex flex-column gap-3">
              {displayedDays.map((day) => {
                const isSaturday = day === 'SATURDAY';
                const periodsList = isSaturday ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];

                return (
                  <Card key={day} bg={isDark ? 'dark' : 'white'} className="border">
                    <Card.Header className="py-2 px-3 fw-bold small d-flex justify-content-between align-items-center">
                      <span className="d-flex align-items-center gap-1.5">
                        <Calendar size={14} className="text-primary" />
                        <span>{day}</span>
                      </span>
                      {isSaturday && <Badge bg="secondary">Half Day</Badge>}
                    </Card.Header>
                    <Card.Body className="p-2">
                      <Row className="g-2">
                        {periodsList.map((pNum) => {
                          const slot = findSlot(day, pNum);
                          const isFree = Boolean(slot.isFree || !slot.className);

                          return (
                            <Col sm={6} md={4} lg={3} key={`agenda-${day}-${pNum}`}>
                              <div
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2.5 rounded border h-100 cursor-pointer d-flex flex-column justify-content-between ${
                                  isFree
                                    ? highlightSubstitution
                                      ? 'bg-success bg-opacity-10 border-success'
                                      : 'bg-light bg-opacity-25'
                                    : 'bg-primary bg-opacity-10 border-primary-subtle'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1.5">
                                  <span className="fw-bold small">
                                    {slot.periodName || `Period ${pNum}`}
                                  </span>
                                  <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>

                                {isFree ? (
                                  <div>
                                    <Badge
                                      bg="success"
                                      className="d-inline-flex align-items-center gap-1 mb-1"
                                    >
                                      <UserCheck size={11} /> Ready for Substitution
                                    </Badge>
                                    <div className="text-muted small">No active class assigned</div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="fw-semibold text-primary">
                                      {slot.className} - {slot.sectionName}
                                    </div>
                                    <div className="small">{slot.subjectName}</div>
                                    <div
                                      className="text-muted mt-1 d-flex align-items-center gap-1"
                                      style={{ fontSize: '0.72rem' }}
                                    >
                                      <MapPin size={11} /> {slot.room}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="py-2 px-3 border-top bg-light bg-opacity-25 small d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="fw-semibold text-muted">Legend:</span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="badge bg-primary" style={{ width: 10, height: 10, padding: 0 }}>
                {' '}
              </span>
              <span>Teaching Period (Occupied)</span>
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="badge bg-success" style={{ width: 10, height: 10, padding: 0 }}>
                {' '}
              </span>
              <span>Free / Ready for Substitution</span>
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="badge bg-secondary" style={{ width: 10, height: 10, padding: 0 }}>
                {' '}
              </span>
              <span>Scheduled Recess / Lunch</span>
            </span>
          </div>

          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
            Click any cell to view period details, room allocation, or assign substitution.
          </div>
        </div>
      </Card>

      {/* Period Details / Substitution Modal */}
      {selectedSlot && (
        <Modal show={Boolean(selectedSlot)} onHide={() => setSelectedSlot(null)} centered>
          <Modal.Header closeButton className="py-2.5 px-3">
            <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>
                {selectedSlot.dayOfWeek} —{' '}
                {selectedSlot.periodName || `Period ${selectedSlot.periodNumber}`}
              </span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            {selectedSlot.isFree || !selectedSlot.className ? (
              /* Free Substitution Slot Details */
              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-success bg-opacity-10 border border-success-subtle rounded text-center">
                  <UserCheck size={32} className="text-success mb-2" />
                  <h6 className="fw-bold text-success mb-1">Available for Substitution</h6>
                  <p className="text-muted small mb-0">
                    {teacherFullName} is free during this slot and can cover an absent teacher or
                    assist with examination duty.
                  </p>
                </div>

                <div className="small border rounded p-2.5">
                  <Row className="g-2">
                    <Col xs={6}>
                      <InfoRow label="Day" value={selectedSlot.dayOfWeek} layout="stacked" />
                    </Col>
                    <Col xs={6}>
                      <InfoRow
                        label="Period Timings"
                        value={`${selectedSlot.startTime} – ${selectedSlot.endTime}`}
                        layout="stacked"
                      />
                    </Col>
                    <Col xs={6}>
                      <InfoRow label="Teacher" value={teacherFullName} layout="stacked" />
                    </Col>
                    <Col xs={6}>
                      <InfoRow
                        label="Teacher Code"
                        value={teacher?.teacherId}
                        layout="stacked"
                      />
                    </Col>
                    <Col xs={12}>
                      <InfoRow
                        label="Standby Location"
                        value={selectedSlot.room || 'Staff Room / Senior Faculty Wing'}
                        layout="stacked"
                      />
                    </Col>
                  </Row>
                </div>

                <Button
                  variant="outline-success"
                  size="sm"
                  className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5"
                  onClick={() => handleCopySubstitutionInfo(selectedSlot)}
                >
                  <Copy size={14} />
                  <span>Copy Substitution Availability</span>
                </Button>
              </div>
            ) : (
              /* Occupied Teaching Slot Details */
              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-primary bg-opacity-10 border border-primary-subtle rounded">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Badge bg="primary" className="mb-1">
                        {selectedSlot.className} - {selectedSlot.sectionName}
                      </Badge>
                      <h5 className="fw-bold text-primary mb-0">{selectedSlot.subjectName}</h5>
                    </div>
                    <Badge bg="secondary" className="font-monospace">
                      {selectedSlot.room || 'Room'}
                    </Badge>
                  </div>
                </div>

                <div className="small border rounded p-2.5">
                  <Row className="g-2">
                    <Col xs={6}>
                      <InfoRow label="Day" value={selectedSlot.dayOfWeek} layout="stacked" />
                    </Col>
                    <Col xs={6}>
                      <InfoRow
                        label="Timings"
                        value={`${selectedSlot.startTime} – ${selectedSlot.endTime}`}
                        layout="stacked"
                      />
                    </Col>
                    <Col xs={6}>
                      <InfoRow label="Assigned Faculty" value={teacherFullName} layout="stacked" />
                    </Col>
                    <Col xs={6}>
                      <InfoRow
                        label="Room / Venue"
                        value={selectedSlot.room || 'Classroom'}
                        layout="stacked"
                      />
                    </Col>
                  </Row>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                    onClick={() => {
                      setSelectedSlot(null);
                      navigate('/timetable/class');
                    }}
                  >
                    <BookOpen size={14} />
                    <span>View Class Timetable</span>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}

      {/* Print Preview Modal */}
      <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)} size="lg" centered>
        <Modal.Header closeButton className="py-2.5 px-3">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Printer size={16} className="text-primary" />
            <span>Print Faculty Schedule</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" id="printable-timetable">
          {/* Official Print Header */}
          <div className="border-bottom pb-3 mb-3 text-center">
            <h5 className="fw-bold text-uppercase mb-1">SchoolNexa International Academy</h5>
            <div className="small text-muted mb-2">
              Faculty Weekly Schedule • Academic Session 2026-27
            </div>
            <div className="p-2 border rounded bg-light d-flex justify-content-around small">
              <div>
                <strong>Faculty:</strong> {teacherFullName}
              </div>
              <div>
                <strong>Code:</strong> {teacher?.teacherId || 'TCH-000101'}
              </div>
              <div>
                <strong>Department:</strong> {teacher?.departmentName || 'General Studies'}
              </div>
              <div>
                <strong>Designation:</strong> {teacher?.designationName || 'Faculty'}
              </div>
            </div>
          </div>

          {/* Printable Matrix Table */}
          <Table bordered size="sm" className="small text-center mb-3">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Day</th>
                <th>P1 (08:30)</th>
                <th>P2 (09:15)</th>
                <th>P3 (10:00)</th>
                <th className="bg-light">Recess</th>
                <th>P4 (11:05)</th>
                <th>P5 (11:50)</th>
                <th>P6 (01:15)</th>
                <th>P7 (02:00)</th>
              </tr>
            </thead>
            <tbody>
              {ALL_DAYS.map((day) => {
                const isSat = day === 'SATURDAY';
                return (
                  <tr key={`print-${day}`}>
                    <td className="fw-bold text-start ps-2">{day}</td>
                    {[1, 2, 3].map((num) => {
                      const slot = findSlot(day, num);
                      return (
                        <td key={`print-${day}-${num}`}>
                          {slot.isFree || !slot.className ? (
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                              Free
                            </span>
                          ) : (
                            <div>
                              <div className="fw-bold" style={{ fontSize: '0.72rem' }}>
                                {slot.className}-{slot.sectionName}
                              </div>
                              <div style={{ fontSize: '0.65rem' }}>{slot.subjectName}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="bg-light text-muted" style={{ fontSize: '0.65rem' }}>
                      Break
                    </td>
                    {[4, 5, 6, 7].map((num) => {
                      if (isSat && num > 4) {
                        return (
                          <td
                            key={`print-${day}-${num}`}
                            className="text-muted"
                            style={{ fontSize: '0.65rem' }}
                          >
                            —
                          </td>
                        );
                      }
                      const slot = findSlot(day, num);
                      return (
                        <td key={`print-${day}-${num}`}>
                          {slot.isFree || !slot.className ? (
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                              Free
                            </span>
                          ) : (
                            <div>
                              <div className="fw-bold" style={{ fontSize: '0.72rem' }}>
                                {slot.className}-{slot.sectionName}
                              </div>
                              <div style={{ fontSize: '0.65rem' }}>{slot.subjectName}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* Verification Signatures */}
          <div className="d-flex justify-content-between pt-4 mt-4 border-top small text-muted">
            <div>
              <div
                style={{ borderBottom: '1px solid #ccc', width: '180px', marginBottom: '4px' }}
              ></div>
              <span>Teacher Signature</span>
            </div>
            <div>
              <div
                style={{ borderBottom: '1px solid #ccc', width: '180px', marginBottom: '4px' }}
              ></div>
              <span>Timetable In-Charge</span>
            </div>
            <div>
              <div
                style={{ borderBottom: '1px solid #ccc', width: '180px', marginBottom: '4px' }}
              ></div>
              <span>Principal / Academic Head</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="py-2 px-3">
          <Button variant="secondary" size="sm" onClick={() => setShowPrintModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => {
              window.print();
            }}
          >
            <Printer size={14} />
            <span>Print Now</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export const TimetableView = ProfileTimetableTab;
export default TimetableView;

