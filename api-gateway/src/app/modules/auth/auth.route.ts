import { Router } from 'express';
import { authRateLimit } from '../../middlewares/rateLimit.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// POST /api/v1/auth/register
// POST /api/v1/auth/login
// POST /api/v1/auth/refresh
// GET  /api/v1/auth/me
router.use(authRateLimit, proxyTo(config.services.storeManagement));

export default router;
