import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webp';
    const hash = crypto.randomBytes(6).toString('hex');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    cb(null, `rm_${Date.now()}_${hash}_${safeName}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP, AVIF, and GIF are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10,
  },
});

function getPublicUrl(req: Request, filename: string): string {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}/uploads/${filename}`;
}

export async function uploadSingleImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const publicUrl = getPublicUrl(req, req.file.filename);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: publicUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
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

    const uploaded = files.map((file) => ({
      url: getPublicUrl(req, file.filename),
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) uploaded successfully`,
      data: uploaded,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}