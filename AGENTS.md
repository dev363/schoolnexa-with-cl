# SchoolNexa Project Standards & Agent Directives

These guidelines are **mandatory** for all future module implementations, feature development, UI work, backend integration, bug fixes, and code refactoring within SchoolNexa.

The existing SchoolNexa codebase is the primary source of truth. New implementations must follow established architecture, components, APIs, styling, routing, loading, state-management, and UX patterns.

---

# 1. Core Development Directive

You will always:

- Follow the existing SchoolNexa architecture and coding patterns.
- Treat existing SchoolNexa code as the source of truth.
- Reuse existing components, services, hooks, utilities, and patterns whenever possible.
- Search the existing codebase before creating anything new.
- Preserve existing functionality.
- Avoid unnecessary rewrites.
- Avoid unnecessary refactoring.
- Avoid introducing new architectural patterns without a clear requirement.
- Keep implementations simple, focused, maintainable, and production-ready.
- Follow established naming and folder conventions.
- Prefer consistency with the existing application over personal coding preferences.

The following commits represent established SchoolNexa standards:

- `4dedd9d` — internal import alias/path standard
- `b111ce7` — component and lazy-loading pattern
- `4e944f8` — initial loading/spinner implementation
- `ca9002c` — `Loadable` lazy-loading HOC pattern

Do not bypass, replace, or revert these established patterns unless explicitly instructed.

---

# 2. Source of Truth Rule

Existing SchoolNexa code is the source of truth.

Priority order:

1. Existing SchoolNexa pattern
2. Reuse existing SchoolNexa components/services/utilities
3. React-Bootstrap
4. Small focused components
5. Minimal state
6. Simple implementation
7. Responsive UI
8. No unnecessary abstraction
9. No unnecessary dependency

Do not introduce a new implementation simply because another approach appears theoretically cleaner.

Consistency with the existing SchoolNexa application is more important than introducing personal implementation preferences.

---

# 3. Internal Import Rules — MANDATORY

All internal SchoolNexa imports MUST use the `@/` alias.

### Correct

```tsx
import { TopHeader } from '@/components/common';
import { useToast } from '@/context/ToastContext';
import { StudentService } from '@/services/studentService';
```

### Incorrect

```tsx
import { TopHeader } from '../../../components/common';
import { useToast } from '../../context/ToastContext';
```

Never use long relative imports such as:

```text
../../../components/...
../../../../services/...
../../context/...
```

Do not introduce another internal import alias.

The existing `@/` alias is the approved internal import convention.

---

# 4. UI Framework — STRICT

React-Bootstrap is the **primary and default UI framework** for SchoolNexa.

Use React-Bootstrap first for:

- Layout
- Container
- Row
- Col
- Forms
- Inputs
- Buttons
- Modals
- Dropdowns
- Tables
- Alerts
- Tabs
- Cards
- Spinners
- Pagination
- Collapse
- Navigation
- Badges

Prefer React-Bootstrap components over recreating equivalent UI.

Do NOT create custom equivalents such as:

```text
CustomModal
CustomButton
CustomForm
CustomDropdown
CustomCard
CustomCollapse
```

when React-Bootstrap already provides the required functionality.

Do not introduce another UI library or framework.

---

# 5. Tailwind Usage

Tailwind may be used only when necessary for styling that is not conveniently handled by existing React-Bootstrap classes.

React-Bootstrap remains the primary UI system.

Do not:

- Convert Bootstrap-based UI into Tailwind-only implementations.
- Introduce a competing design system.
- Replace existing Bootstrap patterns unnecessarily.

Use the minimum Tailwind necessary when it genuinely improves the implementation.

---

# 6. Page Header Standard — `TopHeader` MANDATORY

Whenever creating or modifying any module view or page, you MUST use the standardized `TopHeader`.

Import it using:

```tsx
import { TopHeader } from '@/components/common';
```

Do NOT build:

- Custom header cards
- Hero headers
- Ad-hoc header rows
- Duplicate page-header implementations

---

## 6.1 `TopHeader` Props

Use the established props:

