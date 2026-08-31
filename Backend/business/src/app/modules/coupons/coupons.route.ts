// coupons.routes.ts
import { Router } from 'express';
import { validateCoupon, getCoupons, createCoupon } from './coupons.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const couponsRouter = Router();
couponsRouter.post('/validate', validateCoupon);
couponsRouter.get('/', requireAdmin, getCoupons);
couponsRouter.post('/', requireAdmin, createCoupon);