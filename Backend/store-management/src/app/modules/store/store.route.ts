import { Router } from 'express';
import { storeController } from './store.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Slug availability check (public — no auth needed)
router.get('/check-slug/:slug', storeController.checkSlug);

// Current user's store
router.get('/me', requireAuth, storeController.getMyStore);

// Store routes
router.get('/', storeController.listStores);
router.post('/', storeController.createStore);
router.get('/:id', storeController.getStore);
router.put('/:id', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);

// Store members
router.post('/:id/members', storeController.addStoreMember);
router.delete('/:id/members/:memberId', storeController.removeStoreMember);

export { router as storeRouter };
