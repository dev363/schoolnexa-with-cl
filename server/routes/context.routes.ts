import { Router } from 'express';
import { contextController } from '../controllers/contextController';
import { requireAuth } from '../middleware/authMiddleware';
import { requireSchoolContext } from '../middleware/schoolContextMiddleware';
import { attachAuthorization, requireRole, requirePermission } from '../middleware/rbacMiddleware';
import { requireAcademicYearContext } from '../middleware/academicYearContextMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const contextRouter = Router();

/**
 * GET /api/context/school
 * Protected endpoint returning active school tenant information for verification.
 */
contextRouter.get(
  '/school',
  requireAuth,
  requireSchoolContext,
  asyncHandler(contextController.getSchoolContext),
);

/**
 * GET /api/context/academic-year
 * Protected endpoint returning active academic year context for verification.
 */
contextRouter.get(
  '/academic-year',
  requireAuth,
  requireSchoolContext,
  requireAcademicYearContext,
  asyncHandler(contextController.getAcademicYearContext),
);

/**
 * GET /api/context/authorization
 * Protected endpoint returning active school RBAC roles & permissions for verification.
 */
contextRouter.get(
  '/authorization',
  requireAuth,
  requireSchoolContext,
  attachAuthorization,
  asyncHandler(contextController.getAuthorizationContext),
);

/**
 * GET /api/context
 * Consolidated endpoint returning complete operational context: User, School, Year, Roles, Permissions.
 */
contextRouter.get(
  '/',
  requireAuth,
  requireSchoolContext,
  requireAcademicYearContext,
  attachAuthorization,
  asyncHandler(contextController.getCompleteContext),
);

/**
 * Diagnostic endpoint guarded by requireRole('PRINCIPAL')
 */
contextRouter.get(
  '/verify-role',
  requireAuth,
  requireSchoolContext,
  requireRole('PRINCIPAL'),
  (_req, res) => {
    sendSuccess(res, { verified: true, role: 'PRINCIPAL' }, 'Role verification passed');
  },
);

/**
 * Diagnostic endpoint guarded by requirePermission('academics.curriculum.edit')
 */
contextRouter.get(
  '/verify-permission',
  requireAuth,
  requireSchoolContext,
  requirePermission('academics.curriculum.edit'),
  (_req, res) => {
    sendSuccess(
      res,
      { verified: true, permission: 'academics.curriculum.edit' },
      'Permission verification passed',
    );
  },
);

export default contextRouter;
