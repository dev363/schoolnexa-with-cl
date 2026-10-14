/**
 * SchoolNexa Authentication API Route Constants
 *
 * Defines reusable API path constants for authentication endpoints.
 * Base URL defaults to '/api' matching server proxy routes.
 */

export const URL_BASE_API = '/api';

export const URL_AUTH_API = '/auth';

export const URL_AUTH_LOGIN_API = `${URL_AUTH_API}/login`;
export const URL_AUTH_LOGOUT_API = `${URL_AUTH_API}/logout`;
export const URL_AUTH_ME_API = `${URL_AUTH_API}/me`;
