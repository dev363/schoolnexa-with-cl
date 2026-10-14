/**
 * SchoolNexa School Slice Actions / Reducers
 *
 * Defines synchronous reducer functions for the School context slice.
 * Exported functions map directly into `createSlice({ reducers: actions })`.
 * Server state and cache are managed authoritatively by SchoolApi.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import { setStoredAuth } from '@/store/utils/apiStorage';
import type { SchoolContextState } from './index';

function isValidId(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return (
    trimmed.length > 0 &&
    trimmed.toLowerCase() !== 'undefined' &&
    trimmed.toLowerCase() !== 'null'
  );
}

export const setSelectedSchoolId = (
  state: SchoolContextState,
  action: PayloadAction<string | null>,
) => {
  const id = action.payload;
  const sanitized = isValidId(id) ? id.trim() : null;
  state.selectedSchoolId = sanitized;
  setStoredAuth({ schoolId: sanitized });
};

export const setSelectedAcademicYearId = (
  state: SchoolContextState,
  action: PayloadAction<string | null>,
) => {
  const id = action.payload;
  const sanitized = isValidId(id) ? id.trim() : null;
  state.selectedAcademicYearId = sanitized;
  setStoredAuth({ academicYearId: sanitized });
};

export const setSelectedTenantContext = (
  state: SchoolContextState,
  action: PayloadAction<{
    schoolId?: string | null;
    academicYearId?: string | null;
  }>,
) => {
  const { schoolId, academicYearId } = action.payload;
  if (schoolId !== undefined) {
    state.selectedSchoolId = isValidId(schoolId) ? schoolId.trim() : null;
  }
  if (academicYearId !== undefined) {
    state.selectedAcademicYearId = isValidId(academicYearId)
      ? academicYearId.trim()
      : null;
  }
  setStoredAuth({
    schoolId: state.selectedSchoolId,
    academicYearId: state.selectedAcademicYearId,
  });
};

export const clearSelectedTenantContext = (state: SchoolContextState) => {
  state.selectedSchoolId = null;
  state.selectedAcademicYearId = null;
  setStoredAuth({
    schoolId: null,
    academicYearId: null,
  });
};
