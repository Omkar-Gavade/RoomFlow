/**
 * asyncHandler — ARCHITECTURE.md §15.3.
 *
 * Wraps an async route/controller so a rejected promise is forwarded to the
 * central error middleware, removing try/catch from every handler.
 *
 * Usage (Phase 1+): router.get('/x', asyncHandler(controller.method))
 *
 * @param {(req, res, next) => Promise<*>} fn
 * @returns {(req, res, next) => void}
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