- `title` — Page title string
- `icon` — Lucide icon component
- `subtitle` — Descriptive page subtitle or link
- `badges` — Array of `{ bg: string, label: string }`
- `actions` — Array of action button configurations
- `rightContent` — Complex controls such as filters, navigation pills, switchers, or custom button groups

Example:

```tsx
<TopHeader
  title="Timetable Management"
  icon={CalendarDays}
  subtitle="Class + Section is the single source of truth."
  badges={[
    {
      bg: 'primary',
      label: activeAcademicYear?.name || 'Active Session',
    },
    {
      bg: 'secondary',
      label: activeSchool?.name || 'School',
    },
  ]}
  actions={[
    {
      name: 'Export',
      icon: Printer,
      action: handlePrint,
      variant: 'outline-secondary',
    },
    {
      name: 'New Period',
      icon: Plus,
      action: handleAddPeriod,
      variant: 'primary',
    },
  ]}
  rightContent={<FilterPills />}
/>
```

---

# 7. `TopHeader` Preservation Rule — SOURCE OF TRUTH

The current `TopHeader` implementation is an approved SchoolNexa component.

DO NOT:

- Modify it
- Refactor it
- Replace it
- Revert it
- Restyle it
- Normalize it
- Change its structure

unless the user explicitly requests that change.

Preserve:

- Spacing
- Sizing
- Alignment
- Typography
- Bootstrap classes
- Responsive behavior
- Colors
- Icons
- Component structure
- Existing behavior

Do not "improve" the current implementation based on assumptions.

Before changing anything related to a page header:

1. Inspect the existing `TopHeader`.
2. Follow its established usage pattern.
3. Reuse it.
4. Do not create an alternative header implementation.

If a new requirement conflicts with the established `TopHeader` pattern, ask before changing the established pattern.

---

# 8. ActionButton Standard — MANDATORY

SchoolNexa has an established `ActionButton` API.

Preserve this API exactly.

`ActionButton` props are:

```text
name
icon
action
link
variant
size
disabled
loading
title
className
iconOnly
```

The `ActionButton` API does NOT use:

```text
children
onClick
```

Do not pass unsupported `children` or `onClick` props.

### Correct

```tsx
{
  name: 'Add',
  icon: Plus,
  action: handleAdd,
  variant: 'primary',
}
```

Navigation:

```tsx
{
  name: 'View',
  icon: Eye,
  link: `/students/view/${studentId}`,
  variant: 'outline-primary',
}
```

---

# 9. `ActionButtonGroup` Standard

Use the existing `ActionButtonGroup` when multiple action buttons are required.

It accepts:

```text
actions: ActionButtonProps[]
```

and renders:

```tsx
<ActionButton {...action} />
```

Do not create another action-button abstraction when the existing `ActionButtonGroup` solves the requirement.

Preserve the existing `ActionButton` API.

---

# 10. Standardized Summary Cards — `InfoCard`

For metrics, statistics, summary information, and dashboard-style values, use:

```tsx
import { InfoCard } from '@/components/common';
```

Use `InfoCard` for appropriate summary/metric blocks such as:

- Total Students
- Total Teachers
- Active Classes
- Pending Admissions
- Total Subjects
- Attendance Summary
- Financial Summary

Do not create duplicate custom metric-card implementations.

---

# 11. Standardized Navigation Cards — `ChipCard`

For quick navigation, category shortcuts, and clickable module chips, use:

```tsx
import { ChipCard } from '@/components/common';
```

Do NOT create custom nested button cards when `ChipCard` already provides the required behavior.

Reuse existing SchoolNexa navigation patterns.

---

# 12. Feedback & Notifications — `useToast` MANDATORY

Always use:

```tsx
import { useToast } from '@/context/ToastContext';
```

for:

- CRUD responses
- Network alerts
- Save/update/delete results
- Validation-related operational messages
- Import/export results
- Assignment results
- Generation results
- Other operational feedback

Available methods:

```tsx
toast.success(message, title?)
toast.error(message, title?)
toast.warning(message, title?)
toast.info(message, title?)
```

Example:

