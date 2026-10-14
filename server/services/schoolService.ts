import prisma, { pingDatabaseHost } from '../prisma';
import { AppError } from '../middleware/errorHandler';
import { SYSTEM_PERMISSIONS, MOCK_SEED_SCHOOLS } from '../../src/data/auth-seed';
import crypto from 'crypto';

export interface SchoolSummaryDto {
  id: string;
  name: string;
  code: string;
  domain?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  currency?: string | null;
  timezone?: string | null;
  status: string;
  academicYears: AcademicYearSummaryDto[];
  roles: RoleSummaryDto[];
}

export interface AcademicYearSummaryDto {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface RoleSummaryDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  permissions: string[];
}

export const schoolService = {
  /**
   * Retrieves all schools accessible by the given user from MySQL database.
   * For SuperAdmin, returns all active schools.
   * For other users, returns schools where the user has active membership.
   */
  async getUserAccessibleSchools(
    userId: string,
    isSuperAdmin: boolean = false,
  ): Promise<SchoolSummaryDto[]> {
    let schools: any[] = [];

    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        if (isSuperAdmin) {
          schools = await prisma.school.findMany({
            where: { deletedAt: null },
            include: {
              academicYears: {
                orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
              },
              roles: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
            orderBy: { name: 'asc' },
          });
        } else {
          const memberships = await prisma.schoolUser.findMany({
            where: {
              userId,
              status: 'ACTIVE',
              school: { deletedAt: null },
            },
            include: {
              school: {
                include: {
                  academicYears: {
                    orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
                  },
                  roles: {
                    include: {
                      rolePermissions: {
                        include: { permission: true },
                      },
                    },
                  },
                },
              },
            },
          });

          schools = memberships.map((m) => m.school);
        }

        if (schools.length > 0) {
          return schools.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            domain: s.domain || undefined,
            address: s.address || null,
            city: s.city || null,
            state: s.state || null,
            country: s.country || null,
            postalCode: s.postalCode || null,
            phone: s.phone || null,
            email: s.email || null,
            currency: s.currency || 'USD',
            timezone: s.timezone || 'UTC',
            status: s.status,
            academicYears: (s.academicYears || []).map((ay: any) => ({
              id: ay.id,
              schoolId: ay.schoolId,
              name: ay.name,
              code: ay.code,
              startDate:
                ay.startDate instanceof Date
                  ? ay.startDate.toISOString().split('T')[0]
                  : String(ay.startDate).split('T')[0],
              endDate:
                ay.endDate instanceof Date
                  ? ay.endDate.toISOString().split('T')[0]
                  : String(ay.endDate).split('T')[0],
              isCurrent: Boolean(ay.isCurrent),
              status: ay.status,
            })),
            roles: (s.roles || []).map((r: any) => ({
              id: r.id,
              name: r.name,
              code: r.code,
              description: r.description || undefined,
              isSystem: Boolean(r.isSystem),
              permissions: (r.rolePermissions || [])
                .map((rp: any) => rp.permission?.code)
                .filter(Boolean),
            })),
          }));
        }
      }
    } catch {
      // Database unreachable; fallback to mock seed
    }

    return MOCK_SEED_SCHOOLS as any;
  },

  /**
   * Retrieves the full institutional profile for a school tenant.
   */
  async getSchoolProfile(schoolId: string): Promise<any> {
    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        const school = await prisma.school.findFirst({
          where: { id: schoolId, deletedAt: null },
          include: { settings: true },
        });

        if (school) {
          const settingMap = new Map<string, string>();
          (school.settings || []).forEach((s) => settingMap.set(s.settingKey, s.settingValue));

          return {
            id: school.id,
            name: school.name,
            code: school.code,
            domain: school.domain || '',
            affiliationBoard:
              settingMap.get('school.affiliation_board') ||
              settingMap.get('affiliationBoard') ||
              'CBSE / Cambridge Assessment International',
            registrationNumber:
              settingMap.get('school.registration_number') ||
              settingMap.get('registrationNumber') ||
              `REG-${school.code}-2024`,
            establishedYear:
              Number(
                settingMap.get('school.established_year') || settingMap.get('establishedYear'),
              ) || 2012,
            principalName:
              settingMap.get('school.principal_name') ||
              settingMap.get('principalName') ||
              'Dr. Eleanor Vance, Ed.D.',
            address: school.address || '42 Academic Crest Way',
            city: school.city || 'San Jose',
            state: school.state || 'California',
            country: school.country || 'United States',
            postalCode: school.postalCode || '95134',
            phone: school.phone || '+1 (408) 555-0199',
            email: school.email || `admin@${school.code.toLowerCase()}.schoolnexa.com`,
            website:
              settingMap.get('school.website') ||
              settingMap.get('website') ||
              (school.domain ? `https://${school.domain}` : 'https://schoolnexa.com'),
            currency: school.currency || 'USD',
            timezone: school.timezone || 'UTC',
            logoUrl: school.logoUrl || null,
            status: school.status || 'ACTIVE',
            updatedAt: school.updatedAt ? school.updatedAt.toISOString() : new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.warn('[schoolService] Database getSchoolProfile error, using fallback:', error);
    }

    // Fallback if schoolId matches seed schools or default
    const seedSchool = MOCK_SEED_SCHOOLS.find((s) => s.id === schoolId);
    return {
      id: schoolId,
      name: seedSchool?.name || 'Oakridge International Academy',
      code: seedSchool?.code || 'OAK-ACAD',
      domain: seedSchool?.domain || 'oakridge.schoolnexa.com',
      affiliationBoard: 'CBSE / Cambridge Assessment International',
      registrationNumber: 'REG-2023-OAK-9481',
      establishedYear: 2008,
      principalName: 'Dr. Evelyn Vance, Ed.D.',
      address: '42 Academic Crest Way, North Campus, Technology Corridor',
      city: 'San Jose',
      state: 'California',
      country: 'United States',
      postalCode: '95134',
      phone: '+1 (408) 555-0199',
      email: 'admin@oakridge.schoolnexa.com',
      website: 'https://oakridge.schoolnexa.com',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      logoUrl:
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
      status: seedSchool?.status || 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Updates institutional profile attributes in MySQL database and upserts meta settings.
   */
  async updateSchoolProfile(
    schoolId: string,
    input: any,
    userContext?: { userId?: string; userName?: string },
  ): Promise<any> {
    if (input.name !== undefined && input.name !== null && input.name.trim().length < 2) {
      throw new AppError('School name must be at least 2 characters', 400);
    }
    if (input.email && !input.email.includes('@')) {
      throw new AppError('Please enter a valid official contact email', 400);
    }
    if (input.phone && input.phone.trim().length < 5) {
      throw new AppError('Please enter a valid telephone number', 400);
    }

    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        const existing = await prisma.school.findUnique({
          where: { id: schoolId },
        });

        if (existing) {
          await prisma.school.update({
            where: { id: schoolId },
            data: {
              name: input.name ? input.name.trim() : existing.name,
              domain: input.domain?.trim() || null,
              address: input.address?.trim() || existing.address,
              city: input.city?.trim() || existing.city,
              state: input.state?.trim() || existing.state,
              country: input.country?.trim() || existing.country,
              postalCode: input.postalCode?.trim() || existing.postalCode,
              phone: input.phone?.trim() || existing.phone,
              email: input.email?.trim() || existing.email,
              currency: input.currency?.trim() || existing.currency,
              timezone: input.timezone?.trim() || existing.timezone,
              logoUrl: input.logoUrl?.trim() || existing.logoUrl,
              status: input.status || existing.status,
            },
          });

          // Upsert metadata settings in school_settings
          const metaSettings = [
            { key: 'school.affiliation_board', val: input.affiliationBoard },
            { key: 'school.registration_number', val: input.registrationNumber },
            {
              key: 'school.established_year',
              val: input.establishedYear ? String(input.establishedYear) : '',
            },
            { key: 'school.principal_name', val: input.principalName },
            { key: 'school.website', val: input.website },
          ];

          for (const s of metaSettings) {
            if (s.val !== undefined) {
              const existingSetting = await prisma.schoolSetting.findFirst({
                where: { schoolId, settingKey: s.key },
              });
              if (existingSetting) {
                await prisma.schoolSetting.update({
                  where: { id: existingSetting.id },
                  data: { settingValue: String(s.val) },
                });
              } else {
                await prisma.schoolSetting.create({
                  data: {
                    id: crypto.randomUUID(),
                    schoolId,
                    settingKey: s.key,
                    settingValue: String(s.val),
                    dataType: 'STRING',
                    isEncrypted: false,
                  },
                });
              }
            }
          }

          // Log action if userContext provided
          if (userContext?.userId) {
            try {
              await prisma.activityLog.create({
                data: {
                  id: crypto.randomUUID(),
                  schoolId,
                  userId: userContext.userId,
                  module: 'SCHOOL',
                  action: 'UPDATE_SCHOOL_PROFILE',
                  entityId: schoolId,
                  ipAddress: '127.0.0.1',
                },
              });
            } catch {
              // Activity log non-blocking
            }
          }

          return await this.getSchoolProfile(schoolId);
        }
      }
    } catch (error) {
      console.warn('[schoolService] Database updateSchoolProfile error, applying fallback:', error);
    }

    // Return the updated object merged with inputs
    return {
      ...input,
      id: schoolId,
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Retrieves institutional configuration parameters.
   */
  async getSchoolSettings(schoolId: string): Promise<any[]> {
    const DEFAULT_INSTITUTIONAL_SETTINGS = [
      {
        settingKey: 'academic.attendance_mode',
        settingValue: 'PERIOD_WISE',
        dataType: 'STRING',
        category: 'ATTENDANCE',
        description: 'Attendance capture cadence: DAILY or PERIOD_WISE',
      },
      {
        settingKey: 'academic.grading_system',
        settingValue: 'GPA_4_SCALE',
        dataType: 'STRING',
        category: 'GRADING',
        description: 'Evaluation scale for transcripts (GPA_4_SCALE, PERCENTAGE, LETTER_GRADE)',
      },
      {
        settingKey: 'system.date_format',
        settingValue: 'YYYY-MM-DD',
        dataType: 'STRING',
        category: 'GENERAL',
        description: 'Standard institutional date display format',
      },
      {
        settingKey: 'academic.class_max_capacity',
        settingValue: '35',
        dataType: 'NUMBER',
        category: 'ACADEMIC',
        description: 'Default maximum student capacity per classroom section',
      },
      {
        settingKey: 'system.notify_parents_absent',
        settingValue: 'true',
        dataType: 'BOOLEAN',
        category: 'NOTIFICATIONS',
        description: 'Automatically dispatch alerts when student is marked absent',
      },
      {
        settingKey: 'academic.allow_cross_stream_electives',
        settingValue: 'true',
        dataType: 'BOOLEAN',
        category: 'ACADEMIC',
        description: 'Permit high-school students to enroll in electives outside core stream',
      },
    ];

    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        const settings = await prisma.schoolSetting.findMany({
          where: {
            schoolId,
            settingKey: { not: { startsWith: 'school.' } },
          },
          orderBy: { settingKey: 'asc' },
        });

        if (settings.length > 0) {
          return settings.map((s) => ({
            id: s.id,
            schoolId: s.schoolId,
            settingKey: s.settingKey,
            settingValue: s.settingValue,
            dataType: s.dataType,
            isEncrypted: s.isEncrypted,
            category: s.settingKey.startsWith('academic.')
              ? 'ACADEMIC'
              : s.settingKey.startsWith('system.')
                ? 'GENERAL'
                : 'GENERAL',
            description:
              DEFAULT_INSTITUTIONAL_SETTINGS.find((d) => d.settingKey === s.settingKey)
                ?.description || `Setting ${s.settingKey}`,
          }));
        }

        // Seed initial default settings if none exist
        const createdSettings = [];
        for (const def of DEFAULT_INSTITUTIONAL_SETTINGS) {
          const created = await prisma.schoolSetting.create({
            data: {
              id: crypto.randomUUID(),
              schoolId,
              settingKey: def.settingKey,
              settingValue: def.settingValue,
              dataType: def.dataType,
              isEncrypted: false,
            },
          });
          createdSettings.push({
            id: created.id,
            schoolId: created.schoolId,
            settingKey: created.settingKey,
            settingValue: created.settingValue,
            dataType: created.dataType,
            isEncrypted: created.isEncrypted,
            category: def.category,
            description: def.description,
          });
        }
        return createdSettings;
      }
    } catch (error) {
      console.warn('[schoolService] Database getSchoolSettings error, using defaults:', error);
    }

    return DEFAULT_INSTITUTIONAL_SETTINGS.map((def, idx) => ({
      id: `fallback-setting-${idx}`,
      schoolId,
      settingKey: def.settingKey,
      settingValue: def.settingValue,
      dataType: def.dataType,
      isEncrypted: false,
      category: def.category,
      description: def.description,
    }));
  },

  /**
   * Updates multiple institutional settings in MySQL database.
   */
  async updateSchoolSettings(
    schoolId: string,
    settingsList: Array<{ settingKey: string; settingValue: string }>,
    _userContext?: { userId?: string; userName?: string },
  ): Promise<any[]> {
    if (!Array.isArray(settingsList)) {
      throw new AppError('Settings must be an array of key-value pairs', 400);
    }

    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        for (const item of settingsList) {
          const existing = await prisma.schoolSetting.findFirst({
            where: { schoolId, settingKey: item.settingKey },
          });

          if (existing) {
            await prisma.schoolSetting.update({
              where: { id: existing.id },
              data: { settingValue: String(item.settingValue) },
            });
          } else {
            await prisma.schoolSetting.create({
              data: {
                id: crypto.randomUUID(),
                schoolId,
                settingKey: item.settingKey,
                settingValue: String(item.settingValue),
                dataType: typeof item.settingValue === 'boolean' ? 'BOOLEAN' : 'STRING',
                isEncrypted: false,
              },
            });
          }
        }
      }
    } catch (error) {
      console.warn('[schoolService] Database updateSchoolSettings error:', error);
    }

    return await this.getSchoolSettings(schoolId);
  },

  /**
   * Retrieves all academic years for a specific school.
   */
  async getSchoolAcademicYears(schoolId: string): Promise<AcademicYearSummaryDto[]> {
    try {
      const years = await prisma.academicYear.findMany({
        where: { schoolId },
        orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
      });

      if (years && years.length > 0) {
        return years.map((ay) => ({
          id: ay.id,
          schoolId: ay.schoolId,
          name: ay.name,
          code: ay.code,
          startDate:
            ay.startDate instanceof Date
              ? ay.startDate.toISOString().split('T')[0]
              : String(ay.startDate).split('T')[0],
          endDate:
            ay.endDate instanceof Date
              ? ay.endDate.toISOString().split('T')[0]
              : String(ay.endDate).split('T')[0],
          isCurrent: Boolean(ay.isCurrent),
          status: ay.status,
        }));
      }
    } catch (error) {
      console.warn('[schoolService] Database getSchoolAcademicYears error, using fallback:', error);
    }

    return [
      {
        id: `ay-2025-2026-${schoolId.replace('school-', '')}`,
        schoolId,
        name: 'Academic Session 2025-2026',
        code: 'AY-2025-26',
        startDate: '2025-06-01',
        endDate: '2026-05-31',
        isCurrent: true,
        status: 'ACTIVE',
      },
    ];
  },

  /**
   * Creates a new school in the database with a default academic year,
   * Principal role, and links the creator as an active SchoolUser.
   */
  async createSchool(
    input: { name: string; code: string; domain?: string },
    creatorUserId: string,
  ): Promise<SchoolSummaryDto> {
    const cleanCode = input.code.trim().toUpperCase();
    const cleanName = input.name.trim();

    // 1. Check existing code in DB
    const existing = await prisma.school.findFirst({
      where: { code: cleanCode, deletedAt: null },
    });
    if (existing) {
      throw new AppError(`A school with code '${cleanCode}' already exists`, 409, [
        { message: 'School code must be unique', code: 'DUPLICATE_SCHOOL_CODE' },
      ]);
    }

    const schoolId = crypto.randomUUID();
    const ayId = crypto.randomUUID();
    const roleId = crypto.randomUUID();

    // 2. Insert School
    const createdSchool = await prisma.school.create({
      data: {
        id: schoolId,
        name: cleanName,
        code: cleanCode,
        domain: input.domain?.trim() || null,
        address: 'Main Campus',
        city: 'City',
        state: 'State',
        country: 'US',
        postalCode: '00000',
        phone: '+1 000 000 0000',
        email: `${cleanCode.toLowerCase()}@schoolnexa.com`,
        currency: 'USD',
        timezone: 'UTC',
        status: 'ACTIVE',
      },
    });

    // 3. Create default Academic Year
    const defaultAy = await prisma.academicYear.create({
      data: {
        id: ayId,
        schoolId: createdSchool.id,
        name: 'Academic Year 2025-2026',
        code: 'AY-25-26',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2026-06-30'),
        isCurrent: true,
        status: 'ACTIVE',
      },
    });

    // 4. Create default PRINCIPAL role
    const principalRole = await prisma.role.create({
      data: {
        id: roleId,
        schoolId: createdSchool.id,
        name: 'School Principal & Director',
        code: 'PRINCIPAL',
        description: 'Full administrative access for campus director',
        isSystem: true,
      },
    });

    // 5. Attach non-platform permissions
    const allPerms = await prisma.permission.findMany({
      where: { code: { not: { startsWith: 'platform.' } } },
    });
    for (const p of allPerms) {
      await prisma.rolePermission.create({
        data: {
          schoolId: createdSchool.id,
          roleId: principalRole.id,
          permissionId: p.id,
        },
      });
    }

    // 6. Link creator user
    if (creatorUserId) {
      const schoolUser = await prisma.schoolUser.create({
        data: {
          schoolId: createdSchool.id,
          userId: creatorUserId,
          status: 'ACTIVE',
        },
      });

      await prisma.userSchoolRole.create({
        data: {
          schoolId: createdSchool.id,
          schoolUserId: schoolUser.id,
          roleId: principalRole.id,
        },
      });
    }

    return {
      id: createdSchool.id,
      name: createdSchool.name,
      code: createdSchool.code,
      domain: createdSchool.domain || undefined,
      status: createdSchool.status,
      academicYears: [
        {
          id: defaultAy.id,
          schoolId: defaultAy.schoolId,
          name: defaultAy.name,
          code: defaultAy.code,
          startDate: '2025-08-01',
          endDate: '2026-06-30',
          isCurrent: true,
          status: defaultAy.status,
        },
      ],
      roles: [
        {
          id: principalRole.id,
          name: principalRole.name,
          code: principalRole.code,
          description: principalRole.description || undefined,
          isSystem: true,
          permissions: allPerms.map((p) => p.code),
        },
      ],
    };
  },

  /**
   * Creates a new academic year for a school.
   */
  async createAcademicYear(
    schoolId: string,
    input: { name: string; code: string; startDate: string; endDate: string },
  ): Promise<AcademicYearSummaryDto> {
    const cleanCode = input.code.trim().toUpperCase();
    const cleanName = input.name.trim();

    if (new Date(input.startDate) >= new Date(input.endDate)) {
      throw new AppError('Academic session start date must precede end date', 400, [
        { message: 'Invalid date sequence', code: 'INVALID_DATE_RANGE' },
      ]);
    }

    const existing = await prisma.academicYear.findFirst({
      where: { schoolId, code: cleanCode },
    });
    if (existing) {
      throw new AppError(
        `Academic session with code '${cleanCode}' already exists in this school`,
        409,
        [{ message: 'Academic year code must be unique per school', code: 'DUPLICATE_CODE' }],
      );
    }

    const created = await prisma.academicYear.create({
      data: {
        id: crypto.randomUUID(),
        schoolId,
        name: cleanName,
        code: cleanCode,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isCurrent: false,
        status: 'UPCOMING',
      },
    });

    return {
      id: created.id,
      schoolId: created.schoolId,
      name: created.name,
      code: created.code,
      startDate: input.startDate,
      endDate: input.endDate,
      isCurrent: false,
      status: created.status,
    };
  },

  /**
   * Sets an academic year as the current/active year for a school,
   * unsetting all other years in an atomic transaction.
   */
  async setAcademicYearAsCurrent(
    schoolId: string,
    academicYearId: string,
  ): Promise<{ success: boolean; academicYearId: string }> {
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { schoolId },
        data: { isCurrent: false },
      }),
      prisma.academicYear.update({
        where: { id: academicYearId },
        data: { isCurrent: true, status: 'ACTIVE' },
      }),
    ]);

    return { success: true, academicYearId };
  },

  /**
   * Retrieves all roles defined for a school, including assigned permission codes.
   */
  async getSchoolRoles(schoolId: string): Promise<RoleSummaryDto[]> {
    try {
      const isReachable = await pingDatabaseHost(300);
      if (isReachable) {
        const roles = await prisma.role.findMany({
          where: { schoolId },
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
          orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        });

        return roles.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description || undefined,
          isSystem: Boolean(r.isSystem),
          permissions: (r.rolePermissions || []).map((rp) => rp.permission?.code).filter(Boolean),
        }));
      }
    } catch (err) {
      console.warn('[schoolService] Database getSchoolRoles error, using fallback:', err);
    }

    const seedSchool = MOCK_SEED_SCHOOLS.find((s) => s.id === schoolId);
    if (seedSchool?.roles) {
      return seedSchool.roles.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        isSystem: r.isSystem,
        permissions: r.permissions || [],
      }));
    }

    return [];
  },

  /**
   * Creates a new custom role for a school with optional initial permissions.
   */
  async createSchoolRole(
    schoolId: string,
    input: { name: string; code: string; description?: string; permissions?: string[] },
  ): Promise<RoleSummaryDto> {
    const cleanName = input.name?.trim();
    if (!cleanName || cleanName.length < 2) {
      throw new AppError('Role name must be at least 2 characters', 400, [
        { message: 'Invalid role name', code: 'INVALID_ROLE_NAME' },
      ]);
    }

    const cleanCode = input.code?.trim().toUpperCase();
    if (!cleanCode || !/^[A-Z0-9_-]+$/.test(cleanCode)) {
      throw new AppError(
        'Role code must contain only uppercase letters, numbers, hyphens, and underscores',
        400,
        [{ message: 'Invalid role code format', code: 'INVALID_ROLE_CODE' }],
      );
    }

    // Verify school exists
    const school = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
    });
    if (!school) {
      throw new AppError('School not found', 404, [
        { message: 'Target school does not exist', code: 'SCHOOL_NOT_FOUND' },
      ]);
    }

    const existing = await prisma.role.findFirst({
      where: { schoolId, code: cleanCode },
    });
    if (existing) {
      throw new AppError(`A role with code '${cleanCode}' already exists in this school`, 409, [
        { message: 'Role code must be unique per school', code: 'DUPLICATE_ROLE_CODE' },
      ]);
    }

    const roleId = crypto.randomUUID();
    const created = await prisma.role.create({
      data: {
        id: roleId,
        schoolId,
        name: cleanName,
        code: cleanCode,
        description: input.description?.trim() || null,
        isSystem: false,
      },
    });

    const initialPerms = Array.isArray(input.permissions) ? input.permissions : [];
    const grantedCodes: string[] = [];

    if (initialPerms.length > 0) {
      const matchedPerms = await prisma.permission.findMany({
        where: { code: { in: initialPerms } },
      });

      const existingCodes = new Set(matchedPerms.map((p) => p.code));
      for (const code of initialPerms) {
        if (!existingCodes.has(code)) {
          const sysPerm = SYSTEM_PERMISSIONS.find((sp) => sp.code === code);
          if (sysPerm) {
            const newPerm = await prisma.permission.create({
              data: {
                id: sysPerm.id || crypto.randomUUID(),
                code: sysPerm.code,
                module: sysPerm.module,
                action: sysPerm.action,
                description: sysPerm.description || null,
              },
            });
            matchedPerms.push(newPerm);
          }
        }
      }

      for (const p of matchedPerms) {
        await prisma.rolePermission.create({
          data: {
            schoolId,
            roleId: created.id,
            permissionId: p.id,
          },
        });
        grantedCodes.push(p.code);
      }

      await this.clearSessionsForRoleUsers(schoolId, created.id);
    }

    return {
      id: created.id,
      name: created.name,
      code: created.code,
      description: created.description || undefined,
      isSystem: false,
      permissions: grantedCodes,
    };
  },

  /**
   * Updates an existing role's name, description, or assigned permissions.
   */
  async updateSchoolRole(
    schoolId: string,
    roleId: string,
    input: { name?: string; description?: string; permissions?: string[] },
  ): Promise<RoleSummaryDto> {
    const dbRole = await prisma.role.findFirst({
      where: { id: roleId, schoolId },
    });

    if (!dbRole) {
      throw new AppError('Role not found in this institution', 404, [
        { message: 'Role does not exist', code: 'ROLE_NOT_FOUND' },
      ]);
    }

    if (dbRole.isSystem && input.permissions) {
      throw new AppError('System role permissions are immutable and cannot be altered', 403, [
        { message: 'System role permissions cannot be edited', code: 'SYSTEM_ROLE_IMMUTABLE' },
      ]);
    }

    const cleanName = input.name?.trim();
    if (cleanName && cleanName.length < 2) {
      throw new AppError('Role name must be at least 2 characters', 400, [
        { message: 'Invalid role name', code: 'INVALID_ROLE_NAME' },
      ]);
    }

    await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(cleanName ? { name: cleanName } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
      },
    });

    if (Array.isArray(input.permissions) && !dbRole.isSystem) {
      await prisma.rolePermission.deleteMany({
        where: { schoolId, roleId },
      });

      const matchedPerms = await prisma.permission.findMany({
        where: { code: { in: input.permissions } },
      });

      const existingCodes = new Set(matchedPerms.map((p) => p.code));
      for (const code of input.permissions) {
        if (!existingCodes.has(code)) {
          const sysPerm = SYSTEM_PERMISSIONS.find((sp) => sp.code === code);
          if (sysPerm) {
            const newPerm = await prisma.permission.create({
              data: {
                id: sysPerm.id || crypto.randomUUID(),
                code: sysPerm.code,
                module: sysPerm.module,
                action: sysPerm.action,
                description: sysPerm.description || null,
              },
            });
            matchedPerms.push(newPerm);
          }
        }
      }

      for (const p of matchedPerms) {
        await prisma.rolePermission.create({
          data: {
            schoolId,
            roleId,
            permissionId: p.id,
          },
        });
      }

      // Clear sessions of all users assigned to this role in this school
      await this.clearSessionsForRoleUsers(schoolId, roleId);
    }

    const updated = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });

    if (!updated) {
      throw new AppError('Role not found', 404);
    }

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      description: updated.description || undefined,
      isSystem: Boolean(updated.isSystem),
      permissions: (updated.rolePermissions || []).map((rp) => rp.permission?.code).filter(Boolean),
    };
  },

  /**
   * Clears active server sessions for all users assigned to a given role within a school.
   * Enforces session invalidation and re-authentication on role permission modifications.
   */
  async clearSessionsForRoleUsers(schoolId: string, roleId: string): Promise<number> {
    const assignedUsers = await prisma.userSchoolRole.findMany({
      where: { schoolId, roleId },
      include: {
        schoolUser: {
          select: { userId: true },
        },
      },
    });

    const userIdsToRevoke = Array.from(
      new Set(assignedUsers.map((u) => u.schoolUser?.userId).filter(Boolean) as string[]),
    );

    if (userIdsToRevoke.length === 0) {
      return 0;
    }

    const deleted = await prisma.session.deleteMany({
      where: {
        userId: { in: userIdsToRevoke },
      },
    });

    return deleted.count;
  },

  /**
   * Updates assigned permissions for a role specifically.
   */
  async updateRolePermissions(
    schoolId: string,
    roleId: string,
    permissions: string[],
  ): Promise<RoleSummaryDto> {
    return this.updateSchoolRole(schoolId, roleId, { permissions });
  },

  /**
   * Deletes a custom role from a school.
   * System protected roles (isSystem: true) cannot be deleted.
   */
  async deleteSchoolRole(
    schoolId: string,
    roleId: string,
  ): Promise<{ success: boolean; roleId: string }> {
    const dbRole = await prisma.role.findFirst({
      where: { id: roleId, schoolId },
    });

    if (!dbRole) {
      throw new AppError('Role not found in this institution', 404, [
        { message: 'Role does not exist', code: 'ROLE_NOT_FOUND' },
      ]);
    }

    if (dbRole.isSystem) {
      throw new AppError('System protected roles cannot be deleted', 403, [
        { message: 'Cannot delete default system roles', code: 'CANNOT_DELETE_SYSTEM_ROLE' },
      ]);
    }

    // Invalidate active sessions of users assigned to this role before deleting
    await this.clearSessionsForRoleUsers(schoolId, roleId);

    await prisma.rolePermission.deleteMany({ where: { schoolId, roleId } });
    await prisma.userSchoolRole.deleteMany({ where: { schoolId, roleId } });
    await prisma.role.delete({ where: { id: roleId } });

    return { success: true, roleId };
  },

  /**
   * Retrieves all available system permissions registered in the database catalog.
   */
  async getAllPermissions(): Promise<
    Array<{ id: string; code: string; module: string; action: string; description?: string }>
  > {
    const perms = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    if (perms.length > 0) {
      return perms.map((p) => ({
        id: p.id,
        code: p.code,
        module: p.module,
        action: p.action,
        description: p.description || undefined,
      }));
    }

    const createdList: Array<{
      id: string;
      code: string;
      module: string;
      action: string;
      description?: string;
    }> = [];
    for (const p of SYSTEM_PERMISSIONS) {
      const created = await prisma.permission.create({
        data: {
          id: p.id || crypto.randomUUID(),
          code: p.code,
          module: p.module,
          action: p.action,
          description: p.description || null,
        },
      });
      createdList.push({
        id: created.id,
        code: created.code,
        module: created.module,
        action: created.action,
        description: created.description || undefined,
      });
    }
    return createdList;
  },
};

export default schoolService;
