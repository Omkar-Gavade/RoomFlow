/**
 * Request logger — ARCHITECTURE.md §17.2.5.
 *
 * 1. correlationId(): assigns a UUID per request, echoes it in `X-Request-Id`,
 *    and stores it on req for the error handler + logs. A user's error screenshot
 *    is then enough to locate the exact server log line.
 * 2. httpLogger: Morgan formatted line piped into Winston (`http` level).
 */
import { randomUUID } from 'node:crypto';

import morgan from 'morgan';

import { morganStream } from '../config/logger.js';
import { env } from '../config/env.js';

/** Attach a correlation id to every request/response. */
export function correlationId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

// Custom token exposes the correlation id inside the Morgan line.
morgan.token('id', (req) => req.id);

const format = env.isProduction
  ? ':id :remote-addr :method :url :status :res[content-length] - :response-time ms'
  : ':id :method :url :status :response-time ms';

/** Morgan middleware writing through the Winston stream. */
export const httpLogger = morgan(format, { stream: morganStream });

export default httpLogger;
