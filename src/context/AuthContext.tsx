import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserSummary,
  SchoolSummary,
  AcademicYearSummary,
  RoleSummary,
  AuthContextState,
} from '../types';
import { DEMO_USERS, MOCK_SEED_SCHOOLS, SYSTEM_PERMISSIONS } from '../data/auth-seed';
import { store } from '@/store';
import { AuthApi } from '@/store/auth';
import { StudentApi } from '@/store/students';
import { TeacherApi } from '@/store/teachers';
import { SchoolApi } from '@/store/school';
import { EnrollmentApi } from '@/store/enrollment';
import { AcademicApi } from '@/store/academic';

interface AuthContextType extends AuthContextState {
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void> | void;
  switchSchool: (schoolId: string) => void;
  switchAcademicYear: (academicYearId: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasAllPermissions: (permissionCodes: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
  createSchool: (name: string, code: string, domain?: string) => Promise<SchoolSummary>;
  createAcademicYear: (
    name: string,
    code: string,
    startDate: string,
    endDate: string,
  ) => Promise<AcademicYearSummary>;
  setAcademicYearAsCurrent: (academicYearId: string) => Promise<void>;
  updateAcademicYear: (
    academicYearId: string,
    updates: Partial<AcademicYearSummary>,
  ) => Promise<void>;
  deleteAcademicYear: (academicYearId: string) => Promise<void>;
  addRoleToSchool: (
    name: string,
    code: string,
    permissions: string[],
    description?: string,
  ) => Promise<RoleSummary>;
  updateRole: (
    roleId: string,
    updates: { name?: string; description?: string; permissions?: string[] },
  ) => Promise<RoleSummary>;
  updateRolePermissions: (roleId: string, permissions: string[]) => Promise<void>;
  deleteRoleFromSchool: (roleId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'schoolnexa_auth_state_v1';
const SCHOOLS_STORAGE_KEY = 'schoolnexa_schools_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<SchoolSummary[]>(() => {
    try {
      const saved = localStorage.getItem(SCHOOLS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return MOCK_SEED_SCHOOLS;
  });

  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [activeAcademicYearId, setActiveAcademicYearId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbPermissions, setDbPermissions] = useState<string[]>([]);
  const [dbRoles, setDbRoles] = useState<RoleSummary[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize schools to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(schools));
    } catch (e) {
      console.error('Failed to persist schools state', e);
    }
  }, [schools]);

