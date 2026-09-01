import { Request, Response } from 'express';
import { eq, isNull, asc } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { couponsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, orderAmount = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = await rdb()
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, String(code).trim().toUpperCase()))
      .limit(1)
      .then(r => r[0] ?? null);

    if (!coupon || !coupon.active || coupon.deletedAt) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.minOrderValue && Number(orderAmount) < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ৳${coupon.minOrderValue}`,
      });
    }

    return res.json({ success: true, message: 'Coupon applied successfully', data: coupon });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCoupons(req: AuthRequest, res: Response) {
  try {
    const coupons = await rdb()
      .select()
      .from(couponsTable)
      .where(isNull(couponsTable.deletedAt))
      .orderBy(asc(couponsTable.code));
    return res.json({ success: true, data: coupons });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, discountType = 'PERCENTAGE', discountValue, minOrderValue = 0, expiresAt } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value required' });
    }

    const [created] = await db.insert(couponsTable).values({
      code: String(code).trim().toUpperCase(),
      discountType: discountType as any,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    return res.status(201).json({ success: true, message: 'Coupon created', data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCoupon(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { code, discountType, discountValue, minOrderValue, expiresAt, active } = req.body;
    const updates: any = {};
    if (code !== undefined) updates.code = String(code).trim().toUpperCase();
    if (discountType !== undefined) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) updates.minOrderValue = Number(minOrderValue);
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) updates.active = Boolean(active);

    const [updated] = await db.update(couponsTable).set(updates).where(eq(couponsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCoupon(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.update(couponsTable).set({ deletedAt: new Date() }).where(eq(couponsTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
