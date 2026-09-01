import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, bulkUpdateProducts } from './products.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const productsRouter = Router();
productsRouter.get('/', getProducts);
productsRouter.get('/:slug', getProductBySlug);
productsRouter.post('/', requireAdmin, createProduct);
productsRouter.put('/bulk', requireAdmin, bulkUpdateProducts);
productsRouter.put('/:id', requireAdmin, updateProduct);
productsRouter.patch('/:id', requireAdmin, updateProduct);
productsRouter.delete('/:id', requireAdmin, deleteProduct);