  const refreshContext = async (targetSchoolId?: string, tokenToUse?: string) => {
    const currentToken = tokenToUse || token;
    if (!currentToken) return;

    try {
      const activeId = targetSchoolId || activeSchoolId;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${currentToken}`,
      };
      if (activeId) {
        headers['x-school-id'] = activeId;
      }

      // 1. Fetch live schools from database
      const schoolsRes = await fetch('/api/schools', { headers });
      if (schoolsRes.ok) {
        const json = await schoolsRes.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSchools(json.data);
          localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(json.data));
        }
      }

      // 2. Fetch live operational context (roles, permissions, active school, active academic year)
      const contextRes = await fetch('/api/context', { headers });
      if (contextRes.ok) {
        const ctxJson = await contextRes.json();
        if (ctxJson.success && ctxJson.data) {
          if (Array.isArray(ctxJson.data.permissions)) {
            setDbPermissions(ctxJson.data.permissions);
          }
          if (Array.isArray(ctxJson.data.roles)) {
            setDbRoles(ctxJson.data.roles);
          }
          if (ctxJson.data.school?.id && !targetSchoolId) {
            setActiveSchoolId(ctxJson.data.school.id);
          }
          if (ctxJson.data.academicYear?.id) {
            setActiveAcademicYearId(ctxJson.data.academicYear.id);
          }
        }
      }
    } catch {
      // Live context refresh completed or continuing with current state
    }
  };

  // Listen for session expiration or revocation events (e.g., when role permissions are changed)
  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const reason =
        customEvent.detail?.message ||
        'Your session has expired or been revoked. Please log in again.';
      setUser(null);
      setToken(null);
      setActiveSchoolId(null);
      setActiveAcademicYearId(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem('schoolnexa_logged_out', 'true');
      setAuthError(reason);
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, []);

  // Load initial session with real JWT authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isLoggedOut = localStorage.getItem('schoolnexa_logged_out') === 'true';
        if (isLoggedOut) {
          setIsLoading(false);
          return;
        }

        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        let savedSession: any = null;
        if (raw) {
          try {
            savedSession = JSON.parse(raw);
          } catch {
            savedSession = null;
          }
        }

        if (savedSession?.user && savedSession?.token && !savedSession.token.startsWith('token_')) {
          setUser(savedSession.user);
          setToken(savedSession.token);
          setActiveSchoolId(savedSession.activeSchoolId || null);
          setActiveAcademicYearId(savedSession.activeAcademicYearId || null);
          await refreshContext(savedSession.activeSchoolId || undefined, savedSession.token);
          return;
        }

        // Acquire real JWT for default Director / Principal from database
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'alex.director@schoolnexa.com', password: 'password123' }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.token) {
            const apiUser = json.data.user;
            const jwtToken = json.data.token;
            const userObj: UserSummary = {
              id: apiUser.id,
              email: apiUser.email,
              fullName:
                apiUser.fullName ||
                `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() ||
                'Alex Mercer',
              phone: apiUser.phone || null,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              isSuperAdmin: Boolean(apiUser.isSuperAdmin),
              isActive: true,
            };
            setUser(userObj);
            setToken(jwtToken);

            if (
              json.data.schools &&
              Array.isArray(json.data.schools) &&
              json.data.schools.length > 0
            ) {
              setSchools(json.data.schools);
              localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(json.data.schools));
            }

            const activeSc = json.data.activeSchool || json.data.schools?.[0];
            let targetSchoolId: string | null = null;
            let targetAyId: string | null = null;

            if (activeSc) {
              targetSchoolId = activeSc.id;
              setActiveSchoolId(activeSc.id);
              const activeAy =
                json.data.activeAcademicYear ||
                activeSc.academicYears?.find((ay: any) => ay.isCurrent) ||
                activeSc.academicYears?.[0];
              if (activeAy) {
                targetAyId = activeAy.id;
                setActiveAcademicYearId(activeAy.id);
              }
            }

