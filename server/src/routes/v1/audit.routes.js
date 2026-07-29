/**
 * Audit routes — ARCHITECTURE.md §10.10, §2.8.
 * Admin-only, READ-ONLY. No POST/PUT/PATCH/DELETE — the audit trail is immutable.
 * Specific paths declared before /:id.
 */
import { Router } from 'express';

import * as auditController from '../../controllers/audit.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { ROLES } from '../../constants/roles.js';
import {
  listQuerySchema,
  idParamSchema,
  entityParamsSchema,
  exportQuerySchema,
} from '../../validations/audit.validation.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', validate(listQuerySchema, 'query'), auditController.list);
router.get('/export', validate(exportQuerySchema, 'query'), auditController.exportCsv);
router.get('/entity/:type/:id', validate(entityParamsSchema, 'params'), auditController.byEntity);
router.get('/:id', validate(idParamSchema, 'params'), auditController.getOne);

export default router;
