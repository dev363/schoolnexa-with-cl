import React, { useState, useMemo } from 'react';
import { Card, Button, Dropdown, Nav, Form, Badge, Alert, Stack } from 'react-bootstrap';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Wrench,
  Save,
  History,
  Layers,
  User,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { AcademicYearSectionItem, DayOfWeek, StaffMember, TimetableEntry } from '@/types';
import { GeneratedTimetableDraft, GridSlot, RegenerateScope } from '@/services/timetable/types';
import { TimetableGrid } from './TimetableGrid';
import { TeacherTimetable } from './TeacherTimetable';
import { RoomTimetable } from './RoomTimetable';
import { TimetableConflicts } from './TimetableConflicts';

interface TimetablePreviewProps {
  draft: GeneratedTimetableDraft;
  sections: AcademicYearSectionItem[];
  staff: StaffMember[];
  slots: GridSlot[];
  onMoveEntry: (
    sourceEntry: TimetableEntry,
    targetDay: DayOfWeek,
    targetPeriodNumber: number,
  ) => void;
  onAutoFix: () => void;
  onRegenerate: (scope: RegenerateScope, filterId: string) => void;
  onOpenSaveModal: () => void;
  onOpenHistoryModal: () => void;
  onBackToRequirements: () => void;
  autoFixBannerMessage?: string | null;
}

