import { Router } from 'express';
import { storeController } from './store.controller.js';

const router = Router();

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
