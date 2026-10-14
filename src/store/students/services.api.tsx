/**
 * SchoolNexa Student Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `src/store/test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_STUDENT_API,
  URL_STUDENT_BY_ID_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';

export * from './apiClient.routes';

export const StudentApi = createApi({
  reducerPath: 'StudentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: ['Student', 'StudentById'],
  endpoints: (builder) => ({
    getStudents: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_STUDENT_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.students)
            ? result.students
            : Array.isArray(result)
              ? result
              : [];
        return [
          ...list.map((s: any) => ({ type: 'Student' as const, id: s.id })),
          { type: 'Student' as const, id: 'LIST' },
          'Student',
        ];
      },
    }),

    getStudentById: builder.query<any, string>({
      query: (studentId) => ({
        url: URL_STUDENT_BY_ID_API(studentId),
        method: 'GET',
      }),
      providesTags: (_result, _error, studentId) => [
        { type: 'Student' as const, id: studentId },
        { type: 'StudentById' as const, id: studentId },
        'Student',
      ],
    }),

    createStudent: builder.mutation<any, any>({
      query: (body) => ({
        url: URL_STUDENT_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Student' as const, id: 'LIST' },
        'Student',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),

    updateStudent: builder.mutation<any, { studentId: string; data: any }>({
      query: ({ studentId, data }) => ({
        url: URL_STUDENT_BY_ID_API(studentId),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Student' as const, id: studentId },
        { type: 'StudentById' as const, id: studentId },
        { type: 'Student' as const, id: 'LIST' },
        'Student',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),

    updateStudentStatus: builder.mutation<
      any,
      { studentId: string; status: string; reason?: string }
    >({
      query: ({ studentId, status, reason }) => ({
        url: `${URL_STUDENT_API}/${studentId}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      invalidatesTags: (_result, _error, { studentId }) => [
        { type: 'Student' as const, id: studentId },
        { type: 'StudentById' as const, id: studentId },
        { type: 'Student' as const, id: 'LIST' },
        'Student',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),

    deleteStudent: builder.mutation<any, string>({
      query: (studentId) => ({
        url: URL_STUDENT_BY_ID_API(studentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, studentId) => [
        { type: 'Student' as const, id: studentId },
        { type: 'StudentById' as const, id: studentId },
        { type: 'Student' as const, id: 'LIST' },
        'Student',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'EnrollmentApi/invalidateTags',
            payload: ['Enrollment', 'EnrollmentStats'],
          });
        } catch {}
      },
    }),
  }),
});

export const studentApi = StudentApi;

export const {
  useGetStudentsQuery,
  useLazyGetStudentsQuery,
  useGetStudentByIdQuery,
  useLazyGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useUpdateStudentStatusMutation,
  useDeleteStudentMutation,
} = StudentApi;
