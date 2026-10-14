import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import { validate } from '../validators/validate';
import {
  teacherIdParamSchema,
  createTeacherSchema,
  updateTeacherSchema,
  updateTeacherStatusSchema,
  assignmentIdParamSchema,
  assignSubjectSchema,
  assignClassTeacherSchema,
} from '../validators/teacherValidators';
import { teacherController } from '../controllers/teacherController';

const router = Router();

// Multi-tenant isolation: All teacher routes strictly require Authenticated User and Active School Context
router.use(requireAuth);
router.use(requireSchoolContext);

// ==========================================
// TEACHER / FACULTY REST ENDPOINTS
// ==========================================

/**
 * GET /api/teachers
 * List teachers with filtering, search, sorting, and pagination
 */
router.get('/', requirePermission('teachers.view'), teacherController.listTeachers);

/**
 * POST /api/teachers/page
 * Standardized pagination, filtering, search, and sorting endpoint
 */
router.post('/page', requirePermission('teachers.view'), teacherController.getTeachersPage);

/**
 * GET /api/teachers/metadata
 * Retrieve active departments and designations for teacher management forms
 */
router.get('/metadata', requirePermission('teachers.view'), teacherController.getTeacherMetadata);

/**
 * GET /api/teachers/next-id
 * Generate next auto-incremented permanent teacher employee code
 */
router.get('/next-id', requirePermission('teachers.view'), teacherController.getNextTeacherId);

/**
 * GET /api/teachers/workload/summary
 * Aggregate workload distribution summary across all faculty in the school
 */
router.get(
  '/workload/summary',
  requirePermission('teachers.view'),
  teacherController.getWorkloadSummary,
);

/**
 * POST /api/teachers
 * Register a new teacher master profile
 */
router.post(
  '/',
  requirePermission('teachers.create'),
  validate(createTeacherSchema),
  teacherController.createTeacher,
);

/**
 * POST /api/teachers/import
 * Batch import multiple teacher master profiles
 */
router.post('/import', requirePermission('teachers.create'), teacherController.importTeachers);

/**
 * GET /api/teachers/:teacherId
 * Retrieve detailed teacher profile (including assignments & timetable)
 */
router.get(
  '/:teacherId',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherById,
);

/**
 * GET /api/teachers/:teacherId/workload
 * Detailed weekly periods, workload analysis, and distribution by class and subject
 */
router.get(
  '/:teacherId/workload',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherWorkload,
);

/**
 * GET /api/teachers/:teacherId/timetable
 * Retrieve weekly teaching timetable grid, period slots, and substitution availability
 */
router.get(
  '/:teacherId/timetable',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherTimetable,
);

/**
 * POST /api/teachers/:teacherId/assignments/subjects
 * Assign subject teaching periods
 */
router.post(
  '/:teacherId/assignments/subjects',
  requirePermission('teachers.edit', 'academic.assign'),
  validate(assignSubjectSchema),
  teacherController.assignSubject,
);

/**
 * DELETE /api/teachers/:teacherId/assignments/subjects/:assignmentId
 * Remove subject teaching assignment
 */
router.delete(
  '/:teacherId/assignments/subjects/:assignmentId',
  requirePermission('teachers.edit', 'academic.assign'),
  validate(assignmentIdParamSchema),
  teacherController.removeSubjectAssignment,
);

/**
 * POST /api/teachers/:teacherId/assignments/class-teacher
 * Assign or transfer Class Teacher role
 */
router.post(
  '/:teacherId/assignments/class-teacher',
  requirePermission('teachers.edit', 'academic.assign'),
  validate(assignClassTeacherSchema),
  teacherController.assignClassTeacher,
);

/**
 * DELETE /api/teachers/:teacherId/assignments/class-teacher/:assignmentId
 * Remove Class Teacher role
 */
router.delete(
  '/:teacherId/assignments/class-teacher/:assignmentId',
  requirePermission('teachers.edit', 'academic.assign'),
  validate(assignmentIdParamSchema),
  teacherController.removeClassTeacherAssignment,
);

/**
 * GET /api/teachers/:teacherId/qualifications
 */
router.get(
  '/:teacherId/qualifications',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherQualifications,
);

/**
 * POST /api/teachers/:teacherId/qualifications
 */
router.post(
  '/:teacherId/qualifications',
  requirePermission('teachers.edit'),
  validate(teacherIdParamSchema),
  teacherController.addTeacherQualification,
);

/**
 * PUT /api/teachers/:teacherId/qualifications/:qualificationId
 */
router.put(
  '/:teacherId/qualifications/:qualificationId',
  requirePermission('teachers.edit'),
  teacherController.updateTeacherQualification,
);

/**
 * DELETE /api/teachers/:teacherId/qualifications/:qualificationId
 */
router.delete(
  '/:teacherId/qualifications/:qualificationId',
  requirePermission('teachers.edit'),
  teacherController.deleteTeacherQualification,
);

/**
 * GET /api/teachers/:teacherId/experience
 */
router.get(
  '/:teacherId/experience',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherExperience,
);

/**
 * POST /api/teachers/:teacherId/experience
 */
router.post(
  '/:teacherId/experience',
  requirePermission('teachers.edit'),
  validate(teacherIdParamSchema),
  teacherController.addTeacherExperience,
);

/**
 * PUT /api/teachers/:teacherId/experience/:experienceId
 */
router.put(
  '/:teacherId/experience/:experienceId',
  requirePermission('teachers.edit'),
  teacherController.updateTeacherExperience,
);

/**
 * DELETE /api/teachers/:teacherId/experience/:experienceId
 */
router.delete(
  '/:teacherId/experience/:experienceId',
  requirePermission('teachers.edit'),
  teacherController.deleteTeacherExperience,
);

/**
 * GET /api/teachers/:teacherId/documents
 */
router.get(
  '/:teacherId/documents',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherDocuments,
);

/**
 * POST /api/teachers/:teacherId/documents
 */
router.post(
  '/:teacherId/documents',
  requirePermission('teachers.edit'),
  validate(teacherIdParamSchema),
  teacherController.addTeacherDocument,
);

/**
 * DELETE /api/teachers/:teacherId/documents/:documentId
 */
router.delete(
  '/:teacherId/documents/:documentId',
  requirePermission('teachers.edit'),
  teacherController.deleteTeacherDocument,
);

/**
 * GET /api/teachers/:teacherId/assignments
 */
router.get(
  '/:teacherId/assignments',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherAssignments,
);

/**
 * GET /api/teachers/:teacherId/activities
 */
router.get(
  '/:teacherId/activities',
  requirePermission('teachers.view'),
  validate(teacherIdParamSchema),
  teacherController.getTeacherActivities,
);

/**
 * PUT /api/teachers/:teacherId
 * Update teacher master details
 */
router.put(
  '/:teacherId',
  requirePermission('teachers.edit'),
  validate(updateTeacherSchema),
  teacherController.updateTeacher,
);

/**
 * PATCH /api/teachers/:teacherId/status
 * Activate, deactivate, or suspend teacher service status
 */
router.patch(
  '/:teacherId/status',
  requirePermission('teachers.deactivate', 'teachers.edit'),
  validate(updateTeacherStatusSchema),
  teacherController.updateTeacherStatus,
);

/**
 * DELETE /api/teachers/:teacherId
 * Deactivate / archive teacher record
 */
router.delete(
  '/:teacherId',
  requirePermission('teachers.deactivate', 'teachers.edit'),
  validate(teacherIdParamSchema),
  teacherController.deleteTeacher,
);

export default router;
