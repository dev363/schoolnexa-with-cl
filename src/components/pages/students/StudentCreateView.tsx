import React, { useState } from 'react';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { UserPlus, Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentForm } from './components/StudentForm';
import { StudentFormData } from './types';
import { useCreateStudentMutation } from '@/store/students';
import { useTheme } from '@/context/ThemeContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const StudentCreateView: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [createStudentMutation] = useCreateStudentMutation();
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || undefined,
        category: data.category || undefined,
        mobile: data.mobile || undefined,
        primaryPhone: data.mobile || undefined,
        email: data.email || undefined,
        addressLine1: data.addressLine1 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        guardians: data.guardians || [],
      };
      const res = await createStudentMutation(payload).unwrap();
      const createdStudent = res?.data || res;
      setNotification(
        `Student ${createdStudent.firstName} ${createdStudent.lastName} registered successfully with Code ${createdStudent.studentCode || createdStudent.studentId || ''}!`,
      );

      setTimeout(() => {
        navigate(`/students/view/${createdStudent.id || createdStudent.studentId}`, {
          state: { justCreated: true, studentCode: createdStudent.studentCode || createdStudent.studentId },
        });
      }, 800);
    } catch (err: any) {
      console.error('Failed to create student:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          'Failed to create student. Please verify the entered information and try again.',
        ),
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header Card */}
      <Card bg={isDark ? 'dark' : 'white'} text={isDark ? 'white' : 'dark'} className="border mb-3">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
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
                    Add Student Record
                  </h5>
                  <Badge bg="secondary" className="fw-normal">
                    New Person Master
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Create a permanent student identity. Academic session and class assignments are
                  made during Admission.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/students')}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back to Students</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {notification && (
        <Alert variant="success" className="d-flex align-items-center gap-2 mb-3 py-2 small">
          <Check size={16} />
          <span>{notification}</span>
        </Alert>
      )}

      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setErrorMessage(null)}
          className="d-flex align-items-center gap-2 mb-3 py-2 small"
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </Alert>
      )}

      {/* Form */}
      <StudentForm onSubmit={handleSubmit} onCancel={() => navigate('/students')} />
    </div>
  );
};
