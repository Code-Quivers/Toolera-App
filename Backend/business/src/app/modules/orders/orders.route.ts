// orders.routes.ts
import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  getOrderCount,
  getDashboardStats,
  updateOrderStatus,
  deleteOrder,
  updateOrderTracking,
  publicTrackOrder,
  recordAbandonedLead,
  getAbandonedLeads,
  markLeadRecovered,
} from './orders.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const ordersRouter = Router();
ordersRouter.post('/', createOrder);
ordersRouter.get('/public-track', publicTrackOrder);
ordersRouter.get('/count', requireAdmin, getOrderCount);
ordersRouter.get('/dashboard-stats', requireAdmin, getDashboardStats);
ordersRouter.post('/abandoned-lead', recordAbandonedLead);
ordersRouter.get('/abandoned-leads', requireAdmin, getAbandonedLeads);
ordersRouter.patch('/abandoned-leads/:id/recover', requireAdmin, markLeadRecovered);
ordersRouter.get('/', requireAdmin, getOrders);
ordersRouter.get('/:id', requireAdmin, getOrder);
ordersRouter.patch('/:id/status', requireAdmin, updateOrderStatus);
ordersRouter.patch('/:id/tracking', requireAdmin, updateOrderTracking);
ordersRouter.delete('/:id', requireAdmin, deleteOrder);