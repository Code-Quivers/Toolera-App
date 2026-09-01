import { Request, Response } from 'express';
import { eq, asc, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { attributesTable, attributeValuesTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { randomUUID } from 'crypto';

export async function getAttributes(_req: Request, res: Response) {
  try {
    const attributes = await db.query.attributesTable.findMany({
      where: (t, { eq: _eq }) => _eq(t.isActive, true),
      with: { values: { orderBy: asc(attributeValuesTable.position) } },
      orderBy: asc(attributesTable.position),
    });
    return res.json({ success: true, data: attributes });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createAttribute(req: AuthRequest, res: Response) {
  try {
    const { name, slug, type = 'SELECT', position = 0 } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug required' });

    const [created] = await db.insert(attributesTable).values({
      id: randomUUID(), name, slug, type, position, isActive: true,
    }).returning();
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateAttribute(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, slug, type, position, isActive } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (type !== undefined) updates.type = type;
    if (position !== undefined) updates.position = position;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db.update(attributesTable).set(updates).where(eq(attributesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ success: false, message: 'Attribute not found' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteAttribute(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await db.delete(attributesTable).where(eq(attributesTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Attribute Values ───────────────────────────────────────────────────────

export async function createAttributeValue(req: AuthRequest, res: Response) {
  try {
    const { attributeId } = req.params;
    const { name, slug, colorHex, imageUrl, position = 0 } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug required' });

    const [created] = await db.insert(attributeValuesTable).values({
      id: randomUUID(), attributeId, name, slug, colorHex, imageUrl, position, isActive: true,
    }).returning();
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateAttributeValue(req: AuthRequest, res: Response) {
  try {
    const { valueId } = req.params;
    const updates: any = {};
    const { name, slug, colorHex, imageUrl, position, isActive } = req.body;
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (colorHex !== undefined) updates.colorHex = colorHex;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (position !== undefined) updates.position = position;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db.update(attributeValuesTable).set(updates).where(eq(attributeValuesTable.id, valueId)).returning();
    if (!updated) return res.status(404).json({ success: false, message: 'Value not found' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteAttributeValue(req: AuthRequest, res: Response) {
  try {
    const { valueId } = req.params;
    await db.delete(attributeValuesTable).where(eq(attributeValuesTable.id, valueId));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
