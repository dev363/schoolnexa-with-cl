import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import {
  LayoutDashboard,
  ShieldCheck,
  CalendarRange,
  GraduationCap,
  UserCheck,
  Layers,
  BookOpenCheck,
  CalendarCheck,
  FileText,
  FileSpreadsheet,
  Award,
  Coins,
  Receipt,
  Scale,
  Wallet,
  BookMarked,
  Bus,
  Building,
  School,
  CalendarDays,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { NavigationItem } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ShieldCheck,
  CalendarRange,
  GraduationCap,
  UserCheck,
  UserPlus,
  Users,
  Layers,
  BookOpenCheck,
  CalendarCheck,
  FileText,
  FileSpreadsheet,
  Award,
  Coins,
  Receipt,
  Scale,
  Wallet,
  BookMarked,
  Bus,
  Building,
  School,
  CalendarDays,
  Sparkles,
};

export interface SidebarNavItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  onSelectView: (id: string) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onSelectView,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
  const moduleI18n = (t.navModules as any)[item.labelKey];
  const itemLabel = moduleI18n?.label || item.defaultLabel;

  return (
    <Nav.Item className="w-100 flex-shrink-0">
      <Nav.Link
        as="button"
        id={`nav-item-${item.id}`}
        onClick={() => onSelectView(item.id)}
        title={isCollapsed ? itemLabel : undefined}
        active={isActive}
        className={`sidebar-nav-btn w-100 d-flex align-items-center flex-nowrap ${
          isActive ? 'active' : ''
        } ${isCollapsed ? 'justify-content-center px-0' : 'gap-2'}`}
      >
        <IconComponent
          size={16}
          className="flex-shrink-0"
          style={{
            color: isActive ? '#ffffff' : theme === 'dark' ? '#94a3b8' : '#64748b',
            transition: 'color 150ms ease',
          }}
        />

        {!isCollapsed && (
          <>
            <span
              className="flex-grow-1 text-truncate text-start sidebar-fade-transition"
              style={{ whiteSpace: 'nowrap' }}
            >
              {itemLabel}
            </span>
            {item.badge && (
              <Badge
                bg={isActive ? 'light' : theme === 'dark' ? 'dark' : 'secondary-subtle'}
                text={isActive ? 'primary' : theme === 'dark' ? 'light' : 'secondary'}
                className={`${
                  theme === 'dark' && !isActive ? 'border border-secondary' : ''
                } flex-shrink-0 sidebar-fade-transition text-nowrap`}
                style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Nav.Link>
    </Nav.Item>
  );
};

export default SidebarNavItem;
