// settings.routes.ts
import { Router } from 'express';
import { getSettings, updateShippingSettings } from '../controllers/settings.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const settingsRouter = Router();
settingsRouter.get('/', getSettings);
settingsRouter.put('/shipping', requireAdmin, updateShippingSettings);