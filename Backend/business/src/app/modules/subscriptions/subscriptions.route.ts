import { Router } from 'express';
import { getPlans, getMySubscription, activateSubscription } from './subscriptions.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

export const subscriptionsRouter = Router();

subscriptionsRouter.get('/plans', getPlans);
subscriptionsRouter.get('/my', requireAuth, getMySubscription);
subscriptionsRouter.post('/activate', activateSubscription);
