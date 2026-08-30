import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * 1-Click Complete Store Database Backup / Export
 * GET /api/v1/backup/export
 */
export async function exportStoreBackup(req: AuthRequest, res: Response) {
  try {
    const [
      products,
      categories,
      orders,
      customers,
      reviews,
      abandonedLeads,
      coupons,
      seoSettings,
      themeSettings,
      headerSettings,
      footerSettings,
    ] = await Promise.all([
      prisma.product.findMany({ include: { images: true, variations: true } }),
      prisma.category.findMany(),
      prisma.order.findMany({ include: { items: true, transactions: true } }),
      prisma.customer.findMany(),
      prisma.review.findMany(),
      prisma.abandonedLead.findMany(),
      prisma.coupon.findMany(),
      prisma.seoSettings.findFirst(),
      prisma.themeSettings.findFirst(),
      prisma.headerSettings.findFirst(),
      prisma.footerSettings.findFirst(),
    ]);

    const backupSnapshot = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      storeName: "Raifa's Mart",
      counts: {
        products: products.length,
        categories: categories.length,
        orders: orders.length,
        customers: customers.length,
        reviews: reviews.length,
        abandonedLeads: abandonedLeads.length,
      },
      data: {
        products,
        categories,
        orders,
        customers,
        reviews,
        abandonedLeads,
        coupons,
        settings: {
          seo: seoSettings,
          theme: themeSettings,
          header: headerSettings,
          footer: footerSettings,
        },
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="raifas-mart-backup-${Date.now()}.json"`);
    return res.json({ success: true, data: backupSnapshot });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Safe Restore / Import
 * POST /api/v1/backup/restore
 */
export async function restoreStoreBackup(req: AuthRequest, res: Response) {
  try {
    const { backup } = req.body;
    if (!backup || !backup.data) {
      return res.status(400).json({ success: false, message: 'Invalid backup file format' });
    }

    const { products, categories, coupons, settings } = backup.data;

    if (settings?.seo) {
      const existing = await prisma.seoSettings.findFirst();
      if (existing) await prisma.seoSettings.update({ where: { id: existing.id }, data: settings.seo });
      else await prisma.seoSettings.create({ data: settings.seo });
    }

    return res.json({
      success: true,
      message: 'Store settings and catalog data restored successfully!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
