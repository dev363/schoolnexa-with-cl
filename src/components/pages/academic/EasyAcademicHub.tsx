import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  UserCheck,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  Star,
  X,
  Layers,
  BookOpen,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  User,
  GraduationCap,
  Building2,
  Check,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
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
} from '@/types';

interface EasyAcademicHubProps {
  onNavigateTab?: (tab: string) => void;
}

export const EasyAcademicHub: React.FC<EasyAcademicHubProps> = ({ onNavigateTab }) => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canManage =
    hasPermission('academics.sections.manage') ||
    hasPermission('school.settings.edit') ||
    hasPermission('academics.curriculum.edit');

  // Master Data
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [periodSlots, setPeriodSlots] = useState<TimetablePeriodSlot[]>(DEFAULT_PERIOD_SLOTS);

  // Active Selections
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'CLASS_TIMETABLE' | 'TEACHER_SCHEDULE'>(
    'CLASS_TIMETABLE',
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Quick Slot Edit Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<{
    day: DayOfWeek;
    period: TimetablePeriodSlot;
    existingEntry?: TimetableEntry;
  } | null>(null);
  const [slotSubjectId, setSlotSubjectId] = useState<string>('');
  const [slotTeacherId, setSlotTeacherId] = useState<string>('');
  const [slotRoom, setSlotRoom] = useState<string>('');
  const [slotClashWarning, setSlotClashWarning] = useState<string | null>(null);

  // Add Subject Modal
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [catalogSubjectToAdd, setCatalogSubjectToAdd] = useState<string>('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectType, setNewSubjectType] = useState<'THEORY' | 'PRACTICAL' | 'HYBRID'>('THEORY');
  const [newSubjectPeriods, setNewSubjectPeriods] = useState(5);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // User context for audit logging
  const userContext = useMemo(
    () => ({
      userId: user?.id || 'admin',
      userName: user?.fullName || 'Administrator',
    }),
    [user],
  );

  // Load all master data
  const loadData = async () => {
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

      const tt = academicService.getTimetableEntries(activeSchool.id, {
        academicYearId: activeAcademicYear?.id,
      });
      setTimetableEntries(tt);

      const slots = academicService.getPeriodSlots(activeSchool.id);
      setPeriodSlots(slots.length > 0 ? slots : DEFAULT_PERIOD_SLOTS);

      // Set sensible defaults if not set
      if (cls.length > 0 && !selectedClassId) {
        setSelectedClassId(cls[0].id);
        const firstClassSecs = secs.filter((s) => s.classId === cls[0].id);
        if (firstClassSecs.length > 0) {
          setSelectedSectionId(firstClassSecs[0].id);
        }
      }
      if (stf.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(stf[0].id);
      }
    } catch (err: any) {
      console.error('Error loading academic data:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load data.' });
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSchool, activeAcademicYear]);

  // When selected class changes, update selected section
  const availableSectionsForClass = useMemo(() => {
    return sections.filter((s) => s.classId === selectedClassId);
  }, [sections, selectedClassId]);

  useEffect(() => {
    if (availableSectionsForClass.length > 0) {
      const currentValid = availableSectionsForClass.some((s) => s.id === selectedSectionId);
      if (!currentValid) {
        setSelectedSectionId(availableSectionsForClass[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [selectedClassId, availableSectionsForClass]);

  const currentClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const currentSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId),
    [sections, selectedSectionId],
  );

  // Curriculum subjects for this class
  const currentClassSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return classSubjects.filter((cs) => cs.classId === selectedClassId);
  }, [classSubjects, selectedClassId]);

  // Section assignments (Subject -> Teacher)
  const currentSectionAssignments = useMemo(() => {
    if (!selectedSectionId) return [];
    return teacherAssignments.filter(
      (a) => a.academicYearSectionId === selectedSectionId && a.isActive,
    );
  }, [teacherAssignments, selectedSectionId]);

  // Class teacher for current section
  const currentClassTeacherAsg = useMemo(() => {
    return currentSectionAssignments.find((a) => a.isClassTeacher);
  }, [currentSectionAssignments]);

  const currentClassTeacherStaff = useMemo(() => {
    if (!currentClassTeacherAsg) return null;
    return staffList.find((s) => s.id === currentClassTeacherAsg.staffId);
  }, [currentClassTeacherAsg, staffList]);

  // Section timetable entries
  const currentSectionTimetable = useMemo(() => {
    if (!selectedSectionId) return [];
    return timetableEntries.filter((t) => t.academicYearSectionId === selectedSectionId);
  }, [timetableEntries, selectedSectionId]);

  // Quick lookup map: "DAY-PERIOD_ID" -> TimetableEntry
  const timetableMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    currentSectionTimetable.forEach((entry) => {
      map.set(`${entry.dayOfWeek}-${entry.periodId}`, entry);
    });
    return map;
  }, [currentSectionTimetable]);

  // Stats calculation
  const totalRegularSlots = useMemo(() => {
    const regularPeriods = periodSlots.filter((p) => !p.isBreak).length;
    return regularPeriods * 5; // Monday to Friday
  }, [periodSlots]);

  const scheduledSlotsCount = useMemo(() => {
    return currentSectionTimetable.filter(
      (e) => (e.periodType as string) !== 'BREAK' && (e.periodType as string) !== 'LUNCH',
    ).length;
  }, [currentSectionTimetable]);

  const assignedSubjectsCount = useMemo(() => {
    return currentClassSubjects.filter((cs) =>
      currentSectionAssignments.some((a) => a.subjectId === cs.subjectId && a.staffId),
    ).length;
  }, [currentClassSubjects, currentSectionAssignments]);

  // Unmapped catalog subjects for "+ Add Subject"
  const unmappedCatalogSubjects = useMemo(() => {
    const mappedIds = new Set(currentClassSubjects.map((cs) => cs.subjectId));
    return subjects.filter((s) => !mappedIds.has(s.id));
  }, [subjects, currentClassSubjects]);

  // Helper: Get assigned teacher for a subject
  const getAssignedTeacher = (subjectId: string) => {
    const asg = currentSectionAssignments.find((a) => a.subjectId === subjectId);
    if (!asg || !asg.staffId) return null;
    return staffList.find((s) => s.id === asg.staffId);
  };

  // =========================================================================
  // ACTIONS: INSTANT 1-CLICK OPERATIONS (Directly saves to DB)
  // =========================================================================

  // 1. Assign/Change Teacher for Subject in 1 click
  const handleAssignTeacher = (subjectId: string, staffId: string) => {
    if (!activeSchool || !selectedSectionId || !canManage) return;

    try {
      academicService.setSectionSubjectTeacher(
        activeSchool.id,
        selectedSectionId,
        subjectId,
        staffId ? staffId : null,
        false,
        userContext,
      );

      // Also update any existing timetable entries for this section & subject to the new teacher!
      if (staffId) {
        const matchingSlots = currentSectionTimetable.filter((e) => e.subjectId === subjectId);
        matchingSlots.forEach((slot) => {
          academicService.saveTimetableEntry(
            activeSchool.id,
            {
              ...slot,
              teacherId: staffId,
            },
            userContext,
          );
        });
      }

      loadData();
      const teacher = staffList.find((s) => s.id === staffId);
      const subject = subjects.find((s) => s.id === subjectId);
      setFeedback({
        type: 'success',
        message: teacher
          ? `Assigned ${teacher.firstName} ${teacher.lastName} to ${subject?.name || 'Subject'}.`
          : `Removed teacher assignment for ${subject?.name || 'Subject'}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update teacher.' });
    }
  };

  // 2. Toggle Class Teacher (Homeroom)
  const handleToggleClassTeacher = (subjectId: string) => {
    if (!activeSchool || !selectedSectionId || !canManage) return;
    const currentAsg = currentSectionAssignments.find((a) => a.subjectId === subjectId);
    if (!currentAsg || !currentAsg.staffId) {
      setFeedback({
        type: 'warning',
        message: 'Assign a teacher to this subject before setting as Class Incharge.',
      });
      return;
    }

    try {
      const willBeClassTeacher = !currentAsg.isClassTeacher;
      academicService.setSectionSubjectTeacher(
        activeSchool.id,
        selectedSectionId,
        subjectId,
        currentAsg.staffId,
        willBeClassTeacher,
        userContext,
      );
      loadData();
      const teacher = staffList.find((s) => s.id === currentAsg.staffId);
      setFeedback({
        type: 'success',
        message: willBeClassTeacher
          ? `🌟 Designated ${teacher?.firstName} ${teacher?.lastName} as Class Teacher for ${currentSection?.sectionName}.`
          : `Removed class teacher designation.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // 3. Update Weekly Periods for Subject
  const handleUpdateWeeklyPeriods = (classSubjectId: string, newPeriods: number) => {
    if (!activeSchool || !canManage) return;
    const clamped = Math.max(1, Math.min(25, newPeriods));
    try {
      academicService.updateClassSubject(
        activeSchool.id,
        classSubjectId,
        { weeklyPeriods: clamped },
        userContext,
      );
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // 4. Safe Remove Subject from Class
  const handleRemoveSubjectFromClass = (csId: string, subjectId: string) => {
    if (!activeSchool || !selectedSectionId || !canManage) return;
    const sub = subjects.find((s) => s.id === subjectId);
    if (
      !window.confirm(
        `Remove "${sub?.name}" from this class curriculum and clean its timetable slots?`,
      )
    ) {
      return;
    }

    try {
      // 1. Remove from class subjects
      academicService.removeClassSubject(activeSchool.id, csId, userContext);
      // 2. Clear assignment
      academicService.setSectionSubjectTeacher(
        activeSchool.id,
        selectedSectionId,
        subjectId,
        null,
        false,
        userContext,
      );
      // 3. Clear timetable slots for this subject
      const slots = currentSectionTimetable.filter((t) => t.subjectId === subjectId);
      slots.forEach((slot) => {
        academicService.deleteTimetableEntry(activeSchool.id, slot.id, userContext);
      });

      loadData();
      setFeedback({ type: 'success', message: `Removed "${sub?.name}" from curriculum.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // 5. One-Click Auto-Assign Faculty for Section
  const handleAutoAssignFaculty = () => {
    if (!activeSchool || !selectedSectionId || !activeAcademicYear || !canManage) return;
    setIsProcessing(true);
    try {
      const assignedCount = academicService.autoAssignFacultyForSection(
        activeSchool.id,
        selectedSectionId,
        activeAcademicYear.id,
        userContext,
      );
      loadData();
      setFeedback({
        type: 'success',
        message: `✨ Smart Match: Successfully matched and assigned ${assignedCount} specialist teachers to subjects!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Auto-assign failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. One-Click Complete Schedule Auto-Fill (Saves directly to DB)
  const handleAutoFillTimetable = () => {
    if (!activeSchool || !selectedSectionId || !activeAcademicYear || !canManage) return;
    if (currentClassSubjects.length === 0) {
      setFeedback({ type: 'warning', message: 'Please add subjects to this class first.' });
      return;
    }

    setIsProcessing(true);
    try {
      // Step A: Ensure all subjects have assigned teachers
      academicService.autoAssignFacultyForSection(
        activeSchool.id,
        selectedSectionId,
        activeAcademicYear.id,
        userContext,
      );

      // Step B: Auto-generate balanced timetable
      const generated = academicService.autoGenerateTimetableForSection(
        activeSchool.id,
        selectedSectionId,
        activeAcademicYear.id,
        userContext,
      );

      loadData();
      setFeedback({
        type: 'success',
        message: `🎉 Schedule Generated! Fully scheduled ${generated.length} periods for ${currentClass?.name} - Section ${currentSection?.sectionName} with zero clashes.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Auto-schedule failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Clear Section Schedule
  const handleClearSectionSchedule = () => {
    if (!activeSchool || !selectedSectionId || !canManage) return;
    if (
      !window.confirm(
        `Clear all ${currentSectionTimetable.length} scheduled periods for Section ${currentSection?.sectionName}?`,
      )
    ) {
      return;
    }

    try {
      academicService.clearSectionSchedule(activeSchool.id, selectedSectionId, userContext);
      loadData();
      setFeedback({ type: 'success', message: 'Cleared timetable schedule for this section.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // 8. Open Quick Slot Modal
  const handleOpenSlotModal = (
    day: DayOfWeek,
    period: TimetablePeriodSlot,
    existing?: TimetableEntry,
  ) => {
    setTargetSlot({ day, period, existingEntry: existing });
    if (existing) {
      setSlotSubjectId(existing.subjectId);
      setSlotTeacherId(existing.teacherId);
      setSlotRoom(existing.room || `Room ${currentClass?.name?.replace('Grade ', '') || '10'}1`);
    } else {
      // Pick first subject by default
      const defaultSub = currentClassSubjects[0]?.subjectId || '';
      setSlotSubjectId(defaultSub);
      const asg = currentSectionAssignments.find((a) => a.subjectId === defaultSub);
      setSlotTeacherId(asg?.staffId || staffList[0]?.id || '');
      setSlotRoom(`Room ${currentClass?.name?.replace('Grade ', '') || '10'}1`);
    }
    setSlotClashWarning(null);
    setIsSlotModalOpen(true);
  };

  // Check clash when editing slot
  useEffect(() => {
    if (!isSlotModalOpen || !targetSlot || !activeSchool || !activeAcademicYear || !slotTeacherId) {
      setSlotClashWarning(null);
      return;
    }

    const conflicts = academicService.checkTimetableConflicts(activeSchool.id, {
      id: targetSlot.existingEntry?.id,
      academicYearId: activeAcademicYear.id,
      academicYearSectionId: selectedSectionId,
      dayOfWeek: targetSlot.day,
      periodId: targetSlot.period.id,
      teacherId: slotTeacherId,
      room: slotRoom,
    });

    const teacherClash = conflicts.find((c) => c.type === 'TEACHER_CLASH');
    if (teacherClash) {
      setSlotClashWarning(teacherClash.message);
    } else {
      setSlotClashWarning(null);
    }
  }, [isSlotModalOpen, targetSlot, slotTeacherId, slotRoom]);

  // Save Single Slot
  const handleSaveSlot = () => {
    if (
      !activeSchool ||
      !activeAcademicYear ||
      !selectedSectionId ||
      !targetSlot ||
      !slotSubjectId ||
      !canManage
    ) {
      return;
    }

    const sub = subjects.find((s) => s.id === slotSubjectId);
    try {
      academicService.saveTimetableEntry(
        activeSchool.id,
        {
          id: targetSlot.existingEntry?.id,
          academicYearId: activeAcademicYear.id,
          academicYearSectionId: selectedSectionId,
          dayOfWeek: targetSlot.day,
          periodId: targetSlot.period.id,
          startTime: targetSlot.period.startTime,
          endTime: targetSlot.period.endTime,
          subjectId: slotSubjectId,
          teacherId: slotTeacherId,
          room: slotRoom,
          periodType: sub?.subjectType === 'PRACTICAL' ? 'PRACTICAL_LAB' : 'REGULAR',
        },
        userContext,
      );

      setIsSlotModalOpen(false);
      loadData();
      setFeedback({
        type: 'success',
        message: `Saved slot: ${targetSlot.day} Period ${targetSlot.period.periodNumber}.`,
      });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete Single Slot
  const handleDeleteSlot = (entryId: string) => {
    if (!activeSchool || !canManage) return;
    try {
      academicService.deleteTimetableEntry(activeSchool.id, entryId, userContext);
      loadData();
      if (isSlotModalOpen) setIsSlotModalOpen(false);
      setFeedback({ type: 'success', message: 'Cleared period slot.' });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Add Catalog Subject to Class
  const handleAddCatalogSubject = async () => {
    if (!activeSchool || !selectedClassId || !catalogSubjectToAdd || !canManage) return;
    const sub = subjects.find((s) => s.id === catalogSubjectToAdd);
    if (!sub) return;

    try {
      await academicService.assignClassSubject(
        activeSchool.id,
        {
          classId: selectedClassId,
          subjectId: sub.id,
          isMandatory: !sub.isElective,
          weeklyPeriods: sub.subjectType === 'PRACTICAL' ? 4 : 5,
        },
        userContext,
      );

      await loadData();
      setCatalogSubjectToAdd('');
      setIsAddSubjectModalOpen(false);
      setFeedback({ type: 'success', message: `Added "${sub.name}" to curriculum.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setSubjectError(err.message);
    }
  };

  // Register New Subject and Add to Class
  const handleCreateNewSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !selectedClassId || !canManage) return;
    if (!newSubjectName.trim()) {
      setSubjectError('Subject name is required.');
      return;
    }
    if (!newSubjectCode.trim()) {
      setSubjectError('Course code is required (e.g., ROB-101).');
      return;
    }

    try {
      // 1. Create in catalog
      const created = await academicService.createSubject(
        activeSchool.id,
        {
          name: newSubjectName.trim(),
          code: newSubjectCode.trim().toUpperCase(),
          subjectType: newSubjectType,
          credits: 1,
          isElective: false,
        },
        userContext,
      );

      // 2. Assign to class
      await academicService.assignClassSubject(
        activeSchool.id,
        {
          classId: selectedClassId,
          subjectId: created.id,
          isMandatory: true,
          weeklyPeriods: Number(newSubjectPeriods) || 5,
        },
        userContext,
      );

      await loadData();
      setIsAddSubjectModalOpen(false);
      setNewSubjectName('');
      setNewSubjectCode('');
      setSubjectError(null);
      setFeedback({ type: 'success', message: `Created "${created.name}" and added to class!` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setSubjectError(err.message);
    }
  };

  // Teacher Schedule Mode data
  const selectedTeacher = useMemo(() => {
    return staffList.find((s) => s.id === selectedTeacherId);
  }, [staffList, selectedTeacherId]);

  const teacherScheduleEntries = useMemo(() => {
    if (!selectedTeacherId) return [];
    return timetableEntries.filter((t) => t.teacherId === selectedTeacherId);
  }, [timetableEntries, selectedTeacherId]);

  // Active days (Mon-Fri)
  const activeDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const regularPeriods = periodSlots.filter((p) => !p.isBreak);

  // Subject palette colors for clear visual distinction
  const getSubjectColor = (subjectName: string = '') => {
    const s = subjectName.toLowerCase();
    if (s.includes('math'))
      return {
        bg: 'bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary',
        dot: 'bg-primary',
      };
    if (s.includes('sci') || s.includes('phys') || s.includes('chem') || s.includes('bio'))
      return {
        bg: 'bg-success bg-opacity-10 border border-success border-opacity-25 text-success',
        dot: 'bg-success',
      };
    if (s.includes('eng') || s.includes('lit') || s.includes('lang'))
      return {
        bg: 'bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning',
        dot: 'bg-warning',
      };
    if (s.includes('hist') || s.includes('soc') || s.includes('civ'))
      return {
        bg: 'bg-info bg-opacity-10 border border-info border-opacity-25 text-info',
        dot: 'bg-info',
      };
    if (s.includes('comp') || s.includes('robot') || s.includes('it'))
      return {
        bg: 'bg-info bg-opacity-10 border border-info border-opacity-25 text-info',
        dot: 'bg-info',
      };
    if (s.includes('art') || s.includes('music'))
      return {
        bg: 'bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger',
        dot: 'bg-danger',
      };
    return {
      bg: 'bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-body',
      dot: 'bg-secondary',
    };
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between shadow-sm animate-in fade-in duration-200 text-xs ${
            feedback.type === 'success'
              ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
              : feedback.type === 'warning'
                ? 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning'
                : 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            )}
            {feedback.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            )}
            {feedback.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 rounded text-current"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER & QUICK SELECTOR BAR                                               */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl border shadow-xs space-y-3 bg-body">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Class & Section Chooser */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Class:
              </span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 px-3 text-xs font-bold rounded-lg border shadow-2xs bg-body text-body"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-1 bg-body-tertiary p-1 rounded-lg border">
              <span className="text-[11px] font-semibold text-muted px-1.5">Section:</span>
              {availableSectionsForClass.map((sec) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`h-7 px-3 text-xs font-bold rounded-md transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-body-secondary hover:bg-body'
                    }`}
                  >
                    Sec {sec.sectionName}
                  </button>
                );
              })}
            </div>

            {/* Quick Status Badges */}
            <div className="hidden xl:flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  scheduledSlotsCount >= totalRegularSlots
                    ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
                    : 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {scheduledSlotsCount} / {totalRegularSlots} Periods Scheduled
                </span>
              </span>

              {currentClassTeacherStaff && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span>
                    Class Teacher: {currentClassTeacherStaff.firstName}{' '}
                    {currentClassTeacherStaff.lastName}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switch */}
            <div className="flex items-center bg-body-tertiary p-1 rounded-lg border">
              <button
                type="button"
                onClick={() => setActiveMode('CLASS_TIMETABLE')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  activeMode === 'CLASS_TIMETABLE'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-body-secondary hover:text-body'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Class Timetable</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('TEACHER_SCHEDULE')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                  activeMode === 'TEACHER_SCHEDULE'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-body-secondary hover:text-body'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>By Teacher</span>
              </button>
            </div>

            {/* 1-Click Auto Fill Timetable */}
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('generator')}
                  className="h-9 px-3.5 text-xs font-bold rounded-lg bg-primary hover:opacity-90 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Open the Full School Constraint-Based Timetable Generator"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Timetable Generator</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAutoFillTimetable}
                  className="h-9 px-3.5 text-xs font-bold rounded-lg bg-success hover:opacity-90 text-white flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  title="Automatically assigns specialist teachers and generates clash-free weekly timetable in 1 click"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Generating...' : '⚡ 1-Click Auto Fill'}</span>
                </button>
              </>
            )}

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="h-9 px-3 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors bg-body text-body hover:bg-body-tertiary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Clear Schedule */}
            {canManage && currentSectionTimetable.length > 0 && (
              <button
                type="button"
                onClick={handleClearSectionSchedule}
                className="h-9 px-2.5 text-xs font-medium rounded-lg text-danger hover:bg-danger hover:bg-opacity-10 transition-colors"
                title="Clear all slots for this section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: UNIFIED CLASS TIMETABLE & TEACHER ASSIGNMENT                      */}
      {/* ========================================================================= */}
      {activeMode === 'CLASS_TIMETABLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT SIDEBAR: SUBJECT TEACHERS (3 or 4 cols)                          */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-3">
            <div className="p-4 rounded-xl border shadow-xs space-y-3.5 bg-body">
              <div className="flex items-center justify-between pb-2 border-b border-secondary-subtle">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-body flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Subject Teachers</span>
                  </h3>
                  <p className="text-[11px] text-secondary">
                    {assignedSubjectsCount} of {currentClassSubjects.length} subjects assigned
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={handleAutoAssignFaculty}
                        className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary hover:bg-opacity-10 rounded flex items-center gap-1"
                        title="Auto-match best teachers by department"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Assign</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAddSubjectModalOpen(true)}
                        className="h-7 w-7 rounded-md bg-primary hover:opacity-90 text-white flex items-center justify-center shadow-2xs"
                        title="Add Course to Class"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Subject List */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {currentClassSubjects.length === 0 ? (
                  <div className="p-6 text-center rounded-lg border border-dashed border-secondary-subtle text-secondary space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto text-secondary" />
                    <p className="text-xs">No subjects added to this class yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddSubjectModalOpen(true)}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Subjects
                    </button>
                  </div>
                ) : (
                  currentClassSubjects.map((cs) => {
                    const assignedTeacher = getAssignedTeacher(cs.subjectId);
                    const asg = currentSectionAssignments.find((a) => a.subjectId === cs.subjectId);
                    const isClassTeacher = asg?.isClassTeacher;
                    const palette = getSubjectColor(cs.subjectName);

                    // Eligible teachers for this subject
                    const eligible = academicService.getEligibleTeachers(
                      cs.subjectId,
                      selectedClassId,
                      activeSchool?.id,
                    );

                    return (
                      <div
                        key={cs.id}
                        className="p-3 rounded-lg border border-secondary-subtle bg-body-tertiary transition-all"
                      >
                        {/* Subject Title & Stepper */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${palette.dot}`} />
                            <span className="text-xs font-bold text-body truncate">
                              {cs.subjectName}
                            </span>
                            <span className="text-[10px] font-mono text-secondary flex-shrink-0">
                              [{cs.subjectCode}]
                            </span>
                          </div>

                          {/* Periods & Remove */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className="flex items-center border border-secondary-subtle rounded text-[10px] overflow-hidden">
                              <button
                                type="button"
                                disabled={!canManage || cs.weeklyPeriods <= 1}
                                onClick={() =>
                                  handleUpdateWeeklyPeriods(cs.id, cs.weeklyPeriods - 1)
                                }
                                className="px-1.5 py-0.5 hover:bg-body-secondary disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="px-1.5 font-bold font-mono text-body">
                                {cs.weeklyPeriods}p
                              </span>
                              <button
                                type="button"
                                disabled={!canManage || cs.weeklyPeriods >= 20}
                                onClick={() =>
                                  handleUpdateWeeklyPeriods(cs.id, cs.weeklyPeriods + 1)
                                }
                                className="px-1.5 py-0.5 hover:bg-body-secondary disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSubjectFromClass(cs.id, cs.subjectId)}
                                className="p-1 text-secondary hover:text-danger rounded transition-colors"
                                title="Remove subject from class"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Direct Teacher Dropdown */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <select
                              value={asg?.staffId || ''}
                              disabled={!canManage}
                              onChange={(e) => handleAssignTeacher(cs.subjectId, e.target.value)}
                              className="h-8 px-2 text-xs rounded-md border w-full font-medium transition-colors bg-body text-body"
                            >
                              <option value="">-- Choose Teacher --</option>
                              {eligible.matching.length > 0 && (
                                <optgroup label="★ Subject Specialists">
                                  {eligible.matching.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.firstName} {s.lastName} ({s.departmentName || 'Faculty'})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {eligible.other.length > 0 && (
                                <optgroup label="Other Available Faculty">
                                  {eligible.other.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.firstName} {s.lastName} ({s.departmentName || 'Staff'})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>

                          {/* Class Teacher (Homeroom) Star */}
                          <button
                            type="button"
                            disabled={!canManage || !assignedTeacher}
                            onClick={() => handleToggleClassTeacher(cs.subjectId)}
                            className={`h-8 px-2 rounded-md border flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                              isClassTeacher
                                ? 'bg-warning text-white border-warning shadow-2xs'
                                : 'text-secondary hover:text-warning border-secondary-subtle'
                            }`}
                            title={
                              isClassTeacher
                                ? 'Primary Class Incharge'
                                : 'Designate as Class Incharge'
                            }
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${isClassTeacher ? 'fill-current' : ''}`}
                            />
                            <span className="hidden sm:inline">
                              {isClassTeacher ? 'Incharge' : ''}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT: WEEKLY TIMETABLE GRID (8 cols)                                 */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-3">
            <div className="p-4 rounded-xl border shadow-xs space-y-3 overflow-hidden bg-body">
              {/* Header inside timetable */}
              <div className="flex items-center justify-between pb-2 border-b border-secondary-subtle">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-body">
                    {currentClass?.name} - Section {currentSection?.sectionName} Schedule
                  </span>
                  <span className="text-[10px] text-secondary">
                    (Click any cell to assign or edit period)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-secondary">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-primary bg-opacity-20 border border-primary border-opacity-50" />{' '}
                    Theory
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-success bg-opacity-20 border border-success border-opacity-50" />{' '}
                    Practical Lab
                  </span>
                </div>
              </div>

              {/* Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-secondary-subtle text-[11px] font-bold text-secondary uppercase">
                      <th className="py-2.5 px-3 w-28 bg-body-secondary">Day</th>
                      {periodSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className={`py-2 px-2 text-center ${
                            slot.isBreak
                              ? 'w-14 bg-warning bg-opacity-10 text-warning'
                              : 'bg-body-secondary'
                          }`}
                        >
                          <div className="font-bold text-[11px] text-body">{slot.name}</div>
                          <div className="text-[9px] font-mono text-secondary font-normal">
                            {slot.startTime}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-subtle">
                    {activeDays.map((day) => (
                      <tr key={day} className="hover:bg-body-secondary transition-colors">
                        {/* Day Label */}
                        <td className="py-3 px-3 text-xs font-bold text-body bg-body-tertiary">
                          {day.substring(0, 3)}
                        </td>

                        {/* Period Slots */}
                        {periodSlots.map((slot) => {
                          if (slot.isBreak) {
                            return (
                              <td
                                key={slot.id}
                                className="py-2 px-1 text-center bg-warning bg-opacity-10 border-start border-end border-secondary-subtle"
                              >
                                <span className="text-[9px] font-bold uppercase tracking-wider text-warning [writing-mode:vertical-lr] rotate-180 py-1">
                                  {slot.periodType === 'LUNCH' ? 'Lunch' : 'Break'}
                                </span>
                              </td>
                            );
                          }

                          const entry = timetableMap.get(`${day}-${slot.id}`);
                          const palette = entry ? getSubjectColor(entry.subjectName) : null;

                          return (
                            <td key={slot.id} className="p-1 align-top">
                              {entry ? (
                                <div
                                  onClick={() => handleOpenSlotModal(day, slot, entry)}
                                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:shadow-xs group relative ${
                                    palette?.bg ||
                                    'bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary'
                                  }`}
                                >
                                  <div className="text-xs font-bold truncate leading-tight">
                                    {entry.subjectName}
                                  </div>
                                  <div className="text-[10px] font-medium opacity-85 truncate mt-0.5 flex items-center gap-1">
                                    <User className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span>{entry.teacherName || 'Faculty'}</span>
                                  </div>

                                  {/* Quick Delete on Hover */}
                                  {canManage && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSlot(entry.id);
                                      }}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-body text-danger hover:bg-danger-subtle transition-opacity"
                                      title="Clear slot"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canManage}
                                  onClick={() => handleOpenSlotModal(day, slot)}
                                  className="w-full h-14 rounded-lg border border-dashed border-secondary-subtle hover:border-primary hover:bg-primary hover:bg-opacity-10 transition-all flex flex-col items-center justify-center text-secondary hover:text-primary group"
                                >
                                  <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                  <span className="text-[9px] font-semibold">Assign</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TEACHER SCHEDULE VIEW (By Teacher)                                */}
      {/* ========================================================================= */}
      {activeMode === 'TEACHER_SCHEDULE' && (
        <div className="p-5 rounded-xl border shadow-xs space-y-4 bg-body">
          {/* Teacher Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center font-bold">
                {selectedTeacher
                  ? `${selectedTeacher.firstName[0]}${selectedTeacher.lastName[0]}`
                  : 'T'}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                  Select Faculty Teacher
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="h-9 px-3 text-sm font-bold rounded-lg border bg-body text-body"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({stf.departmentName || 'Faculty'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTeacher && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-secondary">
                  Total Weekly Load:{' '}
                  <strong className="font-mono text-primary">
                    {teacherScheduleEntries.length} periods
                  </strong>
                </span>
                <span className="text-secondary">•</span>
                <span className="text-secondary">
                  Dept: <strong>{selectedTeacher.departmentName || 'General'}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Teacher Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-secondary-subtle text-[11px] font-bold text-secondary uppercase">
                  <th className="py-2.5 px-3 w-28 bg-body-secondary">Day</th>
                  {periodSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`py-2 px-2 text-center ${
                        slot.isBreak
                          ? 'w-14 bg-warning bg-opacity-10 text-warning'
                          : 'bg-body-secondary'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-body">{slot.name}</div>
                      <div className="text-[9px] font-mono text-secondary font-normal">
                        {slot.startTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-subtle">
                {activeDays.map((day) => (
                  <tr key={day} className="hover:bg-body-secondary">
                    <td className="py-3 px-3 text-xs font-bold text-body bg-body-tertiary">
                      {day.substring(0, 3)}
                    </td>

                    {periodSlots.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="py-2 px-1 text-center bg-warning bg-opacity-10"
                          >
                            <span className="text-[9px] font-bold text-warning [writing-mode:vertical-lr] rotate-180">
                              {slot.periodType === 'LUNCH' ? 'Lunch' : 'Break'}
                            </span>
                          </td>
                        );
                      }

                      const entry = teacherScheduleEntries.find(
                        (e) => e.dayOfWeek === day && e.periodId === slot.id,
                      );
                      const palette = entry ? getSubjectColor(entry.subjectName) : null;

                      return (
                        <td key={slot.id} className="p-1 align-top">
                          {entry ? (
                            <div
                              className={`p-2 rounded-lg border text-left shadow-2xs ${
                                palette?.bg ||
                                'bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary'
                              }`}
                            >
                              <div className="text-xs font-bold truncate">{entry.subjectName}</div>
                              <div className="text-[10px] font-bold text-primary mt-0.5">
                                {entry.className} - {entry.sectionName}
                              </div>
                              <div className="text-[9px] text-secondary font-mono mt-0.5">
                                {entry.room || 'Room TBD'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-14 rounded-lg border border-dashed border-secondary-subtle flex items-center justify-center text-[10px] text-secondary">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK SLOT EDIT / ASSIGN                                           */}
      {/* ========================================================================= */}
      {isSlotModalOpen && targetSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 bg-body text-body">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {targetSlot.day} — {targetSlot.period.name}
                  </h4>
                  <p className="text-[11px] text-muted">
                    {targetSlot.period.startTime} - {targetSlot.period.endTime} •{' '}
                    {currentClass?.name} - {currentSection?.sectionName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded text-muted hover:text-body"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clash Alert if any */}
            {slotClashWarning && (
              <div className="p-3 rounded-lg border border-warning bg-warning-subtle text-xs text-warning-emphasis flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Faculty Conflict Warning:</strong>
                  <p className="text-[11px] mt-0.5">{slotClashWarning}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Select Subject */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Subject Course *
                </label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => {
                    const newSubId = e.target.value;
                    setSlotSubjectId(newSubId);
                    // Auto-select assigned teacher for this subject
                    const asg = currentSectionAssignments.find((a) => a.subjectId === newSubId);
                    if (asg?.staffId) setSlotTeacherId(asg.staffId);
                  }}
                  className="h-9 px-3 text-xs font-medium rounded-lg border w-full bg-body text-body"
                >
                  <option value="">-- Choose Subject --</option>
                  {currentClassSubjects.map((cs) => (
                    <option key={cs.id} value={cs.subjectId}>
                      {cs.subjectName} ({cs.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Teacher */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Assigned Teacher *
                </label>
                <select
                  value={slotTeacherId}
                  onChange={(e) => setSlotTeacherId(e.target.value)}
                  className="h-9 px-3 text-xs font-medium rounded-lg border w-full bg-body text-body"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.firstName} {stf.lastName} ({stf.departmentName || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Name */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Classroom / Lab Location
                </label>
                <input
                  type="text"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  placeholder="e.g. Room 101, Science Lab 2"
                  className="h-9 px-3 text-xs rounded-lg border w-full bg-body text-body"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-secondary-subtle flex items-center justify-between">
              {targetSlot.existingEntry ? (
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(targetSlot.existingEntry!.id)}
                  className="text-xs font-medium text-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Slot</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="h-8 px-3 text-xs font-medium rounded-lg border border-secondary-subtle hover:bg-body-secondary text-body"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!slotSubjectId || !slotTeacherId}
                  onClick={handleSaveSlot}
                  className="h-8 px-4 text-xs font-bold rounded-lg bg-primary hover:opacity-90 disabled:opacity-40 text-white shadow-xs"
                >
                  Save Period
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SUBJECT TO CLASS                                               */}
      {/* ========================================================================= */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4 bg-body text-body">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add Subject to {currentClass?.name}</h3>
                  <p className="text-xs text-muted">
                    Include an existing course from catalog or register a new one
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setSubjectError(null);
                }}
                className="p-1 rounded text-muted hover:text-body"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subjectError && (
              <div className="p-3 rounded-lg border border-danger bg-danger-subtle text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{subjectError}</span>
              </div>
            )}

            {/* Option A: Catalog Subject */}
            <div className="p-3.5 rounded-xl border bg-body-tertiary space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Choose from School Catalog
              </span>
              {unmappedCatalogSubjects.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={catalogSubjectToAdd}
                    onChange={(e) => setCatalogSubjectToAdd(e.target.value)}
                    className="h-9 px-3 text-xs rounded-lg border flex-1 font-medium bg-body text-body"
                  >
                    <option value="">-- Choose Course --</option>
                    {unmappedCatalogSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        [{sub.code}] {sub.name} ({sub.subjectType})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!catalogSubjectToAdd}
                    onClick={handleAddCatalogSubject}
                    className="h-9 px-3 text-xs font-bold rounded-lg bg-success hover:opacity-90 disabled:opacity-40 text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted italic">
                  All catalog subjects are already in this class curriculum.
                </p>
              )}
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-muted">
                OR Create Brand New Course
              </span>
              <div className="flex-grow border-t"></div>
            </div>

            {/* Option B: Create New Subject Form */}
            <form onSubmit={handleCreateNewSubject} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. World History"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="h-9 px-3 text-xs rounded-lg border w-full bg-body text-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HIS-101"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value.toUpperCase())}
                    className="h-9 px-3 text-xs font-mono uppercase rounded-lg border w-full bg-body text-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Course Type
                  </label>
                  <select
                    value={newSubjectType}
                    onChange={(e) => setNewSubjectType(e.target.value as any)}
                    className="h-9 px-3 text-xs rounded-lg border w-full bg-body text-body"
                  >
                    <option value="THEORY">Theory (Classroom)</option>
                    <option value="PRACTICAL">Practical (Lab)</option>
                    <option value="HYBRID">Hybrid (Both)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Weekly Periods
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newSubjectPeriods}
                    onChange={(e) => setNewSubjectPeriods(parseInt(e.target.value) || 5)}
                    className="h-9 px-3 text-xs font-mono rounded-lg border w-full bg-body text-body"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="h-8 px-3 text-xs font-medium rounded-lg border text-muted hover:bg-body-tertiary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 text-xs font-bold rounded-lg bg-primary hover:bg-primary-dark text-white shadow-xs"
                >
                  Register &amp; Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
