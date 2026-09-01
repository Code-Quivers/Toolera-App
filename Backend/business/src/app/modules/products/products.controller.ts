import { Request, Response } from 'express';
import { eq, isNull, desc, asc, or, ilike, and, count, ne } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { productsTable, categoriesTable, productImagesTable, storesTable, storeMembersTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { KafkaClient } from '../../shared/kafka.js';
import { TOPICS, StockChangedEvent } from '../../shared/events.js';

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  if (req.query.storeId) return String(req.query.storeId);
  if (req.query.storeSlug) {
    const store = await rdb().select({ id: storesTable.id }).from(storesTable)
      .where(eq(storesTable.slug, String(req.query.storeSlug))).limit(1).then(r => r[0] ?? null);
    if (store) return store.id;
  }
  // Custom domain support
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

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search, badge, sort, limit = 50, page = 1 } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // Resolve store filter — storefront passes ?storeSlug=, dashboard omits it
    const storeId = await resolveStoreId(req as AuthRequest);

    const buildWhere = () => {
      const conditions: any[] = [isNull(productsTable.deletedAt)];
      if (storeId) conditions.push(eq(productsTable.storeId, storeId));
      if (badge) conditions.push(eq(productsTable.badge, String(badge)));
      if (search) {
        const q = `%${String(search).trim()}%`;
        conditions.push(or(
          ilike(productsTable.title, q),
          ilike(productsTable.description, q),
          ilike(productsTable.sku, q),
        ));
      }
      return and(...conditions);
    };

    let orderBy: any = desc(productsTable.createdAt);
    if (sort === 'price-asc') orderBy = asc(productsTable.price);
    if (sort === 'price-desc') orderBy = desc(productsTable.price);
    if (sort === 'popular' || sort === 'rating') orderBy = desc(productsTable.calculatedRating);

    const [products, totalResult] = await Promise.all([
      rdb().query.productsTable.findMany({
        where: (t, { and: _and, isNull: _isNull, eq: _eq }) => {
          const conds: any[] = [_isNull(t.deletedAt)];
          if (storeId) conds.push(_eq(t.storeId, storeId));
          if (badge) conds.push(_eq(t.badge, String(badge)));
          if (search) {
            const q = `%${String(search).trim()}%`;
            conds.push(or(ilike(t.title, q), ilike(t.description, q), ilike(t.sku, q)));
          }
          return _and(...conds);
        },
        with: {
          category: true,
          images: { orderBy: asc(productImagesTable.position) },
          variants: true,
          productAttributes: { with: { values: true, attribute: true } },
          productVariations: { with: { attributes: true } },
        },
        orderBy,
        limit: take,
        offset: skip,
      }),
      rdb().select({ count: count() }).from(productsTable).where(buildWhere()),
    ]);

    // Filter by category slug after join (category relation)
    const filtered = category && category !== 'all'
      ? products.filter((p: any) => p.category?.slug === String(category))
      : products;

    const total = Number(totalResult[0].count);
    return res.json({
      success: true,
      data: filtered,
      pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const target = String(req.params.slug);

    const product = await rdb().query.productsTable.findFirst({
      where: (t, { and: _and, or: _or, isNull: _isNull, eq: _eq }) =>
        _and(_or(_eq(t.slug, target), _eq(t.id, target)), _isNull(t.deletedAt)),
      with: {
        category: true,
        images: { orderBy: asc(productImagesTable.position) },
        variants: true,
        productAttributes: { with: { values: true, attribute: true } },
        productVariations: { with: { attributes: true } },
        reviews: {
          where: (t, { eq: _eq }) => _eq(t.status, 'APPROVED'),
          orderBy: desc(productsTable.createdAt),
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await rdb().query.productsTable.findMany({
      where: (t, { and: _and, isNull: _isNull, eq: _eq, ne: _ne }) =>
        _and(_eq(t.categoryId, product.categoryId!), _ne(t.id, product.id), _isNull(t.deletedAt)),
      with: {
        category: true,
        images: { orderBy: asc(productImagesTable.position) },
      },
      limit: 8,
    });

    return res.json({ success: true, data: product, relatedProducts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const {
      title, slug, categoryId, categorySlug, category,
      price, compareAtPrice, costPrice, buyingPrice, sku, stock,
      shortDescription, description, badge, tags = [], status = 'PUBLISHED',
      isFeatured = false, isTrending = false, isNewArrival = false, isBestSeller = false,
      productType = 'SIMPLE', images = [],
      features, specifications,
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title and price are required.' });
    }

    const storeId = await resolveStoreId(req);

    const generatedSlug = (slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalSku = sku || `SKU-${Date.now()}`;

    // Resolve category: prefer explicit categoryId, then categorySlug, then name match, then first
    let catId = categoryId;
    if (!catId && categorySlug) {
      const cat = await rdb().select({ id: categoriesTable.id }).from(categoriesTable)
        .where(eq(categoriesTable.slug, String(categorySlug))).limit(1).then(r => r[0] ?? null);
      catId = cat?.id;
    }
    if (!catId && category) {
      const catByName = await rdb().select({ id: categoriesTable.id }).from(categoriesTable)
        .where(eq(categoriesTable.name, String(category))).limit(1).then(r => r[0] ?? null);
      catId = catByName?.id;
    }
    if (!catId) {
      const firstCat = await rdb().select({ id: categoriesTable.id }).from(categoriesTable)
        .limit(1).then(r => r[0] ?? null);
      catId = firstCat?.id;
    }

    // Filter out non-URL images (base64 data: URIs) — client should upload via /upload/single first
    const validImages: string[] = (Array.isArray(images) ? images : [])
      .filter((u: string) => typeof u === 'string' && !u.startsWith('data:'));

    const created = await db.transaction(async (tx) => {
      const [product] = await tx.insert(productsTable).values({
        title: title.trim(),
        slug: generatedSlug,
        categoryId: catId,
        storeId: storeId ?? undefined,
        price: Math.round(Number(price)),
        compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice)) : null,
        buyingPrice: costPrice ? Math.round(Number(costPrice)) : (buyingPrice ? Math.round(Number(buyingPrice)) : null),
        sku: finalSku,
        stock: Number(stock) || 0,
        shortDescription: shortDescription || title,
        description: description || shortDescription || title,
        badge: badge || null,
        tags: Array.isArray(tags) ? tags : [],
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        status: ['PUBLISHED', 'DRAFT'].includes(status) ? status : 'PUBLISHED',
        features: features ? (Array.isArray(features) ? features : null) : null,
        specifications: specifications ? (Array.isArray(specifications) ? specifications : null) : null,
        productType,
      }).returning();

      if (validImages.length > 0) {
        await tx.insert(productImagesTable).values(
          validImages.map((url: string, idx: number) => ({ productId: product.id, url, position: idx }))
        );
      }

      return product;
    });

    const withImages = await rdb().query.productsTable.findFirst({
      where: eq(productsTable.id, created.id),
      with: { images: true, category: true },
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', data: withImages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const updateData = { ...req.body };

    const existing = await rdb().select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, id)).limit(1).then(r => r[0] ?? null);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const images = updateData.images;

    // Resolve categorySlug → categoryId if provided
    if (updateData.categorySlug && !updateData.categoryId) {
      const cat = await rdb().select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, String(updateData.categorySlug))).limit(1).then(r => r[0] ?? null);
      if (cat) updateData.categoryId = cat.id;
    }

    // Whitelist only valid product columns
    const ALLOWED_KEYS = new Set([
      'title', 'slug', 'shortDescription', 'description', 'price', 'compareAtPrice',
      'buyingPrice', 'sku', 'stock', 'categoryId', 'badge', 'tags', 'isFeatured',
      'isTrending', 'isNewArrival', 'isBestSeller', 'status', 'features',
      'specifications', 'productType',
    ]);
    for (const key of Object.keys(updateData)) {
      if (!ALLOWED_KEYS.has(key)) delete updateData[key];
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.compareAtPrice !== undefined) updateData.compareAtPrice = updateData.compareAtPrice ? Number(updateData.compareAtPrice) : null;
    const prevProduct = await rdb().select().from(productsTable).where(eq(productsTable.id, id)).limit(1).then(r => r[0] ?? null);

    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const [updated] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();

    // Kafka — emit stock change event when stock field was explicitly updated
    if (updateData.stock !== undefined && prevProduct) {
      const stockEvent: StockChangedEvent = {
        type: 'inventory.stock_changed',
        productId: updated.id,
        productTitle: updated.title,
        sku: updated.sku ?? null,
        previousStock: Number(prevProduct.stock),
        newStock: Number(updated.stock),
        isLow: Number(updated.stock) <= LOW_STOCK_THRESHOLD,
        changedAt: new Date().toISOString(),
      };
      KafkaClient.publish(TOPICS.INVENTORY_EVENTS, stockEvent).catch(() => {});
    }

    if (Array.isArray(images)) {
      await db.delete(productImagesTable).where(eq(productImagesTable.productId, id));
      if (images.length > 0) {
        await db.insert(productImagesTable).values(
          images.map((url: string, idx: number) => ({ productId: id, url, position: idx }))
        );
      }
    }

    return res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    return res.json({ success: true, message: 'Product deleted permanently' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function bulkUpdateProducts(req: AuthRequest, res: Response) {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid updates payload' });
    }

    const results = await db.transaction(async (tx) => {
      return Promise.all(
        updates.map((item: any) =>
          tx.update(productsTable).set({
            ...(item.price !== undefined ? { price: Number(item.price) } : {}),
            ...(item.compareAtPrice !== undefined ? { compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null } : {}),
            ...(item.buyingPrice !== undefined ? { buyingPrice: item.buyingPrice ? Number(item.buyingPrice) : null } : {}),
            ...(item.stock !== undefined ? { stock: Number(item.stock) } : {}),
            ...(item.status !== undefined ? { status: item.status } : {}),
          }).where(eq(productsTable.id, item.id)).returning().then(r => r[0])
        )
      );
    });

    return res.json({ success: true, message: `Successfully updated ${results.length} products`, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
