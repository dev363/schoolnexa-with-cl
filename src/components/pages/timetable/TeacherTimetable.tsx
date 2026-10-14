import React, { useState } from 'react';
import { Card, Table, Form, Badge, Stack } from 'react-bootstrap';
import { User, Clock, MapPin, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { DayOfWeek, StaffMember, TimetableEntry } from '@/types';
import { GridSlot, TimetableSetupConfig } from '@/services/timetable/types';
import { getSubjectColor } from './TimetableGrid';

interface TeacherTimetableProps {
  entries: TimetableEntry[];
  staff: StaffMember[];
  config: TimetableSetupConfig;
  slots: GridSlot[];
}

export const TeacherTimetable: React.FC<TeacherTimetableProps> = ({
  entries,
  staff,
  config,
  slots,
}) => {
  // Select first teacher who has at least one assignment if possible
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const teacherWithEntry = staff.find((s) => entries.some((e) => e.teacherId === s.id));
    return teacherWithEntry?.id || staff[0]?.id || '';
  });

  const currentTeacher = staff.find((s) => s.id === selectedTeacherId);
  const teacherEntries = entries.filter((e) => e.teacherId === selectedTeacherId);

  const periodNumbers = Array.from({ length: config.periodsPerDay }, (_, i) => i + 1);

  // Group by day and period to detect any double-booking
  const cellMap = new Map<string, TimetableEntry[]>();
  teacherEntries.forEach((e) => {
    const pNum = parseInt(e.periodId.replace(/\D/g, ''), 10) || 1;
    const key = `${e.dayOfWeek}-${pNum}`;
    const list = cellMap.get(key) || [];
    list.push(e);
    cellMap.set(key, list);
  });

  // Calculate stats
  const totalPeriods = teacherEntries.length;
  const classesTaught = new Set(teacherEntries.map((e) => `${e.className}-${e.sectionName}`)).size;
  const maxWeeklyCapacity = config.workingDays.length * config.periodsPerDay;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Teacher Selector & Stats Bar */}
      <Card className="shadow-sm border">
        <Card.Body className="p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold small"
              style={{ width: '40px', height: '40px' }}
            >
              {currentTeacher ? `${currentTeacher.firstName[0]}${currentTeacher.lastName[0]}` : 'T'}
            </div>
            <div>
              <label
                className="d-block small text-muted text-uppercase fw-semibold mb-0"
                style={{ fontSize: '0.68rem' }}
              >
                Select Faculty
              </label>
              <Form.Select
                size="sm"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="fw-bold border-0 p-0 shadow-none bg-transparent"
                style={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {staff.map((stf) => {
                  const count = entries.filter((e) => e.teacherId === stf.id).length;
                  return (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({count} periods/wk)
                    </option>
                  );
                })}
              </Form.Select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="text-sm-end">
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Weekly Teaching Load
              </div>
              <div className="small fw-bold font-monospace">
                {totalPeriods} periods{' '}
                <span className="text-muted fw-normal">/ {maxWeeklyCapacity} max</span>
              </div>
            </div>

            <div className="text-sm-end">
              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                Sections Taught
              </div>
              <div className="small fw-bold text-primary font-monospace">
                {classesTaught} sections
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Grid */}
      <Card className="shadow-sm border overflow-hidden">
        <Table
          responsive
          bordered
          hover
          className="align-middle mb-0 text-center"
          style={{ minWidth: '700px' }}
        >
          <thead className="bg-body-tertiary">
            <tr className="border-bottom">
              <th
                className="py-2.5 px-3 text-center small fw-bold text-uppercase text-muted"
                style={{ width: '120px' }}
              >
                Day
              </th>
              {periodNumbers.map((p) => {
                const matchingSlot = slots.find((s) => s.periodNumber === p);
                return (
                  <th key={p} className="py-2.5 px-3 text-center small fw-bold">
                    <div>Period {p}</div>
                    <div
                      className="text-muted font-monospace small mt-0.5"
                      style={{ fontSize: '0.68rem', fontWeight: 'normal' }}
                    >
                      {matchingSlot ? `${matchingSlot.startTime}–${matchingSlot.endTime}` : ''}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {config.workingDays.map((day) => (
              <tr key={day}>
                <td className="py-3 px-2 fw-bold small text-center bg-body-tertiary">
                  <div>{day.substring(0, 3)}</div>
                  <div
                    className="text-muted text-uppercase"
                    style={{ fontSize: '0.65rem', fontWeight: 'normal' }}
                  >
                    {day}
                  </div>
                </td>

                {periodNumbers.map((periodNum) => {
                  const key = `${day}-${periodNum}`;
                  const periodEntries = cellMap.get(key) || [];
                  const isClash = periodEntries.length > 1;

                  return (
                    <td
                      key={key}
                      className={`p-1.5 align-top ${isClash ? 'bg-danger-subtle' : ''}`}
                      style={{ minWidth: '120px', height: '80px' }}
                    >
                      {periodEntries.length > 0 ? (
                        <div className="d-flex flex-column gap-1 h-100">
                          {periodEntries.map((entry) => {
                            const color = getSubjectColor(entry.subjectName);
                            return (
                              <div
                                key={entry.id}
                                className={`p-2 rounded border small h-100 d-flex flex-column justify-content-between text-start ${
                                  isClash
                                    ? 'border-danger bg-danger-subtle text-danger'
                                    : `${color.bg} ${color.border} ${color.text}`
                                }`}
                              >
                                <div>
                                  <div className="fw-bold small d-flex align-items-center justify-content-between">
                                    <span className="text-truncate">{entry.subjectName}</span>
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="border font-monospace ms-1"
                                      style={{ fontSize: '0.65rem' }}
                                    >
                                      {entry.className}-{entry.sectionName}
                                    </Badge>
                                  </div>
                                  <div
                                    className="small opacity-75 mt-0.5 d-flex align-items-center gap-1"
                                    style={{ fontSize: '0.68rem' }}
                                  >
                                    <MapPin size={10} />
                                    <span>{entry.room || 'Room'}</span>
                                  </div>
                                </div>
                                {isClash && (
                                  <div
                                    className="text-danger fw-bold d-flex align-items-center gap-1 mt-1"
                                    style={{ fontSize: '0.68rem' }}
                                  >
                                    <AlertCircle size={12} />
                                    <span>Double booked!</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="h-100 rounded border border-dashed d-flex align-items-center justify-content-center text-muted small"
                          style={{ fontSize: '0.7rem' }}
                        >
                          <span>Free</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
