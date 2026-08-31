import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Public — no auth needed to list plans
router.get('/plans', proxyTo(config.services.storeManagement));

// Everything else requires a valid session
router.use(requireAuth, proxyTo(config.services.storeManagement));

export default router;
