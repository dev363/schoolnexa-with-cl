import { PaginationParams, PaginationMetadata } from '../types';

export interface PaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Parses and sanitizes pagination parameters from request query strings.
 * Safely guards against invalid, zero, negative, non-numeric, or excessively large page sizes.
 *
 * Returns normalized Prisma pagination offsets (`skip` and `take`).
 */
export function parsePagination(
  query: Record<string, any>,
  options: PaginationOptions = {},
): PaginationParams {
  const defaultPage = options.defaultPage ?? DEFAULT_PAGE;
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = options.maxPageSize ?? MAX_PAGE_SIZE;

  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : defaultPage;

  let pageSize = Number.isInteger(rawPageSize) && rawPageSize >= 1 ? rawPageSize : defaultPageSize;

  if (pageSize > maxPageSize) {
    pageSize = maxPageSize;
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    page,
    pageSize,
    skip,
    take,
  };
}

/**
 * Builds standard pagination metadata for API responses.
 */
export function buildPagination(total: number, page: number, pageSize: number): PaginationMetadata {
  const safeTotal = Math.max(0, total);
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));

  return {
    page,
    pageSize: safePageSize,
    total: safeTotal,
    totalPages,
  };
}

export default {
  parsePagination,
  buildPagination,
};
