import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './authMiddleware';
import { schoolContextService } from '../services/schoolContextService';

/**
 * Extracts the requested school identifier from supported client channels:
 * 1. HTTP header 'x-school-id' (case-insensitive in Express)
 * 2. Cookie 'sn_active_school' (established SchoolNexa frontend convention)
 * 3. Cookie 'x-school-id'
 */
function extractRequestedSchoolId(req: Request): string | undefined {
  const headerVal = req.headers['x-school-id'];
  if (headerVal) {
    if (Array.isArray(headerVal)) {
      return headerVal[0]?.trim();
    }
    return headerVal.trim();
  }

  if (req.cookies) {
    if (req.cookies['sn_active_school']) {
      return String(req.cookies['sn_active_school']).trim();
    }
    if (req.cookies['x-school-id']) {
      return String(req.cookies['x-school-id']).trim();
    }
  }

  return undefined;
}

/**
 * Internal logic to resolve and bind the validated school context.
 */
async function processSchoolContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user!;
    const requestedSchoolId = extractRequestedSchoolId(req);

    const context = await schoolContextService.resolveUserSchoolContext(
      user.id,
      requestedSchoolId,
      user.isSuperAdmin,
    );

    // Bind validated tenant school identity to Express request
    req.schoolId = context.id;
    req.schoolContext = context;

    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * School Tenant Context Middleware.
 *
 * Guarantees that:
 * 1. User is authenticated (calls requireAuth if req.user is not yet populated).
 * 2. Client-provided school ID is validated against active user memberships or SuperAdmin rights.
 * 3. Inactive, suspended, or nonexistent schools are rejected.
 * 4. req.schoolId and req.schoolContext are securely attached.
 */
export async function requireSchoolContext(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    return requireAuth(req, res, (err?: any) => {
      if (err) return next(err);
      return processSchoolContext(req, res, next);
    });
  }

  return processSchoolContext(req, res, next);
}

export default requireSchoolContext;
