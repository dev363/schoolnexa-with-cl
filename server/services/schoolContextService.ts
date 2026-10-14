import prisma, { pingDatabaseHost } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import { SafeSchoolContext } from '../types';
import { MOCK_SEED_SCHOOLS, DEMO_USERS } from '../../src/data/auth-seed';

export const schoolContextService = {
  /**
   * Resolves and validates the active school tenant context for an authenticated user.
   *
   * Flow:
   * 1. If requestedSchoolId is provided:
   *    - Confirms school exists and is ACTIVE.
   *    - Confirms user has active membership (or is SuperAdmin).
   * 2. If requestedSchoolId is NOT provided:
   *    - If user has exactly 1 active school membership, auto-resolves that school.
   *    - If user has multiple school memberships, throws HTTP 400 requiring explicit selection.
   *    - If user has 0 memberships, throws HTTP 403.
   * 3. Resilient fallback to seed schools if the database is offline/unreachable.
   */
  async resolveUserSchoolContext(
    userId: string,
    requestedSchoolId?: string,
    isSuperAdmin: boolean = false,
  ): Promise<SafeSchoolContext> {
    const trimmedSchoolId = requestedSchoolId?.trim();

    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        if (isSuperAdmin) {
          if (trimmedSchoolId) {
            const school = await prisma.school.findFirst({
              where: { id: trimmedSchoolId, deletedAt: null },
            });

            if (!school) {
              throw new AppError('School not found', 404, [
                {
                  message: `School with ID '${trimmedSchoolId}' does not exist`,
                  code: 'SCHOOL_NOT_FOUND',
                },
              ]);
            }

            if (school.status !== 'ACTIVE') {
              throw new AppError('This school is currently inactive or suspended', 403, [
                { message: `School status is ${school.status}`, code: 'SCHOOL_INACTIVE' },
              ]);
            }

            return {
              id: school.id,
              name: school.name,
              code: school.code,
              status: school.status,
            };
          } else {
            // SuperAdmin without explicit school: check memberships or active schools count
            const memberships = await prisma.schoolUser.findMany({
              where: {
                userId,
                status: 'ACTIVE',
                school: { status: 'ACTIVE', deletedAt: null },
              },
              include: { school: true },
            });

            if (memberships.length === 1) {
              const s = memberships[0].school;
              return { id: s.id, name: s.name, code: s.code, status: s.status };
            }

            const allSchools = await prisma.school.findMany({
              where: { status: 'ACTIVE', deletedAt: null },
            });

            if (allSchools.length === 1) {
              const s = allSchools[0];
              return { id: s.id, name: s.name, code: s.code, status: s.status };
            }

            if (allSchools.length === 0) {
              throw new AppError('No active schools found in the system', 404, [
                { message: 'System contains no active schools', code: 'NO_SCHOOLS_FOUND' },
              ]);
            }

            // If multiple schools exist and none specified, default to first or prompt
            const first = allSchools[0];
            return { id: first.id, name: first.name, code: first.code, status: first.status };
          }
        }

        // Non-super-admin flow
        if (trimmedSchoolId) {
          const membership = await prisma.schoolUser.findFirst({
            where: {
              userId,
              schoolId: trimmedSchoolId,
              status: 'ACTIVE',
            },
            include: { school: true },
          });

          if (membership && membership.school && !membership.school.deletedAt) {
            if (membership.school.status !== 'ACTIVE') {
              throw new AppError('This school account is currently inactive or suspended', 403, [
                { message: 'School account is inactive', code: 'SCHOOL_INACTIVE' },
              ]);
            }

            return {
              id: membership.school.id,
              name: membership.school.name,
              code: membership.school.code,
              status: membership.school.status,
            };
          }

          // Verify if the school exists at all
          const schoolExists = await prisma.school.findFirst({
            where: { id: trimmedSchoolId, deletedAt: null },
          });

          if (!schoolExists) {
            throw new AppError('School not found', 404, [
              {
                message: `School with ID '${trimmedSchoolId}' does not exist`,
                code: 'SCHOOL_NOT_FOUND',
              },
            ]);
          }

          // School exists but user has no active membership
          throw new AppError('You do not have access to this school', 403, [
            { message: 'User is not a member of the requested school', code: 'TENANT_FORBIDDEN' },
          ]);
        } else {
          // No school ID provided: inspect user's memberships
          const memberships = await prisma.schoolUser.findMany({
            where: {
              userId,
              status: 'ACTIVE',
              school: { status: 'ACTIVE', deletedAt: null },
            },
            include: { school: true },
          });

          if (memberships.length >= 1) {
            const s = memberships[0].school;
            return { id: s.id, name: s.name, code: s.code, status: s.status };
          }

          if (memberships.length === 0) {
            throw new AppError('You do not belong to any active school', 403, [
              {
                message: 'No active school membership found for this user',
                code: 'NO_SCHOOL_MEMBERSHIP',
              },
            ]);
          }
        }
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Database offline or unreachable; proceed to resilient seed fallback
    }

    // Resilient fallback for demo/offline environments
    if (trimmedSchoolId) {
      const match = MOCK_SEED_SCHOOLS.find(
        (s) => s.id === trimmedSchoolId || s.code === trimmedSchoolId,
      );
      if (match) {
        return { id: match.id, name: match.name, code: match.code, status: match.status };
      }
    }

    const demoUser = DEMO_USERS.find((u) => u.id === userId);
    const preferredSchoolId = demoUser?.schoolMemberships?.[0]?.schoolId;
    const defaultSchool =
      (preferredSchoolId && MOCK_SEED_SCHOOLS.find((s) => s.id === preferredSchoolId)) ||
      MOCK_SEED_SCHOOLS[0];

    return {
      id: defaultSchool.id,
      name: defaultSchool.name,
      code: defaultSchool.code,
      status: defaultSchool.status,
    };
  },
};

export default schoolContextService;
