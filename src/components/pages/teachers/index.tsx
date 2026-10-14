import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LazyLoad } from '@/components/common';

// Modular Lazy Loaded Teacher Views
const TeacherList = LazyLoad(() => import('./List'));
const TeacherCreate = LazyLoad(() => import('./Add'));
const TeacherProfile = LazyLoad(() => import('./View'));
const TeacherEdit = LazyLoad(() => import('./Edit'));

export interface TeacherSubRouteConfig {
  path?: string;
  index?: boolean;
  component: React.ComponentType<any>;
  breadcrumb?: string;
}

export const teacherSubRoutes: TeacherSubRouteConfig[] = [
  { index: true, component: TeacherList, breadcrumb: 'Teachers' },
  { path: 'add', component: TeacherCreate, breadcrumb: 'Add' },
  { path: 'view/:teacherId', component: TeacherProfile, breadcrumb: 'View' },
  { path: 'edit/:teacherId', component: TeacherEdit, breadcrumb: 'Edit' },
];

export const TeacherRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<TeacherList />} />
      <Route path="add" element={<TeacherCreate />} />
      <Route path="view/:teacherId" element={<TeacherProfile />} />
      <Route path="edit/:teacherId" element={<TeacherEdit />} />
    </Routes>
  );
};

export default TeacherRoutes;
