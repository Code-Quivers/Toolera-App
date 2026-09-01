import { Request, Response } from 'express';
import { eq, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { storesTable, subscriptionsTable, subscriptionPlansTable } from '../../db/schema.js';

export async function getMyStore(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

    const [store] = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.ownerId, userId))
      .limit(1);

    if (!store) return res.status(404).json({ success: false, message: 'No store found for this account.' });

    const [sub] = await db
      .select({ sub: subscriptionsTable, plan: subscriptionPlansTable })
      .from(subscriptionsTable)
      .leftJoin(subscriptionPlansTable, eq(subscriptionsTable.planId, subscriptionPlansTable.id))
      .where(eq(subscriptionsTable.storeId, store.id))
      .limit(1);

    return res.json({
      success: true,
      data: {
        ...store,
        subscription: sub
          ? { ...sub.sub, plan: sub.plan }
          : null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createStore(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' });

    const existing = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.ownerId, userId)).limit(1);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'You already have a store.' });

    const { name, slug, description, currency = 'BDT', currencySymbol = '৳' } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug are required.' });

    const slugConflict = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, slug)).limit(1);
    if (slugConflict.length > 0) return res.status(409).json({ success: false, message: 'This slug is already taken.' });

    const [store] = await db.insert(storesTable).values({
      name, slug, description, currency, currencySymbol, ownerId: userId, status: 'SETUP',
    }).returning();

    return res.status(201).json({ success: true, data: store });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStore(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const [store] = await db.select({ ownerId: storesTable.ownerId }).from(storesTable).where(eq(storesTable.id, id)).limit(1);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    if (store.ownerId !== userId) return res.status(403).json({ success: false, message: 'Forbidden.' });

    const allowed = ['name', 'description', 'tagline', 'logoUrl', 'faviconUrl', 'email', 'phone', 'whatsapp', 'address', 'district', 'currency', 'currencySymbol', 'status'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const [updated] = await db.update(storesTable).set(updates).where(eq(storesTable.id, id)).returning();
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function checkSlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const [existing] = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, slug)).limit(1);
    return res.json({ success: true, available: !existing });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
