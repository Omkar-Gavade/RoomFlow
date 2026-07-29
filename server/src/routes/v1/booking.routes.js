/**
 * Booking routes — ARCHITECTURE.md §10.4, §11.5, §17.1, §22.
 *
 * All authenticated. Reads are scoped inside the service (students see own,
 * staff/admin see all). Approvals gated by permission; cancel/reschedule enforce
 * ownership in the service (anti-IDOR). Specific paths precede /:id.
 */
import { Router } from 'express';

import * as bookingController from '../../controllers/booking.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../constants/roles.js';
import {
  idParamSchema,
  createBookingSchema,
  rescheduleSchema,
  approveSchema,
  rejectSchema,
  cancelSchema,
  checkConflictSchema,
  listBookingsQuerySchema,
  calendarQuerySchema,
} from '../../validations/booking.validation.js';

const router = Router();

router.use(authenticate);

// --- Create + dry-run ---
router.post('/check-conflict', requirePermission('booking:create'), validate(checkConflictSchema), bookingController.checkConflict);
router.post('/', requirePermission('booking:create'), validate(createBookingSchema), bookingController.createBooking);

// --- Specific reads (before /:id) ---
router.get('/me', bookingController.myBookings);
router.get('/pending', requirePermission('booking:read:all'), bookingController.pendingBookings);
router.get('/calendar', validate(calendarQuerySchema, 'query'), bookingController.calendar);
router.get('/', validate(listBookingsQuerySchema, 'query'), bookingController.listBookings);

// --- Item reads ---
router.get('/:id', validate(idParamSchema, 'params'), bookingController.getBooking);
router.get('/:id/history', validate(idParamSchema, 'params'), bookingController.getBookingHistory);

// --- Transitions ---
router.patch('/:id/approve', validate(idParamSchema, 'params'), requirePermission('booking:approve'), validate(approveSchema), bookingController.approveBooking);
router.patch('/:id/reject', validate(idParamSchema, 'params'), requirePermission('booking:reject'), validate(rejectSchema), bookingController.rejectBooking);
router.patch('/:id/cancel', validate(idParamSchema, 'params'), requirePermission('booking:cancel:own'), validate(cancelSchema), bookingController.cancelBooking);
router.patch('/:id/reschedule', validate(idParamSchema, 'params'), requirePermission('booking:create'), validate(rescheduleSchema), bookingController.rescheduleBooking);
router.patch('/:id/complete', validate(idParamSchema, 'params'), authorize(ROLES.ADMIN), bookingController.completeBooking);

export default router;
