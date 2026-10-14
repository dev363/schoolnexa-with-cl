/**
 * SchoolNexa Enrollment Synchronous Actions
 *
 * Implements client-side state mutations for the Enrollment slice.
 * Pure synchronous reducers following the pattern in `src/store/test.tsx`.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import type { EnrollmentState } from './index';

export const setEnrollmentFilters = (
  state: EnrollmentState,
  action: PayloadAction<Record<string, any>>,
) => {
  state.filters = action.payload || {};
};

export const setSelectedEnrollmentId = (
  state: EnrollmentState,
  action: PayloadAction<string | null>,
) => {
  state.selectedEnrollmentId = action.payload;
};

export const clearEnrollmentFilters = (state: EnrollmentState) => {
  state.filters = {};
};

export const setEnrollmentError = (
  state: EnrollmentState,
  action: PayloadAction<string | null>,
) => {
  state.error = action.payload;
};

export const clearEnrollmentError = (state: EnrollmentState) => {
  state.error = null;
};

export const resetEnrollmentState = (state: EnrollmentState) => {
  state.filters = {};
  state.selectedEnrollmentId = null;
  state.isLoading = false;
  state.isMutating = false;
  state.error = null;
};
