import { Router } from 'express';
import { schoolController } from '../controllers/schoolController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

export const schoolRouter = Router();

// All school endpoints require an authenticated user
schoolRouter.use(requireAuth);

/**
 * GET /api/schools
 * Returns all schools accessible by the current user from MySQL database
 */
schoolRouter.get('/', asyncHandler(schoolController.getAccessibleSchools));

/**
 * POST /api/schools
 * Provisions a new school in the database (Restricted to platform super administrators)
 */
schoolRouter.post(
  '/',
  (req, _res, next) => {
    if (!req.user?.isSuperAdmin) {
      throw new AppError(
        'Forbidden: Only platform super administrators can provision new schools',
        403,
        [{ message: 'Platform administrator role required', code: 'PLATFORM_ADMIN_REQUIRED' }],
      );
    }
    next();
  },
  asyncHandler(schoolController.createSchool),
);

// All subsequent school-specific endpoints require an active school context
schoolRouter.use(requireSchoolContext);

/**
 * GET /api/schools/profile & GET /api/schools/:schoolId/profile
 * Retrieves full institutional profile
 */
schoolRouter.get('/profile', asyncHandler(schoolController.getSchoolProfile));
schoolRouter.get('/:schoolId/profile', asyncHandler(schoolController.getSchoolProfile));

/**
 * PUT /api/schools/profile & PUT /api/schools/:schoolId/profile
 * Updates full institutional profile
 */
schoolRouter.put('/profile', asyncHandler(schoolController.updateSchoolProfile));
schoolRouter.put('/:schoolId/profile', asyncHandler(schoolController.updateSchoolProfile));
schoolRouter.patch('/profile', asyncHandler(schoolController.updateSchoolProfile));
schoolRouter.patch('/:schoolId/profile', asyncHandler(schoolController.updateSchoolProfile));

/**
 * GET /api/schools/settings & GET /api/schools/:schoolId/settings
 * Retrieves institutional configuration parameters
 */
schoolRouter.get('/settings', asyncHandler(schoolController.getSchoolSettings));
schoolRouter.get('/:schoolId/settings', asyncHandler(schoolController.getSchoolSettings));

/**
 * PUT /api/schools/settings & PUT /api/schools/:schoolId/settings
 * Updates institutional configuration parameters
 */
schoolRouter.put('/settings', asyncHandler(schoolController.updateSchoolSettings));
schoolRouter.put('/:schoolId/settings', asyncHandler(schoolController.updateSchoolSettings));

/**
 * GET /api/schools/roles & GET /api/schools/:schoolId/roles
 * Returns all roles and permissions for a school
 */
schoolRouter.get('/roles', asyncHandler(schoolController.getSchoolRoles));
schoolRouter.get('/:schoolId/roles', asyncHandler(schoolController.getSchoolRoles));

/**
 * POST /api/schools/roles & POST /api/schools/:schoolId/roles
 * Creates a new custom role for a school
 */
schoolRouter.post('/roles', asyncHandler(schoolController.createSchoolRole));
schoolRouter.post('/:schoolId/roles', asyncHandler(schoolController.createSchoolRole));

/**
 * PUT /api/schools/:schoolId/roles/:roleId
 * Updates role attributes (name, description, permissions)
 */
schoolRouter.put('/:schoolId/roles/:roleId', asyncHandler(schoolController.updateSchoolRole));
schoolRouter.patch('/:schoolId/roles/:roleId', asyncHandler(schoolController.updateSchoolRole));

/**
 * PUT /api/schools/:schoolId/roles/:roleId/permissions
 * Updates permissions specifically for a role
 */
schoolRouter.put(
  '/:schoolId/roles/:roleId/permissions',
  asyncHandler(schoolController.updateRolePermissions),
);

/**
 * DELETE /api/schools/:schoolId/roles/:roleId
 * Deletes a custom role from the school
 */
schoolRouter.delete('/:schoolId/roles/:roleId', asyncHandler(schoolController.deleteSchoolRole));

/**
 * GET /api/schools/academic-years & GET /api/schools/:schoolId/academic-years
 * Returns all academic years for a school
 */
schoolRouter.get('/academic-years', asyncHandler(schoolController.getSchoolAcademicYears));
schoolRouter.get(
  '/:schoolId/academic-years',
  asyncHandler(schoolController.getSchoolAcademicYears),
);

/**
 * POST /api/schools/academic-years & POST /api/schools/:schoolId/academic-years
 * Adds a new academic year to the school in the database
 */
schoolRouter.post('/academic-years', asyncHandler(schoolController.createAcademicYear));
schoolRouter.post('/:schoolId/academic-years', asyncHandler(schoolController.createAcademicYear));

/**
 * PATCH /api/schools/:schoolId/academic-years/:academicYearId/set-current
 * Sets an academic year as the active session for the school
 */
schoolRouter.patch(
  '/:schoolId/academic-years/:academicYearId/set-current',
  asyncHandler(schoolController.setCurrentAcademicYear),
);

export default schoolRouter;
