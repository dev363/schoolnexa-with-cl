/**
 * SchoolNexa Student Redux Module
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - StudentState interface & initialState
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import * as actions from './actions';
import { getStudentsStatus, studentMutationStatus } from './matchers';

export interface StudentState {
  filters: Record<string, any>;
  selectedStudentId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: StudentState = {
  filters: {},
  selectedStudentId: null,
  isLoading: false,
  isMutating: false,
  error: null,
};

export const StudentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    getStudentsStatus(builder);
    studentMutationStatus(builder);
  },
});

export default StudentSlice.reducer;
export const studentReducer = StudentSlice.reducer;

export const {
  setFilters,
  setSelectedStudentId,
  clearStudentFilters,
  setStudentError,
  clearStudentError,
} = StudentSlice.actions;

// Selectors
export const StudentSelector = (state: RootState) => state.students;
export const selectStudentsState = (state: RootState) => state.students;
export const selectStudentFilters = (state: RootState) =>
  state.students?.filters || {};
export const selectSelectedStudentId = (state: RootState) =>
  state.students?.selectedStudentId || null;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
export * from './studentMappers';
