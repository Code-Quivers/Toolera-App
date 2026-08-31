import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Analytics — admin+ only, proxies to store-management reports endpoint
router.use(requireAuth, requireRole('OWNER', 'ADMIN', 'MANAGER'), proxyTo(config.services.storeManagement));

export default router;
