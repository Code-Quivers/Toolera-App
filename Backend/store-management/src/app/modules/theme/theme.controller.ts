import { Request, Response } from 'express';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, rdb } from '../../db/index.js';
import {
  themesTable,
  storesTable,
  themeSettingsTable,
  pagesTable,
  pageRevisionsTable,
  storeMembersTable,
} from '../../db/schema.js';

const createThemeSchema = z.object({
  name: z.string().min(2, 'Theme name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  thumbnailUrl: z.string().default('/themes/theme-electronics.png'),
  demoStoreUrl: z.string().optional().nullable(),
  category: z.string().default('General'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  accessType: z.enum(['FREE', 'PLAN_REQUIRED', 'PAID']).default('FREE'),
  requiredPlan: z.string().default('free-trial'),
  price: z.number().default(0),
  defaultConfig: z.record(z.any()).optional().nullable(),
  defaultSections: z.array(z.any()).optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
  position: z.number().default(0),
});

const updateThemeSchema = createThemeSchema.partial();

const applyThemeSchema = z.object({
  themeId: z.string().min(1, 'themeId is required'),
});

const BUILTIN_THEMES = [
  {
    id: "theme_original_raifas_mart",
    name: "Toolera Original (Brand Default)",
    slug: "original-raifas-mart",
    category: "General",
    badge: "Brand Default Layout",
    description: "Original full modular CMS page layout: Hero Carousel + Category Stories + Trending Now with Urgency Meters + Today's Spotlight + Customer Reviews + Trust Bar + Newsletter.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80",
    demoStoreUrl: "https://demo.toolera.app",
    status: "PUBLISHED",
    accessType: "FREE",
    requiredPlan: "free-trial",
    price: 0,
    features: [
      "Hero carousel with promo banners",
      "Trending Now section with stock urgency meters",
      "Today's Find product spotlight with live specs drawer",
      "Customer reviews carousel + 4-point trust badges",
    ],
    defaultConfig: {
      homepageLayout: "ORIGINAL_RAIFAS_MART",
      primary: "#059669",
      accent: "#F9A01B",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      radius: "1rem",
    },
    position: 0,
    isActive: true,
  },
  {
    id: "theme_electronics_marketplace",
    name: "Electronics & Tech Marketplace",
    slug: "electronics-marketplace",
    category: "Electronics",
    badge: "Mega Marketplace",
    description: "Category Sidebar + Meta Quest 3 Hero Banner + Tech Brand Logos + Multi-tab Bestsellers + Limited Offers Countdown + Gaming Section + Tech Articles.",
    thumbnailUrl: "/themes/theme-electronics.png",
    demoStoreUrl: "https://electronics-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "FREE",
    requiredPlan: "free-trial",
    price: 0,
    features: [
      "Left category sidebar + central hero banner + deal timer card",
      "Brand logos strip (Acer, Samsung, Apple, Asus, Bose)",
      "Bestsellers in Category multi-tab product grid",
      "AirPods Pro limited offer split banner with real-time countdown",
    ],
    defaultConfig: {
      homepageLayout: "ELECTRONICS_MARKETPLACE",
      primary: "#2563EB",
      accent: "#F59E0B",
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "Inter, sans-serif",
      radius: "1rem",
    },
    position: 1,
    isActive: true,
  },
  {
    id: "theme_modern_tech_gadgets",
    name: "Modern SaaS Tech & Gadgets",
    slug: "modern-tech-gadgets",
    category: "Electronics",
    badge: "Modern Tech Event",
    description: "Apple Shopping Event Hero Bento Grid + Circular Category Avatars + Nothing Phone 1 Spotlight + Full-Width Gradient Promo Banner with Countdown.",
    thumbnailUrl: "/themes/theme-modern-tech.png",
    demoStoreUrl: "https://tech-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "PLAN_REQUIRED",
    requiredPlan: "pro",
    price: 0,
    features: [
      "Apple event hero bento grid with Aurora headset flash deal",
      "Circular category avatars with item counts",
      "Nothing Phone (2) exclusive spotlight section",
      "Full-width gradient event banner with live countdown timer",
    ],
    defaultConfig: {
      homepageLayout: "MODERN_TECH_GADGETS",
      primary: "#4F46E5",
      accent: "#06B6D4",
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'DM Sans', sans-serif",
      radius: "1.5rem",
    },
    position: 2,
    isActive: true,
  },
  {
    id: "theme_supermarket_mega_store",
    name: "Mega Store & Supermarket",
    slug: "supermarket-mega-store",
    category: "Grocery",
    badge: "High-Conversion Multi-Category",
    description: "Samsung Flip6 3-Way Split Hero + Value Props Bar + Urbanears Left Vertical Banner with 2-Row Grid + 3-Card Feature Spotlight.",
    thumbnailUrl: "/themes/theme-supermarket.png",
    demoStoreUrl: "https://grocery-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "FREE",
    requiredPlan: "free-trial",
    price: 0,
    features: [
      "3-column split hero banner (Samsung Galaxy Z Flip6 + Daily Deals)",
      "Horizontal 4-card value proposition strip",
      "Urbanears side-by-side vertical banner with 6-product grid",
      "3-card multi-category feature spotlight",
    ],
    defaultConfig: {
      homepageLayout: "SUPERMARKET_MEGA_STORE",
      primary: "#0284C7",
      accent: "#E11D48",
      headingFont: "Inter, sans-serif",
      bodyFont: "Inter, sans-serif",
      radius: "0.75rem",
    },
    position: 3,
    isActive: true,
  },
  {
    id: "theme_beauty_cosmetics",
    name: "Beauty & Cosmetics Boutique",
    slug: "beauty-cosmetics",
    category: "Beauty",
    badge: "Luxury & Skincare",
    description: "Clean aesthetic skincare & cosmetics theme with soft rose/pastel accents, ingredient highlights, and high-conversion product reviews.",
    thumbnailUrl: "/themes/theme-beauty.png",
    demoStoreUrl: "https://beauty-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "PLAN_REQUIRED",
    requiredPlan: "pro",
    price: 0,
    features: [
      "Soft editorial hero banner with clean aesthetic typography",
      "Skin routine step-by-step product selector",
      "Dermatologist approved trust badges",
      "Before & After customer photo testimonials",
    ],
    defaultConfig: {
      homepageLayout: "BEAUTY_COSMETICS",
      primary: "#BE185D",
      accent: "#F472B6",
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      radius: "1.5rem",
    },
    position: 4,
    isActive: true,
  },
  {
    id: "theme_minimalist_furniture",
    name: "Minimalist Home & Furniture",
    slug: "minimalist-furniture",
    category: "Home & Decor",
    badge: "Nordic Minimalist",
    description: "Elegant Nordic interior decor theme with expansive photography, wood textures, room-by-room collections, and material tags.",
    thumbnailUrl: "/themes/theme-furniture.png",
    demoStoreUrl: "https://furniture-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "FREE",
    requiredPlan: "free-trial",
    price: 0,
    features: [
      "Full-bleed lifestyle hero with 'Shop the Room' hot-spots",
      "Room category cards (Living, Bedroom, Office, Dining)",
      "Craftsmanship and sustainable wood trust pillars",
      "Architect & interior designer featured reviews",
    ],
    defaultConfig: {
      homepageLayout: "MINIMALIST_FURNITURE",
      primary: "#78350F",
      accent: "#D97706",
      headingFont: "'DM Sans', sans-serif",
      bodyFont: "'DM Sans', sans-serif",
      radius: "0.5rem",
    },
    position: 5,
    isActive: true,
  },
  {
    id: "theme_fashion_lifestyle",
    name: "Silk & Cotton Fashion Lifestyle",
    slug: "fashion-lifestyle",
    category: "Fashion",
    badge: "Apparel & Lifestyle",
    description: "High-fashion lookbook theme with full-bleed hero video, season collections, size guides, and lookbook taggers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    demoStoreUrl: "https://fashion-demo.toolera.app",
    status: "PUBLISHED",
    accessType: "PLAN_REQUIRED",
    requiredPlan: "pro",
    price: 0,
    features: [
      "High-fashion seasonal lookbook hero layout",
      "Gender and occasion collection switcher",
      "Fabric care and size fit guarantee banners",
      "Instagram community lookbook integration",
    ],
    defaultConfig: {
      homepageLayout: "FASHION_LIFESTYLE",
      primary: "#18181B",
      accent: "#E11D48",
      headingFont: "'Montserrat', sans-serif",
      bodyFont: "Inter, sans-serif",
      radius: "0.25rem",
    },
    position: 6,
    isActive: true,
  },
];

export const themeController = {
  /**
   * Public / Seller API: Fetch only PUBLISHED themes
   * GET /api/v1/themes
   */
  async getPublishedThemes(req: Request, res: Response) {
    try {
      const themes = await rdb()
        .select()
        .from(themesTable)
        .where(and(eq(themesTable.status, 'PUBLISHED'), eq(themesTable.isActive, true)))
        .orderBy(themesTable.position);

      if (themes && themes.length > 0) {
        return res.json({ success: true, data: themes });
      }
      return res.json({ success: true, data: BUILTIN_THEMES.filter(t => t.status === 'PUBLISHED') });
    } catch (error: any) {
      return res.json({ success: true, data: BUILTIN_THEMES.filter(t => t.status === 'PUBLISHED') });
    }
  },

  /**
   * Super Admin API: Fetch ALL themes (including DRAFT and ARCHIVED)
   * GET /api/v1/admin/themes
   */
  async getAllThemes(req: Request, res: Response) {
    try {
      const themes = await rdb()
        .select()
        .from(themesTable)
        .orderBy(themesTable.position, desc(themesTable.createdAt));

      return res.json({ success: true, data: themes });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Super Admin API: Get single theme details
   * GET /api/v1/admin/themes/:id
   */
  async getThemeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const theme = await rdb()
        .select()
        .from(themesTable)
        .where(eq(themesTable.id, id))
        .limit(1)
        .then(r => r[0] ?? null);

      if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });
      return res.json({ success: true, data: theme });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Super Admin API: Create a new theme (default DRAFT)
   * POST /api/v1/admin/themes
   */
  async createTheme(req: Request, res: Response) {
    try {
      const data = createThemeSchema.parse(req.body);

      const existing = await rdb()
        .select({ id: themesTable.id })
        .from(themesTable)
        .where(eq(themesTable.slug, data.slug.toLowerCase()))
        .limit(1)
        .then(r => r[0] ?? null);

      if (existing) {
        return res.status(400).json({ success: false, message: 'Theme slug already exists' });
      }

      const [theme] = await db
        .insert(themesTable)
        .values({
          ...data,
          slug: data.slug.toLowerCase(),
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: `Theme "${theme.name}" created successfully as ${theme.status}!`,
        data: theme,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Super Admin API: Update theme settings or toggle DRAFT <-> PUBLISHED
   * PATCH /api/v1/admin/themes/:id
   */
  async updateTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateThemeSchema.parse(req.body);

      const [updated] = await db
        .update(themesTable)
        .set(data as any)
        .where(eq(themesTable.id, id))
        .returning();

      if (!updated) return res.status(404).json({ success: false, message: 'Theme not found' });

      return res.json({
        success: true,
        message: `Theme "${updated.name}" updated successfully!`,
        data: updated,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Super Admin API: Delete / Archive a theme
   * DELETE /api/v1/admin/themes/:id
   */
  async deleteTheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.delete(themesTable).where(eq(themesTable.id, id));
      return res.json({ success: true, message: 'Theme deleted successfully.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Seller API: Apply a published theme to the seller's active store
   * POST /api/v1/stores/me/theme/apply
   */
  async applyThemeToStore(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { themeId } = applyThemeSchema.parse(req.body);

      // Find theme (must be published)
      const theme = await rdb()
        .select()
        .from(themesTable)
        .where(and(eq(themesTable.id, themeId), eq(themesTable.status, 'PUBLISHED')))
        .limit(1)
        .then(r => r[0] ?? null);

      if (!theme) return res.status(404).json({ success: false, message: 'Published theme not found.' });

      // Find user's store
      let membership = await rdb()
        .select({ storeId: storeMembersTable.storeId })
        .from(storeMembersTable)
        .where(and(eq(storeMembersTable.userId, userId), eq(storeMembersTable.status, 'ACTIVE')))
        .limit(1)
        .then(r => r[0] ?? null);

      let storeId = membership?.storeId;
      if (!storeId) {
        const owned = await rdb()
          .select({ id: storesTable.id })
          .from(storesTable)
          .where(and(eq(storesTable.ownerId, userId), isNull(storesTable.deletedAt)))
          .limit(1)
          .then(r => r[0] ?? null);
        if (owned) storeId = owned.id;
      }

      if (!storeId) return res.status(404).json({ success: false, message: 'Store not found.' });

      const config: any = theme.defaultConfig || {};

      // 1. Update ThemeSettings for this store
      await db
        .insert(themeSettingsTable)
        .values({
          storeId,
          homepageLayout: config.homepageLayout || theme.slug.toUpperCase().replace(/-/g, '_'),
          primary: config.primary || '#008B47',
          accent: config.accent || '#F9A01B',
          primaryButtonText: config.primaryButtonText || '#FFFFFF',
          accentButtonText: config.accentButtonText || '#0F172A',
          background: config.background || '#F8FAFC',
          surface: config.surface || '#FFFFFF',
          text: config.text || '#0F172A',
          muted: config.muted || '#64748B',
          border: config.border || '#E2E8F0',
          headingFont: config.headingFont || 'Inter, sans-serif',
          bodyFont: config.bodyFont || 'Inter, sans-serif',
          radius: config.radius || '1rem',
          shadow: config.shadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          containerWidth: config.containerWidth || '1280px',
          sectionSpacing: config.sectionSpacing || '4rem',
        })
        .onConflictDoUpdate({
          target: themeSettingsTable.storeId,
          set: {
            homepageLayout: config.homepageLayout || theme.slug.toUpperCase().replace(/-/g, '_'),
            primary: config.primary || '#008B47',
            accent: config.accent || '#F9A01B',
            primaryButtonText: config.primaryButtonText || '#FFFFFF',
            accentButtonText: config.accentButtonText || '#0F172A',
            background: config.background || '#F8FAFC',
            surface: config.surface || '#FFFFFF',
            text: config.text || '#0F172A',
            muted: config.muted || '#64748B',
            border: config.border || '#E2E8F0',
            headingFont: config.headingFont || 'Inter, sans-serif',
            bodyFont: config.bodyFont || 'Inter, sans-serif',
            radius: config.radius || '1rem',
            shadow: config.shadow || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            containerWidth: config.containerWidth || '1280px',
            sectionSpacing: config.sectionSpacing || '4rem',
          },
        });

      // 2. If theme provides defaultSections, update store's Homepage PageRevision
      if (theme.defaultSections && Array.isArray(theme.defaultSections) && theme.defaultSections.length > 0) {
        const homepage = await rdb()
          .select({ id: pagesTable.id })
          .from(pagesTable)
          .where(and(eq(pagesTable.storeId, storeId), eq(pagesTable.isHomepage, true), isNull(pagesTable.deletedAt)))
          .limit(1)
          .then(r => r[0] ?? null);

        if (homepage) {
          const [revision] = await db
            .insert(pageRevisionsTable)
            .values({
              pageId: homepage.id,
              version: Date.now(),
              title: `Switched to ${theme.name} Theme`,
              sectionsSnapshot: theme.defaultSections,
              isPublished: true,
              publishedAt: new Date(),
              createdBy: userId,
              notes: `Applied theme preset: ${theme.name}`,
            })
            .returning();

          await db
            .update(pagesTable)
            .set({ currentRevisionId: revision.id })
            .where(eq(pagesTable.id, homepage.id));
        }
      }

      return res.json({
        success: true,
        message: `Theme "${theme.name}" applied to your store successfully!`,
        data: { theme },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
