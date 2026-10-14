import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../validators/validate';
import { loginSchema } from '../validators/authValidators';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Public endpoint to authenticate user credentials.
 */
authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login));

/**
 * GET /api/auth/me
 * Protected endpoint returning the active user identity.
 */
authRouter.get('/me', requireAuth, asyncHandler(authController.me));

/**
 * POST /api/auth/logout
 * Protected endpoint to terminate active session.
 */
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));

export default authRouter;
