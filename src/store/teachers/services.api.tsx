/**
 * SchoolNexa Teacher Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `src/store/test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_TEACHER_API,
  URL_TEACHER_PAGE_API,
  URL_TEACHER_METADATA_API,
  URL_TEACHER_NEXT_ID_API,
  URL_TEACHER_WORKLOAD_SUMMARY_API,
  URL_TEACHER_IMPORT_API,
  URL_TEACHER_BY_ID_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';
import { mapDtoToTeacher } from './teacherMappers';
import type {
  Teacher,
  TeacherListResponse,
  TeacherDetailResponse,
  TeacherQueryParams,
  TeacherMetadataResponse,
  NextTeacherIdResponse,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  UpdateTeacherStatusRequest,
  AssignSubjectRequest,
  AssignClassTeacherRequest,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  TeacherTimetableSlot,
  TeacherWorkload,
  WorkloadSummary,
  TeacherQualification,
  TeacherExperience,
  TeacherDocument,
  TeacherActivityLog,
  CreateTeacherQualificationRequest,
  UpdateTeacherQualificationRequest,
  CreateTeacherExperienceRequest,
  UpdateTeacherExperienceRequest,
  CreateTeacherDocumentRequest,
  TeacherAssignmentsResponse,
  ListPageRequest,
  ListPageResponse,
} from './types';

export * from './apiClient.routes';

export const TeacherApi = createApi({
  reducerPath: 'TeacherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: ['Teacher', 'TeacherById'],
  endpoints: (builder) => ({
    /**
     * GET /api/teachers
     * Retrieves paginated list of teachers with filtering and sorting
     */
    getTeachers: builder.query<TeacherListResponse, TeacherQueryParams | void>({
      query: (params) => ({
        url: URL_TEACHER_API,
        method: 'GET',
        params: params || undefined,
      }),
      transformResponse: (response: any): TeacherListResponse => {
        const rawTeachers = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        const teachers: Teacher[] = rawTeachers.map(mapDtoToTeacher);

        const pagination = response?.pagination || {
          page: 1,
          pageSize: teachers.length || 20,
          total: teachers.length || 0,
          totalPages: Math.max(
            1,
            Math.ceil((teachers.length || 0) / (response?.pagination?.pageSize || 20)),
          ),
        };

        return {
          teachers,
          pagination,
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: pagination.totalPages,
        };
      },
      providesTags: (result) =>
        result?.teachers
          ? [
              ...result.teachers.flatMap((t) => [
                { type: 'Teacher' as const, id: t.id },
                ...(t.teacherId && t.teacherId !== t.id
                  ? [{ type: 'Teacher' as const, id: t.teacherId }]
                  : []),
              ]),
              { type: 'Teacher' as const, id: 'LIST' },
            ]
          : [{ type: 'Teacher' as const, id: 'LIST' }],
    }),

    /**
     * POST /api/teachers/page
     * Standardized pagination, filtering, search, and sorting endpoint.
     */
    getTeachersPage: builder.query<ListPageResponse<Teacher>, ListPageRequest | void>({
      query: (body) => ({
        url: URL_TEACHER_PAGE_API,
        method: 'POST',
        body: body || {},
      }),
      transformResponse: (response: any): ListPageResponse<Teacher> => {
        const rawTeachers = Array.isArray(response?.data) ? response.data : [];
        const teachers: Teacher[] = rawTeachers.map(mapDtoToTeacher);
        return {
          success: Boolean(response?.success),
          data: teachers,
          pagination: {
            page: response?.pagination?.page ?? 0,
            pageSize: response?.pagination?.pageSize ?? 25,
            total: response?.pagination?.total ?? teachers.length,
            totalPages: response?.pagination?.totalPages ?? (teachers.length > 0 ? 1 : 0),
          },
        };
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.flatMap((t) => [
                { type: 'Teacher' as const, id: t.id },
                ...(t.teacherId && t.teacherId !== t.id
                  ? [{ type: 'Teacher' as const, id: t.teacherId }]
                  : []),
              ]),
              { type: 'Teacher' as const, id: 'LIST' },
            ]
          : [{ type: 'Teacher' as const, id: 'LIST' }],
    }),

    /**
     * GET /api/teachers/:teacherId
     * Retrieves full teacher profile details, assignments, and timetable
     */
    getTeacher: builder.query<TeacherDetailResponse, string>({
      query: (teacherId) => ({
        url: URL_TEACHER_BY_ID_API(teacherId),
        method: 'GET',
      }),
      transformResponse: (response: any): TeacherDetailResponse => {
        const teacher = mapDtoToTeacher(response);
        return {
          teacher,
          subjectAssignments: response?.subjectAssignments || [],
          classAssignment: response?.classAssignments?.[0] || response?.classAssignment,
          timetableSlots: response?.timetableSlots || [],
          documents: response?.documents || teacher.documents || [],
        };
      },
      providesTags: (result, _error, teacherId) => [
        { type: 'Teacher' as const, id: teacherId },
        ...(result?.teacher?.id && result.teacher.id !== teacherId
          ? [{ type: 'Teacher' as const, id: result.teacher.id }]
          : []),
        ...(result?.teacher?.teacherId && result.teacher.teacherId !== teacherId
          ? [{ type: 'Teacher' as const, id: result.teacher.teacherId }]
          : []),
      ],
    }),

    /**
     * GET /api/teachers/metadata
     */
    getTeacherMetadata: builder.query<TeacherMetadataResponse, void>({
      query: () => ({
        url: URL_TEACHER_METADATA_API,
        method: 'GET',
      }),
      providesTags: [{ type: 'Teacher' as const, id: 'METADATA' }],
    }),

    /**
     * GET /api/teachers/next-id
     */
    getNextTeacherId: builder.query<NextTeacherIdResponse, void>({
      query: () => ({
        url: URL_TEACHER_NEXT_ID_API,
        method: 'GET',
      }),
      providesTags: [{ type: 'Teacher' as const, id: 'NEXT_ID' }],
    }),

    /**
     * GET /api/teachers/:teacherId/workload
     */
    getTeacherWorkload: builder.query<TeacherWorkload, string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/workload`,
        method: 'GET',
      }),
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
      ],
    }),

    /**
     * GET /api/teachers/workload/summary
     */
    getWorkloadSummary: builder.query<WorkloadSummary, void>({
      query: () => ({
        url: URL_TEACHER_WORKLOAD_SUMMARY_API,
        method: 'GET',
      }),
      providesTags: [{ type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' }],
    }),

    /**
     * GET /api/teachers/:teacherId/timetable
     */
    getTeacherTimetable: builder.query<TeacherTimetableSlot[], string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/timetable`,
        method: 'GET',
      }),
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.slots || [],
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `TIMETABLE_${teacherId}` },
      ],
    }),

    /**
     * POST /api/teachers
     */
    createTeacher: builder.mutation<Teacher, CreateTeacherRequest>({
      query: (body) => ({
        url: URL_TEACHER_API,
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => mapDtoToTeacher(response),
      invalidatesTags: [
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
        { type: 'Teacher' as const, id: 'NEXT_ID' },
      ],
    }),

    /**
     * PUT /api/teachers/:teacherId
     */
    updateTeacher: builder.mutation<
      Teacher,
      { teacherId: string; data: UpdateTeacherRequest }
    >({
      query: ({ teacherId, data }) => ({
        url: URL_TEACHER_BY_ID_API(teacherId),
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => mapDtoToTeacher(response),
      invalidatesTags: (result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        ...(result?.id && result.id !== teacherId
          ? [{ type: 'Teacher' as const, id: result.id }]
          : []),
        ...(result?.teacherId && result.teacherId !== teacherId
          ? [{ type: 'Teacher' as const, id: result.teacherId }]
          : []),
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * PATCH /api/teachers/:teacherId/status
     */
    updateTeacherStatus: builder.mutation<
      Teacher,
      { teacherId: string } & UpdateTeacherStatusRequest
    >({
      query: ({ teacherId, status, reason }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/status`,
        method: 'PATCH',
        body: { status, reason },
      }),
      transformResponse: (response: any) => mapDtoToTeacher(response),
      invalidatesTags: (result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        ...(result?.id && result.id !== teacherId
          ? [{ type: 'Teacher' as const, id: result.id }]
          : []),
        ...(result?.teacherId && result.teacherId !== teacherId
          ? [{ type: 'Teacher' as const, id: result.teacherId }]
          : []),
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * DELETE /api/teachers/:teacherId
     */
    deleteTeacher: builder.mutation<{ id: string; status: string }, string>({
      query: (teacherId) => ({
        url: URL_TEACHER_BY_ID_API(teacherId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, _error, teacherId) => [
        { type: 'Teacher' as const, id: teacherId },
        ...(result?.id && result.id !== teacherId
          ? [{ type: 'Teacher' as const, id: result.id }]
          : []),
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * POST /api/teachers/:teacherId/assignments/subjects
     */
    assignSubject: builder.mutation<
      TeacherSubjectAssignment,
      { teacherId: string } & AssignSubjectRequest
    >({
      query: ({ teacherId, ...body }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/assignments/subjects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
        { type: 'Teacher' as const, id: `TIMETABLE_${teacherId}` },
        { type: 'Teacher' as const, id: `ASSIGNMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * DELETE /api/teachers/:teacherId/assignments/subjects/:assignmentId
     */
    removeSubjectAssignment: builder.mutation<
      { id: string; success: boolean },
      { teacherId: string; assignmentId: string }
    >({
      query: ({ teacherId, assignmentId }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/assignments/subjects/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
        { type: 'Teacher' as const, id: `TIMETABLE_${teacherId}` },
        { type: 'Teacher' as const, id: `ASSIGNMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * POST /api/teachers/:teacherId/assignments/class-teacher
     */
    assignClassTeacher: builder.mutation<
      TeacherClassAssignment,
      { teacherId: string } & AssignClassTeacherRequest
    >({
      query: ({ teacherId, ...body }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/assignments/class-teacher`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
        { type: 'Teacher' as const, id: `TIMETABLE_${teacherId}` },
        { type: 'Teacher' as const, id: `ASSIGNMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * DELETE /api/teachers/:teacherId/assignments/class-teacher/:assignmentId
     */
    removeClassTeacherAssignment: builder.mutation<
      { id: string; success: boolean },
      { teacherId: string; assignmentId: string }
    >({
      query: ({ teacherId, assignmentId }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/assignments/class-teacher/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: teacherId },
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: `WORKLOAD_${teacherId}` },
        { type: 'Teacher' as const, id: `TIMETABLE_${teacherId}` },
        { type: 'Teacher' as const, id: `ASSIGNMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'AcademicApi/invalidateTags',
            payload: ['TeacherAssignment'],
          });
        } catch {}
      },
    }),

    /**
     * GET /api/teachers/:teacherId/qualifications
     */
    getTeacherQualifications: builder.query<TeacherQualification[], string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/qualifications`,
        method: 'GET',
      }),
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.qualifications || [],
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `QUALIFICATIONS_${teacherId}` },
      ],
    }),

    /**
     * POST /api/teachers/:teacherId/qualifications
     */
    createTeacherQualification: builder.mutation<
      TeacherQualification,
      { teacherId: string; data: CreateTeacherQualificationRequest }
    >({
      query: ({ teacherId, data }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/qualifications`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `QUALIFICATIONS_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * PUT /api/teachers/:teacherId/qualifications/:qualificationId
     */
    updateTeacherQualification: builder.mutation<
      TeacherQualification,
      {
        teacherId: string;
        qualificationId: string;
        data: UpdateTeacherQualificationRequest;
      }
    >({
      query: ({ teacherId, qualificationId, data }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/qualifications/${qualificationId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `QUALIFICATIONS_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * DELETE /api/teachers/:teacherId/qualifications/:qualificationId
     */
    deleteTeacherQualification: builder.mutation<
      { id: string; success: boolean },
      { teacherId: string; qualificationId: string }
    >({
      query: ({ teacherId, qualificationId }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/qualifications/${qualificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `QUALIFICATIONS_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * GET /api/teachers/:teacherId/experience
     */
    getTeacherExperience: builder.query<TeacherExperience[], string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/experience`,
        method: 'GET',
      }),
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.experiences || [],
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `EXPERIENCE_${teacherId}` },
      ],
    }),

    /**
     * POST /api/teachers/:teacherId/experience
     */
    createTeacherExperience: builder.mutation<
      TeacherExperience,
      { teacherId: string; data: CreateTeacherExperienceRequest }
    >({
      query: ({ teacherId, data }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/experience`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `EXPERIENCE_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * PUT /api/teachers/:teacherId/experience/:experienceId
     */
    updateTeacherExperience: builder.mutation<
      TeacherExperience,
      {
        teacherId: string;
        experienceId: string;
        data: UpdateTeacherExperienceRequest;
      }
    >({
      query: ({ teacherId, experienceId, data }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/experience/${experienceId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `EXPERIENCE_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * DELETE /api/teachers/:teacherId/experience/:experienceId
     */
    deleteTeacherExperience: builder.mutation<
      { id: string; success: boolean },
      { teacherId: string; experienceId: string }
    >({
      query: ({ teacherId, experienceId }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/experience/${experienceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `EXPERIENCE_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * GET /api/teachers/:teacherId/documents
     */
    getTeacherDocuments: builder.query<TeacherDocument[], string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/documents`,
        method: 'GET',
      }),
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.documents || [],
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `DOCUMENTS_${teacherId}` },
      ],
    }),

    /**
     * POST /api/teachers/:teacherId/documents
     */
    createTeacherDocument: builder.mutation<
      TeacherDocument,
      { teacherId: string; data: CreateTeacherDocumentRequest }
    >({
      query: ({ teacherId, data }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `DOCUMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * DELETE /api/teachers/:teacherId/documents/:documentId
     */
    deleteTeacherDocument: builder.mutation<
      { id: string; success: boolean },
      { teacherId: string; documentId: string }
    >({
      query: ({ teacherId, documentId }) => ({
        url: `${URL_TEACHER_API}/${teacherId}/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { teacherId }) => [
        { type: 'Teacher' as const, id: `DOCUMENTS_${teacherId}` },
        { type: 'Teacher' as const, id: teacherId },
      ],
    }),

    /**
     * GET /api/teachers/:teacherId/assignments
     */
    getTeacherAssignments: builder.query<TeacherAssignmentsResponse, string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/assignments`,
        method: 'GET',
      }),
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `ASSIGNMENTS_${teacherId}` },
      ],
    }),

    /**
     * GET /api/teachers/:teacherId/activities
     */
    getTeacherActivities: builder.query<TeacherActivityLog[], string>({
      query: (teacherId) => ({
        url: `${URL_TEACHER_API}/${teacherId}/activities`,
        method: 'GET',
      }),
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.activities || [],
      providesTags: (_result, _error, teacherId) => [
        { type: 'Teacher' as const, id: `ACTIVITIES_${teacherId}` },
      ],
    }),

    /**
     * POST /api/teachers/import
     */
    importTeachers: builder.mutation<{ imported: any[]; failed?: any[] }, any[]>({
      query: (teachers) => ({
        url: URL_TEACHER_IMPORT_API,
        method: 'POST',
        body: { teachers },
      }),
      invalidatesTags: [
        { type: 'Teacher' as const, id: 'LIST' },
        { type: 'Teacher' as const, id: 'WORKLOAD_SUMMARY' },
      ],
    }),
  }),
});

export const teacherApi = TeacherApi;

export const {
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useGetTeachersPageQuery,
  useLazyGetTeachersPageQuery,
  useGetTeacherQuery,
  useLazyGetTeacherQuery,
  useGetTeacherMetadataQuery,
  useGetNextTeacherIdQuery,
  useGetTeacherWorkloadQuery,
  useGetWorkloadSummaryQuery,
  useGetTeacherTimetableQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useUpdateTeacherStatusMutation,
  useDeleteTeacherMutation,
  useImportTeachersMutation,
  useAssignSubjectMutation,
  useRemoveSubjectAssignmentMutation,
  useAssignClassTeacherMutation,
  useRemoveClassTeacherAssignmentMutation,
  useGetTeacherQualificationsQuery,
  useLazyGetTeacherQualificationsQuery,
  useCreateTeacherQualificationMutation,
  useUpdateTeacherQualificationMutation,
  useDeleteTeacherQualificationMutation,
  useGetTeacherExperienceQuery,
  useLazyGetTeacherExperienceQuery,
  useCreateTeacherExperienceMutation,
  useUpdateTeacherExperienceMutation,
  useDeleteTeacherExperienceMutation,
  useGetTeacherDocumentsQuery,
  useLazyGetTeacherDocumentsQuery,
  useCreateTeacherDocumentMutation,
  useDeleteTeacherDocumentMutation,
  useGetTeacherAssignmentsQuery,
  useLazyGetTeacherAssignmentsQuery,
  useGetTeacherActivitiesQuery,
  useLazyGetTeacherActivitiesQuery,
} = TeacherApi;
