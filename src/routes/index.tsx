import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LazyLoad from '@/components/common/Loadable';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from 'react-bootstrap';
import { PageLayout } from '@/components/PageLayout';
import { LoginModal } from '@/components/pages/LoginModal';

// Feature Module Route Bundles
import { AcademicRoutes } from '@/components/pages/academic';
import { TimetableRoutes } from '@/components/pages/timetable';
import { StudentRoutes } from '@/components/pages/students';
import { AdmissionRoutes } from '@/components/pages/admissions';
import { TeacherRoutes } from '@/components/pages/teachers';

// Standalone Core Views
const DashboardView = LazyLoad(() =>
  import('@/components/pages/DashboardView').then((m) => ({ default: m.DashboardView })),
);

const RbacManagementView = LazyLoad(() =>
  import('@/components/pages/RbacManagementView').then((m) => ({ default: m.RbacManagementView })),
);

const PlaceholderView = LazyLoad(() =>
  import('@/components/PageLayout/components/PlaceholderView').then((m) => ({
    default: m.PlaceholderView,
  })),
);

/**
 * Route Configuration Item Interface
 */
export interface RouteConfig {
  path?: string;
  index?: boolean;
  component?: React.ComponentType<any>;
  element?: React.ReactElement;
  redirectTo?: string;
  breadcrumb?: string;
  section?: string;
}

/**
 * Public routes: rendered outside PageLayout (no auth required)
 */
export const publicRoutes: RouteConfig[] = [{ path: '/login', component: LoginModal }];

/**
 * Protected routes: rendered within ProtectedRouteLayout -> PageLayout -> Outlet
 */
export const protectedRoutes: RouteConfig[] = [
  { path: '', index: true, component: DashboardView, breadcrumb: 'Dashboard' },
  { path: 'dashboard', component: DashboardView, breadcrumb: 'Dashboard' },
  {
    path: 'rbac',
    component: RbacManagementView,
    breadcrumb: 'Roles & Permissions',
    section: 'Administration',
  },
  // Feature module bundles (centralized registration)
  { path: 'academic/*', component: AcademicRoutes, breadcrumb: 'Academics' },
  { path: 'timetable/*', component: TimetableRoutes, breadcrumb: 'Timetable' },
  { path: 'students/*', component: StudentRoutes, breadcrumb: 'Students' },
  { path: 'teachers/*', component: TeacherRoutes, breadcrumb: 'Teachers' },
  { path: 'admissions/*', component: AdmissionRoutes, breadcrumb: 'Admissions' },
  { path: 'promotions', element: <Navigate to="/admissions/promote" replace /> },

  // Dynamic catch-all for remaining ERP navigation modules
  { path: ':moduleSlug', component: PlaceholderView },
];

/**
 * Protected Layout Route wrapper:
 * Keeps all top-level routes outside PageLayout, allowing Public/Private/Protected
 * routing separation. Only authenticated users enter PageLayout.
 */
export const ProtectedRouteLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body text-body d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  return <PageLayout />;
};

/**
 * Helper to render a route from a RouteConfig definition
 */
const renderRoute = (route: RouteConfig, indexKey: string | number) => {
  let elementToRender: React.ReactElement;

  if (route.redirectTo) {
    elementToRender = <Navigate to={route.redirectTo} replace />;
  } else if (route.element) {
    elementToRender = route.element;
  } else if (route.component) {
    const Component = route.component;
    elementToRender = <Component />;
  } else {
    elementToRender = <></>;
  }

  if (route.index) {
    return <Route key={`index-${indexKey}`} index element={elementToRender} />;
  }

  return (
    <Route key={route.path || `route-${indexKey}`} path={route.path} element={elementToRender} />
  );
};

/**
 * Main Application Routes component:
 * Loops through JSON route definitions for clean and scalable architecture.
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Routes mapped from JSON */}
      {publicRoutes.map((route, idx) => renderRoute(route, idx))}

      {/* 2. Protected Routes mapped from JSON inside ProtectedRouteLayout */}
      <Route element={<ProtectedRouteLayout />}>
        {protectedRoutes.map((route, idx) => renderRoute(route, idx))}
      </Route>

      {/* 3. Global Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
