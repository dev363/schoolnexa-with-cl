/**
 * SchoolNexa Auth Slice Actions / Reducers
 *
 * Defines synchronous reducer functions for the Auth slice.
 * Exported functions map directly into `createSlice({ reducers: actions })`.
 */

import { type PayloadAction } from '@reduxjs/toolkit';
import type { UserSummary } from '@/types';
import { setStoredAuth, clearStoredAuth } from '@/store/utils/apiStorage';
import type { AuthState } from './index';

function isValidToken(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return (
    trimmed.length > 0 &&
    trimmed.toLowerCase() !== 'undefined' &&
    trimmed.toLowerCase() !== 'null'
  );
}

export const setCredentials = (
  state: AuthState,
  action: PayloadAction<{ token: string; user?: UserSummary | null }>,
) => {
  const { token, user } = action.payload;
  if (isValidToken(token)) {
    state.token = token.trim();
    state.user = user || null;
    state.authenticated = true;
    state.error = null;
    setStoredAuth({ token: token.trim(), user: user || null });
  }
};

export const setAuthUser = (
  state: AuthState,
  action: PayloadAction<UserSummary | null>,
) => {
  state.user = action.payload;
  setStoredAuth({ user: action.payload });
};

export const setAuthError = (
  state: AuthState,
  action: PayloadAction<string | null>,
) => {
  state.error = action.payload;
};

export const clearAuthError = (state: AuthState) => {
  state.error = null;
};

export const logout = (state: AuthState) => {
  state.token = null;
  state.user = null;
  state.authenticated = false;
  state.isLoading = false;
  state.error = null;
  clearStoredAuth();
};
