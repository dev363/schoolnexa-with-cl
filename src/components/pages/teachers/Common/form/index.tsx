import React, { useState, useEffect, useContext } from 'react';
import { Form as BsForm, Button, Alert, Spinner } from 'react-bootstrap';
import { TabList, TabListTab } from '@/components/common';
import {
  Save,
  X,
  AlertCircle,
  GraduationCap,
  Briefcase,
  FileText,
  User,
  Heart,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Teacher,
  DepartmentItem,
  DesignationItem,
} from '@/components/pages/teachers/types';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  useGetTeachersQuery,
  useGetTeacherMetadataQuery,
  useGetNextTeacherIdQuery,
} from '@/store/teachers';
import {
  TeacherFormContext,
  TeacherFormProvider,
  useTeacherFormContext,
} from '@/components/pages/teachers/context';
import { BasicTab, FormBasicTab } from './BasicTab';
import { EmploymentTab, FormEmploymentTab } from './EmploymentTab';
import { QualificationsTab, FormQualificationsTab } from './QualificationsTab';
import { ExperienceTab, FormExperienceTab } from './ExperienceTab';
import { ContactsTab, FormContactsTab } from './ContactsTab';
import { DocumentsTab, FormDocumentsTab } from './DocumentsTab';

export type FormTabKey =
  | 'basic'
  | 'employment'
  | 'qualifications'
  | 'experience'
  | 'contacts'
  | 'documents';

export interface TeacherFormProps {
  initialTeacher?: Teacher;
  isEditMode?: boolean;
  onSubmit?: (
    e: React.FormEvent,
    helpers?: {
      setActiveTab: (tab: FormTabKey) => void;
    },
  ) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

const TeacherFormInner: React.FC<TeacherFormProps> = ({
  initialTeacher,
  isEditMode = false,
  onSubmit: externalSubmit,
  isSubmitting: externalIsSubmitting,
  errorMessage: externalErrorMessage,
  onClearError: externalClearError,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { token, activeSchool } = useAuth();
  const { state: contextState, handleTopStateChange } = useTeacherFormContext();

  // RTK Query: Source of truth for existing teachers, metadata, and nextId
  const { data: teachersData } = useGetTeachersQuery({ pageSize: 100 });
  const existingTeachers = teachersData?.teachers || [];

  const { data: metaData } = useGetTeacherMetadataQuery();
  const { data: nextIdData } = useGetNextTeacherIdQuery(undefined, {
    skip: isEditMode,
  });

  const departments = metaData?.departments || [];
  const designations = metaData?.designations || [];

  // Active section tab
  const [activeTab, setActiveTab] = useState<FormTabKey>('basic');

  const isSubmitting = externalIsSubmitting ?? false;
  const errorMessage = externalErrorMessage ?? null;

  // Sync server next teacher ID on mount / query return
  useEffect(() => {
    if (!isEditMode && nextIdData?.nextTeacherId) {
      handleTopStateChange((prev) =>
        prev.teacherId !== nextIdData.nextTeacherId ? { ...prev, teacherId: nextIdData.nextTeacherId } : prev,
      );
    }
  }, [isEditMode, nextIdData?.nextTeacherId]);

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (externalClearError) {
      externalClearError();
    }

    // If external parent submit handler is provided (e.g. centralized Teacher Add/Edit parent), delegate to it
    if (externalSubmit) {
      await externalSubmit(e, { setActiveTab });
      return;
    }
  };

  return (
    <BsForm onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => externalClearError && externalClearError()}
          className="mb-3 py-2 small"
        >
          <AlertCircle size={15} className="me-1 inline" />
          {errorMessage}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <TabList
        activeTab={activeTab}
        onSelect={(k) => {
          if (k) setActiveTab(k as FormTabKey);
        }}
        tabs={[
          {
            eventKey: 'basic',
            label: 'Basic & Contact',
            icon: User,
          },
          {
            eventKey: 'employment',
            label: 'Employment',
            icon: Briefcase,
          },
          {
            eventKey: 'qualifications',
            label: 'Qualifications',
            icon: GraduationCap,
            count: contextState.qualifications.length,
          },
          {
            eventKey: 'experience',
            label: 'Experience',
            icon: Calendar,
            count: contextState.experiences.length,
          },
          {
            eventKey: 'contacts',
            label: 'Emergency Contacts',
            icon: Heart,
            count: contextState.emergencyContacts.length,
          },
          {
            eventKey: 'documents',
            label: 'Documents',
            icon: FileText,
            count: contextState.documents.length,
          },
        ]}
        className="mb-3"
      />

      {/* TAB CONTENTS (MODULARIZED) */}
      {activeTab === 'basic' && (
        <FormBasicTab
          isDark={isDark}
        />
      )}

      {activeTab === 'employment' && (
        <FormEmploymentTab
          departments={departments}
          designations={designations}
          existingTeachers={existingTeachers}
          isDark={isDark}
        />
      )}

      {activeTab === 'qualifications' && (
        <FormQualificationsTab
          isDark={isDark}
        />
      )}

      {activeTab === 'experience' && (
        <FormExperienceTab
          isDark={isDark}
        />
      )}

      {activeTab === 'contacts' && (
        <FormContactsTab
          isDark={isDark}
        />
      )}

      {activeTab === 'documents' && (
        <FormDocumentsTab
          isDark={isDark}
        />
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={isSubmitting}
          onClick={() => {
            const targetId = contextState.teacherId || initialTeacher?.teacherId;
            return isEditMode && targetId
              ? navigate(`/teachers/view/${targetId}`)
              : navigate('/teachers');
          }}
        >
          <X size={15} className="me-1 inline" /> Cancel
        </Button>

        <div className="d-flex align-items-center gap-2">
          {activeTab !== 'basic' && (
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => {
                const tabs: FormTabKey[] = [
                  'basic',
                  'employment',
                  'qualifications',
                  'experience',
                  'contacts',
                  'documents',
                ];
                const curIdx = tabs.indexOf(activeTab);
                if (curIdx > 0) setActiveTab(tabs[curIdx - 1]);
              }}
            >
              Previous Tab
            </Button>
          )}

          {activeTab !== 'documents' && (
            <Button
              variant="outline-primary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => {
                const tabs: FormTabKey[] = [
                  'basic',
                  'employment',
                  'qualifications',
                  'experience',
                  'contacts',
                  'documents',
                ];
                const curIdx = tabs.indexOf(activeTab);
                if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1]);
              }}
            >
              Next Tab
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting}
            className="d-flex align-items-center gap-1 px-3"
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditMode ? 'Update Teacher Record' : 'Save Teacher Master'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </BsForm>
  );
};

export const TeacherForm: React.FC<TeacherFormProps> = (props) => {
  const context = useContext(TeacherFormContext);
  if (!context) {
    return (
      <TeacherFormProvider initialTeacher={props.initialTeacher} teacherId={props.initialTeacher?.teacherId}>
        <TeacherFormInner {...props} />
      </TeacherFormProvider>
    );
  }
  return <TeacherFormInner {...props} />;
};

export const Form = TeacherForm;
export default TeacherForm;

export * from './BasicTab';
export * from './EmploymentTab';
export * from './QualificationsTab';
export * from './ExperienceTab';
export * from './ContactsTab';
export * from './DocumentsTab';
