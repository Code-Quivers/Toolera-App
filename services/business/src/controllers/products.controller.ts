import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search, badge, sort, limit = 50, page = 1 } = req.query;

    const where: any = {
      deletedAt: null,
    };

    if (category && category !== 'all') {
      where.category = { slug: String(category) };
    }

    if (badge) {
      where.badge = String(badge);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'popular' || sort === 'rating') orderBy = { calculatedRating: 'desc' };

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { position: 'asc' } },
          variants: true,
          productAttributes: {
            include: {
              values: true,
              attribute: true,
            },
          },
          productVariations: {
            include: {
              attributes: true,
            },
          },
        },
        orderBy,
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const target = String(req.params.slug);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: target }, { id: target }],
        deletedAt: null,
      },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
        productAttributes: {
          include: {
            values: true,
            attribute: true,
          },
        },
        productVariations: {
          include: {
            attributes: true,
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        deletedAt: null,
      },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
      take: 8,
    });

    return res.json({
      success: true,
      data: product,
      relatedProducts,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const {
      title,
      slug,
      categoryId,
      price,
      compareAtPrice,
      sku,
      stock,
      shortDescription,
      description,
      badge,
      tags = [],
      isFeatured = false,
      isTrending = false,
      isNewArrival = false,
      isBestSeller = false,
      productType = 'SIMPLE',
      images = [],
      variants = [],
      attributes = [],
    } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title and price are required.' });
    }

    const generatedSlug = (slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalSku = sku || `SKU-${Date.now()}`;

    // Ensure valid categoryId
    let catId = categoryId;
    if (!catId) {
      const firstCat = await prisma.category.findFirst();
      catId = firstCat?.id;
    }

    const created = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: generatedSlug,
        categoryId: catId,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
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
        productType,
        images: {
          create: images.map((url: string, idx: number) => ({
            url,
            position: idx,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const updateData = { ...req.body };

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const images = updateData.images;
    delete updateData.images;
    delete updateData.variants;
    delete updateData.productAttributes;
    delete updateData.productVariations;

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.compareAtPrice !== undefined) {
      updateData.compareAtPrice = updateData.compareAtPrice ? Number(updateData.compareAtPrice) : null;
    }
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Update images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: images[i],
            position: i,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product deleted permanently' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Bulk Update Products (Price, Compare Price, Buying Cost, Stock, Status)
 * PUT /api/v1/products/bulk
 */
export async function bulkUpdateProducts(req: AuthRequest, res: Response) {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid updates payload' });
    }

    const results = await prisma.$transaction(
      updates.map((item: any) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            ...(item.price !== undefined ? { price: Number(item.price) } : {}),
            ...(item.compareAtPrice !== undefined ? { compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null } : {}),
            ...(item.buyingPrice !== undefined ? { buyingPrice: item.buyingPrice ? Number(item.buyingPrice) : null } : {}),
            ...(item.stock !== undefined ? { stock: Number(item.stock) } : {}),
            ...(item.status !== undefined ? { status: item.status } : {}),
          },
        })
      )
    );

    return res.json({ success: true, message: `Successfully updated ${results.length} products`, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}