            if (json.data.permissions) {
              setDbPermissions(json.data.permissions);
            }
            if (json.data.roles) {
              setDbRoles(json.data.roles);
            }

            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({
                user: userObj,
                token: jwtToken,
                activeSchoolId: targetSchoolId,
                activeAcademicYearId: targetAyId,
              }),
            );
            return;
          }
        }

        // Fallback demo user if backend is not yet ready
        const defaultUser = DEMO_USERS[0];
        setUser(defaultUser);
        setToken('token_' + defaultUser.id);
        setActiveSchoolId('school-oakridge-01');
        setActiveAcademicYearId('ay-oak-2025');
      } catch (err) {
        console.error('Session restoration failed', err);
        const defaultUser = DEMO_USERS[0];
        setUser(defaultUser);
        setToken('token_' + defaultUser.id);
        setActiveSchoolId('school-oakridge-01');
        setActiveAcademicYearId('ay-oak-2025');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Save session state changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          user,
          token,
          activeSchoolId,
          activeAcademicYearId,
        }),
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user, token, activeSchoolId, activeAcademicYearId]);

  // Derive accessible schools for the current user
  const userAccessibleSchools = useMemo(() => {
    if (!user) return [];
    if (user.isSuperAdmin) return schools;

    const demoRecord = DEMO_USERS.find((u) => u.id === user.id || u.email === user.email);
    if (demoRecord) {
      const allowedSchoolIds = demoRecord.schoolMemberships.map((m) => m.schoolId);
      const filtered = schools.filter((s) => allowedSchoolIds.includes(s.id));
      if (filtered.length > 0) return filtered;
    }

    return schools;
  }, [user, schools]);

  // Active School resolution
  const activeSchool = useMemo(() => {
    if (!activeSchoolId) {
      return userAccessibleSchools[0] || null;
    }
    return (
      userAccessibleSchools.find((s) => s.id === activeSchoolId) || userAccessibleSchools[0] || null
    );
  }, [activeSchoolId, userAccessibleSchools]);

  // Active Academic Year resolution
  const activeAcademicYear = useMemo(() => {
    if (!activeSchool || !activeSchool.academicYears || activeSchool.academicYears.length === 0) {
      return null;
    }
    if (activeAcademicYearId) {
      const matched = activeSchool.academicYears.find((ay) => ay.id === activeAcademicYearId);
      if (matched) return matched;
    }
    // Default to current or first
    const current = activeSchool.academicYears.find((ay) => ay.isCurrent);
    return current || activeSchool.academicYears[0];
  }, [activeSchool, activeAcademicYearId]);

  // Compute current roles and permission list in active school context
  const { currentRoles, currentPermissions } = useMemo(() => {
    if (!user || !activeSchool) {
      return { currentRoles: [], currentPermissions: [] };
    }

    if (user.isSuperAdmin) {
      // Super admin has all permissions
      const allCodes = SYSTEM_PERMISSIONS.map((p) => p.code);
      const superRole: RoleSummary = {
        id: 'role-super-admin',
        name: 'Platform Super Administrator',
        code: 'SUPER_ADMIN',
        isSystem: true,
        permissions: allCodes,
      };
      return {
        currentRoles: [superRole, ...(activeSchool.roles || [])],
        currentPermissions: allCodes,
      };
    }

    // Prioritize permissions resolved from the database for the active school
    if (dbPermissions.length > 0) {
      return {
        currentRoles: dbRoles.length > 0 ? dbRoles : activeSchool.roles || [],
        currentPermissions: dbPermissions,
      };
    }

    // Check activeSchool.roles
    if (activeSchool.roles && activeSchool.roles.length > 0) {
      const permissionSet = new Set<string>();
      activeSchool.roles.forEach((r) => {
        (r.permissions || []).forEach((p) => permissionSet.add(p));
      });
      if (permissionSet.size > 0) {
        return {
          currentRoles: activeSchool.roles,
          currentPermissions: Array.from(permissionSet),
        };
      }
    }

    const demoRecord = DEMO_USERS.find((u) => u.id === user.id || u.email === user.email);
    if (!demoRecord) {
      return { currentRoles: [], currentPermissions: [] };
    }

    const membership = demoRecord.schoolMemberships.find((m) => m.schoolId === activeSchool.id);
    if (!membership) {
      return { currentRoles: [], currentPermissions: [] };
    }

    const matchedRoles = (activeSchool.roles || []).filter((r) =>
      membership.roleCodes.includes(r.code),
    );
    const permissionSet = new Set<string>();
    matchedRoles.forEach((r) => {
      r.permissions.forEach((p) => permissionSet.add(p));
    });

    return {
      currentRoles: matchedRoles,
      currentPermissions: Array.from(permissionSet),
    };
  }, [user, activeSchool, dbPermissions, dbRoles]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        const err = 'Please provide an email address.';
        setAuthError(err);
        return { success: false, error: err };
      }
      if (!password) {
        const err = 'Please enter your password.';
        setAuthError(err);
        return { success: false, error: err };
      }

      // 1. Attempt real backend REST API login first
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const result = await res.json().catch(() => null);

        if (res.ok && result?.success && result.data?.token) {
          localStorage.removeItem('schoolnexa_logged_out');
          const apiUser = result.data.user;
          const jwtToken = result.data.token;
          const mappedUser: UserSummary = {
            id: apiUser.id,
            email: apiUser.email,
            fullName:
              apiUser.fullName ||
              `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() ||
              'User',
            phone: apiUser.phone || null,
            avatarUrl:
              apiUser.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            isSuperAdmin: Boolean(apiUser.isSuperAdmin),
            isActive: true,
          };
          setUser(mappedUser);
          setToken(jwtToken);

          if (
            result.data.schools &&
            Array.isArray(result.data.schools) &&
            result.data.schools.length > 0
          ) {
            setSchools(result.data.schools);
            localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(result.data.schools));
          }

          const targetSchool = result.data.activeSchool || result.data.schools?.[0];
          let chosenSchoolId: string | null = null;
          let chosenAyId: string | null = null;

          if (targetSchool) {
            chosenSchoolId = targetSchool.id;
            setActiveSchoolId(targetSchool.id);
            const currentAy =
              result.data.activeAcademicYear ||
              targetSchool.academicYears?.find((ay: any) => ay.isCurrent) ||
              targetSchool.academicYears?.[0];
            if (currentAy) {
              chosenAyId = currentAy.id;
              setActiveAcademicYearId(currentAy.id);
            }
          }

          if (result.data.permissions) {
            setDbPermissions(result.data.permissions);
          }
          if (result.data.roles) {
            setDbRoles(result.data.roles);
          }

          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({
              user: mappedUser,
              token: jwtToken,
              activeSchoolId: chosenSchoolId,
              activeAcademicYearId: chosenAyId,
            }),
          );

          return { success: true };
        } else {
          // If database is unreachable in the current environment, fallback to demo users with strict credential check
          if (result?.message?.includes('Database server is unreachable')) {
            const found = DEMO_USERS.find(
              (u) => u.email.toLowerCase() === cleanEmail.toLowerCase(),
            );
            if (found && found.password === password) {
              localStorage.removeItem('schoolnexa_logged_out');
              setUser({
                id: found.id,
                email: found.email,
                fullName: found.fullName,
                phone: found.phone,
                avatarUrl: found.avatarUrl,
                isSuperAdmin: found.isSuperAdmin,
                isActive: found.isActive,
              });
              setToken('token_' + found.id);
              const firstSchool = found.schoolMemberships[0];
              if (firstSchool) {
                setActiveSchoolId(firstSchool.schoolId);
                const schoolObj = schools.find((s) => s.id === firstSchool.schoolId);
                if (schoolObj && schoolObj.academicYears && schoolObj.academicYears.length > 0) {
                  const currentAy =
                    schoolObj.academicYears.find((ay) => ay.isCurrent) ||
                    schoolObj.academicYears[0];
                  setActiveAcademicYearId(currentAy.id);
                }
              }
              return { success: true };
            }
            const invalidMsg = 'Invalid email or password credentials.';
            setAuthError(invalidMsg);
            return { success: false, error: invalidMsg };
          }

          let errorMsg = result?.message || 'Login failed. Please check your credentials.';
          if (Array.isArray(result?.errors) && result.errors.length > 0) {
            const detail = result.errors
              .map((e: any) => e.message)
              .filter(Boolean)
              .join('. ');
            if (detail) {
              errorMsg = detail;
            }
          }
          setAuthError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err: any) {
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
        if (found && found.password === password) {
          localStorage.removeItem('schoolnexa_logged_out');
          setUser({
            id: found.id,
            email: found.email,
            fullName: found.fullName,
            phone: found.phone,
            avatarUrl: found.avatarUrl,
            isSuperAdmin: found.isSuperAdmin,
            isActive: found.isActive,
          });
          setToken('token_' + found.id);
          const firstSchool = found.schoolMemberships[0];
          if (firstSchool) {
            setActiveSchoolId(firstSchool.schoolId);
            const schoolObj = schools.find((s) => s.id === firstSchool.schoolId);
            if (schoolObj && schoolObj.academicYears && schoolObj.academicYears.length > 0) {
              const currentAy =
                schoolObj.academicYears.find((ay) => ay.isCurrent) || schoolObj.academicYears[0];
              setActiveAcademicYearId(currentAy.id);
            }
          }
          return { success: true };
        }
        const errorMsg = 'Invalid email or password credentials.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token && !token.startsWith('token_')) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      setActiveSchoolId(null);
      setActiveAcademicYearId(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem('schoolnexa_logged_out', 'true');
      store.dispatch(AuthApi.util.resetApiState());
      store.dispatch(StudentApi.util.resetApiState());
      store.dispatch(TeacherApi.util.resetApiState());
      store.dispatch(SchoolApi.util.resetApiState());
      store.dispatch(EnrollmentApi.util.resetApiState());
      store.dispatch(AcademicApi.util.resetApiState());
    }
  };

  const switchSchool = async (schoolId: string) => {
    const target =
      userAccessibleSchools.find((s) => s.id === schoolId) ||
      schools.find((s) => s.id === schoolId);
    if (target) {
      setActiveSchoolId(target.id);
      const currentAy =
        (target.academicYears || []).find((ay) => ay.isCurrent) || target.academicYears?.[0];
      if (currentAy) {
        setActiveAcademicYearId(currentAy.id);
      }
    }
    store.dispatch(StudentApi.util.resetApiState());
    store.dispatch(TeacherApi.util.resetApiState());
    store.dispatch(EnrollmentApi.util.resetApiState());
    store.dispatch(AcademicApi.util.resetApiState());
    await refreshContext(schoolId);
  };

  const switchAcademicYear = (academicYearId: string) => {
    if (activeSchool) {
      const targetAy = activeSchool.academicYears.find((ay) => ay.id === academicYearId);
      if (targetAy) {
        setActiveAcademicYearId(targetAy.id);
        store.dispatch(EnrollmentApi.util.resetApiState());
        store.dispatch(AcademicApi.util.resetApiState());
      }
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return currentPermissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return permissionCodes.some((code) => currentPermissions.includes(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return permissionCodes.every((code) => currentPermissions.includes(code));
  };

  const hasRole = (roleCode: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin && roleCode === 'SUPER_ADMIN') return true;
    return currentRoles.some((r) => r.code === roleCode);
  };

  const createSchool = async (
    name: string,
    code: string,
    domain?: string,
  ): Promise<SchoolSummary> => {
    if (token) {
      try {
        const res = await fetch('/api/schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, code, domain }),
        });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          const newSchool: SchoolSummary = result.data;
          setSchools((prev) => {
            const next = [...prev.filter((s) => s.id !== newSchool.id), newSchool];
            localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(next));
            return next;
          });
          setActiveSchoolId(newSchool.id);
          if (newSchool.academicYears?.[0]) {
            setActiveAcademicYearId(newSchool.academicYears[0].id);
          }
          await refreshContext(newSchool.id);
          return newSchool;
        } else if (result?.message) {
          throw new Error(result.message);
        }
      } catch (err: any) {
        if (err?.message && !err.message.includes('fetch')) {
          throw err;
        }
      }
    }

    const newSchoolId =
      'school-' +
      code.toLowerCase().replace(/[^a-z0-9]/g, '-') +
      '-' +
      Date.now().toString().slice(-4);
    const newAcademicYearId = 'ay-' + newSchoolId + '-2025';

    const newAcademicYear: AcademicYearSummary = {
      id: newAcademicYearId,
      schoolId: newSchoolId,
      name: 'Academic Year 2025-2026',
      code: 'AY-25-26',
      startDate: '2025-08-01',
      endDate: '2026-06-30',
      isCurrent: true,
      status: 'ACTIVE',
    };

    const defaultAdminRole: RoleSummary = {
      id: 'role-' + newSchoolId + '-admin',
      name: 'School Principal & Director',
      code: 'PRINCIPAL',
      isSystem: true,
      permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
        (p) => p.code,
      ),
    };

    const newSchool: SchoolSummary = {
      id: newSchoolId,
      name,
      code: code.toUpperCase(),
      domain,
      status: 'ACTIVE',
      academicYears: [newAcademicYear],
      roles: [defaultAdminRole],
    };

    setSchools((prev) => [...prev, newSchool]);
    return newSchool;
  };

  const createAcademicYear = async (
    name: string,
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<AcademicYearSummary> => {
    if (!activeSchool) throw new Error('No active school context');

    // Rule: Start date must be before end date
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error('Academic session start date must precede the completion end date.');
    }

    if (token) {
      try {
        const res = await fetch(`/api/schools/${activeSchool.id}/academic-years`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'x-school-id': activeSchool.id,
          },
          body: JSON.stringify({ name, code, startDate, endDate }),
        });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          const newAy: AcademicYearSummary = result.data;
          setSchools((prev) =>
            prev.map((s) => {
              if (s.id === activeSchool.id) {
                const filtered = (s.academicYears || []).filter((y) => y.id !== newAy.id);
                return {
                  ...s,
                  academicYears: [...filtered, newAy],
                };
              }
              return s;
            }),
          );
          return newAy;
        } else if (result?.message) {
          throw new Error(result.message);
        }
      } catch (err: any) {
        if (err?.message && !err.message.includes('fetch')) {
          throw err;
        }
      }
    }

    // Invariant: Uniqueness check on code within school
    const existing = (activeSchool.academicYears || []).find(
      (ay) => ay.code.toLowerCase() === code.trim().toLowerCase(),
    );
    if (existing) {
      throw new Error(`An academic year with code "${code}" already exists in this institution.`);
    }

    const newAy: AcademicYearSummary = {
      id: 'ay-' + activeSchool.id + '-' + Date.now().toString().slice(-4),
      schoolId: activeSchool.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      startDate,
      endDate,
      isCurrent: false,
      status: 'UPCOMING',
    };

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            academicYears: [...s.academicYears, newAy],
          };
        }
        return s;
      }),
    );

    return newAy;
  };

  const setAcademicYearAsCurrent = async (academicYearId: string): Promise<void> => {
    if (!activeSchool) throw new Error('No active school context');

    if (token) {
      try {
        await fetch(
          `/api/schools/${activeSchool.id}/academic-years/${academicYearId}/set-current`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'x-school-id': activeSchool.id,
            },
          },
        );
      } catch {
        // Continue with local state update
      }
    }

    // Rule 1: A school should not have multiple active/current academic years.
    // Atomically unflag all other years as isCurrent: false, and flag chosen as isCurrent: true, status: 'ACTIVE'
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          const updatedAys = s.academicYears.map((ay) => {
            if (ay.id === academicYearId) {
              return { ...ay, isCurrent: true, status: 'ACTIVE' as const };
            }
            return {
              ...ay,
              isCurrent: false,
              status: ay.status === 'ACTIVE' ? ('ARCHIVED' as const) : ay.status,
            };
          });
          const currentAy = updatedAys.find((ay) => ay.id === academicYearId);
          return {
            ...s,
            academicYears: updatedAys,
            currentAcademicYear: currentAy,
          };
        }
        return s;
      }),
    );

    setActiveAcademicYearId(academicYearId);
  };

  const updateAcademicYear = async (
    academicYearId: string,
    updates: Partial<AcademicYearSummary>,
  ): Promise<void> => {
    if (!activeSchool) throw new Error('No active school context');

    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        throw new Error('Start date must precede the end date.');
      }
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          const updatedAys = s.academicYears.map((ay) => {
            if (ay.id === academicYearId) {
              return { ...ay, ...updates };
            }
            return ay;
          });
          return {
            ...s,
            academicYears: updatedAys,
          };
        }
        return s;
      }),
    );
  };

  const deleteAcademicYear = async (academicYearId: string): Promise<void> => {
    if (!activeSchool) throw new Error('No active school context');

    const target = (activeSchool.academicYears || []).find((ay) => ay.id === academicYearId);
    if (!target) throw new Error('Academic year not found.');

    if (target.isCurrent) {
      throw new Error(
        'Cannot delete the currently active academic session. Please switch or designate another year as current first.',
      );
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            academicYears: s.academicYears.filter((ay) => ay.id !== academicYearId),
          };
        }
        return s;
      }),
    );

    if (activeAcademicYearId === academicYearId) {
      const remaining = (activeSchool.academicYears || []).filter((ay) => ay.id !== academicYearId);
      setActiveAcademicYearId(remaining[0]?.id || null);
    }
  };

  const addRoleToSchool = async (
    name: string,
    code: string,
    permissions: string[],
    description?: string,
  ): Promise<RoleSummary> => {
    if (!activeSchool) throw new Error('No active school context');

    let createdRole: RoleSummary = {
      id: 'role-' + activeSchool.id + '-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      code: code.toUpperCase(),
      description,
      isSystem: false,
      permissions,
    };

    if (token) {
      try {
        const res = await fetch(`/api/schools/${activeSchool.id}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            code,
            description,
            permissions,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          createdRole = json.data;
        } else {
          throw new Error(json.message || 'Failed to create role');
        }
      } catch (err: any) {
        console.error('API error creating role:', err);
        throw err;
      }
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            roles: [...(s.roles || []).filter((r) => r.id !== createdRole.id), createdRole],
          };
        }
        return s;
      }),
    );

    refreshContext(activeSchool.id);
    return createdRole;
  };

  const updateRole = async (
    roleId: string,
    updates: { name?: string; description?: string; permissions?: string[] },
  ): Promise<RoleSummary> => {
    if (!activeSchool) throw new Error('No active school context');

    let updatedRole: RoleSummary | null = null;

    if (token) {
      try {
        const res = await fetch(`/api/schools/${activeSchool.id}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          updatedRole = json.data;
        } else {
          throw new Error(json.message || 'Failed to update role');
        }
      } catch (err: any) {
        console.error('API error updating role:', err);
        throw err;
      }
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            roles: (s.roles || []).map((r) => {
              if (r.id === roleId) {
                return (
                  updatedRole || {
                    ...r,
                    ...(updates.name ? { name: updates.name } : {}),
                    ...(updates.description !== undefined
                      ? { description: updates.description }
                      : {}),
                    ...(updates.permissions ? { permissions: updates.permissions } : {}),
                  }
                );
              }
              return r;
            }),
          };
        }
        return s;
      }),
    );

    refreshContext(activeSchool.id);
    return (
      updatedRole ||
      (activeSchool.roles || []).find((r) => r.id === roleId) || {
        id: roleId,
        name: updates.name || 'Role',
        code: 'ROLE',
        isSystem: false,
        permissions: updates.permissions || [],
      }
    );
  };

  const updateRolePermissions = async (roleId: string, permissions: string[]): Promise<void> => {
    if (!activeSchool) throw new Error('No active school context');

    if (token) {
      try {
        const res = await fetch(`/api/schools/${activeSchool.id}/roles/${roleId}/permissions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to update permissions via API');
        }
      } catch (err: any) {
        console.error('API error updating role permissions:', err);
        throw err;
      }
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            roles: (s.roles || []).map((r) => (r.id === roleId ? { ...r, permissions } : r)),
          };
        }
        return s;
      }),
    );

    refreshContext(activeSchool.id);
  };

  const deleteRoleFromSchool = async (roleId: string): Promise<void> => {
    if (!activeSchool) throw new Error('No active school context');

    if (token) {
      try {
        const res = await fetch(`/api/schools/${activeSchool.id}/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to delete role via API');
        }
      } catch (err: any) {
        console.error('API error deleting role:', err);
        throw err;
      }
    }

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === activeSchool.id) {
          return {
            ...s,
            roles: (s.roles || []).filter((r) => r.id !== roleId),
          };
        }
        return s;
      }),
    );

    refreshContext(activeSchool.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        schools: userAccessibleSchools,
        activeSchool,
        activeAcademicYear,
        currentRoles,
        currentPermissions,
        token,
        isLoading,
        login,
        logout,
        switchSchool,
        switchAcademicYear,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        createSchool,
        createAcademicYear,
        setAcademicYearAsCurrent,
        updateAcademicYear,
        deleteAcademicYear,
        addRoleToSchool,
        updateRole,
        updateRolePermissions,
        deleteRoleFromSchool,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
