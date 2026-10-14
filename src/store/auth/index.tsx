/**
 * SchoolNexa Auth Redux Module
 *
 * Follows the canonical reference structure in `src/store/test.tsx`:
 * - AuthState interface & initialState (startup restoration from storage)
 * - createSlice with `reducers: actions`
 * - extraReducers with status matchers
 * - Selectors & slice actions
 * - Re-exports services.api, actions, matchers, apiClient.routes
 */

import { createSlice } from '@reduxjs/toolkit';
import type { UserSummary } from '@/types';
import { getStoredAuth } from '@/store/utils/apiStorage';
import type { RootState } from '@/store/Store';
import * as actions from './actions';
import { loginStatus, logoutStatus, getMeStatus } from './matchers';

export interface AuthState {
  token: string | null;
  user: UserSummary | null;
  authenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Restore persisted state on startup safely
const initialStored = getStoredAuth();

const initialState: AuthState = {
  token: initialStored.token,
  user: (initialStored.user as UserSummary) || null,
  authenticated: Boolean(initialStored.token),
  isLoading: false,
  error: null,
};

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: actions,
  extraReducers: (builder) => {
    loginStatus(builder);
    logoutStatus(builder);
    getMeStatus(builder);
  },
});

export default AuthSlice.reducer;
export const authReducer = AuthSlice.reducer;
export const authSlice = AuthSlice;

export const {
  setCredentials,
  setAuthUser,
  setAuthError,
  clearAuthError,
  logout,
} = AuthSlice.actions;

// Selectors
export const AuthSelector = (state: RootState) => state.auth;
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.authenticated;

export * from './services.api';
export * from './actions';
export * from './matchers';
export * from './apiClient.routes';
