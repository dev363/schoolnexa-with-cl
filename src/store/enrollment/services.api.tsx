/**
 * SchoolNexa Enrollment Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `src/store/test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_ENROLLMENT_API,
  URL_ENROLLMENT_STATS_API,
  URL_ENROLLMENT_PROMOTE_API,
  URL_ENROLLMENT_REPEAT_API,
  URL_ENROLLMENT_TRANSFER_OUT_API,
  URL_ENROLLMENT_BY_ID_API,
  URL_ENROLLMENT_STATUS_API,
  URL_ENROLLMENTS_BY_STUDENT_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';

export * from './apiClient.routes';

export const EnrollmentApi = createApi({
  reducerPath: 'EnrollmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: ['Enrollment', 'EnrollmentById', 'EnrollmentStats'],
  endpoints: (builder) => ({
    getEnrollments: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ENROLLMENT_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.enrollments)
            ? result.enrollments
            : Array.isArray(result)
              ? result
              : [];
        return [
          ...list.map((e: any) => ({ type: 'Enrollment' as const, id: e.id })),
          { type: 'Enrollment' as const, id: 'LIST' },
          'Enrollment',
        ];
      },
    }),

    getEnrollmentById: builder.query<any, string>({
      query: (enrollmentId) => ({
        url: URL_ENROLLMENT_BY_ID_API(enrollmentId),
        method: 'GET',
      }),
      providesTags: (_result, _error, enrollmentId) => [
        { type: 'Enrollment' as const, id: enrollmentId },
        { type: 'EnrollmentById' as const, id: enrollmentId },
        'Enrollment',
      ],
    }),

    getEnrollmentStats: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ENROLLMENT_STATS_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['EnrollmentStats'],
    }),

    getEnrollmentsByStudentId: builder.query<any, string>({
      query: (studentId) => ({
        url: URL_ENROLLMENTS_BY_STUDENT_API(studentId),
        method: 'GET',
      }),
      providesTags: (_result, _error, studentId) => [
        { type: 'Enrollment' as const, id: `STUDENT_${studentId}` },
        'Enrollment',
      ],
    }),

    createEnrollment: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ENROLLMENT_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Enrollment', 'EnrollmentStats'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
        } catch {}
      },
    }),

    updateEnrollment: builder.mutation<any, { id: string; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: URL_ENROLLMENT_BY_ID_API(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Enrollment',
        'EnrollmentStats',
        { type: 'EnrollmentById' as const, id },
        { type: 'Enrollment' as const, id },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
        } catch {}
      },
    }),

    updateEnrollmentStatus: builder.mutation<
      any,
      { id: string; status: string; remarks?: string }
    >({
      query: ({ id, ...body }) => ({
        url: URL_ENROLLMENT_STATUS_API(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Enrollment',
        'EnrollmentStats',
        { type: 'EnrollmentById' as const, id },
        { type: 'Enrollment' as const, id },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
        } catch {}
      },
    }),

    promoteStudents: builder.mutation<any, any[]>({
      query: (promotions) => ({
        url: URL_ENROLLMENT_PROMOTE_API,
        method: 'POST',
        body: { promotions },
      }),
      invalidatesTags: ['Enrollment', 'EnrollmentStats'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['Class', 'Section'],
          });
        } catch {}
      },
    }),

    repeatStudents: builder.mutation<any, any[]>({
      query: (repeats) => ({
        url: URL_ENROLLMENT_REPEAT_API,
        method: 'POST',
        body: { repeats },
      }),
      invalidatesTags: ['Enrollment', 'EnrollmentStats'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['Class', 'Section'],
          });
        } catch {}
      },
    }),

    transferOutStudent: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ENROLLMENT_TRANSFER_OUT_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        'Enrollment',
        'EnrollmentStats',
        ...(body?.enrollmentId ? [{ type: 'EnrollmentById' as const, id: body.enrollmentId }] : []),
        ...(body?.id ? [{ type: 'EnrollmentById' as const, id: body.id }] : []),
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'StudentApi/invalidateTags',
            payload: ['Student', 'StudentById'],
          });
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['Class', 'Section'],
          });
        } catch {}
      },
    }),
  }),
});

export const enrollmentApi = EnrollmentApi;

export const {
  useGetEnrollmentsQuery,
  useLazyGetEnrollmentsQuery,
  useGetEnrollmentByIdQuery,
  useLazyGetEnrollmentByIdQuery,
  useGetEnrollmentStatsQuery,
  useLazyGetEnrollmentStatsQuery,
  useGetEnrollmentsByStudentIdQuery,
  useLazyGetEnrollmentsByStudentIdQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useUpdateEnrollmentStatusMutation,
  usePromoteStudentsMutation,
  useRepeatStudentsMutation,
  useTransferOutStudentMutation,
} = EnrollmentApi;
