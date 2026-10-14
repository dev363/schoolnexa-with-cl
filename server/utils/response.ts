import { Response } from 'express';
import { ApiResponse, ApiPaginatedResponse, PaginationMetadata } from '../types';

/**
 * Sends a standardized success response.
 *
 * Output format:
 * {
 *   "success": true,
 *   "data": ...,
 *   "message": "..." (optional)
 * }
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return res.status(statusCode).json(response);
}

/**
 * Sends a standardized paginated response.
 *
 * Output format:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "pageSize": 20,
 *     "total": 100,
 *     "totalPages": 5
 *   },
 *   "message": "..." (optional)
 * }
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMetadata,
  message?: string,
  statusCode = 200,
): Response<ApiPaginatedResponse<T>> {
  const response: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message ? { message } : {}),
  };
  return res.status(statusCode).json(response);
}

export default {
  sendSuccess,
  sendPaginated,
};