```tsx
const { toast } = useToast();

toast.success('Student created successfully.');
toast.error('Unable to save student.');
toast.warning('Please select a class.');
toast.info('Timetable generation started.');
```

Do not create another toast/notification system.

---

# 13. Existing Toast System

The existing toast system supports:

- Automatic close
- Individual close
- Close-all
- Programmatic clearing

Existing automatic dismissal includes preset delays, such as:

- Success: approximately 4 seconds
- Error: approximately 6 seconds

Each toast can be individually removed using:

```text
removeToast(id)
```

The toast container provides a bulk "Close all" button when more than one notification exists.

Programmatic clearing is available through:

```text
clearAllToasts()
```

Do not replace or duplicate this system.

---

# 14. Component Structure

All components should be:

- Small
- Focused
- Maintainable
- Reusable where appropriate
- Easy to understand
- Easy to maintain

Each component should have one clear primary responsibility.

---

# 15. Split Large Components

If a component contains multiple independent responsibilities, split it.

Split components when they contain multiple:

- Forms
- Features
- Lists
- Modals
- Selectors
- Tables
- Independent sections
- Independent workflows

Follow existing patterns such as:

```text
src/components/AppHeader/
src/components/SchoolManage/
src/components/AcademicYearManage/
src/components/LanguageManager/
src/components/Notification/
src/components/User/
```

The parent component should handle:

- Composition
- Coordination
- Shared state where genuinely required

Child components should handle focused responsibilities.

Avoid large monolithic components.

---

# 16. State Management — MINIMAL STATE

Use the minimum amount of React state required.

Only use `useState` when:

- The value changes over time
- The UI needs to react to that change

Do not use React state for values that can simply be calculated.

Prefer:

```tsx
const total = students.length;
```

instead of:

```tsx
const [total, setTotal] = useState(0);
```

when `total` can be derived.

---

# 17. Related State Should Be Grouped

When multiple values belong to the same responsibility, prefer a single state object.

Example:

```tsx
const [form, setForm] = useState({
  name: '',
  classId: '',
  sectionId: '',
  rollNo: '',
});
```

Update individual fields using spread syntax:

```tsx
setForm((prev) => ({
  ...prev,
  name: value,
}));
```

This is preferred when the values represent one logical form.

---

# 18. State Must Be Grouped by Responsibility

Use logical state groups such as:

```text
form
filters
selection
ui
```

Example:

```tsx
const [form, setForm] = useState({...});

const [filters, setFilters] = useState({...});

const [selection, setSelection] = useState({...});

const [ui, setUi] = useState({
  showModal: false,
  loading: false,
});
```

Do not create one giant global object simply to reduce the number of `useState` calls.

Independent concerns should remain independent.

If combining state hurts clarity, use separate state.

---

# 19. Avoid Duplicated State

Do not store values that can be derived from existing state or props.

Prefer:

```tsx
const selectedStudent = students.find((student) => student.id === selectedId);
```

instead of storing another copy of the selected student.

Avoid synchronization effects that exist only because the same data is stored in multiple places.

---

# 20. React Hook Discipline

Do not add hooks unnecessarily.

Avoid unnecessary:

```text
useMemo
useCallback
useEffect
```

Use them only when there is a real technical reason.

Do not use hooks simply because another component happens to use them.

---

# 21. Hooks Are NOT Allowed in Services

Services and business-logic classes must not use React hooks.

Incorrect:

```tsx
class StudentService {
  const { toast } = useToast();
}
```

Services should use normal:

- Variables
- Functions
- Arrays
- Maps
- Objects
- Classes
- API utilities

React-specific behavior belongs in React components/hooks.

---

# 22. Form Rules

Forms should:

- Keep form state close to the owning form.
- Use React-Bootstrap form components.
- Follow existing SchoolNexa form patterns.
- Keep unrelated form state outside the form state.
- Split large forms into smaller components when necessary.

For multiple independent forms, prefer focused components rather than one massive form.

Example:

```text
Parent
 ├── StudentForm
 ├── GuardianForm
 └── AddressForm
```

Do not keep unrelated form state in a large parent.

