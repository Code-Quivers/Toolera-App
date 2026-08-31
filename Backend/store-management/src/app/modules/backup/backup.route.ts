import { Router } from 'express';
import { exportStoreBackup, restoreStoreBackup } from './backup.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const backupRouter = Router();

backupRouter.get('/export', requireAdmin, exportStoreBackup);
backupRouter.post('/restore', requireAdmin, restoreStoreBackup);
