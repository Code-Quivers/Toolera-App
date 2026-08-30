import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getSettings(req: Request, res: Response) {
  try {
    const [site, shipping, payment] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.shippingSettings.findFirst(),
      prisma.paymentSettings.findFirst(),
    ]);

    return res.json({
      success: true,
      data: {
        site,
        shipping,
        payment,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateShippingSettings(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const existing = await prisma.shippingSettings.findFirst();

    const updated = existing
      ? await prisma.shippingSettings.update({ where: { id: existing.id }, data })
      : await prisma.shippingSettings.create({ data });

    return res.json({ success: true, message: 'Shipping settings updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}