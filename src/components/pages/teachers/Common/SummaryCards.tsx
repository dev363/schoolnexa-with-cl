import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Users, UserCheck, UserX, Clock, Briefcase, Award } from 'lucide-react';
import { Teacher } from '@/components/pages/teachers/types';
import { CountCard, InfoCard } from '@/components/common';

interface TeacherSummaryCardsProps {
  teachers: Teacher[];
}

export const TeacherSummaryCards: React.FC<TeacherSummaryCardsProps> = ({ teachers }) => {
  const total = teachers.length;
  const active = teachers.filter((t) => t.status === 'ACTIVE').length;
  const inactive = teachers.filter((t) => t.status !== 'ACTIVE').length;
  const fullTime = teachers.filter((t) => t.employmentType === 'FULL_TIME').length;
  const partTime = teachers.filter((t) => t.employmentType === 'PART_TIME').length;
  const contract = teachers.filter((t) => t.employmentType === 'CONTRACT').length;

  const stats = [
    {
      label: 'Total Teachers',
      value: total,
      icon: Users,
      iconColor: 'text-primary',
    },
    {
      label: 'Active',
      value: active,
      icon: UserCheck,
      iconColor: 'text-success',
    },
    {
      label: 'Inactive / Other',
      value: inactive,
      icon: UserX,
      iconColor: 'text-secondary',
    },
    {
      label: 'Full Time',
      value: fullTime,
      icon: Award,
      iconColor: 'text-info',
    },
    {
      label: 'Part Time',
      value: partTime,
      icon: Clock,
      iconColor: 'text-warning',
    },
    {
      label: 'Contract',
      value: contract,
      icon: Briefcase,
      iconColor: 'text-danger',
    },
  ];

  return (
    <Row className="g-2 mb-3">
      {stats.map((item, idx) => (
        <Col key={idx} xs={6} md={4} lg={2}>
          <CountCard
            label={item.label}
            value={item.value}
            icon={item.icon}
            iconColor={item.iconColor}
            valueClassName="fs-5 fw-bold font-monospace mb-0"
          />
        </Col>
      ))}
    </Row>
  );
};

export const SummaryCards = TeacherSummaryCards;
export default TeacherSummaryCards;
