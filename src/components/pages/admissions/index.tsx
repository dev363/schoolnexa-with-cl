import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LazyLoad } from '@/components/common';

// Modular Lazy Loaded Views
const AdmissionDashboard = LazyLoad(() =>
  import('./AdmissionDashboardView').then((m) => ({ default: m.AdmissionDashboardView })),
);

const NewAdmission = LazyLoad(() =>
  import('./NewAdmissionView').then((m) => ({ default: m.NewAdmissionView })),
);

const PromoteStudents = LazyLoad(() =>
  import('./PromoteStudentsView').then((m) => ({ default: m.PromoteStudentsView })),
);

const RepeatStudents = LazyLoad(() =>
  import('./RepeatStudentsView').then((m) => ({ default: m.RepeatStudentsView })),
);

const TransferStudent = LazyLoad(() =>
  import('./TransferStudentView').then((m) => ({ default: m.TransferStudentView })),
);

const BulkEnrollment = LazyLoad(() =>
  import('./BulkEnrollmentView').then((m) => ({ default: m.BulkEnrollmentView })),
);

const EnrollmentDetail = LazyLoad(() =>
  import('./EnrollmentDetailView').then((m) => ({ default: m.EnrollmentDetailView })),
);

export interface SubRouteConfig {
  path?: string;
  index?: boolean;
  component: React.ComponentType<any>;
  breadcrumb?: string;
}

export const admissionSubRoutes: SubRouteConfig[] = [
  { index: true, component: AdmissionDashboard, breadcrumb: 'Admissions' },
  { path: 'new', component: NewAdmission, breadcrumb: 'New Admission' },
  { path: 'add', component: NewAdmission, breadcrumb: 'New Admission' },
  { path: 'promote', component: PromoteStudents, breadcrumb: 'Promote' },
  { path: 'repeat', component: RepeatStudents, breadcrumb: 'Repeat' },
  { path: 'transfer', component: TransferStudent, breadcrumb: 'Transfer' },
  { path: 'bulk', component: BulkEnrollment, breadcrumb: 'Bulk Enrollment' },
  { path: 'view/:enrollmentId', component: EnrollmentDetail, breadcrumb: 'View' },
];

const AdmissionLegacyViewRedirect: React.FC = () => {
  const { enrollmentId } = useParams();
  return <Navigate to={`/admissions/view/${enrollmentId}`} replace />;
};

export const AdmissionRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdmissionDashboard />} />
      <Route path="new" element={<NewAdmission />} />
      <Route path="add" element={<NewAdmission />} />
      <Route path="promote" element={<PromoteStudents />} />
      <Route path="repeat" element={<RepeatStudents />} />
      <Route path="transfer" element={<TransferStudent />} />
      <Route path="bulk" element={<BulkEnrollment />} />
      <Route path="view/:enrollmentId" element={<EnrollmentDetail />} />

      {/* Backward-compatibility redirect for legacy URL pattern */}
      <Route path=":enrollmentId" element={<AdmissionLegacyViewRedirect />} />
    </Routes>
  );
};

export default AdmissionRoutes;
