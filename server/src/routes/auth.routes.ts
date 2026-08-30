// auth.routes.ts
import { Router } from 'express';
import { adminLogin, getAdminProfile, updateAdminProfile } from '../controllers/auth.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const authRouter = Router();
authRouter.post('/admin/login', adminLogin);
authRouter.get('/admin/profile', requireAdmin, getAdminProfile);
authRouter.put('/admin/profile', requireAdmin, updateAdminProfile);