import { Router } from 'express';
import { upload, uploadSingleImage, uploadMultipleImages, deleteImage } from './upload.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const uploadRouter = Router();

// POST /api/v1/upload/single   — single image
uploadRouter.post('/single', requireAdmin, upload.single('image'), uploadSingleImage);

// POST /api/v1/upload/multiple — up to 10 images
uploadRouter.post('/multiple', requireAdmin, upload.array('images', 10), uploadMultipleImages);

// DELETE /api/v1/upload        — delete by key
uploadRouter.delete('/', requireAdmin, deleteImage);
