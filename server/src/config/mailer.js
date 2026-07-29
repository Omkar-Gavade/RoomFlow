/**
 * Nodemailer transporter — ARCHITECTURE.md §6 (email architecture), §2.7.
 *
 * Provides a single SMTP transporter. Business email logic (templates, triggers)
 * lives in services/email.service.js — this file only owns the transport adapter,
 * so switching to SendGrid/SES later changes one file (Liskov, §3.3).
 */
import nodemailer from 'nodemailer';

import { env } from './env.js';
import { logger } from './logger.js';

/** True when SMTP host + credentials are present. */
export const isMailerConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE, // true for 465, false for 587/STARTTLS
  auth: isMailerConfigured ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

/** Default From header used by every outgoing mail. */
export const mailFrom = `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_EMAIL}>`;

/**
 * Optional startup check — verifies SMTP connectivity without blocking boot.
 * Called from server.js; a failure is logged, never fatal (§2.3 graceful degradation).
 */
export async function verifyMailer() {
  if (!isMailerConfigured) {
    logger.warn('⚠️  SMTP not configured — emails will be skipped (in-app notifications remain).');
    return false;
  }
  try {
    await transporter.verify();
    logger.info('🟢 SMTP transporter verified');
    return true;
  } catch (err) {
    logger.error('🔴 SMTP verification failed', { message: err.message });
    return false;
  }
}

export default transporter;
