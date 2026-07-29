/**
 * Health & readiness — ARCHITECTURE.md §4.5, §10.10.
 *
 * GET /api/v1/health        → liveness + DB connectivity + uptime
 * GET /api/v1/health/ready  → readiness probe (503 if DB not connected)
 *
 * Public. Handlers are inline (no controller/business logic) — health is infra.
 * The uptime monitor pings /health to defeat Render's cold start (§25.5).
 */
import { Router } from 'express';

import { getDbState } from '../../config/db.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { env } from '../../config/env.js';

const router = Router();

const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

router.get('/health', (_req, res) => {
  const dbState = getDbState();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'RoomFlow API is healthy',
    data: {
      status: 'ok',
      env: env.NODE_ENV,
      uptime: Number(process.uptime().toFixed(0)),
      db: DB_STATES[dbState] || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/health/ready', (_req, res) => {
  const ready = getDbState() === 1;
  res.status(ready ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
    success: ready,
    message: ready ? 'Ready' : 'Not ready — database unavailable',
    data: { db: DB_STATES[getDbState()] || 'unknown' },
  });
});

export default router;
