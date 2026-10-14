import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyLoad } from '@/components/common';

// Modular Academic Sub-Views
const AcademicSetup = LazyLoad(() =>
  import('./AcademicSetupDashboard').then((m) => ({ default: m.AcademicSetupDashboard })),
);

const AcademicAllocator = LazyLoad(() =>
  import('./SmartAcademicAllocator').then((m) => ({ default: m.SmartAcademicAllocator })),
);

const EasyAcademic = LazyLoad(() =>
  import('./EasyAcademicHub').then((m) => ({ default: m.EasyAcademicHub })),
);

const SchoolProfile = LazyLoad(() =>
  import('./SchoolProfileView').then((m) => ({ default: m.SchoolProfileView })),
);

const AcademicYears = LazyLoad(() =>
  import('./AcademicYearsView').then((m) => ({ default: m.AcademicYearsView })),
);

const ClassesManagement = LazyLoad(() =>
  import('./ClassesManagementView').then((m) => ({ default: m.ClassesManagementView })),
);

const CurriculumManagement = LazyLoad(() =>
  import('./CurriculumManagementView').then((m) => ({ default: m.CurriculumManagementView })),
);

const TeacherAssignments = LazyLoad(() =>
  import('./TeacherAssignmentsView').then((m) => ({ default: m.TeacherAssignmentsView })),
);

const TimetableManagement = LazyLoad(() =>
  import('./TimetableManagementView').then((m) => ({ default: m.TimetableManagementView })),
);

const AcademicHub = LazyLoad(() =>
  import('./AcademicModuleHub').then((m) => ({ default: m.AcademicModuleHub })),
);

export interface SubRouteConfig {
  path?: string;
  index?: boolean;
  component?: React.ComponentType<any>;
  redirectTo?: string;
  breadcrumb?: string;
}

export const academicRoutes: SubRouteConfig[] = [
  { index: true, component: AcademicSetup, breadcrumb: 'Setup' },
  { path: 'setup', component: AcademicSetup, breadcrumb: 'Setup' },
  { path: 'academic-setup', redirectTo: 'setup' },
  { path: 'allocator', component: AcademicAllocator, breadcrumb: 'Allocator' },
  { path: 'quick', component: EasyAcademic, breadcrumb: 'Quick Hub' },
  { path: 'profile', component: SchoolProfile, breadcrumb: 'School Profile' },
  { path: 'school-profile', redirectTo: 'profile' },
  { path: 'years', component: AcademicYears, breadcrumb: 'Academic Sessions' },
  { path: 'academic-years', redirectTo: 'years' },
  { path: 'classes', component: ClassesManagement, breadcrumb: 'Classes & Sections' },
  { path: 'curriculum', component: CurriculumManagement, breadcrumb: 'Curriculum' },
  { path: 'teachers', component: TeacherAssignments, breadcrumb: 'Teacher Assignments' },
  { path: 'schedules', component: TimetableManagement, breadcrumb: 'Schedules' },
  { path: 'hub', component: AcademicHub, breadcrumb: 'Academic Hub' },
];

export const AcademicRoutes: React.FC = () => {
  return (
    <Routes>
      {academicRoutes.map((route, idx) => {
        if (route.redirectTo) {
          return (
            <Route
              key={route.path || `redirect-${idx}`}
              path={route.path}
              element={<Navigate to={route.redirectTo} replace />}
            />
          );
        }
        const Component = route.component!;
        if (route.index) {
          return <Route key="index" index element={<Component />} />;
        }
        return (
          <Route key={route.path || `route-${idx}`} path={route.path} element={<Component />} />
        );
      })}
      <Route path="*" element={<Navigate to="setup" replace />} />
    </Routes>
  );
};

export default AcademicRoutes;
