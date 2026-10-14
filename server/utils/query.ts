import { SortDirection, SortQuery } from '../types';

/**
 * Parses and sanitizes a free-text search string from request query.
 * Trims extraneous spaces and ignores empty or sub-minimum-length inputs.
 */
export function parseSearch(
  query: Record<string, any>,
  paramName = 'search',
  minLength = 1,
): string | undefined {
  const raw = query[paramName] ?? query.q;
  if (typeof raw !== 'string') return undefined;

  const trimmed = raw.trim();
  if (trimmed.length < minLength) return undefined;

  // Protect against excessive string lengths
  return trimmed.slice(0, 100);
}

/**
 * Parses and validates sorting options against an explicit whitelist of allowed fields.
 * Strictly prevents arbitrary column injection in order clauses.
 *
 * Example:
 * const sort = parseSort(req.query, ['name', 'createdAt', 'rollNo'] as const, 'createdAt', 'desc');
 */
export function parseSort<T extends string>(
  query: Record<string, any>,
  allowedFields: readonly T[],
  defaultField: T,
  defaultDirection: SortDirection = 'asc',
): SortQuery<T> {
  const rawField = (query.sortBy || query.sortField || query.sort) as string | undefined;
  const rawDirection = (query.sortOrder || query.order || query.direction) as string | undefined;

  const field = rawField && allowedFields.includes(rawField as T) ? (rawField as T) : defaultField;

  let direction: SortDirection = defaultDirection;
  if (rawDirection) {
    const normalized = rawDirection.toLowerCase();
    if (normalized === 'desc' || normalized === 'descending') {
      direction = 'desc';
    } else if (normalized === 'asc' || normalized === 'ascending') {
      direction = 'asc';
    }
  }

  return {
    field,
    direction,
  };
}

/**
 * Extracts and white-lists query filters.
 * Ensures clients can only filter on explicitly permitted attributes.
 */
export function parseFilters<T extends Record<string, any>>(
  query: Record<string, any>,
  allowedKeys: readonly (keyof T)[],
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of allowedKeys) {
    const stringKey = String(key);
    if (query[stringKey] !== undefined && query[stringKey] !== '') {
      result[key] = query[stringKey];
    }
  }

  return result;
}

/**
 * Normalizes boolean query parameters ('true', 'false', '1', '0').
 */
export function parseBooleanFilter(val: any): boolean | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  if (typeof val === 'number') {
    if (val === 1) return true;
    if (val === 0) return false;
  }
  return undefined;
}

export default {
  parseSearch,
  parseSort,
  parseFilters,
  parseBooleanFilter,
};
