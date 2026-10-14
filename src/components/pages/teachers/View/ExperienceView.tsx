import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { Card, InfoRow } from '@/components/common';
import { Teacher } from '@/components/pages/teachers/types';
import { useTheme } from '@/context/ThemeContext';
import { useGetTeacherExperienceQuery } from '@/store/teachers';

export const formatDisplayDate = (dateStr?: string, fallback = '—'): string => {
  if (!dateStr) return fallback;

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

export const calculateDuration = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '—';

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return '—';
  }

  const end = endDate ? new Date(endDate) : new Date();
  if (Number.isNaN(end.getTime()) || end < start) {
    return '—';
  }

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    totalMonths = Math.max(0, totalMonths - 1);
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0) {
    return `${years}y ${months}m`;
  }
  if (years > 0) {
    return `${years}y`;
  }
  if (months > 0) {
    return `${months}m`;
  }

  return '< 1m';
};

export const ExperienceHeader: React.FC<{ count: number }> = ({ count }) => (
  <Card.Header className="py-2.5 px-3 fw-bold small text-uppercase text-muted d-flex align-items-center justify-content-between">
    <span>Experience</span>

    {count > 0 && (
      <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
        {count}
      </Badge>
    )}
  </Card.Header>
);

export const ExperienceTableHeader: React.FC = () => (
  <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
    <Row className="g-2 text-muted small fw-semibold align-items-center">
      <Col md={3}>Organization</Col>
      <Col md={3}>Designation</Col>
      <Col md={2}>From</Col>
      <Col md={2}>To</Col>
      <Col md={2} className="text-center">
        Experience
      </Col>
    </Row>
  </div>
);

export const EmptyExperienceState: React.FC = () => (
  <p className="text-muted small text-center py-4 mb-0">No past experience recorded yet.</p>
);

export const ExperienceBadge: React.FC<{ duration: string; isDark: boolean }> = ({ duration, isDark }) => (
  <Badge
    bg={isDark ? 'secondary' : 'light'}
    text={isDark ? 'light' : 'dark'}
    className="border font-monospace py-1 px-2"
  >
    {duration}
  </Badge>
);

export const ExperienceItem: React.FC<{ experience: Teacher['experiences'][number]; isDark: boolean }> = ({
  experience: exp,
  isDark,
}) => {
  const duration = calculateDuration(exp.startDate, exp.endDate);

  return (
    <div
      className={`px-3 py-2 rounded border ${
        isDark
          ? 'bg-secondary bg-opacity-10 border-secondary'
          : 'bg-light bg-opacity-40 border-light-subtle'
      }`}
    >
      <Row className="g-2 align-items-center">
        <Col xs={12} md={3}>
          <div className="d-md-none">
            <InfoRow label="Organization" value={exp.organization} />
          </div>

          <span className="d-none d-md-block fw-semibold text-truncate" title={exp.organization}>
            {exp.organization || '—'}
          </span>
        </Col>

        <Col xs={12} md={3}>
          <div className="d-md-none">
            <InfoRow label="Designation" value={exp.designation || 'Teacher'} primary />
          </div>

          <span
            className="d-none d-md-block text-primary fw-medium text-truncate"
            title={exp.designation}
          >
            {exp.designation || 'Teacher'}
          </span>
        </Col>

        <Col xs={6} md={2}>
          <div className="d-md-none">
            <InfoRow label="From" value={formatDisplayDate(exp.startDate)} />
          </div>

          <span className="d-none d-md-block text-muted small">
            {formatDisplayDate(exp.startDate)}
          </span>
        </Col>

        <Col xs={6} md={2}>
          <div className="d-md-none">
            <InfoRow label="To" value={exp.endDate ? formatDisplayDate(exp.endDate) : 'Present'} />
          </div>

          <span className="d-none d-md-block text-muted small">
            {exp.endDate ? formatDisplayDate(exp.endDate) : 'Present'}
          </span>
        </Col>

        <Col xs={12} md={2}>
          <div className="d-md-none d-flex align-items-center gap-2">
            <span className="small fw-semibold text-muted">Experience:</span>
            <ExperienceBadge duration={duration} isDark={isDark} />
          </div>

          <div className="d-none d-md-flex justify-content-md-center">
            <ExperienceBadge duration={duration} isDark={isDark} />
          </div>
        </Col>
      </Row>

      {exp.description && (
        <div className="mt-1 text-muted small border-top pt-1 text-truncate">
          <span className="fst-italic">{exp.description}</span>
        </div>
      )}
    </div>
  );
};

export interface ExperienceViewProps {
  teacher?: Teacher;
  teacherId?: string;
}

export const ExperienceView: React.FC<ExperienceViewProps> = ({ teacher, teacherId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const effectiveTeacherId = teacherId || teacher?.teacherId || teacher?.id;
  const { data: remoteExperiences } = useGetTeacherExperienceQuery(
    effectiveTeacherId!,
    { skip: !effectiveTeacherId },
  );
  const experiences = remoteExperiences ?? teacher?.experiences ?? [];

  return (
    <Card className="border shadow-sm">
      <ExperienceHeader count={experiences.length} />

      <Card.Body className="p-3">
        {experiences.length === 0 ? (
          <EmptyExperienceState />
        ) : (
          <>
            <ExperienceTableHeader />

            <div className="d-flex flex-column gap-2">
              {experiences.map((experience) => (
                <ExperienceItem key={experience.id} experience={experience} isDark={isDark} />
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export const TeacherExperienceView = ExperienceView;
export default ExperienceView;
