/**
 * SchoolNexa OpenAPI 3.0 Specification.
 * Provides the interactive REST API playground mounted at /api/docs.
 */
export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SchoolNexa REST API',
    version: '1.0.0',
    description:
      'SchoolNexa School Management SaaS ERP REST API documentation and interactive testing playground. Designed for multi-tenant institutional operations, automatic constraint-based timetable generation, and academic workflows.',
    contact: {
      name: 'SchoolNexa Engineering',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'SchoolNexa API Base',
    },
  ],
  tags: [
    {
      name: 'System',
      description: 'Platform health monitoring and database diagnostics',
    },
    {
      name: 'Authentication',
      description: 'User authentication, sessions, and role permissions (Planned)',
    },
    {
      name: 'Academics',
      description: 'Classes, sections, subjects, curriculum mapping, and teacher assignments',
    },
    {
      name: 'Students',
      description: 'Student records, parent contacts, and status lifecycle',
    },
    {
      name: 'Teachers',
      description:
        'Teacher and faculty master directory, profiles, departments, and timetable assignments',
    },
    {
      name: 'Admissions',
      description: 'Enrollment workflows, transfers, and promotion batches (Planned)',
    },
    {
      name: 'Timetable',
      description: 'Automated constraint solver and period schedules (Planned)',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System health check',
        description: 'Returns the operational status of the SchoolNexa Express API runtime.',
        operationId: 'getSystemHealth',
        responses: {
          '200': {
            description: 'API is running and accepting HTTP requests',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/health/db': {
      get: {
        tags: ['System'],
        summary: 'Database connection check',
        description:
          'Safely verifies MySQL connectivity and Prisma ORM connectivity with a non-destructive query.',
        operationId: 'getDatabaseHealth',
        responses: {
          '200': {
            description: 'Database is reachable and connection pool is active',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DatabaseHealthResponse',
                },
              },
            },
          },
          '503': {
            description: 'Database connection failed or unreachable',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DatabaseHealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user credentials',
        description:
          'Validates email and password, creates an authenticated session, and returns a signed JWT access token.',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed (e.g. invalid email format or password length)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials provided',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        description: 'Returns the safe profile of the user identified by the JWT access token.',
        operationId: 'getCurrentUser',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserProfileResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing, invalid, or expired access token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout and revoke active session',
        description: 'Invalidates the server-side session for the authenticated user.',
        operationId: 'logoutUser',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Successfully logged out',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LogoutResponse',
                },
              },
            },
          },
          '401': {
            description: 'Authentication required to logout',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/context/school': {
      get: {
        tags: ['Tenant Context'],
        summary: 'Get active school tenant context',
        description:
          'Resolves and validates the active school tenant context for the authenticated user. Active school can be specified via "x-school-id" header or "sn_active_school" cookie. If the user belongs to exactly one school, it is automatically resolved.',
        operationId: 'getSchoolContext',
        security: [
          {
            bearerAuth: [],
            tenantHeader: [],
          },
        ],
        parameters: [
          {
            name: 'x-school-id',
            in: 'header',
            required: false,
            description: 'Requested School ID (or provide via sn_active_school cookie)',
            schema: {
              type: 'string',
              example: 'school-oakridge-01',
            },
          },
        ],
        responses: {
          '200': {
            description: 'School context resolved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SchoolContextResponse',
                },
              },
            },
          },
          '400': {
            description:
              'Active school selection required (user belongs to multiple schools but none specified)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing, invalid, or expired access token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description:
              'User does not belong to the requested school, or school account is inactive/suspended',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Requested school does not exist',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/context/authorization': {
      get: {
        tags: ['Role-Based Access Control (RBAC)'],
        summary: 'Get active school RBAC roles and permissions',
        description:
          "Resolves and returns the authenticated user's assigned roles and granted permissions within the active school tenant context. Platform SuperAdmins automatically receive full permissions.",
        operationId: 'getAuthorizationContext',
        security: [
          {
            bearerAuth: [],
            tenantHeader: [],
          },
        ],
        parameters: [
          {
            name: 'x-school-id',
            in: 'header',
            required: false,
            description: 'Target school identifier (or provide via sn_active_school cookie)',
            schema: {
              type: 'string',
              example: 'school-oakridge-01',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Authorization context resolved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthorizationContextResponse',
                },
              },
            },
          },
          '400': {
            description: 'Missing school context when multiple schools exist',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Authentication token is missing, invalid, or expired',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'User is forbidden from accessing the requested school',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/context/academic-year': {
      get: {
        tags: ['Academic Year Context'],
        summary: 'Get active academic year context',
        description:
          'Resolves and returns the validated active academic year scoped to the active school tenant. Supports explicit selection via x-academic-year-id header or sn_active_year cookie, or auto-resolution for deterministic single/current years.',
        operationId: 'getAcademicYearContext',
        security: [
          {
            bearerAuth: [],
            tenantHeader: [],
            academicYearHeader: [],
          },
        ],
        parameters: [
          {
            name: 'x-school-id',
            in: 'header',
            required: false,
            description: 'Target school identifier (or provide via sn_active_school cookie)',
            schema: {
              type: 'string',
              example: 'school-oakridge-01',
            },
          },
          {
            name: 'x-academic-year-id',
            in: 'header',
            required: false,
            description: 'Target academic year identifier (or provide via sn_active_year cookie)',
            schema: {
              type: 'string',
              example: 'ay-oak-2025',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Academic year context resolved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AcademicYearContextResponse',
                },
              },
            },
          },
          '400': {
            description: 'Missing academic year selection or closed/inactive academic year',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Authentication token is missing, invalid, or expired',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Academic year does not belong to active school tenant',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Academic year not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/context': {
      get: {
        tags: ['Operational Context'],
        summary: 'Get complete consolidated operational context',
        description:
          'Returns the full operational context including authenticated user, active school tenant, active academic year, assigned roles, and granted permissions.',
        operationId: 'getCompleteContext',
        security: [
          {
            bearerAuth: [],
            tenantHeader: [],
            academicYearHeader: [],
          },
        ],
        parameters: [
          {
            name: 'x-school-id',
            in: 'header',
            required: false,
            description: 'Target school identifier (or sn_active_school cookie)',
            schema: {
              type: 'string',
              example: 'school-oakridge-01',
            },
          },
          {
            name: 'x-academic-year-id',
            in: 'header',
            required: false,
            description: 'Target academic year identifier (or sn_active_year cookie)',
            schema: {
              type: 'string',
              example: 'ay-oak-2025',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Complete operational context resolved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CompleteContextResponse',
                },
              },
            },
          },
        },
      },
    },
    '/academic/classes': {
      get: {
        tags: ['Academics'],
        summary: 'List classes for active school',
        description:
          'Returns paginated classes for the active school tenant ordered by numeric grade progression.',
        operationId: 'listClasses',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by class name or code',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Classes retrieved successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Academics'],
        summary: 'Create a new class',
        description: 'Creates a master class grade level within the active school tenant.',
        operationId: 'createClass',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Grade 9' },
                  code: { type: 'string', example: 'G-09' },
                  numericOrder: { type: 'integer', example: 9 },
                  stream: { type: 'string', nullable: true, example: 'SCIENCE' },
                },
                required: ['name', 'code', 'numericOrder'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Class created successfully' },
          '409': { description: 'Duplicate class code in school' },
        },
      },
    },
    '/academic/classes/{id}': {
      get: {
        tags: ['Academics'],
        summary: 'Get class by ID',
        operationId: 'getClassById',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Class details' },
          '404': { description: 'Class not found' },
        },
      },
      put: {
        tags: ['Academics'],
        summary: 'Update class',
        operationId: 'updateClass',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  code: { type: 'string' },
                  numericOrder: { type: 'integer' },
                  stream: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Class updated' },
          '404': { description: 'Class not found' },
        },
      },
      delete: {
        tags: ['Academics'],
        summary: 'Delete class',
        description: 'Safely deletes a class if no sections or curriculum mappings are attached.',
        operationId: 'deleteClass',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Class deleted' },
          '409': { description: 'Cannot delete class with existing dependencies' },
        },
      },
    },
    '/academic/sections': {
      get: {
        tags: ['Academics'],
        summary: 'List sections for active academic year',
        operationId: 'listSections',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [
          {
            name: 'classId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by class',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by section name',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Sections retrieved successfully' },
        },
      },
      post: {
        tags: ['Academics'],
        summary: 'Create section in active academic year',
        operationId: 'createSection',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  classId: { type: 'string', example: 'cls-oak-g9' },
                  sectionName: { type: 'string', example: 'A' },
                  maxCapacity: { type: 'integer', default: 40, example: 35 },
                },
                required: ['classId', 'sectionName'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Section created successfully' },
          '409': { description: 'Duplicate section name for this class and year' },
        },
      },
    },
    '/academic/sections/{id}': {
      get: {
        tags: ['Academics'],
        summary: 'Get section by ID',
        operationId: 'getSectionById',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Section details' },
          '404': { description: 'Section not found' },
        },
      },
      put: {
        tags: ['Academics'],
        summary: 'Update section',
        operationId: 'updateSection',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sectionName: { type: 'string' },
                  maxCapacity: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Section updated' },
        },
      },
      delete: {
        tags: ['Academics'],
        summary: 'Delete section',
        operationId: 'deleteSection',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Section deleted' },
          '409': { description: 'Cannot delete section with active enrollments or assignments' },
        },
      },
    },
    '/academic/subjects': {
      get: {
        tags: ['Academics'],
        summary: 'List subjects in active school',
        operationId: 'listSubjects',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'subjectType',
            in: 'query',
            schema: { type: 'string', enum: ['THEORY', 'PRACTICAL', 'HYBRID', 'ACTIVITY'] },
          },
          { name: 'isElective', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': { description: 'Subjects retrieved' },
        },
      },
      post: {
        tags: ['Academics'],
        summary: 'Create a master subject',
        operationId: 'createSubject',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Mathematics' },
                  code: { type: 'string', example: 'MTH-101' },
                  subjectType: { type: 'string', default: 'THEORY', example: 'THEORY' },
                  credits: { type: 'number', default: 1.0, example: 4.0 },
                  isElective: { type: 'boolean', default: false },
                },
                required: ['name', 'code'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Subject created' },
          '409': { description: 'Duplicate subject code' },
        },
      },
    },
    '/academic/subjects/{id}': {
      get: {
        tags: ['Academics'],
        summary: 'Get subject by ID',
        operationId: 'getSubjectById',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Subject details' },
          '404': { description: 'Subject not found' },
        },
      },
      put: {
        tags: ['Academics'],
        summary: 'Update subject',
        operationId: 'updateSubject',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  code: { type: 'string' },
                  subjectType: { type: 'string' },
                  credits: { type: 'number' },
                  isElective: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Subject updated' },
        },
      },
      delete: {
        tags: ['Academics'],
        summary: 'Delete subject',
        operationId: 'deleteSubject',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Subject deleted' },
          '409': { description: 'Cannot delete subject mapped to curriculum or teachers' },
        },
      },
    },
    '/academic/curriculum': {
      get: {
        tags: ['Academics'],
        summary: 'List curriculum class-subject mappings',
        operationId: 'listCurriculum',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [
          { name: 'classId', in: 'query', schema: { type: 'string' } },
          { name: 'subjectId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Curriculum mappings retrieved' },
        },
      },
      post: {
        tags: ['Academics'],
        summary: 'Map subject to class',
        operationId: 'createCurriculum',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  classId: { type: 'string', example: 'cls-oak-g9' },
                  subjectId: { type: 'string', example: 'sub-oak-math' },
                  isMandatory: { type: 'boolean', default: true },
                  weeklyPeriods: { type: 'integer', default: 4, example: 5 },
                },
                required: ['classId', 'subjectId'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Curriculum mapped successfully' },
          '409': { description: 'Subject already mapped to class' },
        },
      },
    },
    '/academic/curriculum/bulk': {
      post: {
        tags: ['Academics'],
        summary: 'Bulk map multiple subjects to a class',
        operationId: 'bulkCurriculum',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  classId: { type: 'string', example: 'cls-oak-g9' },
                  subjectIds: { type: 'array', items: { type: 'string' } },
                  isMandatory: { type: 'boolean', default: true },
                  weeklyPeriods: { type: 'integer', default: 4 },
                },
                required: ['classId', 'subjectIds'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Bulk curriculum mapped successfully' },
        },
      },
    },
    '/academic/curriculum/{id}': {
      get: {
        tags: ['Academics'],
        summary: 'Get curriculum mapping by ID',
        operationId: 'getCurriculumById',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Mapping details' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Academics'],
        summary: 'Update curriculum mapping',
        operationId: 'updateCurriculum',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isMandatory: { type: 'boolean' },
                  weeklyPeriods: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Curriculum mapping updated' },
        },
      },
      delete: {
        tags: ['Academics'],
        summary: 'Remove curriculum mapping',
        operationId: 'deleteCurriculum',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Mapping removed' },
        },
      },
    },
    '/academic/assignments': {
      get: {
        tags: ['Academics'],
        summary: 'List teacher assignments for section',
        operationId: 'listAssignments',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [
          { name: 'sectionId', in: 'query', schema: { type: 'string' } },
          { name: 'staffId', in: 'query', schema: { type: 'string' } },
          { name: 'isClassTeacher', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': { description: 'Teacher assignments retrieved' },
        },
      },
      post: {
        tags: ['Academics'],
        summary: 'Assign teacher to section/subject',
        operationId: 'createAssignment',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  academicYearSectionId: { type: 'string', example: 'sec-oak-8a' },
                  staffId: { type: 'string', example: 'stf-oak-01' },
                  subjectId: { type: 'string', nullable: true, example: 'sub-oak-math' },
                  isClassTeacher: { type: 'boolean', default: false },
                },
                required: ['academicYearSectionId', 'staffId'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Teacher assigned' },
          '409': { description: 'Active class teacher already assigned or duplicate assignment' },
        },
      },
    },
    '/academic/assignments/{id}': {
      delete: {
        tags: ['Academics'],
        summary: 'Remove teacher assignment',
        operationId: 'deleteAssignment',
        security: [{ bearerAuth: [], tenantHeader: [], academicYearHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Teacher assignment removed' },
        },
      },
    },
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'List students',
        description:
          'Returns a paginated list of students in the active school with search, multi-criteria filtering, and sorting.',
        operationId: 'listStudents',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search term for name, admission number, or national ID',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'], default: 'ACTIVE' },
          },
          {
            name: 'gender',
            in: 'query',
            schema: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER', 'ALL'] },
          },
          { name: 'bloodGroup', in: 'query', schema: { type: 'string' } },
          { name: 'classId', in: 'query', schema: { type: 'string' } },
          { name: 'sectionId', in: 'query', schema: { type: 'string' } },
          { name: 'academicYearId', in: 'query', schema: { type: 'string' } },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['firstName', 'lastName', 'admissionNumber', 'createdAt', 'dateOfBirth'],
              default: 'createdAt',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of students',
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.view permission' },
        },
      },
      post: {
        tags: ['Students'],
        summary: 'Admit / Create student',
        description:
          'Admit a new student master record with student identity, contact info, and guardians.',
        operationId: 'createStudent',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  admissionNumber: { type: 'string', example: 'ADM-2026-101' },
                  firstName: { type: 'string', example: 'Rahul' },
                  lastName: { type: 'string', example: 'Sharma' },
                  gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
                  dateOfBirth: { type: 'string', format: 'date', example: '2015-04-15' },
                  bloodGroup: { type: 'string', example: 'B+' },
                  address: { type: 'string', example: 'Flat 402, Shivam Residency, Sector 14' },
                  city: { type: 'string', example: 'Delhi' },
                  state: { type: 'string', example: 'Delhi' },
                  postalCode: { type: 'string', example: '110085' },
                  emergencyContact: { type: 'string', example: 'Ramesh Sharma' },
                  emergencyPhone: { type: 'string', example: '+1 (555) 201-4452' },
                  nationalId: { type: 'string', example: 'NAT-IND-4521' },
                  idType: { type: 'string', example: 'NATIONAL_ID' },
                  nationality: { type: 'string', example: 'Indian' },
                },
                required: [
                  'admissionNumber',
                  'firstName',
                  'lastName',
                  'gender',
                  'dateOfBirth',
                  'address',
                  'city',
                  'state',
                  'postalCode',
                  'emergencyContact',
                  'emergencyPhone',
                ],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Student admitted successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.admit permission' },
          '409': { description: 'Admission number already exists in this school' },
        },
      },
    },
    '/students/{studentId}': {
      get: {
        tags: ['Students'],
        summary: 'Get student details',
        description:
          'Fetches detailed student record including identity, parents/guardians, enrollments, and documents.',
        operationId: 'getStudentById',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Full student detail record' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.view permission' },
          '404': { description: 'Student not found in this school' },
        },
      },
      put: {
        tags: ['Students'],
        summary: 'Update student details',
        description: 'Updates student master record and identity details.',
        operationId: 'updateStudent',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  admissionNumber: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                  dateOfBirth: { type: 'string', format: 'date' },
                  bloodGroup: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  postalCode: { type: 'string' },
                  emergencyContact: { type: 'string' },
                  emergencyPhone: { type: 'string' },
                  nationalId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Student updated successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.edit permission' },
          '404': { description: 'Student not found' },
          '409': { description: 'Admission number conflict' },
        },
      },
      delete: {
        tags: ['Students'],
        summary: 'Deactivate / Soft-delete student',
        description:
          'Soft-deletes student record by clearing activeAdmissionNumber and setting deletedAt timestamp.',
        operationId: 'deleteStudent',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Student deactivated successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.edit permission' },
          '404': { description: 'Student not found' },
        },
      },
    },
    '/students/{studentId}/status': {
      patch: {
        tags: ['Students'],
        summary: 'Update student active/inactive status',
        description:
          'Change student status between ACTIVE and INACTIVE with admission number conflict checks.',
        operationId: 'updateStudentStatus',
        security: [{ bearerAuth: [], tenantHeader: [] }],
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                  reason: { type: 'string' },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Student status updated successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing students.edit permission' },
          '404': { description: 'Student not found' },
          '409': { description: 'Admission number already in use by another active student' },
        },
      },
    },
    '/teachers': {
      get: {
        tags: ['Teachers'],
        summary: 'List teachers',
        description:
          'Retrieves a paginated list of teachers/faculty for the current tenant school with filtering and sorting options.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'] },
          },
          { name: 'employmentType', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          { name: 'designationId', in: 'query', schema: { type: 'string' } },
          { name: 'gender', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Teachers retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing teachers.view permission' },
        },
      },
      post: {
        tags: ['Teachers'],
        summary: 'Register new teacher',
        description: 'Registers a new teacher/faculty record within the active school tenant.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'email'],
                properties: {
                  firstName: { type: 'string', example: 'Aarav' },
                  lastName: { type: 'string', example: 'Sharma' },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'aarav.sharma@schoolnexa.com',
                  },
                  phone: { type: 'string', example: '+1 (408) 555-0921' },
                  gender: { type: 'string', example: 'Male' },
                  dateOfBirth: { type: 'string', format: 'date', example: '1989-07-21' },
                  dateOfJoining: { type: 'string', format: 'date', example: '2026-06-01' },
                  employmentType: { type: 'string', example: 'FULL_TIME' },
                  qualification: { type: 'string', example: 'M.Sc. Mathematics' },
                  status: { type: 'string', default: 'ACTIVE' },
                  departmentId: { type: 'string' },
                  designationId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Teacher registered successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing teachers.create permission' },
          '409': { description: 'Duplicate employee code or email' },
        },
      },
    },
    '/teachers/metadata': {
      get: {
        tags: ['Teachers'],
        summary: 'Get teacher form metadata',
        description: 'Retrieves active departments and designations for teacher form lookups.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        responses: {
          '200': { description: 'Metadata retrieved successfully' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/teachers/{teacherId}': {
      get: {
        tags: ['Teachers'],
        summary: 'Get teacher profile details',
        description:
          'Retrieves full details of a specific teacher profile, including assigned classes, subjects, and timetable slots.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'teacherId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Teacher profile retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing teachers.view permission' },
          '404': { description: 'Teacher not found' },
        },
      },
      put: {
        tags: ['Teachers'],
        summary: 'Update teacher profile',
        description: 'Updates information on an existing teacher master record.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'teacherId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'Teacher updated successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing teachers.edit permission' },
          '404': { description: 'Teacher not found' },
        },
      },
      delete: {
        tags: ['Teachers'],
        summary: 'Deactivate teacher',
        description:
          'Safely deactivates/archives a teacher record while preserving dependent academic records.',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'teacherId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Teacher deactivated successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Missing teachers.deactivate permission' },
          '404': { description: 'Teacher not found' },
        },
      },
    },
    '/teachers/{teacherId}/status': {
      patch: {
        tags: ['Teachers'],
        summary: 'Update teacher status',
        description:
          'Updates the employment status (ACTIVE, INACTIVE, SUSPENDED, RESIGNED, RETIRED, TERMINATED).',
        security: [{ bearerAuth: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'teacherId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'TERMINATED'],
                  },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Teacher status updated successfully' },
          '400': { description: 'Validation failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Teacher not found' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token for authenticated user sessions',
      },
      tenantHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-school-id',
        description: 'Active School Tenant ID for multi-tenant isolation',
      },
      academicYearHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-academic-year-id',
        description: 'Active Academic Year scope',
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'SchoolNexa API is running',
          },
        },
        required: ['success', 'message'],
      },
      DatabaseHealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Database connection established successfully',
          },
          error: {
            type: 'string',
            example: "Can't reach database server at 127.0.0.1:8889",
          },
        },
        required: ['success', 'message'],
      },
      PaginationMetadata: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          pageSize: {
            type: 'integer',
            example: 20,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          totalPages: {
            type: 'integer',
            example: 5,
          },
        },
        required: ['page', 'pageSize', 'total', 'totalPages'],
      },
      StandardSuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response payload data',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
        },
        required: ['success'],
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            $ref: '#/components/schemas/PaginationMetadata',
          },
          message: {
            type: 'string',
            example: 'Records retrieved successfully',
          },
        },
        required: ['success', 'data', 'pagination'],
      },
      ErrorDetail: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            example: 'email',
          },
          message: {
            type: 'string',
            example: 'Email must be a valid email address',
          },
          code: {
            type: 'string',
            example: 'INVALID_EMAIL',
          },
        },
        required: ['message'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ErrorDetail',
            },
          },
        },
        required: ['success', 'message', 'errors'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'alex.director@schoolnexa.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
        required: ['email', 'password'],
      },
      SafeUserProfile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user-alex-super',
          },
          email: {
            type: 'string',
            example: 'alex.director@schoolnexa.com',
          },
          fullName: {
            type: 'string',
            example: 'Dr. Alexander Wright',
          },
          phone: {
            type: 'string',
            nullable: true,
            example: '+1 (555) 234-5678',
          },
          avatarUrl: {
            type: 'string',
            nullable: true,
            example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          },
          isSuperAdmin: {
            type: 'boolean',
            example: true,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['id', 'email', 'fullName', 'isSuperAdmin', 'isActive'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/SafeUserProfile',
              },
              token: {
                type: 'string',
                description: 'Signed JWT Bearer Access Token',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              expiresIn: {
                type: 'string',
                example: '7d',
              },
              session: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '8a816172-e421-4f11-9a9c-0c1f4e6f9d2b',
                  },
                  expiresAt: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
            required: ['user', 'token', 'expiresIn'],
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
        },
        required: ['success', 'data', 'message'],
      },
      UserProfileResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: '#/components/schemas/SafeUserProfile',
          },
          message: {
            type: 'string',
            example: 'Profile retrieved successfully',
          },
        },
        required: ['success', 'data'],
      },
      LogoutResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              loggedOut: {
                type: 'boolean',
                example: true,
              },
            },
          },
          message: {
            type: 'string',
            example: 'Logged out successfully',
          },
        },
        required: ['success', 'message'],
      },
      SchoolContextResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              schoolId: {
                type: 'string',
                example: 'school-oakridge-01',
              },
              userId: {
                type: 'string',
                example: 'user-alex-super',
              },
              schoolName: {
                type: 'string',
                example: 'Oakridge International Academy',
              },
              schoolCode: {
                type: 'string',
                example: 'OAK-ACAD',
              },
              schoolStatus: {
                type: 'string',
                example: 'ACTIVE',
              },
            },
            required: ['schoolId', 'userId', 'schoolName', 'schoolCode', 'schoolStatus'],
          },
          message: {
            type: 'string',
            example: 'School context resolved successfully',
          },
        },
        required: ['success', 'data', 'message'],
      },
      AuthorizationContextResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              schoolId: {
                type: 'string',
                example: 'school-oakridge-01',
              },
              userId: {
                type: 'string',
                example: 'user-clara-teacher',
              },
              isSuperAdmin: {
                type: 'boolean',
                example: false,
              },
              roles: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['TEACHER'],
              },
              permissions: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: [
                  'students.view',
                  'attendance.take',
                  'attendance.view',
                  'homework.manage',
                  'exams.marks.enter',
                  'academics.curriculum.edit',
                ],
              },
            },
            required: ['schoolId', 'userId', 'isSuperAdmin', 'roles', 'permissions'],
          },
          message: {
            type: 'string',
            example: 'Authorization context resolved successfully',
          },
        },
        required: ['success', 'data', 'message'],
      },
      AcademicYearContextResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              schoolId: {
                type: 'string',
                example: 'school-oakridge-01',
              },
              academicYearId: {
                type: 'string',
                example: 'ay-oak-2025',
              },
              academicYearName: {
                type: 'string',
                example: 'Academic Year 2025-2026',
              },
              code: {
                type: 'string',
                example: 'AY-25-26',
              },
              startDate: {
                type: 'string',
                format: 'date',
                example: '2025-08-15',
              },
              endDate: {
                type: 'string',
                format: 'date',
                example: '2026-06-15',
              },
              isCurrent: {
                type: 'boolean',
                example: true,
              },
              status: {
                type: 'string',
                enum: ['UPCOMING', 'ACTIVE', 'CLOSED'],
                example: 'ACTIVE',
              },
            },
            required: [
              'schoolId',
              'academicYearId',
              'academicYearName',
              'code',
              'startDate',
              'endDate',
              'isCurrent',
              'status',
            ],
          },
          message: {
            type: 'string',
            example: 'Academic year context resolved successfully',
          },
        },
        required: ['success', 'data', 'message'],
      },
      CompleteContextResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'user-clara-teacher' },
                  email: { type: 'string', example: 'clara.mendez@oakridge.edu' },
                  fullName: { type: 'string', example: 'Clara Mendez' },
                  isSuperAdmin: { type: 'boolean', example: false },
                },
                required: ['id', 'email', 'fullName', 'isSuperAdmin'],
              },
              school: {
                $ref: '#/components/schemas/SchoolContextData',
              },
              academicYear: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'ay-oak-2025' },
                  schoolId: { type: 'string', example: 'school-oakridge-01' },
                  name: { type: 'string', example: 'Academic Year 2025-2026' },
                  code: { type: 'string', example: 'AY-25-26' },
                  startDate: { type: 'string', example: '2025-08-15' },
                  endDate: { type: 'string', example: '2026-06-15' },
                  isCurrent: { type: 'boolean', example: true },
                  status: { type: 'string', example: 'ACTIVE' },
                },
                required: [
                  'id',
                  'schoolId',
                  'name',
                  'code',
                  'startDate',
                  'endDate',
                  'isCurrent',
                  'status',
                ],
              },
              roles: {
                type: 'array',
                items: { type: 'string' },
                example: ['TEACHER'],
              },
              permissions: {
                type: 'array',
                items: { type: 'string' },
                example: ['students.view', 'attendance.take'],
              },
            },
            required: ['user', 'school', 'academicYear', 'roles', 'permissions'],
          },
          message: {
            type: 'string',
            example: 'Complete operational context resolved successfully',
          },
        },
        required: ['success', 'data', 'message'],
      },
    },
  },
};

export default openapiSpec;
