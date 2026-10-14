import React, { useState, useEffect, useMemo } from 'react';
import { Card, Nav, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  GraduationCap,
  Edit2,
  ArrowLeft,
  BookOpen,
  Calendar,
  Briefcase,
  FileText,
  Layers,
  Clock,
  History,
  RefreshCw,
  UserCheck,
  UserX,
  Trash2,
  Award,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TopHeader, ActionButtonGroup, ConfirmModal } from '@/components/common';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { TeacherAvatar } from '@/components/pages/teachers/Common';
import {
  useGetTeacherQuery,
  useGetTeacherWorkloadQuery,
  useGetTeacherQualificationsQuery,
  useGetTeacherExperienceQuery,
  useGetTeacherDocumentsQuery,
  useGetTeacherAssignmentsQuery,
  useGetTeacherTimetableQuery,
  useGetTeacherActivitiesQuery,
  useUpdateTeacherStatusMutation,
  useDeleteTeacherMutation,
  useRemoveSubjectAssignmentMutation,
  useRemoveClassTeacherAssignmentMutation,
} from '@/store/teachers';

// Sub-tab View Panels
import { ProfileOverviewTab } from './OverviewView';
import { TeacherBasicView } from './PersonalView';
import { TeacherEmploymentView } from './EmploymentView';
import { TeacherQualificationsView } from './QualificationsView';
import { TeacherExperienceView } from './ExperienceView';
import { TeacherDocumentsView } from './DocumentsView';
import { ProfileAssignmentsTab } from './AssignmentsView';
import { ProfileTimetableTab } from './TimetableView';
import { ProfileActivityTab } from './ActivityView';

// Action Modals
import {
  AssignSubjectModal,
  AssignClassTeacherModal,
  DeactivateTeacherModal,
} from '@/components/pages/teachers/Actions';

export type ProfileTabKey =
  | 'overview'
  | 'basic'
  | 'personal'
  | 'employment'
  | 'qualifications'
  | 'experience'
  | 'documents'
  | 'assignments'
  | 'timetable'
  | 'activity';

interface TabItem {
  eventKey: ProfileTabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  activeKeys?: ProfileTabKey[];
}

const InfoRow: React.FC<{
  label?: string;
  value: React.ReactNode;
  isMono?: boolean;
}> = ({ label, value, isMono }) => {
  if (!value) return null;
  return (
    <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
      {label && <span className="text-muted">{label}:</span>}
      <span className={isMono ? 'font-monospace' : 'fw-medium'}>{value}</span>
    </div>
  );
};

const BadgeButtonGroup: React.FC<{
  badges: Array<{ bg: string; label: string }>;
}> = ({ badges }) => (
  <div className="d-flex align-items-center gap-1">
    {badges.map((b, i) => (
      <Badge
        key={i}
        bg={b.bg}
        className="fw-semibold px-2 py-1 text-uppercase"
        style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
      >
        {b.label}
      </Badge>
    ))}
  </div>
);

const TabList: React.FC<{
  activeTab: ProfileTabKey;
  onSelect: (k: ProfileTabKey) => void;
  tabs: TabItem[];
}> = ({ activeTab, onSelect, tabs }) => (
  <Nav
    variant="tabs"
    className="profile-nav-tabs border-bottom mb-3"
    style={{ borderColor: 'var(--bs-border-color)' }}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive =
        activeTab === tab.eventKey ||
        (tab.activeKeys && tab.activeKeys.includes(activeTab));
      return (
        <Nav.Item key={tab.eventKey}>
          <Nav.Link
            active={isActive}
            onClick={() => onSelect(tab.eventKey)}
            className="d-flex align-items-center gap-1.5 py-2 px-3 fw-medium cursor-pointer"
            style={{ fontSize: '0.85rem' }}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <Badge
                bg={isActive ? 'primary' : 'secondary'}
                pill
                className="ms-1"
                style={{ fontSize: '0.65rem' }}
              >
                {tab.count}
              </Badge>
            )}
          </Nav.Link>
        </Nav.Item>
      );
    })}
  </Nav>
);

