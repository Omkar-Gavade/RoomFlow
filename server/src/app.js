/**
 * Express application — ARCHITECTURE.md §15.3, §17.1.
 *
 * Exports the CONFIGURED app WITHOUT calling listen() so Supertest can drive it
 * in integration tests. server.js owns the network listen + DB connect.
 *
 * Middleware order below is the frozen §17.1 pipeline — order is behaviour:
 *   helmet → cors → compression → body parsers → cookies → sanitize →
 *   correlationId → httpLogger → rate limit → routes → notFound → errorHandler
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/corsOptions.js';
import { sanitizers } from './middleware/sanitize.js';
import { correlationId, httpLogger } from './middleware/requestLogger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

// Behind Render/Vercel proxies — needed for correct client IPs + rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// 1. Security headers (apply even to error responses).
app.use(helmet());

// 2. CORS — strict origin allowlist.
app.use(cors(corsOptions));

// 3. Response compression (gzip).
app.use(compression());

// 4. Body parsers — size-limited (§23 #15).
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Cookies (refresh-token cookie in Phase 1).
app.use(cookieParser());

// 6. Injection defence — BEFORE logging.
app.use(...sanitizers());

// 7. Correlation id + HTTP logging.
app.use(correlationId);
app.use(httpLogger);

// 8. Global rate limiting.
app.use('/api', globalLimiter);

// 9. Routes (versioned).
app.use('/api', apiRoutes);

// Root ping.
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'RoomFlow API', docs: '/api/v1/health' });
});

// 15. Unmatched routes.
app.use(notFound);

// 16. Central error handler — MUST be last.
app.use(errorHandler);

export default app;
