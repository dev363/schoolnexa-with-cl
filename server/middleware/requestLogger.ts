import { Request, Response, NextFunction } from 'express';

/**
 * ANSI color codes for clean terminal debugging without external dependencies.
 */
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return COLORS.red;
  if (statusCode >= 400) return COLORS.yellow;
  if (statusCode >= 300) return COLORS.cyan;
  if (statusCode >= 200) return COLORS.green;
  return COLORS.reset;
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return COLORS.blue;
    case 'POST':
      return COLORS.green;
    case 'PUT':
    case 'PATCH':
      return COLORS.yellow;
    case 'DELETE':
      return COLORS.red;
    default:
      return COLORS.magenta;
  }
}

/**
 * Request logging middleware for Express.
 * Logs incoming API requests with timestamps, HTTP method, URL, status code, and duration for development debugging.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = (Number(endTime - startTime) / 1_000_000).toFixed(2);
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    const methodColor = getMethodColor(method);
    const statusColor = getStatusColor(statusCode);

    // Development debugging format: [TIMESTAMP] METHOD /path STATUS - DURATIONms
    console.log(
      `${COLORS.dim}[${timestamp}]${COLORS.reset} ${methodColor}${method.padEnd(6)}${COLORS.reset} ${url} ${statusColor}${statusCode}${COLORS.reset} ${COLORS.dim}-${COLORS.reset} ${durationMs}ms`,
    );
  });

  next();
}

export default requestLogger;
