import React from 'react';
import { Toast, ToastContainer, Button, Badge } from 'react-bootstrap';
import { useToast, ToastVariant } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-success shrink-0" />,
  danger: <AlertCircle size={16} className="text-danger shrink-0" />,
  warning: <AlertTriangle size={16} className="text-warning shrink-0" />,
  info: <Info size={16} className="text-info shrink-0" />,
};

const borderClassMap: Record<ToastVariant, string> = {
  success: 'border-start border-4 border-success',
  danger: 'border-start border-4 border-danger',
  warning: 'border-start border-4 border-warning',
  info: 'border-start border-4 border-primary',
};

export const AppToastContainer: React.FC = () => {
  const { toasts, removeToast, clearAllToasts } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <ToastContainer
      position="top-end"
      className="p-3 position-fixed"
      style={{ zIndex: 1090, maxWidth: '380px' }}
    >
      {/* "Close all" control button appears when more than 1 notification is stacked */}
      {toasts.length > 1 && (
        <div className="d-flex align-items-center justify-content-between mb-2 px-2 py-1 bg-body rounded border shadow-sm">
          <span
            className="small text-muted d-flex align-items-center gap-1.5"
            style={{ fontSize: '0.75rem' }}
          >
            <Badge bg="secondary" pill style={{ fontSize: '0.65rem' }}>
              {toasts.length}
            </Badge>
            <span>Notifications</span>
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={clearAllToasts}
            className="text-decoration-none p-0 text-muted hover:text-dark d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.75rem' }}
            title="Dismiss all notifications"
          >
            <X size={13} />
            <span>Close all</span>
          </Button>
        </div>
      )}

      {/* Individual Toasts */}
      {toasts.map((item) => {
        const hasAutoHide = typeof item.duration === 'number' ? item.duration > 0 : true;
        const delay = item.duration && item.duration > 0 ? item.duration : 4500;

        return (
          <Toast
            key={item.id}
            bg={isDark ? 'dark' : 'white'}
            autohide={hasAutoHide}
            delay={delay}
            onClose={() => removeToast(item.id)}
            className={`shadow-sm border mb-2 overflow-hidden ${borderClassMap[item.variant]} ${
              isDark ? 'border-secondary text-white' : 'text-dark'
            }`}
          >
            <Toast.Header
              closeButton
              className={`py-1.5 px-2.5 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light'}`}
            >
              <div className="d-flex align-items-center gap-1.5 me-auto">
                {iconMap[item.variant]}
                <strong className="small text-capitalize" style={{ fontSize: '0.78rem' }}>
                  {item.title || (item.variant === 'danger' ? 'Error' : item.variant)}
                </strong>
              </div>
            </Toast.Header>
            <Toast.Body
              className="small py-2 px-2.5"
              style={{ fontSize: '0.8rem', lineHeight: 1.35 }}
            >
              {item.message}
            </Toast.Body>
          </Toast>
        );
      })}
    </ToastContainer>
  );
};
