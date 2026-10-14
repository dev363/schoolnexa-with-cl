/**
 * SchoolNexa Auth Services API
 *
 * Implements direct createApi with fetchBaseQuery and ApiHeader() matching `test.tsx`.
 * Independent from baseApi.tsx.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  URL_BASE_API,
  URL_AUTH_API,
  URL_AUTH_LOGIN_API,
  URL_AUTH_LOGOUT_API,
  URL_AUTH_ME_API,
} from './apiClient.routes';
import { ApiHeader } from '@/store/utils/ApiHeader';

export * from './apiClient.routes';

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: any;
    token: string;
    accessibleSchools?: any[];
  };
  token?: string;
  user?: any;
}

export const AuthApi = createApi({
  reducerPath: 'AuthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: URL_BASE_API,
    prepareHeaders: ApiHeader(),
  }),
  refetchOnMountOrArgChange: 5,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: URL_AUTH_LOGIN_API,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({ type: 'StudentApi/resetApiState' });
          dispatch({ type: 'TeacherApi/resetApiState' });
          dispatch({ type: 'SchoolApi/resetApiState' });
          dispatch({ type: 'EnrollmentApi/resetApiState' });
          dispatch({ type: 'AcademicApi/resetApiState' });
        } catch {}
      },
    }),

    logout: builder.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({
        url: URL_AUTH_LOGOUT_API,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
        } finally {
          dispatch({ type: 'AuthApi/resetApiState' });
          dispatch({ type: 'StudentApi/resetApiState' });
          dispatch({ type: 'TeacherApi/resetApiState' });
          dispatch({ type: 'SchoolApi/resetApiState' });
          dispatch({ type: 'EnrollmentApi/resetApiState' });
          dispatch({ type: 'AcademicApi/resetApiState' });
        }
      },
    }),

    getMe: builder.query<any, void>({
      query: () => ({
        url: URL_AUTH_ME_API,
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
  }),
});

export const authApi = AuthApi;

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = AuthApi;
