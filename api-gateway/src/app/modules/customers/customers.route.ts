import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { toBusiness } from '../../shared/index.js';

const router = Router();
router.use(requireAuth, toBusiness());
export default router;
