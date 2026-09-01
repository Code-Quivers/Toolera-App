import { Response } from 'express';
import { db } from '../../db/index.js';
import { expensesTable, storeMembersTable } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';

async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  if (req.query.storeId) return req.query.storeId as string;
  if (!req.user?.id) return null;
  const member = await db.select({ storeId: storeMembersTable.storeId })
    .from(storeMembersTable)
    .where(and(eq(storeMembersTable.userId, req.user.id), eq(storeMembersTable.status, 'ACTIVE')))
    .limit(1)
    .then(r => r[0] ?? null);
  return member?.storeId ?? null;
}

export async function listExpenses(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.json({ success: true, data: [] });
    const rows = await db.select().from(expensesTable)
      .where(eq(expensesTable.storeId, storeId))
      .orderBy(desc(expensesTable.createdAt));
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createExpense(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(400).json({ success: false, message: 'Store not found.' });
    const { title, amount, category, note, date } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const [row] = await db.insert(expensesTable).values({
      storeId, title, amount: Number(amount) || 0, category: category || null, note: note || null, date: date || null,
    }).returning();
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateExpense(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { title, amount, category, note, date } = req.body;
    const [row] = await db.update(expensesTable)
      .set({ title, amount: amount !== undefined ? Number(amount) : undefined, category, note, date })
      .where(eq(expensesTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteExpense(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.delete(expensesTable).where(eq(expensesTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
