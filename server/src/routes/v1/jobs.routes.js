/**
 * Job trigger route — ARCHITECTURE.md §21.5, §25.5.
 *
 * POST /api/v1/jobs/:name  — invoked by an EXTERNAL cron (cron-job.org / GitHub
 * Actions) on hosts where in-process node-cron is unreliable (Render free tier).
 * Not user-authenticated; gated by a shared secret in the `x-job-secret` header,
 * compared in constant time. Disabled (503) when no secret is configured.
 */
import crypto from 'node:crypto';

import { Router } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { env } from '../../config/env.js';
import { runJob } from '../../jobs/index.js';

const router = Router();

function verifySecret(provided) {
  const expected = env.JOB_TRIGGER_SECRET;
  if (!expected) return 'disabled';
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

router.post(
  '/:name',
  asyncHandler(async (req, res) => {
    const check = verifySecret(req.headers['x-job-secret']);
    if (check === 'disabled') {
      throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Job trigger not configured', 'JOBS_DISABLED');
    }
    if (!check) throw ApiError.unauthorized('Invalid job secret', 'INVALID_JOB_SECRET');

    const result = await runJob(req.params.name);
    if (result === null) throw ApiError.notFound(`Unknown job: ${req.params.name}`, 'UNKNOWN_JOB');

    return new ApiResponse(HTTP_STATUS.OK, result, `Job '${req.params.name}' executed`).send(res);
  })
);

export default router;
