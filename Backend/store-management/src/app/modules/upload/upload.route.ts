import { Router } from 'express';
import { upload, uploadSingleImage, uploadMultipleImages, deleteImage, getMediaLibrary, deleteMediaItem } from './upload.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const uploadRouter = Router();

// GET  /api/v1/upload/media        — list media library for this store
uploadRouter.get('/media', requireAdmin, getMediaLibrary);

// POST /api/v1/upload/single       — single image
uploadRouter.post('/single', requireAdmin, upload.single('image'), uploadSingleImage);

// POST /api/v1/upload/multiple     — up to 10 images
uploadRouter.post('/multiple', requireAdmin, upload.array('images', 10), uploadMultipleImages);

// DELETE /api/v1/upload/media/:id  — soft-delete media item + remove from MinIO
uploadRouter.delete('/media/:id', requireAdmin, deleteMediaItem);

// DELETE /api/v1/upload            — delete by storage key (legacy)
uploadRouter.delete('/', requireAdmin, deleteImage);
