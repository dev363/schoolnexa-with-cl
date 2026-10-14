import React, { useRef, useEffect } from 'react';
import { Card, Button, Badge, ListGroup, Stack } from 'react-bootstrap';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { NotificationItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  isOpen,
  onClose,
}) => {
  const { t, isRtl } = useLanguage();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Card
      ref={popoverRef}
      className={`shadow-lg border position-absolute mt-1 ${isRtl ? 'start-0' : 'end-0'}`}
      style={{
        width: '320px',
        maxWidth: '90vw',
        zIndex: 1060,
        top: '100%',
      }}
    >
      <Card.Header className="py-2 px-3 d-flex align-items-center justify-content-between bg-body">
        <Stack direction="horizontal" gap={2} className="align-items-center">
          <Bell size={14} className="text-primary" />
          <span className="fw-semibold small">{t.common?.notifications || 'Notifications'}</span>
          {unreadCount > 0 && (
            <Badge bg="primary" pill style={{ fontSize: '0.65rem' }}>
              {unreadCount}
            </Badge>
          )}
        </Stack>
        <Button
          variant="link"
          size="sm"
          onClick={onClose}
          className="p-0 text-muted"
          aria-label="Close"
        >
          <X size={15} />
        </Button>
      </Card.Header>

      <Card.Body className="p-0" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            {t.common?.unread ? `0 ${t.common.unread}` : 'No notifications'}
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((n) => (
              <ListGroup.Item
                key={n.id}
                className={`py-2 px-3 small d-flex flex-column gap-1 ${
                  !n.isRead ? 'bg-primary-subtle bg-opacity-25' : ''
                }`}
              >
                <div className="d-flex align-items-start justify-content-between gap-1">
                  <span className={`fw-medium ${!n.isRead ? 'text-primary' : ''}`}>{n.title}</span>
                  {!n.isRead && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onMarkAsRead(n.id)}
                      className="p-0 text-muted"
                      title="Mark read"
                    >
                      <Check size={13} />
                    </Button>
                  )}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {n.message}
                </div>
                <div className="text-muted text-end font-monospace" style={{ fontSize: '0.65rem' }}>
                  {n.createdAt}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>

      {notifications.length > 0 && (
        <Card.Footer className="py-1.5 px-3 d-flex justify-content-between bg-body">
          <Button
            variant="link"
            size="sm"
            onClick={onMarkAllAsRead}
            className="p-0 text-decoration-none small d-flex align-items-center gap-1"
            style={{ fontSize: '0.72rem' }}
          >
            <CheckCheck size={13} />
            <span>Mark All</span>
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={onClearNotifications}
            className="p-0 text-decoration-none text-danger small d-flex align-items-center gap-1"
            style={{ fontSize: '0.72rem' }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default NotificationsPopover;
