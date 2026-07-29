/**
 * MongoDB connection layer — ARCHITECTURE.md §5.3, §24.1.
 *
 * - Single pooled connection (maxPoolSize) reused across the app.
 * - Connection lifecycle events logged.
 * - server.js awaits connectDB() BEFORE listening (§15.3).
 */
import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

// Reject queries on fields not in the schema once models arrive (Phase 2+).
mongoose.set('strictQuery', true);

const CONNECT_OPTIONS = {
  maxPoolSize: 10, // §24.1 connection pooling
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

/** Attach lifecycle listeners once. */
function registerConnectionEvents() {
  const conn = mongoose.connection;
  conn.on('connected', () => logger.info('🟢 MongoDB connected'));
  conn.on('disconnected', () => logger.warn('🟡 MongoDB disconnected'));
  conn.on('reconnected', () => logger.info('🟢 MongoDB reconnected'));
  conn.on('error', (err) => logger.error('🔴 MongoDB error', { message: err.message }));
}

/**
 * Establish the database connection. Throws on failure so the bootstrap can abort.
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB() {
  registerConnectionEvents();
  await mongoose.connect(env.MONGO_URI, CONNECT_OPTIONS);
  return mongoose;
}

/** Close the connection cleanly during graceful shutdown. */
export async function disconnectDB() {
  await mongoose.connection.close(false);
  logger.info('MongoDB connection closed');
}

/** 1 = connected; used by the health/readiness endpoint (§4.5). */
export function getDbState() {
  return mongoose.connection.readyState;
}

export default connectDB;
