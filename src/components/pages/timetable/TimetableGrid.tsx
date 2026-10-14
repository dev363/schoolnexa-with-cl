import React, { useState } from 'react';
import { Table, Card, Alert, Button, Badge } from 'react-bootstrap';
import {
  Clock,
  User,
  MapPin,
  Move,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { DayOfWeek, TimetableEntry } from '@/types';
import { GridSlot, TimetableSetupConfig } from '@/services/timetable/types';
import { TimetableValidator } from '@/services/timetable/timetableValidator';
import { SUBJECT_COLORS, getSubjectColor } from '@/config/Options';

export { SUBJECT_COLORS, getSubjectColor };

interface TimetableGridProps {
  entries: TimetableEntry[];
  sectionId: string;
  config: TimetableSetupConfig;
  slots: GridSlot[];
  allEntries: TimetableEntry[];
  onMoveEntry: (
    sourceEntry: TimetableEntry,
    targetDay: DayOfWeek,
    targetPeriodNumber: number,
  ) => void;
  onEditEntry?: (entry: TimetableEntry) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  sectionId,
  config,
  slots,
  allEntries,
  onMoveEntry,
  onEditEntry,
}) => {
  const [draggedEntry, setDraggedEntry] = useState<TimetableEntry | null>(null);
  const [selectedEntryForSwap, setSelectedEntryForSwap] = useState<TimetableEntry | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter entries for this section
  const sectionEntries = entries.filter((e) => e.academicYearSectionId === sectionId);

  // Group periods
  const periodNumbers = Array.from({ length: config.periodsPerDay }, (_, i) => i + 1);

  // Map entries by Day + PeriodNumber
  const cellMap = new Map<string, TimetableEntry>();
  sectionEntries.forEach((e) => {
    const periodNum = parseInt(e.periodId.replace(/\D/g, ''), 10) || 1;
    cellMap.set(`${e.dayOfWeek}-${periodNum}`, e);
  });

  // Calculate timing for each period number
  const periodTimings = periodNumbers.map((p) => {
    const matchingSlot = slots.find((s) => s.periodNumber === p);
    return {
      periodNumber: p,
      time: matchingSlot ? `${matchingSlot.startTime} – ${matchingSlot.endTime}` : `Period ${p}`,
    };
  });

  const handleDragStart = (e: React.DragEvent, entry: TimetableEntry) => {
    setDraggedEntry(entry);
    e.dataTransfer.setData('text/plain', entry.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: DayOfWeek, period: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredTarget(`${day}-${period}`);
  };

  const handleDrop = (e: React.DragEvent, targetDay: DayOfWeek, targetPeriod: number) => {
    e.preventDefault();
    setHoveredTarget(null);

    if (!draggedEntry) return;

    // Validate move
    const validation = TimetableValidator.validateManualMove(
      draggedEntry,
      targetDay,
      targetPeriod,
      `p${targetPeriod}`,
      allEntries,
      config,
    );

    if (!validation.valid) {
      setErrorMessage(validation.humanMessage);
      setTimeout(() => setErrorMessage(null), 4500);
      setDraggedEntry(null);
      return;
    }

    onMoveEntry(draggedEntry, targetDay, targetPeriod);
    setDraggedEntry(null);
  };

  // Click-to-swap alternative for mobile or users who prefer clicking
  const handleCellClick = (day: DayOfWeek, period: number, entry?: TimetableEntry) => {
    if (!selectedEntryForSwap) {
      if (entry) {
        setSelectedEntryForSwap(entry);
      }
    } else {
      // Trying to move/swap selected entry to this slot
      const validation = TimetableValidator.validateManualMove(
        selectedEntryForSwap,
        day,
        period,
        `p${period}`,
        allEntries,
        config,
      );

      if (!validation.valid) {
        setErrorMessage(validation.humanMessage);
        setTimeout(() => setErrorMessage(null), 4500);
      } else {
        onMoveEntry(selectedEntryForSwap, day, period);
      }
      setSelectedEntryForSwap(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Error alert toast if clash occurred */}
      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setErrorMessage(null)}
          className="d-flex align-items-center justify-content-between py-2 px-3 small shadow-sm mb-0"
        >
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="fw-semibold">{errorMessage}</span>
          </div>
        </Alert>
      )}

      {/* Selected for Swap Indicator */}
      {selectedEntryForSwap && (
        <Alert
          variant="primary"
          className="d-flex align-items-center justify-content-between py-2 px-3 small shadow-sm mb-0"
        >
          <div className="d-flex align-items-center gap-2">
            <ArrowRightLeft size={16} className="text-primary" />
            <span>
              Moving <strong>{selectedEntryForSwap.subjectName}</strong>. Click any target slot to
              move or swap.
            </span>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setSelectedEntryForSwap(null)}
            className="py-0 px-2"
            style={{ fontSize: '0.75rem' }}
          >
            Cancel
          </Button>
        </Alert>
      )}

      {/* The Grid Table */}
      <Card className="shadow-sm border overflow-hidden">
        <Table
          responsive
          bordered
          hover
          className="align-middle mb-0"
          style={{ minWidth: '700px' }}
        >
          <thead className="bg-body-tertiary">
            <tr className="border-bottom">
              <th
                className="py-2.5 px-3 text-center small fw-bold text-uppercase text-muted"
                style={{ width: '120px' }}
              >
                Day / Time
              </th>
              {periodTimings.map((pt) => (
                <th key={pt.periodNumber} className="py-2.5 px-3 text-center small fw-bold">
                  <div>Period {pt.periodNumber}</div>
                  <div
                    className="text-muted font-monospace small d-flex align-items-center justify-content-center gap-1 mt-0.5"
                    style={{ fontSize: '0.68rem', fontWeight: 'normal' }}
                  >
                    <Clock size={11} />
                    <span>{pt.time}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.workingDays.map((day) => (
              <tr key={day}>
                {/* Day Column */}
                <td className="py-3 px-2 fw-bold small text-center bg-body-tertiary">
                  <div>{day.substring(0, 3)}</div>
                  <div
                    className="text-muted text-uppercase"
                    style={{ fontSize: '0.65rem', fontWeight: 'normal' }}
                  >
                    {day}
                  </div>
                </td>

                {/* Period Columns */}
                {periodNumbers.map((periodNum) => {
                  const key = `${day}-${periodNum}`;
                  const entry = cellMap.get(key);
                  const isHovered = hoveredTarget === key;
                  const isSelected = selectedEntryForSwap?.id === entry?.id;
                  const color = entry ? getSubjectColor(entry.subjectName) : null;

                  return (
                    <td
                      key={key}
                      onDragOver={(e) => handleDragOver(e, day, periodNum)}
                      onDragLeave={() => setHoveredTarget(null)}
                      onDrop={(e) => handleDrop(e, day, periodNum)}
                      onClick={() => handleCellClick(day, periodNum, entry)}
                      className={`p-1.5 align-top transition-all ${
                        isHovered
                          ? 'bg-primary-subtle'
                          : isSelected
                            ? 'bg-primary-subtle border border-primary'
                            : ''
                      }`}
                      style={{ minWidth: '120px', height: '80px', cursor: 'pointer' }}
                    >
                      {entry ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, entry)}
                          className={`p-2 rounded border small h-100 d-flex flex-column justify-content-between ${
                            color?.bg
                          } ${color?.border} ${color?.text}`}
                          style={{ cursor: 'grab' }}
                        >
                          <div className="d-flex align-items-start justify-content-between gap-1">
                            <span className="fw-bold small text-truncate leading-tight">
                              {entry.subjectName}
                            </span>
                            <Badge
                              bg="light"
                              text="dark"
                              className="border font-monospace shrink-0"
                              style={{ fontSize: '0.65rem' }}
                            >
                              {entry.subjectCode || 'SUB'}
                            </Badge>
                          </div>

                          <div className="mt-1" style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                            {entry.teacherName && (
                              <div
                                className="d-flex align-items-center gap-1 text-truncate"
                                title={entry.teacherName}
                              >
                                <User size={11} className="shrink-0 opacity-75" />
                                <span className="text-truncate">
                                  {entry.teacherName.split(' ')[0]}
                                </span>
                              </div>
                            )}
                            {entry.room && (
                              <div
                                className="d-flex align-items-center gap-1 text-truncate opacity-75"
                                title={entry.room}
                              >
                                <MapPin size={11} className="shrink-0 opacity-75" />
                                <span className="text-truncate">{entry.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="h-100 rounded border border-dashed d-flex align-items-center justify-content-center text-muted small"
                          style={{ fontSize: '0.7rem' }}
                        >
                          <span>Free Period</span>
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

      <div
        className="small text-muted d-flex align-items-center justify-content-between px-1"
        style={{ fontSize: '0.72rem' }}
      >
        <span className="d-flex align-items-center gap-1">
          <Move size={12} className="text-muted" />
          Drag and drop any lesson card to move or swap periods with automatic clash prevention.
        </span>
        <span className="font-monospace">{sectionEntries.length} periods placed</span>
      </div>
    </div>
  );
};
