import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Badge,
  ButtonGroup,
  Nav,
} from 'react-bootstrap';
import {
  CalendarDays,
  Clock,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Printer,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Users,
  Settings2,
  GraduationCap,
  Save,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { TopHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { academicService, DEFAULT_PERIOD_SLOTS, TIMETABLE_DAYS } from '@/services/academicService';
import {
  TimetableEntry,
  TimetablePeriodSlot,
  DayOfWeek,
  AcademicYearSectionItem,
  ClassItem,
  StaffMember,
  SubjectItem,
  ClassSubjectItem,
  TeacherAssignmentItem,
  TimetableConflict,
} from '@/types';
import { PeriodManagementModal } from './timetable/PeriodManagementModal';
import { CopyTimetableModal } from './timetable/CopyTimetableModal';
import { TimetableSlotModal } from './timetable/TimetableSlotModal';
import { ClassNoticeboardTimetable } from './timetable/ClassNoticeboardTimetable';
import { TeacherScheduleView } from './timetable/TeacherScheduleView';
import { SessionTimetableView } from './timetable/SessionTimetableView';
import { TimetableWizard } from '../timetable/TimetableWizard';

export interface TimetableManagementViewProps {
  initialView?: 'MANAGE' | 'CLASS' | 'TEACHER' | 'SESSION' | 'CONFLICTS' | 'GENERATOR';
}

export const TimetableManagementView: React.FC<TimetableManagementViewProps> = ({
  initialView = 'MANAGE',
}) => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canManage =
    hasPermission('academics.sections.manage') ||
    hasPermission('school.settings.edit') ||
    hasPermission('academics.curriculum.edit');

  // Active view: 'MANAGE' | 'CLASS' | 'TEACHER' | 'SESSION' | 'CONFLICTS' | 'GENERATOR'
  const [activeView, setActiveView] = useState<
    'MANAGE' | 'CLASS' | 'TEACHER' | 'SESSION' | 'CONFLICTS' | 'GENERATOR'
  >(initialView);

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  // Master Data
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [periodSlots, setPeriodSlots] = useState<TimetablePeriodSlot[]>(DEFAULT_PERIOD_SLOTS);

  // Filter Selection for Section Workflow
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Draft state for in-grid editing & explicit Save Timetable button
  const [draftSectionEntries, setDraftSectionEntries] = useState<TimetableEntry[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Include Saturday toggle
  const [includeSaturday, setIncludeSaturday] = useState<boolean>(false);

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [activeSlotTarget, setActiveSlotTarget] = useState<Partial<TimetableEntry> | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Feedback notifications & status
  const toast = useToast();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (type: 'success' | 'error' | 'warning', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
  };

  // Load all master and timetable data
  const refreshData = async () => {
    if (!activeSchool) return;
    try {
      const [cls, secs, subs, cs, asgs] = await Promise.all([
        academicService.getClasses(activeSchool.id),
        academicService.getSections(activeSchool.id, activeAcademicYear?.id),
        academicService.getSubjects(activeSchool.id),
        academicService.getClassSubjects(activeSchool.id),
        academicService.getTeacherAssignments(activeSchool.id, activeAcademicYear?.id),
      ]);
      setClasses(cls);
      setSections(secs);
      setSubjects(subs);
      setClassSubjects(cs);
      setTeacherAssignments(asgs);

      const stf = academicService.getStaff(activeSchool.id);
      setStaffList(stf);

      const slots = academicService.getPeriodSlots(activeSchool.id);
      setPeriodSlots(slots);

      const entries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(entries);

      // Default selection if empty
      if (!selectedClassId && cls.length > 0) {
        setSelectedClassId(cls[0].id);
        const firstClassSecs = secs.filter((s) => s.classId === cls[0].id);
        if (firstClassSecs.length > 0) {
          setSelectedSectionId(firstClassSecs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load timetable data', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeSchool, activeAcademicYear]);

  // When selectedClassId changes, update selectedSectionId to the first section of that class
  useEffect(() => {
    if (!selectedClassId) return;
    const matchingSecs = sections.filter((s) => s.classId === selectedClassId);
    if (matchingSecs.length > 0) {
      if (!matchingSecs.some((s) => s.id === selectedSectionId)) {
        setSelectedSectionId(matchingSecs[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [selectedClassId, sections]);

  // Sync draft state whenever selectedSectionId or global timetableEntries change (unless user is in dirty editing state)
  useEffect(() => {
    if (!selectedSectionId) {
      setDraftSectionEntries([]);
      setIsDirty(false);
      return;
    }
    const currentSectionSaved = timetableEntries.filter(
      (e) => e.academicYearSectionId === selectedSectionId,
    );
    setDraftSectionEntries(currentSectionSaved);
    setIsDirty(false);
  }, [selectedSectionId, timetableEntries]);

  // Active Days to show in grid
  const activeDays = useMemo(() => {
    return includeSaturday ? TIMETABLE_DAYS : TIMETABLE_DAYS.filter((d) => d.day !== 'SATURDAY');
  }, [includeSaturday]);

  // Currently selected class & section objects
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId);
  }, [sections, selectedSectionId]);

  // Sections of currently selected class
  const classSections = useMemo(() => {
    if (!selectedClassId) return [];
    return sections.filter((s) => s.classId === selectedClassId);
  }, [sections, selectedClassId]);

  // Subjects mapped to current class
  const currentClassSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return classSubjects.filter((cs) => cs.classId === selectedClassId);
  }, [classSubjects, selectedClassId]);

  // Teachers assigned to current section
  const currentSectionAssignments = useMemo(() => {
    if (!selectedSectionId) return [];
    return teacherAssignments.filter((a) => a.academicYearSectionId === selectedSectionId);
  }, [teacherAssignments, selectedSectionId]);

  const currentSectionClassTeacher = useMemo(() => {
    return currentSectionAssignments.find((a) => a.isClassTeacher && a.isActive);
  }, [currentSectionAssignments]);

  // Global timetable conflicts detection across school
  const allConflicts = useMemo(() => {
    if (!activeSchool) return [];
    const detected: TimetableConflict[] = [];
    const seenTeacherSlots = new Map<string, TimetableEntry>();
    const seenRoomSlots = new Map<string, TimetableEntry>();

    timetableEntries.forEach((entry) => {
      // Check Teacher Double Booking
      const teacherKey = `${entry.dayOfWeek}-${entry.periodId}-${entry.teacherId}`;
      if (seenTeacherSlots.has(teacherKey)) {
        const existing = seenTeacherSlots.get(teacherKey)!;
        if (existing.academicYearSectionId !== entry.academicYearSectionId) {
          detected.push({
            type: 'TEACHER_CLASH',
            conflictingEntry: entry,
            message: `${entry.teacherName} is scheduled in ${existing.className}-${existing.sectionName} and ${entry.className}-${entry.sectionName} on ${entry.dayOfWeek} ${entry.periodId}.`,
          });
        }
      } else {
        seenTeacherSlots.set(teacherKey, entry);
      }

      // Check Room Double Booking
      if (entry.room && entry.room.trim() !== '') {
        const roomKey = `${entry.dayOfWeek}-${entry.periodId}-${entry.room.toLowerCase().trim()}`;
        if (seenRoomSlots.has(roomKey)) {
          const existingRoom = seenRoomSlots.get(roomKey)!;
          if (existingRoom.academicYearSectionId !== entry.academicYearSectionId) {
            detected.push({
              type: 'ROOM_CLASH',
              conflictingEntry: entry,
              message: `Room ${entry.room} is occupied by both ${existingRoom.className}-${existingRoom.sectionName} and ${entry.className}-${entry.sectionName} on ${entry.dayOfWeek} ${entry.periodId}.`,
            });
          }
        } else {
          seenRoomSlots.set(roomKey, entry);
        }
      }
    });

    return detected;
  }, [timetableEntries, activeSchool]);

  // Subject color styling
  const getSubjectColorStyle = (subjectName: string = '') => {
    const lower = subjectName.toLowerCase();
    if (lower.includes('math')) {
      return isDark
        ? 'bg-primary bg-opacity-25 border border-primary text-light'
        : 'bg-primary bg-opacity-10 border border-primary text-primary';
    }
    if (
      lower.includes('sci') ||
      lower.includes('phys') ||
      lower.includes('chem') ||
      lower.includes('bio')
    ) {
      return isDark
        ? 'bg-success bg-opacity-25 border border-success text-light'
        : 'bg-success bg-opacity-10 border border-success text-success';
    }
    if (lower.includes('eng') || lower.includes('lit') || lower.includes('lang')) {
      return isDark
        ? 'bg-warning bg-opacity-25 border border-warning text-light'
        : 'bg-warning bg-opacity-10 border border-warning text-dark';
    }
    if (lower.includes('comp') || lower.includes('tech') || lower.includes('stem')) {
      return isDark
        ? 'bg-info bg-opacity-25 border border-info text-light'
        : 'bg-info bg-opacity-10 border border-info text-dark';
    }
    if (
      lower.includes('hist') ||
      lower.includes('soc') ||
      lower.includes('civic') ||
      lower.includes('geo')
    ) {
      return isDark
        ? 'bg-secondary bg-opacity-25 border border-secondary text-light'
        : 'bg-secondary bg-opacity-10 border border-secondary text-dark';
    }
    if (lower.includes('hindi') || lower.includes('french') || lower.includes('span')) {
      return isDark
        ? 'bg-danger bg-opacity-25 border border-danger text-light'
        : 'bg-danger bg-opacity-10 border border-danger text-danger';
    }
    return isDark ? 'bg-dark border border-secondary text-light' : 'bg-light border text-dark';
  };

  // Cell Click -> Open Slot Modal for that Day and Period
  const handleCellClick = (day: DayOfWeek, periodSlot: TimetablePeriodSlot) => {
    if (!currentSection || periodSlot.isBreak) return;

    // Find existing draft entry for this day and period
    const existing = draftSectionEntries.find(
      (e) => e.dayOfWeek === day && e.periodId === periodSlot.id,
    );

    if (existing) {
      setActiveSlotTarget(existing);
    } else {
      // Initialize with default subject and auto-assigned teacher
      const firstClassSub = currentClassSubjects[0];
      const defaultSubId = firstClassSub?.subjectId || subjects[0]?.id || '';
      const defaultAssignedStaff =
        currentSectionAssignments.find((a) => a.subjectId === defaultSubId)?.staffId ||
        staffList[0]?.id ||
        '';

      setActiveSlotTarget({
        academicYearId: activeAcademicYear?.id,
        academicYearSectionId: currentSection.id,
        dayOfWeek: day,
        periodId: periodSlot.id,
        startTime: periodSlot.startTime,
        endTime: periodSlot.endTime,
        subjectId: defaultSubId,
        teacherId: defaultAssignedStaff,
        room: `Room ${currentSection.className?.replace('Grade ', '') || '10'}1`,
        periodType: 'REGULAR',
        notes: '',
      });
    }

    setIsSlotModalOpen(true);
  };

  // Save entry from Slot Modal into draftSectionEntries
  const handleSaveSlot = (savedSlot: Partial<TimetableEntry>) => {
    if (!currentSection || !activeSchool) return;

    const subjectObj = subjects.find((s) => s.id === savedSlot.subjectId);
    const teacherObj = staffList.find((stf) => stf.id === savedSlot.teacherId);

    const fullSlot: TimetableEntry = {
      id: savedSlot.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      schoolId: activeSchool.id,
      academicYearId: activeAcademicYear?.id || 'ay-default',
      academicYearSectionId: currentSection.id,
      dayOfWeek: savedSlot.dayOfWeek || 'MONDAY',
      periodId: savedSlot.periodId || 'p1',
      startTime: savedSlot.startTime || '08:30',
      endTime: savedSlot.endTime || '09:15',
      subjectId: savedSlot.subjectId || '',
      subjectName: subjectObj?.name || 'Subject',
      subjectCode: subjectObj?.code || 'SUB',
      teacherId: savedSlot.teacherId || '',
      teacherName: teacherObj ? `${teacherObj.firstName} ${teacherObj.lastName}` : 'Faculty',
      room: savedSlot.room || `Room 101`,
      periodType: savedSlot.periodType || 'REGULAR',
      notes: savedSlot.notes || '',
      className: currentClass?.name || currentSection.className,
      sectionName: currentSection.sectionName,
      updatedAt: new Date().toISOString(),
    };

    // Replace existing slot or push new
    const updated = draftSectionEntries.filter(
      (e) => !(e.dayOfWeek === fullSlot.dayOfWeek && e.periodId === fullSlot.periodId),
    );
    updated.push(fullSlot);

    setDraftSectionEntries(updated);
    setIsDirty(true);
    notify('warning', 'Period updated in draft. Click "Save Timetable" to commit changes.');
  };

  // Delete slot from draftSectionEntries
  const handleDeleteSlot = (entryId: string) => {
    const updated = draftSectionEntries.filter((e) => e.id !== entryId);
    setDraftSectionEntries(updated);
    setIsDirty(true);
    notify('warning', 'Period removed from draft. Click "Save Timetable" to commit changes.');
  };

  // Commit all draft changes to academicService
  const handleCommitSaveTimetable = () => {
    if (!activeSchool || !currentSection || !user) return;
    setIsProcessing(true);
    try {
      academicService.saveSectionTimetableBatch(
        activeSchool.id,
        currentSection.id,
        draftSectionEntries,
        { userId: user.id, userName: user.name || 'Admin' },
      );

      // Refresh global timetable entries
      const allEntries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(allEntries);
      setIsDirty(false);
      notify(
        'success',
        `Timetable for ${currentSection.className} - Section ${currentSection.sectionName} saved successfully.`,
      );
    } catch (err: any) {
      notify('error', err.message || 'Failed to save timetable.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Discard draft changes
  const handleDiscardChanges = () => {
    if (!selectedSectionId) return;
    const currentSectionSaved = timetableEntries.filter(
      (e) => e.academicYearSectionId === selectedSectionId,
    );
    setDraftSectionEntries(currentSectionSaved);
    setIsDirty(false);
    notify('warning', 'Unsaved draft changes discarded.');
  };

  // Auto-Fill Timetable for current section
  const handleAutoFill = () => {
    if (!activeSchool || !currentSection || !user) return;
    if (
      draftSectionEntries.length > 0 &&
      !window.confirm(
        'Auto-filling will replace all current scheduled periods for this section. Proceed?',
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const generated = academicService.autoGenerateTimetableForSection(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || 'ay-default',
        { userId: user.id, userName: user.name || 'Admin' },
      );

      setDraftSectionEntries(generated);
      setIsDirty(false);

      // Refresh global timetable entries
      const allEntries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(allEntries);

      notify(
        'success',
        `Auto-generated ${generated.length} conflict-free periods for ${currentSection.className}-${currentSection.sectionName}.`,
      );
    } catch (err: any) {
      notify('error', err.message || 'Auto-scheduling failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear Section Timetable
  const handleClearSection = () => {
    if (!activeSchool || !currentSection || !user) return;
    if (
      !window.confirm(
        `Are you sure you want to clear all timetable periods for ${currentSection.className} - Section ${currentSection.sectionName}?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      academicService.clearTimetableForSection(activeSchool.id, currentSection.id, {
        userId: user.id,
        userName: user.name || 'Admin',
      });
      setDraftSectionEntries([]);
      setIsDirty(false);

      const allEntries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(allEntries);

      notify(
        'success',
        `Cleared timetable for ${currentSection.className}-${currentSection.sectionName}.`,
      );
    } catch (err: any) {
      notify('error', err.message || 'Failed to clear timetable.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy timetable handlers
  const handleCopySectionToSection = (targetSectionId: string) => {
    if (!activeSchool || !currentSection || !user) return;
    setIsProcessing(true);
    try {
      academicService.copyTimetable(activeSchool.id, currentSection.id, targetSectionId, {
        userId: user.id,
        userName: user.name || 'Admin',
      });

      const allEntries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(allEntries);
      setIsCopyModalOpen(false);

      const targetSec = sections.find((s) => s.id === targetSectionId);
      notify(
        'success',
        `Successfully copied timetable to ${targetSec?.className}-${targetSec?.sectionName}.`,
      );
    } catch (err: any) {
      notify('error', err.message || 'Failed to duplicate timetable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyDayToDay = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    if (!activeSchool || !currentSection || !user) return;
    setIsProcessing(true);
    try {
      const updated = academicService.copyDaySchedule(
        activeSchool.id,
        currentSection.id,
        fromDay,
        toDay,
        { userId: user.id, userName: user.name || 'Admin' },
      );

      setDraftSectionEntries(updated);
      setIsDirty(false);

      const allEntries = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(allEntries);
      setIsCopyModalOpen(false);

      notify('success', `Successfully duplicated schedule from ${fromDay} to ${toDay}.`);
    } catch (err: any) {
      notify('error', err.message || 'Failed to duplicate day schedule.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Period slots update handler
  const handleSavePeriodSlots = (updatedSlots: TimetablePeriodSlot[]) => {
    try {
      academicService.savePeriodSlots(updatedSlots);
      setPeriodSlots(updatedSlots);
      notify('success', 'Daily period timing configuration updated.');
    } catch (err: any) {
      notify('error', 'Failed to update period slots.');
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Standardized Page Header */}
      <TopHeader
        title="Timetable Management"
        icon={CalendarDays}
        subtitle="Class + Section is the single source of truth. Teacher and session schedules are automatically derived."
        badges={[
          { bg: 'primary', label: activeAcademicYear?.name || 'Active Session' },
          { bg: 'secondary', label: activeSchool?.name || 'School' },
        ]}
        actions={[
          {
            name: 'Export',
            icon: Printer,
            action: () => window.print(),
            variant: 'outline-secondary',
          },
          {
            name: 'New Period',
            icon: Plus,
            action: () => setIsPeriodModalOpen(true),
            variant: 'primary',
          },
        ]}
        rightContent={
          <Nav variant="pills" className="gap-1 small">
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'GENERATOR' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveView('GENERATOR')}
                className="d-inline-flex align-items-center gap-1.5 fw-bold"
              >
                <Sparkles size={14} />
                <span>Auto Generator</span>
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'MANAGE' ? 'secondary' : 'outline-secondary'}
                onClick={() => setActiveView('MANAGE')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Manage</span>
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'CLASS' ? 'secondary' : 'outline-secondary'}
                onClick={() => setActiveView('CLASS')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <GraduationCap size={14} />
                <span>Class</span>
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'TEACHER' ? 'secondary' : 'outline-secondary'}
                onClick={() => setActiveView('TEACHER')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <UserCheck size={14} />
                <span>Teacher</span>
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'SESSION' ? 'secondary' : 'outline-secondary'}
                onClick={() => setActiveView('SESSION')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <Users size={14} />
                <span>Session</span>
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Button
                size="sm"
                variant={activeView === 'CONFLICTS' ? 'danger' : 'outline-danger'}
                onClick={() => setActiveView('CONFLICTS')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <AlertTriangle size={14} />
                <span>Clash</span>
                {allConflicts.length > 0 && (
                  <Badge bg="danger" pill className="ms-1">
                    {allConflicts.length}
                  </Badge>
                )}
              </Button>
            </Nav.Item>
          </Nav>
        }
      />

      {/* Notification Banner */}
      {feedback && (
        <Alert
          variant={
            feedback.type === 'success'
              ? 'success'
              : feedback.type === 'error'
                ? 'danger'
                : 'warning'
          }
          dismissible
          onClose={() => setFeedback(null)}
          className="py-2 px-3 mb-0 d-flex align-items-center gap-2 small"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : feedback.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{feedback.message}</span>
        </Alert>
      )}

      {/* Class & Section Navigation Bar (Shared across Manage and Class Noticeboard views) */}
      {(activeView === 'MANAGE' || activeView === 'CLASS') && (
        <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
          <Card.Body className="p-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex flex-wrap align-items-center gap-3">
              {/* Class Selector */}
              <div className="d-flex align-items-center gap-1.5">
                <span className="small text-muted fw-semibold">Class:</span>
                <Form.Select
                  size="sm"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Section Selector Buttons */}
              <div className="d-flex align-items-center gap-1.5">
                <span className="small text-muted fw-semibold">Section:</span>
                <ButtonGroup size="sm">
                  {classSections.map((sec) => (
                    <Button
                      key={sec.id}
                      variant={selectedSectionId === sec.id ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className="fw-semibold"
                    >
                      Section {sec.sectionName}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              {/* Saturday toggle */}
              <Form.Check
                type="checkbox"
                id="includeSaturdayCheck"
                checked={includeSaturday}
                onChange={(e) => setIncludeSaturday(e.target.checked)}
                label={<span className="small text-muted">Include Saturday</span>}
                className="ms-2 mb-0"
              />
            </div>

            {/* Section Quick Summary */}
            {currentSection && (
              <div className="d-flex align-items-center gap-3 small text-muted">
                <span className="d-inline-flex align-items-center gap-1">
                  <UserCheck size={14} className="text-primary" />
                  <span>
                    Class Teacher:{' '}
                    <strong>{currentSectionClassTeacher?.staffName || 'Unassigned'}</strong>
                  </span>
                </span>
                <span>•</span>
                <span>
                  Periods Scheduled: <strong>{draftSectionEntries.length}</strong>
                </span>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* VIEW 1: MANAGE TIMETABLE (Primary Editable Source of Truth) */}
      {activeView === 'MANAGE' && (
        <div className="d-flex flex-column gap-3">
          {/* Action Toolbar */}
          <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
            <Card.Body className="p-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Save Button */}
                <Button
                  variant={isDirty ? 'primary' : 'light'}
                  size="sm"
                  onClick={handleCommitSaveTimetable}
                  disabled={isProcessing || !isDirty}
                  className="d-inline-flex align-items-center gap-1.5 fw-semibold"
                >
                  <Save size={14} />
                  <span>Save Timetable</span>
                  {isDirty && (
                    <Badge
                      bg="warning"
                      text="dark"
                      pill
                      className="ms-1"
                      style={{ fontSize: '0.65rem' }}
                    >
                      Unsaved
                    </Badge>
                  )}
                </Button>

                {isDirty && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="d-inline-flex align-items-center gap-1"
                    title="Discard unsaved changes"
                  >
                    <RotateCcw size={14} />
                    <span>Discard</span>
                  </Button>
                )}

                <div className="vr d-none d-sm-block mx-1 my-1" />

                {/* Add Period Slot Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    if (currentSection) {
                      handleCellClick('MONDAY', periodSlots[0]);
                    }
                  }}
                  disabled={!currentSection}
                  className="d-inline-flex align-items-center gap-1"
                >
                  <Plus size={14} className="text-primary" />
                  <span>+ Add Period Slot</span>
                </Button>

                {/* Auto-Fill Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleAutoFill}
                  disabled={isProcessing || !currentSection}
                  className="d-inline-flex align-items-center gap-1"
                  title="Auto-fill timetable using subject-teacher assignments"
                >
                  <Sparkles size={14} className="text-warning" />
                  <span>Auto-Fill</span>
                </Button>

                {/* Copy Timetable Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setIsCopyModalOpen(true)}
                  disabled={!currentSection}
                  className="d-inline-flex align-items-center gap-1"
                >
                  <Copy size={14} />
                  <span>Copy Timetable</span>
                </Button>
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Period Configuration Button */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setIsPeriodModalOpen(true)}
                  className="d-inline-flex align-items-center gap-1"
                >
                  <Settings2 size={14} />
                  <span>Manage Periods</span>
                </Button>

                {/* Clear Timetable */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleClearSection}
                  disabled={isProcessing || draftSectionEntries.length === 0}
                  className="d-inline-flex align-items-center gap-1"
                  title="Clear all periods for this section"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </Button>

                {/* Print Timetable */}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => window.print()}
                  className="d-inline-flex align-items-center gap-1"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Primary Timetable Grid */}
          <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
            <Table
              responsive
              bordered
              hover
              size="sm"
              variant={isDark ? 'dark' : undefined}
              className="mb-0 align-middle"
            >
              <thead className="table-light text-center small text-uppercase">
                <tr>
                  <th style={{ width: '110px' }}>Period Slot</th>
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
                          {slot.name} ({slot.startTime} - {slot.endTime})
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id}>
                      {/* Period Column */}
                      <td className="text-center table-light align-middle">
                        <div className="fw-bold small">{slot.name}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {activeDays.map((d) => {
                        const entry = draftSectionEntries.find(
                          (e) => e.dayOfWeek === d.day && e.periodId === slot.id,
                        );

                        return (
                          <td
                            key={d.day}
                            className="p-1 align-top"
                            style={{ minWidth: '130px', height: '75px' }}
                          >
                            {entry ? (
                              <div
                                onClick={() => handleCellClick(d.day, slot)}
                                className={`p-2 rounded cursor-pointer h-100 d-flex flex-column justify-content-between position-relative ${getSubjectColorStyle(
                                  entry.subjectName,
                                )}`}
                                style={{ cursor: 'pointer', minHeight: '65px' }}
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
                                  className="d-flex align-items-center justify-content-between text-muted"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  <span>{entry.room || 'Room 101'}</span>
                                  <div className="d-flex align-items-center gap-1">
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 text-muted"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(d.day, slot);
                                      }}
                                      title="Edit slot"
                                    >
                                      <Edit2 size={11} />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 text-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSlot(entry.id);
                                      }}
                                      title="Remove slot"
                                    >
                                      <Trash2 size={11} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline-light"
                                className="w-100 h-100 border border-dashed text-muted d-flex align-items-center justify-content-center gap-1 small"
                                style={{ minHeight: '65px', fontSize: '0.75rem' }}
                                onClick={() => handleCellClick(d.day, slot)}
                              >
                                <Plus size={13} />
                                <span>Add</span>
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>

          {/* Section Curriculum & Assigned Faculty Legend Bar */}
          <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0 fw-bold small text-uppercase d-flex align-items-center gap-1.5">
                  <BookOpen size={15} className="text-primary" />
                  <span>
                    Section Subject → Teacher Mappings ({currentSectionAssignments.length})
                  </span>
                </h6>
                <span className="text-muted small">
                  All timetable slots automatically derive teachers from these assignments.
                </span>
              </div>

              <Row className="g-2">
                {currentSectionAssignments.map((asg) => {
                  const sub = subjects.find((s) => s.id === asg.subjectId);
                  const count = draftSectionEntries.filter(
                    (e) => e.subjectId === asg.subjectId,
                  ).length;

                  return (
                    <Col key={asg.id} sm={6} md={3}>
                      <Card className="border p-2 bg-light bg-opacity-50">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div className="fw-semibold small d-flex align-items-center gap-1">
                              <span>{sub?.name || asg.subjectName}</span>
                              {asg.isClassTeacher && (
                                <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>
                                  CT
                                </Badge>
                              )}
                            </div>
                            <div
                              className="text-muted d-flex align-items-center gap-1 mt-0.5"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <UserCheck size={12} className="text-primary" />
                              <span>{asg.staffName}</span>
                            </div>
                          </div>
                          <Badge bg="secondary" className="fw-normal">
                            {count} / wk
                          </Badge>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* VIEW 0: AUTOMATIC TIMETABLE GENERATOR WIZARD */}
      {activeView === 'GENERATOR' && (
        <TimetableWizard
          schoolId={activeSchool?.id || 'sch-001'}
          onPublished={() => {
            refreshData();
            setActiveView('MANAGE');
          }}
          onCancel={() => setActiveView('MANAGE')}
        />
      )}

      {/* VIEW 2: CLASS TIMETABLE (Notice-Board Printable Style) */}
      {activeView === 'CLASS' && currentSection && (
        <ClassNoticeboardTimetable
          currentSection={currentSection}
          currentClass={currentClass}
          classTeacher={currentSectionClassTeacher}
          timetableEntries={draftSectionEntries}
          periodSlots={periodSlots}
          activeDays={activeDays}
          schoolName={activeSchool?.name || 'School'}
          academicYearName={activeAcademicYear?.name || 'Academic Year'}
          getSubjectColorStyle={getSubjectColorStyle}
          isDark={isDark}
        />
      )}

      {/* VIEW 3: TEACHER TIMETABLE (Read-Only Faculty Weekly Schedule) */}
      {activeView === 'TEACHER' && (
        <TeacherScheduleView
          staffList={staffList}
          allTimetableEntries={timetableEntries}
          periodSlots={periodSlots}
          activeDays={activeDays}
          schoolName={activeSchool?.name || 'School'}
          academicYearName={activeAcademicYear?.name || 'Academic Year'}
          getSubjectColorStyle={getSubjectColorStyle}
          isDark={isDark}
        />
      )}

      {/* VIEW 4: SESSION TIMETABLE (School-wide Period-by-Period Active Roster & Proxy Finder) */}
      {activeView === 'SESSION' && (
        <SessionTimetableView
          allTimetableEntries={timetableEntries}
          periodSlots={periodSlots}
          staffList={staffList}
          sections={sections}
          schoolName={activeSchool?.name || 'School'}
          academicYearName={activeAcademicYear?.name || 'Academic Year'}
          getSubjectColorStyle={getSubjectColorStyle}
          isDark={isDark}
        />
      )}

      {/* VIEW 5: CLASH DIAGNOSTICS (Conflict Detector) */}
      {activeView === 'CONFLICTS' && (
        <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div>
                <h5
                  className="mb-0 fw-bold d-flex align-items-center gap-2"
                  style={{ fontSize: '1rem' }}
                >
                  <AlertTriangle size={18} className="text-danger" />
                  <span>School-Wide Conflict &amp; Collision Diagnostics</span>
                </h5>
                <p className="text-muted small mb-0 mt-0.5">
                  Automatic audits for faculty double-bookings and room collisions across all
                  sections.
                </p>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={refreshData}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Re-Scan Conflicts</span>
              </Button>
            </div>

            {allConflicts.length === 0 ? (
              <div className="py-5 text-center text-success">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-success" />
                <div className="fw-bold">No Timetable Clashes Detected</div>
                <p className="text-muted small mt-1 mb-0">
                  All teacher allocations and classroom venues are conflict-free across the entire
                  school.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {allConflicts.map((c, idx) => (
                  <Alert
                    key={idx}
                    variant="danger"
                    className="mb-0 py-2 px-3 d-flex align-items-start justify-content-between gap-3 small"
                  >
                    <div className="d-flex align-items-start gap-2">
                      <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="fw-bold">
                          {c.type === 'TEACHER_CLASH'
                            ? 'Faculty Teacher Double-Booking'
                            : 'Room Venue Collision'}
                        </div>
                        <div className="mt-0.5">{c.message}</div>
                        <div className="text-muted small mt-1 font-monospace">
                          Slot: {c.dayOfWeek} — Period {c.periodId}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setActiveView('MANAGE');
                        setFeedback({
                          type: 'warning',
                          message: `Navigate to the affected section in Manage mode to adjust the period slot.`,
                        });
                      }}
                      className="flex-shrink-0"
                    >
                      Resolve in Grid
                    </Button>
                  </Alert>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Modal 1: Add / Edit Timetable Period Slot */}
      {currentSection && activeSchool && (
        <TimetableSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => {
            setIsSlotModalOpen(false);
            setActiveSlotTarget(null);
          }}
          entry={activeSlotTarget}
          section={currentSection}
          schoolId={activeSchool.id}
          academicYearId={activeAcademicYear?.id || 'ay-default'}
          availableClassSubjects={currentClassSubjects}
          allSubjects={subjects}
          teacherAssignments={teacherAssignments}
          staffList={staffList}
          periodSlots={periodSlots}
          onSave={handleSaveSlot}
          onDelete={handleDeleteSlot}
          isDark={isDark}
        />
      )}

      {/* Modal 2: Manage Daily Periods */}
      <PeriodManagementModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        periodSlots={periodSlots}
        onSaveSlots={handleSavePeriodSlots}
        isDark={isDark}
      />

      {/* Modal 3: Copy Timetable */}
      <CopyTimetableModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        currentSection={currentSection}
        sections={sections}
        onCopySection={handleCopySectionToSection}
        onCopyDay={handleCopyDayToDay}
        isProcessing={isProcessing}
      />
    </div>
  );
};
