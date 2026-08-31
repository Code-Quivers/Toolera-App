import { Request, Response } from 'express';
import { eq, desc, count } from 'drizzle-orm';
import { db, rdb } from '../db/index.js';
import {
  themeSettingsTable, headerSettingsTable, footerSettingsTable,
  seoSettingsTable, pagesTable, pageRevisionsTable,
} from '../db/schema.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getCmsConfig(req: Request, res: Response) {
  try {
    const [theme, header, footer, seo, page] = await Promise.all([
      rdb().select().from(themeSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(headerSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(footerSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().select().from(seoSettingsTable).limit(1).then(r => r[0] ?? null),
      rdb().query.pagesTable.findFirst({
        where: eq(pagesTable.slug, 'homepage'),
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
        header,
        footer,
        seo: seo || {
          defaultTitle: "Raifa's Mart — Discover What's Trending",
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
    const { sections, isPublished = true } = req.body;

    const [page] = await db
      .insert(pagesTable)
      .values({ slug: 'homepage', title: 'Home Page', isHomepage: true })
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
    const themeData = req.body;
    const existing = await rdb().select({ id: themeSettingsTable.id }).from(themeSettingsTable).limit(1).then(r => r[0] ?? null);

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
