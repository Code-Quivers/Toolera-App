import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export async function getCmsConfig(req: Request, res: Response) {
  try {
    const [theme, header, footer, seo, page] = await Promise.all([
      prisma.themeSettings.findFirst(),
      prisma.headerSettings.findFirst(),
      prisma.footerSettings.findFirst(),
      prisma.seoSettings.findFirst(),
      prisma.page.findUnique({
        where: { slug: 'homepage' },
        include: {
          revisions: {
            where: { isPublished: true },
            orderBy: { version: 'desc' },
            take: 1,
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
        publishedSections: page?.revisions?.[0]?.sectionsSnapshot || [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function saveHomepageSections(req: AuthRequest, res: Response) {
  try {
    const { sections, isPublished = true } = req.body;

    const page = await prisma.page.upsert({
      where: { slug: 'homepage' },
      update: { updatedAt: new Date() },
      create: {
        slug: 'homepage',
        title: 'Home Page',
        isHomepage: true,
      },
    });

    const revisionCount = await prisma.pageRevision.count({ where: { pageId: page.id } });

    const newRev = await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        version: revisionCount + 1,
        title: `Revision ${revisionCount + 1}`,
        sectionsSnapshot: sections,
        isPublished: Boolean(isPublished),
        publishedAt: isPublished ? new Date() : null,
        createdBy: req.user?.name || 'Admin',
      },
    });

    return res.json({ success: true, message: 'Sections saved', revision: newRev });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateThemeSettings(req: AuthRequest, res: Response) {
  try {
    const themeData = req.body;
    const existing = await prisma.themeSettings.findFirst();

    const updated = existing
      ? await prisma.themeSettings.update({ where: { id: existing.id }, data: themeData })
      : await prisma.themeSettings.create({ data: themeData });

    return res.json({ success: true, message: 'Theme updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSeoSettings(req: AuthRequest, res: Response) {
  try {
    const seoData = req.body;
    const existing = await prisma.seoSettings.findFirst();

    const updated = existing
      ? await prisma.seoSettings.update({ where: { id: existing.id }, data: seoData })
      : await prisma.seoSettings.create({ data: seoData });

    return res.json({ success: true, message: 'SEO & Pixels updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}