import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { APP_NAVIGATION } from '@/data/navigation-data';
import { SidebarBrand, SidebarTenantBadge, SidebarNavList, SidebarFooter } from './components';

export interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
}) => {
  const { hasPermission } = useAuth();
  const { theme } = useTheme();
  const { isRtl } = useLanguage();

  // Collapsible sections state - expanded by default for discoverability
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter items by user permissions, ensuring fallback so navigation is never empty
  const accessibleItems = APP_NAVIGATION.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  const displayItems = accessibleItems.length > 0 ? accessibleItems : APP_NAVIGATION;

  const handleSelectView = (viewId: string) => {
    onSelectView(viewId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop with smooth fade transition */}
      <div
        className={`position-fixed top-0 bottom-0 start-0 end-0 bg-black d-md-none sidebar-backdrop-enter ${
          isOpenMobile ? 'sidebar-backdrop-active' : ''
        }`}
        style={{ zIndex: 1040 }}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Sidebar container with smooth layout transitions */}
      <aside
        id="application-sidebar"
        className={`position-fixed top-0 bottom-0 ${
          isRtl ? 'end-0 border-start' : 'start-0 border-end'
        } flex-column sidebar-container-transition ${
          theme === 'dark' ? 'border-secondary' : 'border-secondary-subtle'
        } ${isOpenMobile ? 'd-flex' : 'd-none d-md-flex'}`}
        style={{
          width: isCollapsed ? '64px' : '280px',
          zIndex: 1045,
          backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          boxShadow: isOpenMobile ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : undefined,
        }}
        aria-label="Application Sidebar Navigation"
      >
        {/* Brand header with Logo, App Name and Mobile Close */}
        <SidebarBrand isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />

        {/* Tenant/School isolation badge */}
        <SidebarTenantBadge isCollapsed={isCollapsed} />

        {/* Navigation items list */}
        <SidebarNavList
          items={displayItems}
          currentView={currentView}
          isCollapsed={isCollapsed}
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
          onSelectView={handleSelectView}
        />

        {/* System status and version footer */}
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};

export default Sidebar;
