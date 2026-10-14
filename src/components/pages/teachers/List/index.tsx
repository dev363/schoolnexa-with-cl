import React, { useState, useEffect, useMemo } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { GraduationCap, Plus, Upload, Download, RefreshCw, AlertCircle } from 'lucide-react';
import {
  useGetTeachersQuery,
  useGetTeacherMetadataQuery,
  useUpdateTeacherStatusMutation,
} from '@/store/teachers';
import type { TeacherQueryParams } from '@/store/teachers';
import {
  Teacher,
  TeacherFilters as FilterStateType,
  TeacherStatus,
} from '@/components/pages/teachers/types';
import { SummaryCards as TeacherSummaryCards } from '@/components/pages/teachers/Common';
import { Filters as TeacherFilters } from './Filters';
import { Table as TeacherTable } from './Table';
import { Pagination as TeacherPagination } from './Pagination';
import {
  DeactivateModal as DeactivateTeacherModal,
  BulkActionModal as BulkTeacherActionModal,
  ImportModal as ImportTeacherModal,
  ExportModal as ExportTeacherModal,
  AssignSubjectModal,
  AssignClassTeacherModal,
} from '@/components/pages/teachers/Actions';
import { TopHeader } from '@/components/common';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

const DEFAULT_FILTERS: FilterStateType = {
  searchTerm: '',
  status: 'ALL',
  employmentType: 'ALL',
  department: 'ALL',
  designation: 'ALL',
  gender: 'ALL',
  qualification: '',
  joiningYear: 'ALL',
};

