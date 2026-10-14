/**
 * SchoolNexa Student RTK Query Matchers
 *
 * Provides lifecycle listeners for Student RTK Query endpoints:
 * - getStudentsStatus: handles pending, fulfilled, rejected for student queries
 * - studentMutationStatus: handles pending, fulfilled, rejected for student mutations
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { StudentApi } from './services.api';
import type { StudentState } from './index';

export const getStudentsStatus = (
  builder: ActionReducerMapBuilder<StudentState>,
) => {
  builder.addMatcher(StudentApi.endpoints.getStudents.matchPending, (state) => {
    state.isLoading = true;
    state.error = null;
  });

  builder.addMatcher(
    StudentApi.endpoints.getStudents.matchFulfilled,
    (state) => {
      state.isLoading = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    StudentApi.endpoints.getStudents.matchRejected,
    (state, action: any) => {
      state.isLoading = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Failed to fetch students';
    },
  );
};

export const studentMutationStatus = (
  builder: ActionReducerMapBuilder<StudentState>,
) => {
  builder.addMatcher(
    isAnyOf(
      StudentApi.endpoints.createStudent.matchPending,
      StudentApi.endpoints.updateStudent.matchPending,
      StudentApi.endpoints.updateStudentStatus.matchPending,
      StudentApi.endpoints.deleteStudent.matchPending,
    ),
    (state) => {
      state.isMutating = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      StudentApi.endpoints.createStudent.matchFulfilled,
      StudentApi.endpoints.updateStudent.matchFulfilled,
      StudentApi.endpoints.updateStudentStatus.matchFulfilled,
      StudentApi.endpoints.deleteStudent.matchFulfilled,
    ),
    (state) => {
      state.isMutating = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      StudentApi.endpoints.createStudent.matchRejected,
      StudentApi.endpoints.updateStudent.matchRejected,
      StudentApi.endpoints.updateStudentStatus.matchRejected,
      StudentApi.endpoints.deleteStudent.matchRejected,
    ),
    (state, action: any) => {
      state.isMutating = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Student operation failed';
    },
  );
};

// Convenience boolean matchers
export const isStudentMutationPending = isAnyOf(
  StudentApi.endpoints.createStudent.matchPending,
  StudentApi.endpoints.updateStudent.matchPending,
  StudentApi.endpoints.updateStudentStatus.matchPending,
  StudentApi.endpoints.deleteStudent.matchPending,
);

export const isStudentMutationFulfilled = isAnyOf(
  StudentApi.endpoints.createStudent.matchFulfilled,
  StudentApi.endpoints.updateStudent.matchFulfilled,
  StudentApi.endpoints.updateStudentStatus.matchFulfilled,
  StudentApi.endpoints.deleteStudent.matchFulfilled,
);

export const isStudentMutationRejected = isAnyOf(
  StudentApi.endpoints.createStudent.matchRejected,
  StudentApi.endpoints.updateStudent.matchRejected,
  StudentApi.endpoints.updateStudentStatus.matchRejected,
  StudentApi.endpoints.deleteStudent.matchRejected,
);
