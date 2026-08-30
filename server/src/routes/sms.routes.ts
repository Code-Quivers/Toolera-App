import { Router } from 'express';
import { SmsController } from '../controllers/sms.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const smsRouter = Router();

smsRouter.get('/settings', requireAdmin, SmsController.getSettings);
smsRouter.put('/settings', requireAdmin, SmsController.updateSettings);
smsRouter.get('/balance', requireAdmin, SmsController.getBalance);
smsRouter.post('/test', requireAdmin, SmsController.sendTestSms);
smsRouter.get('/logs', requireAdmin, SmsController.getLogs);
