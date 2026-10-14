import React, { useState, useEffect, useMemo } from 'react';
import { Nav, Modal, Button, Spinner, Badge } from 'react-bootstrap';
import {
  BookOpenCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  GraduationCap,
  Layers,
  Clock,
  Award,
  Sparkles,
  Copy,
  Check,
  X,
  ArrowRight,
  Minus,
  UserCheck,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
  BookMarked,
  BookOpen,
  CalendarDays,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import {
  useGetSubjectsQuery,
  useGetClassesQuery,
  useGetSectionsQuery,
  useGetCurriculumQuery,
  useGetTeacherAssignmentsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
} from '@/store/academic';
import { useGetTeachersQuery } from '@/store/teachers';
import { ActionButton, ChipCard, ConfirmModal, TopHeader } from '@/components/common';
import {
  SubjectItem,
  ClassSubjectItem,
  ClassItem,
  AcademicYearSectionItem,
  TeacherAssignmentItem,
} from '@/types';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const CurriculumManagementView: React.FC = () => {
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();

  const isDark = theme === 'dark';
  const canManage = hasPermission('academics.curriculum.edit');

  // Main Tab: 'mappings' (One Screen to Map Subjects to Class) or 'catalog' (Master Subjects)
  const [activeTab, setActiveTab] = useState<'mappings' | 'catalog'>('mappings');

  // Academic Year Scoping for Curriculum Mapping
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(
    activeAcademicYear?.id || '',
  );

  // Core Data State (persisted server state)
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignmentItem[]>([]);

  // The Target Class being configured in the One-Screen Mapper
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Draft / staged working state for the currently selected class (not saved until Save button clicked)
  const [draftClassMappings, setDraftClassMappings] = useState<ClassSubjectItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Unmap confirmation modal state
  const [confirmUnmapTarget, setConfirmUnmapTarget] = useState<{
    subject?: SubjectItem;
    isAll?: boolean;
  } | null>(null);

  // Navigation guard modal state (when user attempts to switch class/year/tab with unsaved changes)
  const [pendingNavigation, setPendingNavigation] = useState<{
    type: 'class' | 'academicYear' | 'tab';
    nextId: string;
  } | null>(null);

  // Syllabus inline edit state
  const [editingSyllabusId, setEditingSyllabusId] = useState<string | null>(null);
  const [tempSyllabusText, setTempSyllabusText] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [mappingFilter, setMappingFilter] = useState<'ALL' | 'MAPPED' | 'UNMAPPED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Copy Curriculum State
  const [sourceCopyClassId, setSourceCopyClassId] = useState<string>('');

  // Modals for Subject Master
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  // Subject Form
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    subjectType: 'THEORY' as SubjectItem['subjectType'],
    credits: 3,
    isElective: false,
  });

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync activeAcademicYear to selectedAcademicYearId
  useEffect(() => {
    if (activeAcademicYear?.id && !selectedAcademicYearId) {
      setSelectedAcademicYearId(activeAcademicYear.id);
    }
  }, [activeAcademicYear]);

  // Selected Class details
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0] || null;
  }, [classes, selectedClassId]);

  // Sections that belong to this class
  const currentClassSections = useMemo(() => {
    if (!currentClass) return [];
    return sections.filter((s) => s.classId === currentClass.id);
  }, [sections, currentClass]);

  // Server persisted mappings for the currently selected class (scoped to active/selected academic session)
  const serverClassMappings = useMemo(() => {
    if (!currentClass) return [];
    const yearId = selectedAcademicYearId || activeAcademicYear?.id;
    return classSubjects.filter(
      (cs) =>
        cs.classId === currentClass.id &&
        (!yearId || !cs.academicYearId || cs.academicYearId === yearId),
    );
  }, [classSubjects, currentClass, selectedAcademicYearId, activeAcademicYear]);

  // Draft working mappings for currently selected class
  const currentClassMappings = draftClassMappings;

  // Track pending / staged changes between server state and draft state
  const pendingChanges = useMemo(() => {
    if (!currentClass) return { added: [], removed: [], updated: [], count: 0, isDirty: false };
    const serverMap = new Map(serverClassMappings.map((cs) => [cs.subjectId, cs]));
    const draftMap = new Map(draftClassMappings.map((cs) => [cs.subjectId, cs]));

    const added: ClassSubjectItem[] = [];
    const removed: ClassSubjectItem[] = [];
    const updated: { item: ClassSubjectItem; original: ClassSubjectItem }[] = [];

    draftClassMappings.forEach((draftItem) => {
      const original = serverMap.get(draftItem.subjectId);
      if (!original) {
        added.push(draftItem);
      } else {
        const periodsChanged = (draftItem.weeklyPeriods || 0) !== (original.weeklyPeriods || 0);
        const mandatoryChanged = Boolean(draftItem.isMandatory) !== Boolean(original.isMandatory);
        const syllabusChanged =
          (draftItem.syllabusName || '').trim() !== (original.syllabusName || '').trim();
        if (periodsChanged || mandatoryChanged || syllabusChanged) {
          updated.push({ item: draftItem, original });
        }
      }
    });

    serverClassMappings.forEach((original) => {
      if (!draftMap.has(original.subjectId)) {
        removed.push(original);
      }
    });

    const count = added.length + removed.length + updated.length;
    return { added, removed, updated, count, isDirty: count > 0 };
  }, [currentClass, serverClassMappings, draftClassMappings]);

  // Map of subjectId -> ClassSubjectItem for this class (derived from draft)
  const mappedSubjectsMap = useMemo(() => {
    const map = new Map<string, ClassSubjectItem>();
    draftClassMappings.forEach((cs) => {
      map.set(cs.subjectId, cs);
    });
    return map;
  }, [draftClassMappings]);

  // RTK Query: Academic data queries
  const {
    data: rtkSubjectsData,
    refetch: refetchSubjects,
  } = useGetSubjectsQuery(activeSchool?.id ? { schoolId: activeSchool.id } : undefined, {
    skip: !activeSchool,
  });
  const {
    data: rtkClassesData,
    refetch: refetchClasses,
  } = useGetClassesQuery(activeSchool?.id ? { schoolId: activeSchool.id } : undefined, {
    skip: !activeSchool,
  });
  const {
    data: rtkSectionsData,
    refetch: refetchSections,
  } = useGetSectionsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: selectedAcademicYearId || activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const {
    data: rtkCurriculumData,
    refetch: refetchCurriculum,
  } = useGetCurriculumQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: selectedAcademicYearId || activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const {
    data: rtkTeacherAssignmentsData,
    refetch: refetchTeacherAssignments,
  } = useGetTeacherAssignmentsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: selectedAcademicYearId || activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkTeachersData } = useGetTeachersQuery(undefined, { skip: !activeSchool });

  const [createSubjectMutation] = useCreateSubjectMutation();
  const [updateSubjectMutation] = useUpdateSubjectMutation();
  const [deleteSubjectMutation] = useDeleteSubjectMutation();
  const [createCurriculumMutation] = useCreateCurriculumMutation();
  const [updateCurriculumMutation] = useUpdateCurriculumMutation();
  const [deleteCurriculumMutation] = useDeleteCurriculumMutation();

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkSubjectsData) {
      const list = Array.isArray(rtkSubjectsData?.data)
        ? rtkSubjectsData.data
        : Array.isArray(rtkSubjectsData)
          ? rtkSubjectsData
          : [];
      if (list.length > 0) setSubjects(list);
    }
  }, [rtkSubjectsData]);

  useEffect(() => {
    if (rtkClassesData) {
      const list = Array.isArray(rtkClassesData?.data)
        ? rtkClassesData.data
        : Array.isArray(rtkClassesData)
          ? rtkClassesData
          : [];
      if (list.length > 0) {
        setClasses(list);
        if (!selectedClassId || !list.some((c: any) => c.id === selectedClassId)) {
          setSelectedClassId(list[0].id);
        }
      }
    }
  }, [rtkClassesData, selectedClassId]);

  useEffect(() => {
    if (rtkSectionsData) {
      const list = Array.isArray(rtkSectionsData?.data)
        ? rtkSectionsData.data
        : Array.isArray(rtkSectionsData)
          ? rtkSectionsData
          : [];
      if (list.length > 0) setSections(list);
    }
  }, [rtkSectionsData]);

  useEffect(() => {
    if (rtkCurriculumData) {
      const list = Array.isArray(rtkCurriculumData?.data)
        ? rtkCurriculumData.data
        : Array.isArray(rtkCurriculumData)
          ? rtkCurriculumData
          : [];
      if (list.length > 0) {
        setClassSubjects(list);
        const yearId = selectedAcademicYearId || activeAcademicYear?.id;
        const targetMappings = list.filter(
          (c: any) =>
            c.classId === selectedClassId &&
            (!yearId || !c.academicYearId || c.academicYearId === yearId),
        );
        setDraftClassMappings(targetMappings);
      }
    }
  }, [rtkCurriculumData, selectedClassId, selectedAcademicYearId, activeAcademicYear]);

  useEffect(() => {
    if (rtkTeacherAssignmentsData) {
      const list = Array.isArray(rtkTeacherAssignmentsData?.data)
        ? rtkTeacherAssignmentsData.data
        : Array.isArray(rtkTeacherAssignmentsData)
          ? rtkTeacherAssignmentsData
          : [];
      if (list.length > 0) setTeacherAssignments(list);
    }
  }, [rtkTeacherAssignmentsData]);

  const refreshData = async () => {
    if (!activeSchool) return;
    try {
      refetchSubjects();
      refetchClasses();
      refetchSections();
      refetchCurriculum();
      refetchTeacherAssignments();
    } catch (e) {
      console.error('Failed to load curriculum data', e);
    }
  };

  // Navigation handlers with dirty checks
  const handleSelectClass = (classId: string) => {
    if (classId === selectedClassId) return;
    if (pendingChanges.isDirty) {
      setPendingNavigation({ type: 'class', nextId: classId });
    } else {
      setSelectedClassId(classId);
      const yearId = selectedAcademicYearId || activeAcademicYear?.id;
      const newMappings = classSubjects.filter(
        (cs) =>
          cs.classId === classId && (!yearId || !cs.academicYearId || cs.academicYearId === yearId),
      );
      setDraftClassMappings(newMappings);
    }
  };

  const handleSelectAcademicYear = (yearId: string) => {
    if (yearId === selectedAcademicYearId) return;
    if (pendingChanges.isDirty) {
      setPendingNavigation({ type: 'academicYear', nextId: yearId });
    } else {
      setSelectedAcademicYearId(yearId);
    }
  };

  const handleSelectTab = (tab: 'mappings' | 'catalog') => {
    if (tab === activeTab) return;
    if (pendingChanges.isDirty) {
      setPendingNavigation({ type: 'tab', nextId: tab });
    } else {
      setActiveTab(tab);
    }
  };

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      if (pendingNavigation.type === 'class') {
        setSelectedClassId(pendingNavigation.nextId);
        const yearId = selectedAcademicYearId || activeAcademicYear?.id;
        const newMappings = classSubjects.filter(
          (cs) =>
            cs.classId === pendingNavigation.nextId &&
            (!yearId || !cs.academicYearId || cs.academicYearId === yearId),
        );
        setDraftClassMappings(newMappings);
      } else if (pendingNavigation.type === 'academicYear') {
        setSelectedAcademicYearId(pendingNavigation.nextId);
      } else if (pendingNavigation.type === 'tab') {
        setActiveTab(pendingNavigation.nextId as any);
      }
      setPendingNavigation(null);
    }
  };

  // Map of subjectId -> teacher names for this class
  const subjectTeacherMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const sectionIds = new Set(currentClassSections.map((s) => s.id));

    teacherAssignments.forEach((asg) => {
      if (asg.subjectId && sectionIds.has(asg.academicYearSectionId) && asg.isActive) {
        const staffList: any[] = rtkTeachersData?.teachers || [];
        const staff = staffList.find((stf) => stf.id === asg.staffId || stf.teacherId === asg.staffId);
        const sec = sections.find((s) => s.id === asg.academicYearSectionId);
        const name = staff
          ? `${staff.firstName} ${staff.lastName || ''}`.trim() + ` (${sec?.sectionName || sec?.name || 'Section'})`
          : 'Faculty Assigned';

        const existing = map.get(asg.subjectId) || [];
        existing.push(name);
        map.set(asg.subjectId, existing);
      }
    });

    return map;
  }, [currentClassSections, teacherAssignments, activeSchool, sections, rtkTeachersData]);

  // Real-time Class Curriculum Statistics
  const classStats = useMemo(() => {
    const totalMapped = currentClassMappings.length;
    const totalPeriods = currentClassMappings.reduce((sum, cs) => sum + (cs.weeklyPeriods || 0), 0);
    const compulsoryCount = currentClassMappings.filter((cs) => cs.isMandatory).length;
    const electiveCount = totalMapped - compulsoryCount;
    const totalCredits = currentClassMappings.reduce((sum, cs) => {
      const sub = subjects.find((s) => s.id === cs.subjectId);
      return sum + (sub?.credits || 0);
    }, 0);

    return {
      totalMapped,
      totalPeriods,
      compulsoryCount,
      electiveCount,
      totalCredits,
      catalogTotal: subjects.length,
    };
  }, [currentClassMappings, subjects]);

  // Filtered subjects for the mapping view
  const filteredCatalogForMapping = useMemo(() => {
    return subjects.filter((sub) => {
      const isMapped = mappedSubjectsMap.has(sub.id);

      if (mappingFilter === 'MAPPED' && !isMapped) return false;
      if (mappingFilter === 'UNMAPPED' && isMapped) return false;

      if (typeFilter !== 'ALL' && sub.subjectType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
      }

      return true;
    });
  }, [subjects, mappedSubjectsMap, mappingFilter, typeFilter, searchQuery]);

  // Filtered subjects for the catalog tab
  const filteredCatalog = useMemo(() => {
    return subjects.filter((sub) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [subjects, searchQuery]);

  // =========================================================================
  // SINGLE-SCREEN MAPPER ACTIONS (STAGED DRAFT MODEL - PERSISTED ON SAVE CLICK)
  // =========================================================================

  // Discard all unsaved changes for the current class
  const handleDiscardChanges = () => {
    setDraftClassMappings(serverClassMappings);
    toast.info(`Discarded all unsaved changes for ${currentClass?.name || 'class'}.`);
  };

  // 1. Map a single subject to the selected class (staged in draft)
  const handleMapSubject = (
    subject: SubjectItem,
    weeklyPeriods = 5,
    isMandatory = true,
    syllabusName?: string,
  ) => {
    if (!activeSchool || !currentClass || !canManage) return;
    const yearId = selectedAcademicYearId || activeAcademicYear?.id;

    setDraftClassMappings((prev) => {
      if (prev.some((cs) => cs.subjectId === subject.id)) return prev;
      const newItem: ClassSubjectItem = {
        id: `draft-${subject.id}-${Date.now()}`,
        schoolId: activeSchool.id,
        academicYearId: yearId,
        classId: currentClass.id,
        className: currentClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        isMandatory,
        weeklyPeriods,
        syllabusName: syllabusName || `${currentClass.name} ${subject.name} Syllabus`,
      };
      return [...prev, newItem];
    });

    toast.info(`Staged "${subject.name}" for mapping. Click Save Changes to apply.`);
  };

  // 2. Request unmap a single subject from the selected class (requires confirmation first)
  const handleRequestUnmapSubject = (subject: SubjectItem) => {
    if (!activeSchool || !currentClass || !canManage) return;

    // Check teacher assignment warning
    const assignedTeachers = subjectTeacherMap.get(subject.id);
    if (assignedTeachers && assignedTeachers.length > 0) {
      toast.error(
        `Cannot unmap "${subject.name}" because faculty are actively assigned: ${assignedTeachers.join(', ')}. Please unassign faculty first in Teacher Assignments.`,
        'Faculty Assigned',
      );
      return;
    }

    // Open confirmation modal
    setConfirmUnmapTarget({ subject });
  };

  // 3. Confirm unmap (called after confirmation modal approval)
  const handleConfirmUnmap = () => {
    if (!confirmUnmapTarget) return;

    if (confirmUnmapTarget.isAll) {
      let removedCount = 0;
      setDraftClassMappings((prev) =>
        prev.filter((cs) => {
          const assignedTeachers = subjectTeacherMap.get(cs.subjectId);
          if (assignedTeachers && assignedTeachers.length > 0) return true;
          removedCount++;
          return false;
        }),
      );
      setConfirmUnmapTarget(null);
      toast.info(`Staged eligible subjects for removal. Click Save Changes to apply.`);
      return;
    }

    if (confirmUnmapTarget.subject) {
      const sub = confirmUnmapTarget.subject;
      setDraftClassMappings((prev) => prev.filter((cs) => cs.subjectId !== sub.id));
      setConfirmUnmapTarget(null);
      toast.info(`Staged "${sub.name}" for removal. Click Save Changes to apply.`);
    }
  };

  // 4. Toggle mapping status
  const handleToggleMapping = (subject: SubjectItem) => {
    const isMapped = mappedSubjectsMap.has(subject.id);
    if (isMapped) {
      handleRequestUnmapSubject(subject);
    } else {
      handleMapSubject(subject, 5, !subject.isElective);
    }
  };

  // 5. Update weekly periods in draft
  const handleUpdatePeriods = (subjectId: string, newPeriods: number) => {
    if (!canManage) return;
    const clamped = Math.max(1, Math.min(25, newPeriods));
    setDraftClassMappings((prev) =>
      prev.map((cs) => (cs.subjectId === subjectId ? { ...cs, weeklyPeriods: clamped } : cs)),
    );
  };

  // 6. Toggle compulsory / elective in draft
  const handleToggleCompulsory = (subjectId: string) => {
    if (!canManage) return;
    setDraftClassMappings((prev) =>
      prev.map((cs) => (cs.subjectId === subjectId ? { ...cs, isMandatory: !cs.isMandatory } : cs)),
    );
  };

  // 7. Update syllabus track title in draft
  const handleUpdateSyllabus = (subjectId: string, syllabusName: string) => {
    if (!canManage) return;
    const mapping = mappedSubjectsMap.get(subjectId);
    setDraftClassMappings((prev) =>
      prev.map((cs) =>
        cs.subjectId === subjectId ? { ...cs, syllabusName: syllabusName.trim() } : cs,
      ),
    );
    toast.info(
      `Updated syllabus track for ${mapping?.subjectName || 'subject'} in draft. Click Save Changes to apply.`,
    );
  };

  // 8. Batch map all filtered subjects in draft
  const handleBatchMapFiltered = () => {
    if (!activeSchool || !currentClass || !canManage) return;

    const unmappedVisible = filteredCatalogForMapping.filter((s) => !mappedSubjectsMap.has(s.id));
    if (unmappedVisible.length === 0) {
      toast.warning('All visible subjects are already mapped to this class.');
      return;
    }

    const yearId = selectedAcademicYearId || activeAcademicYear?.id;
    const newItems: ClassSubjectItem[] = unmappedVisible.map((sub) => ({
      id: `draft-${sub.id}-${Date.now()}`,
      schoolId: activeSchool.id,
      academicYearId: yearId,
      classId: currentClass.id,
      className: currentClass.name,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      isMandatory: !sub.isElective,
      weeklyPeriods: 5,
      syllabusName: `${currentClass.name} ${sub.name} Syllabus`,
    }));

    setDraftClassMappings((prev) => [...prev, ...newItems]);
    toast.info(`Staged ${newItems.length} subject(s) to map. Click Save Changes to apply.`);
  };

  // 9. Unmap all from class (opens confirmation modal)
  const handleUnmapAllFromClass = () => {
    if (!activeSchool || !currentClass || !canManage) return;
    if (draftClassMappings.length === 0) return;
    setConfirmUnmapTarget({ isAll: true });
  };

  // 10. Persist all staged changes to the database (THE SAVE BUTTON ACTION)
  const handleSaveAllChanges = async (): Promise<boolean> => {
    if (!activeSchool || !currentClass || !canManage) return false;
    if (!pendingChanges.isDirty) {
      toast.info('No pending changes to save.');
      return true;
    }

    setIsSaving(true);
    const yearId = selectedAcademicYearId || activeAcademicYear?.id;

    try {
      const userMeta = {
        userId: user?.id || 'unknown',
        userName: user?.fullName || 'Administrator',
      };

      // A. Process Removed Items
      for (const item of pendingChanges.removed) {
        const assignedTeachers = subjectTeacherMap.get(item.subjectId);
        if (assignedTeachers && assignedTeachers.length > 0) continue;
        await deleteCurriculumMutation(item.id).unwrap();
      }

      // B. Process Added Items
      for (const item of pendingChanges.added) {
        await createCurriculumMutation({
          classId: currentClass.id,
          subjectId: item.subjectId,
          academicYearId: yearId,
          syllabusName:
            item.syllabusName || `${currentClass.name} ${item.subjectName || ''} Syllabus`,
          isMandatory: item.isMandatory !== undefined ? item.isMandatory : true,
          weeklyPeriods: item.weeklyPeriods || 5,
        }).unwrap();
      }

      // C. Process Updated Items (Periods, Compulsory, Syllabus)
      for (const { item, original } of pendingChanges.updated) {
        await updateCurriculumMutation({
          id: original.id,
          data: {
            weeklyPeriods: item.weeklyPeriods,
            isMandatory: item.isMandatory,
            syllabusName: (item.syllabusName || '').trim(),
            academicYearId: yearId,
          },
        }).unwrap();
      }

      toast.success(
        `Successfully saved all curriculum changes for ${currentClass.name} (${pendingChanges.count} change${pendingChanges.count === 1 ? '' : 's'}).`,
        'Curriculum Saved',
      );

      // Refresh data from server and synchronize draft
      await refreshData();
      return true;
    } catch (err: any) {
      console.error('Failed to save curriculum changes', err);
      toast.error(
        getApiErrorMessage(err, 'Failed to save curriculum changes. Please try again.'),
        'Save Error',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 11. Copy curriculum from another class (scoped to academic year, staged in draft)
  const handleCopyCurriculum = () => {
    if (!activeSchool || !currentClass || !sourceCopyClassId || !canManage) return;

    if (sourceCopyClassId === currentClass.id) {
      toast.error('Source and target class cannot be the same.');
      return;
    }

    const sourceClass = classes.find((c) => c.id === sourceCopyClassId);
    const yearId = selectedAcademicYearId || activeAcademicYear?.id;

    try {
      // 1. Correctly filter source subjects for the selected academic year
      const sourceMappings = classSubjects.filter(
        (cs) =>
          cs.classId === sourceCopyClassId &&
          (!yearId || !cs.academicYearId || cs.academicYearId === yearId),
      );

      if (sourceMappings.length === 0) {
        toast.warning(
          `Source class "${sourceClass?.name || 'selected'}" has no mapped subjects for the selected academic year.`,
        );
        return;
      }

      // 2. Prevent duplication: check existing subjects in the draft/staging state
      const existingSubjectIds = new Set(draftClassMappings.map((cs) => cs.subjectId));

      // 3. Build new staged items, ensuring no duplicates within source or target
      const subjectsToStage: ClassSubjectItem[] = [];
      const seenSubjectIds = new Set<string>();

      for (const src of sourceMappings) {
        if (existingSubjectIds.has(src.subjectId) || seenSubjectIds.has(src.subjectId)) {
          continue;
        }
        seenSubjectIds.add(src.subjectId);

        const subCatalogItem = subjects.find((s) => s.id === src.subjectId);
        const subjectName = src.subjectName || subCatalogItem?.name || 'Subject';
        const subjectCode = src.subjectCode || subCatalogItem?.code || 'UNKNOWN';
        const isMandatory =
          src.isMandatory !== undefined ? src.isMandatory : !subCatalogItem?.isElective;
        const weeklyPeriods = src.weeklyPeriods || 5;
        const syllabusName = `${currentClass.name} ${subjectName} Syllabus`;

        subjectsToStage.push({
          id: `draft-${src.subjectId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          schoolId: activeSchool.id,
          academicYearId: yearId,
          classId: currentClass.id,
          className: currentClass.name,
          subjectId: src.subjectId,
          subjectName,
          subjectCode,
          subjectType: src.subjectType || subCatalogItem?.subjectType || 'THEORY',
          isMandatory,
          weeklyPeriods,
          syllabusName,
        });
      }

      if (subjectsToStage.length === 0) {
        toast.info(
          `All subjects from "${sourceClass?.name || 'class'}" are already mapped in ${currentClass.name}.`,
        );
        setSourceCopyClassId('');
        return;
      }

      // 4. Sync with staging architecture
      setDraftClassMappings((prev) => [...prev, ...subjectsToStage]);
      setSourceCopyClassId('');
      toast.success(
        `Staged ${subjectsToStage.length} subject(s) copied from "${sourceClass?.name || 'class'}". Click "Save Changes" to apply.`,
        'Curriculum Copied',
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to copy curriculum.', 'Copy Error');
    }
  };

  // =========================================================================
  // SUBJECT MASTER CRUD
  // =========================================================================

  const handleOpenCreateSubject = () => {
    setSubjectForm({
      name: '',
      code: '',
      subjectType: 'THEORY',
      credits: 4,
      isElective: false,
    });
    setFeedback(null);
    setIsCreateSubjectOpen(true);
  };

  const handleOpenEditSubject = (sub: SubjectItem) => {
    setSelectedSubject(sub);
    setSubjectForm({
      name: sub.name,
      code: sub.code,
      subjectType: sub.subjectType,
      credits: sub.credits,
      isElective: sub.isElective,
    });
    setFeedback(null);
    setIsEditSubjectOpen(true);
  };

  const handleCreateSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      const created = await createSubjectMutation({
        name: subjectForm.name,
        code: subjectForm.code.toUpperCase(),
        subjectType: subjectForm.subjectType,
        credits: Number(subjectForm.credits),
        isElective: subjectForm.isElective,
      }).unwrap();

      setFeedback({
        type: 'success',
        message: `Subject "${created.name || subjectForm.name}" created.`,
      });
      setIsCreateSubjectOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to create subject') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !selectedSubject || !canManage) return;

    setIsProcessing(true);
    setFeedback(null);
    try {
      await updateSubjectMutation({
        id: selectedSubject.id,
        data: {
          name: subjectForm.name,
          code: subjectForm.code.toUpperCase(),
          subjectType: subjectForm.subjectType,
          credits: Number(subjectForm.credits),
          isElective: subjectForm.isElective,
        },
      }).unwrap();

      setFeedback({
        type: 'success',
        message: `Subject "${subjectForm.name}" updated.`,
      });
      setIsEditSubjectOpen(false);
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to update subject') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSubject = async (sub: SubjectItem) => {
    if (!activeSchool || !canManage) return;
    const confirmed = window.confirm(
      `Delete subject "${sub.name}" (${sub.code}) from curriculum catalog?`,
    );
    if (!confirmed) return;

    setFeedback(null);
    try {
      await deleteSubjectMutation(sub.id).unwrap();
      setFeedback({
        type: 'success',
        message: `Subject "${sub.name}" deleted.`,
      });
      await refreshData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: getApiErrorMessage(err, 'Failed to delete subject') });
    }
  };

  const tabActions = [
    {
      name: 'Map to Class',
      action: () => handleSelectTab('mappings'),
      variant: activeTab === 'mappings' ? 'primary' : 'outline-secondary',
    },
    {
      name: `Subject Catalog (${subjects.length})`,
      action: () => handleSelectTab('catalog'),
      variant: activeTab === 'catalog' ? 'primary' : 'outline-secondary',
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Top Header Bar */}
      <TopHeader
        title="Subject & Curriculum Management"
        icon={BookOpenCheck}
        subtitle="Class + Subject + Syllabus mapping scoped to Academic Year. Reusable Master Catalog."
        badges={[
          { bg: 'primary', label: activeSchool?.code || 'School' },
          { bg: 'info', label: activeAcademicYear?.code || 'Active Session' },
        ]}
        actions={[...tabActions]}
        rightContent={
          activeTab === 'mappings' && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedAcademicYearId}
                onChange={(e) => handleSelectAcademicYear(e.target.value)}
                className="h-8 px-2.5 text-xs font-medium rounded-md border bg-body text-body focus:ring-1 focus:ring-primary"
              >
                {(activeSchool?.academicYears || []).map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.isCurrent ? '(Active)' : ''}
                  </option>
                ))}
                {(!activeSchool?.academicYears || activeSchool.academicYears.length === 0) && (
                  <option value={activeAcademicYear?.id || ''}>
                    {activeAcademicYear?.name || 'Default Session'}
                  </option>
                )}
              </select>
            </div>
          )
        }
      />
      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-2.5 rounded-md flex items-center justify-between text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'
              : 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
      {/* SCREEN 1: DEDICATED ONE-SCREEN CLASS CURRICULUM MAPPER                     */}
      {/* ========================================================================= */}
      {activeTab === 'mappings' && (
        <div className="space-y-3.5">
          {/* Target Class Selection Ribbon */}
          <div className="p-3 rounded-md border space-y-2.5 bg-body text-body">
            {/* Class & Session Selector Header */}

            {/* Quick Class Horizontal Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {classes.map((c) => {
                const isSelected = c.id === currentClass?.id;
                const count = isSelected
                  ? currentClassMappings.length
                  : classSubjects.filter(
                      (cs) =>
                        cs.classId === c.id &&
                        (!selectedAcademicYearId ||
                          !cs.academicYearId ||
                          cs.academicYearId === selectedAcademicYearId),
                    ).length;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClass(c.id)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-primary border-primary text-white font-semibold shadow-xs'
                        : 'bg-body-secondary border-secondary-subtle text-body hover:bg-body-tertiary'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                        isSelected
                          ? 'bg-white bg-opacity-25 text-white'
                          : 'bg-body-secondary text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                    {isSelected && pendingChanges.isDirty && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-warning"
                        title="Unsaved changes in this class"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current Class Overview KPI Banner */}
            {currentClass && (
              <div className="p-2.5 rounded-md border border-secondary-subtle bg-body-tertiary grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-secondary block">
                    Current Class
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-body">{currentClass.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-body-secondary text-body-secondary">
                      {currentClass.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary block mt-0.5">
                    {currentClassSections.length > 0
                      ? `${currentClassSections.length} Sections: ${currentClassSections.map((s) => s.sectionName || s.name).join(', ')}`
                      : 'No sections configured'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-secondary block">
                    Mapped Subjects
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-body">
                      {classStats.totalMapped} / {classStats.catalogTotal}
                    </span>
                    <span className="text-[10px] text-secondary">
                      ({Math.round((classStats.totalMapped / (classStats.catalogTotal || 1)) * 100)}
                      %)
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary block mt-0.5">
                    {classStats.compulsoryCount} Compulsory • {classStats.electiveCount} Elective
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-secondary block">
                    Weekly Teaching Load
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-body">
                      {classStats.totalPeriods} periods / wk
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                        classStats.totalPeriods >= 28 && classStats.totalPeriods <= 42
                          ? 'bg-success bg-opacity-10 text-success'
                          : classStats.totalPeriods === 0
                            ? 'bg-warning bg-opacity-10 text-warning'
                            : 'bg-primary bg-opacity-10 text-primary'
                      }`}
                    >
                      {classStats.totalPeriods >= 28 && classStats.totalPeriods <= 42
                        ? 'Standard'
                        : classStats.totalPeriods === 0
                          ? 'Empty'
                          : 'Adjustable'}
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary block mt-0.5">
                    Avg {(classStats.totalPeriods / 5).toFixed(1)} periods / day (5-day week)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-secondary block">
                    Total Credits
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-body">
                      {classStats.totalCredits} Units
                    </span>
                    <Award className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <span className="text-[10px] text-secondary block mt-0.5">
                    Accredited Coursework
                  </span>
                </div>

                {/* Quick Copy Feature */}
                <div className="col-span-2 sm:col-span-4 lg:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 sm:border-l sm:pl-3 border-secondary-subtle flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-semibold text-secondary block mb-1">
                    Copy Curriculum
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      value={sourceCopyClassId}
                      onChange={(e) => setSourceCopyClassId(e.target.value)}
                      disabled={!canManage || isProcessing}
                      className="h-7 px-1.5 text-[11px] rounded border w-full bg-body text-body"
                    >
                      <option value="">From Class...</option>
                      {classes
                        .filter((c) => c.id !== currentClass.id)
                        .map((c) => {
                          const currentYearId = selectedAcademicYearId || activeAcademicYear?.id;
                          const count = classSubjects.filter(
                            (cs) =>
                              cs.classId === c.id &&
                              (!currentYearId ||
                                !cs.academicYearId ||
                                cs.academicYearId === currentYearId),
                          ).length;
                          return (
                            <option key={c.id} value={c.id} disabled={count === 0}>
                              {c.name} ({count} subs)
                            </option>
                          );
                        })}
                    </select>
                    <ActionButton
                      action={handleCopyCurriculum}
                      disabled={!sourceCopyClassId || !canManage}
                      icon={Copy}
                      name="Copy"
                      variant="primary"
                      title="Copy all mapped subjects from selected class into this class"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search, Filter & Bulk Operations Bar */}
          <div className="p-2.5 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-body text-body">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-secondary" />
                <input
                  type="text"
                  placeholder={`Search subjects for ${currentClass?.name || 'class'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border transition-colors bg-body text-body"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="inline-flex p-0.5 rounded-md border bg-body-tertiary">
                <button
                  type="button"
                  onClick={() => setMappingFilter('ALL')}
                  className={`h-6 px-2 text-[11px] font-medium rounded transition-colors ${
                    mappingFilter === 'ALL'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-body-secondary hover:text-body'
                  }`}
                >
                  All ({subjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMappingFilter('MAPPED')}
                  className={`h-6 px-2 text-[11px] font-medium rounded transition-colors ${
                    mappingFilter === 'MAPPED'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-body-secondary hover:text-body'
                  }`}
                >
                  Mapped ({classStats.totalMapped})
                </button>
                <button
                  type="button"
                  onClick={() => setMappingFilter('UNMAPPED')}
                  className={`h-6 px-2 text-[11px] font-medium rounded transition-colors ${
                    mappingFilter === 'UNMAPPED'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-body-secondary hover:text-body'
                  }`}
                >
                  Unmapped ({classStats.catalogTotal - classStats.totalMapped})
                </button>
              </div>

              {/* Subject Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-7 px-2 text-[11px] rounded-md border bg-body text-body border-secondary-subtle"
              >
                <option value="ALL">All Types</option>
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ACTIVITY">Activity</option>
              </select>
            </div>

            {/* Quick Batch Actions & Save Actions */}
            {canManage && (
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <ActionButton
                  action={handleBatchMapFiltered}
                  icon={CheckSquare}
                  name="Map All Filtered"
                  variant="outline-primary"
                  title="Remove all mapped subjects from this class"
                  size="sm"
                />

                {classStats.totalMapped > 0 && (
                  <ActionButton
                    action={handleUnmapAllFromClass}
                    icon={Trash2}
                    name="Clear Class"
                    variant="outline-danger"
                    title="Remove all mapped subjects from this class"
                    size="sm"
                  />
                )}

                {/* Staged Changes Save & Discard Buttons */}
                <div className="h-4 w-px bg-secondary opacity-30 mx-1 hidden sm:block" />
              </div>
            )}
          </div>

          {/* Staged Changes Notification Banner */}
          {pendingChanges.isDirty && (
            <div className="p-2.5 rounded-md border border-warning/40 bg-warning/10 text-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-body">
                    {pendingChanges.count} Unsaved Curriculum Change
                    {pendingChanges.count === 1 ? '' : 's'} for {currentClass?.name}:
                  </span>{' '}
                  <span className="text-[11px] text-secondary">
                    {pendingChanges.added.length > 0 && `${pendingChanges.added.length} to map, `}
                    {pendingChanges.removed.length > 0 &&
                      `${pendingChanges.removed.length} to unmap, `}
                    {pendingChanges.updated.length > 0 &&
                      `${pendingChanges.updated.length} to update. `}
                    Actions are in draft. Click <strong>&quot;Save Changes&quot;</strong> to persist
                    to database.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <ActionButton
                  action={handleDiscardChanges}
                  disabled={isSaving}
                  icon={RotateCcw}
                  name="Discard"
                />

                <ActionButton
                  action={handleSaveAllChanges}
                  disabled={isSaving}
                  loading={isSaving}
                  icon={Save}
                  name={isSaving ? 'Saving...' : 'Save Changes'}
                  variant="primary"
                />
              </div>
            </div>
          )}

          {/* Unified Subject Mapping Table for the Selected Class */}
          <div className="rounded-md border overflow-hidden bg-body">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs table-selectable ">
                <thead className="text-[11px] uppercase font-semibold border-b border-secondary-subtle bg-body-secondary text-secondary">
                  <tr>
                    <th className="px-3 py-2 w-2 text-center">Include</th>
                    <th className="px-3 py-2 w-2">Code</th>
                    <th className="px-3 py-2">Subject Title</th>
                    <th className="px-3 py-2 w-3">Status</th>
                    <th className="px-3 py-2 ">Weekly Periods</th>
                    <th className="px-3 py-2 w-10">Classification</th>
                    <th className="px-3 py-2 w-12">Syllabus / Track</th>
                    <th className="px-3 py-2">Assigned Faculty</th>
                    <th className="px-3 py-2 text-right w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-top border-secondary-subtle">
                  {filteredCatalogForMapping.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-10 text-center text-secondary">
                        <BookMarked className="w-6 h-6 mx-auto text-secondary mb-1 opacity-60" />
                        <p className="font-medium text-xs">
                          No subjects match the selected filter.
                        </p>
                        <p className="text-[11px] text-secondary mt-0.5">
                          Try adjusting search terms or status filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCatalogForMapping.map((sub) => {
                      const mapping = mappedSubjectsMap.get(sub.id);
                      const isMapped = Boolean(mapping);
                      const assignedTeachers = subjectTeacherMap.get(sub.id) || [];
                      const hasTeachers = assignedTeachers.length > 0;
                      const isStagedAdded = pendingChanges.added.some(
                        (a) => a.subjectId === sub.id,
                      );
                      const isStagedUpdated = pendingChanges.updated.some(
                        (u) => u.item.subjectId === sub.id,
                      );
                      const isStagedRemoved = pendingChanges.removed.some(
                        (r) => r.subjectId === sub.id,
                      );

                      return (
                        <tr
                          key={sub.id}
                          className={`transition-colors ${
                            isMapped
                              ? 'selected bg-opacity-5 hover:bg-primary hover:bg-opacity-10'
                              : 'hover:bg-body-secondary'
                          }`}
                        >
                          {/* Col 1: Include Checkbox / Toggle */}
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isMapped}
                              disabled={!canManage || (isMapped && hasTeachers)}
                              onChange={() => handleToggleMapping(sub)}
                              title={
                                hasTeachers
                                  ? 'Subject cannot be unmapped while faculty are actively assigned'
                                  : isMapped
                                    ? 'Unmap subject from class'
                                    : 'Map subject to class'
                              }
                              className="w-4 h-4 rounded border-secondary text-primary focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Col 2: Code */}
                          <td className="px-3 py-2 font-mono text-[11px]">
                            <span
                              className={`px-1.5 py-0.2 rounded border ${
                                isMapped
                                  ? 'bg-primary bg-opacity-10 border-primary border-opacity-25 text-primary font-semibold'
                                  : 'bg-body-secondary border-secondary-subtle text-body-secondary'
                              }`}
                            >
                              {sub.code}
                            </span>
                          </td>

                          {/* Col 3: Title, Type & Credits */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-medium ${
                                  isMapped ? 'text-body font-semibold' : 'text-body-secondary'
                                }`}
                              >
                                {sub.name}
                              </span>

                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                  sub.subjectType === 'THEORY'
                                    ? 'bg-primary bg-opacity-10 text-primary'
                                    : sub.subjectType === 'PRACTICAL'
                                      ? 'bg-info bg-opacity-10 text-info'
                                      : sub.subjectType === 'HYBRID'
                                        ? 'bg-warning bg-opacity-10 text-warning'
                                        : 'bg-success bg-opacity-10 text-success'
                                }`}
                              >
                                {sub.subjectType}
                              </span>

                              <span className="text-[10px] text-secondary">{sub.credits} cr</span>
                            </div>
                          </td>

                          {/* Col 4: Status Badge */}
                          <td className="px-3 py-2">
                            {isStagedAdded ? (
                              <Badge
                                bg="primary"
                                className="d-inline-flex align-items-center gap-1 fw-semibold"
                              >
                                <Plus size={11} />
                                Draft (Add)
                              </Badge>
                            ) : isStagedUpdated ? (
                              <Badge
                                bg="warning"
                                text="dark"
                                className="d-inline-flex align-items-center gap-1 fw-semibold"
                              >
                                <Edit2 size={11} />
                                Modified
                              </Badge>
                            ) : isMapped ? (
                              <Badge
                                bg="success"
                                className="d-inline-flex align-items-center gap-1 fw-semibold"
                              >
                                <Check size={12} />
                                In Class
                              </Badge>
                            ) : isStagedRemoved ? (
                              <Badge
                                bg="danger"
                                className="d-inline-flex align-items-center gap-1 fw-semibold"
                              >
                                <Trash2 size={11} />
                                Draft (Unmap)
                              </Badge>
                            ) : (
                              <Badge bg="secondary" className="fw-medium">
                                Available
                              </Badge>
                            )}
                          </td>

                          {/* Col 5: Weekly Periods Stepper (Inline Configurable) */}
                          <td className="px-3 py-2">
                            {isMapped && mapping ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={25}
                                  value={mapping.weeklyPeriods}
                                  disabled={!canManage}
                                  onChange={(e) =>
                                    handleUpdatePeriods(sub.id, parseInt(e.target.value) || 1)
                                  }
                                  className="w-12 h-6 text-center text-xs font-mono font-semibold rounded border bg-body text-body"
                                />
                              </div>
                            ) : (
                              <span className="text-[11px] text-secondary italic">
                                Default 5 periods
                              </span>
                            )}
                          </td>

                          {/* Col 6: Classification (Compulsory / Elective Inline Configurable) */}
                          <td className="px-3 py-2">
                            {isMapped && mapping ? (
                              <button
                                type="button"
                                disabled={!canManage}
                                onClick={() => handleToggleCompulsory(sub.id)}
                                className={`h-6 px-2 text-[11px] font-medium rounded border transition-colors flex items-center gap-1 ${
                                  mapping.isMandatory
                                    ? 'bg-primary bg-opacity-10 border-primary border-opacity-25 text-primary hover:bg-opacity-20'
                                    : 'bg-info bg-opacity-10 border-info border-opacity-25 text-info hover:bg-opacity-20'
                                }`}
                                title="Click to toggle Compulsory vs Elective"
                              >
                                <span>{mapping.isMandatory ? 'Compulsory' : 'Elective'}</span>
                                <span className="text-[9px] opacity-70">⇄</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-secondary">
                                {sub.isElective ? 'Elective' : 'Compulsory'}
                              </span>
                            )}
                          </td>

                          {/* Col 7: Syllabus / Curriculum Track */}
                          <td className="px-3 py-2">
                            {isMapped && mapping ? (
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
                                {editingSyllabusId === sub.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={tempSyllabusText}
                                      onChange={(e) => setTempSyllabusText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateSyllabus(sub.id, tempSyllabusText);
                                          setEditingSyllabusId(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingSyllabusId(null);
                                        }
                                      }}
                                      className="h-6 px-1.5 text-[11px] rounded border bg-body text-body w-32"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateSyllabus(sub.id, tempSyllabusText);
                                        setEditingSyllabusId(null);
                                      }}
                                      className="text-success hover:opacity-80 p-0.5"
                                      title="Save syllabus"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSyllabusId(null)}
                                      className="text-secondary hover:opacity-80 p-0.5"
                                      title="Cancel"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 group">
                                    {mapping.syllabusName ? (
                                      <span
                                        className="text-[11px] text-body truncate max-w-[130px] font-medium"
                                        title={mapping.syllabusName}
                                      >
                                        {mapping.syllabusName}
                                      </span>
                                    ) : (
                                      <span
                                        className="text-[11px] text-secondary italic"
                                        title="No syllabus mapped for this academic session"
                                      >
                                        Not mapped
                                      </span>
                                    )}
                                    {canManage && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSyllabusId(sub.id);
                                          setTempSyllabusText(
                                            mapping.syllabusName ||
                                              `${currentClass?.name} ${sub.name} Syllabus`,
                                          );
                                        }}
                                        className="text-secondary hover:text-primary p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                                        title="Edit syllabus track"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-secondary italic">—</span>
                            )}
                          </td>

                          {/* Col 8: Faculty Assigned in Sections */}
                          <td className="px-3 py-2">
                            {hasTeachers ? (
                              <div className="space-y-0.5">
                                {assignedTeachers.map((tName, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1 text-[11px] text-success font-medium"
                                  >
                                    <UserCheck className="w-3 h-3 text-success shrink-0" />
                                    <span className="truncate max-w-[150px]">{tName}</span>
                                  </div>
                                ))}
                              </div>
                            ) : isMapped ? (
                              <span className="text-[10px] text-warning flex items-center gap-1">
                                <Info className="w-3 h-3 text-warning shrink-0" />
                                <span>No teacher assigned</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-secondary">—</span>
                            )}
                          </td>

                          {/* Col 8: Action Button */}
                          <td className="px-3 py-2 text-right">
                            {isMapped ? (
                              <ActionButton
                                action={() => handleRequestUnmapSubject(sub)}
                                disabled={!canManage || hasTeachers}
                                icon={Trash2}
                                name="Unmap"
                                variant="outline-danger"
                                title={
                                  hasTeachers
                                    ? 'Unassign faculty in Teacher Assignments before unmapping'
                                    : 'Remove subject from class curriculum (requires confirmation)'
                                }
                                size="sm"
                                iconOnly
                              />
                            ) : (
                              <ActionButton
                                action={() => handleMapSubject(sub)}
                                disabled={!canManage}
                                icon={Plus}
                                name="Map"
                                variant="outline-primary"
                                title={`Map ${sub.name} to ${currentClass?.name}`}
                                size="sm"
                                iconOnly
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Table Summary Footer */}
            {currentClass && (
              <div className="p-2.5 border-t border-secondary-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-body-secondary text-secondary">
                <div className="flex items-center gap-3">
                  <span>
                    Showing{' '}
                    <strong className="text-body">{filteredCatalogForMapping.length}</strong> of{' '}
                    <strong className="text-body">{subjects.length}</strong> total catalog subjects
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-primary">{classStats.totalMapped}</strong> mapped to{' '}
                    <strong className="text-body">{currentClass.name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-body">
                    Total Load: {classStats.totalPeriods} periods/wk
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* SCREEN 2: SUBJECT CATALOG MASTER (REGISTER / EDIT COURSES)                */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {/* Catalog Toolbar */}
          <div className="p-2.5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-body text-body">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-secondary" />
              <input
                type="text"
                placeholder="Search catalog subject name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border transition-colors bg-body text-body"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">
                Total Catalog Modules: <strong>{subjects.length}</strong>
              </span>
              {canManage && (
                <ActionButton
                  action={handleOpenCreateSubject}
                  icon={Plus}
                  name="Add Subject"
                  variant="primary"
                />
              )}
            </div>
          </div>

          {/* Catalog Table */}
          <div className="rounded-md border overflow-hidden bg-body">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase font-semibold border-b border-secondary-subtle bg-body-secondary text-secondary">
                  <tr>
                    <th className="px-3 py-2 w-28">Code</th>
                    <th className="px-3 py-2">Subject Title</th>
                    <th className="px-3 py-2">Pedagogical Type</th>
                    <th className="px-3 py-2">Credits</th>
                    <th className="px-3 py-2">Elective Option</th>
                    <th className="px-3 py-2">Mapped In Classes</th>
                    <th className="px-3 py-2 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-top border-secondary-subtle">
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-secondary">
                        No subjects found in catalog. Click "Add Subject" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((sub) => {
                      const classesWithSubject = classSubjects.filter(
                        (cs) => cs.subjectId === sub.id,
                      );

                      return (
                        <tr key={sub.id} className="hover:bg-body-secondary transition-colors">
                          <td className="px-3 py-2 font-mono text-[11px] text-body-secondary">
                            <span className="px-1.5 py-0.2 rounded bg-body-secondary border border-secondary-subtle font-semibold">
                              {sub.code}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium text-body flex items-center gap-1.5">
                            <BookOpenCheck className="w-3.5 h-3.5 text-primary" />
                            <span>{sub.name}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                sub.subjectType === 'THEORY'
                                  ? 'bg-primary bg-opacity-10 text-primary'
                                  : sub.subjectType === 'PRACTICAL'
                                    ? 'bg-info bg-opacity-10 text-info'
                                    : sub.subjectType === 'HYBRID'
                                      ? 'bg-warning bg-opacity-10 text-warning'
                                      : 'bg-success bg-opacity-10 text-success'
                              }`}
                            >
                              {sub.subjectType}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-body-secondary">
                            {sub.credits} cr
                          </td>
                          <td className="px-3 py-2">
                            {sub.isElective ? (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-info bg-opacity-10 text-info">
                                Optional Elective
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-primary bg-opacity-10 text-primary">
                                Standard Core
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-secondary">
                            {classesWithSubject.length > 0 ? (
                              <span className="text-[11px] font-medium text-body-secondary">
                                {classesWithSubject.map((cs) => cs.className).join(', ')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-secondary italic">
                                Not mapped to any class
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <ActionButton
                                action={() => handleOpenEditSubject(sub)}
                                icon={Edit2}
                                name=""
                                variant="light"
                                title="Edit Subject"
                              />
                              {canManage && (
                                <ActionButton
                                  action={() => handleDeleteSubject(sub)}
                                  icon={Trash2}
                                  name=""
                                  variant="light"
                                  title="Delete Subject"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 1: CREATE SUBJECT IN CATALOG                                        */}
      {/* ========================================================================= */}
      {isCreateSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-4 rounded-md border shadow-lg bg-body text-body">
            <div className="flex items-center justify-between pb-2 border-b border-secondary-subtle mb-3">
              <div>
                <h2 className="text-sm font-semibold text-body">Add Course Subject</h2>
                <p className="text-[11px] text-secondary">
                  Register a new curriculum subject in the institutional catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateSubjectOpen(false)}
                className="text-secondary hover:text-body p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics & Mechanics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PHY-101"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs font-mono uppercase bg-body text-body focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Credits / Units *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={subjectForm.credits}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        credits: Number(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Pedagogical Type
                </label>
                <select
                  value={subjectForm.subjectType}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      subjectType: e.target.value as any,
                    })
                  }
                  className="w-full h-8 px-2 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                >
                  <option value="THEORY">Theory (Lecture &amp; Exam)</option>
                  <option value="PRACTICAL">Practical (Lab &amp; Experiment)</option>
                  <option value="HYBRID">Hybrid (Lecture + Lab)</option>
                  <option value="ACTIVITY">Co-Curricular / Activity</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="isElectiveCheckbox"
                  checked={subjectForm.isElective}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      isElective: e.target.checked,
                    })
                  }
                  className="rounded border-secondary text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isElectiveCheckbox" className="text-xs text-body cursor-pointer">
                  Optional Elective course in catalog
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-secondary-subtle">
                <button
                  type="button"
                  onClick={() => setIsCreateSubjectOpen(false)}
                  className="h-8 px-3 text-xs rounded-md font-medium text-secondary hover:bg-body-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="h-8 px-3 text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isProcessing ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 2: EDIT SUBJECT IN CATALOG                                          */}
      {/* ========================================================================= */}
      {isEditSubjectOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-4 rounded-md border shadow-lg bg-body text-body">
            <div className="flex items-center justify-between pb-2 border-b border-secondary-subtle mb-3">
              <div>
                <h2 className="text-sm font-semibold text-body">Edit Subject</h2>
                <p className="text-[11px] text-secondary">
                  Modify catalog parameters for {selectedSubject.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSubjectOpen(false)}
                className="text-secondary hover:text-body p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubjectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs font-mono uppercase bg-body text-body focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Credits / Units *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={subjectForm.credits}
                    onChange={(e) =>
                      setSubjectForm({
                        ...subjectForm,
                        credits: Number(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Pedagogical Type
                </label>
                <select
                  value={subjectForm.subjectType}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      subjectType: e.target.value as any,
                    })
                  }
                  className="w-full h-8 px-2 rounded-md border text-xs bg-body text-body focus:ring-1 focus:ring-primary"
                >
                  <option value="THEORY">Theory</option>
                  <option value="PRACTICAL">Practical</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ACTIVITY">Activity</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="isEditElectiveCheckbox"
                  checked={subjectForm.isElective}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      isElective: e.target.checked,
                    })
                  }
                  className="rounded border-secondary text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isEditElectiveCheckbox"
                  className="text-xs text-body cursor-pointer"
                >
                  Optional Elective course in catalog
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-secondary-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditSubjectOpen(false)}
                  className="h-8 px-3 text-xs rounded-md font-medium text-secondary hover:bg-body-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="h-8 px-3 text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isProcessing ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Unmap Subject Confirmation Modal */}

      <ConfirmModal
        show={Boolean(confirmUnmapTarget)}
        onHide={() => setConfirmUnmapTarget(null)}
        title={confirmUnmapTarget?.isAll ? 'Confirm Clear All Subjects' : 'Confirm Unmap Subject'}
        icon={<AlertTriangle size={16} className="text-danger" />}
        description={
          <>
            {confirmUnmapTarget?.isAll ? (
              <p className="text-body mb-2">
                Are you sure you want to unmap all eligible subjects from
                <strong>{currentClass?.name}</strong>?
              </p>
            ) : (
              <p className="text-body mb-2">
                Are you sure you want to unmap
                <strong>{confirmUnmapTarget?.subject?.name}</strong> (
                {confirmUnmapTarget?.subject?.code}) from
                <strong>{currentClass?.name}</strong>?
              </p>
            )}

            <p className="text-secondary text-[11px] mb-0">
              This action will stage the removal in draft. You must click
              <strong>&quot;Save Changes&quot;</strong> to commit this removal to the database.
            </p>
          </>
        }
        actions={[
          {
            variant: 'secondary',
            size: 'sm',
            name: 'Cancel',
            action: () => setConfirmUnmapTarget(null),
          },
          {
            variant: 'danger',
            size: 'sm',
            name: confirmUnmapTarget?.isAll ? 'Clear All' : 'Unmap Subject',
            action: handleConfirmUnmap,
          },
        ]}
      />

      {/* Unsaved Changes Navigation Confirmation Modal */}
      <ConfirmModal
        show={Boolean(pendingNavigation)}
        onHide={() => setPendingNavigation(null)}
        title="Unsaved Changes"
        icon={<AlertTriangle size={16} className="text-warning" />}
        description={
          <>
            <p className="text-body mb-2">
              You have
              <strong>
                {pendingChanges.count} unsaved curriculum change
                {pendingChanges.count === 1 ? '' : 's'}
              </strong>
              for <strong>{currentClass?.name}</strong>.
            </p>
            <p className="text-secondary text-[11px] mb-0">
              Switching without saving will discard your staged changes. Would you like to save
              before switching or discard your edits?
            </p>
          </>
        }
        actions={[
          {
            variant: 'outline-danger',
            size: 'sm',
            name: 'Discard & Switch',
            action: handleDiscardAndNavigate,
          },
          {
            variant: 'secondary',
            size: 'sm',
            name: 'Stay Here',
            action: () => setPendingNavigation(null),
          },
          {
            variant: 'primary',
            size: 'sm',
            name: isSaving ? 'Saving...' : 'Save & Switch',
            disabled: isSaving,
            action: async () => {
              const ok = await handleSaveAllChanges();
              if (ok && pendingNavigation) {
                const nav = pendingNavigation;
                setPendingNavigation(null);
                if (nav.type === 'class') {
                  setSelectedClassId(nav.nextId);
                } else if (nav.type === 'academicYear') {
                  setSelectedAcademicYearId(nav.nextId);
                } else if (nav.type === 'tab') {
                  setActiveTab(nav.nextId as any);
                }
              }
            },
          },
        ]}
      />
    </div>
  );
};
