import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoad } from '@/components/common';

// Timetable Sub-Views
const TimeTable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="MANAGE" />,
  })),
);

const TeacherTimetable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="TEACHER" />,
  })),
);

const ClassTimetable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="CLASS" />,
  })),
);

const RoomTimetable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="SESSION" />,
  })),
);

const ConflictsTimetable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="CONFLICTS" />,
  })),
);

const GeneratorTimetable = LazyLoad(() =>
  import('@/components/pages/academic/TimetableManagementView').then((m) => ({
    default: () => <m.TimetableManagementView initialView="GENERATOR" />,
  })),
);

export interface SubRouteConfig {
  path?: string;
  index?: boolean;
  component: React.ComponentType<any>;
  breadcrumb?: string;
}

export const timetableRoutes: SubRouteConfig[] = [
  { index: true, component: TimeTable, breadcrumb: 'Overview' },
  { path: 'teacher', component: TeacherTimetable, breadcrumb: 'Teacher Timetable' },
  { path: 'class', component: ClassTimetable, breadcrumb: 'Class Timetable' },
  { path: 'room', component: RoomTimetable, breadcrumb: 'Room Timetable' },
  { path: 'conflicts', component: ConflictsTimetable, breadcrumb: 'Conflict Auditor' },
  { path: 'generator', component: GeneratorTimetable, breadcrumb: 'Schedule Generator' },
];

export const TimetableRoutes: React.FC = () => {
  return (
    <Routes>
      {timetableRoutes.map((route, idx) => {
        const Component = route.component;
        if (route.index) {
          return <Route key="index" index element={<Component />} />;
        }
        return (
          <Route key={route.path || `route-${idx}`} path={route.path} element={<Component />} />
        );
      })}
    </Routes>
  );
};

export default TimetableRoutes;
