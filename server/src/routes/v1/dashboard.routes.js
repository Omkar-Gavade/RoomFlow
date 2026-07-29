/**
 * Dashboard routes — ARCHITECTURE.md §10.5, §11.5, §17.1.
 * Each role gets one aggregate endpoint; stats is role-scoped in the service.
 */
import { Router } from 'express';

import * as dashboardController from '../../controllers/dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../constants/roles.js';
import { activityQuerySchema } from '../../validations/dashboard.validation.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize(ROLES.ADMIN), dashboardController.admin);
router.get('/staff', requirePermission('dashboard:staff'), dashboardController.staff);
router.get('/student', requirePermission('dashboard:student'), dashboardController.student);
router.get('/stats', dashboardController.stats);
router.get('/activity', authorize(ROLES.ADMIN), validate(activityQuerySchema, 'query'), dashboardController.activity);

export default router;
