import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { SYSTEM_PERMISSIONS } from '../src/data/auth-seed';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SchoolNexa database seed...');

  // 1. Seed System Permissions
  console.log('1. Seeding system permissions...');
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
      create: {
        id: perm.id,
        code: perm.code,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  // 2. Seed Schools
  console.log('2. Seeding schools...');
  const schoolsData = [
    {
      id: 'school-oakridge-01',
      name: 'Oakridge International Academy',
      code: 'OAK-ACAD',
      domain: 'oakridge.schoolnexa.com',
      address: '123 Education Boulevard, Cyber City',
      city: 'Delhi',
      state: 'Delhi',
      country: 'IN',
      postalCode: '110001',
      phone: '+91 11 2345 6789',
      email: 'contact@oakridge.schoolnexa.com',
      currency: 'USD',
      timezone: 'UTC',
      status: 'ACTIVE',
    },
    {
      id: 'school-stmarys-02',
      name: "St. Mary's Grammar School",
      code: 'STM-GRAM',
      domain: 'stmarys.schoolnexa.com',
      address: '45 Church Road',
      city: 'London',
      state: 'Greater London',
      country: 'GB',
      postalCode: 'SW1A 1AA',
      phone: '+44 20 7946 0991',
      email: 'admin@stmarys.org',
      currency: 'GBP',
      timezone: 'Europe/London',
      status: 'ACTIVE',
    },
    {
      id: 'school-horizon-03',
      name: 'Horizon STEM Collegiate',
      code: 'HRZ-STEM',
      domain: 'horizon.schoolnexa.com',
      address: '789 Science Blvd',
      city: 'Austin',
      state: 'Texas',
      country: 'US',
      postalCode: '78701',
      phone: '+1 512 555 0199',
      email: 'admin@horizonstem.edu',
      currency: 'USD',
      timezone: 'America/Chicago',
      status: 'ACTIVE',
    },
  ];

  for (const s of schoolsData) {
    await prisma.school.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // 3. Seed Academic Years
  console.log('3. Seeding academic years...');
  const academicYears = [
    {
      id: 'ay-oak-2024',
      schoolId: 'school-oakridge-01',
      name: 'Academic Year 2024-2025',
      code: 'AY-24-25',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2025-06-15'),
      isCurrent: false,
      status: 'CLOSED',
    },
    {
      id: 'ay-oak-2025',
      schoolId: 'school-oakridge-01',
      name: 'Academic Year 2025-2026',
      code: 'AY-25-26',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-06-15'),
      isCurrent: true,
      status: 'ACTIVE',
    },
    {
      id: 'ay-oak-2026',
      schoolId: 'school-oakridge-01',
      name: 'Academic Year 2026-2027',
      code: 'AY-26-27',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2027-06-15'),
      isCurrent: false,
      status: 'UPCOMING',
    },
    {
      id: 'ay-stm-2025',
      schoolId: 'school-stmarys-02',
      name: 'Academic Session 2025-2026',
      code: 'AY-25-26',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-07-01'),
      isCurrent: true,
      status: 'ACTIVE',
    },
    {
      id: 'ay-hrz-2025',
      schoolId: 'school-horizon-03',
      name: 'Annual Year 2025-2026',
      code: 'AY-25-26',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-05-31'),
      isCurrent: true,
      status: 'ACTIVE',
    },
  ];

  for (const ay of academicYears) {
    await prisma.academicYear.upsert({
      where: {
        schoolId_code: {
          schoolId: ay.schoolId,
          code: ay.code,
        },
      },
      update: ay,
      create: ay,
    });
  }

  // 4. Seed Roles & Role Permissions
  console.log('4. Seeding roles and permissions...');
  const roles = [
    {
      id: 'role-oak-admin',
      schoolId: 'school-oakridge-01',
      name: 'School Principal & Director',
      code: 'PRINCIPAL',
      description: 'Full school administration access',
      isSystem: true,
      permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
        (p) => p.code,
      ),
    },
    {
      id: 'role-oak-teacher',
      schoolId: 'school-oakridge-01',
      name: 'Senior Academic Faculty',
      code: 'TEACHER',
      description: 'Teacher and faculty access',
      isSystem: false,
      permissions: [
        'teachers.view',
        'students.view',
        'attendance.take',
        'attendance.view',
        'homework.manage',
        'exams.marks.enter',
        'academics.curriculum.edit',
      ],
    },
    {
      id: 'role-oak-accountant',
      schoolId: 'school-oakridge-01',
      name: 'Bursar & Finance Lead',
      code: 'BURSAR',
      description: 'Financial collections and fees',
      isSystem: false,
      permissions: [
        'students.view',
        'finance.feestructures.manage',
        'finance.payments.collect',
        'finance.ledger.view',
        'finance.payroll.process',
      ],
    },
    {
      id: 'role-stm-admin',
      schoolId: 'school-stmarys-02',
      name: 'Headmaster Administrator',
      code: 'HEADMASTER',
      description: 'Headmaster administrative permissions',
      isSystem: true,
      permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
        (p) => p.code,
      ),
    },
    {
      id: 'role-hrz-admin',
      schoolId: 'school-horizon-03',
      name: 'Superintendent',
      code: 'SUPERINTENDENT',
      description: 'Superintendent permissions',
      isSystem: true,
      permissions: SYSTEM_PERMISSIONS.filter((p) => !p.code.startsWith('platform.')).map(
        (p) => p.code,
      ),
    },
  ];

  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: {
        schoolId_code: {
          schoolId: r.schoolId,
          code: r.code,
        },
      },
      update: {
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
      },
      create: {
        id: r.id,
        schoolId: r.schoolId,
        name: r.name,
        code: r.code,
        description: r.description,
        isSystem: r.isSystem,
      },
    });

    // Seed Role Permissions
    for (const pCode of r.permissions) {
      const p = SYSTEM_PERMISSIONS.find((perm) => perm.code === pCode);
      if (p) {
        await prisma.rolePermission.upsert({
          where: {
            schoolId_roleId_permissionId: {
              schoolId: r.schoolId,
              roleId: roleRecord.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            schoolId: r.schoolId,
            roleId: roleRecord.id,
            permissionId: p.id,
          },
        });
      }
    }
  }

  // 5. Seed Users & Memberships
  console.log('5. Seeding users and staff memberships...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      id: 'user-alex-super',
      email: 'alex.director@schoolnexa.com',
      fullName: 'Dr. Alexander Wright',
      phone: '+1 (555) 234-5678',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isSuperAdmin: true,
      memberships: [
        { schoolId: 'school-oakridge-01', roleCode: 'PRINCIPAL' },
        { schoolId: 'school-stmarys-02', roleCode: 'HEADMASTER' },
        { schoolId: 'school-horizon-03', roleCode: 'SUPERINTENDENT' },
      ],
    },
    {
      id: 'user-clara-teacher',
      email: 'clara.mendez@oakridge.edu',
      fullName: 'Clara Mendez (M.Sc.)',
      phone: '+1 (555) 890-1234',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isSuperAdmin: false,
      memberships: [{ schoolId: 'school-oakridge-01', roleCode: 'TEACHER' }],
    },
    {
      id: 'user-marcus-finance',
      email: 'marcus.vance@oakridge.edu',
      fullName: 'Marcus Vance, CPA',
      phone: '+1 (555) 456-7890',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isSuperAdmin: false,
      memberships: [{ schoolId: 'school-oakridge-01', roleCode: 'BURSAR' }],
    },
  ];

  for (const u of users) {
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        isSuperAdmin: u.isSuperAdmin,
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      create: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        isSuperAdmin: u.isSuperAdmin,
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
    });

    for (const mem of u.memberships) {
      const schoolUser = await prisma.schoolUser.upsert({
        where: {
          schoolId_userId: {
            schoolId: mem.schoolId,
            userId: userRecord.id,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          schoolId: mem.schoolId,
          userId: userRecord.id,
          status: 'ACTIVE',
        },
      });

      const role = await prisma.role.findFirst({
        where: { schoolId: mem.schoolId, code: mem.roleCode },
      });

      if (role) {
        await prisma.userSchoolRole.upsert({
          where: {
            schoolId_schoolUserId_roleId: {
              schoolId: mem.schoolId,
              schoolUserId: schoolUser.id,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            schoolId: mem.schoolId,
            schoolUserId: schoolUser.id,
            roleId: role.id,
          },
        });
      }
    }
  }

  // 6. Seed Classes and Academic Year Sections
  console.log('6. Seeding classes and sections...');
  const classes = [
    {
      id: 'cls-oak-g8',
      schoolId: 'school-oakridge-01',
      name: 'Grade 8',
      code: 'G8',
      numericOrder: 8,
    },
    {
      id: 'cls-oak-g9',
      schoolId: 'school-oakridge-01',
      name: 'Grade 9',
      code: 'G9',
      numericOrder: 9,
    },
    {
      id: 'cls-oak-g10',
      schoolId: 'school-oakridge-01',
      name: 'Grade 10',
      code: 'G10',
      numericOrder: 10,
    },
  ];

  for (const c of classes) {
    await prisma.class.upsert({
      where: {
        schoolId_code: {
          schoolId: c.schoolId,
          code: c.code,
        },
      },
      update: c,
      create: c,
    });
  }

  const sections = [
    {
      id: 'sec-oak-8a',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g8',
      sectionName: 'A',
      maxCapacity: 40,
    },
    {
      id: 'sec-oak-8b',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g8',
      sectionName: 'B',
      maxCapacity: 40,
    },
    {
      id: 'sec-oak-9a',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g9',
      sectionName: 'A',
      maxCapacity: 40,
    },
    {
      id: 'sec-oak-9b',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g9',
      sectionName: 'B',
      maxCapacity: 40,
    },
    {
      id: 'sec-oak-10a',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g10',
      sectionName: 'A',
      maxCapacity: 40,
    },
    {
      id: 'sec-oak-10b',
      schoolId: 'school-oakridge-01',
      academicYearId: 'ay-oak-2025',
      classId: 'cls-oak-g10',
      sectionName: 'B',
      maxCapacity: 40,
    },
  ];

  for (const sec of sections) {
    await prisma.academicYearSection.upsert({
      where: {
        schoolId_academicYearId_classId_sectionName: {
          schoolId: sec.schoolId,
          academicYearId: sec.academicYearId,
          classId: sec.classId,
          sectionName: sec.sectionName,
        },
      },
      update: sec,
      create: sec,
    });
  }

  // 7. Seed Student Identities, Students, Parents and Enrollments
  console.log('7. Seeding students and enrollments...');
  const studentSeeds = [
    {
      id: 'stu-oak-001',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-001',
        nationalId: 'NAT-IND-4521',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-DEL-154',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: new Date('2026-01-10'),
      },
      admissionNumber: 'ADM-2026-001',
      activeAdmissionNumber: 'ADM-2026-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      gender: 'MALE',
      dateOfBirth: new Date('2015-04-15'),
      bloodGroup: 'B+',
      address: 'Flat 402, Shivam Residency, Sector 14, Rohini',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110085',
      emergencyContact: 'Ramesh Sharma',
      emergencyPhone: '+1 (555) 201-4452',
      parent: {
        id: 'par-001',
        fullName: 'Ramesh Sharma',
        primaryPhone: '+1 (555) 201-4452',
        occupation: 'Senior Software Engineer',
        currentAddress: 'Flat 402, Shivam Residency, Sector 14, Rohini',
        relationship: 'FATHER',
      },
      enrollment: {
        id: 'enr-001',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-8a',
        rollNumber: 12,
      },
    },
    {
      id: 'stu-oak-002',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-002',
        nationalId: 'NAT-IND-9832',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-CHE-890',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: new Date('2026-01-12'),
      },
      admissionNumber: 'ADM-2026-002',
      activeAdmissionNumber: 'ADM-2026-002',
      firstName: 'Ananya',
      lastName: 'Iyer',
      gender: 'FEMALE',
      dateOfBirth: new Date('2014-08-22'),
      bloodGroup: 'O+',
      address: 'B-12, Greenfield Apartments, Adyar Canal Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600020',
      emergencyContact: 'Raman Iyer',
      emergencyPhone: '+1 (555) 741-2558',
      parent: {
        id: 'par-002',
        fullName: 'Raman Iyer',
        primaryPhone: '+1 (555) 741-2558',
        occupation: 'Chartered Accountant',
        currentAddress: 'B-12, Greenfield Apartments, Adyar Canal Road',
        relationship: 'FATHER',
      },
      enrollment: {
        id: 'enr-002',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-8b',
        rollNumber: 5,
      },
    },
    {
      id: 'stu-oak-003',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-003',
        nationalId: 'NAT-IND-1145',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-AHM-442',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: null,
      },
      admissionNumber: 'ADM-2026-003',
      activeAdmissionNumber: 'ADM-2026-003',
      firstName: 'Aarav',
      lastName: 'Patel',
      gender: 'MALE',
      dateOfBirth: new Date('2016-01-10'),
      bloodGroup: 'A+',
      address: '34, Shantiniketan Society, Satellite Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380015',
      emergencyContact: 'Jayesh Patel',
      emergencyPhone: '+1 (555) 426-0338',
      parent: {
        id: 'par-003',
        fullName: 'Jayesh Patel',
        primaryPhone: '+1 (555) 426-0338',
        occupation: 'Civil Engineer',
        currentAddress: '34, Shantiniketan Society, Satellite Road',
        relationship: 'FATHER',
      },
      enrollment: {
        id: 'enr-003',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-9a',
        rollNumber: 2,
      },
    },
    {
      id: 'stu-oak-004',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-004',
        nationalId: 'NAT-IND-7712',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-KOL-913',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: new Date('2026-02-01'),
      },
      admissionNumber: 'ADM-2026-004',
      activeAdmissionNumber: 'ADM-2026-004',
      firstName: 'Tanya',
      lastName: 'Sengupta',
      gender: 'FEMALE',
      dateOfBirth: new Date('2013-11-05'),
      bloodGroup: 'AB+',
      address: '58/2, Southern Avenue',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700029',
      emergencyContact: 'Debashish Sengupta',
      emergencyPhone: '+1 (555) 332-9014',
      parent: {
        id: 'par-004',
        fullName: 'Debashish Sengupta',
        primaryPhone: '+1 (555) 332-9014',
        occupation: 'Physician',
        currentAddress: '58/2, Southern Avenue',
        relationship: 'FATHER',
      },
      enrollment: {
        id: 'enr-004',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-9b',
        rollNumber: 18,
      },
    },
    {
      id: 'stu-oak-005',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-005',
        nationalId: 'NAT-IND-6651',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-LKO-204',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: null,
      },
      admissionNumber: 'ADM-2026-005',
      activeAdmissionNumber: 'ADM-2026-005',
      firstName: 'Mohammed',
      lastName: 'Zaid',
      gender: 'MALE',
      dateOfBirth: new Date('2015-09-18'),
      bloodGroup: 'O-',
      address: '14-B, Hazratganj Main Road',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      postalCode: '226001',
      emergencyContact: 'Tariq Zaid',
      emergencyPhone: '+1 (555) 522-7819',
      enrollment: {
        id: 'enr-005',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-10a',
        rollNumber: 21,
      },
    },
    {
      id: 'stu-oak-006',
      schoolId: 'school-oakridge-01',
      identity: {
        id: 'ident-006',
        nationalId: 'NAT-IND-3390',
        idType: 'NATIONAL_ID',
        birthCertNo: 'BC-PUN-771',
        nationality: 'Indian',
        countryOfBirth: 'India',
        verifiedAt: new Date('2026-01-20'),
      },
      admissionNumber: 'ADM-2026-006',
      activeAdmissionNumber: null, // Inactive
      firstName: 'Priya',
      lastName: 'Deshmukh',
      gender: 'FEMALE',
      dateOfBirth: new Date('2012-07-30'),
      bloodGroup: 'B+',
      address: '202, Prabhat Road, Lane 4, Erandwane',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411004',
      emergencyContact: 'Vilas Deshmukh',
      emergencyPhone: '+1 (555) 202-6110',
      enrollment: {
        id: 'enr-006',
        academicYearId: 'ay-oak-2025',
        academicYearSectionId: 'sec-oak-10b',
        rollNumber: 9,
      },
    },
  ];

  for (const s of studentSeeds) {
    // 1. Identity
    const ident = await prisma.studentIdentity.upsert({
      where: { nationalId: s.identity.nationalId },
      update: s.identity,
      create: s.identity,
    });

    // 2. Student
    const student = await prisma.student.upsert({
      where: { id: s.id },
      update: {
        schoolId: s.schoolId,
        studentIdentityId: ident.id,
        admissionNumber: s.admissionNumber,
        activeAdmissionNumber: s.activeAdmissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        bloodGroup: s.bloodGroup,
        address: s.address,
        city: s.city,
        state: s.state,
        postalCode: s.postalCode,
        emergencyContact: s.emergencyContact,
        emergencyPhone: s.emergencyPhone,
      },
      create: {
        id: s.id,
        schoolId: s.schoolId,
        studentIdentityId: ident.id,
        admissionNumber: s.admissionNumber,
        activeAdmissionNumber: s.activeAdmissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        bloodGroup: s.bloodGroup,
        address: s.address,
        city: s.city,
        state: s.state,
        postalCode: s.postalCode,
        emergencyContact: s.emergencyContact,
        emergencyPhone: s.emergencyPhone,
      },
    });

    // 3. Parent & Relationship (if present)
    if (s.parent) {
      const parent = await prisma.parent.upsert({
        where: { id: s.parent.id },
        update: {
          primaryPhone: s.parent.primaryPhone,
          occupation: s.parent.occupation,
          currentAddress: s.parent.currentAddress,
        },
        create: {
          id: s.parent.id,
          primaryPhone: s.parent.primaryPhone,
          occupation: s.parent.occupation,
          currentAddress: s.parent.currentAddress,
        },
      });

      await prisma.parentStudent.upsert({
        where: {
          schoolId_parentId_studentId: {
            schoolId: s.schoolId,
            parentId: parent.id,
            studentId: student.id,
          },
        },
        update: {
          relationship: s.parent.relationship,
          isPrimaryContact: true,
          canPickup: true,
        },
        create: {
          schoolId: s.schoolId,
          parentId: parent.id,
          studentId: student.id,
          relationship: s.parent.relationship,
          isPrimaryContact: true,
          canPickup: true,
        },
      });
    }

    // 4. Enrollment
    if (s.enrollment) {
      await prisma.enrollment.upsert({
        where: {
          schoolId_studentId_academicYearId: {
            schoolId: s.schoolId,
            studentId: student.id,
            academicYearId: s.enrollment.academicYearId,
          },
        },
        update: {
          academicYearSectionId: s.enrollment.academicYearSectionId,
          rollNumber: s.enrollment.rollNumber,
          status: s.activeAdmissionNumber ? 'ACTIVE' : 'DROPPED',
        },
        create: {
          id: s.enrollment.id,
          schoolId: s.schoolId,
          studentId: student.id,
          academicYearId: s.enrollment.academicYearId,
          academicYearSectionId: s.enrollment.academicYearSectionId,
          rollNumber: s.enrollment.rollNumber,
          status: s.activeAdmissionNumber ? 'ACTIVE' : 'DROPPED',
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Default Admin Account:');
  console.log('Email:    alex.director@schoolnexa.com');
  console.log('Password: password123');
  console.log('School:   Oakridge International Academy (school-oakridge-01)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
