/** Booking status vocabulary + UI metadata (DESIGN-SYSTEM §2.2). */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
});

/** Tailwind classes per status — colour + text, never colour alone (§15 #9). */
export const STATUS_META = Object.freeze({
  pending: { label: 'Pending', className: 'bg-status-pending/15 text-status-pending' },
  approved: { label: 'Approved', className: 'bg-status-approved/15 text-status-approved' },
  rejected: { label: 'Rejected', className: 'bg-status-rejected/15 text-status-rejected' },
  cancelled: { label: 'Cancelled', className: 'bg-status-cancelled/15 text-status-cancelled' },
  completed: { label: 'Completed', className: 'bg-status-completed/15 text-status-completed' },
  expired: { label: 'Expired', className: 'bg-status-cancelled/15 text-status-cancelled' },
});

export default BOOKING_STATUS;
