import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { DiscountType } from '@prisma/client';

export async function validateCoupon(req: Request, res: Response) {
  try {
    const { code, orderAmount = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).trim().toUpperCase() },
    });

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

    return res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: coupon,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCoupons(req: AuthRequest, res: Response) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    });
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

    const created = await prisma.coupon.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountType: discountType as DiscountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Coupon created', data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}