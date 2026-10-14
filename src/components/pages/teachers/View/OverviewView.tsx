import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import {
  BookOpen,
  Award,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { Teacher, TeacherSubjectAssignment, TeacherClassAssignment } from '@/components/pages/teachers/types';
import { Card, InfoCard, InfoRow } from '@/components/common';
import { useTheme } from '@/context/ThemeContext';

interface ContactItem {
  label: string;
  value?: string | null;
  icon: LucideIcon;
  primary?: boolean;
  showWhenEmpty?: boolean;
}

interface ContactCardProps {
  title?: string;
  contacts: ContactItem[];
  isDark?: boolean;
  headerAction?: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({
  title = 'Contact Information',
  contacts,
  headerAction,
}) => {
  return (
    <Card className="border shadow-sm h-100">
      <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted d-flex align-items-center justify-content-between">
        <span>{title}</span>
        {headerAction}
      </Card.Header>
      <Card.Body className="p-3">
        <div className="d-flex flex-column gap-2.5 small">
          {contacts.map((contact, idx) => {
            const Icon = contact.icon;
            const hasValue = Boolean(contact.value);
            if (!hasValue && !contact.showWhenEmpty) {
              return null;
            }
            return (
              <InfoRow key={idx} icon={Icon} label={contact.label} value={contact.value || '—'} primary={contact.primary} />
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export interface OverviewViewProps {
  teacher: Teacher;
  subjectAssignments: TeacherSubjectAssignment[];
  classTeacherAssignment?: TeacherClassAssignment;
  onNavigateTab: (tab: string) => void;
  onOpenAssignSubjectModal?: () => void;
  onRemoveSubjectAssignment?: (asgId: string) => void;
  canEdit?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  teacher,
  subjectAssignments,
  classTeacherAssignment,
  onNavigateTab,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const totalWeeklyPeriods = subjectAssignments.reduce(
    (acc, curr) => acc + (curr.periodsPerWeek || 0),
    0,
  );

  return (
    <div className="d-flex flex-column gap-3">
      {/* Key Metric Highlights using InfoCard */}
      <Row className="g-3">
        <Col xs={6} md={3}>
          <InfoCard
            label="Teaching Load"
            value={`${totalWeeklyPeriods} Periods/Wk`}
            description={`${subjectAssignments.length} Assigned Sections`}
            icon={BookOpen}
            iconColor="text-primary"
            valueClassName="h5 fw-bold text-primary mb-1"
          />
        </Col>

        <Col xs={6} md={3}>
          <InfoCard
            label="Class Teacher"
            value={
              classTeacherAssignment
                ? `${classTeacherAssignment.className} (${classTeacherAssignment.sectionName})`
                : 'Not Assigned'
            }
            description={
              classTeacherAssignment
                ? classTeacherAssignment.room || 'Designated Class'
                : 'Available for duty'
            }
            icon={Award}
            iconColor="text-warning"
            valueClassName="h5 fw-bold text-warning mb-1"
          />
        </Col>

        <Col xs={6} md={3}>
          <InfoCard
            label="Highest Qualification"
            value={
              teacher.qualifications && teacher.qualifications[0]
                ? teacher.qualifications[0].degree
                : 'Degree'
            }
            description={
              teacher.qualifications && teacher.qualifications[0]
                ? teacher.qualifications[0].specialization || teacher.qualifications[0].university
                : 'Verified'
            }
            icon={GraduationCap}
            iconColor="text-info"
            valueClassName="h5 fw-bold text-info text-truncate mb-1"
          />
        </Col>

        <Col xs={6} md={3}>
          <InfoCard
            label="Tenure at School"
            value={teacher.joiningDate ? `Since ${teacher.joiningDate.slice(0, 4)}` : 'Active'}
            description="Confirmed Faculty"
            icon={Calendar}
            iconColor="text-success"
            valueClassName="h5 fw-bold text-success mb-1"
          />
        </Col>
      </Row>

      {/* Snapshot Grid */}
      <Row className="g-3">
        {/* Quick Contact Details */}
        <Col xs={12} md={6}>
          <ContactCard
            isDark={isDark}
            contacts={[
              {
                label: 'Mobile',
                value: teacher.mobile,
                icon: Phone,
                primary: true,
                showWhenEmpty: true,
              },
              {
                label: 'Alt Mobile',
                value: teacher.alternateMobile,
                icon: Phone,
              },
              {
                label: 'Email',
                value: teacher.email,
                icon: Mail,
                primary: true,
                showWhenEmpty: true,
              },
            ]}
            headerAction={
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none small"
                onClick={() => onNavigateTab('personal')}
              >
                View All
              </Button>
            }
          />
        </Col>

        {/* Employment & Location Snapshot */}
        <Col xs={12} md={6}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="py-2 px-3 fw-bold small text-uppercase text-muted d-flex align-items-center justify-content-between">
              <span>School Deployment</span>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none small"
                onClick={() => onNavigateTab('employment')}
              >
                View Details
              </Button>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-flex flex-column gap-2.5 small">
                <InfoRow
                  label="Work Location"
                  value={teacher.workLocation || 'Main Campus'}
                  layout="between"
                />

                <InfoRow
                  label="Reporting Officer"
                  value={teacher.reportingTeacherName || 'Principal Office'}
                  primary
                  layout="between"
                />

                <InfoRow label="Joining Date" value={teacher.joiningDate} layout="between" />

                <InfoRow
                  label="Languages Known"
                  value={teacher.languages?.join(', ') || 'English, Hindi'}
                  layout="between"
                />

                <InfoRow
                  label="Specialization"
                  value={teacher.specialSkills?.join(', ') || 'Curriculum Pedagogy'}
                  layout="between"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const ProfileOverviewTab = OverviewView;
export default OverviewView;
