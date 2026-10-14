/**
 * Reusable type definitions for SchoolNexa REST API architecture.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
  message?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortQuery<T extends string = string> {
  field: T;
  direction: SortDirection;
}

/**
 * Standard authenticated user model attached to Express requests.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  sessionId?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface AuthTokenPayload {
  sub: string; // User ID
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  sessionId?: string;
}

export interface SafeUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: SafeUserProfile;
  token: string;
  expiresIn: string;
  session?: {
    id: string;
    expiresAt: string;
  };
  schools?: any[];
  activeSchool?: any;
  activeAcademicYear?: any;
  roles?: string[];
  permissions?: string[];
}

export interface SafeSchoolContext {
  id: string;
  name: string;
  code: string;
  status: string;
}

export interface SafeAcademicYearContext {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface UserAuthorizationContext {
  roles: string[];
  permissions: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export * from './teacher';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      schoolId?: string;
      schoolContext?: SafeSchoolContext;
      roles?: string[];
      permissions?: string[];
      academicYearId?: string;
      academicYearContext?: SafeAcademicYearContext;
    }
  }
}
