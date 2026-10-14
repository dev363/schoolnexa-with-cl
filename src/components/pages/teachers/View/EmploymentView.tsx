import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Card, InfoRow } from '@/components/common';
import { Teacher } from '@/components/pages/teachers/types';
import { EmploymentTypeBadge, StatusBadge } from '@/components/pages/teachers/Common';

export interface EmploymentViewProps {
  teacher: Teacher;
}

const EmploymentHeader: React.FC = () => (
  <Card.Header className="py-2.5 px-3">
    <span className="fw-bold small text-uppercase text-muted">
      Employment Records & Institutional Details
    </span>
  </Card.Header>
);

const EmploymentDetails: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <Row className="g-3">
    <Col xs={6} sm={4}>
      <InfoRow label="Designation" value={teacher.designationName || 'Teacher'} />
    </Col>
    <Col xs={6} sm={4}>
      <InfoRow label="Department" value={teacher.departmentName || 'General'} />
    </Col>
    <Col xs={6} sm={4}>
      <InfoRow
        label="Employment Type"
        value={<EmploymentTypeBadge type={teacher.employmentType} />}
      />
    </Col>
    <Col xs={6} sm={4}>
      <InfoRow label="Joining Date" value={teacher.joiningDate || '—'} />
    </Col>
    <Col xs={6} sm={4}>
      <InfoRow label="Confirmation Date" value={teacher.confirmationDate || 'Confirmed'} />
    </Col>
    <Col xs={6} sm={4}>
      <InfoRow
        label="Employment Status"
        value={<StatusBadge status={teacher.status} size="sm" />}
      />
    </Col>
    <Col xs={12} sm={4}>
      <InfoRow label="Work Location" value={teacher.workLocation || 'Main Campus'} />
    </Col>
    <Col xs={12} sm={8}>
      <InfoRow
        label="Reporting Supervisor"
        value={
          teacher.reportingTeacherName || teacher.reportingTeacherId || 'School Managing Committee'
        }
      />
    </Col>
    <Col xs={12} sm={8}>
      <InfoRow
        label="Administrative Remarks / Notes"
        value={<RemarksSection remarks={teacher.remarks} notes={teacher.notes} />}
      />
    </Col>
  </Row>
);

const RemarksSection: React.FC<{ remarks?: string; notes?: string }> = ({ remarks, notes }) => (
  <div className="p-2.5 border rounded bg-light bg-opacity-25 small">
    {remarks || notes || 'No remarks recorded.'}
  </div>
);

export const EmploymentView: React.FC<EmploymentViewProps> = ({ teacher }) => {
  return (
    <Card className="shadow-sm border">
      <EmploymentHeader />
      <Card.Body className="p-3">
        <EmploymentDetails teacher={teacher} />
      </Card.Body>
    </Card>
  );
};

export const TeacherEmploymentView = EmploymentView;
export default EmploymentView;