---

# 23. Modal Rules

Use the existing React-Bootstrap `Modal` directly.

Do not create a modal abstraction unless there is a genuine project-wide requirement.

For complex modal forms:

```text
Parent
 └── Modal
      └── Focused Form Component
```

The parent should generally control:

- Modal visibility
- Opening
- Closing

The child form should generally handle:

- Fields
- Form state
- Validation
- Form-specific submission

Reuse existing modal patterns.

---

# 24. Theme Support — LIGHT & DARK

All new UI must support the existing SchoolNexa light/dark theme system.

Use the existing theme mechanism, including `useTheme()` where required by the existing architecture.

Do NOT create another theme system.

Check both themes for:

- Text
- Backgrounds
- Borders
- Inputs
- Tables
- Cards
- Dropdowns
- Modals
- Hover states
- Active states
- Disabled states

Avoid hard-coded colors that break dark mode.

---

# 25. Loading and Lazy Loading Architecture

## Important Definition

`Loadable` is an **existing Higher-Order Component (HOC) used for lazy loading React components/pages**.

It is NOT a generic loading component.

It is NOT a replacement for ordinary component rendering.

It is NOT a general-purpose spinner component.

---

## 25.1 `Loadable` Usage

Import:

```tsx
import { Loadable } from '@/components/common';
```

Use the established SchoolNexa pattern to wrap a `lazy()` component.

Example:

```tsx
const StudentPage = Loadable(lazy(() => import('@/modules/student/StudentPage')));
```

Follow the exact existing implementation pattern in the project.

---

## 25.2 Loadable Rules

- Use `Loadable` when a component/page is intentionally lazy-loaded.
- `Loadable` wraps a React `lazy()` component.
- Follow the existing `Loadable` implementation.
- Follow the established usage from commits `b111ce7` and `ca9002c`.
- Do not create another lazy-loading HOC.
- Do not create `LazyLoad`.
- Do not create `SuspenseWrapper`.
- Do not create `LoadingWrapper`.
- Do not create another custom lazy-loading abstraction.
- Do not use `Loadable` unnecessarily for small components.
- Lazy-load pages and large feature modules where appropriate.
- Small reusable components should normally remain normally imported.

---

## 25.3 Initial Application Loading

The initial application loading/spinner implementation established by:

```text
4e944f8
```

must be preserved.

Do not create another global loading system.

The initial application loading behavior and component lazy-loading behavior are separate concerns.

---

# 26. Reuse Existing Code

Before creating any component, service, utility, hook, helper, or abstraction:

1. Search the existing codebase.
2. Check whether the functionality already exists.
3. Check whether a similar component exists.
4. Check whether an existing service can be reused or extended.
5. Check existing utilities.
6. Follow the established pattern.

Do not duplicate functionality.

If an existing component solves the requirement, use it.

---

# 27. UI Design Standards

SchoolNexa UI should be:

- Minimal
- Clean
- Compact
- Professional
- Responsive
- Information-dense
- Consistent

Avoid:

- Oversized buttons
- Unnecessary cards
- Excessive padding
- Excessive spacing
- Excessive icons
- Decorative elements without purpose
- Excessive animations
- Unnecessary gradients
- Duplicate actions
- Excessive visual decoration

Prefer short action labels:

```text
Add
Edit
Save
Delete
Cancel
Assign
Generate
Preview
Apply
Close
```

Use standard React-Bootstrap controls whenever possible.

---

# 28. Current RBAC UI Preservation Rule

The current RBAC page UI is an approved SchoolNexa design reference.

DO NOT:

- Modify it
- Redesign it
- Restyle it
- Reformat it
- Replace it

unless explicitly instructed by the user.

New pages should follow the established RBAC visual and structural conventions.

Preserve:

- Layout
- Spacing
- Typography
- Buttons
- Cards
- Tables
- Permissions UI
- Responsive behavior
- Colors
- Bootstrap classes
- Existing component structure

Do not "improve" the RBAC UI based on assumptions.

---

# 29. UI Preservation Rule — SOURCE OF TRUTH

