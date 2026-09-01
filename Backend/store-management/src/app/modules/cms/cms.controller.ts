import { Request, Response } from 'express';
import { eq, desc, count, asc, isNull, and } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import {
  themeSettingsTable, headerSettingsTable, footerSettingsTable,
  seoSettingsTable, pagesTable, pageRevisionsTable, menusTable, menuItemsTable,
  storeMembersTable, storesTable,
} from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { randomUUID } from 'crypto';

// Resolve storeId for the authenticated user, or from ?storeId / ?slug query params,
// or from the request Host header (custom domain support).
async function resolveStoreId(req: AuthRequest): Promise<string | null> {
  // 1. Explicit storeId param
  if (req.query.storeId) return req.query.storeId as string;

  // 2. Store slug param (storefront public reads)
  if (req.query.slug) {
    const store = await rdb()
      .select({ id: storesTable.id })
      .from(storesTable)
      .where(eq(storesTable.slug, req.query.slug as string))
      .limit(1)
      .then(r => r[0] ?? null);
    if (store) return store.id;
  }

  // 3. Custom domain — resolve by Host header (seller's own domain)
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;
  const domain = host.split(':')[0]; // strip port
  if (domain && !domain.includes('localhost') && !domain.includes('127.0.0.1')) {
    const byDomain = await rdb()
      .select({ id: storesTable.id })
      .from(storesTable)
      .where(eq(storesTable.customDomain, domain))
      .limit(1)
      .then(r => r[0] ?? null);
    if (byDomain) return byDomain.id;
  }

  // 4. Authenticated admin — look up user's active store membership
  if (req.user?.id) {
    const member = await rdb()
      .select({ storeId: storeMembersTable.storeId })
      .from(storeMembersTable)
      .where(and(eq(storeMembersTable.userId, req.user.id), eq(storeMembersTable.status, 'ACTIVE')))
      .limit(1)
      .then(r => r[0] ?? null);
    return member?.storeId ?? null;
  }
  return null;
}

