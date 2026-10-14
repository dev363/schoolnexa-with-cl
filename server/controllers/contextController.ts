import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { schoolService } from '../services/schoolService';

export const contextController = {
  /**
   * GET /api/context/school
   * Returns the validated active school tenant context for the authenticated user.
   */
  async getSchoolContext(req: Request, res: Response): Promise<void> {
    const data = {
      schoolId: req.schoolId!,
      userId: req.user!.id,
      schoolName: req.schoolContext?.name || '',
      schoolCode: req.schoolContext?.code || '',
      schoolStatus: req.schoolContext?.status || 'ACTIVE',
    };

    sendSuccess(res, data, 'School context resolved successfully');
  },

  /**
   * GET /api/context/authorization
   * Returns safe authorization context (roles, permissions) for the authenticated user
   * in the active school tenant.
   */
  async getAuthorizationContext(req: Request, res: Response): Promise<void> {
    const data = {
      schoolId: req.schoolId!,
      userId: req.user!.id,
      isSuperAdmin: Boolean(req.user!.isSuperAdmin),
      roles: req.roles || [],
      permissions: req.permissions || [],
    };

    sendSuccess(res, data, 'Authorization context resolved successfully');
  },

  /**
   * GET /api/context/academic-year
   * Returns safe academic year context for the active school tenant.
   */
  async getAcademicYearContext(req: Request, res: Response): Promise<void> {
    const data = {
      schoolId: req.schoolId!,
      academicYearId: req.academicYearId!,
      academicYearName: req.academicYearContext?.name || '',
      code: req.academicYearContext?.code || '',
      startDate: req.academicYearContext?.startDate || '',
      endDate: req.academicYearContext?.endDate || '',
      isCurrent: Boolean(req.academicYearContext?.isCurrent),
      status: req.academicYearContext?.status || 'ACTIVE',
    };

    sendSuccess(res, data, 'Academic year context resolved successfully');
  },

  /**
   * GET /api/context
   * Returns the consolidated operational context: User, School, Academic Year, Roles, and Permissions.
   */
  async getCompleteContext(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const isSuperAdmin = Boolean(req.user!.isSuperAdmin);
    const schools = await schoolService.getUserAccessibleSchools(userId, isSuperAdmin);

    const data = {
      user: {
        id: req.user!.id,
        email: req.user!.email,
        fullName: req.user!.fullName,
        isSuperAdmin: Boolean(req.user!.isSuperAdmin),
      },
      schools,
      school: req.schoolContext,
      academicYear: req.academicYearContext,
      roles: req.roles || [],
      permissions: req.permissions || [],
    };

    sendSuccess(res, data, 'Complete operational context resolved successfully');
  },
};

export default contextController;
