import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // duration in ms, <= 0 means sticky (no auto close)
  createdAt: number;
}

export interface ShowToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number; // default: 4500ms
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ShowToastOptions | string, variant?: ToastVariant) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  danger: 6000,
  warning: 5000,
  info: 4500,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Close one by one
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Close all function
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Show Toast
  const showToast = useCallback(
    (options: ShowToastOptions | string, variantOverride?: ToastVariant): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let message = '';
      let title: string | undefined;
      let variant: ToastVariant = variantOverride || 'info';
      let duration = DEFAULT_DURATIONS[variant];

      if (typeof options === 'string') {
        message = options;
        if (variantOverride) {
          variant = variantOverride;
          duration = DEFAULT_DURATIONS[variant];
        }
      } else {
        message = options.message;
        title = options.title;
        if (options.variant) {
          variant = options.variant;
          duration = DEFAULT_DURATIONS[variant];
        }
        if (typeof options.duration === 'number') {
          duration = options.duration;
        }
      }

      const newToast: ToastItem = {
        id,
        title,
        message,
        variant,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Keep maximum of 6 active toasts to prevent viewport overflow
        const updated = [...prev, newToast];
        return updated.length > 6 ? updated.slice(updated.length - 6) : updated;
      });

      return id;
    },
    [],
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title, variant: 'success', duration }),
    [showToast],
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title, variant: 'danger', duration }),
    [showToast],
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title, variant: 'warning', duration }),
    [showToast],
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title, variant: 'info', duration }),
    [showToast],
  );

  // Global window event listener for app:toast
  // Enables triggering toasts anywhere, including non-React code (e.g. apiClient, fetch interceptors)
  useEffect(() => {
    const handleGlobalToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ShowToastOptions>;
      if (customEvent.detail && customEvent.detail.message) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener('app:toast', handleGlobalToastEvent);
    return () => {
      window.removeEventListener('app:toast', handleGlobalToastEvent);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        toast: {
          success,
          error,
          warning,
          info,
        },
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global helper function to trigger toast from anywhere (e.g. services, api client)
export const emitToast = (options: ShowToastOptions | string, variant?: ToastVariant) => {
  if (typeof window !== 'undefined') {
    const detail: ShowToastOptions =
      typeof options === 'string'
        ? { message: options, variant: variant || 'info' }
        : { ...options, variant: options.variant || variant || 'info' };

    window.dispatchEvent(new CustomEvent('app:toast', { detail }));
  }
};
