import React from 'react';
import { Nav } from 'react-bootstrap';
import { useLanguage } from '@/context/LanguageContext';
import { NavigationItem } from '@/types';
import { SidebarNavSection } from './SidebarNavSection';

export interface SidebarNavListProps {
  items: NavigationItem[];
  currentView: string;
  isCollapsed: boolean;
  collapsedSections: Record<string, boolean>;
  onToggleSection: (key: string) => void;
  onSelectView: (id: string) => void;
}

export const SidebarNavList: React.FC<SidebarNavListProps> = ({
  items,
  currentView,
  isCollapsed,
  collapsedSections,
  onToggleSection,
  onSelectView,
}) => {
  const { t } = useLanguage();

  // Group items by Section
  const groupedSections: { sectionKey: string; sectionLabel: string; items: NavigationItem[] }[] =
    [];
  items.forEach((item) => {
    const sectionLabel = (t.navSections as any)[item.sectionKey] || item.defaultSection;
    let group = groupedSections.find((g) => g.sectionKey === item.sectionKey);
    if (!group) {
      group = { sectionKey: item.sectionKey, sectionLabel, items: [] };
      groupedSections.push(group);
    }
    group.items.push(item);
  });

  return (
    <Nav
      className="sidebar-menus flex-column flex-nowrap flex-grow-1 p-2 w-100"
      style={{ overflowX: 'hidden', overflowY: 'auto' }}
    >
      {groupedSections.map((group) => (
        <SidebarNavSection
          key={group.sectionKey}
          sectionKey={group.sectionKey}
          sectionLabel={group.sectionLabel}
          items={group.items}
          currentView={currentView}
          isCollapsed={isCollapsed}
          isSectionCollapsed={Boolean(collapsedSections[group.sectionKey] && !isCollapsed)}
          onToggleSection={onToggleSection}
          onSelectView={onSelectView}
        />
      ))}
    </Nav>
  );
};

export default SidebarNavList;
