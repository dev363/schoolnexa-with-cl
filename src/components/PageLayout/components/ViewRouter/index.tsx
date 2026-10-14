import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import LazyLoad from '@/components/common/Loadable';

const DashboardView = LazyLoad(() =>
  import('@/components/pages/DashboardView').then((m) => ({ default: m.DashboardView })),
);
const RbacManagementView = LazyLoad(() =>
  import('@/components/pages/RbacManagementView').then((m) => ({ default: m.RbacManagementView })),
);
const AcademicModuleHub = LazyLoad(() =>
  import('@/components/pages/academic/AcademicModuleHub').then((m) => ({
    default: m.AcademicModuleHub,
  })),
);
const PlaceholderView = LazyLoad(() =>
  import('@/components/PageLayout/components/PlaceholderView').then((m) => ({
    default: m.PlaceholderView,
  })),
);

export interface ViewRouterProps {
  currentView?: string;
  onNavigate?: (viewId: string) => void;
}

const PlaceholderWrapper: React.FC<{ onNavigate?: (viewId: string) => void }> = ({
  onNavigate,
}) => {
  const { viewId } = useParams<{ viewId: string }>();
  return <PlaceholderView viewId={viewId || 'dashboard'} onNavigate={onNavigate || (() => {})} />;
};

export const ViewRouter: React.FC<ViewRouterProps> = ({ onNavigate }) => {
  const handleNav = onNavigate || (() => {});

  return (
    <Routes>
      {/* Dashboard & Overview */}
      <Route path="/" element={<DashboardView onNavigate={handleNav} />} />
      <Route path="/dashboard" element={<DashboardView onNavigate={handleNav} />} />

      {/* RBAC Administration */}
      <Route
        path="/rbac"
        element={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RbacManagementView />
          </div>
        }
      />

      {/* Academic Hub specific routes */}
      <Route
        path="/academic-setup"
        element={<AcademicModuleHub key="academic-overview" initialTab="overview" />}
      />
      <Route
        path="/school-profile"
        element={<AcademicModuleHub key="academic-profile" initialTab="profile" />}
      />
      <Route
        path="/academic-years"
        element={<AcademicModuleHub key="academic-years" initialTab="academic-years" />}
      />
      <Route
        path="/classes"
        element={<AcademicModuleHub key="academic-classes" initialTab="classes" />}
      />
      <Route
        path="/curriculum"
        element={<AcademicModuleHub key="academic-curriculum" initialTab="curriculum" />}
      />
      <Route
        path="/teachers"
        element={<AcademicModuleHub key="academic-teachers" initialTab="teachers" />}
      />
      <Route
        path="/timetable"
        element={<AcademicModuleHub key="academic-timetable" initialTab="timetable" />}
      />
      <Route
        path="/timetable-generator"
        element={<AcademicModuleHub key="academic-generator" initialTab="generator" />}
      />
      <Route
        path="/easy-academic"
        element={<AcademicModuleHub key="academic-easy" initialTab="easy-access" />}
      />
      <Route
        path="/academic-allocator"
        element={<AcademicModuleHub key="academic-allocator" initialTab="allocator" />}
      />

      {/* Dynamic route fallback for remaining ERP modules */}
      <Route path="/:viewId" element={<PlaceholderWrapper onNavigate={handleNav} />} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ViewRouter;
