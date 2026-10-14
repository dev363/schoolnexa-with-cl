import React from 'react';
import { Card, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import { Printer, UserCheck, Building2 } from 'lucide-react';
import {
  TimetableEntry,
  TimetablePeriodSlot,
  AcademicYearSectionItem,
  ClassItem,
  TeacherAssignmentItem,
  DayOfWeek,
} from '@/types';

interface ClassNoticeboardTimetableProps {
  currentSection: AcademicYearSectionItem;
  currentClass: ClassItem | undefined;
  classTeacher: TeacherAssignmentItem | undefined;
  timetableEntries: TimetableEntry[];
  periodSlots: TimetablePeriodSlot[];
  activeDays: { day: DayOfWeek; label: string; short: string }[];
  schoolName: string;
  academicYearName: string;
  getSubjectColorStyle: (subjectName: string) => string;
  isDark: boolean;
}

export const ClassNoticeboardTimetable: React.FC<ClassNoticeboardTimetableProps> = ({
  currentSection,
  currentClass,
  classTeacher,
  timetableEntries,
  periodSlots,
  activeDays,
  schoolName,
  academicYearName,
  getSubjectColorStyle,
  isDark,
}) => {
  // Aggregate subject loads for this section
  const subjectSummary = React.useMemo(() => {
    const map = new Map<
      string,
      {
        subjectName: string;
        subjectCode: string;
        teacherName: string;
        count: number;
        periodTypes: Set<string>;
      }
    >();
    timetableEntries.forEach((entry) => {
      const key = entry.subjectId || entry.subjectName;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.periodTypes.add(entry.periodType || 'REGULAR');
      } else {
        map.set(key, {
          subjectName: entry.subjectName,
          subjectCode: entry.subjectCode,
          teacherName: entry.teacherName,
          count: 1,
          periodTypes: new Set([entry.periodType || 'REGULAR']),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [timetableEntries]);

  return (
    <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
      <Card.Body className="p-4">
        {/* Notice Board Print Header Container */}
        <div className="d-flex flex-column flex-sm-row sm:align-items-center justify-content-between gap-3 pb-3 border-bottom mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="small fw-bold text-uppercase text-primary"
                style={{ letterSpacing: '0.05em' }}
              >
                Official Class Timetable
              </span>
              <Badge bg="secondary" className="fw-normal">
                {academicYearName}
              </Badge>
            </div>
            <h4 className="fw-bold mt-1 mb-1">
              {currentClass?.name || currentSection.className} — Section{' '}
              {currentSection.sectionName}
            </h4>
            <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
              <span className="d-inline-flex align-items-center gap-1">
                <Building2 size={14} className="text-muted" />
                <span>{schoolName}</span>
              </span>
              <span>•</span>
              <span className="d-inline-flex align-items-center gap-1">
                <UserCheck size={14} className="text-primary" />
                <span>
                  Homeroom / Class Teacher:{' '}
                  <strong>{classTeacher?.staffName || 'Unassigned'}</strong>
                </span>
              </span>
              <span>•</span>
              <span>
                Total Weekly Periods: <strong>{timetableEntries.length}</strong>
              </span>
              <span>•</span>
              <span>Room: Room {currentSection.className?.replace('Grade ', '') || '10'}1</span>
            </div>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.print()}
            className="d-inline-flex align-items-center gap-1.5 align-self-start print-d-none"
          >
            <Printer size={14} />
            <span>Print Timetable</span>
          </Button>
        </div>

        {/* Weekly Grid */}
        <Table
          responsive
          bordered
          hover
          size="sm"
          variant={isDark ? 'dark' : undefined}
          className="mb-4 align-middle"
        >
          <thead className="table-light text-center small text-uppercase">
            <tr>
              <th style={{ width: '120px' }}>Period Slot</th>
              {activeDays.map((d) => (
                <th key={d.day} className="text-start ps-2">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodSlots.map((slot) => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.id} className="table-warning text-center small">
                    <td className="fw-semibold">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td colSpan={activeDays.length} className="text-center fw-medium py-1">
                      ☕ {slot.name} ({slot.startTime} - {slot.endTime})
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.id}>
                  {/* Period Time Column */}
                  <td className="text-center table-light align-middle">
                    <div className="fw-bold small">{slot.name}</div>
                    <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </td>

                  {/* Day Columns */}
                  {activeDays.map((d) => {
                    const entry = timetableEntries.find(
                      (e) => e.dayOfWeek === d.day && e.periodId === slot.id,
                    );

                    return (
                      <td
                        key={d.day}
                        className="p-1 align-top"
                        style={{ minWidth: '130px', height: '70px' }}
                      >
                        {entry ? (
                          <div
                            className={`p-2 rounded h-100 d-flex flex-column justify-content-between ${getSubjectColorStyle(
                              entry.subjectName,
                            )}`}
                            style={{ minHeight: '60px' }}
                          >
                            <div>
                              <div className="d-flex align-items-start justify-content-between gap-1">
                                <span
                                  className="fw-bold small text-truncate"
                                  style={{ fontSize: '0.8rem' }}
                                >
                                  {entry.subjectName}
                                </span>
                                <Badge
                                  bg="dark"
                                  className="bg-opacity-50"
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {entry.subjectCode}
                                </Badge>
                              </div>

                              <div
                                className="d-flex align-items-center gap-1 text-muted small text-truncate mt-1"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <UserCheck size={12} className="text-primary flex-shrink-0" />
                                <span className="text-truncate">{entry.teacherName}</span>
                              </div>
                            </div>

                            <div
                              className="d-flex align-items-center justify-content-between text-muted mt-1"
                              style={{ fontSize: '0.7rem' }}
                            >
                              <span>{entry.room || 'Room 101'}</span>
                              {entry.periodType !== 'REGULAR' && (
                                <Badge bg="light" text="dark" style={{ fontSize: '0.65rem' }}>
                                  {entry.periodType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="h-100 d-flex align-items-center justify-content-center text-muted small fst-italic"
                            style={{ minHeight: '60px', fontSize: '0.75rem' }}
                          >
                            Free
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

        {/* Subject Summary Table */}
        <div className="pt-3 border-top">
          <h6 className="fw-bold small text-uppercase mb-2 text-muted">
            Curriculum Subject Distribution &amp; Faculty Roster
          </h6>
          <Row className="g-2">
            {subjectSummary.map((sub, idx) => (
              <Col key={idx} sm={6} lg={4}>
                <Card className="border p-2 bg-light bg-opacity-50">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div>
                      <div className="fw-bold small">
                        {sub.subjectName} ({sub.subjectCode})
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        Faculty: {sub.teacherName}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <Badge bg="primary" className="fw-semibold">
                        {sub.count} periods/wk
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};
