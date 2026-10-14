import React from 'react';
import { Button, Collapse, Nav } from 'react-bootstrap';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { NavigationItem } from '@/types';
import { SidebarNavItem } from './SidebarNavItem';

export interface SidebarNavSectionProps {
  sectionKey: string;
  sectionLabel: string;
  items: NavigationItem[];
  currentView: string;
  isCollapsed: boolean;
  isSectionCollapsed: boolean;
  onToggleSection: (key: string) => void;
  onSelectView: (id: string) => void;
}

export const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({
  sectionKey,
  sectionLabel,
  items,
  currentView,
  isCollapsed,
  isSectionCollapsed,
  onToggleSection,
  onSelectView,
}) => {
  const { theme } = useTheme();
  const { isRtl } = useLanguage();

  return (
    <div className="w-100 mb-2 flex-shrink-0">
      {!isCollapsed ? (
        <Button
          variant="link"
          type="button"
          onClick={() => onToggleSection(sectionKey)}
          className="sidebar-section-toggle w-100 d-flex align-items-center justify-content-between px-2 py-1 border-0 bg-transparent text-uppercase fw-semibold text-decoration-none shadow-none"
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.5px',
            cursor: 'pointer',
          }}
        >
          <span>{sectionLabel}</span>
          <ChevronDown
            size={12}
            className="sidebar-chevron-transition flex-shrink-0"
            style={{
              transform: isSectionCollapsed
                ? isRtl
                  ? 'rotate(90deg)'
                  : 'rotate(-90deg)'
                : 'rotate(0deg)',
            }}
          />
        </Button>
      ) : (
        <div
          className="border-bottom my-1 mx-2 opacity-50"
          style={{ borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }}
        />
      )}

      <Collapse in={!isSectionCollapsed}>
        <div className="w-100">
          <Nav className="flex-column flex-nowrap gap-1 mt-0.5 w-100">
            {items.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={currentView === item.id}
                isCollapsed={isCollapsed}
                onSelectView={onSelectView}
              />
            ))}
          </Nav>
        </div>
      </Collapse>
    </div>
  );
};

export default SidebarNavSection;
