/**
 * SchoolNexa Centralized REST API Client
 *
 * Provides unified HTTP communication with backend Express REST endpoints:
 * - Automatically injects JWT Bearer token from active Auth state
 * - Automatically injects multi-tenant isolation headers:
 *   - 'x-school-id' (Active School)
 *   - 'X-Academic-Year-Id' (Active Academic Year)
 * - Standardized JSON formatting, query serialization, and robust error handling
 * - Complies with security rules: never logs JWT, passwords, or session tokens
 */

export class ApiError extends Error {
  public status: number;
  public errors?: Array<{ field?: string; message: string; code?: string }>;

  constructor(
    message: string,
    status: number,
    errors?: Array<{ field?: string; message: string; code?: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export interface RequestOptions extends RequestInit {
  schoolId?: string;
  academicYearId?: string;
  token?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  returnEnvelope?: boolean;
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field?: string; message: string; code?: string }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const LOCAL_STORAGE_AUTH_KEY = 'schoolnexa_auth_state_v1';

/**
 * Retrieves the currently persisted authentication credentials and tenant context.
 */
export function getPersistedAuthContext(): {
  token: string | null;
  schoolId: string | null;
  academicYearId: string | null;
} {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: parsed.token || null,
        schoolId: parsed.activeSchoolId || null,
        academicYearId: parsed.activeAcademicYearId || null,
      };
    }
  } catch {
    // Non-blocking fallback
  }
  return { token: null, schoolId: null, academicYearId: null };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Builds the full request URL with formatted query string parameters.
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let base = this.baseUrl;
    if (typeof window === 'undefined' && !base.startsWith('http')) {
      base = `http://localhost:3000${base}`;
    }
    const url = `${base}${cleanEndpoint}`;

    if (!params) return url;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });

    const queryString = query.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Executes an HTTP request with automatic token and tenant context header injection.
   */
  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      schoolId: overrideSchoolId,
      academicYearId: overrideAcademicYearId,
      token: overrideToken,
      params,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const authContext = getPersistedAuthContext();
    const token = overrideToken || authContext.token;
    const schoolId = overrideSchoolId || authContext.schoolId;
    const academicYearId = overrideAcademicYearId || authContext.academicYearId;

    const headers = new Headers(customHeaders);

    // Attach JWT Authorization Header
    if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Attach School Multi-Tenant Context Header
    if (schoolId && schoolId.trim() !== '' && schoolId !== 'undefined' && schoolId !== 'null') {
      headers.set('x-school-id', schoolId);
    }

    // Attach Academic Year Context Header
    if (
      academicYearId &&
      academicYearId.trim() !== '' &&
      academicYearId !== 'undefined' &&
      academicYearId !== 'null'
    ) {
      headers.set('X-Academic-Year-Id', academicYearId);
    }

    // Default JSON Content-Type for request body
    if (
      fetchOptions.body &&
      typeof fetchOptions.body === 'string' &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    const url = this.buildUrl(endpoint, params);

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (networkError: any) {
      const netMsg =
        networkError?.message ||
        'Network connection failed. Please check your internet connection.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:toast', {
            detail: {
              title: 'Connection Error',
              message: netMsg,
              variant: 'danger',
              duration: 6000,
            },
          }),
        );
      }
      throw new ApiError(netMsg, 0);
    }

    let payload: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      try {
        payload = await response.text();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const message =
        (typeof payload === 'object' && payload?.message) ||
        (typeof payload === 'object' && payload?.error) ||
        response.statusText ||
        `Request failed with status ${response.status}`;

      const errors =
        typeof payload === 'object' && Array.isArray(payload?.errors) ? payload.errors : undefined;

      if (response.status === 401 && typeof window !== 'undefined') {
        const isSessionRevoked =
          message.toLowerCase().includes('session') ||
          message.toLowerCase().includes('token') ||
          (errors && errors.some((e) => e.code === 'SESSION_REVOKED'));
        window.dispatchEvent(
          new CustomEvent('auth:session_expired', {
            detail: {
              message: isSessionRevoked
                ? message
                : 'Session expired or revoked. Please log in again.',
            },
          }),
        );
      }

      throw new ApiError(message, response.status, errors);
    }

    // If returnEnvelope is explicitly requested, return the full payload
    if (options.returnEnvelope) {
      return payload as T;
    }

    // Extract unwrapped data if backend returns standard { success: true, data: ... } envelope
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T;
    }

    return payload as T;
  }

  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public getPaginated<T = any>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<ApiResponseEnvelope<T[]>> {
    return this.request<ApiResponseEnvelope<T[]>>(endpoint, {
      ...options,
      method: 'GET',
      returnEnvelope: true,
    });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
