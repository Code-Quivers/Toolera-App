import { Router } from 'express';
import { bookCourier, trackCourier, getCourierBalance, getCourierSettings, updateCourierSettings, testPathao } from '../controllers/courier.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const courierRouter = Router();

// Courier Booking & Tracking
courierRouter.post('/book', requireAdmin, bookCourier);
courierRouter.get('/track/:trackingCode', trackCourier);
courierRouter.get('/balance', requireAdmin, getCourierBalance);
courierRouter.post('/pathao/test', requireAdmin, testPathao);

// Settings
courierRouter.get('/settings', requireAdmin, getCourierSettings);
courierRouter.put('/settings', requireAdmin, updateCourierSettings);