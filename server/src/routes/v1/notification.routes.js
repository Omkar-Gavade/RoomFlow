/**
 * Notification routes — ARCHITECTURE.md §10.7, §17.1.
 * All authenticated; items are owner-scoped in the service. Broadcast = admin.
 * Specific paths declared before /:id.
 */
import { Router } from 'express';

import * as notificationController from '../../controllers/notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../constants/roles.js';
import {
  idParamSchema,
  listQuerySchema,
  broadcastSchema,
  preferencesSchema,
} from '../../validations/notification.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listQuerySchema, 'query'), notificationController.list);
router.get('/unread-count', notificationController.unreadCount);

router.post('/broadcast', authorize(ROLES.ADMIN), validate(broadcastSchema), notificationController.broadcast);

router.put('/preferences', validate(preferencesSchema), notificationController.updatePreferences);
router.patch('/read-all', notificationController.markAllRead);
router.delete('/clear-all', notificationController.clearRead);

router.get('/:id', validate(idParamSchema, 'params'), notificationController.getOne);
router.patch('/:id/read', validate(idParamSchema, 'params'), notificationController.markRead);
router.delete('/:id', validate(idParamSchema, 'params'), notificationController.remove);

export default router;
