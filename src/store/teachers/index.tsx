/**
 * SchoolNexa Teacher Redux Module
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - TeacherState interface & initialState
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import * as actions from './actions';
import { getTeachersStatus, teacherMutationStatus } from './matchers';

export interface TeacherState {
  filters: Record<string, any>;
  selectedTeacherId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  filters: {},
  selectedTeacherId: null,
  isLoading: false,
  isMutating: false,
  error: null,
};

export const TeacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    getTeachersStatus(builder);
    teacherMutationStatus(builder);
  },
});

export default TeacherSlice.reducer;
export const teacherReducer = TeacherSlice.reducer;

export const {
  setFilters,
  setSelectedTeacherId,
  clearTeacherFilters,
  setTeacherError,
  clearTeacherError,
} = TeacherSlice.actions;

// Selectors
export const TeacherSelector = (state: RootState) => state.teachers;
export const selectTeachersState = (state: RootState) => state.teachers;
export const selectTeacherFilters = (state: RootState) =>
  state.teachers?.filters || {};
export const selectSelectedTeacherId = (state: RootState) =>
  state.teachers?.selectedTeacherId || null;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
export * from './types';
