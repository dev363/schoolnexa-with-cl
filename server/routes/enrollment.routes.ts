/**
 * SchoolNexa Enrollment Router
 *
 * REST Endpoints for Student Enrollment management.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { enrollmentController } from '../controllers/enrollmentController';

const router = Router();

// Multi-tenant isolation: All enrollment routes require Authenticated User and Active School Context
router.use(requireAuth);
router.use(requireSchoolContext);

// ==========================================
// ENROLLMENT REST ENDPOINTS
// ==========================================

router.get('/', enrollmentController.listEnrollments);
router.get('/stats', enrollmentController.getEnrollmentStats);
router.get('/student/:studentId', enrollmentController.getEnrollmentsByStudent);
router.get('/:enrollmentId', enrollmentController.getEnrollmentById);

router.post('/', enrollmentController.createEnrollment);
router.put('/:enrollmentId', enrollmentController.updateEnrollment);
router.patch('/:enrollmentId/status', enrollmentController.updateEnrollmentStatus);

router.post('/promote', enrollmentController.promoteStudents);
router.post('/repeat', enrollmentController.repeatStudents);
router.post('/transfer-out', enrollmentController.transferOutStudent);

export default router;
