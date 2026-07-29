/**
 * Root API router — ARCHITECTURE.md §22 (versioned base path /api/v1).
 *
 * app.js mounts this at /api. A future v2 contract (for a mobile client) mounts
 * alongside v1 here without breaking existing clients.
 */
import { Router } from 'express';

import v1Routes from './v1/index.js';

const router = Router();

router.use('/v1', v1Routes);

export default router;
