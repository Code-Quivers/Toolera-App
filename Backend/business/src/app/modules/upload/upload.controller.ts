import { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { uploadFile, deleteFile } from '../../helpers/aws_file_uploader/index.js';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
];

// Memory storage — file goes straight to MinIO/S3, never touches disk
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, WebP, AVIF, GIF, and SVG are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

function buildKey(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.webp';
  const hash = crypto.randomBytes(8).toString('hex');
  const safe = originalName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  return `uploads/${date}/${hash}_${safe}${ext}`;
}

export async function uploadSingleImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const key = buildKey(req.file.originalname);
    const { url } = await uploadFile(req.file.buffer, key, req.file.mimetype);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url, key, size: req.file.size, mimetype: req.file.mimetype },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadMultipleImages(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const key = buildKey(file.originalname);
        const { url } = await uploadFile(file.buffer, key, file.mimetype);
        return { url, key, size: file.size, mimetype: file.mimetype };
      })
    );

    return res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) uploaded successfully`,
      data: uploaded,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteImage(req: Request, res: Response) {
  try {
    const { key } = req.body as { key?: string };
    if (!key) {
      return res.status(400).json({ success: false, message: 'key is required.' });
    }

    await deleteFile(key);
    return res.status(200).json({ success: true, message: 'Image deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
