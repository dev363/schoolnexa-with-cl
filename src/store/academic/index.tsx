/**
 * SchoolNexa Academic Redux Slice & Module
 *
 * Manages client-side academic module state:
 * - filters: active class, section, subject, search filters
 * - selected IDs: selected class, section, subject, curriculum, assignment
 * - activeTab: active academic configuration tab
 * - isLoading: query pending lifecycle flag
 * - isMutating: mutation pending lifecycle flag
 * - error: operational error message
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - AcademicState interface & initialState
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import * as actions from './actions';
import { getAcademicStatus, academicMutationStatus } from './matchers';

export interface AcademicState {
  filters: Record<string, any>;
  selectedClassId: string | null;
  selectedSectionId: string | null;
  selectedSubjectId: string | null;
  selectedCurriculumId: string | null;
  selectedAssignmentId: string | null;
  activeTab: string;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: AcademicState = {
  filters: {},
  selectedClassId: null,
  selectedSectionId: null,
  selectedSubjectId: null,
  selectedCurriculumId: null,
  selectedAssignmentId: null,
  activeTab: 'classes',
  isLoading: false,
  isMutating: false,
  error: null,
};

export const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    getAcademicStatus(builder);
    academicMutationStatus(builder);
  },
});

export const academicReducer = academicSlice.reducer;
export default academicReducer;

export const {
  setAcademicFilters,
  clearAcademicFilters,
  setSelectedClassId,
  setSelectedSectionId,
  setSelectedSubjectId,
  setSelectedCurriculumId,
  setSelectedAssignmentId,
  setActiveAcademicTab,
  setAcademicError,
  clearAcademicError,
  resetAcademicState,
} = academicSlice.actions;

// Selectors
export const AcademicSelector = (state: RootState) =>
  (state as any).academic || (state as any).academics;

export const selectAcademicState = (state: { academic: AcademicState }) =>
  state.academic;

export const selectAcademicFilters = (state: { academic: AcademicState }) =>
  state.academic?.filters || {};

export const selectSelectedClassId = (state: { academic: AcademicState }) =>
  state.academic?.selectedClassId || null;

export const selectSelectedSectionId = (state: { academic: AcademicState }) =>
  state.academic?.selectedSectionId || null;

export const selectSelectedSubjectId = (state: { academic: AcademicState }) =>
  state.academic?.selectedSubjectId || null;

export const selectSelectedCurriculumId = (state: { academic: AcademicState }) =>
  state.academic?.selectedCurriculumId || null;

export const selectSelectedAssignmentId = (state: { academic: AcademicState }) =>
  state.academic?.selectedAssignmentId || null;

export const selectActiveAcademicTab = (state: { academic: AcademicState }) =>
  state.academic?.activeTab || 'classes';

export const selectAcademicLoading = (state: { academic: AcademicState }) =>
  state.academic?.isLoading || false;

export const selectAcademicMutating = (state: { academic: AcademicState }) =>
  state.academic?.isMutating || false;

export const selectAcademicError = (state: { academic: AcademicState }) =>
  state.academic?.error || null;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
