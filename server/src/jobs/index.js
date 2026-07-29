/**
 * Job registrar — ARCHITECTURE.md §21.5, §25.5.
 *
 * Two invocation paths for the same job functions:
 *   1. In-process node-cron (when ENABLE_CRON=true; suitable for an always-on host).
 *   2. External cron hitting POST /api/v1/jobs/:name (Render free tier sleeps, so
 *      node-cron cannot be relied on there — §25.5). runJob() serves that path.
 */
import cron from 'node-cron';

import { reminderJob } from './reminderJob.js';
import { autoCompleteJob } from './autoCompleteJob.js';
import { expirePendingJob } from './expirePendingJob.js';
import { cleanupTokensJob } from './cleanupTokensJob.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const JOBS = Object.freeze({
  reminder: reminderJob,
  'auto-complete': autoCompleteJob,
  'expire-pending': expirePendingJob,
  'cleanup-tokens': cleanupTokensJob,
});

async function run(name) {
  try {
    const result = await JOBS[name]();
    logger.info('Scheduled job completed', { job: name, ...result });
  } catch (err) {
    logger.error('Scheduled job failed', { job: name, error: err.message });
  }
}

/** Run one job by name (external trigger). Returns null for an unknown name. */
export async function runJob(name) {
  if (!JOBS[name]) return null;
  return JOBS[name]();
}

/** Register in-process cron schedules (no-op when ENABLE_CRON=false). */
export function registerCron() {
  if (!env.ENABLE_CRON) {
    logger.info('In-process cron disabled (ENABLE_CRON=false) — use external trigger.');
    return;
  }
  cron.schedule('*/15 * * * *', () => run('reminder')); // every 15 min
  cron.schedule('0 * * * *', () => run('auto-complete')); // hourly
  cron.schedule('5 * * * *', () => run('expire-pending')); // hourly at :05
  cron.schedule('0 3 * * *', () => run('cleanup-tokens')); // daily 03:00
  logger.info('In-process cron jobs registered');
}

export default { JOBS, runJob, registerCron };
