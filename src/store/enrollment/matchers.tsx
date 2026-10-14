/**
 * SchoolNexa Enrollment RTK Query Matchers
 *
 * Provides lifecycle listeners and boolean matchers for Enrollment RTK Query endpoints:
 * - getEnrollmentStatus: handles pending, fulfilled, rejected for enrollment queries
 * - enrollmentMutationStatus: handles pending, fulfilled, rejected for enrollment mutations
 * - isEnrollmentMutationPending / isEnrollmentMutationFulfilled / isEnrollmentMutationRejected
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { EnrollmentApi } from './services.api';
import type { EnrollmentState } from './index';

export const getEnrollmentStatus = (
  builder: ActionReducerMapBuilder<EnrollmentState>,
) => {
  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.getEnrollments.matchPending,
      EnrollmentApi.endpoints.getEnrollmentById.matchPending,
      EnrollmentApi.endpoints.getEnrollmentStats.matchPending,
      EnrollmentApi.endpoints.getEnrollmentsByStudentId.matchPending,
    ),
    (state) => {
      state.isLoading = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.getEnrollments.matchFulfilled,
      EnrollmentApi.endpoints.getEnrollmentById.matchFulfilled,
      EnrollmentApi.endpoints.getEnrollmentStats.matchFulfilled,
      EnrollmentApi.endpoints.getEnrollmentsByStudentId.matchFulfilled,
    ),
    (state) => {
      state.isLoading = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.getEnrollments.matchRejected,
      EnrollmentApi.endpoints.getEnrollmentById.matchRejected,
      EnrollmentApi.endpoints.getEnrollmentStats.matchRejected,
      EnrollmentApi.endpoints.getEnrollmentsByStudentId.matchRejected,
    ),
    (state, action: any) => {
      state.isLoading = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Failed to fetch enrollment data';
    },
  );
};

export const enrollmentMutationStatus = (
  builder: ActionReducerMapBuilder<EnrollmentState>,
) => {
  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.createEnrollment.matchPending,
      EnrollmentApi.endpoints.updateEnrollment.matchPending,
      EnrollmentApi.endpoints.updateEnrollmentStatus.matchPending,
      EnrollmentApi.endpoints.promoteStudents.matchPending,
      EnrollmentApi.endpoints.repeatStudents.matchPending,
      EnrollmentApi.endpoints.transferOutStudent.matchPending,
    ),
    (state) => {
      state.isMutating = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.createEnrollment.matchFulfilled,
      EnrollmentApi.endpoints.updateEnrollment.matchFulfilled,
      EnrollmentApi.endpoints.updateEnrollmentStatus.matchFulfilled,
      EnrollmentApi.endpoints.promoteStudents.matchFulfilled,
      EnrollmentApi.endpoints.repeatStudents.matchFulfilled,
      EnrollmentApi.endpoints.transferOutStudent.matchFulfilled,
    ),
    (state) => {
      state.isMutating = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      EnrollmentApi.endpoints.createEnrollment.matchRejected,
      EnrollmentApi.endpoints.updateEnrollment.matchRejected,
      EnrollmentApi.endpoints.updateEnrollmentStatus.matchRejected,
      EnrollmentApi.endpoints.promoteStudents.matchRejected,
      EnrollmentApi.endpoints.repeatStudents.matchRejected,
      EnrollmentApi.endpoints.transferOutStudent.matchRejected,
    ),
    (state, action: any) => {
      state.isMutating = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Enrollment operation failed';
    },
  );
};

export const isEnrollmentMutationPending = isAnyOf(
  EnrollmentApi.endpoints.createEnrollment.matchPending,
  EnrollmentApi.endpoints.updateEnrollment.matchPending,
  EnrollmentApi.endpoints.updateEnrollmentStatus.matchPending,
  EnrollmentApi.endpoints.promoteStudents.matchPending,
  EnrollmentApi.endpoints.repeatStudents.matchPending,
  EnrollmentApi.endpoints.transferOutStudent.matchPending,
);

export const isEnrollmentMutationFulfilled = isAnyOf(
  EnrollmentApi.endpoints.createEnrollment.matchFulfilled,
  EnrollmentApi.endpoints.updateEnrollment.matchFulfilled,
  EnrollmentApi.endpoints.updateEnrollmentStatus.matchFulfilled,
  EnrollmentApi.endpoints.promoteStudents.matchFulfilled,
  EnrollmentApi.endpoints.repeatStudents.matchFulfilled,
  EnrollmentApi.endpoints.transferOutStudent.matchFulfilled,
);

export const isEnrollmentMutationRejected = isAnyOf(
  EnrollmentApi.endpoints.createEnrollment.matchRejected,
  EnrollmentApi.endpoints.updateEnrollment.matchRejected,
  EnrollmentApi.endpoints.updateEnrollmentStatus.matchRejected,
  EnrollmentApi.endpoints.promoteStudents.matchRejected,
  EnrollmentApi.endpoints.repeatStudents.matchRejected,
  EnrollmentApi.endpoints.transferOutStudent.matchRejected,
);
