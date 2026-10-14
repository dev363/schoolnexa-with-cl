import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';

export interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Encapsulates the Redux Provider with SchoolNexa's central store.
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}

export default ReduxProvider;
