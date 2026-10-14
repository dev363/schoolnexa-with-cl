import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Nav } from 'react-bootstrap';
import {
  Building2,
  Calendar,
  ShieldCheck,
  Database,
  Lock,
  CheckCircle2,
  School,
  ArrowRight,
  Layers,
  BookOpenCheck,
  UserCheck,
  CalendarRange,
  CalendarDays,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { TopHeader, ChipCard, InfoCard } from '@/components/common';

interface DashboardViewProps {
  onNavigate?: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, activeSchool, activeAcademicYear, currentRoles, currentPermissions } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RBAC'>('OVERVIEW');
  const isDark = theme === 'dark';

  const infoCards = [
    {
      label: t.dashboard.tenantBoundary,
      icon: Building2,
      iconColor: 'text-primary',
      value: activeSchool?.code,
      description: activeSchool?.domain || 'Standard Isolation',
      link: null,
      action: null,
    },
    {
      label: t.dashboard.academicAnchor,
      icon: Calendar,
      iconColor: 'text-success',
      value: activeAcademicYear?.code,
      description: activeAcademicYear?.name || 'Active Session',
      link: null,
      action: null,
    },
    {
      label: 'Active Roles',
      icon: ShieldCheck,
      iconColor: 'text-warning',
      value: `${currentRoles.length} Roles`,
      description: currentRoles.map((role) => role.name).join(', ') || 'None',
      link: '/rbac',
      action: null,
    },
    {
      label: 'Active Permissions',
      icon: Lock,
      iconColor: 'text-info',
      value: `${currentPermissions.length} Active`,
      description: user?.isSuperAdmin ? 'Full SuperAdmin Privileges' : 'Role-Scoped',
      link: null,
      action: null,
    },
  ];

  const inventoryChips = [
    {
      title: t.dashboard.inv1Title,
      description: t.dashboard.inv1Desc,
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
    {
      title: t.dashboard.inv2Title,
      description: t.dashboard.inv2Desc,
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
    {
      title: t.dashboard.inv3Title,
      description: t.dashboard.inv3Desc,
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
    {
      title: t.dashboard.inv4Title,
      description: t.dashboard.inv4Desc,
      icon: CheckCircle2,
      iconColor: 'text-success',
    },
  ];

  return (
    <div className="d-flex flex-column gap-3">
      {/* Page Title & Actions */}
      <TopHeader
        title={activeSchool?.name || 'School ERP'}
        icon={LayoutDashboard}
        subtitle={
          activeSchool?.domain && (
            <a className="text-muted small mb-0" target="_blank" href={activeSchool?.domain}>
              {activeSchool?.domain}
            </a>
          )
        }
        badges={[
          {
            bg: 'primary',
            label: activeSchool?.code || '',
          },
          {
            bg: 'success',
            label: activeAcademicYear?.code || 'AY-ACTIVE',
          },
        ]}
        actions={[
          {
            name: 'School Setup',
            icon: School,
            link: '/academic/setup',
            variant: 'primary',
          },
          {
            name: t.dashboard.rbacMatrix,
            icon: ShieldCheck,
            link: '/rbac',
            variant: 'warning',
          },
        ]}
      />

      <div className="d-flex flex-column gap-3">
        {/* Summary Metric Cards */}
        <Row className="g-3">
          {infoCards.map((card) => (
            <Col key={card.label} sm={6} lg={3}>
              <InfoCard {...card} />
            </Col>
          ))}
        </Row>

        {/* Quick Academic Setup Modules */}
        <Card className="border shadow-none">
          <Card.Header className="bg-transparent py-2.5 px-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <School size={16} className="text-primary" />
              <span className="fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                Academic Modules
              </span>
            </div>
            {onNavigate && (
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none text-primary d-flex align-items-center gap-1"
                onClick={() => onNavigate('academic-setup')}
                style={{ fontSize: '0.8rem' }}
              >
                View All <ArrowRight size={12} />
              </Button>
            )}
          </Card.Header>
          <Card.Body className="p-3">
            <Row className="g-2">
              {setupChips.map((chip) => (
                <Col key={chip.title} xs={6} sm={4} lg={2}>
                  <ChipCard
                    title={chip.title}
                    description={chip.description}
                    icon={chip.icon}
                    iconColor={chip.iconColor}
                    onClick={() => navigate(chip.action)}
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* System Invariant & Integrity Checks */}
        <Card className="border shadow-none">
          <Card.Header className="bg-transparent py-2.5 px-3 d-flex align-items-center gap-2">
            <Database size={16} className="text-success" />
            <span className="fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              {t.dashboard.invariantsTitle}
            </span>
          </Card.Header>
          <Card.Body className="p-3">
            <Row className="g-2.5">
              {inventoryChips.map((chip) => (
                <Col key={chip.title} md={6}>
                  <ChipCard
                    {...chip}
                    // className="p-2.5 rounded border bg-light d-flex align-items-start gap-2"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

const setupChips = [
  {
    title: 'Profile',
    description: 'Campus & Legal',
    icon: Building2,
    iconColor: 'text-primary',
    action: 'school-profile',
  },
  {
    title: 'Sessions',
    description: 'Terms & Dates',
    icon: CalendarRange,
    iconColor: 'text-primary',
    action: 'academic-years',
  },
  {
    title: 'Classes',
    description: 'Rosters & Sections',
    icon: Layers,
    iconColor: 'text-primary',
    action: 'classes',
  },
  {
    title: 'Curriculum',
    description: 'Courses & Subjects',
    icon: BookOpenCheck,
    iconColor: 'text-success',
    action: 'curriculum',
  },
  {
    title: 'Faculty',
    description: 'Teachers & Incharges',
    icon: UserCheck,
    iconColor: 'text-danger',
    action: 'teachers',
  },
  {
    title: 'Timetable',
    description: 'Periods & Generator',
    icon: CalendarDays,
    iconColor: 'text-warning',
    action: 'timetable',
  },
];
