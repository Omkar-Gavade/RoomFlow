/**
 * Notification vocabulary — ARCHITECTURE.md §18.4.
 */
export const NOTIFICATION_TYPES = Object.freeze({
  BOOKING_CREATED: 'booking_created',
  BOOKING_APPROVED: 'booking_approved',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  APPROVAL_REQUEST: 'approval_request',
  SYSTEM: 'system',
  BROADCAST: 'broadcast',
});

export const NOTIFICATION_TYPE_VALUES = Object.freeze(Object.values(NOTIFICATION_TYPES));

export const NOTIFICATION_CHANNELS = Object.freeze({
  IN_APP: 'in-app',
  EMAIL: 'email',
  BOTH: 'both',
});

export const NOTIFICATION_CHANNEL_VALUES = Object.freeze(Object.values(NOTIFICATION_CHANNELS));

export const EMAIL_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
});

export const EMAIL_STATUS_VALUES = Object.freeze(Object.values(EMAIL_STATUS));

export const NOTIFICATION_PRIORITY = Object.freeze({
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
});

export const NOTIFICATION_PRIORITY_VALUES = Object.freeze(Object.values(NOTIFICATION_PRIORITY));

export default NOTIFICATION_TYPES;
