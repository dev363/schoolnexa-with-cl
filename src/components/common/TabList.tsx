import { Nav } from 'react-bootstrap';
import type { LucideIcon } from 'lucide-react';

export interface TabListTab {
  eventKey: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  activeKeys?: string[];
}

export interface TabListTabsProps {
  activeTab: string;
  onSelect: (eventKey: string | null) => void;
  tabs: TabListTab[];
  className?: string;
}

export const TabList = ({ activeTab, onSelect, tabs, className = '' }: TabListTabsProps) => {
  return (
    <Nav
      variant="tabs"
      className={`mb-1 ${className}`.trim()}
      activeKey={activeTab}
      onSelect={onSelect}
      navbarScroll
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        const isActive = tab.activeKeys?.includes(activeTab) || activeTab === tab.eventKey;

        return (
          <Nav.Item key={tab.eventKey}>
            <Nav.Link
              eventKey={tab.eventKey}
              active={isActive}
              className="d-flex align-items-center gap-1.5 py-2"
            >
              <Icon size={15} />

              <span>
                {tab.label}
                {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
              </span>
            </Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default TabList;
