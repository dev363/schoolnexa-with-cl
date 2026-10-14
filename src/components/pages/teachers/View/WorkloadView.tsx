import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Badge,
  Button,
  ProgressBar,
  Row,
  Col,
  Form,
  InputGroup,
  Spinner,
} from 'react-bootstrap';
import {
  Activity,
  Award,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useGetTeachersQuery,
  useGetWorkloadSummaryQuery,
} from '@/store/teachers';
import { Teacher, TeacherWorkload, WorkloadSummary, WorkloadStatus } from '@/components/pages/teachers/types';
import { TopHeader, InfoCard } from '@/components/common';
import { Avatar as TeacherAvatar, EmploymentTypeBadge } from '@/components/pages/teachers/Common';
import { AssignSubjectModal, AssignClassTeacherModal } from '@/components/pages/teachers/Actions';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const TeacherWorkloadView: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeSchool, activeAcademicYear, token, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const canEdit = hasPermission ? hasPermission('teachers.edit') : true;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal target
  const [targetTeacher, setTargetTeacher] = useState<Teacher | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);

  // RTK Query: Single source of truth for all teachers & workload summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isRefreshing,
    refetch: refetchSummary,
  } = useGetWorkloadSummaryQuery();

  const {
    data: teachersResponse,
    isLoading: isTeachersLoading,
    refetch: refetchTeachers,
  } = useGetTeachersQuery({ pageSize: 100 });

  const teachers = teachersResponse?.teachers || [];
  const loading = isSummaryLoading || isTeachersLoading;

  const summary = useMemo<WorkloadSummary>(() => {
    if (summaryData) return summaryData;
    return {
      totalTeachers: 0,
      assignedTeachers: 0,
      unassignedTeachers: 0,
      averagePeriodsPerTeacher: 0,
      totalPeriodsAssigned: 0,
      underloadedCount: 0,
      balancedCount: 0,
      overloadedCount: 0,
      teachers: [],
    };
  }, [summaryData]);

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        summary.teachers
          .map((t) => t.departmentName)
          .filter((d): d is string => Boolean(d)),
      ),
    );
  }, [summary.teachers]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchTeachers()]);
    toast.success('Workload statistics refreshed.');
  };

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    if (!summary?.teachers) return [];

    return summary.teachers.filter((t) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const tid = (t.employeeCode || t.teacherId || '').toLowerCase();
        const name = (t.teacherName || '').toLowerCase();
        const dept = (t.departmentName || '').toLowerCase();
        if (!tid.includes(q) && !name.includes(q) && !dept.includes(q)) {
          return false;
        }
      }

      // Department
      if (departmentFilter !== 'ALL' && t.departmentName !== departmentFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && t.workloadStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [summary, searchTerm, departmentFilter, statusFilter]);

  const handleOpenAssignSubject = (t: TeacherWorkload) => {
    const fullTeacher = teachers.find(
      (tc) => tc.teacherId === t.teacherId || tc.teacherId === t.employeeCode,
    );
    if (fullTeacher) {
      setTargetTeacher(fullTeacher);
      setShowSubjectModal(true);
    }
  };

  const handleOpenAssignClassTeacher = (t: TeacherWorkload) => {
    const fullTeacher = teachers.find(
      (tc) => tc.teacherId === t.teacherId || tc.teacherId === t.employeeCode,
    );
    if (fullTeacher) {
      setTargetTeacher(fullTeacher);
      setShowClassTeacherModal(true);
    }
  };

  return (
    <div className="py-2 d-flex flex-column gap-3">
      {/* TopHeader */}
      <TopHeader
        title="Teacher Workload Management"
        icon={Activity}
        subtitle="Monitor academic teaching loads, period distribution, and class teacher assignments."
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
            label: `${summary?.totalTeachers || 0} Faculty`,
          },
        ]}
        actions={[
          {
            name: 'Directory',
            icon: GraduationCap,
            action: () => navigate('/teachers'),
            variant: 'outline-secondary',
          },
          {
            name: 'Refresh',
            icon: RefreshCw,
            action: handleRefresh,
            variant: 'outline-secondary',
            loading: isRefreshing,
          },
        ]}
      />

      {/* Metric Summary Cards */}
      <Row className="g-2">
        <Col xs={6} md={4} lg={2.4 as any}>
          <InfoCard
            label="Total Teachers"
            value={summary?.totalTeachers || 0}
            description="Active teaching faculty"
            icon={Users}
            iconColor="text-primary"
          />
        </Col>
        <Col xs={6} md={4} lg={2.4 as any}>
          <InfoCard
            label="Balanced"
            value={summary?.balancedCount || 0}
            description="18 - 28 periods / wk"
            icon={CheckCircle2}
            iconColor="text-success"
            valueClassName="h5 fw-bold font-monospace mb-1 text-success"
          />
        </Col>
        <Col xs={6} md={4} lg={2.4 as any}>
          <InfoCard
            label="Underloaded"
            value={summary?.underloadedCount || 0}
            description="< 18 periods / wk"
            icon={AlertTriangle}
            iconColor="text-warning"
            valueClassName="h5 fw-bold font-monospace mb-1 text-warning"
          />
        </Col>
        <Col xs={6} md={4} lg={2.4 as any}>
          <InfoCard
            label="Overloaded"
            value={summary?.overloadedCount || 0}
            description="> 28 periods / wk"
            icon={TrendingUp}
            iconColor="text-danger"
            valueClassName="h5 fw-bold font-monospace mb-1 text-danger"
          />
        </Col>
        <Col xs={12} md={4} lg={2.4 as any}>
          <InfoCard
            label="Avg Periods / Teacher"
            value={`${summary?.averagePeriodsPerTeacher || 0} / wk`}
            description="Target capacity: 24"
            icon={Activity}
            iconColor="text-info"
          />
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by teacher name, ID, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={6} md={3}>
              <Form.Select
                size="sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={6} md={3}>
              <Form.Select
                size="sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Workload Statuses</option>
                <option value="BALANCED">Balanced (18-28 periods)</option>
                <option value="UNDERLOADED">Underloaded (&lt; 18 periods)</option>
                <option value="OVERLOADED">Overloaded (&gt; 28 periods)</option>
              </Form.Select>
            </Col>

            <Col xs={12} md={1} className="text-end">
              {(searchTerm || departmentFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  title="Reset filters"
                >
                  Clear
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Workload Table */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className="border shadow-sm"
      >
        <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
          <span className="fw-bold small text-uppercase text-muted d-flex align-items-center gap-1.5">
            <Activity size={15} className="text-primary" />
            <span>Faculty Workload Register ({filteredTeachers.length})</span>
          </span>
          <span className="text-muted small">Standard full-time baseline: 24 periods/wk</span>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" variant="primary" className="me-2" />
              <span className="text-muted small">Loading workload distribution...</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              No faculty records matching filter criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="mb-0 align-middle">
                <thead>
                  <tr className="small text-muted text-uppercase border-bottom">
                    <th style={{ width: '22%' }}>Teacher</th>
                    <th style={{ width: '16%' }}>Department</th>
                    <th style={{ width: '16%' }}>Class Teacher Duty</th>
                    <th style={{ width: '16%' }}>Subject Load</th>
                    <th style={{ width: '16%' }}>Workload Capacity</th>
                    {canEdit && (
                      <th style={{ width: '14%' }} className="text-end">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => {
                    const statusVariant: 'success' | 'warning' | 'danger' =
                      t.workloadStatus === 'BALANCED'
                        ? 'success'
                        : t.workloadStatus === 'UNDERLOADED'
                          ? 'warning'
                          : 'danger';

                    return (
                      <tr key={t.employeeCode || t.teacherId}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <TeacherAvatar name={t.teacherName} size={32} />
                            <div>
                              <div
                                className="fw-semibold text-primary cursor-pointer hover-underline"
                                onClick={() =>
                                  navigate(
                                    `/teachers/view/${t.employeeCode || t.teacherId}?tab=assignments`,
                                  )
                                }
                                title="View profile & assignments"
                                style={{ cursor: 'pointer' }}
                              >
                                {t.teacherName}
                              </div>
                              <div
                                className="d-flex align-items-center gap-1.5 font-monospace text-muted"
                                style={{ fontSize: '0.72rem' }}
                              >
                                <span>{t.employeeCode || t.teacherId}</span>
                                <span>•</span>
                                <EmploymentTypeBadge type={t.employmentType} />
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="small fw-semibold">{t.departmentName || 'General'}</div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            {t.designationName || 'Teacher'}
                          </div>
                        </td>

                        <td>
                          {t.classTeacherAssignment ? (
                            <Badge
                              bg="warning"
                              text="dark"
                              className="border px-2 py-1 font-monospace"
                            >
                              <Award size={12} className="me-1" />
                              {t.classTeacherAssignment.className}-
                              {t.classTeacherAssignment.sectionName}
                            </Badge>
                          ) : (
                            <span className="text-muted small">None assigned</span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {t.subjectAssignments && t.subjectAssignments.length > 0 ? (
                              t.subjectAssignments.slice(0, 2).map((asg) => (
                                <Badge
                                  key={asg.id}
                                  bg="light"
                                  text="dark"
                                  className="border"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {asg.subjectName} ({asg.className})
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted small">No subjects</span>
                            )}
                            {t.subjectAssignments && t.subjectAssignments.length > 2 && (
                              <Badge bg="secondary" style={{ fontSize: '0.68rem' }}>
                                +{t.subjectAssignments.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold small">
                              {t.totalWeeklyPeriods}{' '}
                              <span className="text-muted fw-normal">
                                / {t.targetWeeklyPeriods} per/wk
                              </span>
                            </span>
                            <Badge bg={statusVariant} style={{ fontSize: '0.68rem' }}>
                              {t.workloadStatus}
                            </Badge>
                          </div>
                          <ProgressBar
                            variant={statusVariant}
                            now={Math.min(t.workloadPercentage, 100)}
                            style={{ height: '6px' }}
                          />
                        </td>

                        {canEdit && (
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="p-1 px-1.5"
                                onClick={() => handleOpenAssignSubject(t)}
                                title="Assign Subject"
                              >
                                <BookOpen size={13} />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="p-1 px-1.5 text-dark"
                                onClick={() => handleOpenAssignClassTeacher(t)}
                                title="Assign Class Teacher"
                              >
                                <Award size={13} />
                              </Button>
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="p-1 px-1.5"
                                onClick={() =>
                                  navigate(
                                    `/teachers/view/${t.employeeCode || t.teacherId}?tab=timetable`,
                                  )
                                }
                                title="View Timetable"
                              >
                                <Calendar size={13} />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="p-1 px-1.5"
                                onClick={() =>
                                  navigate(
                                    `/teachers/view/${t.employeeCode || t.teacherId}?tab=assignments`,
                                  )
                                }
                                title="View Details"
                              >
                                <ExternalLink size={13} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      {targetTeacher && (
        <>
          <AssignSubjectModal
            show={showSubjectModal}
            teacher={targetTeacher}
            onHide={() => {
              setShowSubjectModal(false);
              setTargetTeacher(null);
            }}
            onSuccess={() => {
              handleRefresh();
            }}
          />

          <AssignClassTeacherModal
            show={showClassTeacherModal}
            teacher={targetTeacher}
            onHide={() => {
              setShowClassTeacherModal(false);
              setTargetTeacher(null);
            }}
            onSuccess={() => {
              handleRefresh();
            }}
          />
        </>
      )}
    </div>
  );
};

export const WorkloadView = TeacherWorkloadView;
export default TeacherWorkloadView;

