/**
 * SchoolNexa Teacher Slice Actions / Reducers
 *
 * Defines synchronous reducer functions for the Teacher slice.
 * Exported functions map directly into `createSlice({ reducers: actions })`.
 * Server state and cache are managed authoritatively by TeacherApi.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import type { TeacherState } from './index';

export const setFilters = (
  state: TeacherState,
  action: PayloadAction<Record<string, any>>,
) => {
  state.filters = action.payload || {};
};

export const setSelectedTeacherId = (
  state: TeacherState,
  action: PayloadAction<string | null>,
) => {
  state.selectedTeacherId = action.payload;
};

export const clearTeacherFilters = (state: TeacherState) => {
  state.filters = {};
};

export const setTeacherError = (
  state: TeacherState,
  action: PayloadAction<string | null>,
) => {
  state.error = action.payload;
};

export const clearTeacherError = (state: TeacherState) => {
  state.error = null;
};
