import { Request, Response } from 'express';
import { eq, isNull, asc, count } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { categoriesTable, productsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await rdb().query.categoriesTable.findMany({
      where: isNull(categoriesTable.deletedAt),
      with: { children: true },
      orderBy: asc(categoriesTable.position),
    });

    const productCounts = await rdb()
      .select({ categoryId: productsTable.categoryId, count: count() })
      .from(productsTable)
      .where(isNull(productsTable.deletedAt))
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

    const finalSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [category] = await db.insert(categoriesTable).values({
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
