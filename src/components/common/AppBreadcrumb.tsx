import React, { useMemo } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { useLocation, matchPath, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { getRouteRegistry, RouteRegistryItem } from '@/routes/routeRegistry';

export interface BreadcrumbCrumb {
  label: string;
  path?: string;
  active?: boolean;
}

export interface AppBreadcrumbProps {
  customCrumbs?: BreadcrumbCrumb[];
  className?: string;
}

/**
 * Checks if a path segment represents an entity ID or numeric identifier
 */
function isEntityIdentifier(segment: string): boolean {
  if (!segment) return false;
  if (/^[0-9]+$/.test(segment)) return true;
  if (/^[a-z]{2,4}-[0-9a-zA-Z]+$/i.test(segment)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  return false;
}

function humanize(str: string): string {
  if (!str) return '';
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Finds the matching route item in the registry for a given pathname
 */
function findMatchingRoute(
  registry: RouteRegistryItem[],
  pathname: string,
): RouteRegistryItem | undefined {
  // 1. Direct exact match
  const exact = registry.find((r) => r.pattern === pathname);
  if (exact) return exact;

  // 2. Pattern match for parameterized routes (e.g. /students/:studentId, /students/:studentId/edit)
  for (const item of registry) {
    if (item.pattern.includes(':')) {
      const match = matchPath({ path: item.pattern, end: true }, pathname);
      if (match) {
        return item;
      }
    }
  }

  return undefined;
}

export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ customCrumbs, className = '' }) => {
  const location = useLocation();
  const pathname = location.pathname;

  // Memoize route registry
  const registry = useMemo(() => getRouteRegistry(), []);

  // Return custom crumbs if explicitly provided
  if (customCrumbs && customCrumbs.length > 0) {
    return renderBreadcrumbs(customCrumbs, className);
  }

  // Dashboard root does not display redundant breadcrumbs
  if (pathname === '/' || pathname === '/dashboard') {
    return null;
  }

  const segments = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const crumbs: BreadcrumbCrumb[] = [
    {
      label: 'Home',
      path: '/dashboard',
    },
  ];

  let currentSubPath = '';
  let sectionAdded = false;

  // Actions that act as prefixes for an entity identifier (e.g. /teachers/edit/TCH-001 or /students/view/STD-001)
  const ACTION_PREFIXES = new Set(['edit', 'view', 'details', 'detail']);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentSubPath += `/${segment}`;
    const isLast = i === segments.length - 1;

    // If this segment is an action prefix (like 'edit', 'view') and NOT the last segment
    // (e.g. /teachers/edit/TCH-001), skip generating an intermediate breadcrumb for the prefix
    // itself to avoid duplicate 'Edit / Edit' or 'View / View'.
    if (ACTION_PREFIXES.has(segment.toLowerCase()) && !isLast) {
      continue;
    }

    // Dynamically match against route definitions
    const matchedRoute = findMatchingRoute(registry, currentSubPath);

    // If root route contains an organizational section (e.g. Administration), add section once
    if (i === 0 && matchedRoute?.section && !sectionAdded) {
      crumbs.push({ label: matchedRoute.section });
      sectionAdded = true;
    }

    // Dynamic resolution of breadcrumb label
    let label = matchedRoute?.breadcrumb;

    // SaaS Standard Rule for view/edit/add actions:
    // In view and edit, show clean action labels rather than arbitrary names/IDs
    if (segment === 'edit') {
      label = 'Edit';
    } else if (segment === 'view') {
      label = 'View';
    } else if (segment === 'add' || segment === 'create') {
      label = 'Add';
    } else if (!label) {
      if (isEntityIdentifier(segment)) {
        label = 'View';
      } else {
        label = humanize(segment);
      }
    }

    crumbs.push({
      label: label || humanize(segment),
      path: isLast ? undefined : currentSubPath,
      active: isLast,
    });
  }

  // Deduplicate consecutive crumbs with identical or redundant labels (e.g. 'Edit' / 'Edit', 'View' / 'View')
  const deduplicatedCrumbs: BreadcrumbCrumb[] = [];
  for (const crumb of crumbs) {
    const prev = deduplicatedCrumbs[deduplicatedCrumbs.length - 1];
    if (prev && prev.label.trim().toLowerCase() === crumb.label.trim().toLowerCase()) {
      if (crumb.active) {
        prev.active = true;
        prev.path = undefined;
      }
      continue;
    }
    deduplicatedCrumbs.push(crumb);
  }

  return renderBreadcrumbs(deduplicatedCrumbs, className);
};

function renderBreadcrumbs(crumbs: BreadcrumbCrumb[], className: string) {
  return (
    <nav aria-label="breadcrumb" className={`app-breadcrumb py-1 ${className}`}>
      <Breadcrumb className="mb-0">
        {crumbs.map((crumb, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === crumbs.length - 1 || crumb.active;

          if (isLast) {
            return (
              <Breadcrumb.Item
                key={`${crumb.label}-${idx}`}
                active
                className="text-truncate"
                style={{ maxWidth: '240px' }}
              >
                {isFirst && <Home size={13} className="me-1 d-inline align-baseline" />}
                <span>{crumb.label}</span>
              </Breadcrumb.Item>
            );
          }

          return (
            <Breadcrumb.Item
              key={`${crumb.label}-${idx}`}
              linkAs={Link}
              linkProps={{ to: crumb.path || '#' }}
              className="text-truncate"
              style={{ maxWidth: '200px' }}
            >
              {isFirst && <Home size={13} className="me-1 d-inline align-baseline" />}
              <span>{crumb.label}</span>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </nav>
  );
}

export default AppBreadcrumb;
