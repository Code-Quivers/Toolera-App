import { Request, Response } from 'express';
import { eq, isNull, desc, count } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { reviewsTable, productsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export async function getReviews(req: Request, res: Response) {
  try {
    const { productId, status } = req.query;

    const reviews = await rdb().query.reviewsTable.findMany({
      where: (t, { and, eq: _eq, isNull: _isNull }) => {
        const conditions: any[] = [_isNull(t.deletedAt)];
        if (productId) conditions.push(_eq(t.productId, String(productId)));
        if (status) conditions.push(_eq(t.status, status as any));
        else if (!req.headers.authorization) conditions.push(_eq(t.status, 'APPROVED'));
        return and(...conditions);
      },
      with: { product: { columns: { id: true, title: true, slug: true } } },
      orderBy: desc(reviewsTable.createdAt),
    });

    return res.json({ success: true, data: reviews });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitReview(req: Request, res: Response) {
  try {
    const { productId, customerName, customerLocation, rating, comment, photos, verifiedPurchase } = req.body;

    if (!productId || !customerName || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, customer name, and comment are required' });
    }

    const [newRev] = await db.insert(reviewsTable).values({
      productId,
      customerName: customerName.trim(),
      customerLocation: customerLocation || 'Dhaka',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment: comment.trim(),
      photos: Array.isArray(photos) ? photos : [],
      verifiedPurchase: verifiedPurchase !== false,
      status: 'APPROVED',
    }).returning();

    return res.status(201).json({ success: true, message: 'Review submitted successfully!', data: newRev });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReviewCount(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const where: any = status ? eq(reviewsTable.status, status as any) : isNull(reviewsTable.deletedAt);
    const [result] = await rdb().select({ count: count() }).from(reviewsTable).where(where);
    return res.json({ success: true, data: { count: Number(result.count) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReviewStatus(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const [updated] = await db.update(reviewsTable).set({ status: status as any }).where(eq(reviewsTable.id, id)).returning();
    return res.json({ success: true, message: `Review marked as ${status}`, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReview(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { status, comment, rating } = req.body;
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (comment !== undefined) updates.comment = comment;
    if (rating !== undefined) updates.rating = Number(rating);

    const [updated] = await db.update(reviewsTable).set(updates).where(eq(reviewsTable.id, id)).returning();
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteReview(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.update(reviewsTable).set({ deletedAt: new Date() }).where(eq(reviewsTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
