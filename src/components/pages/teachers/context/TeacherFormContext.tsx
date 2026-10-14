import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TeacherFormState,
  createInitialTeacherFormState,
  Teacher,
} from '@/components/pages/teachers/teacherFormTypes';

export interface TeacherFormContextValue {
  state: TeacherFormState;
  handleTopStateChange: React.Dispatch<React.SetStateAction<TeacherFormState>>;
}

export const TeacherFormContext = createContext<TeacherFormContextValue | undefined>(undefined);

export interface TeacherFormProviderProps {
  children: React.ReactNode;
  initialTeacher?: Teacher | null;
  teacherId?: string;
}

export const TeacherFormProvider: React.FC<TeacherFormProviderProps> = ({
  children,
  initialTeacher,
  teacherId,
}) => {
  const [state, setState] = useState<TeacherFormState>(() =>
    createInitialTeacherFormState(initialTeacher, {
      teacherId,
    }),
  );

  useEffect(() => {
    if (initialTeacher) {
      setState(createInitialTeacherFormState(initialTeacher, { teacherId }));
    } else if (teacherId) {
      setState((prev) => (prev.teacherId !== teacherId ? { ...prev, teacherId } : prev));
    }
  }, [initialTeacher?.teacherId, initialTeacher?.id, teacherId]);

  return (
    <TeacherFormContext.Provider
      value={{
        state,
        handleTopStateChange: setState,
      }}
    >
      {children}
    </TeacherFormContext.Provider>
  );
};

export const useTeacherFormContext = (): TeacherFormContextValue => {
  const context = useContext(TeacherFormContext);
  if (!context) {
    throw new Error('useTeacherFormContext must be used within a TeacherFormProvider');
  }
  return context;
};
