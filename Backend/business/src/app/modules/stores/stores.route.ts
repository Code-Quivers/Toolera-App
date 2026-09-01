import { Router } from 'express';
import { getMyStore, createStore, updateStore, checkSlug } from './stores.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

export const storesRouter = Router();

storesRouter.get('/me', requireAuth, getMyStore);
storesRouter.post('/', requireAuth, createStore);
storesRouter.patch('/:id', requireAuth, updateStore);
storesRouter.get('/check-slug/:slug', checkSlug);
