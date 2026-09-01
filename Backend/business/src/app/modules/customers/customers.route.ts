import { Router } from 'express';
import { getCustomers, getCustomerCount } from './customers.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const customersRouter = Router();
customersRouter.get('/count', requireAdmin, getCustomerCount);
customersRouter.get('/', requireAdmin, getCustomers);
