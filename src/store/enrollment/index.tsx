/**
 * SchoolNexa Enrollment Redux Slice & Module
 *
 * Manages client-side enrollment state:
 * - filters: active search, academic year, class, section, status filters
 * - selectedEnrollmentId: active selected enrollment for detail drawer / modal
 * - isLoading: query pending lifecycle flag
 * - isMutating: mutation pending lifecycle flag
 * - error: operational error message
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - EnrollmentState interface & initialState
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import * as actions from './actions';
import { getEnrollmentStatus, enrollmentMutationStatus } from './matchers';

export interface EnrollmentState {
  filters: Record<string, any>;
  selectedEnrollmentId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  filters: {},
  selectedEnrollmentId: null,
  isLoading: false,
  isMutating: false,
  error: null,
};

export const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    getEnrollmentStatus(builder);
    enrollmentMutationStatus(builder);
  },
});

export const enrollmentReducer = enrollmentSlice.reducer;
export default enrollmentReducer;

export const {
  setEnrollmentFilters,
  setSelectedEnrollmentId,
  clearEnrollmentFilters,
  setEnrollmentError,
  clearEnrollmentError,
  resetEnrollmentState,
} = enrollmentSlice.actions;

// Selectors
export const EnrollmentSelector = (state: RootState) =>
  (state as any).enrollment || (state as any).enrollments;
export const selectEnrollmentState = (state: { enrollment: EnrollmentState }) =>
  state.enrollment;
export const selectEnrollmentFilters = (state: { enrollment: EnrollmentState }) =>
  state.enrollment?.filters || {};
export const selectSelectedEnrollmentId = (state: {
  enrollment: EnrollmentState;
}) => state.enrollment?.selectedEnrollmentId || null;
export const selectEnrollmentLoading = (state: { enrollment: EnrollmentState }) =>
  state.enrollment?.isLoading || false;
export const selectEnrollmentMutating = (state: { enrollment: EnrollmentState }) =>
  state.enrollment?.isMutating || false;
export const selectEnrollmentError = (state: { enrollment: EnrollmentState }) =>
  state.enrollment?.error || null;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
