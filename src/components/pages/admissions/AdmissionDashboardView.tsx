import React, { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  useGetEnrollmentsQuery,
  useGetEnrollmentStatsQuery,
  useUpdateEnrollmentMutation,
  useTransferOutStudentMutation,
} from '@/store/enrollment';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { Enrollment, EnrollmentFilterState, DEFAULT_ENROLLMENT_FILTERS } from './types';
import { AdmissionHeader } from './components/AdmissionHeader';
import { AdmissionStatsGrid } from './components/AdmissionStatsGrid';
import { EnrollmentFilterBar } from './components/EnrollmentFilterBar';
import { EnrollmentTable } from './components/EnrollmentTable';
import { HistoryModal } from './components/HistoryModal';
import { QuickTransferOutModal } from './components/QuickTransferOutModal';
import { EditEnrollmentModal } from './components/EditEnrollmentModal';

export const AdmissionDashboardView: React.FC = () => {
  const navigate = useNavigate();

  // RTK Query hooks
  const {
    data: rtkEnrollmentsData,
    refetch: refetchEnrollments,
  } = useGetEnrollmentsQuery();
  const { data: rtkStatsData } = useGetEnrollmentStatsQuery();
  const [updateEnrollmentMutation] = useUpdateEnrollmentMutation();
  const [transferOutStudentMutation] = useTransferOutStudentMutation();

  // Local state for enrollments fetched from the service
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filters, setFilters] = useState<EnrollmentFilterState>(DEFAULT_ENROLLMENT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: 'success' | 'info' | 'danger';
  } | null>(null);

  // Active modals
  const [historyModalTarget, setHistoryModalTarget] = useState<Enrollment | null>(null);
  const [transferModalTarget, setTransferModalTarget] = useState<Enrollment | null>(null);
  const [editModalTarget, setEditModalTarget] = useState<Enrollment | null>(null);

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkEnrollmentsData) {
      const records = Array.isArray(rtkEnrollmentsData?.data)
        ? rtkEnrollmentsData.data
        : Array.isArray(rtkEnrollmentsData)
          ? rtkEnrollmentsData
          : [];
      if (records.length > 0) {
        setEnrollments(records);
      }
    }
  }, [rtkEnrollmentsData]);

  // Load initial enrollments
  const refreshEnrollments = () => {
    refetchEnrollments();
  };

  const showFeedback = (message: string, variant: 'success' | 'info' | 'danger' = 'success') => {
    setFeedback({ message, variant });
    setTimeout(() => setFeedback(null), 4500);
  };

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    enrollments.forEach((e) => {
      if (e.academicYearName) set.add(e.academicYearName);
    });
    ['2026-2027', '2025-2026'].forEach((y) => set.add(y));
    return Array.from(set).sort().reverse();
  }, [enrollments]);

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    enrollments.forEach((e) => {
      if (e.className) set.add(e.className);
    });
    ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].forEach((c) => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [enrollments]);

  const availableSections = useMemo(() => {
    const set = new Set<string>();
    enrollments.forEach((e) => {
      if (e.sectionName) set.add(e.sectionName);
    });
    ['Section A', 'Section B', 'Section C', 'Section D'].forEach((sec) => set.add(sec));
    return Array.from(set).sort();
  }, [enrollments]);

  // Stats calculation
  const stats = useMemo(() => {
    if (rtkStatsData?.data && filters.academicYear === 'ALL') {
      return rtkStatsData.data;
    }
    const pool = filters.academicYear === 'ALL'
      ? enrollments
      : enrollments.filter((e) => e.academicYearName === filters.academicYear);
    return {
      total: pool.length,
      newAdmissions: pool.filter((e) => (e.status as string) === 'NEW' || (e.status as string) === 'ACTIVE').length,
      promoted: pool.filter((e) => e.status === 'PROMOTED').length,
      repeated: pool.filter((e) => e.status === 'REPEAT').length,
      transferred: pool.filter((e) => e.status === 'TRANSFERRED').length,
      completed: pool.filter((e) => e.status === 'COMPLETED').length,
    };
  }, [enrollments, filters.academicYear, rtkStatsData]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enr) => {
      // 1. Year filter
      if (filters.academicYear !== 'ALL' && enr.academicYearName !== filters.academicYear) {
        return false;
      }
      // 2. Class filter
      if (filters.className !== 'ALL' && enr.className !== filters.className) {
        return false;
      }
      // 3. Section filter
      if (filters.sectionName !== 'ALL' && enr.sectionName !== filters.sectionName) {
        return false;
      }
      // 4. Status filter
      if (filters.status !== 'ALL' && enr.status !== filters.status) {
        return false;
      }
      // 5. Search query (matches enrollmentId, studentCode, studentName, admissionNumber, rollNumber)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchName = enr.studentName.toLowerCase().includes(query);
        const matchCode = enr.studentCode.toLowerCase().includes(query);
        const matchEnrollmentId = enr.enrollmentId.toLowerCase().includes(query);
        const matchAdmission = (enr.admissionNumber || '').toLowerCase().includes(query);
        const matchRoll = (enr.rollNumber || '').toLowerCase().includes(query);

        if (!matchName && !matchCode && !matchEnrollmentId && !matchAdmission && !matchRoll) {
          return false;
        }
      }
      return true;
    });
  }, [enrollments, filters]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredEnrollments.map((e) => e.id);
    const areAllSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      const set = new Set([...selectedIds, ...allFilteredIds]);
      setSelectedIds(Array.from(set));
    }
  };

  // Actions
  const handleQuickPromote = (enrollment: Enrollment) => {
    navigate(
      `/admissions/promote?studentId=${enrollment.studentId}&sourceEnrollmentId=${enrollment.enrollmentId}`,
    );
  };

  const handleQuickRepeat = (enrollment: Enrollment) => {
    navigate(
      `/admissions/repeat?studentId=${enrollment.studentId}&sourceEnrollmentId=${enrollment.enrollmentId}`,
    );
  };

  const handleQuickTransfer = (enrollment: Enrollment) => {
    setTransferModalTarget(enrollment);
  };

  const handleConfirmTransfer = async (payload: {
    enrollmentId: string;
    transferDate: string;
    transferReason: string;
    transferCertificateNumber?: string;
    remarks?: string;
  }) => {
    try {
      await transferOutStudentMutation(payload).unwrap();
      refreshEnrollments();
      setTransferModalTarget(null);
      showFeedback(
        `Student ${payload.enrollmentId} transferred out successfully. TC: ${payload.transferCertificateNumber || 'N/A'}`,
      );
    } catch (err: any) {
      showFeedback(
        getApiErrorMessage(err, 'Failed to transfer out student'),
        'danger',
      );
    }
  };

  const handleViewHistory = (enrollment: Enrollment) => {
    setHistoryModalTarget(enrollment);
  };

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEditModalTarget(enrollment);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Enrollment>) => {
    try {
      await updateEnrollmentMutation({ id, data: updates }).unwrap();
      refreshEnrollments();
      setEditModalTarget(null);
      showFeedback('Enrollment updated successfully.');
    } catch (err: any) {
      showFeedback(
        getApiErrorMessage(err, 'Failed to update enrollment'),
        'danger',
      );
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Top Header */}
      <AdmissionHeader
        selectedYear={filters.academicYear}
        availableYears={availableYears}
        onYearChange={(year) => setFilters((prev) => ({ ...prev, academicYear: year }))}
      />

      {/* Feedback Banner */}
      {feedback && (
        <Alert
          variant={feedback.variant}
          dismissible
          onClose={() => setFeedback(null)}
          className="py-2 small mb-3"
        >
          {feedback.message}
        </Alert>
      )}

      {/* Compact ERP Summary KPI Cards */}
      <AdmissionStatsGrid stats={stats} activeYear={filters.academicYear} />

      {/* Filters Bar */}
      <EnrollmentFilterBar
        filters={filters}
        availableYears={availableYears}
        availableClasses={availableClasses}
        availableSections={availableSections}
        onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onResetFilters={() => setFilters(DEFAULT_ENROLLMENT_FILTERS)}
        filteredCount={filteredEnrollments.length}
        totalCount={enrollments.length}
      />

      {/* Enrollments Table */}
      <EnrollmentTable
        enrollments={filteredEnrollments}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onQuickPromote={handleQuickPromote}
        onQuickRepeat={handleQuickRepeat}
        onQuickTransfer={handleQuickTransfer}
        onViewHistory={handleViewHistory}
        onEditEnrollment={handleEditEnrollment}
      />

      {/* History Modal */}
      <HistoryModal
        show={!!historyModalTarget}
        enrollment={historyModalTarget}
        historyList={
          historyModalTarget
            ? enrollments.filter((e) => e.studentId === historyModalTarget.studentId)
            : []
        }
        onHide={() => setHistoryModalTarget(null)}
      />

      {/* Transfer Out Modal */}
      <QuickTransferOutModal
        show={!!transferModalTarget}
        enrollment={transferModalTarget}
        onHide={() => setTransferModalTarget(null)}
        onConfirm={handleConfirmTransfer}
      />

      {/* Edit Enrollment Modal */}
      <EditEnrollmentModal
        show={!!editModalTarget}
        enrollment={editModalTarget}
        availableClasses={availableClasses}
        availableSections={availableSections}
        onHide={() => setEditModalTarget(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
