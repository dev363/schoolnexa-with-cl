import React, { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '@/components/common';
import {
  TeacherForm,
  FormTabKey,
  TeacherFormProvider,
  useTeacherFormContext,
} from '@/components/pages/teachers/Common';
import {
  useCreateTeacherMutation,
  useGetNextTeacherIdQuery,
} from '@/store/teachers';
import {
  safeTrim,
  buildCreateTeacherPayload,
} from '@/components/pages/teachers/teacherPayloadHelper';
import { getApiErrorMessage } from '@/store/utils/ApiHeader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

/**
 * Inner component residing within TeacherFormProvider to access TeacherFormContext.
 * Owns final Teacher Add form submission, loading state, error state, and RTK Query mutation orchestration.
 */
const TeacherCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useTeacherFormContext();

  const [createTeacher, { isLoading: isSubmitting }] = useCreateTeacherMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinalAddSubmit = async (
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

    // Construct normalized payload using safe payload helper
    const payload = buildCreateTeacherPayload(state);

    try {
      const created = await createTeacher(payload).unwrap();
      toast.success(
        `Teacher master created successfully with Teacher ID: ${created.teacherId}`,
      );
      navigate(`/teachers/view/${created.teacherId}`);
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
      isEditMode={false}
      onSubmit={handleFinalAddSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onClearError={() => setErrorMessage(null)}
    />
  );
};

export const TeacherCreateView: React.FC = () => {
  const navigate = useNavigate();
  const { activeSchool } = useAuth();

  // Query next sequential Teacher ID from RTK Query endpoint
  const { data: nextIdData } = useGetNextTeacherIdQuery();
  const nextId = nextIdData?.nextTeacherId || 'TCH-AUTO';

  return (
    <div className="py-2">
      <TopHeader
        title="Add New Teacher"
        icon={UserPlus}
        subtitle="Create a permanent teacher master profile with unique Teacher ID, qualifications and contact information."
        badges={[
          {
            bg: 'primary',
            label: `${nextId} (Auto-Generated)`,
          },
          {
            bg: 'secondary',
            label: activeSchool?.name || 'School',
          },
        ]}
        actions={[
          {
            name: 'Back to Teachers',
            icon: ArrowLeft,
            action: () => navigate('/teachers'),
            variant: 'outline-secondary',
          },
        ]}
      />

      <div className="mt-3">
        <TeacherFormProvider teacherId={nextId}>
          <TeacherCreateForm />
        </TeacherFormProvider>
      </div>
    </div>
  );
};

export const Add = TeacherCreateView;
export default TeacherCreateView;
