import { Request, Response } from 'express';
import { eq, isNull, asc, count, and } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { categoriesTable, productsTable, storesTable, storeMembersTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  if (req.query.storeId) return String(req.query.storeId);
  if (req.query.storeSlug) {
    const store = await rdb().select({ id: storesTable.id }).from(storesTable)
      .where(eq(storesTable.slug, String(req.query.storeSlug))).limit(1).then(r => r[0] ?? null);
    if (store) return store.id;
  }
  const host = ((req.headers['x-forwarded-host'] || req.headers.host || '') as string).split(':')[0];
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const byDomain = await rdb().select({ id: storesTable.id }).from(storesTable)
      .where(eq(storesTable.customDomain, host)).limit(1).then(r => r[0] ?? null);
    if (byDomain) return byDomain.id;
  }
  if (req.user?.id) {
    const member = await rdb().select({ storeId: storeMembersTable.storeId }).from(storeMembersTable)
      .where(and(eq(storeMembersTable.userId, req.user.id), eq(storeMembersTable.status, 'ACTIVE'))).limit(1).then(r => r[0] ?? null);
    return member?.storeId ?? null;
  }
  return null;
}

export async function getCategories(req: Request, res: Response) {
  try {
    const storeId = await resolveStoreId(req as AuthRequest);

    const whereClause = storeId
      ? and(isNull(categoriesTable.deletedAt), eq(categoriesTable.storeId, storeId))
      : isNull(categoriesTable.deletedAt);

    const categories = await rdb().query.categoriesTable.findMany({
      where: whereClause,
      with: { children: true },
      orderBy: asc(categoriesTable.position),
    });

    const productCounts = await rdb()
      .select({ categoryId: productsTable.categoryId, count: count() })
      .from(productsTable)
      .where(storeId
        ? and(isNull(productsTable.deletedAt), eq(productsTable.storeId, storeId))
        : isNull(productsTable.deletedAt))
      .groupBy(productsTable.categoryId);

    const countMap = Object.fromEntries(productCounts.map(r => [r.categoryId, Number(r.count)]));

    const result = categories.map(cat => ({ ...cat, _count: { products: countMap[cat.id] ?? 0 } }));
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, slug, image, description, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const storeId = await resolveStoreId(req);
    const finalSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [category] = await db.insert(categoriesTable).values({
      storeId: storeId ?? undefined,
      name: name.trim(),
      slug: finalSlug,
      image: image || null,
      description: description || null,
      parentId: parentId || null,
    }).returning();

    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCategoryBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const category = await rdb().query.categoriesTable.findFirst({
      where: and(eq(categoriesTable.slug, slug), isNull(categoriesTable.deletedAt)),
      with: { children: true },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name, slug, image, description, parentId } = req.body;

    const [updated] = await db.update(categoriesTable).set({
      name: name?.trim(),
      slug: slug?.trim(),
      image: image || null,
      description: description || null,
      parentId: parentId || null,
    }).where(eq(categoriesTable.id, id)).returning();

    return res.json({ success: true, message: 'Category updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
