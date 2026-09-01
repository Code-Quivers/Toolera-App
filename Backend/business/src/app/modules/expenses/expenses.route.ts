import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.middleware.js';
import { listExpenses, createExpense, updateExpense, deleteExpense } from './expenses.controller.js';

export const expensesRouter = Router();

expensesRouter.get('/', requireAdmin, listExpenses);
expensesRouter.post('/', requireAdmin, createExpense);
expensesRouter.patch('/:id', requireAdmin, updateExpense);
expensesRouter.delete('/:id', requireAdmin, deleteExpense);
