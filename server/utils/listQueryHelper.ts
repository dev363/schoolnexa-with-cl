import { AppError } from '../middleware/errorHandler';

export type ListFilterType =
  | 'Like'
  | 'Equals'
  | 'NotEquals'
  | 'StartsWith'
  | 'EndsWith'
  | 'In'
  | 'NotIn'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'Between'
  | 'IsNull'
  | 'IsNotNull';

export interface ListOrderRule {
  orderTo: string;
  orderBy: 'asc' | 'desc';
}

export interface ListFilterRule {
  column: string;
  value?: any;
  type: ListFilterType;
}

export interface ListPageRequest {
  page?: number;
  pageSize?: number;
  order?: ListOrderRule[];
  filter?: ListFilterRule[];
  search?: string;
}

export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'json';

export interface FieldDefinition {
  /** The target field name on the Prisma model */
  prismaField: string;
  /** Optional nested relation path (e.g. ['department'] for department.name) */
  relationPath?: string[];
  /** Data type used for parsing and type coercion */
  type?: FieldDataType;
  /** Is this field eligible for global search? Defaults to true for string/enum */
  searchable?: boolean;
  /** Is this field eligible for column filtering? Defaults to true */
  filterable?: boolean;
  /** Is this field eligible for sorting? Defaults to true */
  sortable?: boolean;
}

export type FieldDefinitionMap = Record<string, FieldDefinition>;

export interface ListConfig {
  /**
   * If provided and non-empty, restricts global search only to these column keys.
   * If empty ([]) or omitted, searches across ALL safe supported searchable columns.
   */
  searchableColumns?: string[];
  /**
   * If provided and non-empty, restricts filters only to these column keys.
   * If empty ([]) or omitted, allows filtering across ALL safe supported filterable columns.
   */
  filterableColumns?: string[];
  /**
   * If provided and non-empty, restricts sorting only to these column keys.
   * If empty ([]) or omitted, allows sorting across ALL safe supported sortable columns.
   */
  sortableColumns?: string[];
  /**
   * Default ordering applied when request.order is omitted or empty.
   */
  defaultOrder?: ListOrderRule[];
  /**
   * Maximum allowed page size. Defaults to 100.
   */
  maxPageSize?: number;
  /**
   * Default page size when omitted in request. Defaults to 25.
   */
  defaultPageSize?: number;
}

