import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { proxyTo } from '../../shared';
import { config } from '../../config';

const router = Router();

router.use(requireAuth, proxyTo(config.services.storeManagement));

export default router;
