import React from 'react';
import { Badge, Row, Col } from 'react-bootstrap';
import { Card, InfoRow } from '@/components/common';
import { Teacher } from '@/components/pages/teachers/types';
import { useTheme } from '@/context/ThemeContext';
import { useGetTeacherQualificationsQuery } from '@/store/teachers';

export interface QualificationHeaderProps {
  count: number;
}

export const QualificationHeader: React.FC<QualificationHeaderProps> = ({ count }) => {
  return (
    <Card.Header className="py-2.5 px-3 fw-bold small text-uppercase text-muted d-flex align-items-center justify-content-between">
      <span>Qualification</span>

      {count > 0 && (
        <Badge bg="secondary" pill className="fw-normal" style={{ fontSize: '0.75rem' }}>
          {count}
        </Badge>
      )}
    </Card.Header>
  );
};

export interface QualificationItemProps {
  qualification: Teacher['qualifications'][number];
  isDark: boolean;
}

export const QualificationItem: React.FC<QualificationItemProps> = ({ qualification, isDark }) => {
  const q = qualification;

  return (
    <div
      className={`px-3 py-2 rounded border ${
        isDark
          ? 'bg-secondary bg-opacity-10 border-secondary'
          : 'bg-light bg-opacity-40 border-light-subtle'
      }`}
    >
      <Row className="g-2 align-items-center">
        {/* Qualification */}
        <Col xs={12} md={3}>
          <div className="d-md-none">
            <InfoRow label="Qualification" value={q.degree} primary />
          </div>

          <span
            className="d-none d-md-block fw-semibold text-primary text-truncate"
            title={q.degree}
          >
            {q.degree || '—'}
          </span>
        </Col>

        {/* Institution */}
        <Col xs={12} md={3}>
          <div className="d-md-none">
            <InfoRow label="Institution" value={q.institution} />
          </div>

          <span className="d-none d-md-block text-truncate" title={q.institution}>
            {q.institution || '—'}
          </span>
        </Col>

        {/* University / Board */}
        <Col xs={12} md={3}>
          <div className="d-md-none">
            <InfoRow label="University / Board" value={q.university} />
          </div>

          <span className="d-none d-md-block text-muted small text-truncate" title={q.university}>
            {q.university || '—'}
          </span>
        </Col>

        {/* Year */}
        <Col xs={6} md={1}>
          <div className="d-md-none">
            <InfoRow label="Year" value={q.year} />
          </div>

          <span className="d-none d-md-block text-muted small font-monospace">{q.year || '—'}</span>
        </Col>

        {/* Grade */}
        <Col xs={6} md={2}>
          <div className="d-md-none">
            <InfoRow label="Grade / %" value={q.grade || 'Passed'} />
          </div>

          <div className="d-none d-md-flex justify-content-md-center">
            <Badge
              bg={isDark ? 'secondary' : 'light'}
              text={isDark ? 'light' : 'dark'}
              className="border font-monospace py-1 px-2"
            >
              {q.grade || 'Passed'}
            </Badge>
          </div>
        </Col>
      </Row>

      {q.specialization && (
        <div className="mt-1 text-muted small border-top pt-1 text-truncate">
          <span className="fst-italic">Specialization: {q.specialization}</span>
        </div>
      )}
    </div>
  );
};

export const EmptyQualificationState: React.FC = () => {
  return <p className="text-muted small text-center py-4 mb-0">No qualifications recorded yet.</p>;
};

export const QualificationTableHeader: React.FC = () => {
  return (
    <div className="d-none d-md-block px-3 py-1 mb-2 border-bottom bg-light bg-opacity-25 rounded-top">
      <Row className="g-2 text-muted small fw-semibold align-items-center">
        <Col md={3}>Qualification</Col>
        <Col md={3}>Institution</Col>
        <Col md={3}>University / Board</Col>
        <Col md={1}>Year</Col>
        <Col md={2}>Grade / %</Col>
      </Row>
    </div>
  );
};

export interface QualificationsViewProps {
  teacher?: Teacher;
  teacherId?: string;
}

export const QualificationsView: React.FC<QualificationsViewProps> = ({ teacher, teacherId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const effectiveTeacherId = teacherId || teacher?.teacherId || teacher?.id;
  const { data: remoteQualifications } = useGetTeacherQualificationsQuery(
    effectiveTeacherId!,
    { skip: !effectiveTeacherId },
  );
  const qualifications = remoteQualifications ?? teacher?.qualifications ?? [];

  return (
    <Card className="border shadow-sm">
      <QualificationHeader count={qualifications.length} />

      <Card.Body className="p-3">
        {qualifications.length === 0 ? (
          <EmptyQualificationState />
        ) : (
          <>
            <QualificationTableHeader />

            <div className="d-flex flex-column gap-2">
              {qualifications.map((qualification) => (
                <QualificationItem
                  key={qualification.id}
                  qualification={qualification}
                  isDark={isDark}
                />
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export const TeacherQualificationsView = QualificationsView;
export default QualificationsView;
