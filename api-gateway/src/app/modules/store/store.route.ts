import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Public: slug availability check — no auth needed
router.get('/check-slug/:slug', proxyTo(config.services.storeManagement));

// Authenticated store routes
router.use(requireAuth, proxyTo(config.services.storeManagement));

export default router;
