/**
 * Report routes — ARCHITECTURE.md §10.6, §11.5, §17.1.
 * All read-only, gated by permission report:read (staff + admin; admin '*').
 */
import { Router } from 'express';

import * as reportController from '../../controllers/report.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  dailyQuerySchema,
  weeklyQuerySchema,
  monthlyQuerySchema,
  rangeQuerySchema,
  utilizationQuerySchema,
  mostBookedQuerySchema,
  exportQuerySchema,
} from '../../validations/report.validation.js';

const router = Router();

router.use(authenticate, requirePermission('report:read'));

router.get('/daily', validate(dailyQuerySchema, 'query'), reportController.daily);
router.get('/weekly', validate(weeklyQuerySchema, 'query'), reportController.weekly);
router.get('/monthly', validate(monthlyQuerySchema, 'query'), reportController.monthly);
router.get('/utilization', validate(utilizationQuerySchema, 'query'), reportController.utilization);
router.get('/most-booked', validate(mostBookedQuerySchema, 'query'), reportController.mostBooked);
router.get('/peak-hours', validate(rangeQuerySchema, 'query'), reportController.peakHours);
router.get('/user-activity', validate(rangeQuerySchema, 'query'), reportController.userActivity);
router.get('/cancellations', validate(rangeQuerySchema, 'query'), reportController.cancellations);
router.get('/export', validate(exportQuerySchema, 'query'), reportController.exportReport);

export default router;