The current working UI is the source of truth.

In particular:

- `TopHeader`
- RBAC page UI
- Existing finalized pages
- Existing reusable components

must not be changed casually.

New pages must follow the existing visual and structural patterns.

Finalized pages must not be modified unless explicitly requested.

If a new requirement conflicts with an established approved pattern, ask before changing the established pattern.

---

# 30. Routing Architecture

Routing must remain independent from `PageLayout`.

ALL top-level routes must be outside `PageLayout`.

`PageLayout` must NOT:

- Own route configuration
- Define application route registration
- Control public/private/protected route architecture

This architecture is intentionally maintained for future:

```text
Public Routes
Private Routes
Protected Routes
```

---

# 31. Central Top-Level Route Registration

Use ONE central top-level route registration file:

```text
src/routes/index.tsx
```

This file should register top-level modules.

Example:

```text
/timetable/*
/academic/*
/students/*
/teachers/*
```

Do not put every individual page route into the central route file.

The central route file should remain clean and module-oriented.

---

# 32. Modular Nested Routing

Each feature/module owns its nested routes inside its own `index.tsx`.

Example:

```text
src/
├── routes/
│   └── index.tsx
│
├── timetable/
│   ├── index.tsx
│   ├── TimeTable.tsx
│   ├── TeacherTimetable.tsx
│   └── ClassTimetable.tsx
│
└── academic/
    ├── index.tsx
    ├── AcademicSetup.tsx
    └── AcademicAllocator.tsx
```

Top-level route:

```tsx
<Route path="/timetable/*" element={<TimetableRoutes />} />
```

Then `src/timetable/index.tsx` owns:

```text
/timetable
/timetable/teacher
/timetable/class
```

Similarly, the academic module can own:

```text
/academic/setup
/academic/allocator
```

Follow this pattern for all modules.

---

# 33. Route Configuration Style

Central route configuration should remain simple and module-oriented.

Use the established route object pattern where appropriate:

```tsx
{
  path: '/timetable',
  component: Timetable,
}
```

Do not unnecessarily place every child page in the global route configuration.

Nested module routes belong inside the module.

---

# 34. Route Naming

Prefer action-first URLs where applicable.

Preferred:

```text
/teachers/view/:teacherId
/teachers/edit/:teacherId
```

Avoid:

```text
/teachers/:teacherId
```

when the route's purpose is specifically viewing or editing.

Routes should communicate the action being performed.

---

# 35. Module Routing Responsibility

A module's `index.tsx` should act as its route boundary.

For example:

```text
timetable/index.tsx
```

owns timetable-specific nested routing.

This keeps modules independent and prevents the central route configuration from becoming a large list of individual pages.

---

# 36. Before Implementing Any Feature

Before writing code:

### Step 1 — Inspect

Inspect the related existing implementation.

### Step 2 — Search

Search for:

- Existing components
- Existing services
- Existing hooks
- Existing utilities
- Existing UI patterns
- Existing route patterns
- Existing form patterns
- Existing API patterns

### Step 3 — Reuse

Reuse existing SchoolNexa functionality wherever possible.

### Step 4 — Architecture

Follow:

```text
@/ imports
React-Bootstrap
existing Loadable HOC
existing theme
existing TopHeader
existing ActionButton
existing ActionButtonGroup
existing InfoCard
existing ChipCard
existing Toast system
existing routing pattern
```

### Step 5 — State

Use minimal state.

Group related values into state objects where appropriate.

### Step 6 — Components

Keep components small and focused.

### Step 7 — Theme

Verify light and dark theme behavior.

### Step 8 — Responsiveness

Verify the UI remains usable on different screen sizes.

---

# 37. Component Splitting Rule

If a requested change would make an existing component large or introduce multiple independent responsibilities, split it.

For example, if a page starts containing:

```text
Header
Filters
List
Add Form
Edit Form
Modal
Statistics
Notifications
```

do not keep everything in one component.

Create focused components according to the existing project structure.

The goal is maintainability, not simply reducing the number of files.

---

# 38. Avoid Unnecessary Abstractions

Do not create:

