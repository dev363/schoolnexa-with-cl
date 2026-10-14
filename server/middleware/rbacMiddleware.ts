import { Request, Response, NextFunction } from 'express';
import { requireSchoolContext } from './schoolContextMiddleware';
import { authorizationService } from '../services/authorizationService';
import { AppError } from './errorHandler';

/**
 * Ensures req.roles and req.permissions are populated on the request.
 * Reuses existing in-request cached values if already resolved.
 */
export async function ensureAuthorizationContext(req: Request): Promise<void> {
  if (req.roles !== undefined && req.permissions !== undefined) {
    return;
  }

  if (!req.user || !req.schoolId) {
    throw new AppError(
      'Authentication and active school context are required before authorization',
      400,
      [{ message: 'Missing user or school context', code: 'AUTH_CONTEXT_REQUIRED' }],
    );
  }

  const authContext = await authorizationService.getUserAuthorizationContext(
    req.user.id,
    req.schoolId,
    req.user.isSuperAdmin,
  );

  req.roles = authContext.roles;
  req.permissions = authContext.permissions;
}

/**
 * Middleware that loads and attaches the user's roles and permissions for the active school.
 * Useful for endpoints (like diagnostic routes) that need req.roles / req.permissions
 * populated without enforcing a specific role or permission gate.
 */
export async function attachAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user || !req.schoolId) {
    return requireSchoolContext(req, res, async (err?: any) => {
      if (err) return next(err);
      try {
        await ensureAuthorizationContext(req);
        return next();
      } catch (e) {
        return next(e);
      }
    });
  }

  try {
    await ensureAuthorizationContext(req);
    return next();
  } catch (e) {
    return next(e);
  }
}

/**
 * Helper to check role possession in application code.
 */
export function hasRole(req: Request, ...roles: string[]): boolean {
  if (req.user?.isSuperAdmin) return true;
  if (!req.roles || req.roles.length === 0) return false;
  return roles.some((r) => req.roles!.includes(r));
}

/**
 * Helper to check permission possession in application code.
 */
export function hasPermission(req: Request, ...permissions: string[]): boolean {
  if (req.user?.isSuperAdmin) return true;
  if (!req.permissions || req.permissions.length === 0) return false;
  return permissions.some((p) => req.permissions!.includes(p));
}

/**
 * Helper to check that user possesses ALL specified permissions.
 */
export function hasAllPermissions(req: Request, ...permissions: string[]): boolean {
  if (req.user?.isSuperAdmin) return true;
  if (!req.permissions || req.permissions.length === 0) return false;
  return permissions.every((p) => req.permissions!.includes(p));
}

/**
 * Middleware enforcing that the user possesses at least ONE of the required roles
 * within the active school tenant.
 *
 * Usage:
 * router.post('/path', requireRole('PRINCIPAL', 'SCHOOL_ADMIN'), handler)
 */
export function requireRole(...requiredRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const execute = async () => {
      await ensureAuthorizationContext(req);

      // SuperAdmin bypasses school-scoped role gates
      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!req.roles || req.roles.length === 0) {
        throw new AppError('Forbidden: Insufficient role privileges for this school', 403, [
          {
            message: 'User does not possess any authorized roles in this school',
            code: 'ROLE_FORBIDDEN',
          },
        ]);
      }

      const allowed = requiredRoles.some((role) => req.roles!.includes(role));
      if (!allowed) {
        throw new AppError('Forbidden: Insufficient role privileges for this school', 403, [
          { message: 'User does not possess any of the required roles', code: 'ROLE_FORBIDDEN' },
        ]);
      }

      return next();
    };

    try {
      if (!req.user || !req.schoolId) {
        return requireSchoolContext(req, res, async (err?: any) => {
          if (err) return next(err);
          try {
            await execute();
          } catch (e) {
            return next(e);
          }
        });
      }

      await execute();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Middleware enforcing that the user possesses at least ONE of the required permissions
 * within the active school tenant.
 *
 * Usage:
 * router.post('/path', requirePermission('students.create', 'students.edit'), handler)
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const execute = async () => {
      await ensureAuthorizationContext(req);

      // SuperAdmin bypasses school-scoped permission gates
      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!req.permissions || req.permissions.length === 0) {
        throw new AppError('Forbidden: Insufficient permissions for this school action', 403, [
          {
            message: 'User does not possess any granted permissions in this school',
            code: 'PERMISSION_FORBIDDEN',
          },
        ]);
      }

      const allowed = requiredPermissions.some((perm) => req.permissions!.includes(perm));
      if (!allowed) {
        throw new AppError('Forbidden: Insufficient permissions for this school action', 403, [
          {
            message: 'User does not possess the required permission for this action',
            code: 'PERMISSION_FORBIDDEN',
          },
        ]);
      }

      return next();
    };

    try {
      if (!req.user || !req.schoolId) {
        return requireSchoolContext(req, res, async (err?: any) => {
          if (err) return next(err);
          try {
            await execute();
          } catch (e) {
            return next(e);
          }
        });
      }

      await execute();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Middleware enforcing that the user possesses ALL of the required permissions
 * within the active school tenant.
 *
 * Usage:
 * router.post('/path', requireAllPermissions('students.view', 'students.edit'), handler)
 */
export function requireAllPermissions(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const execute = async () => {
      await ensureAuthorizationContext(req);

      if (req.user?.isSuperAdmin) {
        return next();
      }

      if (!req.permissions || req.permissions.length === 0) {
        throw new AppError('Forbidden: Insufficient permissions for this school action', 403, [
          {
            message: 'User does not possess any granted permissions in this school',
            code: 'PERMISSION_FORBIDDEN',
          },
        ]);
      }

      const allowed = requiredPermissions.every((perm) => req.permissions!.includes(perm));
      if (!allowed) {
        throw new AppError('Forbidden: Insufficient permissions for this school action', 403, [
          { message: 'User lacks one or more required permissions', code: 'PERMISSION_FORBIDDEN' },
        ]);
      }

      return next();
    };

    try {
      if (!req.user || !req.schoolId) {
        return requireSchoolContext(req, res, async (err?: any) => {
          if (err) return next(err);
          try {
            await execute();
          } catch (e) {
            return next(e);
          }
        });
      }

      await execute();
    } catch (err) {
      return next(err);
    }
  };
}
