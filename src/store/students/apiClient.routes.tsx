/**
 * SchoolNexa Student API Route Constants
 *
 * Defines reusable API path constants for student endpoints.
 * Base URL defaults to '/api' matching server proxy routes.
 */

export const URL_BASE_API = '/api';

export const URL_STUDENT_API = '/students';
export const URL_STUDENT_LIST_API = URL_STUDENT_API;
export const URL_STUDENT_PAGE_API = `${URL_STUDENT_API}/page`;
export const URL_STUDENT_STATUS_API = `${URL_STUDENT_API}/status`;
export const URL_STUDENT_ENROLLMENT_API = `${URL_STUDENT_API}/enrollment`;
export const URL_STUDENT_IMPORT_API = `${URL_STUDENT_API}/import`;

export const URL_STUDENT_BY_ID_API = (studentId: string) =>
  `${URL_STUDENT_API}/${studentId}`;
