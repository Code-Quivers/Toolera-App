import { Router } from 'express';
import { upload, uploadSingleImage, uploadMultipleImages } from '../controllers/upload.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

export const uploadRouter = Router();

// Single image upload
uploadRouter.post('/single', requireAdmin, upload.single('image'), uploadSingleImage);

// Multiple image upload (up to 10 images)
uploadRouter.post('/multiple', requireAdmin, upload.array('images', 10), uploadMultipleImages);