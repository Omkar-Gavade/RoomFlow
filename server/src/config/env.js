/**
 * Environment loader & validator.
 *
 * ARCHITECTURE.md §15.3: "Validates all env vars at boot with Zod and EXITS the
 * process if any are missing — fail fast at startup, never at 2 a.m. in a request."
 *
 * Import this module FIRST (before anything reads config) so dotenv has populated
 * process.env and validation has run. Everything else imports the frozen `env` object.
 */
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default('v1'),

  // Comma-separated CORS allowlist -> array
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Reserved for Phase 1 (auth). Present now so config fails fast when auth lands.
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // --- Auth (Phase 1B) ---
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(3).max(20).default(10),
  ACCOUNT_LOCK_MINUTES: z.coerce.number().int().min(1).default(15),
  RESET_TOKEN_EXPIRY_MIN: z.coerce.number().int().min(5).default(15),
  EMAIL_VERIFICATION_EXPIRY_HOURS: z.coerce.number().int().min(1).default(24),

  // --- Notifications & jobs (Phase 4) ---
  REMINDER_LEAD_MINUTES: z.coerce.number().int().min(5).default(60),
  ENABLE_CRON: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('roomflow_dev'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  MAIL_FROM_NAME: z.string().default('RoomFlow'),
  MAIL_FROM_EMAIL: z.string().email().default('no-reply@roomflow.app'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  JOB_TRIGGER_SECRET: z.string().optional().default(''),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast — do not let the process start with invalid configuration.
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const raw = parsed.data;

/** Frozen, validated configuration object consumed across the app. */
export const env = Object.freeze({
  ...raw,
  // Derived helpers
  isProduction: raw.NODE_ENV === 'production',
  isDevelopment: raw.NODE_ENV === 'development',
  isTest: raw.NODE_ENV === 'test',
  // CLIENT_URL may hold several comma-separated origins for the CORS allowlist.
  corsOrigins: raw.CLIENT_URL.split(',')
    .map((s) => s.trim())
    .filter(Boolean),
});

export default env;
