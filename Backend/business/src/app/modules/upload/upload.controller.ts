import { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { uploadFile, deleteFile } from '../../helpers/aws_file_uploader/index.js';
import { rdb } from '../../db/index.js';
import { mediaItemsTable, storeMembersTable } from '../../db/schema.js';
import { eq, and, isNull, desc } from 'drizzle-orm';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
];

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

async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  if (req.user?.id) {
    const member = await rdb()
      .select({ storeId: storeMembersTable.storeId })
      .from(storeMembersTable)
      .where(and(eq(storeMembersTable.userId, req.user.id), eq(storeMembersTable.status, 'ACTIVE')))
      .limit(1)
      .then(r => r[0] ?? null);
    return member?.storeId ?? null;
  }
  return null;
}

export async function uploadSingleImage(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const key = buildKey(req.file.originalname);
    const { url } = await uploadFile(req.file.buffer, key, req.file.mimetype);
    const storeId = await resolveStoreId(req);

    const [saved] = await rdb().insert(mediaItemsTable).values({
      storeId: storeId ?? undefined,
      filename: req.file.originalname,
      url,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageKey: key,
    }).returning();

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: saved,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadMultipleImages(req: AuthRequest, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const storeId = await resolveStoreId(req);

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const key = buildKey(file.originalname);
        const { url } = await uploadFile(file.buffer, key, file.mimetype);
        const [saved] = await rdb().insert(mediaItemsTable).values({
          storeId: storeId ?? undefined,
          filename: file.originalname,
          url,
          mimeType: file.mimetype,
          size: file.size,
          storageKey: key,
        }).returning();
        return saved;
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

export async function deleteImage(req: AuthRequest, res: Response) {
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

export async function getMediaLibrary(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);

    const items = storeId
      ? await rdb()
          .select()
          .from(mediaItemsTable)
          .where(and(eq(mediaItemsTable.storeId, storeId), isNull(mediaItemsTable.deletedAt)))
          .orderBy(desc(mediaItemsTable.createdAt))
      : await rdb()
          .select()
          .from(mediaItemsTable)
          .where(isNull(mediaItemsTable.deletedAt))
          .orderBy(desc(mediaItemsTable.createdAt));

    return res.status(200).json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteMediaItem(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const [item] = await rdb()
      .select()
      .from(mediaItemsTable)
      .where(eq(mediaItemsTable.id, id))
      .limit(1);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    if (item.storageKey) {
      try { await deleteFile(item.storageKey); } catch {}
    }

    await rdb()
      .update(mediaItemsTable)
      .set({ deletedAt: new Date() })
      .where(eq(mediaItemsTable.id, id));

    return res.status(200).json({ success: true, message: 'Media deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
