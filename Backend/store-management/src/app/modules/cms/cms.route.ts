// cms.routes.ts
import { Router } from 'express';
import { getCmsConfig, saveHomepageSections, updateThemeSettings, updateSeoSettings } from './cms.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const cmsRouter = Router();
cmsRouter.get('/', getCmsConfig);
cmsRouter.post('/sections', requireAdmin, saveHomepageSections);
cmsRouter.put('/theme', requireAdmin, updateThemeSettings);
cmsRouter.put('/seo', requireAdmin, updateSeoSettings);