/**
 * SchoolNexa Auth RTK Query Matchers
 *
 * Provides lifecycle listeners for Auth RTK Query endpoints:
 * - loginStatus: handles pending, fulfilled (stores credentials), rejected
 * - logoutStatus: handles pending, fulfilled, rejected (clears credentials)
 * - getMeStatus: updates user profile on getMe fulfillment
 */

import { type ActionReducerMapBuilder, isAnyOf } from '@reduxjs/toolkit';
import { setStoredAuth, clearStoredAuth } from '@/store/utils/apiStorage';
import { authApi, type LoginResponse } from './services.api';
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

export const loginStatus = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
    state.isLoading = true;
    state.error = null;
  });

  builder.addMatcher(
    authApi.endpoints.login.matchFulfilled,
    (state, action) => {
      state.isLoading = false;
      state.error = null;
      const payload: LoginResponse = action.payload;
      const jwtToken = payload.data?.token || payload.token;
      const apiUser = payload.data?.user || payload.user;

      if (isValidToken(jwtToken)) {
        state.token = jwtToken.trim();
        state.user = apiUser || null;
        state.authenticated = true;
        setStoredAuth({ token: jwtToken.trim(), user: apiUser || null });
      }
    },
  );

  builder.addMatcher(
    authApi.endpoints.login.matchRejected,
    (state, action: any) => {
      state.isLoading = false;
      state.authenticated = false;
      state.error =
        action.error?.message ||
        action.payload?.message ||
        'Authentication failed';
    },
  );
};

export const logoutStatus = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addMatcher(authApi.endpoints.logout.matchPending, (state) => {
    state.isLoading = true;
  });

  builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
    state.token = null;
    state.user = null;
    state.authenticated = false;
    state.isLoading = false;
    state.error = null;
    clearStoredAuth();
  });

  builder.addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
    state.token = null;
    state.user = null;
    state.authenticated = false;
    state.isLoading = false;
    clearStoredAuth();
  });
};

export const getMeStatus = (builder: ActionReducerMapBuilder<AuthState>) => {
  builder.addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
    const user =
      action.payload?.data?.user || action.payload?.user || action.payload;
    if (user) {
      state.user = user;
      setStoredAuth({ user });
    }
  });
};

// Convenience boolean matchers
export const isAuthMutationPending = isAnyOf(
  authApi.endpoints.login.matchPending,
  authApi.endpoints.logout.matchPending,
);

export const isAuthMutationFulfilled = isAnyOf(
  authApi.endpoints.login.matchFulfilled,
  authApi.endpoints.logout.matchFulfilled,
);

export const isAuthMutationRejected = isAnyOf(
  authApi.endpoints.login.matchRejected,
  authApi.endpoints.logout.matchRejected,
);
