import { Router, Request, Response, NextFunction } from 'express';
import { internalController } from './internal.controller.js';

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  if (!INTERNAL_KEY || req.headers['x-internal-key'] !== INTERNAL_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}

const router = Router();

router.use(requireInternalKey);

router.get('/user', internalController.getUser);
router.get('/store', internalController.getStore);
router.get('/store/:storeId/usage', internalController.getStoreUsage);

export { router as internalRouter };
