/**
 * Server bootstrap — ARCHITECTURE.md §15.3.
 *
 * Responsibilities:
 *   1. Load + validate env (imported first, fails fast on bad config).
 *   2. Connect to MongoDB BEFORE listening.
 *   3. Optionally verify SMTP (non-fatal).
 *   4. Start HTTP listener.
 *   5. Handle SIGTERM/SIGINT for graceful shutdown.
 *   6. Catch unhandledRejection / uncaughtException.
 */
import { env } from './config/env.js'; // FIRST import — validates config.
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { verifyMailer } from './config/mailer.js';
import app from './app.js';

let server;

async function start() {
  try {
    await connectDB();

    // Non-blocking: a mail failure must not stop the API (§2.3).
    verifyMailer().catch(() => {});

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 RoomFlow API listening on :${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`   Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message, stack: err.stack });
    process.exit(1);
  }
}

/** Close HTTP + DB cleanly, then exit. */
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully…`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', { message: err.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});

start();
