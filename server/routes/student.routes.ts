import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import { validate } from '../validators/validate';
import {
  studentIdParamSchema,
  createStudentSchema,
  updateStudentSchema,
  updateStudentStatusSchema,
} from '../validators/studentValidators';
import { studentController } from '../controllers/studentController';

const router = Router();

// Multi-tenant isolation: All student routes strictly require Authenticated User and Active School Context
router.use(requireAuth);
router.use(requireSchoolContext);

// ==========================================
// STUDENT REST ENDPOINTS
// ==========================================

/**
 * GET /api/students
 * List students with filtering, search, sorting, and pagination
 */
router.get('/', requirePermission('students.view'), studentController.listStudents);

/**
 * POST /api/students
 * Admit / register a new student master record
 */
router.post(
  '/',
  requirePermission('students.admit'),
  validate(createStudentSchema),
  studentController.createStudent,
);

/**
 * GET /api/students/:studentId
 * Get detailed student record
 */
router.get(
  '/:studentId',
  requirePermission('students.view'),
  validate(studentIdParamSchema),
  studentController.getStudentById,
);

/**
 * PUT /api/students/:studentId
 * Update student master details
 */
router.put(
  '/:studentId',
  requirePermission('students.edit'),
  validate(updateStudentSchema),
  studentController.updateStudent,
);

/**
 * PATCH /api/students/:studentId/status
 * Activate or deactivate (archive) student
 */
router.patch(
  '/:studentId/status',
  requirePermission('students.edit'),
  validate(updateStudentStatusSchema),
  studentController.updateStudentStatus,
);

/**
 * DELETE /api/students/:studentId
 * Soft-delete / deactivate student record
 */
router.delete(
  '/:studentId',
  requirePermission('students.edit'),
  validate(studentIdParamSchema),
  studentController.deleteStudent,
);

export default router;
