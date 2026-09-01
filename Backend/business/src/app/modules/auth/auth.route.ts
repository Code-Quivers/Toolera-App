import { Router } from 'express';
import { signup, login, getMe } from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, getMe);
