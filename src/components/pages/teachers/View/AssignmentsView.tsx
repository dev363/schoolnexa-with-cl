import React from 'react';
import { Table, Badge, Button, ProgressBar, Row, Col } from 'react-bootstrap';
import {
  Award,
  BookOpen,
  Plus,
  Trash2,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/common';
import {
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  TeacherWorkload,
} from '@/components/pages/teachers/types';
import { useTheme } from '@/context/ThemeContext';
import {
  useGetTeacherAssignmentsQuery,
  useGetTeacherWorkloadQuery,
} from '@/store/teachers';

export interface AssignmentsViewProps {
  subjectAssignments?: TeacherSubjectAssignment[];
  classTeacherAssignment?: TeacherClassAssignment;
  workload?: TeacherWorkload;
  employmentType?: string;
  teacherId?: string;
  onOpenClassTeacherModal: () => void;
  onRelieveClassTeacher: () => void;
  onOpenAssignSubjectModal: () => void;
  onRemoveSubjectAssignment: (asgId: string) => void;
  canEdit?: boolean;
}

interface WorkloadCapacitySectionProps {
  totalWeeklyPeriods: number;
  targetPeriods: number;
  percentage: number;
  statusText: string;
  statusVariant: 'success' | 'warning' | 'danger';
  subjectAssignments: TeacherSubjectAssignment[];
  classTeacherAssignment?: TeacherClassAssignment;
  workload?: TeacherWorkload;
}

const WorkloadCapacitySection: React.FC<WorkloadCapacitySectionProps> = ({
  totalWeeklyPeriods,
  targetPeriods,
  percentage,
  statusText,
  statusVariant,
  subjectAssignments,
  classTeacherAssignment,
  workload,
}) => (
  <Card className="border shadow-sm">
    <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
      <span className="d-flex align-items-center gap-1.5 fw-bold small text-uppercase text-muted">
        <Activity size={16} className="text-primary" />
        <span>Weekly Workload & Teaching Capacity</span>
      </span>
      <Badge bg={statusVariant} className="px-2 py-1">
        {statusText}
      </Badge>
    </Card.Header>
    <Card.Body className="p-3">
      <Row className="g-3 align-items-center">
        <Col md={5}>
          <div className="d-flex align-items-baseline gap-2">
            <span className="fs-3 fw-bold">{totalWeeklyPeriods}</span>
            <span className="text-muted small">/ {targetPeriods} Target Periods per Week</span>
          </div>
          <div className="mt-2">
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Capacity Utilization</span>
              <span className="fw-semibold">{percentage}%</span>
            </div>
            <ProgressBar
              variant={statusVariant}
              now={Math.min(percentage, 100)}
              style={{ height: '8px' }}
            />
          </div>
        </Col>

        <Col md={7} className="border-start-md ps-md-4">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="small text-muted w-100 mb-1">Teaching Distribution:</div>
            <Badge bg="light" text="dark" className="border px-2 py-1 font-monospace">
              <Clock size={12} className="me-1 text-secondary" />
              {subjectAssignments.length} Subject Assignment
              {subjectAssignments.length !== 1 ? 's' : ''}
            </Badge>
            {classTeacherAssignment && (
              <Badge bg="warning" text="dark" className="border px-2 py-1 font-monospace">
                <Award size={12} className="me-1" />
                Class Teacher: {classTeacherAssignment.className}-
                {classTeacherAssignment.sectionName}
              </Badge>
            )}
            {workload?.distributionBySubject &&
              workload.distributionBySubject.length > 0 &&
              workload.distributionBySubject.map((d) => (
                <Badge key={d.subjectName} bg="secondary" className="px-2 py-1 font-monospace">
                  {d.subjectName}: {d.periods} periods
                </Badge>
              ))}
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

interface ClassTeacherSectionProps {
  classTeacherAssignment?: TeacherClassAssignment;
  canEdit: boolean;
  onOpenClassTeacherModal: () => void;
  onRelieveClassTeacher: () => void;
}

const ClassTeacherSection: React.FC<ClassTeacherSectionProps> = ({
  classTeacherAssignment,
  canEdit,
  onOpenClassTeacherModal,
  onRelieveClassTeacher,
}) => (
  <Card className="border shadow-sm">
    <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
      <span className="d-flex align-items-center gap-1.5 fw-bold small text-uppercase text-muted">
        <Award size={16} className="text-warning" />
        <span>Class Teacher Assignment</span>
      </span>
      {canEdit && (
        <Button
          variant="outline-warning"
          size="sm"
          className="text-dark"
          onClick={onOpenClassTeacherModal}
        >
          {classTeacherAssignment ? 'Change / Transfer Assignment' : 'Assign as Class Teacher'}
        </Button>
      )}
    </Card.Header>
    <Card.Body className="p-3">
      {classTeacherAssignment ? (
        <div className="d-flex align-items-center justify-content-between p-3 border rounded bg-warning bg-opacity-10">
          <div>
            <div className="fw-bold fs-6 d-flex align-items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              Class Teacher for {classTeacherAssignment.className} - Section{' '}
              {classTeacherAssignment.sectionName}
            </div>
            <div className="text-muted small mt-1">
              Academic Year: {classTeacherAssignment.academicYear} • Designated Room:{' '}
              {classTeacherAssignment.room || 'Room 304'}
            </div>
          </div>
          {canEdit && (
            <Button variant="outline-danger" size="sm" onClick={onRelieveClassTeacher}>
              Relieve Duty
            </Button>
          )}
        </div>
      ) : (
        <div className="text-muted small py-2 d-flex align-items-center gap-2">
          <AlertTriangle size={16} className="text-muted" />
          <span>
            This teacher is not currently designated as a primary Class Teacher for any section
            in the active session.
          </span>
        </div>
      )}
    </Card.Body>
  </Card>
);

interface SubjectAssignmentsSectionProps {
  subjectAssignments: TeacherSubjectAssignment[];
  canEdit: boolean;
  isDark: boolean;
  onOpenAssignSubjectModal: () => void;
  onRemoveSubjectAssignment: (asgId: string) => void;
}

const SubjectAssignmentsSection: React.FC<SubjectAssignmentsSectionProps> = ({
  subjectAssignments,
  canEdit,
  isDark,
  onOpenAssignSubjectModal,
  onRemoveSubjectAssignment,
}) => (
  <Card className="border shadow-sm">
    <Card.Header className="py-2.5 px-3 d-flex align-items-center justify-content-between">
      <span className="d-flex align-items-center gap-1.5 fw-bold small text-uppercase text-muted">
        <BookOpen size={16} className="text-primary" />
        <span>Subject Teaching Assignments</span>
      </span>
      {canEdit && (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onOpenAssignSubjectModal}
          className="d-flex align-items-center gap-1"
        >
          <Plus size={14} /> Assign Subject
        </Button>
      )}
    </Card.Header>
    <Card.Body className="p-3">
      {subjectAssignments.length === 0 ? (
        <p className="text-muted small mb-0 text-center py-3">No subjects assigned.</p>
      ) : (
        <div className="table-responsive">
          <Table size="sm" hover className="align-middle mb-0 small">
            <thead className={isDark ? 'table-dark' : 'table-light'}>
              <tr>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Weekly Periods</th>
                <th>Assignment Type</th>
                <th>Academic Year</th>
                <th>Status</th>
                {canEdit && <th className="text-end">Action</th>}
              </tr>
            </thead>
            <tbody>
              {subjectAssignments.map((asg) => (
                <tr key={asg.id}>
                  <td className="fw-semibold">{asg.className}</td>
                  <td>Section {asg.sectionName}</td>
                  <td>{asg.subjectName}</td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {asg.periodsPerWeek} Periods/Wk
                    </Badge>
                  </td>
                  <td>{asg.assignmentType}</td>
                  <td>{asg.academicYear}</td>
                  <td>
                    <Badge bg="success" className="fw-normal">
                      {asg.status}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="p-1 border-0"
                        onClick={() => onRemoveSubjectAssignment(asg.id)}
                        title="Unassign Subject"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>
  </Card>
);

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  subjectAssignments: propSubjectAssignments,
  classTeacherAssignment: propClassTeacherAssignment,
  workload: propWorkload,
  employmentType = 'FULL_TIME',
  teacherId,
  onOpenClassTeacherModal,
  onRelieveClassTeacher,
  onOpenAssignSubjectModal,
  onRemoveSubjectAssignment,
  canEdit = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: assignmentsData } = useGetTeacherAssignmentsQuery(teacherId!, {
    skip: !teacherId,
  });
  const { data: workloadData } = useGetTeacherWorkloadQuery(teacherId!, {
    skip: !teacherId || Boolean(propWorkload),
  });

  const subjectAssignments = assignmentsData?.subjectAssignments ?? propSubjectAssignments ?? [];
  const classTeacherAssignment = assignmentsData?.classAssignment ?? propClassTeacherAssignment;
  const workload = workloadData ?? propWorkload;

  const totalWeeklyPeriods =
    workload?.totalWeeklyPeriods ??
    subjectAssignments
      .filter((a) => a.status === 'Active')
      .reduce((sum, a) => sum + (Number(a.periodsPerWeek) || 5), 0);

  const targetPeriods = workload?.targetWeeklyPeriods ?? (employmentType === 'PART_TIME' ? 16 : 24);
  const percentage = Math.round((totalWeeklyPeriods / targetPeriods) * 100);

  let statusText = 'Balanced Workload';
  let statusVariant: 'success' | 'warning' | 'danger' = 'success';

  if (totalWeeklyPeriods < 18) {
    statusText = 'Underloaded (< 18 periods/wk)';
    statusVariant = 'warning';
  } else if (totalWeeklyPeriods <= 28) {
    statusText = 'Balanced (18 - 28 periods/wk)';
    statusVariant = 'success';
  } else {
    statusText = 'Overloaded (> 28 periods/wk)';
    statusVariant = 'danger';
  }

  return (
    <div className="d-flex flex-column gap-3">
      <WorkloadCapacitySection
        totalWeeklyPeriods={totalWeeklyPeriods}
        targetPeriods={targetPeriods}
        percentage={percentage}
        statusText={statusText}
        statusVariant={statusVariant}
        subjectAssignments={subjectAssignments}
        classTeacherAssignment={classTeacherAssignment}
        workload={workload}
      />

      <ClassTeacherSection
        classTeacherAssignment={classTeacherAssignment}
        canEdit={canEdit}
        onOpenClassTeacherModal={onOpenClassTeacherModal}
        onRelieveClassTeacher={onRelieveClassTeacher}
      />

      <SubjectAssignmentsSection
        subjectAssignments={subjectAssignments}
        canEdit={canEdit}
        isDark={isDark}
        onOpenAssignSubjectModal={onOpenAssignSubjectModal}
        onRemoveSubjectAssignment={onRemoveSubjectAssignment}
      />
    </div>
  );
};

export const ProfileAssignmentsTab = AssignmentsView;
export default AssignmentsView;
