import React, { useState, useMemo } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Printer, Search, MapPin } from 'lucide-react';
import { StaffMember, TimetableEntry, TimetablePeriodSlot, DayOfWeek } from '@/types';

interface TeacherScheduleViewProps {
  staffList: StaffMember[];
  allTimetableEntries: TimetableEntry[];
  periodSlots: TimetablePeriodSlot[];
  activeDays: { day: DayOfWeek; label: string; short: string }[];
  schoolName: string;
  academicYearName: string;
  getSubjectColorStyle: (subjectName: string) => string;
  isDark: boolean;
}

export const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
  staffList,
  allTimetableEntries,
  periodSlots,
  activeDays,
  schoolName,
  academicYearName,
  getSubjectColorStyle,
  isDark,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(staffList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        s.departmentName.toLowerCase().includes(q),
    );
  }, [staffList, searchQuery]);

  const currentTeacher = useMemo(
    () => staffList.find((s) => s.id === selectedTeacherId) || staffList[0],
    [staffList, selectedTeacherId],
  );

  const teacherEntries = useMemo(() => {
    if (!currentTeacher) return [];
    return allTimetableEntries.filter((e) => e.teacherId === currentTeacher.id);
  }, [allTimetableEntries, currentTeacher]);

  // Distinct classes taught by this teacher
  const classesTaught = useMemo(() => {
    const set = new Set<string>();
    teacherEntries.forEach((e) => {
      set.add(`${e.className}-${e.sectionName}`);
    });
    return Array.from(set);
  }, [teacherEntries]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Teacher Selector Toolbar */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border print-d-none"
      >
        <Card.Body className="p-2.5 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <div
            className="d-flex align-items-center gap-2 flex-grow-1"
            style={{ maxWidth: '500px' }}
          >
            <span className="small text-muted fw-semibold text-nowrap">
              Select Faculty Teacher:
            </span>
            <Form.Select
              size="sm"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
            >
              {filteredStaff.map((stf) => (
                <option key={stf.id} value={stf.id}>
                  {stf.firstName} {stf.lastName} ({stf.employeeCode}) — {stf.departmentName}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <InputGroup size="sm" style={{ width: '180px' }}>
              <InputGroup.Text className="bg-transparent border-end-0 py-1">
                <Search size={13} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.print()}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print Schedule</span>
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Teacher Schedule Container */}
      {currentTeacher && (
        <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
          <Card.Body className="p-4">
            {/* Header Card */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-3">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="small fw-bold text-uppercase text-primary"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    Faculty Teaching Schedule
                  </span>
                  <Badge bg="secondary" className="fw-normal">
                    {academicYearName}
                  </Badge>
                </div>
                <h4 className="fw-bold mt-1 mb-1 d-flex align-items-center gap-2">
                  <span>
                    {currentTeacher.firstName} {currentTeacher.lastName}
                  </span>
                  <span className="small text-muted fw-normal">
                    ({currentTeacher.employeeCode})
                  </span>
                </h4>
                <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                  <span>{currentTeacher.designationName || 'Faculty Teacher'}</span>
                  <span>•</span>
                  <span>
                    Dept: <strong>{currentTeacher.departmentName}</strong>
                  </span>
                  <span>•</span>
                  <span>Email: {currentTeacher.email}</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Card
                  className="border p-2 text-center bg-light bg-opacity-50"
                  style={{ minWidth: '90px' }}
                >
                  <div className="h4 fw-bold text-primary mb-0">{teacherEntries.length}</div>
                  <div
                    className="text-muted fw-semibold text-uppercase"
                    style={{ fontSize: '0.65rem' }}
                  >
                    Periods / Wk
                  </div>
                </Card>
                <Card
                  className="border p-2 text-center bg-light bg-opacity-50"
                  style={{ minWidth: '90px' }}
                >
                  <div className="h4 fw-bold text-dark mb-0">{classesTaught.length}</div>
                  <div
                    className="text-muted fw-semibold text-uppercase"
                    style={{ fontSize: '0.65rem' }}
                  >
                    Sections
                  </div>
                </Card>
              </div>
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
                      <td className="text-center table-light align-middle">
                        <div className="fw-bold small">{slot.name}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </td>

                      {activeDays.map((d) => {
                        const entry = teacherEntries.find(
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
                                <div className="d-flex align-items-center justify-content-between gap-1">
                                  <span className="fw-bold small text-primary text-truncate">
                                    {entry.className} - {entry.sectionName}
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
                                  className="fw-semibold small text-truncate mt-1"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {entry.subjectName}
                                </div>

                                <div
                                  className="d-flex align-items-center justify-content-between text-muted mt-1"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  <div className="d-flex align-items-center gap-1">
                                    <MapPin size={11} />
                                    <span>{entry.room || 'Room 101'}</span>
                                  </div>
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
                                Free Period
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

            {/* Assigned Classes Pill List */}
            <div className="pt-3 border-top d-flex flex-wrap align-items-center gap-2 small">
              <span className="fw-semibold text-muted">Classes &amp; Sections Taught:</span>
              {classesTaught.length > 0 ? (
                classesTaught.map((cls, idx) => (
                  <Badge key={idx} bg="primary" className="fw-medium px-2 py-1">
                    {cls}
                  </Badge>
                ))
              ) : (
                <span className="text-muted">No scheduled classes in timetable yet.</span>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
