// orders.routes.ts
import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  publicTrackOrder,
  recordAbandonedLead,
  getAbandonedLeads,
  markLeadRecovered,
} from './orders.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const ordersRouter = Router();
ordersRouter.post('/', createOrder);
ordersRouter.get('/public-track', publicTrackOrder);
ordersRouter.post('/abandoned-lead', recordAbandonedLead);
ordersRouter.get('/abandoned-leads', requireAdmin, getAbandonedLeads);
ordersRouter.patch('/abandoned-leads/:id/recover', requireAdmin, markLeadRecovered);
ordersRouter.get('/', requireAdmin, getOrders);
ordersRouter.patch('/:id/status', requireAdmin, updateOrderStatus);