- Generic wrappers without real reuse
- Unnecessary custom hooks
- Unnecessary service layers
- Unnecessary context providers
- Generic components used only once
- New state-management libraries
- New UI frameworks
- Duplicate utilities
- Duplicate loading systems
- Duplicate notification systems
- Duplicate header systems

Abstraction should exist because there is a real reuse or architectural requirement.

Do not abstract merely for theoretical cleanliness.

---

# 39. Preserve Existing Functionality

When modifying existing code:

- Preserve existing behavior.
- Preserve working routes.
- Preserve existing API contracts.
- Preserve component APIs.
- Preserve theme behavior.
- Preserve responsive behavior.
- Preserve existing permissions/RBAC behavior.
- Preserve existing loading behavior.
- Preserve existing toast behavior.

Do not perform unrelated cleanup during a feature change.

Avoid opportunistic refactoring.

---

# 40. API and Backend Integration

When integrating APIs:

- Reuse existing service patterns.
- Keep API/business logic outside UI components when appropriate.
- Do not place complex business logic directly inside JSX.
- Keep services framework-independent.
- Do not use React hooks inside services.
- Preserve existing API response conventions.
- Preserve authentication and authorization architecture.
- Respect tenant/school context.
- Respect existing RBAC and permission architecture.

Do not create a second API architecture for one feature.

---

# 41. Authentication, Tenant & Authorization Awareness

SchoolNexa is a multi-school/multi-tenant application.

When implementing protected functionality, respect the existing architecture for:

- Authentication
- Active school
- Academic year
- Tenant context
- School user context
- Roles
- Permissions
- RBAC

Do not bypass authorization checks merely because a page is hidden from navigation.

UI permission checks and backend authorization are separate responsibilities.

---

# 42. Data and Domain Consistency

Follow existing SchoolNexa domain concepts and identifiers.

Do not introduce alternate identifiers or duplicate concepts when an established model already exists.

When a feature depends on an existing domain object:

1. Inspect its existing model.
2. Inspect its existing service/API.
3. Inspect its existing UI.
4. Reuse its identifiers and terminology.
5. Preserve existing relationships.

Do not rename established concepts without an explicit requirement.

---

# 43. Error Handling

Use the existing error-handling architecture.

For user-facing operational errors:

```tsx
toast.error(...)
```

For successful operations:

```tsx
toast.success(...)
```

For warnings:

```tsx
toast.warning(...)
```

For informational messages:

```tsx
toast.info(...)
```

Do not silently swallow errors.

Do not create a second error-notification system.

Do not expose unnecessary internal technical details to users.

---

# 44. Responsive Design

All new UI must be responsive.

Use React-Bootstrap's responsive grid and utilities first.

Check:

- Desktop
- Tablet
- Smaller screens
- Tables
- Forms
- Header actions
- Filters
- Navigation
- Modals

Do not create layouts that only work at one screen width.

---

# 45. Accessibility & Usability

Use semantic and accessible controls whenever possible.

Ensure:

- Buttons have meaningful labels/tooltips where necessary.
- Icon-only actions have appropriate `title` or accessible context.
- Form fields have labels.
- Disabled/loading states are communicated.
- Interactive elements are keyboard accessible where applicable.
- Modals and dropdowns use existing React-Bootstrap behavior.

Do not replace standard accessible Bootstrap controls with custom HTML unnecessarily.

---

# 46. Existing Component APIs Must Be Preserved

Do not change an existing component API just to make a new feature easier.

Before changing a shared component:

1. Search all usages.
2. Determine whether the change is backward compatible.
3. Determine whether the component is an approved existing pattern.
4. Modify it only when explicitly required.

Prefer adapting the new feature to the existing component API.

This is especially important for:

- `TopHeader`
- `ActionButton`
- `ActionButtonGroup`
- `InfoCard`
- `ChipCard`
- `Loadable`
- Existing form components
- Existing layout components
- Existing RBAC components

---

# 47. No Duplicate Design Systems

SchoolNexa should have one consistent UI language.

Do not introduce competing implementations for:

