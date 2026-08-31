import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Billing, invoices, plan management — owner/admin only
router.use(requireAuth, requireRole('OWNER', 'ADMIN'), proxyTo(config.services.storeManagement));

export default router;
