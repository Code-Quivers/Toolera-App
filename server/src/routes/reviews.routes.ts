// reviews.routes.ts
import { Router } from 'express';
import { getReviews, submitReview, updateReviewStatus } from '../controllers/reviews.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const reviewsRouter = Router();
reviewsRouter.get('/', getReviews);
reviewsRouter.post('/', submitReview);
reviewsRouter.patch('/:id/status', requireAdmin, updateReviewStatus);