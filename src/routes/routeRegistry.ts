import { studentSubRoutes } from '@/components/pages/students';
import { teacherSubRoutes } from '@/components/pages/teachers';
import { admissionSubRoutes } from '@/components/pages/admissions';
import { academicRoutes } from '@/components/pages/academic';
import { timetableRoutes } from '@/components/pages/timetable';
import { APP_NAVIGATION } from '@/data/navigation-data';

export interface RouteRegistryItem {
  pattern: string;
  breadcrumb: string;
  section?: string;
}

/**
 * Dynamically builds a flat route registry from modular route configurations
 * and navigation metadata for scalable SaaS route resolution.
 */
export function getRouteRegistry(): RouteRegistryItem[] {
  const registry: RouteRegistryItem[] = [
    { pattern: '/dashboard', breadcrumb: 'Dashboard' },
    { pattern: '/rbac', breadcrumb: 'Roles & Permissions', section: 'Administration' },
  ];

  // 1. Students module sub-routes
  registry.push({ pattern: '/students', breadcrumb: 'Students' });
  studentSubRoutes.forEach((route) => {
    if (route.index) {
      registry.push({ pattern: '/students', breadcrumb: route.breadcrumb || 'Students' });
    } else if (route.path) {
      registry.push({
        pattern: `/students/${route.path.replace(/^\//, '')}`,
        breadcrumb: route.breadcrumb || 'View',
      });
    }
  });

  // 2. Teachers module sub-routes
  registry.push({ pattern: '/teachers', breadcrumb: 'Teachers' });
  teacherSubRoutes.forEach((route) => {
    if (route.index) {
      registry.push({ pattern: '/teachers', breadcrumb: route.breadcrumb || 'Teachers' });
    } else if (route.path) {
      registry.push({
        pattern: `/teachers/${route.path.replace(/^\//, '')}`,
        breadcrumb: route.breadcrumb || 'View',
      });
    }
  });

  // 3. Admissions module sub-routes
  registry.push({ pattern: '/admissions', breadcrumb: 'Admissions' });
  admissionSubRoutes.forEach((route) => {
    if (route.index) {
      registry.push({ pattern: '/admissions', breadcrumb: route.breadcrumb || 'Admissions' });
    } else if (route.path) {
      registry.push({
        pattern: `/admissions/${route.path.replace(/^\//, '')}`,
        breadcrumb: route.breadcrumb || humanize(route.path),
      });
    }
  });

  // 4. Academic module sub-routes
  registry.push({ pattern: '/academic', breadcrumb: 'Academics' });
  academicRoutes.forEach((route) => {
    if (route.index) {
      registry.push({ pattern: '/academic', breadcrumb: route.breadcrumb || 'Academics' });
    } else if (route.path) {
      registry.push({
        pattern: `/academic/${route.path.replace(/^\//, '')}`,
        breadcrumb: route.breadcrumb || humanize(route.path),
      });
    }
  });

  // 3. Timetable module sub-routes
  registry.push({ pattern: '/timetable', breadcrumb: 'Timetable' });
  timetableRoutes.forEach((route) => {
    if (route.index) {
      registry.push({ pattern: '/timetable', breadcrumb: route.breadcrumb || 'Timetable' });
    } else if (route.path) {
      registry.push({
        pattern: `/timetable/${route.path.replace(/^\//, '')}`,
        breadcrumb: route.breadcrumb || humanize(route.path),
      });
    }
  });

  // 4. Global ERP navigation items
  APP_NAVIGATION.forEach((nav) => {
    const cleanPath = nav.path.startsWith('/') ? nav.path : `/${nav.path}`;
    // Avoid overwriting if already defined
    if (!registry.some((r) => r.pattern === cleanPath)) {
      registry.push({
        pattern: cleanPath,
        breadcrumb: nav.defaultLabel,
        section:
          nav.defaultSection && nav.defaultSection !== 'Overview' ? nav.defaultSection : undefined,
      });
    }
  });

  return registry;
}

function humanize(str: string): string {
  if (!str) return '';
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
