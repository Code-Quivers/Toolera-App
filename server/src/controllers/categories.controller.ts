import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { position: 'asc' },
    });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, slug, image, description, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const finalSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        image: image || null,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name, slug, image, description, parentId } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: slug?.trim(),
        image: image || null,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return res.json({ success: true, message: 'Category updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}