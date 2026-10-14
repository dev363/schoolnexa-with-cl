import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { Menu } from 'lucide-react';
import { NotificationItem } from '@/types';
import { SchoolManage } from './components/SchoolManage';
import { AcademicYearManage } from './components/AcademicYearManage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Notifications } from './components/Notifications';
import { UserMenu } from './components/UserMenu';

export interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleCollapseSidebar: () => void;
  isSidebarCollapsed: boolean;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onToggleCollapseSidebar,
  isSidebarCollapsed,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  return (
    <Navbar
      id="application-header"
      className="px-3 py-1 border-bottom sticky-top z-3 bg-body"
      style={{ minHeight: '48px' }}
    >
      <div className="d-flex align-items-center justify-content-between w-100 gap-2">
        {/* Left section: Sidebar toggle & Context selectors */}
        <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
          {/* Sidebar Toggle button (collapse/expand on desktop, open/close drawer on mobile) */}
          <Button
            id="header-sidebar-toggle-btn"
            variant="outline-secondary"
            size="sm"
            onClick={onToggleCollapseSidebar}
            className="p-1 d-flex align-items-center justify-content-center"
            title={isSidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            aria-label="Toggle Navigation"
            style={{
              width: '32px',
              height: '32px',
              transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
          >
            <Menu
              size={16}
              style={{
                transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSidebarCollapsed ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </Button>

          {/* School Selector Dropdown */}
          <SchoolManage />

          {/* Academic Year Selector Dropdown */}
          <AcademicYearManage />
        </div>

        {/* Right section: Language Switcher, Theme Toggle, Notifications, User Menu */}
        <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
          {/* Language Switcher Dropdown */}
          <LanguageSwitcher />

          {/* Theme Toggle Button */}
          <ThemeSwitcher />

          {/* Notifications Button & Popover */}
          <Notifications
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearNotifications={onClearNotifications}
          />

          {/* User Menu Trigger & Security Modal */}
          <UserMenu />
        </div>
      </div>
    </Navbar>
  );
};

export default Header;
