/** Booking status vocabulary + UI metadata (DESIGN-SYSTEM §2.2). */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
});

/** Tint + text + dot per status. Colour is always paired with a label (§15 #9). */
export const STATUS_META = Object.freeze({
  pending: {
    label: 'Pending',
    className: 'bg-status-pending/12 text-status-pending border-status-pending/25',
    dot: 'bg-status-pending',
  },
  approved: {
    label: 'Approved',
    className: 'bg-status-approved/12 text-status-approved border-status-approved/25',
    dot: 'bg-status-approved',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-status-rejected/12 text-status-rejected border-status-rejected/25',
    dot: 'bg-status-rejected',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-status-cancelled/12 text-status-cancelled border-status-cancelled/25',
    dot: 'bg-status-cancelled',
  },
  completed: {
    label: 'Completed',
    className: 'bg-status-completed/12 text-status-completed border-status-completed/25',
    dot: 'bg-status-completed',
  },
  expired: {
    label: 'Expired',
    className: 'bg-status-cancelled/12 text-status-cancelled border-status-cancelled/25',
    dot: 'bg-status-cancelled',
  },
});

export default BOOKING_STATUS;
