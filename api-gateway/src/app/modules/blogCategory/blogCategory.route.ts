import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// CMS blog categories — public reads, auth enforced by downstream for writes
router.use(optionalAuth, proxyTo(config.services.storeManagement));

export default router;
