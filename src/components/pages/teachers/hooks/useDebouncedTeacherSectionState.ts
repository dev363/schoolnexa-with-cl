import { useState, useEffect, useMemo, useRef } from 'react';
import { cloneDeep, debounce, isEqual, DebouncedFunc } from 'lodash';

/**
 * Options for managing a debounced repeatable section array synchronized with TeacherFormContext
 */
export interface UseDebouncedTeacherSectionStateOptions<T> {
  /** Current array value from TeacherFormContext */
  contextValue: T[] | undefined;
  /** Callback to update TeacherFormContext when debounced changes flush */
  onContextChange: (next: T[]) => void;
  /** Debounce delay in milliseconds (defaults to 300ms per SchoolNexa standard) */
  debounceMs?: number;
}

/**
 * Return type for useDebouncedTeacherSectionState
 */
export interface UseDebouncedTeacherSectionStateReturn<T> {
  /** Local copy of the repeatable section items for immediate UI feedback */
  localState: T[];
  /** State setter for local items */
  setLocalState: React.Dispatch<React.SetStateAction<T[]>>;
  /** Debounced synchronization function (supports .flush() and .cancel()) */
  syncToContext: DebouncedFunc<(next: T[]) => void>;
  /** Convenience shortcut to flush pending debounced updates immediately */
  flush: () => void;
}

/**
 * Reusable hook for repeatable Teacher form sections (Qualifications, Experience,
 * Emergency Contacts, Documents).
 *
 * Provides:
 * 1. Immediate local state updates for fast UI responsiveness
 * 2. 300ms debounced synchronization to TeacherFormContext
 * 3. Deep equality comparison to prevent unnecessary renders and infinite sync loops
 * 4. Automatic cleanup and pending flush on unmount or blur
 * 5. Protection against stale closures and race conditions via internal refs
 */
export function useDebouncedTeacherSectionState<T>({
  contextValue,
  onContextChange,
  debounceMs = 300,
}: UseDebouncedTeacherSectionStateOptions<T>): UseDebouncedTeacherSectionStateReturn<T> {
  const [localState, setLocalState] = useState<T[]>(() =>
    cloneDeep(contextValue ?? []),
  );

  // Keep latest local state in ref for safe comparison during context updates
  const latestLocalStateRef = useRef<T[]>(localState);
  latestLocalStateRef.current = localState;

  // Keep latest onContextChange in ref to avoid recreating the debounce instance on parent render
  const onContextChangeRef = useRef(onContextChange);
  onContextChangeRef.current = onContextChange;

  // Debounced Context synchronization instance (stable across renders)
  const syncToContext = useMemo(
    () =>
      debounce((nextItems: T[]) => {
        onContextChangeRef.current(cloneDeep(nextItems));
      }, debounceMs),
    [debounceMs],
  );

  // Flush any pending debounced updates on unmount so no user input is lost
  useEffect(() => {
    return () => {
      syncToContext.flush();
    };
  }, [syncToContext]);

  // Context -> localState synchronization (handles initial load and external resets)
  useEffect(() => {
    if (!isEqual(contextValue, latestLocalStateRef.current)) {
      setLocalState(cloneDeep(contextValue ?? []));
    }
  }, [contextValue]);

  return {
    localState,
    setLocalState,
    syncToContext,
    flush: syncToContext.flush,
  };
}
