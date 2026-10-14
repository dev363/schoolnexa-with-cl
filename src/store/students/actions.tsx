/**
 * SchoolNexa Student Slice Actions / Reducers
 *
 * Defines synchronous reducer functions for the Student slice.
 * Exported functions map directly into `createSlice({ reducers: actions })`.
 * Server state and cache are managed authoritatively by StudentApi.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import type { StudentState } from './index';

export const setFilters = (
  state: StudentState,
  action: PayloadAction<Record<string, any>>,
) => {
  state.filters = action.payload || {};
};

export const setSelectedStudentId = (
  state: StudentState,
  action: PayloadAction<string | null>,
) => {
  state.selectedStudentId = action.payload;
};

export const clearStudentFilters = (state: StudentState) => {
  state.filters = {};
};

export const setStudentError = (
  state: StudentState,
  action: PayloadAction<string | null>,
) => {
  state.error = action.payload;
};

export const clearStudentError = (state: StudentState) => {
  state.error = null;
};