export async function getCmsConfig(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) {
      return res.json({ success: true, data: { theme: null, header: null, footer: null, seo: null, publishedSections: [] } });
    }

    const [theme, header, footer, seo, page] = await Promise.all([
      rdb().select().from(themeSettingsTable).where(eq(themeSettingsTable.storeId, storeId)).limit(1).then(r => r[0] ?? null),
      rdb().select().from(headerSettingsTable).where(eq(headerSettingsTable.storeId, storeId)).limit(1).then(r => r[0] ?? null),
      rdb().select().from(footerSettingsTable).where(eq(footerSettingsTable.storeId, storeId)).limit(1).then(r => r[0] ?? null),
      rdb().select().from(seoSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().query.pagesTable.findFirst({
        where: and(eq(pagesTable.slug, `homepage-${storeId}`), eq(pagesTable.storeId, storeId)),
        with: {
          revisions: {
            where: eq(pageRevisionsTable.isPublished, true),
            orderBy: desc(pageRevisionsTable.version),
            limit: 1,
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        theme,
        // links/columns store the full UI settings JSON blob
        header: (header as any)?.links ?? header,
        footer: (footer as any)?.columns ?? footer,
        seo: seo || {
          defaultTitle: "Toolera — Discover What's Trending",
          defaultDescription: "Discover what's trending in Bangladesh.",
          metaPixelId: null,
          tiktokPixelId: null,
          ga4MeasurementId: null,
        },
        publishedSections: (page as any)?.revisions?.[0]?.sectionsSnapshot || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function saveHomepageSections(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(403).json({ success: false, message: 'Store not found for this user.' });

    const { sections, isPublished = true } = req.body;

    const [page] = await db
      .insert(pagesTable)
      .values({ slug: `homepage-${storeId}`, title: 'Home Page', isHomepage: true, storeId })
      .onConflictDoUpdate({ target: pagesTable.slug, set: { updatedAt: new Date() } })
      .returning();

    const countResult = await rdb()
      .select({ count: count() })
      .from(pageRevisionsTable)
      .where(eq(pageRevisionsTable.pageId, page.id));
    const revisionCount = Number(countResult[0].count);

    const [newRev] = await db.insert(pageRevisionsTable).values({
      pageId: page.id,
      version: revisionCount + 1,
      title: `Revision ${revisionCount + 1}`,
      sectionsSnapshot: sections,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user?.name || 'Admin',
    }).returning();

    return res.json({ success: true, message: 'Sections saved', revision: newRev });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateThemeSettings(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(403).json({ success: false, message: 'Store not found for this user.' });

    const themeData = { ...req.body, storeId };
    // Remove id if present to avoid conflicts
    delete themeData.id;

    const existing = await rdb()
      .select({ id: themeSettingsTable.id })
      .from(themeSettingsTable)
      .where(eq(themeSettingsTable.storeId, storeId))
      .limit(1)
      .then(r => r[0] ?? null);

    const updated = existing
      ? (await db.update(themeSettingsTable).set(themeData).where(eq(themeSettingsTable.id, existing.id)).returning())[0]
      : (await db.insert(themeSettingsTable).values(themeData).returning())[0];

    return res.json({ success: true, message: 'Theme updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSeoSettings(req: AuthRequest, res: Response) {
  try {
    const seoData = req.body;
    const existing = await rdb().select({ id: seoSettingsTable.id }).from(seoSettingsTable).limit(1).then(r => r[0] ?? null);

    const updated = existing
      ? (await db.update(seoSettingsTable).set(seoData).where(eq(seoSettingsTable.id, existing.id)).returning())[0]
      : (await db.insert(seoSettingsTable).values(seoData).returning())[0];

    return res.json({ success: true, message: 'SEO & Pixels updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Header ─────────────────────────────────────────────────────────────────

export async function getHeader(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.json({ success: true, data: null });
    const header = await rdb().select().from(headerSettingsTable).where(eq(headerSettingsTable.storeId, storeId)).limit(1).then(r => r[0] ?? null);
    // Return the full settings blob stored in links, falling back to the row itself
    return res.json({ success: true, data: (header as any)?.links ?? header });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateHeader(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(403).json({ success: false, message: 'Store not found for this user.' });

    // Store the full UI settings JSON blob in the links JSONB column
    const data = { storeId, links: req.body };

    const existing = await rdb()
      .select({ id: headerSettingsTable.id })
      .from(headerSettingsTable)
      .where(eq(headerSettingsTable.storeId, storeId))
      .limit(1)
      .then(r => r[0] ?? null);

    const updated = existing
      ? (await db.update(headerSettingsTable).set(data).where(eq(headerSettingsTable.id, existing.id)).returning())[0]
      : (await db.insert(headerSettingsTable).values(data).returning())[0];
    return res.json({ success: true, data: (updated as any)?.links ?? updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Footer ─────────────────────────────────────────────────────────────────

export async function getFooter(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.json({ success: true, data: null });
    const footer = await rdb().select().from(footerSettingsTable).where(eq(footerSettingsTable.storeId, storeId)).limit(1).then(r => r[0] ?? null);
    // Return the full settings blob stored in columns, falling back to the row itself
    return res.json({ success: true, data: (footer as any)?.columns ?? footer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateFooter(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    if (!storeId) return res.status(403).json({ success: false, message: 'Store not found for this user.' });

    // Store the full UI settings JSON blob in the columns JSONB column
    const data = { storeId, columns: req.body };

    const existing = await rdb()
      .select({ id: footerSettingsTable.id })
      .from(footerSettingsTable)
      .where(eq(footerSettingsTable.storeId, storeId))
      .limit(1)
      .then(r => r[0] ?? null);

    const updated = existing
      ? (await db.update(footerSettingsTable).set(data).where(eq(footerSettingsTable.id, existing.id)).returning())[0]
      : (await db.insert(footerSettingsTable).values(data).returning())[0];
    return res.json({ success: true, data: (updated as any)?.columns ?? updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Menus ──────────────────────────────────────────────────────────────────

export async function getMenus(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    const menus = await rdb().query.menusTable.findMany({
      where: and(isNull(menusTable.deletedAt), storeId ? eq(menusTable.storeId, storeId) : undefined),
      with: { items: { orderBy: asc(menuItemsTable.position) } },
    });
    return res.json({ success: true, data: menus });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateMenus(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    const menus: any[] = Array.isArray(req.body) ? req.body : [req.body];
    for (const menu of menus) {
      const { id, name, location, settings, items = [] } = menu;
      let menuId = id || randomUUID();
      const existing = menuId
        ? await rdb().select({ id: menusTable.id }).from(menusTable).where(eq(menusTable.id, menuId)).limit(1).then(r => r[0] ?? null)
        : null;
      if (existing) {
        await db.update(menusTable).set({ name, location: location || 'HEADER', settings: settings ?? null }).where(eq(menusTable.id, menuId));
      } else {
        await db.insert(menusTable).values({ id: menuId, name, location: location || 'HEADER', settings: settings ?? null, storeId: storeId || undefined });
      }
      await db.delete(menuItemsTable).where(eq(menuItemsTable.menuId, menuId));
      if (items.length > 0) {
        await db.insert(menuItemsTable).values(
          items.map((item: any, idx: number) => ({
            id: item.id || randomUUID(),
            menuId,
            title: item.title || item.label || '',
            url: item.url || '#',
            type: item.type || 'CUSTOM',
            position: item.position ?? idx,
            parentId: item.parentId || null,
            isExternal: item.isExternal || item.targetBlank || false,
          }))
        );
      }
    }
    const updated = await rdb().query.menusTable.findMany({
      where: and(isNull(menusTable.deletedAt), storeId ? eq(menusTable.storeId, storeId) : undefined),
      with: { items: { orderBy: asc(menuItemsTable.position) } },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Pages ──────────────────────────────────────────────────────────────────

export async function getPage(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    const param = String(req.params.slug);
    // Lookup by slug first, fall back to id
    const page = await rdb()
      .select()
      .from(pagesTable)
      .where(and(
        isNull(pagesTable.deletedAt),
        eq(pagesTable.slug, param),
        storeId ? eq(pagesTable.storeId, storeId) : undefined,
      ))
      .limit(1)
      .then(r => r[0] ?? null);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getPages(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    const pages = await rdb()
      .select()
      .from(pagesTable)
      .where(and(isNull(pagesTable.deletedAt), storeId ? eq(pagesTable.storeId, storeId) : undefined))
      .orderBy(asc(pagesTable.title));
    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPage(req: AuthRequest, res: Response) {
  try {
    const storeId = await resolveStoreId(req);
    const { title, slug, status = 'DRAFT' } = req.body;
    if (!title || !slug) return res.status(400).json({ success: false, message: 'title and slug required' });
    const [page] = await db.insert(pagesTable).values({ title, slug, status: status as any, storeId: storeId || undefined }).returning();
    return res.status(201).json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updatePage(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { title, slug, status } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (status !== undefined) updates.status = status;
    const [updated] = await db.update(pagesTable).set(updates).where(eq(pagesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ success: false, message: 'Page not found' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deletePage(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await db.update(pagesTable).set({ deletedAt: new Date() }).where(eq(pagesTable.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
