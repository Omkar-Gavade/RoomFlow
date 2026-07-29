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
import { renderTemplate } from './template.service.js';

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

/**
 * Render a Handlebars template and send it. Also never throws (returns status).
 * @param {string} template  Template name (templates/emails/<name>.hbs)
 * @param {object} opts       { to, subject, data, attachments }
 */
export async function sendTemplatedEmail(template, { to, subject, data = {}, attachments = [] }) {
  let html;
  try {
    html = renderTemplate(template, data);
  } catch (err) {
    logger.error('Email template render failed', { template, error: err.message });
    return { status: 'failed', error: err.message };
  }
  return sendEmail({ to, subject, html, attachments });
}

export default { sendEmail, sendTemplatedEmail };
