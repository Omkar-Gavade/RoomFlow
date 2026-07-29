/**
 * Email service (FOUNDATION) — ARCHITECTURE.md §6, §2.3, FR-NOTIF-07.
 *
 * Owns the "how to send" concern. Template rendering and notification triggers
 * are business logic and arrive in later phases (templates/emails/*.hbs +
 * notification.service.js). Here we expose one transport-level primitive.
 *
 * CONTRACT: sendEmail() is fire-and-forget-safe — it NEVER throws to the caller,
 * so a mail failure can never fail a booking transaction. It returns a status.
 */
import { transporter, mailFrom, isMailerConfigured } from '../config/mailer.js';
import { logger } from '../config/logger.js';

/**
 * @param {object} payload
 * @param {string|string[]} payload.to
 * @param {string} payload.subject
 * @param {string} [payload.html]
 * @param {string} [payload.text]
 * @param {Array} [payload.attachments]
 * @returns {Promise<{ status: 'sent'|'skipped'|'failed', messageId?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, html, text, attachments = [] }) {
  if (!isMailerConfigured) {
    logger.warn('Email skipped (SMTP not configured)', { to, subject });
    return { status: 'skipped' };
  }
  try {
    const info = await transporter.sendMail({ from: mailFrom, to, subject, html, text, attachments });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return { status: 'sent', messageId: info.messageId };
  } catch (err) {
    // Swallow — record the failure, let the caller continue (§2.3).
    logger.error('Email send failed', { to, subject, error: err.message });
    return { status: 'failed', error: err.message };
  }
}

export default { sendEmail };
