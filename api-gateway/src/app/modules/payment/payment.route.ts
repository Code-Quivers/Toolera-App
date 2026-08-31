import { Router } from 'express';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Payment callbacks must be unauthenticated (bKash/Nagad webhooks)
router.use(proxyTo(config.services.business));

export default router;
