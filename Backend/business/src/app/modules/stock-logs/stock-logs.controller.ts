import { Response } from 'express';
import { db } from '../../db/index.js';
import { stockLogsTable, storeMembersTable, storesTable } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  // 1. Explicit storeId query param
  if (req.query.storeId) return req.query.storeId as string;

  // 2. storeSlug query param (used by dashboard apiFetch sq() helper)
  const slug = (req.query.storeSlug as string) || (req.body?.storeSlug as string);
  if (slug) {
    const store = await db.select({ id: storesTable.id })
      .from(storesTable)
      .where(eq(storesTable.slug, slug))
      .limit(1)
      .then(r => r[0] ?? null);
    if (store?.id) return store.id;
  }

  // 3. Fall back to user's active store membership
  if (!req.user?.id) return null;
  const member = await db.select({ storeId: storeMembersTable.storeId })
    .from(storeMembersTable)
    .where(and(eq(storeMembersTable.userId, req.user.id), eq(storeMembersTable.status, 'ACTIVE')))
    .limit(1)
    .then(r => r[0] ?? null);
  return member?.storeId ?? null;
}

export async function listStockLogs(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.json({ success: true, data: [] });
    const rows = await db.select().from(stockLogsTable)
      .where(eq(stockLogsTable.storeId, storeId))
      .orderBy(desc(stockLogsTable.createdAt));
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createStockLog(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(400).json({ success: false, message: 'Store not found.' });
    const { productId, productTitle, sku, type, qty, previousStock, newStock, note, actor, costLoss } = req.body;
    if (!productTitle) return res.status(400).json({ success: false, message: 'productTitle is required' });
    const [row] = await db.insert(stockLogsTable).values({
      storeId,
      productId: productId || null,
      productTitle,
      sku: sku || null,
      type: type || 'ADJUSTMENT',
      qty: Number(qty) || 0,
      previousStock: previousStock !== undefined ? Number(previousStock) : null,
      newStock: newStock !== undefined ? Number(newStock) : null,
      note: note || null,
      actor: actor || null,
      costLoss: costLoss !== undefined ? Number(costLoss) : null,
    }).returning();
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteStockLog(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.delete(stockLogsTable).where(eq(stockLogsTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
