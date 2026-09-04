import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware.js';
import { proxyTo } from '../../shared/index.js';
import { config } from '../../config/index.js';

const router = Router();

// Proxy /api/v1/themes and /api/v1/admin/themes to storeManagement service
router.use(optionalAuth, proxyTo(config.services.storeManagement));

export default router;
