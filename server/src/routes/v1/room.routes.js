/**
 * Room routes — ARCHITECTURE.md §10.3, §11.5, §17.1, §22.
 *
 * Reads: any authenticated role (requirePermission('room:read')).
 * Writes: admin only (authorize('admin')).
 * Static sub-paths (/categories, /facilities) are declared BEFORE /:id so they
 * are not captured as an id. Multipart image upload reuses uploadArray (§17.2.7).
 *
 * DEFERRED to Phase 3 (booking-dependent): GET /:id/availability, GET /available,
 * GET /:id/bookings.
 */
import { Router } from 'express';

import * as roomController from '../../controllers/room.controller.js';
import * as bookingController from '../../controllers/booking.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { uploadArray } from '../../middleware/upload.js';
import { ROLES } from '../../constants/roles.js';
import {
  idParamSchema,
  imageParamSchema,
  listRoomsQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  statusSchema,
  facilitiesSchema,
  operatingHoursSchema,
} from '../../validations/room.validation.js';
import {
  availabilityQuerySchema,
  availableRoomsQuerySchema,
} from '../../validations/booking.validation.js';

const router = Router();

router.use(authenticate);

// ---------------------------------------------------------------------------
// Reads — any authenticated role
// ---------------------------------------------------------------------------
const canRead = requirePermission('room:read');

router.get('/', canRead, validate(listRoomsQuerySchema, 'query'), roomController.listRooms);
router.get('/categories', canRead, roomController.getCategories);
router.get('/facilities', canRead, roomController.getFacilities);
// Availability (Phase 3, booking-derived) — frozen §10.3 paths. Before /:id.
router.get('/available', canRead, validate(availableRoomsQuerySchema, 'query'), bookingController.availableRooms);
router.get('/:id', canRead, validate(idParamSchema, 'params'), roomController.getRoom);
router.get('/:id/availability', canRead, validate(idParamSchema, 'params'), validate(availabilityQuerySchema, 'query'), bookingController.roomAvailability);

// ---------------------------------------------------------------------------
// Writes — admin only
// ---------------------------------------------------------------------------
router.use(authorize(ROLES.ADMIN));

router.post('/', validate(createRoomSchema), roomController.createRoom);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', validate(idParamSchema, 'params'), roomController.deleteRoom);

router.patch('/:id/restore', validate(idParamSchema, 'params'), roomController.restoreRoom);
router.patch('/:id/status', validate(idParamSchema, 'params'), validate(statusSchema), roomController.updateStatus);
router.patch('/:id/facilities', validate(idParamSchema, 'params'), validate(facilitiesSchema), roomController.updateFacilities);
router.patch('/:id/operating-hours', validate(idParamSchema, 'params'), validate(operatingHoursSchema), roomController.updateOperatingHours);

// Images
router.post('/:id/images', validate(idParamSchema, 'params'), uploadArray('images', 5), roomController.addImages);
router.patch('/:id/images/:imageId/primary', validate(imageParamSchema, 'params'), roomController.setPrimaryImage);
router.delete('/:id/images/:imageId', validate(imageParamSchema, 'params'), roomController.removeImage);

export default router;
