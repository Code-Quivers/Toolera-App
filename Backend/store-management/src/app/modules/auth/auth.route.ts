import { Router } from 'express';
import { signup, adminLogin, adminLogout, getAdminProfile, updateAdminProfile } from './auth.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const authRouter = Router();
authRouter.post('/signup', signup);
authRouter.post('/login', adminLogin);
authRouter.post('/admin/login', adminLogin);
authRouter.post('/admin/logout', requireAdmin, adminLogout);
authRouter.get('/admin/profile', requireAdmin, getAdminProfile);
authRouter.put('/admin/profile', requireAdmin, updateAdminProfile);