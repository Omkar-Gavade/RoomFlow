/**
 * User routes — ARCHITECTURE.md §10.8, §11.5, §17.1, §22 (RESTful naming).
 *
 * All routes require authentication (router-level). Self routes (`/me`) are gated
 * by requirePermission('profile:update'); admin routes by authorize('admin').
 * `/me` is declared BEFORE `/:id` so "me" is never captured as an id param.
 * State transitions use PATCH sub-paths (§22 rule 9).
 */
import { Router } from 'express';

import * as userController from '../../controllers/user.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize, requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { uploadSingle } from '../../middleware/upload.js';
import { ROLES } from '../../constants/roles.js';
import {
  idParamSchema,
  listUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changeRoleSchema,
  blockUserSchema,
} from '../../validations/user.validation.js';

const router = Router();

// Every user route requires a valid access token.
router.use(authenticate);

// ---------------------------------------------------------------------------
// SELF (owner = req.user) — declared first
// ---------------------------------------------------------------------------
router.get('/me', userController.getMe);
router.patch('/me', requirePermission('profile:update'), validate(updateProfileSchema), userController.updateMe);
router.patch('/me/avatar', requirePermission('profile:update'), uploadSingle('avatar'), userController.updateMyAvatar);
router.delete('/me/avatar', requirePermission('profile:update'), userController.removeMyAvatar);
router.delete('/me', userController.deleteMe);

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------
router.use(authorize(ROLES.ADMIN));

router.get('/', validate(listUsersQuerySchema, 'query'), userController.listUsers);
router.post('/', validate(createUserSchema), userController.createUser);

router.get('/:id', validate(idParamSchema, 'params'), userController.getUser);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', validate(idParamSchema, 'params'), userController.deleteUser);

router.patch('/:id/restore', validate(idParamSchema, 'params'), userController.restoreUser);
router.patch('/:id/block', validate(idParamSchema, 'params'), validate(blockUserSchema), userController.blockUser);
router.patch('/:id/unblock', validate(idParamSchema, 'params'), userController.unblockUser);
router.patch('/:id/deactivate', validate(idParamSchema, 'params'), validate(blockUserSchema), userController.deactivateUser);
router.patch('/:id/activate', validate(idParamSchema, 'params'), userController.activateUser);
router.patch('/:id/role', validate(idParamSchema, 'params'), validate(changeRoleSchema), userController.changeRole);
router.patch('/:id/approve', validate(idParamSchema, 'params'), userController.approveRole);
router.patch('/:id/reject', validate(idParamSchema, 'params'), userController.rejectRole);

export default router;
