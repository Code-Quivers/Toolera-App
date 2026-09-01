// categories.routes.ts
import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from './categories.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const categoriesRouter = Router();
categoriesRouter.get('/', getCategories);
categoriesRouter.get('/:slug', getCategoryBySlug);
categoriesRouter.post('/', requireAdmin, createCategory);
categoriesRouter.put('/:id', requireAdmin, updateCategory);
categoriesRouter.patch('/:id', requireAdmin, updateCategory);
categoriesRouter.delete('/:id', requireAdmin, deleteCategory);