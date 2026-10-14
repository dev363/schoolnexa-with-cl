import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';

export const authController = {
  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT access token + profile.
   */
  async login(req: Request, res: Response): Promise<void> {
    const context = {
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    const authData = await authService.login(req.body, context);

    sendSuccess(res, authData, 'Login successful');
  },

  /**
   * GET /api/auth/me
   * Returns authenticated user profile.
   */
  async me(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);

    sendSuccess(res, profile, 'Profile retrieved successfully');
  },

  /**
   * POST /api/auth/logout
   * Revokes active session and invalidates access state.
   */
  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const sessionId = req.user!.sessionId;

    await authService.logout(userId, sessionId);

    sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
  },
};

export default authController;
