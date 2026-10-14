/**
 * SchoolNexa Academic RTK Query Matchers
 *
 * Provides lifecycle listeners and boolean matchers for Academic RTK Query endpoints:
 * - getAcademicStatus: handles pending, fulfilled, rejected for academic queries
 * - academicMutationStatus: handles pending, fulfilled, rejected for academic mutations
 * - isAcademicMutationPending / isAcademicMutationFulfilled / isAcademicMutationRejected
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { AcademicApi } from './services.api';
import type { AcademicState } from './index';

export const getAcademicStatus = (
  builder: ActionReducerMapBuilder<AcademicState>,
) => {
  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.getClasses.matchPending,
      AcademicApi.endpoints.getClassById.matchPending,
      AcademicApi.endpoints.getSections.matchPending,
      AcademicApi.endpoints.getSectionById.matchPending,
      AcademicApi.endpoints.getSubjects.matchPending,
      AcademicApi.endpoints.getSubjectById.matchPending,
      AcademicApi.endpoints.getCurriculum.matchPending,
      AcademicApi.endpoints.getCurriculumById.matchPending,
      AcademicApi.endpoints.getTeacherAssignments.matchPending,
    ),
    (state) => {
      state.isLoading = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.getClasses.matchFulfilled,
      AcademicApi.endpoints.getClassById.matchFulfilled,
      AcademicApi.endpoints.getSections.matchFulfilled,
      AcademicApi.endpoints.getSectionById.matchFulfilled,
      AcademicApi.endpoints.getSubjects.matchFulfilled,
      AcademicApi.endpoints.getSubjectById.matchFulfilled,
      AcademicApi.endpoints.getCurriculum.matchFulfilled,
      AcademicApi.endpoints.getCurriculumById.matchFulfilled,
      AcademicApi.endpoints.getTeacherAssignments.matchFulfilled,
    ),
    (state) => {
      state.isLoading = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.getClasses.matchRejected,
      AcademicApi.endpoints.getClassById.matchRejected,
      AcademicApi.endpoints.getSections.matchRejected,
      AcademicApi.endpoints.getSectionById.matchRejected,
      AcademicApi.endpoints.getSubjects.matchRejected,
      AcademicApi.endpoints.getSubjectById.matchRejected,
      AcademicApi.endpoints.getCurriculum.matchRejected,
      AcademicApi.endpoints.getCurriculumById.matchRejected,
      AcademicApi.endpoints.getTeacherAssignments.matchRejected,
    ),
    (state, action: any) => {
      state.isLoading = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Failed to fetch academic data';
    },
  );
};

export const academicMutationStatus = (
  builder: ActionReducerMapBuilder<AcademicState>,
) => {
  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.createClass.matchPending,
      AcademicApi.endpoints.updateClass.matchPending,
      AcademicApi.endpoints.deleteClass.matchPending,
      AcademicApi.endpoints.createSection.matchPending,
      AcademicApi.endpoints.updateSection.matchPending,
      AcademicApi.endpoints.deleteSection.matchPending,
      AcademicApi.endpoints.createSubject.matchPending,
      AcademicApi.endpoints.updateSubject.matchPending,
      AcademicApi.endpoints.deleteSubject.matchPending,
      AcademicApi.endpoints.createCurriculum.matchPending,
      AcademicApi.endpoints.bulkCurriculum.matchPending,
      AcademicApi.endpoints.updateCurriculum.matchPending,
      AcademicApi.endpoints.deleteCurriculum.matchPending,
      AcademicApi.endpoints.createTeacherAssignment.matchPending,
      AcademicApi.endpoints.deleteTeacherAssignment.matchPending,
    ),
    (state) => {
      state.isMutating = true;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.createClass.matchFulfilled,
      AcademicApi.endpoints.updateClass.matchFulfilled,
      AcademicApi.endpoints.deleteClass.matchFulfilled,
      AcademicApi.endpoints.createSection.matchFulfilled,
      AcademicApi.endpoints.updateSection.matchFulfilled,
      AcademicApi.endpoints.deleteSection.matchFulfilled,
      AcademicApi.endpoints.createSubject.matchFulfilled,
      AcademicApi.endpoints.updateSubject.matchFulfilled,
      AcademicApi.endpoints.deleteSubject.matchFulfilled,
      AcademicApi.endpoints.createCurriculum.matchFulfilled,
      AcademicApi.endpoints.bulkCurriculum.matchFulfilled,
      AcademicApi.endpoints.updateCurriculum.matchFulfilled,
      AcademicApi.endpoints.deleteCurriculum.matchFulfilled,
      AcademicApi.endpoints.createTeacherAssignment.matchFulfilled,
      AcademicApi.endpoints.deleteTeacherAssignment.matchFulfilled,
    ),
    (state) => {
      state.isMutating = false;
      state.error = null;
    },
  );

  builder.addMatcher(
    isAnyOf(
      AcademicApi.endpoints.createClass.matchRejected,
      AcademicApi.endpoints.updateClass.matchRejected,
      AcademicApi.endpoints.deleteClass.matchRejected,
      AcademicApi.endpoints.createSection.matchRejected,
      AcademicApi.endpoints.updateSection.matchRejected,
      AcademicApi.endpoints.deleteSection.matchRejected,
      AcademicApi.endpoints.createSubject.matchRejected,
      AcademicApi.endpoints.updateSubject.matchRejected,
      AcademicApi.endpoints.deleteSubject.matchRejected,
      AcademicApi.endpoints.createCurriculum.matchRejected,
      AcademicApi.endpoints.bulkCurriculum.matchRejected,
      AcademicApi.endpoints.updateCurriculum.matchRejected,
      AcademicApi.endpoints.deleteCurriculum.matchRejected,
      AcademicApi.endpoints.createTeacherAssignment.matchRejected,
      AcademicApi.endpoints.deleteTeacherAssignment.matchRejected,
    ),
    (state, action: any) => {
      state.isMutating = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Academic operation failed';
    },
  );
};

export const isAcademicMutationPending = isAnyOf(
  AcademicApi.endpoints.createClass.matchPending,
  AcademicApi.endpoints.updateClass.matchPending,
  AcademicApi.endpoints.deleteClass.matchPending,
  AcademicApi.endpoints.createSection.matchPending,
  AcademicApi.endpoints.updateSection.matchPending,
  AcademicApi.endpoints.deleteSection.matchPending,
  AcademicApi.endpoints.createSubject.matchPending,
  AcademicApi.endpoints.updateSubject.matchPending,
  AcademicApi.endpoints.deleteSubject.matchPending,
  AcademicApi.endpoints.createCurriculum.matchPending,
  AcademicApi.endpoints.bulkCurriculum.matchPending,
  AcademicApi.endpoints.updateCurriculum.matchPending,
  AcademicApi.endpoints.deleteCurriculum.matchPending,
  AcademicApi.endpoints.createTeacherAssignment.matchPending,
  AcademicApi.endpoints.deleteTeacherAssignment.matchPending,
);

export const isAcademicMutationFulfilled = isAnyOf(
  AcademicApi.endpoints.createClass.matchFulfilled,
  AcademicApi.endpoints.updateClass.matchFulfilled,
  AcademicApi.endpoints.deleteClass.matchFulfilled,
  AcademicApi.endpoints.createSection.matchFulfilled,
  AcademicApi.endpoints.updateSection.matchFulfilled,
  AcademicApi.endpoints.deleteSection.matchFulfilled,
  AcademicApi.endpoints.createSubject.matchFulfilled,
  AcademicApi.endpoints.updateSubject.matchFulfilled,
  AcademicApi.endpoints.deleteSubject.matchFulfilled,
  AcademicApi.endpoints.createCurriculum.matchFulfilled,
  AcademicApi.endpoints.bulkCurriculum.matchFulfilled,
  AcademicApi.endpoints.updateCurriculum.matchFulfilled,
  AcademicApi.endpoints.deleteCurriculum.matchFulfilled,
  AcademicApi.endpoints.createTeacherAssignment.matchFulfilled,
  AcademicApi.endpoints.deleteTeacherAssignment.matchFulfilled,
);

export const isAcademicMutationRejected = isAnyOf(
  AcademicApi.endpoints.createClass.matchRejected,
  AcademicApi.endpoints.updateClass.matchRejected,
  AcademicApi.endpoints.deleteClass.matchRejected,
  AcademicApi.endpoints.createSection.matchRejected,
  AcademicApi.endpoints.updateSection.matchRejected,
  AcademicApi.endpoints.deleteSection.matchRejected,
  AcademicApi.endpoints.createSubject.matchRejected,
  AcademicApi.endpoints.updateSubject.matchRejected,
  AcademicApi.endpoints.deleteSubject.matchRejected,
  AcademicApi.endpoints.createCurriculum.matchRejected,
  AcademicApi.endpoints.bulkCurriculum.matchRejected,
  AcademicApi.endpoints.updateCurriculum.matchRejected,
  AcademicApi.endpoints.deleteCurriculum.matchRejected,
  AcademicApi.endpoints.createTeacherAssignment.matchRejected,
  AcademicApi.endpoints.deleteTeacherAssignment.matchRejected,
);
