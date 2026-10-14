import express, { Express } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { ensureStaffSchema, ensureStudentSchema } from './prisma';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

export async function createServer(): Promise<Express> {
  const app = express();

  // 1. Core middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 2. Request logging for API endpoints (development debugging)
  app.use('/api', requestLogger);

  // 3. Central API router mounted at /api
  app.use('/api', apiRouter);

  // 4. Centralized error handler for /api
  app.use('/api', errorHandler);

  // 4. Vite middleware (development) or static files (production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global fallback error handler
  app.use(errorHandler);

  return app;
}

export async function startServer(): Promise<void> {
  try {
    const app = await createServer();
    app.listen(PORT, HOST, () => {
      console.log(`[SchoolNexa] Express + Vite server running at http://${HOST}:${PORT}`);

      // Perform non-blocking database schema verification and auto-repair if database is available
      ensureStaffSchema()
        .then((res) => {
          if (res.migratedColumns.length > 0) {
            console.log(
              `[SchoolNexa] Schema check completed: synchronized columns [${res.migratedColumns.join(', ')}]`,
            );
          }
        })
        .catch((err) => {
          // Non-fatal warning - logging only
          console.warn('[SchoolNexa] Staff schema check notice:', err?.message || err);
        });

      ensureStudentSchema()
        .then((res) => {
          if (res.migratedColumns.length > 0) {
            console.log(
              `[SchoolNexa] Student schema check completed: synchronized columns [${res.migratedColumns.join(', ')}]`,
            );
          }
        })
        .catch((err) => {
          // Non-fatal warning - logging only
          console.warn('[SchoolNexa] Student schema check notice:', err?.message || err);
        });
    });
  } catch (error) {
    console.error('[SchoolNexa] Server startup failed:', error);
    process.exit(1);
  }
}

export default createServer;
