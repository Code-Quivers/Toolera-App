import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// GET  /api/v1/cms  (public reads, auth optional)
// POST /api/v1/cms  (admin writes — auth enforced by downstream)
router.use(optionalAuth, proxyTo(config.services.storeManagement));

export default router;
