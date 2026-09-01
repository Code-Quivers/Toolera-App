// reviews.routes.ts
import { Router } from 'express';
import { getReviews, getReviewCount, submitReview, updateReviewStatus, updateReview, deleteReview } from './reviews.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const reviewsRouter = Router();
reviewsRouter.get('/count', getReviewCount);
reviewsRouter.get('/', getReviews);
reviewsRouter.post('/', submitReview);
reviewsRouter.patch('/:id/status', requireAdmin, updateReviewStatus);
reviewsRouter.patch('/:id', requireAdmin, updateReview);
reviewsRouter.delete('/:id', requireAdmin, deleteReview);