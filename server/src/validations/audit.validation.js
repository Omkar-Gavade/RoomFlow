/**
 * Audit Zod schemas — ARCHITECTURE.md §10.10. Read-only (no write schemas).
 */
import { z } from 'zod';

import { AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const entityTypes = Object.values(AUDIT_ENTITY_TYPES);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  actor: objectId.optional(),
  action: z.string().trim().max(60).optional(),
  entityType: z.enum(entityTypes).optional(),
  status: z.enum(['success', 'failure']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const idParamSchema = z.object({ id: objectId });

export const entityParamsSchema = z.object({
  type: z.enum(entityTypes),
  id: objectId,
});

export const exportQuerySchema = z.object({
  actor: objectId.optional(),
  action: z.string().trim().max(60).optional(),
  entityType: z.enum(entityTypes).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export default { listQuerySchema, idParamSchema, entityParamsSchema, exportQuerySchema };