- Headers
- Buttons
- Modals
- Toasts
- Cards
- Navigation
- Loading
- Forms
- Tables
- Dropdowns

If an approved component exists, reuse it.

---

# 48. No Unnecessary Dependency Changes

Do not install a new package unless there is a genuine requirement.

Before adding a dependency:

1. Check whether the project already provides the functionality.
2. Check existing dependencies.
3. Check React-Bootstrap.
4. Check existing utilities/components.
5. Confirm that the dependency is genuinely necessary.

Do not add dependencies for trivial functionality.

---

# 49. No Unrelated Refactoring

When asked to implement a feature, do not simultaneously:

- Rename unrelated files.
- Reformat unrelated components.
- Rewrite working services.
- Change routing architecture.
- Replace existing components.
- Change styling conventions.
- Upgrade libraries.
- Replace dependencies.

unless explicitly requested.

Keep the requested change focused.

---

# 50. Development Style

Prefer readable code over clever code.

Use:

- Clear names
- Small functions
- Small components
- Straightforward conditionals
- Existing project conventions

Avoid:

- Clever one-liners that reduce readability
- Excessive abstraction
- Deep nesting
- Repeated logic
- Large components
- Large state objects containing unrelated data

---

# 51. Existing Feature Folder Conventions

Follow existing feature/component organization.

Examples:

```text
src/components/
├── AppHeader/
├── SchoolManage/
├── AcademicYearManage/
├── LanguageManager/
├── Notification/
└── User/
```

Do not reorganize existing folders unless there is an explicit architectural requirement.

New folders should follow the same naming and structural conventions.

---

# 52. New Page / Module UI Requirements

Every new module/page should generally follow this structure:

```text
TopHeader
    ↓
Summary / InfoCard where appropriate
    ↓
ChipCard / navigation where appropriate
    ↓
Filters / controls
    ↓
Main content
    ↓
Existing forms/modals/actions
```

Do not force every page to contain every element. Use the components when they are appropriate for the page.

The goal is consistency without unnecessary UI.

---

# 53. Page Actions

Use existing `ActionButton` or `ActionButtonGroup` for page actions.

Use short action names.

Examples:

```text
Add
Edit
Delete
Save
Cancel
Assign
Generate
Preview
Export
Apply
Close
```

Do not create unnecessarily verbose button labels.

Avoid duplicate actions appearing in multiple places unless there is a genuine UX requirement.

---

# 54. Theme and Styling Preservation

When modifying existing UI, do not casually change:

- Colors
- Border styles
- Typography
- Padding
- Margins
- Button sizing
- Icon sizing
- Card structure
- Table structure
- Responsive behavior

If the existing implementation already establishes a visual pattern, follow it.

New styling should look like it belongs to the existing SchoolNexa application.

---

# 55. Final Implementation Checklist

Before considering a change complete, verify:

## Architecture

- [ ] Existing architecture preserved
- [ ] No unnecessary rewrite
- [ ] No unnecessary abstraction
- [ ] No unnecessary dependency
- [ ] Existing patterns followed

## Imports

- [ ] All internal imports use `@/`
- [ ] No long relative imports
- [ ] No new import alias introduced

## UI

- [ ] React-Bootstrap used as primary UI
- [ ] Existing components reused
- [ ] No duplicate UI components created
- [ ] UI is minimal and compact
- [ ] No unnecessary decoration
- [ ] Responsive behavior maintained

## Header

- [ ] `TopHeader` used where required
- [ ] Existing `TopHeader` implementation preserved
- [ ] Correct props used
- [ ] No custom header created
- [ ] Existing header visual pattern followed

## Actions

- [ ] Existing `ActionButton` used where appropriate
- [ ] Correct `ActionButton` API used
- [ ] `name` used correctly
- [ ] `icon` used correctly
- [ ] `action` used for handlers
- [ ] `link` used for navigation
- [ ] No unsupported `children`
- [ ] No unsupported `onClick`
- [ ] `ActionButtonGroup` reused where appropriate

## Cards

