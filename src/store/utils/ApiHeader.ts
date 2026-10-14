/**
 * SchoolNexa Centralized API Header Resolver
 *
 * Implements strict global tenant and authentication header construction:
 *
 * Priority Resolution Order:
 *   1. Request-specific value (explicit parameter)
 *   2. Redux / State selected value
 *   3. LocalStorage persisted value
 *   4. Omitted (Header is completely omitted if no value exists)
 *
 * Strict Rules:
 *   - NEVER sends 'X-School-Id: undefined', 'X-Academic-Year-Id: undefined',
 *     or 'Authorization: Bearer undefined'
 *   - Requires primary key identifiers (UUIDs) for multi-tenant headers
 */

import { getStoredAuth } from './apiStorage';

export interface HeaderOptions {
  token?: string | null;
  schoolId?: string | null;
  academicYearId?: string | null;
  reduxToken?: string | null;
  reduxSchoolId?: string | null;
  reduxAcademicYearId?: string | null;
  customHeaders?: Record<string, string> | HeadersInit;
}

/**
 * Validates whether a value is a non-empty, defined string (not 'undefined' or 'null').
 */
function isValidHeaderValue(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return (
    trimmed.length > 0 &&
    trimmed.toLowerCase() !== 'undefined' &&
    trimmed.toLowerCase() !== 'null'
  );
}

/**
 * Builds normalized HTTP Headers ensuring multi-tenant isolation and security.
 */
export function buildApiHeaders(options: HeaderOptions = {}): Headers {
  const headers = new Headers(options.customHeaders);
  const stored = getStoredAuth();

  // 1. Resolve Token (Request > Redux > Storage)
  const resolvedToken = [options.token, options.reduxToken, stored.token].find(
    isValidHeaderValue,
  );
  if (resolvedToken) {
    headers.set('Authorization', `Bearer ${resolvedToken}`);
  }

  // 2. Resolve School Tenant ID (Request > Redux > Storage)
  const resolvedSchoolId = [options.schoolId, options.reduxSchoolId, stored.schoolId].find(
    isValidHeaderValue,
  );
  if (resolvedSchoolId) {
    headers.set('x-school-id', resolvedSchoolId);
  }

  // 3. Resolve Academic Year Context ID (Request > Redux > Storage)
  const resolvedAcademicYearId = [
    options.academicYearId,
    options.reduxAcademicYearId,
    stored.academicYearId,
  ].find(isValidHeaderValue);
  if (resolvedAcademicYearId) {
    headers.set('X-Academic-Year-Id', resolvedAcademicYearId);
  }

  return headers;
}

/**
 * Standard prepareHeaders function matching `prepareHeaders: ApiHeader()` in `test.tsx`.
 * Seamlessly integrates with RTK Query's fetchBaseQuery.
 */
export const ApiHeader = (customHeaders?: Record<string, string>) => {
  return (headers: Headers, { getState }: { getState: () => unknown }) => {
    const state = getState() as any;
    const reduxToken = state?.auth?.token;
    const reduxSchoolId = state?.school?.selectedSchoolId;
    const reduxAcademicYearId = state?.school?.selectedAcademicYearId;

    const resolved = buildApiHeaders({
      reduxToken,
      reduxSchoolId,
      reduxAcademicYearId,
      customHeaders,
    });

    resolved.forEach((value, key) => {
      headers.set(key, value);
    });

    return headers;
  };
};

/**
 * Standardized error message extraction helper for SchoolNexa frontend.
 * Accurately extracts backend AppError messages, field validation details,
 * HTTP status fallbacks, and network/offline errors without generic masking.
 */
export function getApiErrorMessage(
  err: any,
  fallback = 'An unexpected error occurred. Please try again.',
): string {
  if (!err) return fallback;
  if (typeof err === 'string' && err.trim()) return err;

  // 1. Detailed field validation error arrays from backend
  const errors = err?.data?.errors || err?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const details = errors
      .map((e: any) => {
        if (!e) return '';
        if (typeof e === 'string') return e;
        return e.field ? `${e.field}: ${e.message || e.code || 'invalid'}` : e.message || e.code || '';
      })
      .filter(Boolean)
      .join('; ');
    if (details) return details;
  }

  // 2. Direct backend error message (from AppError, Express errorHandler, or ApiError)
  const msg = err?.data?.message || err?.data?.error || err?.message;
  if (typeof msg === 'string' && msg.trim() && msg !== '[object Object]') {
    return msg;
  }

  // 3. Network or connection errors (RTK Query FETCH_ERROR or failed fetch)
  if (
    err?.status === 'FETCH_ERROR' ||
    (typeof err?.error === 'string' && err.error.toLowerCase().includes('fetch'))
  ) {
    return 'Unable to reach the server. Please check your network connection.';
  }

  if (typeof err?.error === 'string' && err.error.trim()) {
    return err.error;
  }

  // 4. HTTP status code specific fallbacks
  const status = typeof err?.status === 'number' ? err.status : undefined;
  if (status === 400) return 'Bad request. Please verify the submitted data.';
  if (status === 401) return 'Session expired or unauthorized. Please log in again.';
  if (status === 403) return 'Access denied. You do not have permission to perform this action.';
  if (status === 404) return 'Requested record or endpoint was not found.';
  if (status === 409) return 'Conflict: Record already exists or violates a business constraint.';
  if (status === 422) return 'Validation failed. Please verify the submitted data.';
  if (status && status >= 500) return 'Internal server error. Please try again later.';

  return fallback;
}

/**
 * Helper to trigger cache invalidation on another query upon mutation completion.
 * Matches `__refreshOtherQuery(...)` in `test.tsx`.
 */
export const __refreshOtherQuery = (invalidationAction: any) => {
  return async (_arg: any, { dispatch, queryFulfilled }: any) => {
    try {
      await queryFulfilled;
      if (invalidationAction) {
        dispatch(invalidationAction);
      }
    } catch {
      // Mutation failed, do not refresh other queries
    }
  };
};
