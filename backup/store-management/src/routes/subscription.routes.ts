import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';

const router = Router();

// Subscription plans & active status
router.get('/plans', subscriptionController.getPlans);
router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/checkout', subscriptionController.checkout);
router.post('/cancel', subscriptionController.cancel);
router.get('/invoices', subscriptionController.getInvoices);

export { router as subscriptionRouter };
