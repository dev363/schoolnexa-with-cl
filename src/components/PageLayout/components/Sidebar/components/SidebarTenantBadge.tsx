import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export interface SidebarTenantBadgeProps {
  isCollapsed: boolean;
}

export const SidebarTenantBadge: React.FC<SidebarTenantBadgeProps> = ({ isCollapsed }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { activeSchool } = useAuth();

  if (isCollapsed || !activeSchool) {
    return null;
  }

  return (
    <div
      className="mx-2 my-1.5 p-2 rounded border sidebar-fade-transition"
      style={{
        backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ fontSize: '0.68rem', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}
      >
        <span>{t.common.tenantIsolated}</span>
        <Badge bg="success-subtle" text="success" className="font-monospace">
          {activeSchool.code}
        </Badge>
      </div>
      <div
        className="fw-semibold text-truncate mt-0.5"
        style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
      >
        {activeSchool.name}
      </div>
    </div>
  );
};

export default SidebarTenantBadge;
