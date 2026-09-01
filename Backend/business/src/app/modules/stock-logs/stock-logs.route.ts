import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.middleware.js';
import { listStockLogs, createStockLog, deleteStockLog } from './stock-logs.controller.js';

export const stockLogsRouter = Router();

stockLogsRouter.get('/', requireAdmin, listStockLogs);
stockLogsRouter.post('/', requireAdmin, createStockLog);
stockLogsRouter.delete('/:id', requireAdmin, deleteStockLog);
