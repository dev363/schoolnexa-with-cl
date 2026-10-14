import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Edit2, ShieldCheck, UserCheck, PlusCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentItem } from '../types';
import { StudentAvatar } from './StudentAvatar';
import { StudentStatusBadge } from './StudentStatusBadge';
import { useTheme } from '@/context/ThemeContext';

interface StudentProfileHeaderProps {
  student: StudentItem;
  onCreateAdmission?: () => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  onCreateAdmission,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fullName =
    `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.trim();
  const hasAdmission = student.hasActiveAdmission && Boolean(student.admissionNumber);

  const handleCreateAdmission = () => {
    if (onCreateAdmission) {
      onCreateAdmission();
    } else {
      // In SchoolNexa, Admission/Enrollment module route or modal
      alert(
        `Initiating Admission workflow for ${fullName} (${student.studentCode}). Admission module will assign Academic Year, Class, Section, and Admission Number.`,
      );
    }
  };

  return (
    <div className="mb-3">
      {/* Main Header Card */}
      <Card
        bg={isDark ? 'dark' : 'white'}
        text={isDark ? 'white' : 'dark'}
        className={`border ${isDark ? 'border-secondary' : 'border-light-subtle shadow-sm'}`}
      >
        <Card.Body className="p-3 sm:p-3.5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <StudentAvatar
                name={fullName}
                photoUrl={student.photoUrl}
                size="xl"
                className="shadow-sm border"
              />
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h1 className="h4 mb-0 fw-bold">{fullName}</h1>
                  <StudentStatusBadge status={student.status} />
                  {hasAdmission ? (
                    <Badge bg="success" className="fw-normal px-2 py-1">
                      Admitted
                    </Badge>
                  ) : (
                    <Badge
                      bg={isDark ? 'warning' : 'warning'}
                      text={isDark ? 'dark' : 'dark'}
                      className="fw-normal px-2 py-1"
                    >
                      Pending Admission
                    </Badge>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2.5 text-muted small flex-wrap">
                  <span className="font-monospace fw-medium text-primary">
                    {student.studentCode}
                  </span>
                  <span className="opacity-50">•</span>
                  {hasAdmission ? (
                    <>
                      <span>
                        Adm No:{' '}
                        <span className="font-monospace fw-semibold">
                          {student.admissionNumber}
                        </span>
                      </span>
                      {student.className && (
                        <>
                          <span className="opacity-50">•</span>
                          <span>
                            {student.className}{' '}
                            {student.sectionName ? `(${student.sectionName})` : ''}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-warning text-opacity-75">No Active Admission Record</span>
                  )}
                  <span className="opacity-50">•</span>
                  <span className="d-inline-flex align-items-center gap-1">
                    <ShieldCheck size={14} className="text-primary" />
                    <span>Permanent Student Record</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/students')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </Button>
              {!hasAdmission && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleCreateAdmission}
                  className="d-inline-flex align-items-center gap-1.5 px-3 shadow-sm"
                >
                  <PlusCircle size={15} />
                  <span>Create Admission</span>
                </Button>
              )}
              <Button
                variant={hasAdmission ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => navigate(`/students/edit/${student.id}`)}
                className="d-inline-flex align-items-center gap-1.5 px-3"
              >
                <Edit2 size={14} />
                <span>Edit Student</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
