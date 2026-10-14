/**
 * SchoolNexa Teacher RTK Query Matchers
 *
 * Provides lifecycle listeners for Teacher RTK Query endpoints:
 * - getTeachersStatus: handles pending, fulfilled, rejected for teacher queries
 * - teacherMutationStatus: handles pending, fulfilled, rejected for teacher mutations
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { TeacherApi } from './services.api';
import type { TeacherState } from './index';

export const getTeachersStatus = (
  builder: ActionReducerMapBuilder<TeacherState>,
) => {
  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.getTeachers.matchPending,
      TeacherApi.endpoints.getTeachersPage.matchPending,
    ),
    (state) => {
      state.isLoading = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.getTeachers.matchFulfilled,
      TeacherApi.endpoints.getTeachersPage.matchFulfilled,
    ),
    (state) => {
      state.isLoading = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.getTeachers.matchRejected,
      TeacherApi.endpoints.getTeachersPage.matchRejected,
    ),
    (state, action: any) => {
      state.isLoading = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Failed to fetch teachers';
    },
  );
};

export const teacherMutationStatus = (
  builder: ActionReducerMapBuilder<TeacherState>,
) => {
  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.createTeacher.matchPending,
      TeacherApi.endpoints.updateTeacher.matchPending,
      TeacherApi.endpoints.updateTeacherStatus.matchPending,
      TeacherApi.endpoints.deleteTeacher.matchPending,
      TeacherApi.endpoints.assignSubject.matchPending,
      TeacherApi.endpoints.assignClassTeacher.matchPending,
      TeacherApi.endpoints.importTeachers.matchPending,
    ),
    (state) => {
      state.isMutating = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.createTeacher.matchFulfilled,
      TeacherApi.endpoints.updateTeacher.matchFulfilled,
      TeacherApi.endpoints.updateTeacherStatus.matchFulfilled,
      TeacherApi.endpoints.deleteTeacher.matchFulfilled,
      TeacherApi.endpoints.assignSubject.matchFulfilled,
      TeacherApi.endpoints.assignClassTeacher.matchFulfilled,
      TeacherApi.endpoints.importTeachers.matchFulfilled,
    ),
    (state) => {
      state.isMutating = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      TeacherApi.endpoints.createTeacher.matchRejected,
      TeacherApi.endpoints.updateTeacher.matchRejected,
      TeacherApi.endpoints.updateTeacherStatus.matchRejected,
      TeacherApi.endpoints.deleteTeacher.matchRejected,
      TeacherApi.endpoints.assignSubject.matchRejected,
      TeacherApi.endpoints.assignClassTeacher.matchRejected,
      TeacherApi.endpoints.importTeachers.matchRejected,
    ),
    (state, action: any) => {
      state.isMutating = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Teacher operation failed';
    },
  );
};

export const isTeacherMutationPending = isAnyOf(
  TeacherApi.endpoints.createTeacher.matchPending,
  TeacherApi.endpoints.updateTeacher.matchPending,
  TeacherApi.endpoints.updateTeacherStatus.matchPending,
  TeacherApi.endpoints.deleteTeacher.matchPending,
  TeacherApi.endpoints.assignSubject.matchPending,
  TeacherApi.endpoints.assignClassTeacher.matchPending,
  TeacherApi.endpoints.importTeachers.matchPending,
);

export const isTeacherMutationFulfilled = isAnyOf(
  TeacherApi.endpoints.createTeacher.matchFulfilled,
  TeacherApi.endpoints.updateTeacher.matchFulfilled,
  TeacherApi.endpoints.updateTeacherStatus.matchFulfilled,
  TeacherApi.endpoints.deleteTeacher.matchFulfilled,
  TeacherApi.endpoints.assignSubject.matchFulfilled,
  TeacherApi.endpoints.assignClassTeacher.matchFulfilled,
  TeacherApi.endpoints.importTeachers.matchFulfilled,
);

export const isTeacherMutationRejected = isAnyOf(
  TeacherApi.endpoints.createTeacher.matchRejected,
  TeacherApi.endpoints.updateTeacher.matchRejected,
  TeacherApi.endpoints.updateTeacherStatus.matchRejected,
  TeacherApi.endpoints.deleteTeacher.matchRejected,
  TeacherApi.endpoints.assignSubject.matchRejected,
  TeacherApi.endpoints.assignClassTeacher.matchRejected,
  TeacherApi.endpoints.importTeachers.matchRejected,
);
