/**
 * SchoolNexa School Context Redux Slice & Module
 *
 * Manages active multi-tenant client context:
 * - selectedSchoolId: Database primary-key UUID
 * - selectedAcademicYearId: Database primary-key UUID
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - SchoolContextState interface & initialState
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store/Store';
import { getStoredAuth } from '@/store/utils/apiStorage';
import * as actions from './actions';
import { getSchoolStatus, schoolMutationStatus } from './matchers';

export interface SchoolContextState {
  selectedSchoolId: string | null;
  selectedAcademicYearId: string | null;
}

// Restore persisted tenant context on startup safely
const initialStored = getStoredAuth();

const initialState: SchoolContextState = {
  selectedSchoolId: initialStored.schoolId,
  selectedAcademicYearId: initialStored.academicYearId,
};

export const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    getSchoolStatus(builder);
    schoolMutationStatus(builder);
  },
});

export const schoolReducer = schoolSlice.reducer;
export default schoolReducer;

export const {
  setSelectedSchoolId,
  setSelectedAcademicYearId,
  setSelectedTenantContext,
  clearSelectedTenantContext,
} = schoolSlice.actions;

// Selectors
export const SchoolSelector = (state: RootState) => state.school;
export const selectSchoolState = (state: { school: SchoolContextState }) =>
  state.school;
export const selectSelectedSchoolId = (state: { school: SchoolContextState }) =>
  state.school.selectedSchoolId;
export const selectSelectedAcademicYearId = (state: {
  school: SchoolContextState;
}) => state.school.selectedAcademicYearId;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
