import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

// Public reads (storefront), admin writes enforced downstream
router.use(optionalAuth, proxyTo(config.services.business));

export default router;
