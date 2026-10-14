/**
 * SchoolNexa Teacher / Faculty API Route Constants
 *
 * Defines reusable API path constants for teacher endpoints.
 * Base URL defaults to '/api' matching server proxy routes.
 */

export const URL_BASE_API = '/api';

export const URL_TEACHER_API = '/teachers';
export const URL_TEACHER_LIST_API = URL_TEACHER_API;

// Standardized listing, pagination, and import
export const URL_TEACHER_PAGE_API = `${URL_TEACHER_API}/page`;
export const URL_TEACHER_IMPORT_API = `${URL_TEACHER_API}/import`;

// Master metadata and auto-generated identifiers
export const URL_TEACHER_METADATA_API = `${URL_TEACHER_API}/metadata`;
export const URL_TEACHER_NEXT_ID_API = `${URL_TEACHER_API}/next-id`;

// Status and workload
export const URL_TEACHER_STATUS_API = `${URL_TEACHER_API}/status`;
export const URL_TEACHER_WORKLOAD_API = `${URL_TEACHER_API}/workload`;
export const URL_TEACHER_WORKLOAD_SUMMARY_API = `${URL_TEACHER_API}/workload/summary`;

// Sub-resources (qualifications, experience, documents, timetable, assignments, activities)
export const URL_TEACHER_QUALIFICATIONS_API = `${URL_TEACHER_API}/qualifications`;
export const URL_TEACHER_EXPERIENCE_API = `${URL_TEACHER_API}/experience`;
export const URL_TEACHER_DOCUMENTS_API = `${URL_TEACHER_API}/documents`;
export const URL_TEACHER_TIMETABLE_API = `${URL_TEACHER_API}/timetable`;
export const URL_TEACHER_ASSIGNMENTS_API = `${URL_TEACHER_API}/assignments`;
export const URL_TEACHER_ASSIGN_SUBJECTS_API = `${URL_TEACHER_API}/assignments/subjects`;
export const URL_TEACHER_ASSIGN_CLASS_TEACHER_API = `${URL_TEACHER_API}/assignments/class-teacher`;
export const URL_TEACHER_ACTIVITIES_API = `${URL_TEACHER_API}/activities`;

export const URL_TEACHER_BY_ID_API = (teacherId: string) =>
  `${URL_TEACHER_API}/${teacherId}`;
