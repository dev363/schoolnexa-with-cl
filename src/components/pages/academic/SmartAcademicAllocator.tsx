import React, { useState, useEffect, useMemo } from 'react';
import {
  Wand2,
  CalendarDays,
  UserCheck,
  BookOpenCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Star,
  Clock,
  ArrowRight,
  Check,
  X,
  Minus,
  GraduationCap,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Layers,
  BookOpen,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { academicService, DEFAULT_PERIOD_SLOTS, TIMETABLE_DAYS } from '@/services/academicService';
import {
  AcademicYearSectionItem,
  ClassItem,
  ClassSubjectItem,
  SubjectItem,
  StaffMember,
  TeacherAssignmentItem,
  TimetableEntry,
  TimetablePeriodSlot,
  DayOfWeek,
} from '@/types';

interface SmartAcademicAllocatorProps {
  onNavigateTab?: (tab: string) => void;
}

export interface DetailedConflict {
  id: string;
  slotId?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  day?: DayOfWeek;
  periodId?: string;
  type: 'TEACHER_CLASH' | 'SECTION_OVERLAP' | 'UNASSIGNED_SUBJECT';
  message: string;
}

export const SmartAcademicAllocator: React.FC<SmartAcademicAllocatorProps> = ({
  onNavigateTab,
}) => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const userContext = useMemo(
    () => ({
      userId: user?.id || 'system-admin',
      userName: user?.fullName || 'System Administrator',
    }),
    [user],
  );

  // Authorization check
  const canManage = useMemo(() => {
    return (
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'SCHOOL_ADMIN' ||
      user?.role === 'PRINCIPAL' ||
      hasPermission('academics.sections.manage') ||
      hasPermission('academics.curriculum.edit')
    );
  }, [user, hasPermission]);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [periodSlots, setPeriodSlots] = useState<TimetablePeriodSlot[]>(DEFAULT_PERIOD_SLOTS);

  // Selected Target Class & Section
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // DRAFT / PREVIEW ARCHITECTURE
  // 1. Draft Teacher Assignments: Map<subjectId, { staffId: string; isClassTeacher: boolean }>
  const [draftAssignments, setDraftAssignments] = useState<
    Map<string, { staffId: string; isClassTeacher: boolean }>
  >(new Map());
  // 2. Draft Class Subjects (allows adding core subjects in draft before persisting)
  const [draftClassSubjects, setDraftClassSubjects] = useState<ClassSubjectItem[]>([]);
  // 3. Draft Timetable Entries for current section
  const [draftTimetable, setDraftTimetable] = useState<TimetableEntry[]>([]);
  // 4. Dirty tracking: true when user modified draft without saving to database
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICTS'>(
    'ALL',
  );
  const [highlightedSubjectId, setHighlightedSubjectId] = useState<string | null>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);
  const [isConflictPanelExpanded, setIsConflictPanelExpanded] = useState<boolean>(true);
  const [showTimetableGrid, setShowTimetableGrid] = useState<boolean>(true);

  // Inline Quick Add Subject State
  const [isInlineAddOpen, setIsInlineAddOpen] = useState(false);
  const [selectedCatalogSubjectId, setSelectedCatalogSubjectId] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customSubjectCode, setCustomSubjectCode] = useState('');
  const [customSubjectPeriods, setCustomSubjectPeriods] = useState(5);
  const [customSubjectType, setCustomSubjectType] = useState<
    'THEORY' | 'PRACTICAL' | 'HYBRID' | 'ACTIVITY'
  >('THEORY');

  // Inline Slot Assignment Quick Popover
  const [activeSlotEdit, setActiveSlotEdit] = useState<{
    day: DayOfWeek;
    periodId: string;
    periodName: string;
    time: string;
  } | null>(null);

  // Clone from Section State
  const [isCloneSectionOpen, setIsCloneSectionOpen] = useState(false);
  const [cloneSourceSectionId, setCloneSourceSectionId] = useState('');

  // Notifications & Load state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // =========================================================================
  // DATA LOADING
  // =========================================================================
  const loadData = async () => {
    if (!activeSchool) return;
    try {
      const [cls, sec, subs, cs, asg, tt] = await Promise.all([
        academicService.getClasses(activeSchool.id),
        academicService.getSections(activeSchool.id),
        academicService.getSubjects(activeSchool.id),
        academicService.getClassSubjects(activeSchool.id),
        academicService.getTeacherAssignments(activeSchool.id),
        academicService.getTimetableEntries(activeSchool.id),
      ]);
      const stf = academicService.getStaff(activeSchool.id);
      const slots = academicService.getPeriodSlots(activeSchool.id);

      setClasses(cls);
      setSections(sec);
      setSubjects(subs);
      setClassSubjects(cs);
      setStaffList(stf);
      setAssignments(asg);
      setTimetableEntries(tt);
      setPeriodSlots(slots && slots.length > 0 ? slots : DEFAULT_PERIOD_SLOTS);

      // Default selection if not set
      if (!selectedClassId && cls.length > 0) {
        setSelectedClassId(cls[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed to load academic records: ${err.message}` });
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSchool]);

  // Derived current class & sections
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  const classSections = useMemo(() => {
    if (!selectedClassId) return [];
    return sections.filter((s) => s.classId === selectedClassId);
  }, [sections, selectedClassId]);

  // Auto select section when class changes
  useEffect(() => {
    if (classSections.length > 0) {
      if (!selectedSectionId || !classSections.some((s) => s.id === selectedSectionId)) {
        setSelectedSectionId(classSections[0].id);
      }
    } else {
      setSelectedSectionId('');
    }
  }, [classSections, selectedClassId]);

  const currentSection = useMemo(() => {
    return classSections.find((s) => s.id === selectedSectionId) || null;
  }, [classSections, selectedSectionId]);

  // Sync section state into DRAFT when target section changes
  useEffect(() => {
    if (!currentSection || !activeSchool) {
      setDraftAssignments(new Map());
      setDraftClassSubjects([]);
      setDraftTimetable([]);
      setIsDraftDirty(false);
      return;
    }

    // 1. Initial Class Subjects from database
    const savedClassSubjects = academicService.getClassSubjectsSync(
      activeSchool.id,
      currentSection.classId,
    );
    setDraftClassSubjects(savedClassSubjects);

    // 2. Initial Teacher Assignments from database
    const savedAssignments = assignments.filter(
      (a) => a.academicYearSectionId === currentSection.id,
    );
    const asgMap = new Map<string, { staffId: string; isClassTeacher: boolean }>();
    savedAssignments.forEach((a) => {
      if (a.subjectId) {
        asgMap.set(a.subjectId, { staffId: a.staffId, isClassTeacher: Boolean(a.isClassTeacher) });
      }
    });
    setDraftAssignments(asgMap);

    // 3. Initial Timetable from database
    const savedTimetable = timetableEntries.filter(
      (t) => t.academicYearSectionId === currentSection.id,
    );
    setDraftTimetable(savedTimetable);

    setIsDraftDirty(false);
  }, [currentSection?.id, activeSchool?.id]);

  // Current curriculum subjects (merge persisted + draft-added)
  const currentCurriculumSubjects = useMemo(() => {
    if (!currentClass) return [];
    const base = classSubjects.filter((cs) => cs.classId === currentClass.id);
    const draftAdded = draftClassSubjects.filter(
      (dcs) => dcs.classId === currentClass.id && !base.some((b) => b.subjectId === dcs.subjectId),
    );
    return [...base, ...draftAdded];
  }, [classSubjects, draftClassSubjects, currentClass]);

  // Teacher overall workload map across the school
  const teacherWorkloadMap = useMemo(() => {
    const map = new Map<string, number>();
    timetableEntries.forEach((e) => {
      if (e.teacherId) {
        map.set(e.teacherId, (map.get(e.teacherId) || 0) + 1);
      }
    });
    return map;
  }, [timetableEntries]);

  // Timetable subject scheduled count map in draft
  const subjectTimetableCountMap = useMemo(() => {
    const map = new Map<string, number>();
    draftTimetable.forEach((e) => {
      if (e.subjectId) {
        map.set(e.subjectId, (map.get(e.subjectId) || 0) + 1);
      }
    });
    return map;
  }, [draftTimetable]);

  // Current section's Class Teacher (Homeroom lead)
  const currentClassTeacher = useMemo(() => {
    if (!currentSection) return null;
    for (const [, val] of draftAssignments.entries()) {
      if (val.isClassTeacher && val.staffId) {
        return staffList.find((s) => s.id === val.staffId) || null;
      }
    }
    const dbAsg = assignments.find(
      (a) => a.academicYearSectionId === currentSection.id && a.isClassTeacher,
    );
    if (dbAsg) {
      return staffList.find((s) => s.id === dbAsg.staffId) || null;
    }
    return null;
  }, [draftAssignments, assignments, staffList, currentSection]);

  // =========================================================================
  // REAL-TIME CONFLICT DETECTOR (DRAFT ENGINE)
  // =========================================================================
  const detailedConflicts = useMemo<DetailedConflict[]>(() => {
    if (!activeSchool || !currentSection) return [];
    const otherTimetable = timetableEntries.filter(
      (e) => e.academicYearSectionId !== currentSection.id,
    );

    const list: DetailedConflict[] = [];

    // 1. Timetable Slot Conflicts
    draftTimetable.forEach((slot) => {
      if (!slot.teacherId) return;

      // Teacher clash with other classes/sections in the same time slot
      const clash = otherTimetable.find(
        (o) =>
          o.dayOfWeek === slot.dayOfWeek &&
          o.periodId === slot.periodId &&
          o.teacherId === slot.teacherId,
      );
      if (clash) {
        list.push({
          id: `clash-${slot.id}-${clash.id}`,
          slotId: slot.id,
          subjectId: slot.subjectId,
          subjectName: slot.subjectName,
          teacherId: slot.teacherId,
          teacherName: slot.teacherName || clash.teacherName,
          day: slot.dayOfWeek,
          periodId: slot.periodId,
          type: 'TEACHER_CLASH',
          message: `Teacher ${slot.teacherName || clash.teacherName} is double-booked on ${slot.dayOfWeek} Period ${slot.periodId} (also teaching ${clash.className}-${clash.sectionName}).`,
        });
      }

      // Overlap inside this section draft (two subjects in same period)
      const internalClash = draftTimetable.find(
        (s) => s.id !== slot.id && s.dayOfWeek === slot.dayOfWeek && s.periodId === slot.periodId,
      );
      if (internalClash) {
        list.push({
          id: `overlap-${slot.id}-${internalClash.id}`,
          slotId: slot.id,
          subjectId: slot.subjectId,
          subjectName: slot.subjectName,
          day: slot.dayOfWeek,
          periodId: slot.periodId,
          type: 'SECTION_OVERLAP',
          message: `Multiple subjects assigned to ${slot.dayOfWeek} Period ${slot.periodId}.`,
        });
      }
    });

    return list;
  }, [activeSchool, currentSection, draftTimetable, timetableEntries]);

  // =========================================================================
  // UNIFIED SUBJECTS ALLOCATIONS LIST
  // =========================================================================
  const unifiedAllocations = useMemo(() => {
    const mappedMap = new Map<string, ClassSubjectItem>();
    currentCurriculumSubjects.forEach((cs) => mappedMap.set(cs.subjectId, cs));

    return currentCurriculumSubjects.map((cs) => {
      const sub =
        subjects.find((s) => s.id === cs.subjectId) ||
        ({
          id: cs.subjectId,
          schoolId: activeSchool?.id || '',
          name: cs.subjectName,
          code: cs.subjectCode || 'SUB',
          subjectType: 'THEORY',
          credits: 4,
          isElective: !cs.isMandatory,
          status: 'ACTIVE',
        } as unknown as SubjectItem);

      const draftAsg = draftAssignments.get(cs.subjectId) || null;
      const assignedStaff = draftAsg?.staffId
        ? staffList.find((s) => s.id === draftAsg.staffId) || null
        : null;
      const isClassTeacher = Boolean(draftAsg?.isClassTeacher);
      const scheduledPeriods = subjectTimetableCountMap.get(cs.subjectId) || 0;
      const targetPeriods = cs.weeklyPeriods || 5;

      const subjectConflicts = detailedConflicts.filter((c) => c.subjectId === cs.subjectId);

      return {
        subject: sub,
        mapping: cs,
        assignment: draftAsg ? { staffId: draftAsg.staffId, isClassTeacher } : null,
        assignedStaff,
        isClassTeacher,
        targetPeriods,
        scheduledPeriods,
        hasTeacher: Boolean(assignedStaff),
        conflicts: subjectConflicts,
        hasConflict: subjectConflicts.length > 0,
      };
    });
  }, [
    currentCurriculumSubjects,
    subjects,
    draftAssignments,
    staffList,
    subjectTimetableCountMap,
    detailedConflicts,
    activeSchool,
  ]);

  // Filtered Subject Allocations
  const filteredAllocations = useMemo(() => {
    return unifiedAllocations.filter((item) => {
      if (statusFilter === 'ASSIGNED' && !item.hasTeacher) return false;
      if (statusFilter === 'UNASSIGNED' && item.hasTeacher) return false;
      if (statusFilter === 'CONFLICTS' && !item.hasConflict) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSub =
          item.subject.name.toLowerCase().includes(q) ||
          item.subject.code.toLowerCase().includes(q);
        const matchesTeacher = item.assignedStaff
          ? `${item.assignedStaff.firstName} ${item.assignedStaff.lastName}`
              .toLowerCase()
              .includes(q)
          : false;
        return matchesSub || matchesTeacher;
      }
      return true;
    });
  }, [unifiedAllocations, statusFilter, searchQuery]);

  // Counts for the Conflict Overview Widget
  const assignedCount = useMemo(() => {
    return unifiedAllocations.filter((u) => u.hasTeacher).length;
  }, [unifiedAllocations]);

  const unassignedCount = useMemo(() => {
    return unifiedAllocations.filter((u) => !u.hasTeacher).length;
  }, [unifiedAllocations]);

  const conflictsCount = detailedConflicts.length;

  const unassignedItems = useMemo(() => {
    return unifiedAllocations.filter((u) => !u.hasTeacher);
  }, [unifiedAllocations]);

  // Available subjects from catalog not yet in this class's curriculum
  const unmappedCatalogSubjects = useMemo(() => {
    return subjects.filter((s) => !currentCurriculumSubjects.some((cs) => cs.subjectId === s.id));
  }, [subjects, currentCurriculumSubjects]);

  // =========================================================================
  // JUMP TO SUBJECT / SLOT HANDLER
  // =========================================================================
  const jumpToSubject = (subjectId: string) => {
    setStatusFilter('ALL');
    setHighlightedSubjectId(subjectId);
    setTimeout(() => {
      const el = document.getElementById(`subject-card-${subjectId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    setTimeout(() => {
      setHighlightedSubjectId(null);
    }, 3000);
  };

  const jumpToSlot = (slotId: string, subjectId?: string) => {
    if (subjectId) {
      jumpToSubject(subjectId);
    }
    setHighlightedSlotId(slotId);
    setShowTimetableGrid(true);
    setTimeout(() => {
      const el = document.getElementById(`timetable-slot-${slotId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedSlotId(null);
    }, 3000);
  };

  // =========================================================================
  // INLINE DRAFT MUTATIONS
  // =========================================================================

  // 1. Adjust weekly periods inline in draft
  const handleUpdateWeeklyPeriods = (csId: string, newPeriods: number) => {
    if (!activeSchool || !canManage) return;
    const clamped = Math.max(1, Math.min(25, newPeriods));
    setDraftClassSubjects((prev) =>
      prev.map((cs) => (cs.id === csId ? { ...cs, weeklyPeriods: clamped } : cs)),
    );
    setIsDraftDirty(true);
  };

  // 2. Assign or Change Teacher inline in draft
  const handleSelectTeacherForSubject = (subjectId: string, staffId: string) => {
    if (!activeSchool || !currentSection || !canManage) return;

    const nextAssignments = new Map<string, { staffId: string; isClassTeacher: boolean }>(
      draftAssignments,
    );
    const existing = nextAssignments.get(subjectId);
    const staff = staffList.find((s) => s.id === staffId);
    const sub = subjects.find((s) => s.id === subjectId);

    if (staffId) {
      nextAssignments.set(subjectId, {
        staffId,
        isClassTeacher: existing ? existing.isClassTeacher : false,
      });
      // Synchronize matching timetable slots in draft with the new teacher
      setDraftTimetable((prev) =>
        prev.map((slot) =>
          slot.subjectId === subjectId
            ? {
                ...slot,
                teacherId: staffId,
                teacherName: `${staff?.firstName || ''} ${staff?.lastName || ''}`.trim(),
              }
            : slot,
        ),
      );
      setFeedback({
        type: 'success',
        message: `Assigned ${staff?.firstName} ${staff?.lastName} to ${sub?.name || 'Subject'} (Draft Preview).`,
      });
    } else {
      nextAssignments.delete(subjectId);
      setDraftTimetable((prev) =>
        prev.map((slot) =>
          slot.subjectId === subjectId
            ? { ...slot, teacherId: undefined, teacherName: undefined }
            : slot,
        ),
      );
      setFeedback({
        type: 'success',
        message: `Unassigned teacher for ${sub?.name || 'Subject'} (Draft Preview).`,
      });
    }

    setDraftAssignments(nextAssignments);
    setIsDraftDirty(true);
    setTimeout(() => setFeedback(null), 3000);
  };

  // 3. Toggle Class Teacher (Homeroom) in DRAFT
  const handleToggleClassTeacher = (staffId: string) => {
    if (!activeSchool || !currentSection || !canManage) return;

    const nextAssignments = new Map<string, { staffId: string; isClassTeacher: boolean }>(
      draftAssignments,
    );
    for (const [subId, val] of nextAssignments.entries()) {
      nextAssignments.set(subId, {
        ...val,
        isClassTeacher: val.staffId === staffId,
      });
    }

    // If teacher is not yet in assignments, attach to first subject
    const hasEntry = Array.from(nextAssignments.values()).some((v) => v.staffId === staffId);
    if (!hasEntry && currentCurriculumSubjects.length > 0) {
      const firstSub = currentCurriculumSubjects[0];
      nextAssignments.set(firstSub.subjectId, {
        staffId,
        isClassTeacher: true,
      });
    }

    setDraftAssignments(nextAssignments);
    setIsDraftDirty(true);

    const staff = staffList.find((s) => s.id === staffId);
    setFeedback({
      type: 'success',
      message: staff
        ? `Designated ${staff.firstName} ${staff.lastName} as Class Teacher (Draft Preview).`
        : 'Updated Class Teacher designation.',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 4. Remove Subject from class in draft
  const handleRemoveSubjectFromClass = (subjectId: string) => {
    if (!activeSchool || !canManage) return;
    setDraftClassSubjects((prev) => prev.filter((cs) => cs.subjectId !== subjectId));
    const nextAsgs = new Map(draftAssignments);
    nextAsgs.delete(subjectId);
    setDraftAssignments(nextAsgs);
    setDraftTimetable((prev) => prev.filter((t) => t.subjectId !== subjectId));
    setIsDraftDirty(true);

    const sub = subjects.find((s) => s.id === subjectId);
    setFeedback({
      type: 'success',
      message: `Removed "${sub?.name || 'Subject'}" from class draft curriculum.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 5. Add Subject inline from catalog
  const handleAddSubjectFromCatalog = () => {
    if (!activeSchool || !currentClass || !selectedCatalogSubjectId || !canManage) return;
    const sub = subjects.find((s) => s.id === selectedCatalogSubjectId);
    if (!sub) return;

    const newCS: ClassSubjectItem = {
      id: `draft-cs-${Date.now()}-${sub.id}`,
      schoolId: activeSchool.id,
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      weeklyPeriods: sub.subjectType === 'PRACTICAL' ? 4 : 5,
      isMandatory: !sub.isElective,
    };

    setDraftClassSubjects((prev) => [...prev.filter((cs) => cs.subjectId !== sub.id), newCS]);
    setIsDraftDirty(true);
    setSelectedCatalogSubjectId('');
    setIsInlineAddOpen(false);

    setFeedback({
      type: 'success',
      message: `Added "${sub.name}" to class curriculum (Draft Preview).`,
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  // 6. Create & Add New Custom Subject inline
  const handleCreateCustomSubject = async () => {
    if (!activeSchool || !currentClass || !customSubjectName.trim() || !canManage) return;
    try {
      const newSubject = await academicService.createSubject(
        activeSchool.id,
        {
          name: customSubjectName.trim(),
          code:
            customSubjectCode.trim().toUpperCase() ||
            customSubjectName.substring(0, 4).toUpperCase() + '-101',
          subjectType: customSubjectType,
          credits: 4,
          isElective: false,
        },
        userContext,
      );

      // Add to catalog list in state
      setSubjects((prev) => [...prev, newSubject]);

      // Add to draft class subjects
      const newCS: ClassSubjectItem = {
        id: `draft-cs-${Date.now()}-${newSubject.id}`,
        schoolId: activeSchool.id,
        classId: currentClass.id,
        className: currentClass.name,
        subjectId: newSubject.id,
        subjectName: newSubject.name,
        subjectCode: newSubject.code,
        weeklyPeriods: customSubjectPeriods,
        isMandatory: true,
      };

      setDraftClassSubjects((prev) => [...prev, newCS]);
      setIsDraftDirty(true);

      setCustomSubjectName('');
      setCustomSubjectCode('');
      setCustomSubjectPeriods(5);
      setIsInlineAddOpen(false);

      setFeedback({
        type: 'success',
        message: `Created and added "${newSubject.name}" (${newSubject.code}) to class!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // =========================================================================
  // AUTOMATION WIZARD ENGINES (DRAFT ONLY - NON-DESTRUCTIVE)
  // =========================================================================

  // Auto-Assign Teachers in Draft
  const handleAutoAssignTeachers = () => {
    if (!activeSchool || !currentSection || !canManage) return;
    setIsProcessing(true);
    try {
      const currentDraftAsgs = Array.from(draftAssignments.entries()).map(([subjectId, val]) => ({
        subjectId,
        staffId: val.staffId,
        isClassTeacher: val.isClassTeacher,
      }));

      const draftList = academicService.generateDraftTeacherAssignments(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || '',
        currentCurriculumSubjects,
        currentDraftAsgs,
        staffList,
      );

      const nextMap = new Map<string, { staffId: string; isClassTeacher: boolean }>(
        draftAssignments,
      );
      draftList.forEach((item) => {
        nextMap.set(item.subjectId, {
          staffId: item.staffId,
          isClassTeacher: Boolean(item.isClassTeacher),
        });
      });

      // Synchronize teacher names in draft timetable
      setDraftTimetable((prev) =>
        prev.map((slot) => {
          const asg = nextMap.get(slot.subjectId);
          if (asg) {
            const stf = staffList.find((s) => s.id === asg.staffId);
            return {
              ...slot,
              teacherId: asg.staffId,
              teacherName: stf ? `${stf.firstName} ${stf.lastName}` : slot.teacherName,
            };
          }
          return slot;
        }),
      );

      setDraftAssignments(nextMap);
      setIsDraftDirty(true);

      setFeedback({
        type: 'success',
        message: `Matched ${draftList.length} faculty teachers based on departments & specializations (Draft Preview).`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-Schedule Timetable in Draft
  const handleAutoScheduleTimetable = () => {
    if (!activeSchool || !currentSection || !canManage) return;
    if (currentCurriculumSubjects.length === 0) {
      setFeedback({
        type: 'error',
        message:
          'Cannot schedule timetable without curriculum subjects. Please add subjects first.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const draftAsgArray = Array.from(draftAssignments.entries()).map(([subjectId, val]) => ({
        subjectId,
        staffId: val.staffId,
      }));

      const generatedDraft = academicService.generateDraftTimetableForSection(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || '',
        draftAsgArray,
        currentCurriculumSubjects,
      );

      setDraftTimetable(generatedDraft);
      setIsDraftDirty(true);
      setShowTimetableGrid(true);

      setFeedback({
        type: 'success',
        message: `Generated ${generatedDraft.length} weekly periods in draft preview! Review schedule below and click Save.`,
      });
      setTimeout(() => setFeedback(null), 4500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Complete Auto Setup (Curriculum + Faculty + Timetable in Draft)
  const handleOneClickCompleteSetup = () => {
    if (!activeSchool || !currentSection || !currentClass || !canManage) return;
    setIsProcessing(true);
    try {
      let targetCurriculum = [...currentCurriculumSubjects];
      if (targetCurriculum.length === 0) {
        const standardKeywords = [
          'english',
          'math',
          'science',
          'social',
          'hindi',
          'computer',
          'physical',
          'art',
        ];
        const candidates = subjects.filter((s) => {
          const name = s.name.toLowerCase();
          return standardKeywords.some((k) => name.includes(k));
        });
        const toAdd = candidates.length > 0 ? candidates.slice(0, 7) : subjects.slice(0, 6);
        targetCurriculum = toAdd.map((sub) => ({
          id: `draft-cs-${Date.now()}-${sub.id}`,
          schoolId: activeSchool.id,
          classId: currentClass.id,
          className: currentClass.name,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          weeklyPeriods: 5,
          isMandatory: true,
        }));
        setDraftClassSubjects(targetCurriculum);
      }

      const draftTeacherList = academicService.generateDraftTeacherAssignments(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || '',
        targetCurriculum,
        [],
        staffList,
      );

      const nextMap = new Map<string, { staffId: string; isClassTeacher: boolean }>(
        draftAssignments,
      );
      draftTeacherList.forEach((item) => {
        nextMap.set(item.subjectId, {
          staffId: item.staffId,
          isClassTeacher: Boolean(item.isClassTeacher),
        });
      });
      setDraftAssignments(nextMap);

      const generatedDraft = academicService.generateDraftTimetableForSection(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || '',
        draftTeacherList,
        targetCurriculum,
      );

      setDraftTimetable(generatedDraft);
      setIsDraftDirty(true);
      setShowTimetableGrid(true);

      setFeedback({
        type: 'success',
        message: `🪄 1-Click Auto Setup Ready: Mapped ${targetCurriculum.length} subjects, matched ${draftTeacherList.length} faculty teachers, and drafted ${generatedDraft.length} weekly periods. Click "Save to Database" when satisfied.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Standard Core Subjects to Class
  const handleAddStandardCoreSubjects = () => {
    if (!activeSchool || !currentClass || !canManage) return;
    const standardKeywords = [
      'english',
      'math',
      'science',
      'social',
      'hindi',
      'computer',
      'physical',
      'art',
    ];
    const candidates = subjects.filter((s) => {
      const name = s.name.toLowerCase();
      return (
        standardKeywords.some((k) => name.includes(k)) &&
        !currentCurriculumSubjects.some((cs) => cs.subjectId === s.id)
      );
    });
    const toAdd =
      candidates.length > 0
        ? candidates.slice(0, 7)
        : subjects
            .filter((s) => !currentCurriculumSubjects.some((cs) => cs.subjectId === s.id))
            .slice(0, 6);

    if (toAdd.length === 0) {
      setFeedback({
        type: 'warning',
        message: 'All standard subjects are already added to this class.',
      });
      return;
    }

    const newItems: ClassSubjectItem[] = toAdd.map((sub) => ({
      id: `draft-cs-${Date.now()}-${sub.id}`,
      schoolId: activeSchool.id,
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      weeklyPeriods: sub.subjectType === 'PRACTICAL' ? 4 : 5,
      isMandatory: true,
    }));

    setDraftClassSubjects((prev) => [...prev, ...newItems]);
    setIsDraftDirty(true);
    setFeedback({
      type: 'success',
      message: `Added ${newItems.length} core subjects to draft curriculum!`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // =========================================================================
  // ATOMIC DATABASE PERSISTENCE & DISCARD
  // =========================================================================
  const handleSaveDraftToDatabase = () => {
    if (!activeSchool || !currentSection || !canManage) return;

    if (detailedConflicts.length > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot save: ${detailedConflicts[0].message} Please resolve conflicts before saving.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Prepare Teacher Assignments array
      const teacherAssignmentsPayload = Array.from(draftAssignments.entries()).map(
        ([subjectId, val]) => ({
          subjectId,
          staffId: val.staffId,
          isClassTeacher: Boolean(val.isClassTeacher),
        }),
      );

      // 2. Prepare Class Subjects to add if any
      const classSubjectsToAddPayload = draftClassSubjects
        .filter(
          (dcs) =>
            !classSubjects.some(
              (saved) => saved.classId === dcs.classId && saved.subjectId === dcs.subjectId,
            ),
        )
        .map((dcs) => ({
          classId: dcs.classId,
          subjectId: dcs.subjectId,
          weeklyPeriods: dcs.weeklyPeriods || 5,
          isMandatory: dcs.isMandatory !== false,
        }));

      // 3. Atomically commit all allocations and timetable in ONE transaction
      const result = academicService.saveSectionAllocationAndTimetable(
        activeSchool.id,
        currentSection.id,
        activeAcademicYear?.id || '',
        {
          teacherAssignments: teacherAssignmentsPayload,
          timetableEntries: draftTimetable,
          classSubjectsToAdd: classSubjectsToAddPayload,
        },
        userContext,
      );

      // Refresh database records
      loadData();
      setIsDraftDirty(false);

      setFeedback({
        type: 'success',
        message: `💾 Successfully saved! Persisted ${result.savedAssignmentsCount} teacher assignments and ${result.savedTimetableCount} weekly timetable slots to database.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDraft = () => {
    if (!currentSection || !activeSchool) return;
    const savedClassSubjects = academicService.getClassSubjectsSync(
      activeSchool.id,
      currentSection.classId,
    );
    setDraftClassSubjects(savedClassSubjects);

    const savedAssignments = assignments.filter(
      (a) => a.academicYearSectionId === currentSection.id,
    );
    const asgMap = new Map<string, { staffId: string; isClassTeacher: boolean }>();
    savedAssignments.forEach((a) => {
      if (a.subjectId) {
        asgMap.set(a.subjectId, { staffId: a.staffId, isClassTeacher: Boolean(a.isClassTeacher) });
      }
    });
    setDraftAssignments(asgMap);

    const savedTimetable = timetableEntries.filter(
      (t) => t.academicYearSectionId === currentSection.id,
    );
    setDraftTimetable(savedTimetable);

    setIsDraftDirty(false);
    setFeedback({
      type: 'warning',
      message: 'Discarded all draft changes. Reverted to database state.',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Clone from another section
  const handleCloneFromSection = () => {
    if (!activeSchool || !currentSection || !cloneSourceSectionId || !canManage) return;
    try {
      const sourceAssignments = assignments.filter(
        (a) => a.academicYearSectionId === cloneSourceSectionId,
      );
      const sourceTimetable = timetableEntries.filter(
        (t) => t.academicYearSectionId === cloneSourceSectionId,
      );

      // Apply to draft
      const nextMap = new Map<string, { staffId: string; isClassTeacher: boolean }>();
      sourceAssignments.forEach((a) => {
        if (a.subjectId) {
          nextMap.set(a.subjectId, {
            staffId: a.staffId,
            isClassTeacher: Boolean(a.isClassTeacher),
          });
        }
      });
      setDraftAssignments(nextMap);

      const clonedTT = sourceTimetable.map((st) => ({
        ...st,
        id: `draft-tt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        academicYearSectionId: currentSection.id,
        className: currentSection.className,
        sectionName: currentSection.sectionName,
      }));
      setDraftTimetable(clonedTT);
      setIsDraftDirty(true);
      setIsCloneSectionOpen(false);

      setFeedback({
        type: 'success',
        message: `Cloned ${sourceAssignments.length} faculty assignments and ${clonedTT.length} timetable periods into draft preview!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Timetable Slot Quick Assignment in Draft
  const handleAssignSlot = (subjectId: string) => {
    if (!activeSlotEdit || !currentSection || !activeSchool) return;
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;

    const asg = draftAssignments.get(subjectId);
    const teacher = asg?.staffId ? staffList.find((s) => s.id === asg.staffId) : null;
    const period = periodSlots.find((p) => p.id === activeSlotEdit.periodId);

    const newSlot: TimetableEntry = {
      id: `draft-tt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      schoolId: activeSchool.id,
      academicYearId: activeAcademicYear?.id || '',
      academicYearSectionId: currentSection.id,
      className: currentSection.className,
      sectionName: currentSection.sectionName,
      dayOfWeek: activeSlotEdit.day,
      periodId: activeSlotEdit.periodId,
      startTime: period?.startTime || '09:00',
      endTime: period?.endTime || '09:45',
      subjectId: sub.id,
      subjectName: sub.name,
      teacherId: teacher?.id,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : undefined,
      room: 'Room 101',
      periodType: sub.subjectType === 'PRACTICAL' ? 'PRACTICAL_LAB' : 'REGULAR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Replace any existing slot at this day & period
    setDraftTimetable((prev) => [
      ...prev.filter(
        (s) => !(s.dayOfWeek === activeSlotEdit.day && s.periodId === activeSlotEdit.periodId),
      ),
      newSlot,
    ]);
    setIsDraftDirty(true);
    setActiveSlotEdit(null);
  };

  const handleClearSingleSlot = (slotId: string) => {
    setDraftTimetable((prev) => prev.filter((s) => s.id !== slotId));
    setIsDraftDirty(true);
  };

  const activeDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const regularPeriods = periodSlots.filter((p) => !p.isBreak);

  // Subject palette colors for clear visual distinction in timetable
  const getSubjectColor = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('math'))
      return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
    if (n.includes('sci') || n.includes('phys') || n.includes('chem') || n.includes('bio'))
      return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
    if (n.includes('eng') || n.includes('lang') || n.includes('lit'))
      return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
    if (n.includes('soc') || n.includes('hist') || n.includes('geo'))
      return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
    if (n.includes('comp') || n.includes('tech') || n.includes('robot'))
      return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
    if (n.includes('art') || n.includes('music'))
      return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
    if (n.includes('phys') || n.includes('pe') || n.includes('sport'))
      return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
    return 'bg-secondary bg-opacity-10 text-body border border-secondary border-opacity-25';
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SECTION PICKER (STREAMLINED HORIZONTAL BAR)                */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-body text-body">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              Express Allocator
            </span>
            {activeAcademicYear && (
              <span className="text-xs font-semibold text-secondary">
                • {activeAcademicYear.name}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold">Fast-Track Subject Allocation &amp; Timetable</h1>
          <p className="text-xs text-secondary max-w-2xl">
            Single-view interface: manage curriculum subjects, assign faculty specialists, detect
            live schedule clashes, and preview the weekly timetable.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <button
              type="button"
              disabled={!currentSection || isProcessing}
              onClick={handleOneClickCompleteSetup}
              className="h-9 px-3.5 bg-primary hover:bg-primary-emphasis text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              title="Auto-map subjects, match faculty specialists, and schedule timetable in draft"
            >
              <Sparkles className="w-4 h-4 text-warning" />
              <span>🪄 1-Click Auto Setup</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCloneSectionOpen((prev) => !prev)}
              disabled={sections.length <= 1}
              className="h-9 px-3 rounded-lg border border-secondary-subtle hover:bg-body-secondary text-body text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Clone setup from another section"
            >
              <Copy className="w-3.5 h-3.5 text-primary" />
              <span>Clone...</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            title="Refresh database records"
            className="w-9 h-9 rounded-lg border border-secondary-subtle flex items-center justify-center text-body hover:bg-body-secondary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clone Quick Panel (Inline) */}
      {isCloneSectionOpen && (
        <div className="p-3.5 rounded-xl border border-secondary-subtle bg-body-tertiary flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Copy className="w-4 h-4 text-primary" />
            <span className="font-semibold text-body">
              Clone into {currentSection?.className}-{currentSection?.sectionName}:
            </span>
            <select
              value={cloneSourceSectionId}
              onChange={(e) => setCloneSourceSectionId(e.target.value)}
              className="h-8 px-2.5 rounded-md text-xs border bg-body text-body"
            >
              <option value="">Select source section...</option>
              {sections
                .filter((s) => s.id !== selectedSectionId)
                .map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.className} — Section {sec.sectionName}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!cloneSourceSectionId}
              onClick={handleCloneFromSection}
              className="h-8 px-3 rounded-md text-xs font-bold bg-primary hover:bg-primary-emphasis text-white disabled:opacity-40"
            >
              Copy into Draft
            </button>
            <button
              type="button"
              onClick={() => setIsCloneSectionOpen(false)}
              className="h-8 px-2.5 rounded-md text-xs text-secondary hover:text-body"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs font-medium border transition-all ${
            feedback.type === 'success'
              ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
              : feedback.type === 'warning'
                ? 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning'
                : 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-secondary hover:text-body p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CLASS, SECTION & HOMEROOM SELECTOR BAR                                 */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl border space-y-3.5 bg-body text-body">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Class & Section Chooser */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-body flex items-center gap-1.5 whitespace-nowrap">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Class:</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 px-3 text-xs font-bold rounded-lg border min-w-[170px] bg-body text-body"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Section Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-secondary">Section:</span>
              {classSections.length === 0 ? (
                <span className="text-xs text-warning italic">No sections created yet.</span>
              ) : (
                classSections.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  const secSlotsCount = isSelected
                    ? draftTimetable.length
                    : timetableEntries.filter((e) => e.academicYearSectionId === sec.id).length;

                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`h-8 px-3.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary border-primary text-white shadow-xs'
                          : 'bg-body text-body hover:bg-body-secondary'
                      }`}
                    >
                      <span>Section {sec.sectionName || sec.name}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-white bg-opacity-25 text-white'
                            : 'bg-body-secondary text-secondary'
                        }`}
                      >
                        {secSlotsCount} slots
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Homeroom / Class Teacher Selector */}
          {currentSection && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-secondary flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span>Class Teacher:</span>
              </span>
              <select
                value={currentClassTeacher?.id || ''}
                disabled={!canManage}
                onChange={(e) => handleToggleClassTeacher(e.target.value)}
                className={`h-8 px-2.5 text-xs font-medium rounded-lg border max-w-[220px] ${
                  currentClassTeacher
                    ? 'bg-warning bg-opacity-10 border-warning text-warning font-semibold'
                    : 'bg-body border text-body'
                }`}
              >
                <option value="">(Select Homeroom Lead...)</option>
                {staffList.map((stf) => (
                  <option key={stf.id} value={stf.id}>
                    {stf.firstName} {stf.lastName} ({stf.departmentName || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIGHTWEIGHT 'CONFLICT OVERVIEW' SUMMARY WIDGET (CRITICAL PROMPT ITEM) */}
      {/* ========================================================================= */}
      {currentSection && (
        <div
          id="conflict-overview-widget"
          className={`p-4 rounded-xl border shadow-xs transition-all ${
            conflictsCount > 0
              ? 'bg-danger bg-opacity-10 border-danger text-danger'
              : 'bg-body border text-body'
          }`}
        >
          {/* Header Row: Status Badges & Direct Jump Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert
                className={`w-4 h-4 ${conflictsCount > 0 ? 'text-danger' : 'text-success'}`}
              />
              <h2 className="text-xs font-bold uppercase tracking-wider text-body">
                Allocation &amp; Conflict Overview
              </h2>
              <span className="text-[11px] text-secondary">
                • {currentSection.className}-{currentSection.sectionName}
              </span>
            </div>

            {/* Simple Status Count Pills with Clickable Links */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 1. Assigned Count Button */}
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'ASSIGNED' ? 'ALL' : 'ASSIGNED')}
                className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  statusFilter === 'ASSIGNED'
                    ? 'bg-success border-success text-white shadow-xs'
                    : 'bg-success bg-opacity-10 border-success border-opacity-25 text-success hover:bg-opacity-20'
                }`}
                title="Filter to subjects with assigned faculty"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>{assignedCount} Assigned</span>
              </button>

              {/* 2. Unassigned Count Button */}
              <button
                type="button"
                onClick={() => {
                  if (unassignedCount > 0) {
                    setStatusFilter(statusFilter === 'UNASSIGNED' ? 'ALL' : 'UNASSIGNED');
                    if (unassignedItems.length > 0) {
                      jumpToSubject(unassignedItems[0].subject.id);
                    }
                  }
                }}
                className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  statusFilter === 'UNASSIGNED'
                    ? 'bg-warning border-warning text-white shadow-xs'
                    : unassignedCount > 0
                      ? 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning hover:bg-opacity-20'
                      : 'bg-body-secondary border-secondary-subtle text-secondary'
                }`}
                title="Click to view and jump to unassigned subjects"
              >
                <AlertCircle
                  className={`w-3.5 h-3.5 ${unassignedCount > 0 ? 'text-warning' : 'text-secondary'}`}
                />
                <span>{unassignedCount} Unassigned</span>
              </button>

              {/* 3. Conflicts Count Button */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === 'CONFLICTS' ? 'ALL' : 'CONFLICTS');
                  setIsConflictPanelExpanded(true);
                }}
                className={`h-7 px-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  conflictsCount > 0
                    ? statusFilter === 'CONFLICTS'
                      ? 'bg-danger border-danger text-white shadow-xs'
                      : 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger hover:bg-opacity-20'
                    : 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
                }`}
                title={
                  conflictsCount > 0
                    ? 'Click to view conflicting subjects and timetable slots'
                    : 'No conflicts detected'
                }
              >
                {conflictsCount > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-success" />
                )}
                <span>
                  {conflictsCount > 0
                    ? `${conflictsCount} Conflict${conflictsCount > 1 ? 's' : ''}`
                    : '0 Conflicts (Clean)'}
                </span>
              </button>

              {/* Collapse/Expand details toggle */}
              {(conflictsCount > 0 || unassignedCount > 0) && (
                <button
                  type="button"
                  onClick={() => setIsConflictPanelExpanded((prev) => !prev)}
                  className="w-7 h-7 rounded-md border border-secondary-subtle flex items-center justify-center text-secondary hover:text-body"
                  title="Toggle overview details"
                >
                  {isConflictPanelExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Expandable Interactive Conflict Details & Direct Jump Links */}
          {isConflictPanelExpanded && (conflictsCount > 0 || unassignedCount > 0) && (
            <div className="mt-3 pt-3 border-t border-secondary-subtle space-y-2">
              {/* Conflicts List with Direct Jump Links */}
              {conflictsCount > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-danger flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Active Schedule Clashes ({conflictsCount}):</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {detailedConflicts.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg border border-danger-subtle bg-body text-xs flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="truncate">
                          <span className="font-bold text-danger block truncate">{c.message}</span>
                          <span className="text-[10px] text-secondary font-mono">
                            Slot: {c.day} • {c.periodId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (c.subjectId) {
                              jumpToSubject(c.subjectId);
                            } else if (c.slotId) {
                              jumpToSlot(c.slotId);
                            }
                          }}
                          className="h-6 px-2 text-[10px] font-bold rounded bg-danger hover:bg-danger text-white whitespace-nowrap flex items-center gap-1 transition-all shadow-xs"
                          title="Jump directly to this subject and slot"
                        >
                          <span>Fix Clash →</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unassigned Quick Jump Links */}
              {unassignedCount > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-semibold text-warning flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Teacher Assignments ({unassignedCount}) — Click to jump:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {unassignedItems.map((item) => (
                      <button
                        key={item.subject.id}
                        type="button"
                        onClick={() => jumpToSubject(item.subject.id)}
                        className="h-6 px-2.5 rounded-md text-[11px] font-semibold border border-warning border-opacity-25 bg-warning bg-opacity-10 text-warning hover:bg-opacity-20 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="font-mono text-[10px] opacity-70">
                          {item.subject.code}
                        </span>
                        <span>{item.subject.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-warning" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DRAFT STATUS & PERSISTENCE COMMAND BAR                                  */}
      {/* ========================================================================= */}
      {isDraftDirty && currentSection && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in ${
            detailedConflicts.length > 0
              ? 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning'
              : 'bg-primary bg-opacity-10 border-primary border-opacity-25 text-primary'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                detailedConflicts.length > 0 ? 'bg-warning text-white' : 'bg-primary text-white'
              }`}
            >
              {detailedConflicts.length > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary bg-opacity-20 text-primary">
                  Draft Preview Active
                </span>
                <span className="text-xs font-bold text-body">Unsaved in-memory changes</span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {draftTimetable.length > 0
                  ? `${draftTimetable.length} timetable periods drafted`
                  : 'Curriculum / assignments updated'}{' '}
                •{' '}
                {detailedConflicts.length > 0 ? (
                  <span className="text-danger font-bold">
                    ⚠️ {detailedConflicts.length} Conflict(s)
                  </span>
                ) : (
                  <span className="text-success font-bold">✓ Clean (Ready to Commit)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetDraft}
              className="h-8 px-3 rounded-lg text-xs font-semibold border border-secondary-subtle hover:bg-body-secondary text-body transition-colors"
            >
              ↺ Discard
            </button>

            {canManage && (
              <button
                type="button"
                disabled={isProcessing || detailedConflicts.length > 0}
                onClick={handleSaveDraftToDatabase}
                className={`h-8 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                  detailedConflicts.length > 0
                    ? 'bg-secondary text-white cursor-not-allowed opacity-60'
                    : 'bg-success hover:bg-success-emphasis text-white'
                }`}
                title={
                  detailedConflicts.length > 0
                    ? 'Resolve conflicts before saving'
                    : 'Commit assignments and timetable to database'
                }
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Saving...' : '💾 Save to Database'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CARD-BASED SUBJECTS ALLOCATION GRID (WITH INLINE EDITING)               */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-xl border space-y-4 bg-body text-body">
        {/* Card Grid Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-secondary-subtle">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-body">
                Class Curriculum &amp; Faculty Assignments ({filteredAllocations.length} Subjects)
              </h2>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Adjust weekly periods, assign faculty specialists, and set homeroom class teacher
              directly inside each card.
            </p>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or faculty..."
                className="h-8 pl-8 pr-3 text-xs rounded-lg border w-44 bg-body text-body"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center p-0.5 rounded-lg border bg-body-tertiary">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-body-secondary'
                }`}
              >
                All ({unifiedAllocations.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('UNASSIGNED')}
                className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all ${
                  statusFilter === 'UNASSIGNED'
                    ? 'bg-warning text-dark shadow-xs font-bold'
                    : 'text-body-secondary'
                }`}
              >
                Missing ({unassignedCount})
              </button>
            </div>

            {/* Auto-Assign Teachers Button */}
            {canManage && (
              <button
                type="button"
                disabled={isProcessing || unifiedAllocations.length === 0}
                onClick={handleAutoAssignTeachers}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-primary hover:bg-primary-emphasis text-white flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                title="Automatically match certified faculty specialists"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Assign</span>
              </button>
            )}

            {/* Inline Add Subject Toggle */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsInlineAddOpen((prev) => !prev)}
                className="h-8 px-3 rounded-lg text-xs font-bold border border-secondary-subtle hover:bg-body-secondary text-body flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add Subject</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline Add Subject Drawer / Form (NO MODAL) */}
        {isInlineAddOpen && (
          <div className="p-4 rounded-xl border border-secondary-subtle bg-body-tertiary space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-body flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                Add Subject to {currentClass?.name}
              </span>
              <button
                type="button"
                onClick={() => setIsInlineAddOpen(false)}
                className="text-secondary hover:text-body p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Pick existing from catalog */}
              <div className="p-3 rounded-lg border bg-body space-y-2">
                <span className="text-[11px] font-bold text-body block">
                  Option A: Select From School Catalog
                </span>
                <div className="flex gap-2">
                  <select
                    value={selectedCatalogSubjectId}
                    onChange={(e) => setSelectedCatalogSubjectId(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-md border flex-1 bg-body text-body"
                  >
                    <option value="">Choose subject from catalog...</option>
                    {unmappedCatalogSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) • {s.subjectType}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedCatalogSubjectId}
                    onClick={handleAddSubjectFromCatalog}
                    className="h-8 px-3 rounded-md text-xs font-bold bg-primary hover:bg-primary-emphasis text-white disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Option B: Create Custom Subject on the fly */}
              <div className="p-3 rounded-lg border bg-body space-y-2">
                <span className="text-[11px] font-bold text-body block">
                  Option B: Create New Custom Subject
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    placeholder="Subject Name (e.g. Robotics)"
                    className="col-span-2 h-8 px-2.5 text-xs rounded-md border bg-body text-body"
                  />
                  <input
                    type="text"
                    value={customSubjectCode}
                    onChange={(e) => setCustomSubjectCode(e.target.value)}
                    placeholder="Code (ROBO-1)"
                    className="h-8 px-2.5 text-xs rounded-md border bg-body text-body uppercase font-mono"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-secondary">Periods/Wk:</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={customSubjectPeriods}
                      onChange={(e) => setCustomSubjectPeriods(parseInt(e.target.value) || 5)}
                      className="w-14 h-7 px-2 text-xs rounded-md border border-secondary-subtle bg-body text-body text-center font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!customSubjectName.trim()}
                    onClick={handleCreateCustomSubject}
                    className="h-8 px-3 rounded-md text-xs font-bold bg-success hover:bg-success-emphasis text-white disabled:opacity-40"
                  >
                    Create &amp; Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no subjects in class */}
        {unifiedAllocations.length === 0 ? (
          <div className="p-8 rounded-xl border border-secondary-subtle bg-body-secondary text-center space-y-3">
            <BookOpenCheck className="w-10 h-10 text-primary mx-auto" />
            <h3 className="text-sm font-bold text-body">
              No subjects assigned to {currentClass?.name} yet
            </h3>
            <p className="text-xs text-secondary max-w-md mx-auto">
              Add curriculum subjects to this class, or click below to populate the standard school
              curriculum with one click.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleAddStandardCoreSubjects}
                className="h-9 px-4 rounded-lg text-xs font-bold bg-primary hover:bg-primary-emphasis text-white flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-warning" />
                <span>Add Standard Core Subjects</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInlineAddOpen(true)}
                className="h-9 px-4 rounded-lg text-xs font-semibold border border-secondary-subtle hover:bg-body-secondary text-body"
              >
                + Choose from Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredAllocations.map((item) => {
              const hasTeacher = Boolean(item.assignedStaff);
              const isClassTeacher = item.isClassTeacher;
              const { matching, other } = academicService.getEligibleTeachers(
                item.subject.id,
                currentClass?.id,
                activeSchool?.id,
              );
              const isHighlighted = highlightedSubjectId === item.subject.id;

              return (
                <div
                  key={item.subject.id}
                  id={`subject-card-${item.subject.id}`}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all duration-300 ${
                    isHighlighted
                      ? 'ring-2 ring-primary shadow-md scale-[1.01] bg-primary bg-opacity-10 border-primary'
                      : item.hasConflict
                        ? 'border-danger bg-danger bg-opacity-10 shadow-xs'
                        : 'bg-body border hover:border-primary shadow-xs'
                  }`}
                >
                  {/* Card Header: Code, Title, Lab badge, & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border bg-body-secondary border-secondary-subtle text-body">
                          {item.subject.code}
                        </span>
                        {item.subject.subjectType === 'PRACTICAL' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold border bg-info bg-opacity-10 text-info border-info border-opacity-25">
                            Lab
                          </span>
                        )}
                        {isClassTeacher && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold border bg-warning bg-opacity-10 text-warning border-warning border-opacity-25 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-warning text-warning" />
                            Homeroom
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-body truncate">{item.subject.name}</h3>
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectFromClass(item.subject.id)}
                        title={`Remove ${item.subject.name} from class`}
                        className="text-secondary hover:text-danger hover:bg-danger hover:bg-opacity-10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Inline Conflict Alert if subject has conflict */}
                  {item.hasConflict && (
                    <div className="p-2 rounded-lg bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger text-[11px] font-bold flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-danger" />
                        <span className="truncate">{item.conflicts[0].message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.conflicts[0].slotId) {
                            jumpToSlot(item.conflicts[0].slotId);
                          }
                        }}
                        className="text-[10px] underline hover:text-danger whitespace-nowrap"
                      >
                        Slot →
                      </button>
                    </div>
                  )}

                  {/* Inline Controls: Weekly Periods & Assigned Teacher */}
                  <div className="space-y-2.5 pt-1">
                    {/* Weekly Periods Stepper */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary font-medium">Weekly Periods:</span>
                      <div className="flex items-center gap-1.5">
                        {canManage && (
                          <button
                            type="button"
                            disabled={item.targetPeriods <= 1}
                            onClick={() => {
                              if (item.mapping) {
                                handleUpdateWeeklyPeriods(item.mapping.id, item.targetPeriods - 1);
                              }
                            }}
                            className="w-6 h-6 rounded border border-secondary-subtle flex items-center justify-center hover:bg-body-secondary disabled:opacity-30 text-body transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        )}
                        <span className="font-bold font-mono text-sm text-body min-w-[24px] text-center">
                          {item.targetPeriods}
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            disabled={item.targetPeriods >= 15}
                            onClick={() => {
                              if (item.mapping) {
                                handleUpdateWeeklyPeriods(item.mapping.id, item.targetPeriods + 1);
                              }
                            }}
                            className="w-6 h-6 rounded border border-secondary-subtle flex items-center justify-center hover:bg-body-secondary disabled:opacity-30 text-body transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                        <span className="text-[11px] text-secondary font-mono ml-0.5">/wk</span>
                      </div>
                    </div>

                    {/* Assigned Teacher Selector */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-secondary font-medium">Assigned Faculty:</span>
                        {hasTeacher ? (
                          <span className="text-[10px] text-success font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Assigned
                          </span>
                        ) : (
                          <span className="text-[10px] text-warning font-bold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </div>

                      <select
                        value={item.assignedStaff?.id || ''}
                        disabled={!canManage}
                        onChange={(e) =>
                          handleSelectTeacherForSubject(item.subject.id, e.target.value)
                        }
                        className={`w-full h-8 px-2.5 text-xs rounded-lg border font-medium transition-all ${
                          hasTeacher
                            ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success font-semibold'
                            : 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning font-medium'
                        }`}
                      >
                        <option value="">(⚠️ Choose Faculty Teacher...)</option>
                        {matching.length > 0 && (
                          <optgroup label="⭐ Department Specialists">
                            {matching.map((stf) => (
                              <option key={stf.id} value={stf.id}>
                                {stf.firstName} {stf.lastName} (
                                {teacherWorkloadMap.get(stf.id) || 0} hrs/wk)
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {other.length > 0 && (
                          <optgroup label="Other Faculty Staff">
                            {other.map((stf) => (
                              <option key={stf.id} value={stf.id}>
                                {stf.firstName} {stf.lastName} (
                                {teacherWorkloadMap.get(stf.id) || 0} hrs/wk)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Card Bottom: Class Teacher Toggle & Timetable Progress */}
                  <div className="pt-2 border-t border-secondary-subtle flex items-center justify-between text-xs">
                    {/* Class Teacher Toggle */}
                    {hasTeacher ? (
                      <button
                        type="button"
                        disabled={!canManage}
                        onClick={() =>
                          handleToggleClassTeacher(isClassTeacher ? '' : item.assignedStaff!.id)
                        }
                        className={`h-6 px-2.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border transition-all ${
                          isClassTeacher
                            ? 'bg-warning bg-opacity-15 border-warning text-warning'
                            : 'border-secondary-subtle text-secondary hover:text-warning'
                        }`}
                        title={
                          isClassTeacher
                            ? 'Assigned as Class Teacher'
                            : 'Click to make Homeroom Class Teacher'
                        }
                      >
                        <Star
                          className={`w-3 h-3 ${isClassTeacher ? 'text-warning fill-warning' : ''}`}
                        />
                        <span>{isClassTeacher ? 'Class Teacher' : 'Make Class Teacher'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-secondary">Assign faculty first</span>
                    )}

                    {/* Scheduled Periods count */}
                    <span className="text-[11px] font-mono text-secondary">
                      Scheduled: <strong className="text-body">{item.scheduledPeriods}</strong>/
                      {item.targetPeriods}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. WEEKLY TIMETABLE GRID (IN THE SAME STREAMLINED SINGLE VIEW)             */}
      {/* ========================================================================= */}
      {currentSection && (
        <div
          id="timetable-view-section"
          className="p-4 sm:p-5 rounded-xl border space-y-3.5 bg-body text-body"
        >
          {/* Timetable Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-secondary-subtle">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-body">
                  Weekly Schedule — {currentSection.className} Section {currentSection.sectionName}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary bg-opacity-10 text-primary font-semibold">
                  {draftTimetable.length} periods placed
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Click any slot to assign or reassign subjects and teachers. Clashing slots are
                highlighted in red.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  type="button"
                  disabled={isProcessing || unifiedAllocations.length === 0}
                  onClick={handleAutoScheduleTimetable}
                  className="h-8 px-3 rounded-lg text-xs font-bold bg-primary hover:bg-primary-emphasis text-white flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                  title="Generate balanced, conflict-free timetable draft"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Schedule</span>
                </button>
              )}

              {draftTimetable.length > 0 && canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftTimetable([]);
                    setIsDraftDirty(true);
                  }}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-danger hover:bg-danger hover:bg-opacity-10 transition-colors"
                  title="Clear timetable slots in draft"
                >
                  Clear Slots
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="h-8 px-2.5 rounded-lg border border-secondary-subtle text-body hover:bg-body-secondary text-xs font-medium flex items-center gap-1"
                title="Print schedule"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Quick Slot Assign Popover if active */}
          {activeSlotEdit && (
            <div className="p-3 rounded-xl border border-secondary-subtle bg-body-tertiary flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-body block">
                  Assign Slot: {activeSlotEdit.day} • {activeSlotEdit.periodName} (
                  {activeSlotEdit.time})
                </span>
                <span className="text-[11px] text-secondary">
                  Select a subject to place in this time period:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAssignSlot(e.target.value);
                  }}
                  defaultValue=""
                  className="h-8 px-2.5 text-xs rounded-md border bg-body text-body"
                >
                  <option value="">Select subject to place...</option>
                  {unifiedAllocations.map((u) => (
                    <option key={u.subject.id} value={u.subject.id}>
                      {u.subject.name} (
                      {u.assignedStaff
                        ? `${u.assignedStaff.firstName} ${u.assignedStaff.lastName}`
                        : 'Unassigned'}
                      )
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setActiveSlotEdit(null)}
                  className="h-8 px-2.5 rounded-md text-xs text-secondary hover:text-body"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Timetable Matrix Grid */}
          <div className="overflow-x-auto rounded-xl border border-secondary-subtle">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[11px] uppercase font-bold border-b border-secondary-subtle bg-body-secondary text-secondary">
                <tr>
                  <th className="px-3.5 py-2.5 w-28 border-r border-secondary-subtle">Day</th>
                  {regularPeriods.map((p) => (
                    <th
                      key={p.id}
                      className="px-2.5 py-2 text-center border-r border-secondary-subtle min-w-[125px]"
                    >
                      <div>{p.name}</div>
                      <div className="text-[10px] font-mono font-normal opacity-70">
                        {p.startTime} - {p.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-subtle bg-body">
                {activeDays.map((day) => (
                  <tr key={day} className="hover:bg-body-secondary transition-colors">
                    {/* Day Column */}
                    <td className="px-3.5 py-2.5 font-bold text-body border-r border-secondary-subtle bg-body-tertiary">
                      {day.substring(0, 3)}
                    </td>

                    {/* Period Slot Columns */}
                    {regularPeriods.map((period) => {
                      const entry = draftTimetable.find(
                        (t) => t.dayOfWeek === day && t.periodId === period.id,
                      );
                      const isSlotClashing =
                        entry && detailedConflicts.some((c) => c.slotId === entry.id);
                      const isHighlighted = entry && highlightedSlotId === entry.id;

                      return (
                        <td
                          key={period.id}
                          id={entry ? `timetable-slot-${entry.id}` : undefined}
                          className={`p-1.5 border-r border-secondary-subtle text-center relative group transition-all ${
                            isHighlighted ? 'ring-2 ring-primary bg-primary bg-opacity-10' : ''
                          }`}
                        >
                          {entry ? (
                            <div
                              className={`p-2 rounded-lg border text-left space-y-1 relative transition-all ${
                                isSlotClashing
                                  ? 'bg-danger bg-opacity-10 border-danger text-danger ring-1 ring-danger'
                                  : getSubjectColor(entry.subjectName)
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs truncate">
                                  {entry.subjectName}
                                </span>
                                {isSlotClashing && (
                                  <AlertTriangle className="w-3 h-3 text-danger flex-shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] opacity-80 truncate">
                                {entry.teacherName || 'Unassigned'}
                              </div>
                              <div className="text-[9px] font-mono opacity-60">
                                {entry.room || 'Room 101'}
                              </div>

                              {/* Hover controls to clear or change slot */}
                              {canManage && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-body rounded p-0.5 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleClearSingleSlot(entry.id)}
                                    title="Clear slot"
                                    className="text-danger hover:opacity-80 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-14 flex items-center justify-center">
                              {canManage ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveSlotEdit({
                                      day,
                                      periodId: period.id,
                                      periodName: period.name,
                                      time: `${period.startTime} - ${period.endTime}`,
                                    })
                                  }
                                  className="text-[11px] text-secondary hover:text-primary flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Assign</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-secondary opacity-50">—</span>
                              )}
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
    </div>
  );
};
