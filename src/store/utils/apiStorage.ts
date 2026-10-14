/**
 * SchoolNexa Centralized Storage Helper for API Context
 *
 * Safely accesses and manages persisted auth token, active school UUID,
 * and active academic year UUID without throwing in non-browser/SSR environments.
 *
 * Strict Rules:
 * - Never stores or returns strings like "undefined" or "null" as actual values.
 * - Enforces database UUIDs for tenant context.
 */

export const LOCAL_STORAGE_AUTH_KEY = 'schoolnexa_auth_state_v1';

export interface StoredAuthContext {
  token: string | null;
  schoolId: string | null;
  academicYearId: string | null;
  user?: any | null;
}

/**
 * Validates and sanitizes a string value.
 * Returns null if string is empty, 'undefined', or 'null'.
 */
function sanitizeString(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'null'
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Retrieves the currently persisted authentication credentials and tenant context.
 */
export function getStoredAuth(): StoredAuthContext {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { token: null, schoolId: null, academicYearId: null, user: null };
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: sanitizeString(parsed.token),
        schoolId: sanitizeString(parsed.activeSchoolId || parsed.schoolId),
        academicYearId: sanitizeString(parsed.activeAcademicYearId || parsed.academicYearId),
        user: parsed.user || null,
      };
    }
  } catch {
    // Non-blocking fallback
  }
  return { token: null, schoolId: null, academicYearId: null, user: null };
}

/**
 * Persists or updates the active auth and tenant context in local storage.
 */
export function setStoredAuth(data: Partial<StoredAuthContext>): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getStoredAuth();
    const updated = {
      token: data.token !== undefined ? sanitizeString(data.token) : current.token,
      activeSchoolId: data.schoolId !== undefined ? sanitizeString(data.schoolId) : current.schoolId,
      activeAcademicYearId:
        data.academicYearId !== undefined ? sanitizeString(data.academicYearId) : current.academicYearId,
      user: data.user !== undefined ? data.user : current.user,
    };
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(updated));
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Clears stored auth credentials on logout.
 */
export function clearStoredAuth(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  } catch {
    // Non-blocking fallback
  }
}