export const TimetablePreview: React.FC<TimetablePreviewProps> = ({
  draft,
  sections,
  staff,
  slots,
  onMoveEntry,
  onAutoFix,
  onRegenerate,
  onOpenSaveModal,
  onOpenHistoryModal,
  onBackToRequirements,
  autoFixBannerMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'CLASS' | 'TEACHER' | 'ROOM' | 'ISSUES'>('CLASS');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
    return sections[0]?.id || draft.entries[0]?.academicYearSectionId || '';
  });
  const [selectedDayForRegen] = useState<DayOfWeek>('MONDAY');

  const quality = draft.quality;
  const hasZeroHardConflicts = quality.hardConflicts === 0 && quality.unscheduledPeriods === 0;

  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || sections[0];
  }, [sections, selectedSectionId]);

  return (
    <div
      id="timetable-preview-container"
      className="d-flex flex-column gap-4 max-w-7xl mx-auto w-100"
    >
      {/* Top Banner & Status */}
      <Card className="shadow-sm border">
        <Card.Body className="p-4 d-flex flex-column gap-3">
          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
            <Stack direction="horizontal" gap={3} className="align-items-center">
              <div
                className={`rounded-3 d-flex align-items-center justify-center text-white shadow-sm p-2 ${
                  hasZeroHardConflicts ? 'bg-success' : 'bg-warning text-dark'
                }`}
                style={{ width: '44px', height: '44px' }}
              >
                {hasZeroHardConflicts ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2">
                  <h2 className="h5 fw-bold mb-0">
                    {hasZeroHardConflicts
                      ? 'Timetable Generated — Zero Clashes ✓'
                      : `${quality.hardConflicts + quality.unscheduledPeriods} Issues Found`}
                  </h2>
                  <Badge
                    bg={
                      quality.score >= 90 ? 'success' : quality.score >= 70 ? 'warning' : 'danger'
                    }
                    className="font-monospace"
                  >
                    Score: {quality.score}/100
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                  {hasZeroHardConflicts
                    ? `Generated ${draft.entries.length} clash-free periods in ${(draft.generationDurationMs / 1000).toFixed(1)}s. Ready to inspect, adjust, and publish.`
                    : 'Some periods or teacher loads require attention. Use Auto Fix to resolve automatically.'}
                </p>
              </div>
            </Stack>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Auto Fix Button */}
              <Button
                id="btn-auto-fix-timetable"
                variant="warning"
                size="sm"
                onClick={onAutoFix}
                className="d-inline-flex align-items-center gap-1.5 fw-bold"
                title="Automatically rearranges minimal affected periods to resolve clashes"
              >
                <Wrench size={14} />
                <span>Auto Fix Timetable</span>
              </Button>

              {/* Regenerate with dropdown */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  size="sm"
                  id="dropdown-regenerate"
                  className="d-inline-flex align-items-center gap-1.5"
                >
                  <RotateCw size={14} />
                  <span>Regenerate</span>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="shadow-lg border">
                  <Dropdown.Item
                    onClick={() => onRegenerate('FIX_CONFLICTS_ONLY', '')}
                    className="d-flex align-items-center justify-content-between small py-2"
                  >
                    <span>Fix Conflicts Only</span>
                    <Badge bg="success-subtle" text="success" className="ms-2">
                      Default
                    </Badge>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onRegenerate('ENTIRE_TIMETABLE', '')}
                    className="small py-2"
                  >
                    Regenerate Entire Timetable
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (currentSection) {
                        onRegenerate('THIS_CLASS', currentSection.classId);
                      }
                    }}
                    className="small py-2"
                  >
                    Regenerate This Class ({currentSection?.className || 'Class'})
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onRegenerate('SELECTED_DAY', selectedDayForRegen)}
                    className="small py-2"
                  >
                    Regenerate Selected Day (Monday)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* History */}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onOpenHistoryModal}
                className="d-inline-flex align-items-center gap-1.5"
                title="View previous timetable runs"
              >
                <History size={14} />
                <span>History</span>
              </Button>

              {/* Primary: Save & Publish */}
              <Button
                id="btn-open-save-modal"
                variant="primary"
                size="sm"
                onClick={onOpenSaveModal}
                className="d-inline-flex align-items-center gap-1.5 fw-bold"
              >
                <Save size={14} />
                <span>Save Timetable</span>
              </Button>
            </div>
          </div>

          {/* Auto Fix banner feedback if triggered */}
          {autoFixBannerMessage && (
            <Alert
              variant="success"
              className="mb-0 py-2 px-3 small d-flex align-items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span>{autoFixBannerMessage}</span>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Main View Tabs Bar */}
      <Card className="shadow-sm border">
        <Card.Body className="p-2.5 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          {/* Tabs */}
          <Nav variant="pills" className="gap-1">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'CLASS'}
                onClick={() => setActiveTab('CLASS')}
                className="py-1.5 px-3 small fw-semibold d-flex align-items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <Layers size={14} />
                <span>Class Timetable</span>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                active={activeTab === 'TEACHER'}
                onClick={() => setActiveTab('TEACHER')}
                className="py-1.5 px-3 small fw-semibold d-flex align-items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <User size={14} />
                <span>Teacher Timetable</span>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                active={activeTab === 'ROOM'}
                onClick={() => setActiveTab('ROOM')}
                className="py-1.5 px-3 small fw-semibold d-flex align-items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <MapPin size={14} />
                <span>Room Timetable</span>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                active={activeTab === 'ISSUES'}
                onClick={() => setActiveTab('ISSUES')}
                className="py-1.5 px-3 small fw-semibold d-flex align-items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <ShieldCheck size={14} />
                <span>Quality & Issues</span>
                {quality.messages.length > 0 && (
                  <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.65rem' }}>
                    {quality.messages.length}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Section selector for Class tab */}
          {activeTab === 'CLASS' && (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-medium text-nowrap">Viewing Section:</span>
              <Form.Select
                size="sm"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                style={{ width: 'auto', minWidth: '180px' }}
                className="fw-semibold"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className || 'Class'} — Section {s.sectionName}
                  </option>
                ))}
              </Form.Select>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Tab Contents */}
      <div>
        {activeTab === 'CLASS' && (
          <TimetableGrid
            entries={draft.entries}
            sectionId={selectedSectionId}
            config={draft.config}
            slots={slots}
            allEntries={draft.entries}
            onMoveEntry={onMoveEntry}
          />
        )}

        {activeTab === 'TEACHER' && (
          <TeacherTimetable
            entries={draft.entries}
            staff={staff}
            config={draft.config}
            slots={slots}
          />
        )}

        {activeTab === 'ROOM' && (
          <RoomTimetable entries={draft.entries} config={draft.config} slots={slots} />
        )}

        {activeTab === 'ISSUES' && (
          <TimetableConflicts
            messages={quality.messages}
            onAutoFix={onAutoFix}
            onNavigateToStep2={onBackToRequirements}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="d-flex align-items-center justify-content-between pt-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onBackToRequirements}
          className="d-inline-flex align-items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Edit Requirements (Step 2)</span>
        </Button>

        <Button
          id="btn-save-publish-timetable-footer"
          variant="primary"
          size="sm"
          onClick={onOpenSaveModal}
          className="d-inline-flex align-items-center gap-1.5 fw-bold px-3 py-2"
        >
          <Save size={14} />
          <span>Save & Publish Timetable</span>
        </Button>
      </div>
    </div>
  );
};