export const TeacherListView: React.FC = () => {
  const toast = useToast();
  const { activeSchool, activeAcademicYear, hasPermission } = useAuth();
  const canCreate = hasPermission ? hasPermission('teachers.create') : true;

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters & Pagination UI State
  const [filters, setFilters] = useState<FilterStateType>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounced search term for stable query requests
  const [debouncedSearch, setDebouncedSearch] = useState(filters.searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Construct typed RTK Query arguments
  const queryParams: TeacherQueryParams = useMemo(() => {
    const params: TeacherQueryParams = {
      page: currentPage,
      pageSize,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status as any;
    }
    if (filters.employmentType && filters.employmentType !== 'ALL') {
      params.employmentType = filters.employmentType as any;
    }
    if (filters.department && filters.department !== 'ALL') {
      params.departmentName = filters.department;
      params.departmentId = filters.department;
    }
    if (filters.designation && filters.designation !== 'ALL') {
      params.designationName = filters.designation;
      params.designationId = filters.designation;
    }
    if (filters.gender && filters.gender !== 'ALL') {
      params.gender = filters.gender;
    }

    return params;
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    filters.status,
    filters.employmentType,
    filters.department,
    filters.designation,
    filters.gender,
  ]);

  // RTK Query: Teacher directory and metadata hooks
  const {
    data: teacherListData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTeachersQuery(queryParams);

  const { data: metadataData } = useGetTeacherMetadataQuery();
  const [updateTeacherStatus] = useUpdateTeacherStatusMutation();

  // Modals state
  const [deactivatingTeacher, setDeactivatingTeacher] = useState<Teacher | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [assignSubjectTeacher, setAssignSubjectTeacher] = useState<Teacher | null>(null);
  const [assignClassTeacher, setAssignClassTeacher] = useState<Teacher | null>(null);

  // Derived departments & designations from RTK Query metadata
  const departments = metadataData?.departments || [];
  const designations = metadataData?.designations || [];

  // Teachers directly from RTK Query response (never copied into local state)
  const teachers = teacherListData?.teachers ?? [];
  const totalItems = teacherListData?.pagination?.total ?? teacherListData?.total ?? 0;

  // Apply optional client-side filters for non-backend fields (qualification, joiningYear)
  const displayedTeachers = useMemo(() => {
    let list = teachers;

    if (filters.qualification.trim()) {
      const q = filters.qualification.toLowerCase().trim();
      list = list.filter((t) =>
        t.qualifications?.some(
          (qual) =>
            qual.degree?.toLowerCase().includes(q) ||
            qual.specialization?.toLowerCase().includes(q) ||
            qual.university?.toLowerCase().includes(q),
        ),
      );
    }

    if (filters.joiningYear !== 'ALL') {
      list = list.filter((t) => {
        if (!t.joiningDate) return false;
        const year = t.joiningDate.slice(0, 4);
        if (filters.joiningYear === '2020') {
          return parseInt(year, 10) <= 2020;
        }
        return year === filters.joiningYear;
      });
    }

    return list;
  }, [teachers, filters.qualification, filters.joiningYear]);

  // Filter actions
  const handleFilterChange = (updates: Partial<FilterStateType>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1); // Reset page on filter modification
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayedTeachers.map((t) => t.teacherId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (teacherId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, teacherId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  // Status mutations
  const handleDeactivateConfirm = async (teacherId: string, reason: string) => {
    try {
      await updateTeacherStatus({
        teacherId,
        status: 'INACTIVE',
        reason,
      }).unwrap();
      toast.success(`Teacher ${teacherId} status set to Inactive.`);
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(
          err,
          `Unable to set teacher ${teacherId} status to Inactive.`,
        ),
      );
    } finally {
      setDeactivatingTeacher(null);
    }
  };

  const handleActivateConfirm = async (teacherId: string) => {
    try {
      await updateTeacherStatus({
        teacherId,
        status: 'ACTIVE',
      }).unwrap();
      toast.success(`Teacher ${teacherId} re-activated.`);
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(err, `Unable to re-activate teacher ${teacherId}.`),
      );
    }
  };

  const handleBulkStatusConfirm = async (targetStatus: TeacherStatus) => {
    try {
      for (const id of selectedIds) {
        await updateTeacherStatus({
          teacherId: id,
          status: targetStatus,
          reason: 'Bulk status change',
        }).unwrap();
      }
      toast.success(`Updated status for ${selectedIds.length} teachers to ${targetStatus}.`);
    } catch (err: any) {
      toast.error(
        getApiErrorMessage(
          err,
          'Failed to update status for selected teachers.',
        ),
      );
    } finally {
      setSelectedIds([]);
      setShowBulkModal(false);
    }
  };

  // Import handler
  const handleImportSuccess = (count: number) => {
    toast.success(
      `Successfully imported ${count} teachers with automatically assigned Teacher IDs.`,
    );
    refetch();
  };

  return (
    <div className="py-2 d-flex flex-column gap-3">
      {/* Standardized SchoolNexa TopHeader */}
      <TopHeader
        title="Teachers"
        icon={GraduationCap}
        subtitle="Manage teacher profiles, employment info, qualifications, and academic assignments."
        badges={[
          {
            bg: 'primary',
            label: activeAcademicYear?.name || 'Active Session',
          },
          {
            bg: 'secondary',
            label: activeSchool?.name || 'School',
          },
          {
            bg: 'info',
            label: `${totalItems} Faculty`,
          },
        ]}
        actions={[
          {
            name: 'Refresh',
            icon: RefreshCw,
            action: () => refetch(),
            variant: 'outline-secondary',
            loading: isFetching,
          },
          {
            name: 'Import',
            icon: Upload,
            action: () => setShowImportModal(true),
            variant: 'outline-secondary',
          },
          {
            name: 'Export',
            icon: Download,
            action: () => setShowExportModal(true),
            variant: 'outline-secondary',
          },
          ...(canCreate
            ? [
                {
                  name: 'Add Teacher',
                  icon: Plus,
                  link: '/teachers/add',
                  variant: 'primary',
                },
              ]
            : []),
        ]}
      />

      {/* Summary Stat Cards */}
      <TeacherSummaryCards teachers={teachers} />

      {/* Search & Filters */}
      <TeacherFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        departments={departments}
        designations={designations}
        totalCount={totalItems}
        filteredCount={displayedTeachers.length}
      />

      {/* Error Alert Display */}
      {isError && (
        <Alert variant="danger" className="d-flex align-items-center justify-content-between mb-3 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={18} className="text-danger flex-shrink-0" />
            <div>
              <div className="fw-semibold">Unable to load teachers from server</div>
              <div className="small text-danger text-opacity-75">
                {typeof error === 'object' && error && 'message' in error
                  ? (error as any).message
                  : 'Please check your network connection and credentials, then retry.'}
              </div>
            </div>
          </div>
          <Button variant="outline-danger" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold small text-primary">
              Selected: {selectedIds.length} teachers
            </span>
            <Button
              variant="link"
              size="sm"
              className="p-0 text-muted small text-decoration-none"
              onClick={() => setSelectedIds([])}
            >
              (Clear selection)
            </Button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
              className="d-flex align-items-center gap-1"
            >
              Change Status
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="d-flex align-items-center gap-1"
            >
              <Download size={14} /> Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* Teacher Table with Loading and Pagination */}
      {!isError && (
        <div>
          <TeacherTable
            teachers={displayedTeachers}
            selectedIds={selectedIds}
            loading={isLoading}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onOpenDeactivateModal={(t) => setDeactivatingTeacher(t)}
            onActivateTeacher={handleActivateConfirm}
            onOpenAssignSubjectModal={(t) => setAssignSubjectTeacher(t)}
            onOpenClassTeacherModal={(t) => setAssignClassTeacher(t)}
          />

          <TeacherPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Modals */}
      <DeactivateTeacherModal
        show={!!deactivatingTeacher}
        teacher={deactivatingTeacher}
        onHide={() => setDeactivatingTeacher(null)}
        onConfirm={handleDeactivateConfirm}
      />

      <BulkTeacherActionModal
        show={showBulkModal}
        selectedCount={selectedIds.length}
        onHide={() => setShowBulkModal(false)}
        onConfirm={handleBulkStatusConfirm}
      />

      <ImportTeacherModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      <ExportTeacherModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        filteredTeachers={displayedTeachers}
        allTeachers={teachers}
      />

      <AssignSubjectModal
        show={!!assignSubjectTeacher}
        teacher={assignSubjectTeacher}
        onHide={() => setAssignSubjectTeacher(null)}
        onSuccess={(asg) => {
          toast.success(
            `Assigned ${asg.subjectName} (${asg.className}-${asg.sectionName}) to ${asg.teacherId}.`,
          );
          refetch();
        }}
      />

      <AssignClassTeacherModal
        show={!!assignClassTeacher}
        teacher={assignClassTeacher}
        onHide={() => setAssignClassTeacher(null)}
        onSuccess={(asg) => {
          toast.success(
            `Designated ${asg.teacherId} as Class Teacher for ${asg.className} (${asg.sectionName}).`,
          );
          refetch();
        }}
      />
    </div>
  );
};

export const List = TeacherListView;
export default TeacherListView;
