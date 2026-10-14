import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import LazyLoad from '@/components/common/Loadable';

// Modular Lazy Loaded Views
const StudentList = LazyLoad(() =>
  import('./StudentListView').then((m) => ({ default: m.StudentListView })),
);
const StudentCreate = LazyLoad(() =>
  import('./StudentCreateView').then((m) => ({ default: m.StudentCreateView })),
);
const StudentProfile = LazyLoad(() =>
  import('./StudentProfileView').then((m) => ({ default: m.StudentProfileView })),
);
const StudentEdit = LazyLoad(() =>
  import('./StudentEditView').then((m) => ({ default: m.StudentEditView })),
);

export interface SubRouteConfig {
  path?: string;
  index?: boolean;
  component: React.ComponentType<any>;
  breadcrumb?: string;
}

export const studentSubRoutes: SubRouteConfig[] = [
  { index: true, component: StudentList, breadcrumb: 'Students' },
  { path: 'add', component: StudentCreate, breadcrumb: 'Add' },
  { path: 'view/:studentId', component: StudentProfile, breadcrumb: 'View' },
  { path: 'edit/:studentId', component: StudentEdit, breadcrumb: 'Edit' },
];

const StudentLegacyViewRedirect: React.FC = () => {
  const { studentId } = useParams();
  return <Navigate to={`/students/view/${studentId}`} replace />;
};

const StudentLegacyEditRedirect: React.FC = () => {
  const { studentId } = useParams();
  return <Navigate to={`/students/edit/${studentId}`} replace />;
};

export const StudentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<StudentList />} />
      <Route path="add" element={<StudentCreate />} />
      <Route path="view/:studentId" element={<StudentProfile />} />
      <Route path="edit/:studentId" element={<StudentEdit />} />
    </Routes>
  );
};

export default StudentRoutes;
