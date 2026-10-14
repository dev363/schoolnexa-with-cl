import React, { useState, useMemo } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { Printer, CalendarDays, UserCheck, MapPin, CheckCircle2 } from 'lucide-react';
import {
  TimetableEntry,
  TimetablePeriodSlot,
  DayOfWeek,
  StaffMember,
  AcademicYearSectionItem,
} from '@/types';
import { TIMETABLE_DAYS } from '@/services/academicService';

interface SessionTimetableViewProps {
  allTimetableEntries: TimetableEntry[];
  periodSlots: TimetablePeriodSlot[];
  staffList: StaffMember[];
  sections: AcademicYearSectionItem[];
  schoolName: string;
  academicYearName: string;
  getSubjectColorStyle: (subjectName: string) => string;
  isDark: boolean;
}

export const SessionTimetableView: React.FC<SessionTimetableViewProps> = ({
  allTimetableEntries,
  periodSlots,
  staffList,
  sections,
  schoolName,
  academicYearName,
  getSubjectColorStyle,
  isDark,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    periodSlots.find((p) => !p.isBreak)?.id || 'p1',
  );

  const currentPeriod = useMemo(
    () => periodSlots.find((p) => p.id === selectedPeriodId) || periodSlots[0],
    [periodSlots, selectedPeriodId],
  );

  // Active entries during this Day + Period across all sections in the school
  const activeSessionEntries = useMemo(() => {
    return allTimetableEntries.filter(
      (e) => e.dayOfWeek === selectedDay && e.periodId === selectedPeriodId,
    );
  }, [allTimetableEntries, selectedDay, selectedPeriodId]);

  // Teachers occupied during this period
  const occupiedTeacherIds = useMemo(() => {
    return new Set(activeSessionEntries.map((e) => e.teacherId));
  }, [activeSessionEntries]);

  // Available / Free teachers during this period (useful for substitution / proxy assignment)
  const freeTeachers = useMemo(() => {
    return staffList.filter((s) => !occupiedTeacherIds.has(s.id));
  }, [staffList, occupiedTeacherIds]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Selection Control Bar */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border print-d-none"
      >
        <Card.Body className="p-2.5 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center gap-1.5">
              <span className="small text-muted fw-semibold">Day:</span>
              <Form.Select
                size="sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                style={{ width: 'auto' }}
              >
                {TIMETABLE_DAYS.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.label}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-1.5">
              <span className="small text-muted fw-semibold">Period Slot:</span>
              <Form.Select
                size="sm"
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                style={{ width: 'auto' }}
              >
                {periodSlots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.startTime} - {p.endTime}) {p.isBreak ? '☕ [Break]' : ''}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.print()}
            className="d-inline-flex align-items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Session Report</span>
          </Button>
        </Card.Body>
      </Card>

      {/* Overview Metric Bar */}
      <Row className="g-2">
        <Col sm={6} lg={3}>
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className="border p-2.5"
          >
            <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
              Time Slot
            </div>
            <div className="h5 fw-bold mt-1 mb-0">{currentPeriod?.name || 'Period'}</div>
            <div className="small text-primary mt-0.5">
              {currentPeriod?.startTime} — {currentPeriod?.endTime}
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className="border p-2.5"
          >
            <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
              Active Classes
            </div>
            <div className="h5 fw-bold mt-1 mb-0">{activeSessionEntries.length} Sections</div>
            <div className="small text-muted mt-0.5">out of {sections.length} total sections</div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className="border p-2.5"
          >
            <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
              Faculty Teaching
            </div>
            <div className="h5 fw-bold text-primary mt-1 mb-0">
              {occupiedTeacherIds.size} Teachers
            </div>
            <div className="small text-muted mt-0.5">actively conducting lectures</div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card
            bg={isDark ? 'dark' : 'white'}
            text={isDark ? 'white' : 'dark'}
            className="border p-2.5"
          >
            <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
              Available Faculty (Free)
            </div>
            <div className="h5 fw-bold text-success mt-1 mb-0">{freeTeachers.length} Teachers</div>
            <div className="small text-muted mt-0.5">available for proxy / substitute</div>
          </Card>
        </Col>
      </Row>

      {/* Main Session Roster Table */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        <Card.Body className="p-3">
          <div className="pb-2 border-bottom mb-3">
            <h6 className="fw-bold mb-0">
              School-Wide Session Roster: {selectedDay} — {currentPeriod?.name} (
              {currentPeriod?.startTime}-{currentPeriod?.endTime})
            </h6>
            <p className="text-muted small mb-0 mt-0.5">
              Live schedule of all classroom standard lectures and assigned faculty across campus.
            </p>
          </div>

          {currentPeriod?.isBreak ? (
            <div className="py-5 text-center text-muted">
              <span className="fs-2 mb-2 d-block">☕</span>
              <div className="fw-bold">{currentPeriod.name} in Progress</div>
              <p className="small mt-1 mb-0">
                Scheduled recess break between {currentPeriod.startTime} and {currentPeriod.endTime}
                . No formal classroom lectures.
              </p>
            </div>
          ) : activeSessionEntries.length === 0 ? (
            <div className="py-5 text-center text-muted">
              <CalendarDays size={36} className="mx-auto mb-2 text-muted" />
              <p className="small mb-0">No classes scheduled during this period slot yet.</p>
            </div>
          ) : (
            <Table
              responsive
              bordered
              hover
              size="sm"
              variant={isDark ? 'dark' : undefined}
              className="mb-0 align-middle"
            >
              <thead className="table-light small text-uppercase">
                <tr>
                  <th style={{ width: '160px' }}>Class &amp; Section</th>
                  <th>Subject</th>
                  <th>Faculty Teacher</th>
                  <th style={{ width: '130px' }}>Room / Venue</th>
                  <th style={{ width: '110px' }}>Session Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activeSessionEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="fw-bold text-primary small">
                      {entry.className} — Section {entry.sectionName}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="fw-semibold small">{entry.subjectName}</span>
                        <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>
                          {entry.subjectCode}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 small">
                        <UserCheck size={13} className="text-primary flex-shrink-0" />
                        <span>{entry.teacherName}</span>
                      </div>
                    </td>
                    <td className="small text-muted">
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={12} className="text-muted" />
                        <span>{entry.room || 'Room 101'}</span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        bg="light"
                        text="dark"
                        className="border small fw-normal text-uppercase"
                      >
                        {entry.periodType || 'REGULAR'}
                      </Badge>
                    </td>
                    <td className="text-muted small fst-italic">{entry.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Free Teachers Roster for Substitution */}
          {!currentPeriod?.isBreak && freeTeachers.length > 0 && (
            <div className="pt-3 border-top mt-3">
              <h6 className="fw-bold small text-muted text-uppercase mb-2 d-flex align-items-center gap-1.5">
                <CheckCircle2 size={14} className="text-success" />
                <span>Available Faculty Teachers for Substitution ({freeTeachers.length})</span>
              </h6>
              <div className="d-flex flex-wrap gap-1.5">
                {freeTeachers.map((t) => (
                  <Badge
                    key={t.id}
                    bg="light"
                    text="dark"
                    className="border fw-medium px-2 py-1 text-muted"
                  >
                    {t.firstName} {t.lastName} ({t.departmentName})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
