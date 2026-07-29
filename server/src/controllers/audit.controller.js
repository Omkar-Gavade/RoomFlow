/**
 * Audit controller — ARCHITECTURE.md §16, §10.10. Read-only (admin).
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { toCSV } from '../utils/csvExporter.js';
import * as auditService from '../services/audit.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await auditService.listAuditLogs(req.query);
  return new ApiResponse(HTTP_STATUS.OK, items, 'Audit logs', meta).send(res);
});

export const getOne = asyncHandler(async (req, res) => {
  const log = await auditService.getAuditLog(req.params.id);
  return new ApiResponse(HTTP_STATUS.OK, { log }, 'Audit log').send(res);
});

export const byEntity = asyncHandler(async (req, res) => {
  const history = await auditService.entityHistory(req.params.type, req.params.id);
  return new ApiResponse(HTTP_STATUS.OK, history, 'Entity history').send(res);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const rows = await auditService.fetchForExport(req.query);
  const csv = toCSV(rows, [
    { key: 'createdAt', label: 'Timestamp' },
    { key: 'actorName', label: 'Actor' },
    { key: 'actorRole', label: 'Role' },
    { key: 'action', label: 'Action' },
    { key: 'entityType', label: 'Entity' },
    { key: 'entityId', label: 'Entity Id' },
    { key: 'status', label: 'Status' },
    { key: 'ipAddress', label: 'IP' },
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
  return res.status(HTTP_STATUS.OK).send(csv);
});

export default { list, getOne, byEntity, exportCsv };
