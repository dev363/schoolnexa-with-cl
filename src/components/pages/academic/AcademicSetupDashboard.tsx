import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Row, Col, Table } from 'react-bootstrap';
import {
  CalendarRange,
  Layers,
  BookOpenCheck,
  UserCheck,
  CalendarDays,
  Building2,
  ArrowRight,
  CheckCircle2,
  History,
  GraduationCap,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { TopHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import {
  useGetClassesQuery,
  useGetSectionsQuery,
  useGetCurriculumQuery,
  useGetTeacherAssignmentsQuery,
  useGetSubjectsQuery,
} from '@/store/academic';
import { useGetTeachersQuery } from '@/store/teachers';
import {
  AcademicOverviewStats,
  AcademicAuditLog,
  ClassItem,
  AcademicYearSectionItem,
  ClassSubjectItem,
  TeacherAssignmentItem,
} from '@/types';

interface AcademicSetupDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AcademicSetupDashboard: React.FC<AcademicSetupDashboardProps> = ({
  onNavigateTab,
}) => {
  const { activeSchool, activeAcademicYear } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [auditLogs] = useState<AcademicAuditLog[]>([]);

  // RTK Query hooks
  const { data: rtkClassesData, isLoading: isLoadingClasses } = useGetClassesQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkSectionsData } = useGetSectionsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkCurriculumData } = useGetCurriculumQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkAssignmentsData } = useGetTeacherAssignmentsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkSubjectsData } = useGetSubjectsQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkTeachersData } = useGetTeachersQuery(undefined, { skip: !activeSchool });

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkClassesData) {
      const list = Array.isArray(rtkClassesData?.data)
        ? rtkClassesData.data
        : Array.isArray(rtkClassesData)
          ? rtkClassesData
          : [];
      if (list.length > 0) setClasses(list);
    }
  }, [rtkClassesData]);

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
      if (list.length > 0) setClassSubjects(list);
    }
  }, [rtkCurriculumData]);

  useEffect(() => {
    if (rtkAssignmentsData) {
      const list = Array.isArray(rtkAssignmentsData?.data)
        ? rtkAssignmentsData.data
        : Array.isArray(rtkAssignmentsData)
          ? rtkAssignmentsData
          : [];
      if (list.length > 0) setAssignments(list);
    }
  }, [rtkAssignmentsData]);

  const stats: AcademicOverviewStats = useMemo(() => {
    const academicYears = activeSchool?.academicYears || [];
    const currentYear =
      academicYears.find((ay: any) => ay.isCurrent) || activeAcademicYear || academicYears[0];
    const staffList: any[] = rtkTeachersData?.teachers || [];
    const totalSubjects = rtkSubjectsData
      ? Array.isArray(rtkSubjectsData?.data)
        ? rtkSubjectsData.data.length
        : Array.isArray(rtkSubjectsData)
          ? rtkSubjectsData.length
          : 0
      : 0;

    return {
      totalAcademicYears: academicYears.length,
      currentAcademicYearName: currentYear ? currentYear.name : 'No Active Year',
      totalClasses: classes.length,
      totalSections: sections.length,
      totalSubjects,
      totalClassSubjects: classSubjects.length,
      totalTeacherAssignments: assignments.length,
      totalStaff: staffList.length,
      totalTimetableSlots: 0,
    };
  }, [
    activeSchool,
    activeAcademicYear,
    classes,
    sections,
    classSubjects,
    assignments,
    rtkSubjectsData,
    rtkTeachersData,
  ]);

  if (!activeSchool || !stats) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5 text-muted">
        Loading Academic Setup Overview...
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Standardized Institutional Context Header */}
      <TopHeader
        title={`${activeSchool.name} — Academic Configuration`}
        icon={GraduationCap}
        subtitle="Institutional Context, Master Curriculum, Sections & Teacher Allocations"
        badges={[
          { bg: 'primary', label: `Tenant: ${activeSchool.code}` },
          { bg: 'success', label: `Session: ${stats.currentAcademicYearName}` },
        ]}
        actions={[
          {
            name: 'Profile',
            icon: Building2,
            action: () => onNavigateTab('profile'),
            variant: 'outline-secondary',
          },
          {
            name: 'Academic Sessions',
            icon: CalendarRange,
            action: () => onNavigateTab('academic-years'),
            variant: 'primary',
          },
        ]}
      />

      {/* Key Metric Cards - Compact ERP Grid */}
      <Row className="g-2">
        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('academic-years')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <CalendarRange size={14} className="text-primary" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Sessions
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">
                {stats.totalAcademicYears}
              </div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                {stats.currentAcademicYearName}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('classes')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <GraduationCap size={14} className="text-indigo" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Classes
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">{stats.totalClasses}</div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                Standard Tiers
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('classes')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <Layers size={14} className="text-purple" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Sections
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">{stats.totalSections}</div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                Classroom Rooms
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('curriculum')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <BookOpenCheck size={14} className="text-success" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Subjects
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">{stats.totalSubjects}</div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                Course Catalog
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('curriculum')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <Sparkles size={14} className="text-warning" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Curricula
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">
                {stats.totalClassSubjects}
              </div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                Class Mappings
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('teachers')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <UserCheck size={14} className="text-danger" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Assignments
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">
                {stats.totalTeacherAssignments}
              </div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                {stats.totalStaff} Faculty
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3} lg className="col-lg">
          <Card
            className="shadow-sm border h-100 cursor-pointer text-decoration-none"
            onClick={() => onNavigateTab('timetable')}
            role="button"
          >
            <Card.Body className="p-2.5">
              <div className="d-flex align-items-center justify-content-between text-muted mb-1">
                <CalendarDays size={14} className="text-info" />
                <span className="text-uppercase fw-medium" style={{ fontSize: '0.65rem' }}>
                  Timetable
                </span>
              </div>
              <div className="h5 fw-bold font-monospace mb-0 text-body">
                {stats.totalTimetableSlots || 0}
              </div>
              <div
                className="text-muted small text-truncate mt-0.5"
                style={{ fontSize: '0.72rem' }}
              >
                Weekly Periods
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fast-Track Express Allocator Feature Banner */}
      <Card className="shadow-sm border bg-primary-subtle bg-opacity-25 border-primary-subtle">
        <Card.Body className="p-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shrink-0"
              style={{ width: '40px', height: '40px' }}
            >
              <Wand2 size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold">
                  ⚡ Express Class Allocator (All-in-One Studio)
                </span>
                <Badge bg="primary" style={{ fontSize: '0.65rem' }}>
                  RECOMMENDED
                </Badge>
              </div>
              <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: '0.75rem' }}>
                Tired of jumping between multiple tabs? Map subjects, assign faculty teachers, and
                auto-generate weekly schedules all on one single interactive screen.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('allocator')}
            className="d-inline-flex align-items-center gap-1.5 fw-bold text-nowrap px-3"
          >
            <span>Open Express Allocator</span>
            <ArrowRight size={13} />
          </Button>
        </Card.Body>
      </Card>

      {/* Interactive Academic Structure Matrix */}
      <Card className="shadow-sm border">
        <Card.Header className="py-2.5 px-3 bg-body-tertiary d-flex align-items-center justify-content-between">
          <div>
            <h2
              className="h6 fw-bold mb-0 d-flex align-items-center gap-1.5 text-uppercase"
              style={{ fontSize: '0.75rem' }}
            >
              <Layers size={13} className="text-primary" />
              <span>Academic Operational Roster Breakdown</span>
            </h2>
            <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
              Classes &rarr; Active Sections &rarr; Curriculum Subjects &rarr; Faculty Incharges.
            </p>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => onNavigateTab('classes')}
            className="text-primary fw-semibold p-0 text-decoration-none d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.75rem' }}
          >
            <span>Manage Roster</span>
            <ArrowRight size={12} />
          </Button>
        </Card.Header>

        <Card.Body className="p-3 d-flex flex-column gap-2.5">
          {classes.map((cls) => {
            const classSecs = sections.filter((s) => s.classId === cls.id);
            const classSubs = classSubjects.filter((cs) => cs.classId === cls.id);

            return (
              <Card key={cls.id} className="border shadow-none bg-body-tertiary">
                <Card.Body className="p-2.5">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <Badge
                        bg="primary-subtle"
                        text="primary"
                        className="font-monospace fw-bold"
                        style={{ fontSize: '0.72rem' }}
                      >
                        #{cls.numericOrder}
                      </Badge>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="fw-semibold small">{cls.name}</span>
                        <span
                          className="badge bg-secondary-subtle text-secondary font-monospace"
                          style={{ fontSize: '0.68rem' }}
                        >
                          {cls.code}
                        </span>
                        {cls.stream && (
                          <Badge bg="purple-subtle" text="dark" style={{ fontSize: '0.65rem' }}>
                            {cls.stream}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center gap-3 text-muted small"
                      style={{ fontSize: '0.72rem' }}
                    >
                      <span>
                        <strong>{classSecs.length}</strong> Sections
                      </span>
                      <span>&bull;</span>
                      <span>
                        <strong>{classSubs.length}</strong> Subjects
                      </span>
                    </div>
                  </div>

                  <Row className="g-2 pt-2">
                    {classSecs.length === 0 ? (
                      <Col xs={12}>
                        <div
                          className="text-muted small fst-italic py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          No sections allocated for this session.
                        </div>
                      </Col>
                    ) : (
                      classSecs.map((sec) => {
                        const secAssignments = assignments.filter(
                          (a) => a.academicYearSectionId === sec.id,
                        );
                        const classTeacher = secAssignments.find((a) => a.isClassTeacher);

                        return (
                          <Col sm={6} lg={4} key={sec.id}>
                            <Card className="border shadow-none bg-body p-2">
                              <div className="d-flex align-items-center justify-content-between small fw-medium mb-1">
                                <span className="d-flex align-items-center gap-1.5">
                                  <span
                                    className="rounded-circle bg-primary"
                                    style={{ width: '6px', height: '6px' }}
                                  />
                                  <span>Section {sec.sectionName}</span>
                                </span>
                                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                  {sec.currentCount} / {sec.maxCapacity} students
                                </span>
                              </div>

                              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                <div>
                                  Class Teacher:{' '}
                                  {classTeacher ? (
                                    <strong className="text-body fw-semibold">
                                      {classTeacher.staffName}
                                    </strong>
                                  ) : (
                                    <span className="text-muted fst-italic">Unassigned</span>
                                  )}
                                </div>
                                <div className="text-muted opacity-75">
                                  {secAssignments.length} faculty assignments
                                </div>
                              </div>
                            </Card>
                          </Col>
                        );
                      })
                    )}
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </Card.Body>
      </Card>

      {/* Audit History Log - Compact SaaS Table */}
      <Card className="shadow-sm border">
        <Card.Header className="py-2.5 px-3 bg-body-tertiary d-flex align-items-center justify-content-between">
          <div>
            <h2
              className="h6 fw-bold mb-0 d-flex align-items-center gap-1.5 text-uppercase"
              style={{ fontSize: '0.75rem' }}
            >
              <History size={13} className="text-purple" />
              <span>Administrative Audit Trail (Invariant Logs)</span>
            </h2>
            <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
              Append-only audit events tracking schema and setup modifications.
            </p>
          </div>
          <span className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
            {auditLogs.length} events logged
          </span>
        </Card.Header>

        <Table responsive hover className="align-middle mb-0" style={{ fontSize: '0.78rem' }}>
          <thead className="bg-body-tertiary">
            <tr
              className="border-bottom text-muted small text-uppercase"
              style={{ fontSize: '0.68rem' }}
            >
              <th className="py-2 px-3">Action</th>
              <th className="py-2 px-3">Details</th>
              <th className="py-2 px-3">User / Resource</th>
              <th className="py-2 px-3 text-end">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.slice(0, 8).map((log) => (
              <tr key={log.id}>
                <td className="py-2 px-3 text-nowrap">
                  <Badge
                    bg="primary-subtle"
                    text="primary"
                    className="font-monospace fw-normal"
                    style={{ fontSize: '0.68rem' }}
                  >
                    {log.action}
                  </Badge>
                </td>
                <td className="py-2 px-3 fw-medium">{log.details}</td>
                <td className="py-2 px-3 text-muted text-nowrap" style={{ fontSize: '0.72rem' }}>
                  {log.userName} &bull; <span className="font-monospace">{log.resourceType}</span>
                </td>
                <td
                  className="py-2 px-3 text-end text-muted font-monospace text-nowrap"
                  style={{ fontSize: '0.72rem' }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};