export interface BuildListQueryResult<TWhere = any, TOrderBy = any> {
  where: TWhere;
  orderBy: TOrderBy[];
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export interface ListPageResponse<T = any> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Security blacklist: fields that must NEVER be exposed to generic search, filter, or sort.
 */
const SECURITY_BLOCKED_FIELDS = new Set([
  'password',
  'passwordhash',
  'salt',
  'token',
  'refreshtoken',
  'accesstoken',
  'resetpasswordtoken',
  'secret',
  'apikey',
  'twofactorsecret',
  'verificationtoken',
  'sessionid',
]);

function isSecurityBlocked(fieldName: string): boolean {
  return SECURITY_BLOCKED_FIELDS.has(fieldName.toLowerCase().replace(/[^a-z0-9]/g, ''));
}

/**
 * Resolves safe allowed columns for an operation (search, filter, sort).
 *
 * Rules:
 * - If restriction array contains values: Restrict to those columns only.
 * - If restriction array is empty ([]): Allow all safe supported columns.
 * - If restriction array is missing/undefined: Allow all safe supported columns.
 */
export function getEffectiveColumns(
  configRestriction: string[] | undefined,
  fieldDefinitions: FieldDefinitionMap,
  operation: 'searchable' | 'filterable' | 'sortable',
): Map<string, FieldDefinition> {
  const safeEntries: [string, FieldDefinition][] = Object.entries(fieldDefinitions).filter(
    ([fieldName, def]) => {
      if (isSecurityBlocked(fieldName) || isSecurityBlocked(def.prismaField)) {
        return false;
      }
      return def[operation] !== false;
    },
  );

  // If configuration array contains values, restrict operation strictly to those columns
  if (Array.isArray(configRestriction) && configRestriction.length > 0) {
    const allowedKeys = new Set(configRestriction);
    const restricted = safeEntries.filter(([fieldName]) => allowedKeys.has(fieldName));
    return new Map(restricted);
  }

  // If array is empty ([]) or missing, apply operation across all safe supported columns
  return new Map(safeEntries);
}

/**
 * Coerces client input value to the appropriate JavaScript/Prisma data type.
 */
export function coerceValue(value: any, type?: FieldDataType): any {
  if (value === null || value === undefined) return null;

  switch (type) {
    case 'number': {
      const num = Number(value);
      return Number.isNaN(num) ? value : num;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      const str = String(value).trim().toLowerCase();
      if (str === 'true' || str === '1') return true;
      if (str === 'false' || str === '0') return false;
      return Boolean(value);
    }
    case 'date': {
      if (value instanceof Date) return value;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? value : parsed;
    }
    case 'string':
    case 'enum':
    default:
      return value;
  }
}

/**
 * Helper to build nested relation objects for Prisma where clauses.
 * E.g. relationPath = ['department'], prismaField = 'name' -> { department: { name: condition } }
 */
function buildNestedCondition(relationPath: string[] | undefined, prismaField: string, condition: any): any {
  const leaf = { [prismaField]: condition };
  if (!relationPath || relationPath.length === 0) {
    return leaf;
  }

  let result = leaf;
  for (let i = relationPath.length - 1; i >= 0; i--) {
    result = { [relationPath[i]]: result };
  }
  return result;
}

/**
 * Helper to build nested relation objects for Prisma orderBy clauses.
 * E.g. relationPath = ['department'], prismaField = 'name' -> { department: { name: 'asc' } }
 */
function buildNestedOrderBy(relationPath: string[] | undefined, prismaField: string, direction: 'asc' | 'desc'): any {
  const leaf = { [prismaField]: direction };
  if (!relationPath || relationPath.length === 0) {
    return leaf;
  }

  let result: any = leaf;
  for (let i = relationPath.length - 1; i >= 0; i--) {
    result = { [relationPath[i]]: result };
  }
  return result;
}

/**
 * Maps a single ListFilterRule into a Prisma condition.
 */
export function mapFilterToPrismaCondition(
  filter: ListFilterRule,
  def: FieldDefinition,
): any {
  const { type, value } = filter;
  let condition: any;

  switch (type) {
    case 'Like':
      condition = { contains: String(value ?? '') };
      break;

    case 'Equals':
      condition = coerceValue(value, def.type);
      break;

    case 'NotEquals':
      condition = { not: coerceValue(value, def.type) };
      break;

    case 'StartsWith':
      condition = { startsWith: String(value ?? '') };
      break;

    case 'EndsWith':
      condition = { endsWith: String(value ?? '') };
      break;

    case 'In': {
      let items: any[] = [];
      if (Array.isArray(value)) {
        items = value.map((v) => coerceValue(v, def.type));
      } else if (typeof value === 'string') {
        items = value.split(',').map((s) => coerceValue(s.trim(), def.type));
      } else if (value !== undefined && value !== null) {
        items = [coerceValue(value, def.type)];
      }
      condition = { in: items };
      break;
    }

    case 'NotIn': {
      let items: any[] = [];
      if (Array.isArray(value)) {
        items = value.map((v) => coerceValue(v, def.type));
      } else if (typeof value === 'string') {
        items = value.split(',').map((s) => coerceValue(s.trim(), def.type));
      } else if (value !== undefined && value !== null) {
        items = [coerceValue(value, def.type)];
      }
      condition = { notIn: items };
      break;
    }

    case 'GreaterThan':
      condition = { gt: coerceValue(value, def.type) };
      break;

    case 'GreaterThanOrEqual':
      condition = { gte: coerceValue(value, def.type) };
      break;

    case 'LessThan':
      condition = { lt: coerceValue(value, def.type) };
      break;

    case 'LessThanOrEqual':
      condition = { lte: coerceValue(value, def.type) };
      break;

    case 'Between': {
      let minVal: any;
      let maxVal: any;
      if (Array.isArray(value) && value.length >= 2) {
        minVal = value[0];
        maxVal = value[1];
      } else if (value && typeof value === 'object') {
        minVal = value.min ?? value.from ?? value.start;
        maxVal = value.max ?? value.to ?? value.end;
      } else if (typeof value === 'string' && value.includes(',')) {
        const parts = value.split(',');
        minVal = parts[0]?.trim();
        maxVal = parts[1]?.trim();
      }

      if (minVal !== undefined && maxVal !== undefined) {
        condition = {
          gte: coerceValue(minVal, def.type),
          lte: coerceValue(maxVal, def.type),
        };
      } else if (minVal !== undefined) {
        condition = { gte: coerceValue(minVal, def.type) };
      } else if (maxVal !== undefined) {
        condition = { lte: coerceValue(maxVal, def.type) };
      } else {
        condition = {};
      }
      break;
    }

    case 'IsNull':
      condition = null;
      break;

    case 'IsNotNull':
      condition = { not: null };
      break;

    default:
      throw new AppError(`Unsupported filter type '${type}' for column '${filter.column}'`, 400);
  }

  return buildNestedCondition(def.relationPath, def.prismaField, condition);
}

/**
 * Builds a Prisma query from a standard ListPageRequest and module configuration.
 *
 * Generic, model-agnostic, and safe against arbitrary column queries or SQL injection.
 */
export function buildListQuery(
  request: ListPageRequest = {},
  fieldDefinitions: FieldDefinitionMap,
  config: ListConfig = {},
): BuildListQueryResult {
  const maxPageSize = config.maxPageSize ?? 100;
  const defaultPageSize = config.defaultPageSize ?? 25;

  // 1. Pagination: Zero-based page indexing
  const rawPage = Number(request.page);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const rawPageSize = Number(request.pageSize);
  let pageSize = Number.isInteger(rawPageSize) && rawPageSize >= 1 ? rawPageSize : defaultPageSize;
  if (pageSize > maxPageSize) {
    pageSize = maxPageSize;
  }

  const skip = page * pageSize;
  const take = pageSize;

  // 2. Resolve Effective Columns for Search, Filter, and Sort
  const allowedSearchable = getEffectiveColumns(config.searchableColumns, fieldDefinitions, 'searchable');
  const allowedFilterable = getEffectiveColumns(config.filterableColumns, fieldDefinitions, 'filterable');
  const allowedSortable = getEffectiveColumns(config.sortableColumns, fieldDefinitions, 'sortable');

  const andClauses: any[] = [];

  // 3. Process Column Filters
  if (Array.isArray(request.filter) && request.filter.length > 0) {
    for (const rule of request.filter) {
      if (!rule || !rule.column) continue;

      const columnKey = rule.column;
      const def = allowedFilterable.get(columnKey);

      if (!def) {
        throw new AppError(
          `Field '${columnKey}' is not filterable or does not exist.`,
          400,
          [
            {
              field: columnKey,
              message: `Column '${columnKey}' is not allowed for filtering.`,
              code: 'INVALID_FILTER_COLUMN',
            },
          ],
        );
      }

      const condition = mapFilterToPrismaCondition(rule, def);
      andClauses.push(condition);
    }
  }

  // 4. Process Global Search
  const search = typeof request.search === 'string' ? request.search.trim() : '';
  if (search) {
    if (allowedSearchable.size === 0) {
      throw new AppError(
        'Global search is not supported for this resource as no searchable fields are available.',
        400,
        [
          {
            field: 'search',
            message: 'No searchable columns configured or available.',
            code: 'NO_SEARCHABLE_COLUMNS',
          },
        ],
      );
    }

    const orClauses: any[] = [];
    for (const [, def] of allowedSearchable.entries()) {
      // String and enum fields support contains
      if (def.type === 'number') {
        const num = Number(search);
        if (!Number.isNaN(num)) {
          orClauses.push(buildNestedCondition(def.relationPath, def.prismaField, num));
        }
      } else {
        orClauses.push(
          buildNestedCondition(def.relationPath, def.prismaField, {
            contains: search,
          }),
        );
      }
    }

    if (orClauses.length > 0) {
      andClauses.push({ OR: orClauses });
    }
  }

  // Construct combined Prisma 'where' object
  let where: any = {};
  if (andClauses.length === 1) {
    where = andClauses[0];
  } else if (andClauses.length > 1) {
    where = { AND: andClauses };
  }

  // 5. Process Sorting
  const orderBy: any[] = [];

  if (Array.isArray(request.order) && request.order.length > 0) {
    for (const item of request.order) {
      if (!item || !item.orderTo) continue;

      const columnKey = item.orderTo;
      const def = allowedSortable.get(columnKey);

      if (!def) {
        throw new AppError(
          `Field '${columnKey}' is not sortable or does not exist.`,
          400,
          [
            {
              field: columnKey,
              message: `Column '${columnKey}' is not allowed for sorting.`,
              code: 'INVALID_SORT_COLUMN',
            },
          ],
        );
      }

      const rawDir = String(item.orderBy || 'asc').trim().toLowerCase();
      if (rawDir !== 'asc' && rawDir !== 'desc') {
        throw new AppError(
          `Sort direction for '${columnKey}' must be 'asc' or 'desc'. Received '${item.orderBy}'.`,
          400,
          [
            {
              field: columnKey,
              message: "Sort direction must be 'asc' or 'desc'.",
              code: 'INVALID_SORT_DIRECTION',
            },
          ],
        );
      }

      orderBy.push(buildNestedOrderBy(def.relationPath, def.prismaField, rawDir as 'asc' | 'desc'));
    }
  }

  // Fallback to default ordering when no ordering requested
  if (orderBy.length === 0) {
    if (Array.isArray(config.defaultOrder) && config.defaultOrder.length > 0) {
      for (const item of config.defaultOrder) {
        const def = allowedSortable.get(item.orderTo) || fieldDefinitions[item.orderTo];
        if (def) {
          orderBy.push(
            buildNestedOrderBy(def.relationPath, def.prismaField, item.orderBy.toLowerCase() as 'asc' | 'desc'),
          );
        }
      }
    } else {
      // Deterministic default: prefer 'createdAt desc' if sortable, otherwise first sortable column
      if (allowedSortable.has('createdAt')) {
        const def = allowedSortable.get('createdAt')!;
        orderBy.push(buildNestedOrderBy(def.relationPath, def.prismaField, 'desc'));
      } else if (allowedSortable.size > 0) {
        const [firstKey, def] = allowedSortable.entries().next().value!;
        orderBy.push(buildNestedOrderBy(def.relationPath, def.prismaField, 'asc'));
      }
    }
  }

  return {
    where,
    orderBy,
    skip,
    take,
    page,
    pageSize,
  };
}

/**
 * Standardizes the list response format across all modules.
 * Ensures data is directly an array at the root: { success: true, data: [...], pagination: { ... } }
 */
export function buildListPageResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): ListPageResponse<T> {
  const safeTotal = Math.max(0, total);
  const safePageSize = Math.max(1, pageSize);
  const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / safePageSize);

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize: safePageSize,
      total: safeTotal,
      totalPages,
    },
  };
}
