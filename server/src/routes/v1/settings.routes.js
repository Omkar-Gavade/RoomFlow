/**
 * Settings routes — ARCHITECTURE.md §10.9, §11.5, §17.1.
 * Profile/password: any authenticated user. System/holidays: admin.
 */
import { Router } from 'express';

import * as settingsController from '../../controllers/settings.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../constants/roles.js';
import { updateProfileSchema } from '../../validations/user.validation.js';
import { changePasswordSchema } from '../../validations/auth.validation.js';
import {
  systemConfigSchema,
  bookingRulesSchema,
  holidaySchema,
  holidayIdParamSchema,
} from '../../validations/settings.validation.js';

const router = Router();

router.use(authenticate);

// Profile / password (self)
router.get('/profile', settingsController.getProfile);
router.patch('/profile', requirePermission('profile:update'), validate(updateProfileSchema), settingsController.updateProfile);
router.patch('/password', validate(changePasswordSchema), settingsController.changePassword);

// Holidays (read = any; write = admin)
router.get('/holidays', settingsController.listHolidays);
router.post('/holidays', authorize(ROLES.ADMIN), validate(holidaySchema), settingsController.addHoliday);
router.delete('/holidays/:id', authorize(ROLES.ADMIN), validate(holidayIdParamSchema, 'params'), settingsController.removeHoliday);

// System config (admin)
router.get('/system', authorize(ROLES.ADMIN), settingsController.getSystem);
router.put('/system', authorize(ROLES.ADMIN), validate(systemConfigSchema), settingsController.updateSystem);
router.patch('/system/booking-rules', authorize(ROLES.ADMIN), validate(bookingRulesSchema), settingsController.updateBookingRules);

export default router;
