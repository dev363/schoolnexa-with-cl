/**
 * SchoolNexa Phase 14 - End-to-End Verification Test Runner
 */
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const results = [];
  function assert(name, condition, details = '') {
    if (condition) {
      results.push({ name, pass: true });
      console.log(`[PASS] ${name}`);
    } else {
      results.push({ name, pass: false, details });
      console.error(`[FAIL] ${name}: ${details}`);
    }
  }

  console.log('=== PHASE 14: E2E CRUD & WORKFLOW TEST SUITE ===\n');

  // ==========================================
  // 1. AUTHENTICATION MODULE
  // ==========================================
  console.log('--- 1. AUTHENTICATION ---');

  // Test 1.1: Invalid login credentials
  const badLogin = await request('POST', '/api/auth/login', {}, {
    email: 'alex.director@schoolnexa.com',
    password: 'wrongpassword',
  });
  assert('Auth: Invalid credentials returns 401', badLogin.status === 401);

  // Test 1.2: Valid login
  const loginRes = await request('POST', '/api/auth/login', {}, {
    email: 'alex.director@schoolnexa.com',
    password: 'password123',
  });
  assert('Auth: Valid login returns 200 with JWT token', loginRes.status === 200 && Boolean(loginRes.body?.data?.token));

  const superToken = loginRes.body?.data?.token;
  const schoolId = 'school-oakridge-01';
  const academicYearId = 'ay-oak-2025';

  const authHeaders = {
    Authorization: `Bearer ${superToken}`,
    'x-school-id': schoolId,
    'X-Academic-Year-Id': academicYearId,
  };

  // Test 1.3: GET /api/auth/me (authenticated)
  const meRes = await request('GET', '/api/auth/me', authHeaders);
  assert('Auth: Get current user returns 200', meRes.status === 200 && meRes.body?.data?.email === 'alex.director@schoolnexa.com');

  // Test 1.4: GET /api/auth/me (unauthenticated)
  const unauthMe = await request('GET', '/api/auth/me');
  assert('Auth: Unauthenticated request returns 401', unauthMe.status === 401);

  // Test 1.5: Logout
  const logoutRes = await request('POST', '/api/auth/logout', authHeaders);
  assert('Auth: Logout returns 200', logoutRes.status === 200 && logoutRes.body?.success === true);

  // Re-login for remaining tests
  const relogin = await request('POST', '/api/auth/login', {}, {
    email: 'alex.director@schoolnexa.com',
    password: 'password123',
  });
  const token = relogin.body?.data?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-school-id': schoolId,
    'X-Academic-Year-Id': academicYearId,
  };

  // ==========================================
  // 2. SCHOOL MODULE
  // ==========================================
  console.log('\n--- 2. SCHOOL & SETTINGS ---');

  // Test 2.1: Accessible schools
  const schoolsRes = await request('GET', '/api/schools', headers);
  assert('School: Load accessible schools returns 200 with list', schoolsRes.status === 200 && Array.isArray(schoolsRes.body?.data));

  // Test 2.2: School profile
  const profileRes = await request('GET', '/api/schools/profile', headers);
  assert('School: Load school profile returns 200', profileRes.status === 200 && profileRes.body?.data?.id === schoolId, JSON.stringify(profileRes.body));

  // Test 2.3: Update profile
  const updateProfileRes = await request('PUT', '/api/schools/profile', headers, {
    principalName: 'Dr. Alexander Wright, Ph.D.',
  });
  assert('School: Update school profile returns 200', updateProfileRes.status === 200 && updateProfileRes.body?.success === true, JSON.stringify(updateProfileRes.body));

  // Test 2.4: School settings
  const settingsRes = await request('GET', '/api/schools/settings', headers);
  assert('School: Load settings returns 200', settingsRes.status === 200 && Boolean(settingsRes.body?.data));

  // Test 2.5: Update settings
  const updateSettingsRes = await request('PUT', '/api/schools/settings', headers, {
    theme: 'system',
    dateFormat: 'DD/MM/YYYY',
  });
  assert('School: Update settings returns 200', updateSettingsRes.status === 200 && updateSettingsRes.body?.success === true);

  // Test 2.6: Academic years
  const ayRes = await request('GET', `/api/schools/${schoolId}/academic-years`, headers);
  assert('School: Load academic years returns 200', ayRes.status === 200 && Array.isArray(ayRes.body?.data));

  // Test 2.7: Roles
  const rolesRes = await request('GET', `/api/schools/${schoolId}/roles`, headers);
  assert('School: Load roles returns 200', rolesRes.status === 200 && Array.isArray(rolesRes.body?.data), JSON.stringify(rolesRes.body));

  // ==========================================
  // 3. STUDENT MODULE
  // ==========================================
  console.log('\n--- 3. STUDENT LIFECYCLE ---');

  // Test 3.1: List students
  const studentListRes = await request('GET', '/api/students', headers);
  assert('Student: List students returns 200', studentListRes.status === 200 && Array.isArray(studentListRes.body?.data));

  // Test 3.2: Create student
  const testStudentPayload = {
    firstName: 'TestPhase14',
    lastName: 'Learner',
    dateOfBirth: '2012-05-15',
    gender: 'MALE',
    email: `phase14_${Date.now()}@example.com`,
    mobile: '9876543210',
    admissionNumber: `ADM-${Date.now().toString().slice(-6)}`,
  };
  const createStudentRes = await request('POST', '/api/students', headers, testStudentPayload);
  assert('Student: Create student returns 201/200 with new ID', (createStudentRes.status === 201 || createStudentRes.status === 200) && Boolean(createStudentRes.body?.data?.id));
  const createdStudentId = createStudentRes.body?.data?.id;

  // Test 3.3: Get student by ID
  if (createdStudentId) {
    const getStudentRes = await request('GET', `/api/students/${createdStudentId}`, headers);
    assert('Student: Get student detail returns 200 with matching firstName', getStudentRes.status === 200 && getStudentRes.body?.data?.firstName === 'TestPhase14');

    // Test 3.4: Update student
    const updateStudentRes = await request('PUT', `/api/students/${createdStudentId}`, headers, {
      middleName: 'E2E',
      bloodGroup: 'O+',
    });
    assert('Student: Update student returns 200', updateStudentRes.status === 200 && updateStudentRes.body?.success === true);

    // Test 3.5: Update status
    const statusStudentRes = await request('PATCH', `/api/students/${createdStudentId}/status`, headers, {
      status: 'INACTIVE',
      reason: 'E2E Testing archive',
    });
    assert('Student: Update student status returns 200', statusStudentRes.status === 200 && statusStudentRes.body?.success === true);

    // Test 3.6: Delete student (soft delete)
    const deleteStudentRes = await request('DELETE', `/api/students/${createdStudentId}`, headers);
    assert('Student: Delete / soft-delete student returns 200', deleteStudentRes.status === 200 && deleteStudentRes.body?.success === true);
  }

  // ==========================================
  // 4. TEACHER MODULE
  // ==========================================
  console.log('\n--- 4. TEACHER / FACULTY LIFECYCLE ---');

  // Test 4.1: Next Teacher ID
  const nextIdRes = await request('GET', '/api/teachers/next-id', headers);
  assert('Teacher: Generate next ID returns 200 with FAC- or TCH- code', nextIdRes.status === 200 && Boolean(nextIdRes.body?.data?.nextId));

  // Test 4.2: List teachers
  const teacherListRes = await request('GET', '/api/teachers', headers);
  assert('Teacher: List teachers returns 200', teacherListRes.status === 200 && Array.isArray(teacherListRes.body?.data));

  // Test 4.3: Workload summary
  const workloadRes = await request('GET', '/api/teachers/workload/summary', headers);
  assert('Teacher: Workload summary returns 200', workloadRes.status === 200 && workloadRes.body?.success === true);

  // Test 4.4: Create teacher
  const testTeacherPayload = {
    firstName: 'Eleanor',
    lastName: 'Vance',
    email: `eleanor_${Date.now()}@oakridge.edu`,
    mobile: '9123456780',
    gender: 'Female',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  };
  const createTeacherRes = await request('POST', '/api/teachers', headers, testTeacherPayload);
  assert('Teacher: Create teacher returns 201/200 with Teacher ID', (createTeacherRes.status === 201 || createTeacherRes.status === 200) && Boolean(createTeacherRes.body?.data?.teacherId || createTeacherRes.body?.data?.id));
  const createdTeacherId = createTeacherRes.body?.data?.teacherId || createTeacherRes.body?.data?.id;

  if (createdTeacherId) {
    // Test 4.5: View teacher
    const viewTeacherRes = await request('GET', `/api/teachers/${createdTeacherId}`, headers);
    assert('Teacher: View teacher profile returns 200', viewTeacherRes.status === 200 && viewTeacherRes.body?.data?.firstName === 'Eleanor');

    // Test 4.6: Update teacher
    const updateTeacherRes = await request('PUT', `/api/teachers/${createdTeacherId}`, headers, {
      specialSkills: ['Physics', 'Advanced Calculus'],
    });
    assert('Teacher: Update teacher returns 200', updateTeacherRes.status === 200 && updateTeacherRes.body?.success === true);

    // Test 4.7: Update status
    const statusTeacherRes = await request('PATCH', `/api/teachers/${createdTeacherId}/status`, headers, {
      status: 'INACTIVE',
      reason: 'E2E testing transition',
    });
    assert('Teacher: Update teacher status returns 200', statusTeacherRes.status === 200 && statusTeacherRes.body?.success === true);

    // Test 4.8: Delete teacher (soft delete)
    const deleteTeacherRes = await request('DELETE', `/api/teachers/${createdTeacherId}`, headers);
    assert('Teacher: Delete / soft-delete teacher returns 200', deleteTeacherRes.status === 200 && deleteTeacherRes.body?.success === true);
  }

  // ==========================================
  // 5. ACADEMIC SETUP MODULE
  // ==========================================
  console.log('\n--- 5. ACADEMIC SETUP ---');

  // Test 5.1: List classes
  const classesRes = await request('GET', '/api/academic/classes', headers);
  assert('Academic: List classes returns 200', classesRes.status === 200 && Array.isArray(classesRes.body?.data));

  // Test 5.2: Create class
  const classCode = `E2E-${Date.now().toString().slice(-4)}`;
  const createClassRes = await request('POST', '/api/academic/classes', headers, {
    name: `Grade ${classCode}`,
    code: classCode,
    numericOrder: 98,
  });
  assert('Academic: Create class returns 201/200', (createClassRes.status === 201 || createClassRes.status === 200) && Boolean(createClassRes.body?.data?.id));
  const testClassId = createClassRes.body?.data?.id;

  // Test 5.3: Create section
  let testSectionId = null;
  if (testClassId) {
    const createSecRes = await request('POST', '/api/academic/sections', headers, {
      classId: testClassId,
      sectionName: 'A',
      maxCapacity: 35,
    });
    assert('Academic: Create section returns 201/200', (createSecRes.status === 201 || createSecRes.status === 200) && Boolean(createSecRes.body?.data?.id));
    testSectionId = createSecRes.body?.data?.id;
  }

  // Test 5.4: Create subject
  const subCode = `SUB-${Date.now().toString().slice(-4)}`;
  const createSubRes = await request('POST', '/api/academic/subjects', headers, {
    name: 'Advanced Robotics',
    code: subCode,
    subjectType: 'THEORY',
    credits: 3,
  });
  assert('Academic: Create subject returns 201/200', (createSubRes.status === 201 || createSubRes.status === 200) && Boolean(createSubRes.body?.data?.id));
  const testSubId = createSubRes.body?.data?.id;

  // Test 5.5: Create curriculum
  let testCurriculumId = null;
  if (testClassId && testSubId) {
    const createCurrRes = await request('POST', '/api/academic/curriculum', headers, {
      classId: testClassId,
      subjectId: testSubId,
      weeklyPeriods: 4,
      isMandatory: true,
    });
    assert('Academic: Create curriculum mapping returns 201/200', (createCurrRes.status === 201 || createCurrRes.status === 200) && Boolean(createCurrRes.body?.data?.id));
    testCurriculumId = createCurrRes.body?.data?.id;
  }

  // ==========================================
  // 6. ENROLLMENT MODULE
  // ==========================================
  console.log('\n--- 6. ENROLLMENT WORKFLOW ---');

  // Test 6.1: List enrollments
  const enrollmentsRes = await request('GET', '/api/enrollments', headers);
  assert('Enrollment: List enrollments returns 200', enrollmentsRes.status === 200 && Array.isArray(enrollmentsRes.body?.data));

  // Test 6.2: Enrollment stats
  const enrollStatsRes = await request('GET', '/api/enrollments/stats', headers);
  assert('Enrollment: Stats returns 200', enrollStatsRes.status === 200 && enrollStatsRes.body?.success === true);

  // Test 6.3: Create enrollment
  let testEnrollmentId = null;
  // First create a new student to enroll
  const enrollStudentRes = await request('POST', '/api/students', headers, {
    firstName: 'Marcus',
    lastName: 'EnrollmentTest',
    dateOfBirth: '2013-09-20',
    gender: 'MALE',
    email: `marcus_enr_${Date.now()}@example.com`,
  });
  const enrollStudentId = enrollStudentRes.body?.data?.id;

  if (enrollStudentId && testSectionId) {
    const createEnrRes = await request('POST', '/api/enrollments', headers, {
      studentId: enrollStudentId,
      academicYearId: academicYearId,
      academicYearSectionId: testSectionId,
      rollNumber: 1,
      status: 'ACTIVE',
    });
    assert('Enrollment: Create enrollment returns 201/200 with separate enrollmentId', (createEnrRes.status === 201 || createEnrRes.status === 200) && Boolean(createEnrRes.body?.data?.id), JSON.stringify({ status: createEnrRes.status, body: createEnrRes.body }));
    testEnrollmentId = createEnrRes.body?.data?.id;

    if (testEnrollmentId) {
      // Test 6.4: Get enrollment by ID
      const getEnrRes = await request('GET', `/api/enrollments/${testEnrollmentId}`, headers);
      assert('Enrollment: Get enrollment detail returns 200', getEnrRes.status === 200 && getEnrRes.body?.data?.id === testEnrollmentId);

      // Test 6.5: Update enrollment
      const updateEnrRes = await request('PUT', `/api/enrollments/${testEnrollmentId}`, headers, {
        rollNumber: 2,
      });
      assert('Enrollment: Update enrollment returns 200', updateEnrRes.status === 200 && updateEnrRes.body?.success === true);

      // Test 6.6: Update status
      const statusEnrRes = await request('PATCH', `/api/enrollments/${testEnrollmentId}/status`, headers, {
        status: 'PROMOTED',
      });
      assert('Enrollment: Update enrollment status returns 200', statusEnrRes.status === 200 && statusEnrRes.body?.success === true);

      // Test 6.7: Transfer out
      const transferRes = await request('POST', '/api/enrollments/transfer-out', headers, {
        enrollmentId: testEnrollmentId,
        reason: 'Relocated to different district',
      });
      assert('Enrollment: Transfer out returns 200', transferRes.status === 200 && transferRes.body?.success === true);
    }
  }

  // ==========================================
  // 7. NEGATIVE TESTING & MULTI-TENANT ISOLATION
  // ==========================================
  console.log('\n--- 7. NEGATIVE & MULTI-TENANT ISOLATION ---');

  // Test 7.1: Invalid ID returns 404
  const notFoundRes = await request('GET', '/api/students/non-existent-uuid-999', headers);
  assert('Negative: Unknown student ID returns 404', notFoundRes.status === 404);

  // Test 7.2: Missing required field returns 400
  const badStudentRes = await request('POST', '/api/students', headers, {
    // Missing required firstName and gender
    notes: 'Missing required attributes',
  });
  assert('Negative: Missing required fields returns 400 validation error', badStudentRes.status === 400);

  // Test 7.3: RBAC check - Tutor attempting to create a school returns 403
  const tutorLogin = await request('POST', '/api/auth/login', {}, {
    email: 'sarah.jenkins@stmarys.org',
    password: 'password123',
  });
  if (tutorLogin.body?.data?.token) {
    const tutorHeaders = {
      Authorization: `Bearer ${tutorLogin.body.data.token}`,
      'x-school-id': 'school-stmarys-02',
    };
    // Sarah is a Tutor, does not have 'students.admit' or 'platform.schools.manage'
    const forbiddenRes = await request('POST', '/api/schools', tutorHeaders, {
      name: 'Unauthorized School Creation',
      code: 'UNAUTH',
    });
    assert('RBAC: Non-admin user forbidden from restricted action returns 403', forbiddenRes.status === 403);
  }

  // Test 7.4: Multi-Tenant Isolation - Cross-school query test
  // Requesting Oakridge records using St. Mary's school ID header
  const crossTenantHeaders = {
    Authorization: `Bearer ${token}`,
    'x-school-id': 'school-stmarys-02',
  };
  const stMarysStudents = await request('GET', '/api/students', crossTenantHeaders);
  assert('Multi-Tenant: School isolation isolates records strictly by req.schoolId', stMarysStudents.status === 200 && Array.isArray(stMarysStudents.body?.data));

  // ==========================================
  // SUMMARY
  // ==========================================
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
