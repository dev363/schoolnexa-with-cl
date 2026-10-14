/**
 * SchoolNexa Academic Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `src/store/test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_ACADEMIC_CLASSES_API,
  URL_ACADEMIC_CLASS_BY_ID_API,
  URL_ACADEMIC_SECTIONS_API,
  URL_ACADEMIC_SECTION_BY_ID_API,
  URL_ACADEMIC_SUBJECTS_API,
  URL_ACADEMIC_SUBJECT_BY_ID_API,
  URL_ACADEMIC_CURRICULUM_API,
  URL_ACADEMIC_CURRICULUM_BULK_API,
  URL_ACADEMIC_CURRICULUM_BY_ID_API,
  URL_ACADEMIC_ASSIGNMENTS_API,
  URL_ACADEMIC_ASSIGNMENT_BY_ID_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';

export * from './apiClient.routes';

export const AcademicApi = createApi({
  reducerPath: 'AcademicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: [
    'Class',
    'ClassById',
    'Section',
    'SectionById',
    'Subject',
    'SubjectById',
    'Curriculum',
    'CurriculumById',
    'TeacherAssignment',
  ],
  endpoints: (builder) => ({
    // ==========================================
    // 1. CLASSES
    // ==========================================

    getClasses: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ACADEMIC_CLASSES_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        return [
          ...list.map((c: any) => ({ type: 'Class' as const, id: c.id })),
          { type: 'Class' as const, id: 'LIST' },
          'Class',
        ];
      },
    }),

    getClassById: builder.query<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_CLASS_BY_ID_API(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [
        'Class',
        { type: 'ClassById' as const, id },
      ],
    }),

    createClass: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_CLASSES_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class'],
    }),

    updateClass: builder.mutation<any, { id: string; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: URL_ACADEMIC_CLASS_BY_ID_API(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Class',
        { type: 'ClassById' as const, id },
        'Section',
        'Curriculum',
      ],
    }),

    deleteClass: builder.mutation<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_CLASS_BY_ID_API(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Class',
        { type: 'ClassById' as const, id },
        'Section',
        'Curriculum',
      ],
    }),

    // ==========================================
    // 2. SECTIONS
    // ==========================================

    getSections: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ACADEMIC_SECTIONS_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        return [
          ...list.map((s: any) => ({ type: 'Section' as const, id: s.id })),
          { type: 'Section' as const, id: 'LIST' },
          'Section',
        ];
      },
    }),

    getSectionById: builder.query<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_SECTION_BY_ID_API(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [
        'Section',
        { type: 'SectionById' as const, id },
      ],
    }),

    createSection: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_SECTIONS_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Section', 'Class'],
    }),

    updateSection: builder.mutation<any, { id: string; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: URL_ACADEMIC_SECTION_BY_ID_API(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Section',
        { type: 'SectionById' as const, id },
        'Class',
      ],
    }),

    deleteSection: builder.mutation<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_SECTION_BY_ID_API(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Section',
        { type: 'SectionById' as const, id },
        'Class',
        'TeacherAssignment',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'TeacherApi/invalidateTags',
            payload: ['Teacher'],
          });
        } catch {}
      },
    }),

    // ==========================================
    // 3. SUBJECTS
    // ==========================================

    getSubjects: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ACADEMIC_SUBJECTS_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        return [
          ...list.map((s: any) => ({ type: 'Subject' as const, id: s.id })),
          { type: 'Subject' as const, id: 'LIST' },
          'Subject',
        ];
      },
    }),

    getSubjectById: builder.query<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_SUBJECT_BY_ID_API(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [
        'Subject',
        { type: 'SubjectById' as const, id },
      ],
    }),

    createSubject: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_SUBJECTS_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subject'],
    }),

    updateSubject: builder.mutation<any, { id: string; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: URL_ACADEMIC_SUBJECT_BY_ID_API(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Subject',
        { type: 'SubjectById' as const, id },
        'Curriculum',
      ],
    }),

    deleteSubject: builder.mutation<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_SUBJECT_BY_ID_API(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Subject',
        { type: 'SubjectById' as const, id },
        'Curriculum',
        'TeacherAssignment',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'TeacherApi/invalidateTags',
            payload: ['Teacher'],
          });
        } catch {}
      },
    }),

    // ==========================================
    // 4. CURRICULUM (CLASS-SUBJECT MAPPING)
    // ==========================================

    getCurriculum: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ACADEMIC_CURRICULUM_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        return [
          ...list.map((c: any) => ({ type: 'Curriculum' as const, id: c.id })),
          { type: 'Curriculum' as const, id: 'LIST' },
          'Curriculum',
        ];
      },
    }),

    getCurriculumById: builder.query<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_CURRICULUM_BY_ID_API(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [
        'Curriculum',
        { type: 'CurriculumById' as const, id },
      ],
    }),

    createCurriculum: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_CURRICULUM_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Curriculum'],
    }),

    bulkCurriculum: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_CURRICULUM_BULK_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Curriculum'],
    }),

    updateCurriculum: builder.mutation<any, { id: string; data: Record<string, any> }>({
      query: ({ id, data }) => ({
        url: URL_ACADEMIC_CURRICULUM_BY_ID_API(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Curriculum',
        { type: 'CurriculumById' as const, id },
      ],
    }),

    deleteCurriculum: builder.mutation<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_CURRICULUM_BY_ID_API(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Curriculum',
        { type: 'CurriculumById' as const, id },
        'TeacherAssignment',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'TeacherApi/invalidateTags',
            payload: ['Teacher'],
          });
        } catch {}
      },
    }),

    // ==========================================
    // 5. TEACHER ASSIGNMENTS
    // ==========================================

    getTeacherAssignments: builder.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: URL_ACADEMIC_ASSIGNMENTS_API,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        return [
          ...list.map((a: any) => ({ type: 'TeacherAssignment' as const, id: a.id })),
          { type: 'TeacherAssignment' as const, id: 'LIST' },
          'TeacherAssignment',
        ];
      },
    }),

    createTeacherAssignment: builder.mutation<any, Record<string, any>>({
      query: (body) => ({
        url: URL_ACADEMIC_ASSIGNMENTS_API,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TeacherAssignment'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'TeacherApi/invalidateTags',
            payload: ['Teacher'],
          });
        } catch {}
      },
    }),

    deleteTeacherAssignment: builder.mutation<any, string>({
      query: (id) => ({
        url: URL_ACADEMIC_ASSIGNMENT_BY_ID_API(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherAssignment'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({
            type: 'TeacherApi/invalidateTags',
            payload: ['Teacher'],
          });
        } catch {}
      },
    }),
  }),
});

export const academicApi = AcademicApi;

export const {
  useGetClassesQuery,
  useLazyGetClassesQuery,
  useGetClassByIdQuery,
  useLazyGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSectionsQuery,
  useLazyGetSectionsQuery,
  useGetSectionByIdQuery,
  useLazyGetSectionByIdQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useGetSubjectsQuery,
  useLazyGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useLazyGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetCurriculumQuery,
  useLazyGetCurriculumQuery,
  useGetCurriculumByIdQuery,
  useLazyGetCurriculumByIdQuery,
  useCreateCurriculumMutation,
  useBulkCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
  useGetTeacherAssignmentsQuery,
  useLazyGetTeacherAssignmentsQuery,
  useCreateTeacherAssignmentMutation,
  useDeleteTeacherAssignmentMutation,
} = AcademicApi;
