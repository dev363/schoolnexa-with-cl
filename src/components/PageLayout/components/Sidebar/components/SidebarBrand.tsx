import React from 'react';
import { Button, Badge, Stack } from 'react-bootstrap';
import { School, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export interface SidebarBrandProps {
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

export const SidebarBrand: React.FC<SidebarBrandProps> = ({ isCollapsed, onCloseMobile }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { activeSchool } = useAuth();

  return (
    <div
      className={`px-3 py-2 d-flex align-items-center justify-content-between border-bottom ${
        theme === 'dark' ? 'border-secondary' : 'border-secondary-subtle'
      }`}
      style={{
        height: '52px',
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
      }}
    >
      <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
        <div
          className="rounded bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
          style={{ width: '28px', height: '28px', minWidth: '28px' }}
        >
          <School size={16} />
        </div>
        {!isCollapsed && (
          <div
            className="d-flex flex-column min-w-0 sidebar-fade-transition"
            style={{ lineHeight: 1.2 }}
          >
            <Stack direction="horizontal" gap={1} className="align-items-center">
              <span
                className="fw-bold text-truncate"
                style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
              >
                {t.common.appName}
              </span>
              <Badge
                bg="primary-subtle"
                text="primary"
                className="border border-primary-subtle flex-shrink-0"
                style={{ fontSize: '0.65rem' }}
              >
                ERP
              </Badge>
            </Stack>
            <span
              className="text-truncate"
              style={{
                fontSize: '0.7rem',
                maxWidth: '200px',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              {activeSchool?.name || t.common.appTagline}
            </span>
          </div>
        )}
      </div>

      {/* Mobile close button */}
      <Button
        variant="link"
        size="sm"
        id="close-sidebar-mobile-btn"
        onClick={onCloseMobile}
        className="p-0 d-md-none text-decoration-none"
        style={{ color: theme === 'dark' ? '#cbd5e1' : '#64748b' }}
        aria-label="Close Sidebar"
      >
        <X size={18} />
      </Button>
    </div>
  );
};

export default SidebarBrand;
