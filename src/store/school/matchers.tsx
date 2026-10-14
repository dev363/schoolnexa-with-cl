/**
 * SchoolNexa School RTK Query Matchers
 *
 * Provides lifecycle listeners and boolean matchers for School RTK Query endpoints:
 * - getSchoolStatus: handles pending, fulfilled, rejected for school queries
 * - schoolMutationStatus: handles pending, fulfilled, rejected for school mutations
 * - isSchoolMutationPending / isSchoolMutationFulfilled / isSchoolMutationRejected
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { SchoolApi } from './services.api';
import type { SchoolContextState } from './index';

export const getSchoolStatus = (
  builder: ActionReducerMapBuilder<SchoolContextState>,
) => {
  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.getSchools.matchPending,
      SchoolApi.endpoints.getSchoolProfile.matchPending,
      SchoolApi.endpoints.getSchoolSettings.matchPending,
      SchoolApi.endpoints.getSchoolAcademicYears.matchPending,
      SchoolApi.endpoints.getSchoolRoles.matchPending,
    ),
    (_state) => {
      // Query pending lifecycle hook
    },
  );

  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.getSchools.matchFulfilled,
      SchoolApi.endpoints.getSchoolProfile.matchFulfilled,
      SchoolApi.endpoints.getSchoolSettings.matchFulfilled,
      SchoolApi.endpoints.getSchoolAcademicYears.matchFulfilled,
      SchoolApi.endpoints.getSchoolRoles.matchFulfilled,
    ),
    (_state) => {
      // Query fulfilled lifecycle hook
    },
  );

  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.getSchools.matchRejected,
      SchoolApi.endpoints.getSchoolProfile.matchRejected,
      SchoolApi.endpoints.getSchoolSettings.matchRejected,
      SchoolApi.endpoints.getSchoolAcademicYears.matchRejected,
      SchoolApi.endpoints.getSchoolRoles.matchRejected,
    ),
    (_state, _action: any) => {
      // Query rejected lifecycle hook
    },
  );
};

export const schoolMutationStatus = (
  builder: ActionReducerMapBuilder<SchoolContextState>,
) => {
  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.updateSchoolProfile.matchPending,
      SchoolApi.endpoints.updateSchoolSettings.matchPending,
      SchoolApi.endpoints.createSchool.matchPending,
      SchoolApi.endpoints.createAcademicYear.matchPending,
      SchoolApi.endpoints.setCurrentAcademicYear.matchPending,
    ),
    (_state) => {
      // Mutation pending lifecycle hook
    },
  );

  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.updateSchoolProfile.matchFulfilled,
      SchoolApi.endpoints.updateSchoolSettings.matchFulfilled,
      SchoolApi.endpoints.createSchool.matchFulfilled,
      SchoolApi.endpoints.createAcademicYear.matchFulfilled,
      SchoolApi.endpoints.setCurrentAcademicYear.matchFulfilled,
    ),
    (_state) => {
      // Mutation fulfilled lifecycle hook
    },
  );

  builder.addMatcher(
    isAnyOf(
      SchoolApi.endpoints.updateSchoolProfile.matchRejected,
      SchoolApi.endpoints.updateSchoolSettings.matchRejected,
      SchoolApi.endpoints.createSchool.matchRejected,
      SchoolApi.endpoints.createAcademicYear.matchRejected,
      SchoolApi.endpoints.setCurrentAcademicYear.matchRejected,
    ),
    (_state, _action: any) => {
      // Mutation rejected lifecycle hook
    },
  );
};

export const isSchoolMutationPending = isAnyOf(
  SchoolApi.endpoints.updateSchoolProfile.matchPending,
  SchoolApi.endpoints.updateSchoolSettings.matchPending,
  SchoolApi.endpoints.createSchool.matchPending,
  SchoolApi.endpoints.createAcademicYear.matchPending,
  SchoolApi.endpoints.setCurrentAcademicYear.matchPending,
);

export const isSchoolMutationFulfilled = isAnyOf(
  SchoolApi.endpoints.updateSchoolProfile.matchFulfilled,
  SchoolApi.endpoints.updateSchoolSettings.matchFulfilled,
  SchoolApi.endpoints.createSchool.matchFulfilled,
  SchoolApi.endpoints.createAcademicYear.matchFulfilled,
  SchoolApi.endpoints.setCurrentAcademicYear.matchFulfilled,
);

export const isSchoolMutationRejected = isAnyOf(
  SchoolApi.endpoints.updateSchoolProfile.matchRejected,
  SchoolApi.endpoints.updateSchoolSettings.matchRejected,
  SchoolApi.endpoints.createSchool.matchRejected,
  SchoolApi.endpoints.createAcademicYear.matchRejected,
  SchoolApi.endpoints.setCurrentAcademicYear.matchRejected,
);
