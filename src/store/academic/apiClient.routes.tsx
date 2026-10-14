/**
 * SchoolNexa Academic API Route Constants
 *
 * Defines reusable API path constants for academic setup, classes, sections,
 * subjects, curriculum mapping, and teacher assignments.
 */

export const URL_BASE_API = '/api';

export const URL_ACADEMIC_API = '/academic';

// Classes
export const URL_ACADEMIC_CLASSES_API = `${URL_ACADEMIC_API}/classes`;
export const URL_ACADEMIC_CLASS_BY_ID_API = (id: string) =>
  `${URL_ACADEMIC_CLASSES_API}/${id}`;

// Sections (AcademicYearSection)
export const URL_ACADEMIC_SECTIONS_API = `${URL_ACADEMIC_API}/sections`;
export const URL_ACADEMIC_SECTION_BY_ID_API = (id: string) =>
  `${URL_ACADEMIC_SECTIONS_API}/${id}`;

// Subjects
export const URL_ACADEMIC_SUBJECTS_API = `${URL_ACADEMIC_API}/subjects`;
export const URL_ACADEMIC_SUBJECT_BY_ID_API = (id: string) =>
  `${URL_ACADEMIC_SUBJECTS_API}/${id}`;

// Curriculum (ClassSubject)
export const URL_ACADEMIC_CURRICULUM_API = `${URL_ACADEMIC_API}/curriculum`;
export const URL_ACADEMIC_CURRICULUM_BULK_API = `${URL_ACADEMIC_CURRICULUM_API}/bulk`;
export const URL_ACADEMIC_CURRICULUM_BY_ID_API = (id: string) =>
  `${URL_ACADEMIC_CURRICULUM_API}/${id}`;

// Teacher Assignments
export const URL_ACADEMIC_ASSIGNMENTS_API = `${URL_ACADEMIC_API}/assignments`;
export const URL_ACADEMIC_ASSIGNMENT_BY_ID_API = (id: string) =>
  `${URL_ACADEMIC_ASSIGNMENTS_API}/${id}`;
