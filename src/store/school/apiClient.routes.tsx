/**
 * SchoolNexa School & Campus Management API Route Constants
 *
 * Defines reusable API path constants for institutional settings, profiles, and academic sessions.
 * Base URL defaults to '/api' matching server proxy routes.
 */

export const URL_BASE_API = '/api';

export const URL_SCHOOL_API = '/schools';
export const URL_SCHOOL_LIST_API = URL_SCHOOL_API;

export const URL_SCHOOL_BY_ID_API = (schoolId: string) =>
  `${URL_SCHOOL_API}/${schoolId}`;

// Institution profile and configuration
export const URL_SCHOOL_PROFILE_API = `${URL_SCHOOL_API}/profile`;
export const URL_SCHOOL_SETTINGS_API = `${URL_SCHOOL_API}/settings`;

// Academic sessions and roles
export const URL_SCHOOL_ACADEMIC_YEARS_API = `${URL_SCHOOL_API}/academic-years`;
export const URL_SCHOOL_YEARS_API = URL_SCHOOL_ACADEMIC_YEARS_API;
export const URL_SCHOOL_ROLES_API = `${URL_SCHOOL_API}/roles`;
