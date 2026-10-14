import { configureStore, Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer, AuthApi } from '@/store/auth';
import { schoolReducer, SchoolApi } from '@/store/school';
import { studentReducer, StudentApi } from '@/store/students';
import { teacherReducer, TeacherApi } from '@/store/teachers';
import { enrollmentReducer, EnrollmentApi } from '@/store/enrollment';
import { academicReducer, AcademicApi } from '@/store/academic';

/**
 * Global authentication middleware for RTK Query
 * Catches 401 Unauthorized API responses (session expiration, invalid token)
 * and dispatches the standard 'auth:session_expired' event, which triggers
 * session reset and navigates the user cleanly to the login screen.
 */
export const rtkQueryAuthMiddleware: Middleware = () => (next) => (action: any) => {
  if (isRejectedWithValue(action)) {
    const status = action.payload?.status;
    if (status === 401) {
      const endpointName = action.meta?.arg?.endpointName;
      // Do not trigger session expired on the login endpoint itself
      if (endpointName !== 'login' && typeof window !== 'undefined') {
        const message =
          action.payload?.data?.message ||
          'Your session has expired or been revoked. Please log in again.';
        window.dispatchEvent(
          new CustomEvent('auth:session_expired', {
            detail: { message },
          }),
        );
      }
    }
  }
  return next(action);
};

/**
 * SchoolNexa Central Redux Store
 *
 * Configured with Redux Toolkit using direct independent RTK Query instances:
 * - auth: Client-side authentication state
 * - school: Multi-tenant client context
 * - students: Client-side student module state
 * - teachers: Client-side teacher module state
 * - enrollment: Client-side enrollment module state
 * - academic: Client-side academic module state
 * - [AuthApi.reducerPath]: AuthApi server cache (direct createApi)
 * - [StudentApi.reducerPath]: StudentApi server cache (direct createApi)
 * - [TeacherApi.reducerPath]: TeacherApi server cache (direct createApi)
 * - [SchoolApi.reducerPath]: SchoolApi server cache (direct createApi)
 * - [EnrollmentApi.reducerPath]: EnrollmentApi server cache (direct createApi)
 * - [AcademicApi.reducerPath]: AcademicApi server cache (direct createApi)
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    school: schoolReducer,
    students: studentReducer,
    teachers: teacherReducer,
    enrollment: enrollmentReducer,
    academic: academicReducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [StudentApi.reducerPath]: StudentApi.reducer,
    [TeacherApi.reducerPath]: TeacherApi.reducer,
    [SchoolApi.reducerPath]: SchoolApi.reducer,
    [EnrollmentApi.reducerPath]: EnrollmentApi.reducer,
    [AcademicApi.reducerPath]: AcademicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(rtkQueryAuthMiddleware)
      .concat(AuthApi.middleware)
      .concat(StudentApi.middleware)
      .concat(TeacherApi.middleware)
      .concat(SchoolApi.middleware)
      .concat(EnrollmentApi.middleware)
      .concat(AcademicApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable RTK Query listeners for refetchOnFocus / refetchOnReconnect capabilities
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { useAppDispatch, useAppSelector } from './hooks';

export default store;
