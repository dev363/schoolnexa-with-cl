import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { testDatabaseConnection } from '../prisma';
import { openapiSpec } from '../docs/openapi';
import { authRouter } from './auth.routes';
import { contextRouter } from './context.routes';
import { schoolRouter } from './school.routes';
import academicRouter from './academicSetup.routes';
import studentRouter from './student.routes';
import teacherRouter from './teacher.routes';
import enrollmentRouter from './enrollment.routes';
import { requireAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { schoolController } from '../controllers/schoolController';

export const apiRouter = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SchoolNexa API is running',
  });
});

/**
 * Safe database connectivity health check
 * GET /api/health/db
 */
apiRouter.get('/health/db', async (_req: Request, res: Response) => {
  const result = await testDatabaseConnection();
  res.status(result.connected ? 200 : 503).json({
    success: result.connected,
    message: result.message,
    ...(process.env.NODE_ENV === 'development' && result.error ? { error: result.error } : {}),
  });
});

/**
 * OpenAPI Specification (Raw JSON)
 * GET /api/docs/openapi.json
 */
apiRouter.get('/docs/openapi.json', (_req: Request, res: Response) => {
  res.status(200).json(openapiSpec);
});

/**
 * Interactive API Documentation and Testing Playground
 * GET /api/docs and /api/docs/
 */
apiRouter.use(
  '/docs',
  ...(swaggerUi.serve as any),
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'SchoolNexa REST API Docs & Playground',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      filter: true,
    },
  }) as any,
);

// Authentication routes (Step 4)
apiRouter.use('/auth', authRouter);

// Tenant Context routes (Step 5)
apiRouter.use('/context', contextRouter);

// School & Campus routes
apiRouter.use('/schools', schoolRouter);

// Global System Permissions Catalog
apiRouter.get('/permissions', requireAuth, asyncHandler(schoolController.getAllPermissions));

// Academic Setup routes (Step 8)
apiRouter.use('/academic', academicRouter);
apiRouter.use('/academics', academicRouter);

// Student routes (Step 10)
apiRouter.use('/students', studentRouter);

// Teacher & Faculty routes (Step 4 - Faculty Management)
apiRouter.use('/teachers', teacherRouter);

// Enrollment & Admissions routes
apiRouter.use('/enrollments', enrollmentRouter);

// ====================================================================
// FUTURE MODULE ROUTE MOUNT POINTS
// Ready for subsequent steps (Do NOT implement business logic yet)
// ====================================================================
// apiRouter.use('/admissions', admissionRouter);
// apiRouter.use('/timetable', timetableRouter);

// Catch-all 404 handler for API routes
apiRouter.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    errors: [],
  });
});

export default apiRouter;
