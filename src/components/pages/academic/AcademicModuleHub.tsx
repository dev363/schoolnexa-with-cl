import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Nav, Badge } from 'react-bootstrap';
import {
  LayoutDashboard,
  Wand2,
  Building2,
  CalendarRange,
  Layers,
  BookOpenCheck,
  UserCheck,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AcademicSetupDashboard } from './AcademicSetupDashboard';
import { SmartAcademicAllocator } from './SmartAcademicAllocator';
import { EasyAcademicHub } from './EasyAcademicHub';
import { SchoolProfileView } from './SchoolProfileView';
import { AcademicYearsView } from './AcademicYearsView';
import { ClassesManagementView } from './ClassesManagementView';
import { CurriculumManagementView } from './CurriculumManagementView';
import { TeacherAssignmentsView } from './TeacherAssignmentsView';
import { TimetableManagementView } from './TimetableManagementView';
import { TimetableWizard } from '../timetable/TimetableWizard';

export type AcademicTabType =
  | 'generator'
  | 'easy-access'
  | 'allocator'
  | 'overview'
  | 'profile'
  | 'academic-years'
  | 'classes'
  | 'curriculum'
  | 'teachers'
  | 'timetable';

interface AcademicModuleHubProps {
  initialTab?: AcademicTabType;
}

export const AcademicModuleHub: React.FC<AcademicModuleHubProps> = ({
  initialTab = 'generator',
}) => {
  const { theme } = useTheme();
  const { activeSchool } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<AcademicTabType>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tabId: AcademicTabType) => {
    setActiveTab(tabId);
    const routeMap: Record<AcademicTabType, string> = {
      profile: '/school-profile',
      curriculum: '/curriculum',
      'academic-years': '/academic-years',
      classes: '/classes',
      teachers: '/teachers',
      timetable: '/timetable',
      overview: '/academic-setup',
      generator: '/timetable-generator',
      'easy-access': '/easy-academic',
      allocator: '/academic-allocator',
    };
    if (routeMap[tabId]) {
      navigate(routeMap[tabId]);
    }
  };

  const tabs: {
    id: AcademicTabType;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    badge?: string;
  }[] = [
    { id: 'generator', label: 'Timetable Generator', icon: Sparkles, badge: 'Auto' },
    { id: 'easy-access', label: 'Quick Schedule & Teachers', icon: CalendarDays, badge: 'Easy' },
    { id: 'allocator', label: 'Express Allocator', icon: Wand2, badge: 'Fast' },
    { id: 'overview', label: 'Setup Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'School Profile', icon: Building2, badge: 'Step 1' },
    { id: 'academic-years', label: 'Academic Years', icon: CalendarRange, badge: 'Step 2' },
    { id: 'classes', label: 'Classes & Sections', icon: Layers, badge: 'Steps 3-5' },
    { id: 'curriculum', label: 'Subjects & Curricula', icon: BookOpenCheck, badge: 'Steps 6-7' },
    { id: 'teachers', label: 'Teacher Directory', icon: UserCheck, badge: 'Step 8' },
    { id: 'timetable', label: 'Detailed Schedules', icon: CalendarDays, badge: 'Step 9' },
  ];

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Tab Bar Navigation - Clean Bootstrap ERP sub-nav */}
      <Card className="border shadow-sm sticky-top bg-body" style={{ top: '65px', zIndex: 10 }}>
        <Card.Body className="p-1">
          <Nav
            variant="pills"
            activeKey={activeTab}
            className="flex-nowrap overflow-auto gap-1"
            style={{ fontSize: '0.8rem' }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Nav.Item key={tab.id} className="text-nowrap">
                  <Nav.Link
                    eventKey={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-1.5 px-2.5 d-flex align-items-center gap-1.5 text-nowrap rounded-2 ${
                      isActive ? 'bg-primary text-white fw-semibold' : 'text-body-secondary'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge
                        bg={isActive ? 'light' : 'secondary'}
                        text={isActive ? 'dark' : undefined}
                        className="fw-normal"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </Card.Body>
      </Card>

      {/* Active Tab View */}
      <div>
        {activeTab === 'generator' && (
          <TimetableWizard
            schoolId={activeSchool?.id || 'sch-001'}
            onPublished={() => handleTabChange('timetable')}
          />
        )}
        {activeTab === 'easy-access' && (
          <EasyAcademicHub onNavigateTab={(tab) => handleTabChange(tab as AcademicTabType)} />
        )}
        {activeTab === 'overview' && (
          <AcademicSetupDashboard
            onNavigateTab={(tab) => handleTabChange(tab as AcademicTabType)}
          />
        )}
        {activeTab === 'allocator' && (
          <SmartAcademicAllocator
            onNavigateTab={(tab) => handleTabChange(tab as AcademicTabType)}
          />
        )}
        {activeTab === 'profile' && <SchoolProfileView />}
        {activeTab === 'academic-years' && <AcademicYearsView />}
        {activeTab === 'classes' && <ClassesManagementView />}
        {activeTab === 'curriculum' && <CurriculumManagementView />}
        {activeTab === 'teachers' && <TeacherAssignmentsView />}
        {activeTab === 'timetable' && <TimetableManagementView />}
      </div>
    </div>
  );
};
