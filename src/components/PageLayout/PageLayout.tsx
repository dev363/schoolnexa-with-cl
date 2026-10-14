import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { APP_NAVIGATION, MOCK_NOTIFICATIONS } from '@/data/navigation-data';
import { NotificationItem } from '@/types';

export interface PageLayoutProps {
  children?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { isRtl } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Map modular pathname to the active sidebar item ID using APP_NAVIGATION
  const pathname = location.pathname;
  const matchedItem = [...APP_NAVIGATION]
    .filter((item) => item.path)
    .sort((a, b) => b.path!.length - a.path!.length)
    .find((item) => {
      if (item.path === '/' || item.path === '/dashboard') {
        return pathname === '/' || pathname === '/dashboard';
      }
      return pathname === item.path || pathname.startsWith(`${item.path}/`);
    });
  const currentView = matchedItem?.id || pathname.replace(/^\/+/, '').split('/')[0] || 'dashboard';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleSelectView = (viewId: string) => {
    const navItem = APP_NAVIGATION.find((item) => item.id === viewId);
    const targetPath = navItem?.path || `/${viewId}`;
    navigate(targetPath);
    setIsMobileSidebarOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleToggleSidebar = () => {
    // If mobile screen, toggle mobile drawer
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      // Desktop: toggle collapse / expand
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors bg-body text-body">
      {/* Collapsible and Responsive Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop >= 768px, respecting RTL with smooth transition) */}
      <div
        className={`flex-1 flex flex-col content-layout-transition ${
          isRtl
            ? isSidebarCollapsed
              ? 'md:pr-[64px]'
              : 'md:pr-[280px]'
            : isSidebarCollapsed
              ? 'md:pl-[64px]'
              : 'md:pl-[280px]'
        }`}
        style={{
          minHeight: '100vh',
        }}
      >
        {/* Sticky Header with Selectors, Notifications & User Menu */}
        <Header
          onToggleMobileSidebar={handleToggleSidebar}
          onToggleCollapseSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearNotifications={handleClearNotifications}
        />

        {/* Dynamic Route/View Display via React Router Outlet */}
        <main className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 max-w-7xl mx-auto w-full">
          <AppBreadcrumb />
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
