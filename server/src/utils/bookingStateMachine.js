/**
 * Booking state machine — ARCHITECTURE.md §21.
 *
 * ONE transition table; every status change (controller, job, bulk action) passes
 * through assertTransition, so an illegal transition is impossible to introduce
 * by accident. Terminal states (rejected/cancelled/completed/expired) have no
 * outgoing transitions. Role lists document WHO may perform each transition; the
 * actual role check is enforced by route middleware + service ownership guards.
 */
import { BOOKING_STATUS as S } from '../constants/bookingStatus.js';

import { ApiError } from './ApiError.js';

const TRANSITIONS = {
  [S.PENDING]: {
    [S.APPROVED]: ['admin', 'staff'],
    [S.REJECTED]: ['admin', 'staff'],
    [S.CANCELLED]: ['owner', 'admin'],
    [S.EXPIRED]: ['system'],
  },
  [S.APPROVED]: {
    [S.CANCELLED]: ['owner', 'admin'],
    [S.COMPLETED]: ['system', 'admin'],
  },
  [S.REJECTED]: {},
  [S.CANCELLED]: {},
  [S.COMPLETED]: {},
  [S.EXPIRED]: {},
};

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from] && TRANSITIONS[from][to]);
}

export function allowedRolesFor(from, to) {
  return (TRANSITIONS[from] && TRANSITIONS[from][to]) || [];
}

/** Throw a typed 422 when a transition is not permitted by the machine. */
export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw ApiError.unprocessable(
      `Cannot change booking from '${from}' to '${to}'`,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

export default { canTransition, allowedRolesFor, assertTransition, TRANSITIONS };
