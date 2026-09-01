// settings.routes.ts
import { Router } from 'express';
import {
  getSettings,
  getShippingSettings, updateShippingSettings,
  getPaymentSettings, updatePaymentSettings,
  getCourierSettings, updateCourierSettings, getCourierBalance, testPathaoConnection,
  getSmsSettings, updateSmsSettings, getSmsBalance, sendTestSms,
  getInvoiceSettings, updateInvoiceSettings,
  exportBackup, restoreBackup,
} from './settings.controller.js';
import { getCmsConfig, updateSeoSettings } from '../cms/cms.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const settingsRouter = Router();

settingsRouter.get('/', getSettings);

// Shipping
settingsRouter.get('/shipping', getShippingSettings);
settingsRouter.put('/shipping', requireAdmin, updateShippingSettings);

// Payment
settingsRouter.get('/payment', getPaymentSettings);
settingsRouter.put('/payment', requireAdmin, updatePaymentSettings);

// Courier
settingsRouter.get('/courier', getCourierSettings);
settingsRouter.put('/courier', requireAdmin, updateCourierSettings);
settingsRouter.get('/courier/balance', requireAdmin, getCourierBalance);
settingsRouter.get('/courier/test-pathao', requireAdmin, testPathaoConnection);

// SMS
settingsRouter.get('/sms', getSmsSettings);
settingsRouter.put('/sms', requireAdmin, updateSmsSettings);
settingsRouter.get('/sms/balance', requireAdmin, getSmsBalance);
settingsRouter.post('/sms/test', requireAdmin, sendTestSms);

// Invoice
settingsRouter.get('/invoice', getInvoiceSettings);
settingsRouter.put('/invoice', requireAdmin, updateInvoiceSettings);

// CMS config (combined for analytics / pixel settings)
settingsRouter.get('/cms', getCmsConfig);
settingsRouter.put('/cms', requireAdmin, updateSeoSettings);
settingsRouter.put('/seo', requireAdmin, updateSeoSettings);

// Backup
settingsRouter.get('/backup/export', requireAdmin, exportBackup);
settingsRouter.post('/backup/restore', requireAdmin, restoreBackup);
