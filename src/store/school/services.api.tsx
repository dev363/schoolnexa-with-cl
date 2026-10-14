/**
 * SchoolNexa School Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `src/store/test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_SCHOOL_API,
  URL_SCHOOL_PROFILE_API,
  URL_SCHOOL_SETTINGS_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';

export * from './apiClient.routes';

export const SchoolApi = createApi({
  reducerPath: 'SchoolApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: ['School', 'SchoolById'],
  endpoints: (builder) => ({
    /**
     * GET /api/schools
     * Retrieves all accessible schools for the authenticated user
     */
    getSchools: builder.query<any[], void>({
      query: () => ({
        url: URL_SCHOOL_API,
        method: 'GET',
      }),
      providesTags: ['School'],
    }),

    /**
     * GET /api/schools/:schoolId/profile or GET /api/schools/profile
     * Retrieves profile for specified or active school
     */
    getSchoolProfile: builder.query<any, string | void>({
      query: (schoolId) => ({
        url: schoolId
          ? `${URL_SCHOOL_API}/${schoolId}/profile`
          : URL_SCHOOL_PROFILE_API,
        method: 'GET',
      }),
      providesTags: (_result, _error, schoolId) => [
        'School',
        ...(schoolId ? [{ type: 'SchoolById' as const, id: schoolId }] : []),
      ],
    }),

    /**
     * PUT /api/schools/:schoolId/profile or PUT /api/schools/profile
     * Updates school profile details
     */
    updateSchoolProfile: builder.mutation<
      any,
      { schoolId?: string; data: any }
    >({
      query: ({ schoolId, data }) => ({
        url: schoolId
          ? `${URL_SCHOOL_API}/${schoolId}/profile`
          : URL_SCHOOL_PROFILE_API,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { schoolId }) => [
        'School',
        ...(schoolId ? [{ type: 'SchoolById' as const, id: schoolId }] : []),
      ],
    }),

    /**
     * GET /api/schools/:schoolId/settings or GET /api/schools/settings
     * Retrieves configuration settings
     */
    getSchoolSettings: builder.query<any, string | void>({
      query: (schoolId) => ({
        url: schoolId
          ? `${URL_SCHOOL_API}/${schoolId}/settings`
          : URL_SCHOOL_SETTINGS_API,
        method: 'GET',
      }),
      providesTags: (_result, _error, schoolId) => [
        'School',
        ...(schoolId ? [{ type: 'SchoolById' as const, id: schoolId }] : []),
      ],
    }),

    /**
     * PUT /api/schools/:schoolId/settings or PUT /api/schools/settings
     * Updates configuration settings
     */
    updateSchoolSettings: builder.mutation<
      any,
      { schoolId?: string; data: any }
    >({
      query: ({ schoolId, data }) => ({
        url: schoolId
          ? `${URL_SCHOOL_API}/${schoolId}/settings`
          : URL_SCHOOL_SETTINGS_API,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { schoolId }) => [
        'School',
        ...(schoolId ? [{ type: 'SchoolById' as const, id: schoolId }] : []),
      ],
    }),

    /**
     * GET /api/schools/:schoolId/academic-years
     * Retrieves academic sessions for the school
     */
    getSchoolAcademicYears: builder.query<any[], string>({
      query: (schoolId) => ({
        url: `${URL_SCHOOL_API}/${schoolId}/academic-years`,
        method: 'GET',
      }),
      providesTags: (_result, _error, schoolId) => [
        'School',
        { type: 'SchoolById' as const, id: `ACADEMIC_YEARS_${schoolId}` },
      ],
    }),

    /**
     * GET /api/schools/:schoolId/roles
     * Retrieves roles for the school
     */
    getSchoolRoles: builder.query<any[], string>({
      query: (schoolId) => ({
        url: `${URL_SCHOOL_API}/${schoolId}/roles`,
        method: 'GET',
      }),
      providesTags: (_result, _error, schoolId) => [
        'School',
        { type: 'SchoolById' as const, id: `ROLES_${schoolId}` },
      ],
    }),

    /**
     * POST /api/schools
     * Creates a new school
     */
    createSchool: builder.mutation<any, any>({
      query: (body) => ({
        url: URL_SCHOOL_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['School'],
    }),

    /**
     * POST /api/schools/:schoolId/academic-years
     * Creates an academic session for the specified school
     */
    createAcademicYear: builder.mutation<
      any,
      { schoolId: string; data: any }
    >({
      query: ({ schoolId, data }) => ({
        url: `${URL_SCHOOL_API}/${schoolId}/academic-years`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { schoolId }) => [
        'School',
        { type: 'SchoolById' as const, id: `ACADEMIC_YEARS_${schoolId}` },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['Class', 'Section', 'Curriculum', 'TeacherAssignment'],
          });
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),

    /**
     * PATCH /api/schools/:schoolId/academic-years/:academicYearId/set-current
     * Sets active academic session
     */
    setCurrentAcademicYear: builder.mutation<
      any,
      { schoolId: string; academicYearId: string }
    >({
      query: ({ schoolId, academicYearId }) => ({
        url: `${URL_SCHOOL_API}/${schoolId}/academic-years/${academicYearId}/set-current`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { schoolId }) => [
        'School',
        { type: 'SchoolById' as const, id: `ACADEMIC_YEARS_${schoolId}` },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['Class', 'Section', 'Curriculum', 'TeacherAssignment'],
          });
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),
  }),
});

export const schoolApi = SchoolApi;

export const {
  useGetSchoolsQuery,
  useLazyGetSchoolsQuery,
  useGetSchoolProfileQuery,
  useLazyGetSchoolProfileQuery,
  useUpdateSchoolProfileMutation,
  useGetSchoolSettingsQuery,
  useLazyGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
  useGetSchoolAcademicYearsQuery,
  useLazyGetSchoolAcademicYearsQuery,
  useGetSchoolRolesQuery,
  useLazyGetSchoolRolesQuery,
  useCreateSchoolMutation,
  useCreateAcademicYearMutation,
  useSetCurrentAcademicYearMutation,
} = SchoolApi;

export const invalidateSchoolState = () =>
  SchoolApi.util.invalidateTags(['School']);

export const resetSchoolApiState = () => SchoolApi.util.resetApiState();
