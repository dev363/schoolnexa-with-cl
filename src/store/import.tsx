/**
 * SchoolNexa Centralized Store Imports and Typed Hooks
 */

export { store } from './index';
export type { RootState, AppDispatch } from './index';
export { useAppDispatch, useAppSelector } from './hooks';

// Modular store exports
export * as AuthStore from './auth';
export * as SchoolStore from './school';
export * as TeacherStore from './teachers';
export * as StudentStore from './students';
