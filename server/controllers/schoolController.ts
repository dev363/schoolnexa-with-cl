import { Request, Response } from 'express';
import { schoolService } from '../services/schoolService';
import { sendSuccess } from '../utils/response';

export const schoolController = {
  /**
   * GET /api/schools
   * Retrieves all schools accessible to the authenticated user from MySQL database.
   */
  async getAccessibleSchools(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const isSuperAdmin = Boolean(req.user!.isSuperAdmin);

    const schools = await schoolService.getUserAccessibleSchools(userId, isSuperAdmin);
    sendSuccess(res, schools, 'Accessible schools retrieved successfully');
  },

  /**
   * POST /api/schools
   * Provisions a new school in the database with initial settings and roles.
   */
  async createSchool(req: Request, res: Response): Promise<void> {
    const creatorUserId = req.user!.id;
    const { name, code, domain } = req.body;

    const newSchool = await schoolService.createSchool({ name, code, domain }, creatorUserId);
    sendSuccess(res, newSchool, 'School created successfully', 201);
  },

  /**
   * GET /api/schools/:schoolId/academic-years
   * Retrieves all academic sessions for a given school tenant.
   */
  async getSchoolAcademicYears(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const years = await schoolService.getSchoolAcademicYears(schoolId);
    sendSuccess(res, years, 'Academic years retrieved successfully');
  },

  /**
   * POST /api/schools/:schoolId/academic-years
   * Creates a new academic session in the database for a school tenant.
   */
  async createAcademicYear(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const { name, code, startDate, endDate } = req.body;

    const newYear = await schoolService.createAcademicYear(schoolId, {
      name,
      code,
      startDate,
      endDate,
    });
    sendSuccess(res, newYear, 'Academic year created successfully', 201);
  },

  /**
   * PATCH /api/schools/:schoolId/academic-years/:academicYearId/set-current
   * Sets an academic session as current/active for the school tenant.
   */
  async setCurrentAcademicYear(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const academicYearId = req.params.academicYearId;

    const result = await schoolService.setAcademicYearAsCurrent(schoolId, academicYearId);
    sendSuccess(res, result, 'Academic year set as current active session successfully');
  },

  /**
   * GET /api/schools/:schoolId/roles
   * Retrieves all roles and their permissions for a specific school.
   */
  async getSchoolRoles(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const roles = await schoolService.getSchoolRoles(schoolId);
    sendSuccess(res, roles, 'School roles retrieved successfully');
  },

  /**
   * POST /api/schools/:schoolId/roles
   * Creates a new role for a specific school.
   */
  async createSchoolRole(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const { name, code, description, permissions } = req.body;

    const newRole = await schoolService.createSchoolRole(schoolId, {
      name,
      code,
      description,
      permissions,
    });
    sendSuccess(res, newRole, 'School role created successfully', 201);
  },

  /**
   * PUT /api/schools/:schoolId/roles/:roleId
   * Updates an existing role's name, description, or permissions.
   */
  async updateSchoolRole(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const roleId = req.params.roleId;
    const { name, description, permissions } = req.body;

    const updatedRole = await schoolService.updateSchoolRole(schoolId, roleId, {
      name,
      description,
      permissions,
    });
    sendSuccess(res, updatedRole, 'School role updated successfully');
  },

  /**
   * PUT /api/schools/:schoolId/roles/:roleId/permissions
   * Updates permissions assigned to a specific role.
   */
  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const roleId = req.params.roleId;
    const { permissions } = req.body;

    const updatedRole = await schoolService.updateRolePermissions(
      schoolId,
      roleId,
      permissions || [],
    );
    sendSuccess(res, updatedRole, 'Role permissions updated successfully');
  },

  /**
   * DELETE /api/schools/:schoolId/roles/:roleId
   * Deletes a custom role from a school.
   */
  async deleteSchoolRole(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const roleId = req.params.roleId;

    const result = await schoolService.deleteSchoolRole(schoolId, roleId);
    sendSuccess(res, result, 'Role deleted successfully');
  },

  /**
   * GET /api/permissions
   * Retrieves the global permission catalog available across the ERP platform.
   */
  async getAllPermissions(_req: Request, res: Response): Promise<void> {
    const permissions = await schoolService.getAllPermissions();
    sendSuccess(res, permissions, 'System permissions retrieved successfully');
  },

  /**
   * GET /api/schools/:schoolId/profile
   * Retrieves full institutional profile attributes and metadata.
   */
  async getSchoolProfile(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const profile = await schoolService.getSchoolProfile(schoolId);
    sendSuccess(res, profile, 'Institutional profile retrieved successfully');
  },

  /**
   * PUT /api/schools/:schoolId/profile
   * Updates institutional identity, address, contact, and accreditation details.
   */
  async updateSchoolProfile(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const userContext = req.user ? { userId: req.user.id, userName: req.user.fullName } : undefined;

    const updated = await schoolService.updateSchoolProfile(schoolId, req.body, userContext);
    sendSuccess(res, updated, 'Institutional profile updated successfully');
  },

  /**
   * GET /api/schools/:schoolId/settings
   * Retrieves school-wide configuration parameters.
   */
  async getSchoolSettings(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const settings = await schoolService.getSchoolSettings(schoolId);
    sendSuccess(res, settings, 'Institutional configuration settings retrieved successfully');
  },

  /**
   * PUT /api/schools/:schoolId/settings
   * Batch updates institutional configuration parameters.
   */
  async updateSchoolSettings(req: Request, res: Response): Promise<void> {
    const schoolId = req.params.schoolId || req.schoolId!;
    const userContext = req.user ? { userId: req.user.id, userName: req.user.fullName } : undefined;

    const payload = Array.isArray(req.body) ? req.body : req.body.settings || [];
    const updated = await schoolService.updateSchoolSettings(schoolId, payload, userContext);
    sendSuccess(res, updated, 'Institutional configuration settings updated successfully');
  },
};

export default schoolController;
