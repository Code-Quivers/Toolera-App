import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// GET/PUT /api/v1/stores  →  store-management
router.use(requireAuth, proxyTo(config.services.storeManagement));

export default router;
