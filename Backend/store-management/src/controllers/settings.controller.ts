import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, rdb } from '../db/index.js';
import { siteSettingsTable, shippingSettingsTable, paymentSettingsTable } from '../db/schema.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getSettings(req: Request, res: Response) {
  try {
    const [site, shipping, payment] = await Promise.all([
      rdb().select().from(siteSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(shippingSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(paymentSettingsTable).limit(1).then(r => r[0] ?? null),
    ]);

    return res.json({ success: true, data: { site, shipping, payment } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateShippingSettings(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const existing = await rdb().select({ id: shippingSettingsTable.id }).from(shippingSettingsTable).limit(1).then(r => r[0] ?? null);

    const updated = existing
      ? (await db.update(shippingSettingsTable).set(data).where(eq(shippingSettingsTable.id, existing.id)).returning())[0]
      : (await db.insert(shippingSettingsTable).values(data).returning())[0];

    return res.json({ success: true, message: 'Shipping settings updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
