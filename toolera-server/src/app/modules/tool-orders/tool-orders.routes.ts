import express from 'express';
import { ToolOrdersController } from './tool-orders.controller';

const router = express.Router();

router.get('/stats', ToolOrdersController.getStats);
router.get('/', ToolOrdersController.getAll);

export const ToolOrdersRoutes = router;