export const TeacherProfileView: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { toast } = useToast();
  const { activeSchool, hasPermission } = useAuth();

  // Permissions check
  const canEdit = hasPermission ? hasPermission('teachers.edit') : true;
  const canDeactivate = hasPermission ? hasPermission('teachers.edit') : true;
  const canDelete = hasPermission ? hasPermission('teachers.delete') : true;

  // Active navigation tab (persists across query params ?tab=...)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = (queryParams.get('tab') as ProfileTabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(initialTab);

  // Synchronize URL tab query with active tab state
  useEffect(() => {
    const tabFromUrl = queryParams.get('tab') as ProfileTabKey;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const handleTabSelect = (tab: ProfileTabKey) => {
    setActiveTab(tab);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  // 1. RTK Query Hook: Single Source of Truth for Teacher Details
  const {
    data: teacherDetail,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTeacherQuery(teacherId!, {
    skip: !teacherId,
  });

  // 2. RTK Query Hook: Workload Details
  const { data: workload } = useGetTeacherWorkloadQuery(teacherId!, {
    skip: !teacherId,
  });

  // 3. RTK Query Mutations
  const [updateTeacherStatus] = useUpdateTeacherStatusMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  const [removeSubjectAssignment] = useRemoveSubjectAssignmentMutation();
  const [removeClassTeacherAssignment] = useRemoveClassTeacherAssignmentMutation();

  // Modals state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);

  // RTK Query Submodule Queries
  const { data: activityLogs = [] } = useGetTeacherActivitiesQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: assignmentsData } = useGetTeacherAssignmentsQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: timetableSlotsData } = useGetTeacherTimetableQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: qualificationsData } = useGetTeacherQualificationsQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: experiencesData } = useGetTeacherExperienceQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: documentsData } = useGetTeacherDocumentsQuery(teacherId!, {
    skip: !teacherId,
  });

  // Derived data directly from RTK Query
  const teacher = teacherDetail?.teacher;
  const subjectAssignments = useMemo(
    () => assignmentsData?.subjectAssignments || teacherDetail?.subjectAssignments || [],
    [assignmentsData?.subjectAssignments, teacherDetail?.subjectAssignments],
  );
  const classTeacherAssignment = assignmentsData?.classAssignment ?? teacherDetail?.classAssignment;
  const timetableSlots = useMemo(
    () =>
      timetableSlotsData && timetableSlotsData.length > 0
        ? timetableSlotsData
        : teacherDetail?.timetableSlots || [],
    [timetableSlotsData, teacherDetail?.timetableSlots],
  );
  const qualifications = qualificationsData ?? teacher?.qualifications ?? [];
  const experiences = experiencesData ?? teacher?.experiences ?? [];
  const documents = documentsData ?? teacher?.documents ?? [];

  // Status Management Handler (Deactivation)
  const handleDeactivate = async (tId: string, reason: string) => {
    try {
      await updateTeacherStatus({
        teacherId: tId,
        status: 'INACTIVE',
        reason,
      }).unwrap();
      toast.success(`Teacher ${tId} status updated to Inactive.`);
    } catch (err: any) {
      console.error('Failed to deactivate teacher:', err);
      const errMsg = getApiErrorMessage(
        err,
        `Failed to update teacher ${tId} status.`,
      );
      toast.error(errMsg);
    } finally {
      setShowDeactivateModal(false);
    }
  };

  // Status Management Handler (Activation)
  const handleActivate = async () => {
    if (!teacher) return;
    try {
      await updateTeacherStatus({
        teacherId: teacher.teacherId,
        status: 'ACTIVE',
      }).unwrap();
      toast.success(`Teacher ${teacher.teacherId} re-activated successfully.`);
    } catch (err: any) {
      console.error('Failed to activate teacher:', err);
      const errMsg = getApiErrorMessage(
        err,
        'Failed to re-activate teacher.',
      );
      toast.error(errMsg);
    }
  };

  // Delete Teacher Master Record Handler
  const handleDelete = async () => {
    if (!teacher) return;
    try {
      await deleteTeacher(teacher.teacherId).unwrap();
      toast.success(`Teacher ${teacher.teacherId} record deleted successfully.`);
      navigate('/teachers');
    } catch (err: any) {
      console.error('Failed to delete teacher record:', err);
      const errMsg = getApiErrorMessage(
        err,
        'Failed to delete teacher record.',
      );
      toast.error(errMsg);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Remove Subject Assignment Handler
  const handleRemoveSubjectAssignment = async (asgId: string) => {
    if (!teacher) return;
    try {
      await removeSubjectAssignment({
        teacherId: teacher.teacherId,
        assignmentId: asgId,
      }).unwrap();
      toast.success('Subject unassigned successfully.');
    } catch (err: any) {
      console.error('Failed to unassign subject:', err);
      const errMsg = getApiErrorMessage(
        err,
        'Failed to unassign subject.',
      );
      toast.error(errMsg);
    }
  };

  // Relieve Class Teacher Handler
  const handleRelieveClassTeacher = async () => {
    if (!teacher || !classTeacherAssignment?.id) return;
    try {
      await removeClassTeacherAssignment({
        teacherId: teacher.teacherId,
        assignmentId: classTeacherAssignment.id,
      }).unwrap();
      toast.success('Teacher relieved from Class Teacher duty.');
    } catch (err: any) {
      console.error('Failed to relieve Class Teacher:', err);
      const errMsg = getApiErrorMessage(
        err,
        'Failed to relieve Class Teacher.',
      );
      toast.error(errMsg);
    }
  };

  // Initial Loading UI
  if (isLoading && !teacher) {
    return (
      <div className="text-center py-5 border rounded bg-light bg-opacity-25 my-4">
        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
        <span className="text-muted small">Loading teacher profile...</span>
      </div>
    );
  }

  // Error / Not Found UI
  if (isError || !teacher) {
    return (
      <div className="py-4">
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          <div>
            <strong>Unable to Load Teacher Record:</strong>{' '}
            {typeof error === 'object' && error && 'message' in error
              ? (error as any).message
              : `Could not find teacher matching ID "${teacherId}".`}
          </div>
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} className="me-1" /> Retry
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/teachers')}>
            Back to Teachers List
          </Button>
        </div>
      </div>
    );
  }

  const fullName =
    `${teacher.firstName} ${teacher.middleName ? teacher.middleName + ' ' : ''}${teacher.lastName || ''}`.trim();

  // Navigation tab configuration
  const teacherProfileTabs: TabItem[] = [
    {
      eventKey: 'overview',
      label: 'Overview',
      icon: Layers,
    },
    {
      eventKey: 'basic',
      label: 'Basic Details',
      icon: Shield,
      activeKeys: ['basic', 'personal'],
    },
    {
      eventKey: 'employment',
      label: 'Employment',
      icon: Briefcase,
    },
    {
      eventKey: 'qualifications',
      label: 'Qualifications',
      icon: GraduationCap,
      count: qualifications.length,
    },
    {
      eventKey: 'experience',
      label: 'Experience',
      icon: Clock,
      count: experiences.length,
    },
    {
      eventKey: 'documents',
      label: 'Documents',
      icon: FileText,
      count: documents.length,
    },
    {
      eventKey: 'assignments',
      label: 'Academic Assignments',
      icon: BookOpen,
      count: subjectAssignments.length,
    },
    {
      eventKey: 'timetable',
      label: 'Timetable',
      icon: Calendar,
    },
    {
      eventKey: 'activity',
      label: 'Activity Log',
      icon: History,
    },
  ];

  return (
    <div className="py-2 d-flex flex-column gap-3">
      {/* Standardized SchoolNexa TopHeader */}
      <TopHeader
        title={fullName}
        icon={GraduationCap}
        subtitle={`${teacher.designationName || 'Teacher'} • ${teacher.departmentName || 'General'} • ID: ${teacher.teacherId}`}
        badges={[
          {
            bg: 'secondary',
            label: activeSchool?.name || 'School',
          },
        ]}
        actions={[
          {
            name: 'Back',
            icon: ArrowLeft,
            link: '/teachers',
            variant: 'outline-secondary',
          },
          {
            name: 'Refresh',
            icon: RefreshCw,
            action: () => refetch(),
            variant: 'outline-secondary',
            loading: isFetching,
          },
          ...(canEdit
            ? [
                {
                  name: 'Edit',
                  icon: Edit2,
                  link: `/teachers/edit/${teacher.teacherId}`,
                  variant: 'outline-primary',
                },
              ]
            : []),
        ]}
      />

      {/* Profile Identity Card */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <TeacherAvatar
                photoUrl={teacher.profilePhoto}
                name={fullName}
                size={58}
                status={teacher.status}
                showStatusIndicator
              />

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h4 className="mb-0 fw-bold" style={{ fontSize: '1.25rem' }}>
                    {fullName}
                  </h4>
                  {teacher.preferredName && teacher.preferredName !== fullName && (
                    <span className="text-muted small">({teacher.preferredName})</span>
                  )}

                  <BadgeButtonGroup
                    badges={[
                      {
                        bg: 'primary',
                        label: teacher.teacherId,
                      },
                      {
                        bg: teacher.status === 'ACTIVE' ? 'success' : 'secondary',
                        label: teacher.status,
                      },
                      {
                        bg: 'info',
                        label: teacher.employmentType,
                      },
                    ]}
                  />
                </div>

                <div className="d-flex align-items-center gap-2 mt-1.5 text-muted small flex-wrap">
                  <InfoRow value={teacher.departmentName || 'General'} />

                  {teacher.mobile && (
                    <>
                      <span>•</span>
                      <InfoRow value={teacher.mobile} />
                    </>
                  )}
                  {teacher.email && (
                    <>
                      <span>•</span>
                      <InfoRow value={teacher.email} />
                    </>
                  )}
                  {teacher.workLocation && (
                    <>
                      <span>•</span>
                      <InfoRow value={teacher.workLocation} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <ActionButtonGroup
                actions={[
                  ...(canEdit
                    ? [
                        {
                          name: 'Assign Subject',
                          icon: BookOpen,
                          action: () => setShowAssignSubjectModal(true),
                          variant: 'outline-success',
                        },
                        {
                          name: 'Class Teacher',
                          icon: Award,
                          action: () => setShowClassTeacherModal(true),
                          variant: 'outline-warning',
                        },
                      ]
                    : []),

                  ...(canDeactivate
                    ? teacher.status === 'ACTIVE'
                      ? [
                          {
                            name: 'Deactivate',
                            icon: UserX,
                            action: () => setShowDeactivateModal(true),
                            variant: 'outline-danger',
                          },
                        ]
                      : [
                          {
                            name: 'Activate',
                            icon: UserCheck,
                            action: handleActivate,
                            variant: 'outline-success',
                          },
                        ]
                    : []),

                  ...(canDelete
                    ? [
                        {
                          name: 'Delete',
                          icon: Trash2,
                          action: () => setShowDeleteModal(true),
                          variant: 'outline-danger',
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Profile Section Navigation Tabs */}
      <TabList
        activeTab={activeTab}
        onSelect={handleTabSelect}
        tabs={teacherProfileTabs}
      />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <ProfileOverviewTab
          teacher={teacher}
          subjectAssignments={subjectAssignments}
          classTeacherAssignment={classTeacherAssignment}
          onNavigateTab={handleTabSelect}
          onOpenAssignSubjectModal={() => setShowAssignSubjectModal(true)}
          onRemoveSubjectAssignment={handleRemoveSubjectAssignment}
          canEdit={canEdit}
        />
      )}

      {(activeTab === 'basic' || activeTab === 'personal') && (
        <TeacherBasicView teacher={teacher} />
      )}

      {activeTab === 'employment' && <TeacherEmploymentView teacher={teacher} />}

      {activeTab === 'qualifications' && (
        <TeacherQualificationsView teacher={teacher} teacherId={teacherId} />
      )}

      {activeTab === 'experience' && (
        <TeacherExperienceView teacher={teacher} teacherId={teacherId} />
      )}

      {activeTab === 'documents' && (
        <TeacherDocumentsView teacher={teacher} teacherId={teacherId} />
      )}

      {activeTab === 'assignments' && (
        <ProfileAssignmentsTab
          subjectAssignments={subjectAssignments}
          classTeacherAssignment={classTeacherAssignment}
          workload={workload}
          employmentType={teacher.employmentType}
          teacherId={teacherId}
          onOpenClassTeacherModal={() => setShowClassTeacherModal(true)}
          onRelieveClassTeacher={handleRelieveClassTeacher}
          onOpenAssignSubjectModal={() => setShowAssignSubjectModal(true)}
          onRemoveSubjectAssignment={handleRemoveSubjectAssignment}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'timetable' && (
        <ProfileTimetableTab
          timetableSlots={timetableSlots}
          teacher={teacher}
          teacherId={teacherId}
          subjectAssignments={subjectAssignments}
        />
      )}

      {activeTab === 'activity' && (
        <ProfileActivityTab activityLogs={activityLogs} teacherId={teacherId} />
      )}

      {/* Modals */}
      <DeactivateTeacherModal
        show={showDeactivateModal}
        teacher={teacher}
        onHide={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivate}
      />

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Teacher Record"
        icon={<Trash2 size={16} className="text-danger" />}
        description={
          <span>
            Are you sure you want to permanently delete teacher{' '}
            <strong>{fullName}</strong> (
            <span className="font-monospace text-primary">{teacher.teacherId}</span>)?
            This will archive their master record and remove active assignments.
          </span>
        }
        actions={[
          {
            name: 'Cancel',
            action: () => setShowDeleteModal(false),
            variant: 'outline-secondary',
          },
          {
            name: 'Delete',
            action: handleDelete,
            variant: 'danger',
            loading: isDeleting,
          },
        ]}
      />

      <AssignSubjectModal
        show={showAssignSubjectModal}
        teacher={teacher}
        onHide={() => setShowAssignSubjectModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      <AssignClassTeacherModal
        show={showClassTeacherModal}
        teacher={teacher}
        onHide={() => setShowClassTeacherModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export const View = TeacherProfileView;
export const ProfileView = TeacherProfileView;
export const TeacherView = TeacherProfileView;
export default TeacherProfileView;
