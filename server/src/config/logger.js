/**
 * Winston logger — ARCHITECTURE.md §17.2.5.
 *
 * - JSON format in production, colourised in development.
 * - Redaction list: secrets are NEVER logged.
 * - Exposes a `stream` so Morgan HTTP logs flow through the same pipeline.
 */
import winston from 'winston';

import { env } from './env.js';

/** Fields scrubbed from any logged metadata object. */
const REDACTED_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'otp',
  'jwt_access_secret',
  'jwt_refresh_secret',
]);

/** Recursively replace sensitive values with '[REDACTED]'. */
const redact = winston.format((info) => {
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        scrub(obj[key]);
      }
    }
    return obj;
  };
  return scrub(info);
});

const devFormat = winston.format.combine(
  redact(),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${rest}`;
  })
);

const prodFormat = winston.format.combine(
  redact(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.isProduction ? prodFormat : devFormat,
  defaultMeta: { service: 'roomflow-api' },
  transports: [new winston.transports.Console()],
  // Never crash the process because logging failed.
  exitOnError: false,
});

/** Morgan pipes its HTTP log line into Winston at the `http` level. */
export const morganStream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
