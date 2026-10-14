import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Plus, Users, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useGetStudentsQuery,
  useUpdateStudentStatusMutation,
  mapDtoToStudentItem,
} from '@/store/students';
import {
  StudentItem,
  StudentStatus,
  StudentFilterState,
  DEFAULT_STUDENT_FILTER_STATE,
} from './types';
import { StudentFilters } from './components/StudentFilters';
import { StudentTable } from './components/StudentTable';
import { ArchiveStudentModal } from './components/ArchiveStudentModal';
import { StudentBulkActionBar } from './components/StudentBulkActionBar';
import { BulkStatusModal } from './components/BulkStatusModal';
import { BulkAssignClassModal } from './components/BulkAssignClassModal';
import { BulkArchiveModal } from './components/BulkArchiveModal';
import { useTheme } from '@/context/ThemeContext';
import { isSpecialNeedActive, SPECIAL_NEED_CATEGORIES, getOptionLabel } from '@/config/Options';

export const StudentListView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Master list in state for local UI interactions (archiving, etc.)
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Archive modal state
  const [archivingStudent, setArchivingStudent] = useState<StudentItem | null>(null);

  // Row selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk action modals state (single modal manager)
  const [bulkModal, setBulkModal] = useState<{
    type: 'status' | 'assignClass' | 'archive' | null;
  }>({ type: null });

  // Filters state (grouped into a single object per guidelines)
  const [filters, setFilters] = useState<StudentFilterState>(DEFAULT_STUDENT_FILTER_STATE);

  // RTK Query: Student directory and mutation hooks
  const {
    data: rtkStudentsData,
    isLoading: isRtkLoading,
    isError: isRtkError,
    refetch: refetchStudents,
  } = useGetStudentsQuery();
  const [updateStudentStatusMutation] = useUpdateStudentStatusMutation();

  // Synchronize RTK Query store data with local view state
  useEffect(() => {
    setIsLoading(isRtkLoading);
    setHasError(isRtkError);
    if (rtkStudentsData) {
      const raw = Array.isArray(rtkStudentsData?.data)
        ? rtkStudentsData.data
        : Array.isArray(rtkStudentsData)
          ? rtkStudentsData
          : [];
      setStudents(
        raw.map((item: any) =>
          item.studentId && item.admissionNumber && item.user ? mapDtoToStudentItem(item) : item,
        ),
      );
    }
  }, [rtkStudentsData, isRtkLoading, isRtkError]);

  const loadStudents = useCallback(() => {
    refetchStudents();
  }, [refetchStudents]);

  const handleFilterChange = (newFilters: Partial<StudentFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_STUDENT_FILTER_STATE);
  };

  // Archive interaction
  const handleArchiveConfirm = async (studentId: string) => {
    try {
      await updateStudentStatusMutation({
        studentId,
        status: 'INACTIVE',
        reason: 'Archived from student directory',
      }).unwrap();
      setSelectedIds((prev) => prev.filter((id) => id !== studentId));
      const target = students.find((s) => s.id === studentId);
      setFeedback(
        `Student ${target?.firstName || ''} ${target?.lastName || ''} archived successfully.`,
      );
    } catch (err: any) {
      console.error('Failed to archive student:', err);
      setFeedback('Failed to archive student. Please try again.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Extract available filter values dynamically
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.currentClass) set.add(s.currentClass);
    });
    ['Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'].forEach((c) => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.currentSection) set.add(s.currentSection);
    });
    ['Section A', 'Section B', 'Section C'].forEach((sec) => set.add(sec));
    return Array.from(set).sort();
  }, [students]);

  const availableAcademicYears = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.academicYear) set.add(s.academicYear);
    });
    ['2026-2027', '2025-2026'].forEach((y) => set.add(y));
    return Array.from(set).sort().reverse();
  }, [students]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    const filtered = students.filter((s) => {
      // 1. Search: name, admission number, student code, mobile, email, city, notes
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
        const adm = (s.admissionNumber || '').toLowerCase();
        const code = (s.studentCode || '').toLowerCase();
        const mobile = (s.mobile || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const city = (s.city || '').toLowerCase();

        if (
          !fullName.includes(query) &&
          !adm.includes(query) &&
          !code.includes(query) &&
          !mobile.includes(query) &&
          !email.includes(query) &&
          !city.includes(query)
        ) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status !== 'ALL' && s.status !== filters.status) {
        return false;
      }

      // 3. Gender filter
      if (filters.gender !== 'ALL' && s.gender !== filters.gender) {
        return false;
      }

      // 4. Admission type filter
      if (filters.admissionType !== 'ALL' && s.admissionType !== filters.admissionType) {
        return false;
      }

      // 5. Class filter
      if (filters.currentClass !== 'ALL') {
        if (filters.currentClass === 'UNASSIGNED') {
          if (s.currentClass && s.currentClass.trim() !== '') return false;
        } else if (s.currentClass !== filters.currentClass) {
          return false;
        }
      }

      // 6. Section filter
      if (filters.currentSection !== 'ALL') {
        if (s.currentSection !== filters.currentSection) {
          return false;
        }
      }

      // 7. Enrollment / Active Admission status
      if (filters.admissionStatus !== 'ALL') {
        const isAdmitted = !!s.hasActiveAdmission || !!s.admissionNumber;
        if (filters.admissionStatus === 'ADMITTED' && !isAdmitted) return false;
        if (filters.admissionStatus === 'PENDING' && isAdmitted) return false;
      }

      // 8. Blood Group filter
      if (filters.bloodGroup !== 'ALL') {
        if ((s.bloodGroup || '').toUpperCase() !== filters.bloodGroup.toUpperCase()) {
          return false;
        }
      }

      // 9. Special Needs filter
      if (filters.specialCategory !== 'ALL') {
        const hasSpecial = isSpecialNeedActive(s.specialCategory);
        if (filters.specialCategory === 'ANY_SPECIAL_NEED') {
          if (!hasSpecial) return false;
        } else if (filters.specialCategory === 'NONE') {
          if (hasSpecial) return false;
        } else {
          const cat = s.specialCategory || '';
          const match =
            cat === filters.specialCategory ||
            getOptionLabel(SPECIAL_NEED_CATEGORIES, cat) ===
              getOptionLabel(SPECIAL_NEED_CATEGORIES, filters.specialCategory);
          if (!match) return false;
        }
      }

      // 10. Social Category filter
      if (filters.category !== 'ALL') {
        if ((s.category || '').toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
      }

      // 11. Guardian status filter
      if (filters.guardianStatus !== 'ALL') {
        const hasGuardians = Array.isArray(s.guardians) && s.guardians.length > 0;
        if (filters.guardianStatus === 'HAS_GUARDIAN' && !hasGuardians) return false;
        if (filters.guardianStatus === 'NO_GUARDIAN' && hasGuardians) return false;
      }

      // 12. Academic Year filter
      if (filters.academicYear !== 'ALL') {
        if (s.academicYear !== filters.academicYear) {
          return false;
        }
      }

      return true;
    });

    // Sort order
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name_asc': {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case 'name_desc': {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameB.localeCompare(nameA);
        }
        case 'admission_asc': {
          return (a.admissionNumber || 'ZZZZ').localeCompare(b.admissionNumber || 'ZZZZ');
        }
        case 'code_asc': {
          return (a.studentCode || '').localeCompare(b.studentCode || '');
        }
        case 'class_asc': {
          const classComp = (a.currentClass || 'ZZZZ').localeCompare(
            b.currentClass || 'ZZZZ',
            undefined,
            { numeric: true },
          );
          if (classComp !== 0) return classComp;
          return (a.currentSection || '').localeCompare(b.currentSection || '');
        }
        case 'dob_asc': {
          return (a.dateOfBirth || '').localeCompare(b.dateOfBirth || '');
        }
        case 'dob_desc': {
          return (b.dateOfBirth || '').localeCompare(a.dateOfBirth || '');
        }
        case 'created_desc': {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, filters]);

  // Selection calculations
  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  const allFilteredSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.includes(s.id));

  const handleToggleSelect = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all displayed students
      const filteredIdSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Add all displayed students to selection
      const currentSet = new Set(selectedIds);
      filteredStudents.forEach((s) => currentSet.add(s.id));
      setSelectedIds(Array.from(currentSet));
    }
  };

  const handleSelectAllFiltered = () => {
    const currentSet = new Set(selectedIds);
    filteredStudents.forEach((s) => currentSet.add(s.id));
    setSelectedIds(Array.from(currentSet));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk action handlers
  const handleBulkStatusConfirm = async (newStatus: StudentStatus) => {
    const count = selectedIds.length;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateStudentStatusMutation({
            studentId: id,
            status: newStatus,
            reason: 'Bulk status update',
          }).unwrap(),
        ),
      );
      setStudents((prev) =>
        prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: newStatus } : s)),
      );
      setSelectedIds([]);
      setBulkModal({ type: null });
      setFeedback(`Updated status for ${count} student${count > 1 ? 's' : ''} to ${newStatus}.`);
    } catch (err) {
      console.error('Failed bulk status update:', err);
      setFeedback('Failed to update student status. Please try again.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleQuickStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    const count = selectedIds.length;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateStudentStatusMutation({
            studentId: id,
            status: newStatus,
            reason: 'Quick status update',
          }).unwrap(),
        ),
      );
      setStudents((prev) =>
        prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: newStatus } : s)),
      );
      setSelectedIds([]);
      setFeedback(`Marked ${count} student${count > 1 ? 's' : ''} as ${newStatus.toLowerCase()}.`);
    } catch (err) {
      console.error('Failed quick status change:', err);
      setFeedback('Failed to update student status. Please try again.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBulkAssignClassConfirm = (assignment: {
    targetClass: string;
    targetSection: string;
    academicYear: string;
  }) => {
    const count = selectedIds.length;
    setStudents((prev) =>
      prev.map((s) => {
        if (!selectedIds.includes(s.id)) return s;
        return {
          ...s,
          currentClass:
            assignment.targetClass === 'UNASSIGNED' ? undefined : assignment.targetClass,
          currentSection:
            assignment.targetClass === 'UNASSIGNED' || assignment.targetSection === 'UNASSIGNED'
              ? undefined
              : assignment.targetSection,
          academicYear: assignment.academicYear || s.academicYear,
        };
      }),
    );
    setSelectedIds([]);
    setBulkModal({ type: null });
    const classLabel =
      assignment.targetClass === 'UNASSIGNED'
        ? 'Unassigned'
        : `${assignment.targetClass}${
            assignment.targetSection !== 'UNASSIGNED' ? ` (${assignment.targetSection})` : ''
          }`;
    setFeedback(`Assigned ${count} student${count > 1 ? 's' : ''} to ${classLabel}.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleBulkArchiveConfirm = async () => {
    const count = selectedIds.length;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateStudentStatusMutation({
            studentId: id,
            status: 'INACTIVE',
            reason: 'Bulk archive',
          }).unwrap(),
        ),
      );
      setStudents((prev) =>
        prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: 'INACTIVE' } : s)),
      );
      setSelectedIds([]);
      setBulkModal({ type: null });
      setFeedback(`Archived ${count} student${count > 1 ? 's' : ''} successfully.`);
    } catch (err) {
      console.error('Failed bulk archive:', err);
      setFeedback('Failed to archive some students. Please try again.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const hasAnyStudents = students.length > 0;
  const isFilterActive =
    filters.searchQuery.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.gender !== 'ALL' ||
    filters.admissionType !== 'ALL' ||
    filters.currentClass !== 'ALL' ||
    filters.currentSection !== 'ALL' ||
    filters.admissionStatus !== 'ALL' ||
    filters.bloodGroup !== 'ALL' ||
    filters.specialCategory !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.guardianStatus !== 'ALL' ||
    filters.academicYear !== 'ALL' ||
    (filters.sortBy && filters.sortBy !== 'name_asc');

  return (
    <div>
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <Users size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Student Directory
                  </h5>
                  <Badge bg="primary" className="fw-normal">
                    {filteredStudents.length} Students
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Permanent student master profiles, demographic information, and guardian records.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/students/add')}
                className="d-inline-flex align-items-center gap-1.5 shadow-sm px-3"
              >
                <Plus size={16} />
                <span>Add Student</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {feedback && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setFeedback(null)}
          className="mb-3 py-2 small"
        >
          {feedback}
        </Alert>
      )}

      {/* Toolbar / Filters */}
      <StudentFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        availableClasses={availableClasses}
        availableSections={availableSections}
        availableAcademicYears={availableAcademicYears}
        totalCount={students.length}
        filteredCount={filteredStudents.length}
      />

      {/* Bulk Actions Banner (appears whenever students are selected) */}
      <StudentBulkActionBar
        selectedCount={selectedIds.length}
        totalFilteredCount={filteredStudents.length}
        allFilteredSelected={allFilteredSelected}
        onSelectAllFiltered={handleSelectAllFiltered}
        onClearSelection={handleClearSelection}
        onOpenStatusModal={() => setBulkModal({ type: 'status' })}
        onOpenAssignClassModal={() => setBulkModal({ type: 'assignClass' })}
        onOpenArchiveModal={() => setBulkModal({ type: 'archive' })}
        onQuickStatusChange={handleQuickStatusChange}
      />

      {/* UI State Renderings */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="sm" className="mb-2" />
          <div className="text-muted small">Loading student records...</div>
        </div>
      ) : hasError ? (
        <div
          className={`p-5 text-center rounded border ${
            isDark
              ? 'bg-dark border-secondary text-white'
              : 'bg-white border-light-subtle shadow-sm'
          }`}
        >
          <AlertCircle size={32} className="text-danger mb-2" />
          <h2 className="h6 fw-semibold text-danger">Unable to load students.</h2>
          <p className="text-muted small mb-3">
            An unexpected error occurred while fetching records.
          </p>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => loadStudents()}
            className="d-inline-flex align-items-center gap-1"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </Button>
        </div>
      ) : !hasAnyStudents ? (
        /* Empty State (0 records in system) */
        <div
          className={`p-5 text-center rounded border ${
            isDark
              ? 'bg-dark border-secondary text-white'
              : 'bg-white border-light-subtle shadow-sm'
          }`}
        >
          <Users size={36} className="text-muted opacity-50 mb-2" />
          <h2 className="h6 fw-semibold mb-1">No students have been added yet.</h2>
          <p className="text-muted small mb-3">Begin by onboarding your first student record.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/students/add')}
            className="d-inline-flex align-items-center gap-1"
          >
            <Plus size={14} />
            <span>Add Student</span>
          </Button>
        </div>
      ) : filteredStudents.length === 0 && isFilterActive ? (
        /* Filter / Search Empty State */
        <div
          className={`p-5 text-center rounded border ${
            isDark
              ? 'bg-dark border-secondary text-white'
              : 'bg-white border-light-subtle shadow-sm'
          }`}
        >
          <XCircle size={32} className="text-muted opacity-50 mb-2" />
          <h2 className="h6 fw-semibold mb-1">No students match your search or filters.</h2>
          <p className="text-muted small mb-3">
            Try clearing search parameters or adjusting applied criteria.
          </p>
          <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        /* Table of Students */
        <>
          <StudentTable
            students={filteredStudents}
            onArchive={(student) => setArchivingStudent(student)}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />

          <div className="d-flex align-items-center justify-content-between mt-3 text-muted small px-1">
            <span>
              Showing{' '}
              <span className="fw-semibold text-dark-emphasis">{filteredStudents.length}</span> of{' '}
              <span className="fw-semibold text-dark-emphasis">{students.length}</span> students
            </span>
            <span>SchoolNexa Student Registry</span>
          </div>
        </>
      )}

      {/* Archive Single Student Confirmation Modal */}
      <ArchiveStudentModal
        show={!!archivingStudent}
        student={archivingStudent}
        onHide={() => setArchivingStudent(null)}
        onConfirm={handleArchiveConfirm}
      />

      {/* Bulk Status Modal */}
      <BulkStatusModal
        show={bulkModal.type === 'status'}
        selectedStudents={selectedStudents}
        onHide={() => setBulkModal({ type: null })}
        onConfirm={handleBulkStatusConfirm}
      />

      {/* Bulk Assign Class Modal */}
      <BulkAssignClassModal
        show={bulkModal.type === 'assignClass'}
        selectedStudents={selectedStudents}
        availableClasses={availableClasses}
        availableSections={availableSections}
        availableAcademicYears={availableAcademicYears}
        onHide={() => setBulkModal({ type: null })}
        onConfirm={handleBulkAssignClassConfirm}
      />

      {/* Bulk Archive Modal */}
      <BulkArchiveModal
        show={bulkModal.type === 'archive'}
        selectedStudents={selectedStudents}
        onHide={() => setBulkModal({ type: null })}
        onConfirm={handleBulkArchiveConfirm}
      />
    </div>
  );
};
