/**
 * SchoolNexa Enrollment API Routes
 *
 * Centralizes all REST endpoint paths for the Enrollment / Admissions module.
 * Base URL is '/api', relative to which endpoint paths are specified.
 */

export const URL_BASE_API = '/api';

export const URL_ENROLLMENT_API = '/enrollments';
export const URL_ENROLLMENT_LIST_API = URL_ENROLLMENT_API;
export const URL_ENROLLMENT_STATS_API = `${URL_ENROLLMENT_API}/stats`;
export const URL_ENROLLMENT_PROMOTE_API = `${URL_ENROLLMENT_API}/promote`;
export const URL_ENROLLMENT_REPEAT_API = `${URL_ENROLLMENT_API}/repeat`;
export const URL_ENROLLMENT_TRANSFER_OUT_API = `${URL_ENROLLMENT_API}/transfer-out`;

export const URL_ENROLLMENT_BY_ID_API = (enrollmentId: string) =>
  `${URL_ENROLLMENT_API}/${enrollmentId}`;

export const URL_ENROLLMENT_STATUS_API = (enrollmentId: string) =>
  `${URL_ENROLLMENT_API}/${enrollmentId}/status`;

export const URL_ENROLLMENTS_BY_STUDENT_API = (studentId: string) =>
  `${URL_ENROLLMENT_API}/student/${studentId}`;
