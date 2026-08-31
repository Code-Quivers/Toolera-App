// categories.routes.ts
import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from './categories.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const categoriesRouter = Router();
categoriesRouter.get('/', getCategories);
categoriesRouter.post('/', requireAdmin, createCategory);
categoriesRouter.put('/:id', requireAdmin, updateCategory);
categoriesRouter.delete('/:id', requireAdmin, deleteCategory);