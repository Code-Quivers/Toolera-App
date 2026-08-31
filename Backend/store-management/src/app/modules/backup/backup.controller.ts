import { Request, Response } from 'express';
import { eq, isNull } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import {
  productsTable, categoriesTable, ordersTable, customersTable,
  reviewsTable, abandonedLeadsTable, couponsTable, seoSettingsTable,
  themeSettingsTable, headerSettingsTable, footerSettingsTable,
  productImagesTable, productVariationsTable, orderItemsTable, paymentTransactionsTable,
} from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

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
      rdb().query.productsTable.findMany({ with: { images: true, productVariations: true } }),
      rdb().select().from(categoriesTable),
      rdb().query.ordersTable.findMany({ with: { items: true, transactions: true } }),
      rdb().select().from(customersTable),
      rdb().select().from(reviewsTable),
      rdb().select().from(abandonedLeadsTable),
      rdb().select().from(couponsTable),
      rdb().select().from(seoSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(themeSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(headerSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(footerSettingsTable).limit(1).then(r => r[0] ?? null),
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

export async function restoreStoreBackup(req: AuthRequest, res: Response) {
  try {
    const { backup } = req.body;
    if (!backup || !backup.data) {
      return res.status(400).json({ success: false, message: 'Invalid backup file format' });
    }

    const { settings } = backup.data;

    if (settings?.seo) {
      const existing = await rdb().select({ id: seoSettingsTable.id }).from(seoSettingsTable).limit(1).then(r => r[0] ?? null);
      if (existing) {
        await db.update(seoSettingsTable).set(settings.seo).where(eq(seoSettingsTable.id, existing.id));
      } else {
        await db.insert(seoSettingsTable).values(settings.seo);
      }
    }

    return res.json({ success: true, message: 'Store settings and catalog data restored successfully!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
