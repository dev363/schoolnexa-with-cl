import React, { useState } from 'react';
import { Card, Table, Form, Badge } from 'react-bootstrap';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { DayOfWeek, TimetableEntry } from '@/types';
import { GridSlot, TimetableSetupConfig } from '@/services/timetable/types';
import { getSubjectColor } from './TimetableGrid';

interface RoomTimetableProps {
  entries: TimetableEntry[];
  config: TimetableSetupConfig;
  slots: GridSlot[];
}

export const RoomTimetable: React.FC<RoomTimetableProps> = ({ entries, config, slots }) => {
  // Collect all unique rooms
  const allRooms = Array.from(
    new Set(entries.map((e) => e.room).filter(Boolean)),
  ).sort() as string[];

  const [selectedRoom, setSelectedRoom] = useState<string>(() => {
    return allRooms[0] || 'Room 101';
  });

  const roomEntries = entries.filter((e) => e.room === selectedRoom);
  const periodNumbers = Array.from({ length: config.periodsPerDay }, (_, i) => i + 1);

  // Group by day and period
  const cellMap = new Map<string, TimetableEntry[]>();
  roomEntries.forEach((e) => {
    const pNum = parseInt(e.periodId.replace(/\D/g, ''), 10) || 1;
    const key = `${e.dayOfWeek}-${pNum}`;
    const list = cellMap.get(key) || [];
    list.push(e);
    cellMap.set(key, list);
  });

  return (
    <div className="d-flex flex-column gap-3">
      {/* Room Selector Bar */}
      <Card className="shadow-sm border">
        <Card.Body className="p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center p-2"
              style={{ width: '40px', height: '40px' }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <label
                className="d-block small text-muted text-uppercase fw-semibold mb-0"
                style={{ fontSize: '0.68rem' }}
              >
                Select Room / Lab
              </label>
              <Form.Select
                size="sm"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="fw-bold border-0 p-0 shadow-none bg-transparent"
                style={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {allRooms.map((r) => (
                  <option key={r} value={r}>
                    {r} ({entries.filter((e) => e.room === r).length} periods/wk)
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <div className="text-sm-end">
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Total Utilization
            </div>
            <div className="small fw-bold font-monospace text-primary">
              {roomEntries.length} periods occupied
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
                  const pEntries = cellMap.get(key) || [];
                  const isClash = pEntries.length > 1;

                  return (
                    <td
                      key={key}
                      className={`p-1.5 align-top ${isClash ? 'bg-danger-subtle' : ''}`}
                      style={{ minWidth: '120px', height: '80px' }}
                    >
                      {pEntries.length > 0 ? (
                        <div className="d-flex flex-column gap-1 h-100">
                          {pEntries.map((entry) => {
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
                                    className="small opacity-75 mt-0.5"
                                    style={{ fontSize: '0.68rem' }}
                                  >
                                    {entry.teacherName || 'Faculty'}
                                  </div>
                                </div>
                                {isClash && (
                                  <div
                                    className="text-danger fw-bold d-flex align-items-center gap-1 mt-1"
                                    style={{ fontSize: '0.68rem' }}
                                  >
                                    <AlertCircle size={12} />
                                    <span>Room double booked!</span>
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
                          <span>Available</span>
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