- [ ] `InfoCard` used for metrics/summary where appropriate
- [ ] `ChipCard` used for navigation/category chips where appropriate
- [ ] No duplicate custom navigation cards

## Feedback

- [ ] `useToast` used for operational feedback
- [ ] Success/error/warning/info messages implemented appropriately
- [ ] No duplicate notification system

## State

- [ ] State is minimal
- [ ] Related form state grouped
- [ ] Unrelated state separated
- [ ] No duplicated derived state
- [ ] No unnecessary `useMemo`
- [ ] No unnecessary `useCallback`
- [ ] No unnecessary `useEffect`
- [ ] No hooks used in services

## Components

- [ ] Components have focused responsibilities
- [ ] Large components split where appropriate
- [ ] Existing component patterns followed
- [ ] No unnecessary abstractions

## Lazy Loading

- [ ] `Loadable` used for intentionally lazy-loaded pages/components
- [ ] `Loadable` is used as the existing HOC
- [ ] `lazy()` is wrapped using the established `Loadable` pattern
- [ ] No new `LazyLoad`
- [ ] No new `SuspenseWrapper`
- [ ] No new `LoadingWrapper`
- [ ] Small components are not unnecessarily lazy-loaded

## Loading

- [ ] Existing initial loading/spinner implementation preserved
- [ ] Existing loading behavior preserved
- [ ] No new global loading system

## Theme

- [ ] Light theme checked
- [ ] Dark theme checked
- [ ] No hard-coded colors that break theme
- [ ] Existing theme system respected

## Routing

- [ ] Top-level routes remain outside `PageLayout`
- [ ] `PageLayout` does not own route configuration
- [ ] `src/routes/index.tsx` remains the central top-level registration
- [ ] Individual modules own nested routes
- [ ] No unnecessary route duplication
- [ ] Action-first route naming used where appropriate

## RBAC

- [ ] Existing RBAC UI preserved
- [ ] Existing permission patterns reused
- [ ] No authorization bypass introduced

## API / Backend

- [ ] Existing service patterns reused
- [ ] Business logic kept outside UI where appropriate
- [ ] Existing API contracts preserved
- [ ] Tenant context respected
- [ ] Authentication/authorization respected

## Responsiveness

- [ ] Desktop checked
- [ ] Tablet checked
- [ ] Smaller screens checked
- [ ] Tables/forms/modals checked

## Preservation

- [ ] Existing functionality preserved
- [ ] Existing APIs preserved
- [ ] Existing component contracts preserved
- [ ] Existing styling patterns preserved
- [ ] No unrelated refactoring performed

---

# 56. Mandatory Final Rule

When uncertain, follow this principle:

> **Existing SchoolNexa code is the source of truth.**

Before creating something new:

```text
Inspect
   ↓
Search
   ↓
Reuse
   ↓
Follow Existing Pattern
   ↓
Implement Minimally
```

Always prefer:

```text
Existing Pattern
      ↓
Reuse Existing Component
      ↓
React-Bootstrap
      ↓
Small Component
      ↓
Minimal State
      ↓
Existing Loadable HOC when lazy loading is needed
      ↓
Existing Toast / Header / Action / Card patterns
      ↓
Simple Implementation
```

Do not introduce complexity unless the requirement genuinely needs it.

**Consistency, maintainability, preservation of existing functionality, and adherence to the established SchoolNexa architecture take priority over personal implementation preferences.**

---

# 57. Absolute Preservation Rule

The following are considered established SchoolNexa standards and must not be replaced with alternative implementations without explicit instruction:

```text
@/ import alias
React-Bootstrap
TopHeader
ActionButton
ActionButtonGroup
InfoCard
ChipCard
useToast
Loadable HOC
Existing loading implementation
Existing theme system
Existing RBAC UI
Existing routing architecture
Existing component APIs
Existing folder conventions
```

If an existing component or pattern already solves the requirement:

> **Reuse it. Do not recreate it.**

If an existing approved component must be changed:

> **Ask before changing the established pattern unless the user explicitly requested the change.**

If a new implementation conflicts with the current working UI:

> **The current working UI wins.**

# End of SchoolNexa AGENTS.md
