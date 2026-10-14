import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Edit3, Check, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  mapDtoToStudentItem,
} from '@/store/students';
import { StudentForm } from './components/StudentForm';
import { StudentItem, StudentFormData } from './types';
import { useTheme } from '@/context/ThemeContext';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';

export const StudentEditView: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    data: rtkStudentData,
    isLoading: isRtkLoading,
    isError: isRtkError,
    refetch: refetchStudent,
  } = useGetStudentByIdQuery(studentId || '', { skip: !studentId });
  const [updateStudentMutation] = useUpdateStudentMutation();

  const [student, setStudent] = useState<StudentItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync RTK Query store data
  useEffect(() => {
    if (rtkStudentData) {
      const raw = rtkStudentData.data || rtkStudentData;
      if (raw && raw.id) {
        setStudent(raw.studentId && raw.admissionNumber ? mapDtoToStudentItem(raw) : raw);
      }
    }
  }, [rtkStudentData]);

  const loadStudent = () => {
    if (!studentId) return;
    refetchStudent();
  };

  const handleSubmit = async (data: StudentFormData) => {
    if (!student) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await updateStudentMutation({
        studentId: student.id,
        data,
      }).unwrap();
      const updated = res?.data || res;
      setNotification(`Changes for ${updated.firstName || student.firstName} ${updated.lastName || student.lastName} saved successfully!`);
      setTimeout(() => {
        navigate(`/students/view/${updated.id || student.id}`);
      }, 800);
    } catch (err: any) {
      console.error('Failed to save student changes:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          'Failed to save changes. Please check input values and try again.',
        ),
      );
      setIsSaving(false);
    }
  };

  const isLoading = isRtkLoading && !student;
  const hasError = isRtkError && !student;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" className="mb-2" />
        <div className="text-muted small">Loading student details for editing...</div>
      </div>
    );
  }

  if (hasError || !student) {
    return (
      <div
        className={`p-5 text-center rounded border ${
          isDark ? 'bg-dark border-secondary text-white' : 'bg-white border-light-subtle shadow-sm'
        }`}
      >
        <AlertCircle size={32} className="text-danger mb-2" />
        <h2 className="h6 fw-semibold text-danger">Unable to load student record.</h2>
        <p className="text-muted small mb-3">
          The requested student could not be found or an error occurred.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate('/students')}
            className="d-inline-flex align-items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Back to Directory</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={loadStudent}
            className="d-inline-flex align-items-center gap-1"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  const initialFormData: Partial<StudentFormData> & { studentCode?: string } = {
    studentCode: student.studentCode,
    firstName: student.firstName,
    middleName: student.middleName || '',
    lastName: student.lastName,
    photoUrl: student.photoUrl || '',
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    bloodGroup: student.bloodGroup || '',
    specialCategory: student.specialCategory || 'N',
    specialCategoryDetails: student.specialCategoryDetails || '',
    nationality: student.nationality || 'Indian',
    religion: student.religion || '',
    category: student.category || '',
    motherTongue: student.motherTongue || '',
    placeOfBirth: student.placeOfBirth || '',
    governmentId: student.governmentId || '',
    mobile: student.mobile || '',
    alternateMobile: student.alternateMobile || '',
    email: student.email || '',
    addressLine1: student.addressLine1 || '',
    addressLine2: student.addressLine2 || '',
    city: student.city || '',
    state: student.state || '',
    country: student.country || 'India',
    postalCode: student.postalCode || '',
    guardians: student.guardians || [],
    previousSchool: student.previousSchool || '',
    previousClass: student.previousClass || '',
    previousSchoolBoard: student.previousSchoolBoard || '',
    transferCertificateNumber: student.transferCertificateNumber || '',
    transferCertificateDate: student.transferCertificateDate || '',
    notes: student.notes || '',
    status: student.status,
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
                <Edit3 size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>
                    Edit Student: {student.firstName} {student.lastName}
                  </h5>
                  <Badge bg="primary" className="fw-normal font-monospace">
                    {student.studentCode}
                  </Badge>
                </div>
                <p className="text-muted small mb-0 mt-0.5">
                  Update permanent student information and guardian records.
                </p>
              </div>
            </div>

            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate(`/students/view/${student.id}`)}
                className="d-inline-flex align-items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back to Profile</span>
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

      {/* Reusable Form */}
      <StudentForm
        initialData={initialFormData}
        isEdit={true}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/students/view/${student.id}`)}
      />
    </div>
  );
};
