import { Request, Response, NextFunction } from 'express';

export interface AppErrorDetails {
  field?: string;
  message: string;
  code?: string;
  [key: string]: any;
}

export class AppError extends Error {
  public statusCode: number;
  public errors?: AppErrorDetails[];

  constructor(message: string, statusCode = 500, errors?: AppErrorDetails[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Centralized error-handling middleware for SchoolNexa Express backend.
 * Provides a standardized JSON error response:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": [...]
 * }
 * In production, masks 500 internal errors and stack traces to prevent leaking database details.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;

  // Mask internal 500 errors in production for security
  let message: string;
  if (statusCode >= 500 && !isDev) {
    message = 'An internal server error occurred. Please try again later.';
  } else {
    message = err?.message || 'An unexpected error occurred';
  }

  const responsePayload: {
    success: boolean;
    message: string;
    errors: AppErrorDetails[];
    stack?: string;
  } = {
    success: false,
    message,
    errors: Array.isArray(err?.errors) ? err.errors : [],
  };

  if (isDev && err?.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
}

export default errorHandler;
