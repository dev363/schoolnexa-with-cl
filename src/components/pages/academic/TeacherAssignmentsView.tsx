import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Form, Row, Col, Badge, InputGroup, Spinner } from 'react-bootstrap';
import {
  UserCheck,
  Plus,
  Trash2,
  Search,
  Filter,
  Star,
  GraduationCap,
  BookOpen,
  Wand2,
  Users,
  UserPlus,
  Eye,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { TopHeader, InfoCard } from '@/components/common';
import {
  useGetTeacherAssignmentsQuery,
  useCreateTeacherAssignmentMutation,
  useDeleteTeacherAssignmentMutation,
  useGetSectionsQuery,
  useGetClassesQuery,
  useGetCurriculumQuery,
  useGetSubjectsQuery,
} from '@/store/academic';
import { useGetTeachersQuery } from '@/store/teachers';
import { AssignFacultyModal } from './components/AssignFacultyModal';
import { QuickAddTeacherModal } from './components/QuickAddTeacherModal';
import {
  TeacherAssignmentItem,
  AcademicYearSectionItem,
  StaffMember,
  SubjectItem,
  ClassItem,
  ClassSubjectItem,
} from '@/types';
import { Teacher } from '@/components/pages/teachers/types';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const TeacherAssignmentsView: React.FC = () => {
  const navigate = useNavigate();
  const { activeSchool, activeAcademicYear, user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();

  const isDark = theme === 'dark';
  const canManage =
    hasPermission('academics.curriculum.edit') || hasPermission('school.settings.edit');

  const [assignments, setAssignments] = useState<TeacherAssignmentItem[]>([]);
  const [sections, setSections] = useState<AcademicYearSectionItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isQuickAddTeacherOpen, setIsQuickAddTeacherOpen] = useState(false);
  const [preselectedSectionId, setPreselectedSectionId] = useState<string | undefined>(undefined);
  const [preselectedStaffId, setPreselectedStaffId] = useState<string | undefined>(undefined);

  // RTK Query hooks
  const {
    data: rtkAssignmentsData,
    refetch: refetchAssignments,
  } = useGetTeacherAssignmentsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkSectionsData, refetch: refetchSections } = useGetSectionsQuery(
    activeSchool?.id
      ? { schoolId: activeSchool.id, academicYearId: activeAcademicYear?.id }
      : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkClassesData, refetch: refetchClasses } = useGetClassesQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkCurriculumData, refetch: refetchCurriculum } = useGetCurriculumQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkSubjectsData, refetch: refetchSubjects } = useGetSubjectsQuery(
    activeSchool?.id ? { schoolId: activeSchool.id } : undefined,
    { skip: !activeSchool },
  );
  const { data: rtkTeachersData, refetch: refetchTeachers } = useGetTeachersQuery(undefined, {
    skip: !activeSchool,
  });

  const [createTeacherAssignmentMutation] = useCreateTeacherAssignmentMutation();
  const [deleteTeacherAssignmentMutation] = useDeleteTeacherAssignmentMutation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Sync RTK Query store data
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
    if (rtkTeachersData) {
      const list: any[] = rtkTeachersData?.teachers || [];
      if (list.length > 0) {
        setStaffList(
          list.map((t: any) => ({
            id: t.id || t.teacherId,
            schoolId: t.schoolId || activeSchool?.id || '',
            employeeCode: t.teacherId || t.id,
            firstName: t.firstName,
            lastName: t.lastName || '',
            email: t.email || '',
            phone: t.phone || '',
            gender: t.gender || 'OTHER',
            designation: t.designation || 'Teacher',
            designationName: t.designation || 'Teacher',
            department: t.department || 'Academic',
            departmentName: t.department || 'Academic',
            role: 'TEACHER',
            isActive: t.status !== 'INACTIVE',
          })),
        );
      }
    }
  }, [rtkTeachersData]);

  const refreshData = async () => {
    if (!activeSchool) return;
    setIsLoadingData(true);
    try {
      refetchAssignments();
      refetchSections();
      refetchClasses();
      refetchCurriculum();
      refetchSubjects();
      refetchTeachers();
    } catch (e: any) {
      console.error('Failed to load teacher assignments data', e);
      toast.error(e.message || 'Failed to load assignments');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenAssignModal = (sectionId?: string) => {
    setPreselectedSectionId(sectionId || sections[0]?.id);
    setPreselectedStaffId(staffList[0]?.id);
    setIsAssignOpen(true);
  };

  const handleQuickAddTeacherSuccess = (newTeacher: Teacher) => {
    if (!activeSchool) return;
    refetchTeachers();
    setPreselectedStaffId(newTeacher.teacherId);
  };

  const handleAssignSubmit = async (formData: {
    academicYearSectionId: string;
    staffId: string;
    subjectId: string | null;
    isClassTeacher: boolean;
  }) => {
    if (!activeSchool || !canManage) return;

    setIsProcessing(true);
    try {
      await createTeacherAssignmentMutation({
        academicYearSectionId: formData.academicYearSectionId,
        staffId: formData.staffId,
        subjectId: formData.subjectId || undefined,
        role: formData.isClassTeacher ? 'CLASS_TEACHER' : 'SUBJECT_TEACHER',
        isPrimary: formData.isClassTeacher,
      }).unwrap();

      const stf = staffList.find(
        (s) => s.id === formData.staffId || s.employeeCode === formData.staffId,
      );
      const sec = sections.find((s) => s.id === formData.academicYearSectionId);
      const teacherName = stf ? `${stf.firstName} ${stf.lastName}` : 'Teacher';
      const sectionName = sec ? `${sec.className} - ${sec.sectionName}` : 'Section';

      toast.success(`Assigned ${teacherName} to ${sectionName} successfully.`);
      setIsAssignOpen(false);
      await refreshData();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Unable to complete assignment.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveAssignment = async (asg: TeacherAssignmentItem) => {
    if (!activeSchool || !canManage) return;

    const confirmed = window.confirm(
      `Remove assignment for ${asg.staffName} from Section ${asg.sectionName}?`,
    );
    if (!confirmed) return;

    try {
      await deleteTeacherAssignmentMutation(asg.id).unwrap();
      toast.success('Teaching assignment unallocated.');
      await refreshData();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to remove assignment.'));
    }
  };

  const handleAutoAssignForFiltered = async () => {
    if (!activeSchool || !canManage) return;
    const targetSections =
      selectedSectionFilter !== 'ALL'
        ? sections.filter((s) => s.id === selectedSectionFilter)
        : selectedClassFilter !== 'ALL'
          ? sections.filter((s) => s.classId === selectedClassFilter)
          : sections;

    if (targetSections.length === 0) {
      toast.warning('No target sections found to auto-assign.');
      return;
    }

    if (staffList.length === 0) {
      toast.error('No teachers found to assign.');
      return;
    }

    setIsProcessing(true);
    try {
      let totalAssigned = 0;
      let teacherIndex = 0;

      for (const sec of targetSections) {
        const secSubjects = classSubjects.filter((cs) => cs.classId === sec.classId);
        const existingSecAsgs = assignments.filter((a) => a.academicYearSectionId === sec.id);
        const assignedSubIds = new Set(existingSecAsgs.map((a) => a.subjectId));

        for (const cs of secSubjects) {
          if (!assignedSubIds.has(cs.subjectId)) {
            const assignedTeacher = staffList[teacherIndex % staffList.length];
            teacherIndex++;
            try {
              await createTeacherAssignmentMutation({
                academicYearSectionId: sec.id,
                staffId: assignedTeacher.id,
                subjectId: cs.subjectId,
                role: 'SUBJECT_TEACHER',
                isPrimary: false,
              }).unwrap();
              totalAssigned++;
            } catch (e) {
              console.warn('Auto-assign failed for item', e);
            }
          }
        }
      }

      toast.success(
        `Auto-Assignment: Allocated ${totalAssigned} faculty teachers across ${targetSections.length} sections!`,
      );
      await refreshData();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Auto-assignment failed.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAssignments = assignments.filter((asg) => {
    if (selectedClassFilter !== 'ALL' && asg.classId !== selectedClassFilter) return false;
    if (selectedSectionFilter !== 'ALL' && asg.academicYearSectionId !== selectedSectionFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (asg.staffName && asg.staffName.toLowerCase().includes(q)) ||
        (asg.subjectName && asg.subjectName.toLowerCase().includes(q)) ||
        (asg.className && asg.className.toLowerCase().includes(q)) ||
        (asg.staffEmployeeCode && asg.staffEmployeeCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Derived metrics
  const totalClassTeachers = assignments.filter((a) => a.isClassTeacher).length;
  const totalSubjectMasters = assignments.filter((a) => a.subjectId).length;
  const uniqueTeachersAssigned = new Set(assignments.map((a) => a.staffId)).size;
  const unassignedSections = sections.filter(
    (s) => !assignments.some((a) => a.academicYearSectionId === s.id && a.isClassTeacher),
  ).length;

  return (
    <div className="d-flex flex-column gap-3">
      {/* TopHeader Standard */}
      <TopHeader
        title="Teacher Section Assignments"
        icon={UserCheck}
        subtitle="Assign faculty educators to classroom sections as Class Teachers (Homeroom) and Subject Masters."
        badges={[
          {
            bg: 'primary',
            label: activeAcademicYear?.name || 'Active Session',
          },
          {
            bg: 'secondary',
            label: activeSchool?.name || 'Active Campus',
          },
        ]}
        actions={[
          {
            name: 'Teacher Directory',
            icon: Users,
            action: () => navigate('/teachers'),
            variant: 'outline-secondary',
          },
          {
            name: 'Add Teacher',
            icon: UserPlus,
            action: () => setIsQuickAddTeacherOpen(true),
            variant: 'outline-primary',
          },
          ...(canManage
            ? [
                {
                  name: 'Auto-Assign',
                  icon: Wand2,
                  action: handleAutoAssignForFiltered,
                  variant: 'outline-primary' as const,
                  disabled: isProcessing || sections.length === 0,
                },
                {
                  name: 'Assign Teacher',
                  icon: Plus,
                  action: () => handleOpenAssignModal(),
                  variant: 'primary' as const,
                },
              ]
            : []),
        ]}
      />

      {/* InfoCard Metrics Row */}
      <Row className="g-3">
        <Col xs={6} md={3}>
          <InfoCard
            label="Assigned Faculty"
            value={uniqueTeachersAssigned}
            icon={Users}
            iconColor="text-primary"
            description={`Out of ${staffList.length} total staff`}
          />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard
            label="Class Teachers"
            value={totalClassTeachers}
            icon={Star}
            iconColor="text-warning"
            description={`${sections.length} total sections`}
          />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard
            label="Subject Allocations"
            value={totalSubjectMasters}
            icon={BookOpen}
            iconColor="text-success"
            description="Active teaching periods"
          />
        </Col>
        <Col xs={6} md={3}>
          <InfoCard
            label="Open Homerooms"
            value={unassignedSections}
            icon={Award}
            iconColor={unassignedSections > 0 ? 'text-danger' : 'text-secondary'}
            description={
              unassignedSections > 0 ? 'Sections without class teacher' : 'All homerooms filled'
            }
          />
        </Col>
      </Row>

      {/* Filters Bar */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        <Card.Body className="p-2.5">
          <Row className="g-2 align-items-center">
            <Col md={4} sm={12}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-transparent border-end-0">
                  <Search size={14} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0 ps-0"
                  type="text"
                  placeholder="Search faculty, subject, class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted text-nowrap d-flex align-items-center gap-1">
                  <Filter size={13} /> Class:
                </span>
                <Form.Select
                  size="sm"
                  value={selectedClassFilter}
                  onChange={(e) => {
                    setSelectedClassFilter(e.target.value);
                    setSelectedSectionFilter('ALL');
                  }}
                >
                  <option value="ALL">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>

            <Col md={4} sm={6}>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted text-nowrap">Section:</span>
                <Form.Select
                  size="sm"
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                >
                  <option value="ALL">All Sections</option>
                  {sections
                    .filter(
                      (s) => selectedClassFilter === 'ALL' || s.classId === selectedClassFilter,
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.className}-{s.sectionName}
                      </option>
                    ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Assignments Table */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border">
        {isLoadingData ? (
          <div className="py-5 text-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="small">Loading teacher assignments...</span>
          </div>
        ) : (
          <Table
            responsive
            hover
            size="sm"
            variant={isDark ? 'dark' : undefined}
            className="mb-0 align-middle"
          >
            <thead className="table-light">
              <tr>
                <th className="py-2.5 px-3">Faculty Educator</th>
                <th className="py-2.5 px-3">Class &amp; Section</th>
                <th className="py-2.5 px-3">Assignment Role</th>
                <th className="py-2.5 px-3">Assigned Subject</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-5 text-center text-muted small">
                    No faculty assignments found. Click <strong>Assign Teacher</strong> to allocate
                    educators to sections.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((asg) => (
                  <tr key={asg.id}>
                    <td className="py-2 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                          style={{ width: '28px', height: '28px' }}
                        >
                          {asg.staffName?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="fw-semibold small">{asg.staffName}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                            {asg.staffEmployeeCode || 'FACULTY'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="d-flex align-items-center gap-1.5 small fw-semibold">
                        <GraduationCap size={15} className="text-primary" />
                        <span>
                          {asg.className} - Section {asg.sectionName}
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      {asg.isClassTeacher ? (
                        <Badge
                          bg="warning"
                          text="dark"
                          className="d-inline-flex align-items-center gap-1 fw-semibold"
                        >
                          <Star size={11} className="fill-current" />
                          <span>Class Teacher (Lead)</span>
                        </Badge>
                      ) : (
                        <span className="text-muted small">Subject Instructor</span>
                      )}
                    </td>

                    <td className="py-2 px-3">
                      {asg.subjectId ? (
                        <div className="d-flex align-items-center gap-1.5 small fw-medium">
                          <BookOpen size={14} className="text-success" />
                          <span>{asg.subjectName}</span>
                          <span
                            className="text-muted font-monospace"
                            style={{ fontSize: '0.7rem' }}
                          >
                            ({asg.subjectCode})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">
                          Homeroom / Administrative
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3">
                      <Badge bg="success" className="fw-normal" style={{ fontSize: '0.7rem' }}>
                        ACTIVE
                      </Badge>
                    </td>

                    <td className="py-2 px-3 text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="p-1 lh-1"
                          onClick={() =>
                            navigate(`/teachers/view/${asg.staffEmployeeCode || asg.staffId}`)
                          }
                          title="View Teacher Profile & Timetable"
                        >
                          <Eye size={13} />
                        </Button>

                        {canManage && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1 lh-1"
                            onClick={() => handleRemoveAssignment(asg)}
                            title="Unassign Teacher"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* ASSIGN FACULTY MODAL */}
      <AssignFacultyModal
        show={isAssignOpen}
        onHide={() => setIsAssignOpen(false)}
        sections={sections}
        staffList={staffList}
        classSubjects={classSubjects}
        assignments={assignments}
        initialSectionId={preselectedSectionId}
        initialStaffId={preselectedStaffId}
        onOpenQuickAddTeacher={() => setIsQuickAddTeacherOpen(true)}
        onSubmit={handleAssignSubmit}
        isProcessing={isProcessing}
      />

      {/* QUICK ADD FACULTY TEACHER MODAL */}
      <QuickAddTeacherModal
        show={isQuickAddTeacherOpen}
        onHide={() => setIsQuickAddTeacherOpen(false)}
        onSuccess={handleQuickAddTeacherSuccess}
        schoolId={activeSchool?.id}
      />
    </div>
  );
};
export default TeacherAssignmentsView;
