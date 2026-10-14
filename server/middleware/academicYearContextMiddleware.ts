import { Request, Response, NextFunction } from 'express';
import { requireSchoolContext } from './schoolContextMiddleware';
import { academicYearContextService } from '../services/academicYearContextService';
import { AppError } from './errorHandler';

/**
 * Extracts the requested academic year identifier from supported client channels:
 * 1. HTTP header 'x-academic-year-id' (case-insensitive in Express)
 * 2. Cookie 'sn_active_year' (SchoolNexa frontend convention)
 * 3. Cookie 'x-academic-year-id'
 */
export function extractRequestedAcademicYearId(req: Request): string | undefined {
  const headerVal = req.headers['x-academic-year-id'];
  if (headerVal) {
    if (Array.isArray(headerVal)) {
      return headerVal[0]?.trim();
    }
    return headerVal.trim();
  }

  if (req.cookies) {
    if (req.cookies['sn_active_year']) {
      return String(req.cookies['sn_active_year']).trim();
    }
    if (req.cookies['x-academic-year-id']) {
      return String(req.cookies['x-academic-year-id']).trim();
    }
  }

  // Parse from raw Cookie header if cookie-parser middleware was bypassed
  const rawCookie = req.headers.cookie;
  if (rawCookie) {
    const parts = rawCookie.split(';');
    for (const part of parts) {
      const [key, ...vals] = part.trim().split('=');
      const cookieKey = key?.trim();
      if (cookieKey === 'sn_active_year' || cookieKey === 'x-academic-year-id') {
        return decodeURIComponent(vals.join('=')).trim();
      }
    }
  }

  return undefined;
}

/**
 * Internal helper to resolve and bind the validated academic year context.
 */
async function processAcademicYearContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.schoolId) {
      throw new AppError(
        'Active school tenant context is required before academic year resolution',
        400,
        [{ message: 'Missing school context', code: 'SCHOOL_CONTEXT_REQUIRED' }],
      );
    }

    if (req.academicYearId && req.academicYearContext) {
      return next();
    }

    const requestedYearId = extractRequestedAcademicYearId(req);
    const context = await academicYearContextService.resolveAcademicYearContext(
      req.schoolId,
      requestedYearId,
    );

    // Bind validated academic year to Express request
    req.academicYearId = context.id;
    req.academicYearContext = context;

    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware ensuring the request has a validated active Academic Year
 * scoped strictly to the current req.schoolId.
 *
 * Automatically composes with requireSchoolContext if schoolId is not yet resolved.
 */
export async function requireAcademicYearContext(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user || !req.schoolId) {
    return requireSchoolContext(req, res, (err?: any) => {
      if (err) return next(err);
      return processAcademicYearContext(req, res, next);
    });
  }

  return processAcademicYearContext(req, res, next);
}

export default requireAcademicYearContext;
