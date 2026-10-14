import React from 'react';
import { Stack, Badge } from 'react-bootstrap';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export interface SidebarFooterProps {
  isCollapsed: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ isCollapsed }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className="p-2 border-top d-flex align-items-center justify-content-between"
      style={{
        fontSize: '0.7rem',
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
        color: theme === 'dark' ? '#94a3b8' : '#64748b',
      }}
    >
      {!isCollapsed ? (
        <>
          <Stack direction="horizontal" gap={1} className="align-items-center">
            <span
              className="badge rounded-pill bg-success"
              style={{ width: '6px', height: '6px', padding: 0 }}
            />
            <span className="text-truncate">{t.common.invariantsGuarded}</span>
          </Stack>
          <span className="font-monospace opacity-75">v3.3.1</span>
        </>
      ) : (
        <div className="w-100 d-flex justify-content-center">
          <Badge bg="success" className="rounded-pill p-0" style={{ width: '6px', height: '6px' }}>
            {' '}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;
