/**
 * SchoolNexa Academic Synchronous Actions
 *
 * Implements client-side state mutations for the Academic slice.
 * Pure synchronous reducers following the pattern in `src/store/test.tsx`.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import type { AcademicState } from './index';

export const setAcademicFilters = (
  state: AcademicState,
  action: PayloadAction<Record<string, any>>,
) => {
  state.filters = action.payload || {};
};

export const clearAcademicFilters = (state: AcademicState) => {
  state.filters = {};
};

export const setSelectedClassId = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.selectedClassId = action.payload;
};

export const setSelectedSectionId = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.selectedSectionId = action.payload;
};

export const setSelectedSubjectId = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.selectedSubjectId = action.payload;
};

export const setSelectedCurriculumId = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.selectedCurriculumId = action.payload;
};

export const setSelectedAssignmentId = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.selectedAssignmentId = action.payload;
};

export const setActiveAcademicTab = (
  state: AcademicState,
  action: PayloadAction<string>,
) => {
  state.activeTab = action.payload;
};

export const setAcademicError = (
  state: AcademicState,
  action: PayloadAction<string | null>,
) => {
  state.error = action.payload;
};

export const clearAcademicError = (state: AcademicState) => {
  state.error = null;
};

export const resetAcademicState = (state: AcademicState) => {
  state.filters = {};
  state.selectedClassId = null;
  state.selectedSectionId = null;
  state.selectedSubjectId = null;
  state.selectedCurriculumId = null;
  state.selectedAssignmentId = null;
  state.activeTab = 'classes';
  state.isLoading = false;
  state.isMutating = false;
  state.error = null;
};
