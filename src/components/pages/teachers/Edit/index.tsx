import React, { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { Edit2, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopHeader } from '@/components/common';
import {
  TeacherForm,
  FormTabKey,
  TeacherFormProvider,
  useTeacherFormContext,
} from '@/components/pages/teachers/Common';
import {
  useGetTeacherQuery,
  useUpdateTeacherMutation,
} from '@/store/teachers';
import {
  safeTrim,
  buildUpdateTeacherPayload,
} from '@/components/pages/teachers/teacherPayloadHelper';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { useToast } from '@/context/ToastContext';

/**
 * Inner component residing within TeacherFormProvider to access TeacherFormContext.
 * Owns final Teacher Edit form submission, submit loading state, error state, and RTK Query mutation orchestration.
 */
const TeacherEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useTeacherFormContext();

  const [updateTeacher, { isLoading: isSubmitting }] = useUpdateTeacherMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinalEditSubmit = async (
    e: React.FormEvent,
    helpers?: {
      setActiveTab: (tab: FormTabKey) => void;
    },
  ) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations from Context-backed state
    if (!safeTrim(state.firstName)) {
      setErrorMessage('First Name is required.');
      toast.warning('First Name is required.');
      helpers?.setActiveTab('basic');
      return;
    }
    if (!safeTrim(state.lastName)) {
      setErrorMessage('Last Name is required.');
      toast.warning('Last Name is required.');
      helpers?.setActiveTab('basic');
      return;
    }
    if (!safeTrim(state.mobile)) {
      setErrorMessage('Primary Mobile Number is required.');
      toast.warning('Primary Mobile Number is required.');
      helpers?.setActiveTab('basic');
      return;
    }
    if (!safeTrim(state.email)) {
      setErrorMessage('Official Email Address is required.');
      toast.warning('Official Email Address is required.');
      helpers?.setActiveTab('basic');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeTrim(state.email))) {
      setErrorMessage('Please provide a valid email address.');
      toast.warning('Please provide a valid email address.');
      helpers?.setActiveTab('basic');
      return;
    }

    const targetTeacherId = state.teacherId || '';
    if (!targetTeacherId) {
      setErrorMessage('Teacher identifier is missing.');
      toast.error('Teacher identifier is missing.');
      return;
    }

    // Construct normalized payload using safe payload helper
    const payload = buildUpdateTeacherPayload(state);

    try {
      const updated = await updateTeacher({
        teacherId: targetTeacherId,
        data: payload,
      }).unwrap();

      toast.success(
        `Teacher profile for ${updated.firstName} ${updated.lastName || ''} updated successfully.`,
      );
      navigate(`/teachers/view/${targetTeacherId}`);
    } catch (err: any) {
      console.error('Failed to save teacher record:', err);
      const msg = getApiErrorMessage(
        err,
        'Unable to save teacher record. Please try again.',
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <TeacherForm
      isEditMode={true}
      onSubmit={handleFinalEditSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onClearError={() => setErrorMessage(null)}
    />
  );
};

export const TeacherEditView: React.FC = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  // Fetch teacher details using RTK Query (shares cache with Teacher View)
  const {
    data: teacherDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTeacherQuery(teacherId!, {
    skip: !teacherId,
  });

  const teacher = teacherDetail?.teacher;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted small mt-2">Loading teacher profile...</p>
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <div className="py-4">
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <AlertTriangle size={18} />
          <div>
            <strong>Teacher Not Found:</strong>{' '}
            {typeof error === 'object' && error && 'message' in error
              ? (error as any).message
              : `Could not find teacher record matching ID "${teacherId}".`}
          </div>
        </Alert>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} className="me-1" /> Retry
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/teachers')}>
            Back to Teachers List
          </Button>
        </div>
      </div>
    );
  }

  const fullName =
    `${teacher.firstName} ${teacher.middleName ? teacher.middleName + ' ' : ''}${teacher.lastName || ''}`.trim();

  return (
    <div className="py-2">
      <TopHeader
        title={`Edit Profile: ${fullName}`}
        icon={Edit2}
        subtitle="Update teacher contact details, qualifications, experience and employment information."
        badges={[
          {
            bg: 'secondary',
            label: `${teacher.teacherId} (Read-Only)`,
          },
          {
            bg: 'info',
            label: teacher.designationName || 'Faculty',
          },
        ]}
        actions={[
          {
            name: 'Back to Profile',
            icon: ArrowLeft,
            action: () => navigate(`/teachers/view/${teacher.teacherId}`),
            variant: 'outline-secondary',
          },
        ]}
      />

      <div className="mt-3">
        <TeacherFormProvider initialTeacher={teacher} teacherId={teacher.teacherId}>
          <TeacherEditForm />
        </TeacherFormProvider>
      </div>
    </div>
  );
};

export const Edit = TeacherEditView;
export default TeacherEditView;
