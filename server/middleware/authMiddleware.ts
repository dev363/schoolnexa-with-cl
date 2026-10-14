import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { authService } from '../services/authService';
import { AppError } from './errorHandler';

/**
 * Authentication middleware.
 * Verifies JWT bearer access token, validates session active status,
 * and attaches authenticated user claims to req.user.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new AppError(
        'Authentication required. Please provide a Bearer token in the Authorization header.',
        401,
        [{ message: 'Missing Authorization header', code: 'AUTH_REQUIRED' }],
      ),
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return next(
      new AppError('Invalid Authorization header format. Expected "Bearer <token>".', 401, [
        {
          message: 'Authorization header format must be Bearer <token>',
          code: 'INVALID_AUTH_HEADER',
        },
      ]),
    );
  }

  const token = parts[1].trim();
  if (!token) {
    return next(
      new AppError('Access token is missing or empty.', 401, [
        { message: 'Empty access token', code: 'AUTH_REQUIRED' },
      ]),
    );
  }

  try {
    const payload = verifyAccessToken(token);

    // Verify session status in server-side session store
    const isSessionActive = await authService.isSessionValid(payload.sub, payload.sessionId);
    if (!isSessionActive) {
      return next(
        new AppError('Session has expired or been revoked. Please login again.', 401, [
          { message: 'Session invalid or revoked', code: 'SESSION_REVOKED' },
        ]),
      );
    }

    // Attach authenticated identity to request context
    req.user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      isSuperAdmin: payload.isSuperAdmin,
      sessionId: payload.sessionId,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

export default requireAuth;
