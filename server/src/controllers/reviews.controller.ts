import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { ReviewStatus } from '@prisma/client';

export async function getReviews(req: Request, res: Response) {
  try {
    const { productId, status } = req.query;
    const where: any = { deletedAt: null };

    if (productId) where.productId = String(productId);
    if (status) where.status = status as ReviewStatus;
    else if (!req.headers.authorization) where.status = ReviewStatus.APPROVED; // Public only sees approved

    const reviews = await prisma.review.findMany({
      where,
      include: { product: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
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

    const newRev = await prisma.review.create({
      data: {
        productId,
        customerName: customerName.trim(),
        customerLocation: customerLocation || 'Dhaka',
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: comment.trim(),
        photos: Array.isArray(photos) ? photos : [],
        verifiedPurchase: verifiedPurchase !== false,
        status: ReviewStatus.APPROVED, // Automatically approve so shopper sees it, admin can moderate anytime
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: newRev,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateReviewStatus(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const updated = await prisma.review.update({
      where: { id },
      data: { status: status as ReviewStatus },
    });

    return res.json({ success: true, message: `Review marked as ${status}`, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}