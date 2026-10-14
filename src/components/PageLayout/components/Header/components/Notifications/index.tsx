import React, { useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Bell } from 'lucide-react';
import { NotificationItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import NotificationsPopover from './NotificationsPopover';

interface NotificationsProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="position-relative">
      <Button
        id="notifications-btn"
        variant="outline-secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 d-flex align-items-center justify-content-center position-relative"
        title={t.common.notifications}
        aria-label={t.common.notifications}
        style={{ width: '32px', height: '32px' }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <Badge
            bg="primary"
            pill
            className="position-absolute top-0 start-100 translate-middle p-1"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationsPopover
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onClearNotifications={onClearNotifications}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default Notifications;
