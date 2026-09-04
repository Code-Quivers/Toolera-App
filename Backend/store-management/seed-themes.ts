import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { themesTable } from './src/app/db/schema.js';
import { THEME_PRESET_SECTIONS, DEFAULT_HOMEPAGE_SECTIONS } from './src/app/modules/theme/themePresets.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const initialThemes = [
  {
    name: "Toolera Original (Brand Default)",
    slug: "original-raifas-mart",
    category: "General",
    badge: "Brand Default Layout",
    description: "Original full modular CMS page layout: Hero Carousel + Category Stories + Trending Now with Urgency Meters + Today's Spotlight + Customer Reviews + Trust Bar + Newsletter.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80",
    demoStoreUrl: "https://demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "FREE" as const,
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
    defaultSections: DEFAULT_HOMEPAGE_SECTIONS,
    position: 0,
  },
  {
    name: "Electronics & Tech Marketplace",
    slug: "electronics-marketplace",
    category: "Electronics",
    badge: "Mega Marketplace",
    description: "Category Sidebar + Meta Quest 3 Hero Banner + Tech Brand Logos + Multi-tab Bestsellers + Limited Offers Countdown + Gaming Section + Tech Articles.",
    thumbnailUrl: "/themes/theme-electronics.png",
    demoStoreUrl: "https://electronics-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "FREE" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.ELECTRONICS_MARKETPLACE,
    position: 1,
  },
  {
    name: "Modern SaaS Tech & Gadgets",
    slug: "modern-tech-gadgets",
    category: "Electronics",
    badge: "Modern Tech Event",
    description: "Apple Shopping Event Hero Bento Grid + Circular Category Avatars + Nothing Phone 1 Spotlight + Full-Width Gradient Promo Banner with Countdown.",
    thumbnailUrl: "/themes/theme-modern-tech.png",
    demoStoreUrl: "https://tech-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "PLAN_REQUIRED" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.MODERN_TECH_GADGETS,
    position: 2,
  },
  {
    name: "Mega Store & Supermarket",
    slug: "supermarket-mega-store",
    category: "Grocery",
    badge: "High-Conversion Multi-Category",
    description: "Samsung Flip6 3-Way Split Hero + Value Props Bar + Urbanears Left Vertical Banner with 2-Row Grid + 3-Card Feature Spotlight.",
    thumbnailUrl: "/themes/theme-supermarket.png",
    demoStoreUrl: "https://grocery-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "FREE" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.SUPERMARKET_MEGA_STORE,
    position: 3,
  },
  {
    name: "Beauty & Cosmetics Boutique",
    slug: "beauty-cosmetics",
    category: "Beauty",
    badge: "Luxury & Skincare",
    description: "Clean aesthetic skincare & cosmetics theme with soft rose/pastel accents, ingredient highlights, and high-conversion product reviews.",
    thumbnailUrl: "/themes/theme-beauty.png",
    demoStoreUrl: "https://beauty-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "PLAN_REQUIRED" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.BEAUTY_COSMETICS,
    position: 4,
  },
  {
    name: "Minimalist Home & Furniture",
    slug: "minimalist-furniture",
    category: "Home & Decor",
    badge: "Nordic Minimalist",
    description: "Elegant Nordic interior decor theme with expansive photography, wood textures, room-by-room collections, and material tags.",
    thumbnailUrl: "/themes/theme-furniture.png",
    demoStoreUrl: "https://furniture-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "FREE" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.MINIMALIST_FURNITURE,
    position: 5,
  },
  {
    name: "Silk & Cotton Fashion Lifestyle",
    slug: "fashion-lifestyle",
    category: "Fashion",
    badge: "Apparel & Lifestyle",
    description: "High-fashion lookbook theme with full-bleed hero video, season collections, size guides, and lookbook taggers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    demoStoreUrl: "https://fashion-demo.toolera.app",
    status: "PUBLISHED" as const,
    accessType: "PLAN_REQUIRED" as const,
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
    defaultSections: THEME_PRESET_SECTIONS.FASHION_LIFESTYLE,
    position: 6,
  },
];

async function seed() {
  console.log('Seeding themes into PostgreSQL...');
  // Create table if not exists
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE "ThemeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "ThemeAccessType" AS ENUM ('FREE', 'PLAN_REQUIRED', 'PAID');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "Theme" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "description" text,
      "badge" text,
      "thumbnailUrl" text NOT NULL DEFAULT '/themes/theme-electronics.png',
      "demoStoreUrl" text,
      "category" text NOT NULL DEFAULT 'General',
      "status" "ThemeStatus" NOT NULL DEFAULT 'DRAFT',
      "accessType" "ThemeAccessType" NOT NULL DEFAULT 'FREE',
      "requiredPlan" text DEFAULT 'free-trial',
      "price" integer NOT NULL DEFAULT 0,
      "defaultConfig" jsonb,
      "defaultSections" jsonb,
      "features" jsonb,
      "isActive" boolean NOT NULL DEFAULT true,
      "position" integer NOT NULL DEFAULT 0,
      "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
      "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
    );
  `);

  for (const theme of initialThemes) {
    await db.insert(themesTable).values({
      ...theme,
      id: `theme_${theme.slug.replace(/-/g, '_')}`,
    } as any).onConflictDoUpdate({
      target: themesTable.slug,
      set: {
        name: theme.name,
        description: theme.description,
        badge: theme.badge,
        thumbnailUrl: theme.thumbnailUrl,
        demoStoreUrl: theme.demoStoreUrl,
        category: theme.category,
        status: theme.status,
        accessType: theme.accessType,
        requiredPlan: theme.requiredPlan,
        price: theme.price,
        features: theme.features,
        defaultConfig: theme.defaultConfig,
        defaultSections: theme.defaultSections,
        position: theme.position,
      },
    });
    console.log(`  ✓ Seeded theme: ${theme.name} (${theme.status})`);
  }
  console.log('Theme seeding complete!');
  await pool.end();
}

seed().catch(err => {
  console.error('Failed to seed themes:', err);
  process.exit(1);
});
