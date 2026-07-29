/**
 * Soft-delete plugin — ARCHITECTURE.md §7.2, §18.1, §18.2.
 *
 * Adds `isDeleted` + `deletedAt` and transparently excludes deleted documents
 * from all find queries, unless a query opts in with `.setOptions({ withDeleted: true })`.
 * This is data-layer integrity (preserving referential history), not business logic.
 *
 * Apply to: User, Room. Bookings are retained via status (never soft-deleted);
 * AuditLog is append-only; Notification uses TTL — so they do NOT use this plugin.
 */
export function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  // Auto-filter deleted docs on every read unless explicitly overridden.
  const READ_HOOKS = /^find/;
  schema.pre(READ_HOOKS, function autoExcludeDeleted(next) {
    if (this.getOptions().withDeleted) return next();
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) this.where({ isDeleted: false });
    next();
  });

  // Instance helpers (data operations only).
  schema.methods.softDelete = function softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function restore() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };
}

export default softDeletePlugin;
