import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert } from 'react-bootstrap';
import { ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StudentItem } from '@/components/pages/students/types';
import { Enrollment } from './types';
import { useGetStudentsQuery, mapDtoToStudentItem } from '@/store/students';
import { StudentSearchPicker } from './components/StudentSearchPicker';
import { NewEnrollmentForm } from './components/NewEnrollmentForm';
import { useTheme } from '@/context/ThemeContext';

export const NewAdmissionView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  const { data: studentsData } = useGetStudentsQuery();
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [createdEnrollment, setCreatedEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    if (preselectedStudentId && studentsData) {
      const raw = Array.isArray(studentsData?.data)
        ? studentsData.data
        : Array.isArray(studentsData)
          ? studentsData
          : [];
      const found = raw.find((s: any) => s.id === preselectedStudentId || s.studentId === preselectedStudentId);
      if (found) {
        setSelectedStudent(found.studentId && found.admissionNumber ? mapDtoToStudentItem(found) : found);
      }
    }
  }, [preselectedStudentId, studentsData]);

  const handleSuccess = (newEnrollment: Enrollment) => {
    setCreatedEnrollment(newEnrollment);
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '1000px' }}>
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '40px', height: '40px' }}
              >
                <UserPlus size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    New Student Admission
                  </h5>
                  <Badge bg="primary" className="fw-normal">
                    Enrollment Workflow
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Search an existing student person record and generate a new enrollment for an
                  academic year.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1.5"
                onClick={() => navigate('/admissions')}
              >
                <ArrowLeft size={14} />
                <span>Back to Admissions</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Success Notification */}
      {createdEnrollment ? (
        <Alert variant="success" className="p-3 mb-4">
          <div className="d-flex align-items-start gap-2">
            <CheckCircle2 size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">Admission Created Successfully!</h6>
              <p className="small mb-2">
                A new enrollment record has been generated for{' '}
                <strong>{createdEnrollment.studentName}</strong>.
              </p>
              <div className="bg-body p-2 rounded border small mb-3">
                <div className="row g-2">
                  <div className="col-sm-6">
                    <span className="text-muted">Enrollment ID:</span>{' '}
                    <strong className="font-monospace text-primary">
                      {createdEnrollment.enrollmentId}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Student Code:</span>{' '}
                    <strong className="font-monospace">{createdEnrollment.studentCode}</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Academic Year:</span>{' '}
                    <strong>{createdEnrollment.academicYearName}</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted">Class & Section:</span>{' '}
                    <strong>
                      {createdEnrollment.className} ({createdEnrollment.sectionName})
                    </strong>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate(`/admissions/view/${createdEnrollment.enrollmentId}`)}
                >
                  View Enrollment Details
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setCreatedEnrollment(null);
                    setSelectedStudent(null);
                  }}
                >
                  Add Another Admission
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none text-muted"
                  onClick={() => navigate('/admissions')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <>
          {/* Step 1: Student Search Picker */}
          <StudentSearchPicker
            selectedStudent={selectedStudent}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onClearSelection={() => setSelectedStudent(null)}
          />

          {/* Step 2: New Enrollment Form (Appears once student is selected) */}
          {selectedStudent && (
            <NewEnrollmentForm
              student={selectedStudent}
              onSuccess={handleSuccess}
              onCancel={() => setSelectedStudent(null)}
            />
          )}
        </>
      )}
    </div>
  );
};
