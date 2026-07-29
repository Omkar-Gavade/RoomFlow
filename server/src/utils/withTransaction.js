/**
 * Transaction helper — ARCHITECTURE.md §20.4.
 *
 * runWithOptionalTransaction wraps a unit of work in a MongoDB transaction
 * (session.withTransaction already retries TransientTransactionError /
 * WriteConflict — §20.4 layer 2). If the deployment has no replica set (a local
 * standalone mongod in development), transactions are unsupported; we detect that
 * ONCE and fall back to running the same work without a session so development
 * stays usable. PRODUCTION (MongoDB Atlas replica set) uses real transactions,
 * which is what guarantees conflict-free booking (§20.4, §25.5).
 *
 * The callback MUST accept `session` (may be null) and pass it to every query.
 */
import mongoose from 'mongoose';

import { logger } from '../config/logger.js';

let transactionsUnsupported = false;

function isUnsupportedError(err) {
  const msg = err?.message || '';
  return (
    err?.code === 20 ||
    /Transaction numbers are only allowed on a replica set|replica set member or mongos|Transactions are not supported/i.test(
      msg
    )
  );
}

export async function runWithOptionalTransaction(work) {
  if (transactionsUnsupported) return work(null);

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err) {
    if (isUnsupportedError(err)) {
      transactionsUnsupported = true;
      logger.warn(
        'MongoDB transactions unsupported (standalone) — falling back to non-transactional writes. Use a replica set / Atlas in production for guaranteed conflict safety.'
      );
      return work(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

export default runWithOptionalTransaction;
