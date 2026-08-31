import { z } from "zod";
import { SectionDefinition } from "./types";

// 1. Hero Slider Schema
export const HeroSlideItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string(),
  buttonLink: z.string(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  image: z.string(),
  badge: z.string().optional(),
  themeColor: z.string().optional(),
  active: z.boolean().default(true),
});

export const HeroSliderSettingsSchema = z.object({
  autoplay: z.boolean().default(true),
  interval: z.number().default(5000),
  boxed: z.boolean().default(true),
  slides: z.array(HeroSlideItemSchema),
});

// 2. Category Carousel Schema
export const CategoryCarouselSettingsSchema = z.object({
  title: z.string().default("Shop by Categories"),
  tagline: z.string().default("Curated Collections"),
  limit: z.number().default(8),
  showCount: z.boolean().default(true),
});

// 3. Product Carousel & Grid Schemas
export const ProductCarouselSettingsSchema = z.object({
  title: z.string().default("Trending Now"),
  subtitle: z.string().default("The products everyone's discovering right now in Bangladesh."),
  layout: z.enum(["carousel", "grid"]).default("carousel"),
  category: z.string().default("all"),
  source: z.enum(["trending", "best-sellers", "new-arrivals", "sale", "all"]).default("trending"),
  limit: z.number().default(8),
  columnsCount: z.number().default(4),
  showUrgencyBar: z.boolean().default(true),
  showRating: z.boolean().default(true),
  showQuickAdd: z.boolean().default(true),
});

export const ProductGridSettingsSchema = z.object({
  title: z.string().default("Featured Collection"),
  subtitle: z.string().default("Handpicked quality finds"),
  layout: z.enum(["carousel", "grid"]).default("grid"),
  category: z.string().default("all"),
  source: z.enum(["trending", "best-sellers", "new-arrivals", "sale", "all"]).default("all"),
  limit: z.number().default(8),
  columnsCount: z.number().default(4),
  showRating: z.boolean().default(true),
  showBadge: z.boolean().default(true),
});

// 4. Product Spotlight Schema
export const SpotlightSettingsSchema = z.object({
  badgeText: z.string().default("TODAY'S FIND"),
  productId: z.string().default("prod-1"),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
  showSpecs: z.boolean().default(true),
});

// 5. Customer Reviews Schema
export const ReviewsSettingsSchema = z.object({
  title: z.string().default("Loved by Our Customers"),
  subtitle: z.string().default("Real experiences from verified shoppers across Bangladesh."),
  limit: z.number().default(4),
});

// 6. Trust Pillars Schema
export const TrustPillarItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  iconName: z.string(),
});

export const TrustSettingsSchema = z.object({
  title: z.string().default("Why Shop With Toolera?"),
  subtitle: z.string().default("We are built on trust, genuine curation, and reliable local support."),
  pillars: z.array(TrustPillarItemSchema),
});

// 7. Newsletter Schema
export const NewsletterSettingsSchema = z.object({
  tagline: z.string().default("Stay in the Loop"),
  title: z.string().default("Get the Good Stuff First."),
  description: z.string().default("Be the first to discover new trending finds, viral gadgets, and flash deals before they sell out."),
  buttonText: z.string().default("Subscribe"),
});

// 8. Promo Banner Schema
export const PromoBannerSettingsSchema = z.object({
  headline: z.string().default("Flash Deal — 40% Off China Direct Import"),
  subtext: z.string().default("Limited stock available. Free delivery on orders over ৳2,000."),
  buttonText: z.string().default("Claim Deal"),
  buttonLink: z.string().default("/shop?filter=trending"),
  imageUrl: z.string().default("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=300&q=80"),
  height: z.number().default(220),
});

// 9. Rich Text & FAQ Schemas
export const RichTextSettingsSchema = z.object({
  heading: z.string().default("About Our Curated Collection"),
  content: z.string().default("We test and hand-select China trending gadgets and home essentials before bringing them to Bangladesh."),
  alignment: z.enum(["left", "center"]).default("center"),
});

export const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const FaqSettingsSchema = z.object({
  title: z.string().default("Frequently Asked Questions"),
  items: z.array(FaqItemSchema),
});

// 10. Countdown Banner Schema
export const CountdownSettingsSchema = z.object({
  title: z.string().default("Midnight Flash Deals End Soon!"),
  targetHours: z.number().default(12),
  couponCode: z.string().default("TRENDY40"),
  discountText: z.string().default("Get 40% OFF with code"),
  linkUrl: z.string().default("/shop?filter=trending"),
});

// SECTION REGISTRY MAP
export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  "hero-slider": {
    type: "hero-slider",
    name: "Hero Banner Slider",
    category: "FEATURED",
    description: "1600x514px boxed editorial banner slider with arrows and promo badges.",
    iconName: "Sliders",
    schema: HeroSliderSettingsSchema,
    defaultSettings: {
      autoplay: true,
      interval: 5000,
      boxed: true,
      slides: [
        {
          id: "slide-1",
          title: "INNOVATIVE GADGETS",
          subtitle: "DIRECT FROM CHINA",
          tagline: "Discover What's Trending",
          description: "Curated smart electronics, viral mini tech, and aesthetic workspace upgrades for everyday life in Bangladesh.",
          buttonText: "Shop Trending Deals",
          buttonLink: "/shop?filter=trending",
          secondaryButtonText: "Explore New Arrivals",
          secondaryButtonLink: "/shop?filter=new-arrivals",
          image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=514&q=85",
          badge: "🔥 FLASH SALE • UP TO 40% OFF",
          active: true,
        },
      ],
    },
  },
  "category-carousel": {
    type: "category-carousel",
    name: "Category Stories Carousel",
    category: "PRODUCTS",
    description: "Horizontal swipeable category circles/cards with product counts.",
    iconName: "LayoutGrid",
    schema: CategoryCarouselSettingsSchema,
    defaultSettings: {
      title: "Shop by Categories",
      tagline: "Curated Collections",
      limit: 8,
      showCount: true,
    },
  },
  "trending-products": {
    type: "trending-products",
    name: "Trending Products Carousel",
    category: "PRODUCTS",
    description: "Horizontal carousel of high-demand items with stock urgency counters.",
    iconName: "Flame",
    schema: ProductCarouselSettingsSchema,
    defaultSettings: {
      title: "Trending Now",
      subtitle: "Swipe through the viral products everyone's discovering right now.",
      source: "trending",
      limit: 8,
      showUrgencyBar: true,
      showRating: true,
      showQuickAdd: true,
    },
  },
  "spotlight": {
    type: "spotlight",
    name: "Product Spotlight (Today's Find)",
    category: "FEATURED",
    description: "Large editorial showcase of a standout product with specifications.",
    iconName: "Sparkles",
    schema: SpotlightSettingsSchema,
    defaultSettings: {
      badgeText: "TODAY'S FIND",
      productId: "prod-1",
      showSpecs: true,
    },
  },
  "new-arrivals": {
    type: "new-arrivals",
    name: "New Arrivals Grid",
    category: "PRODUCTS",
    description: "Modern grid of freshly imported items with NEW badges.",
    iconName: "Zap",
    schema: ProductGridSettingsSchema,
    defaultSettings: {
      title: "New Arrivals",
      subtitle: "Fresh finds, just added to our collection this week.",
      source: "new-arrivals",
      limit: 4,
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      showRating: true,
      showBadge: true,
    },
  },
  "best-sellers": {
    type: "best-sellers",
    name: "Best Sellers Grid",
    category: "PRODUCTS",
    description: "Grid of tried and tested customer favorite products.",
    iconName: "Award",
    schema: ProductGridSettingsSchema,
    defaultSettings: {
      title: "Best Sellers",
      subtitle: "Customer favorites that keep selling out.",
      source: "best-sellers",
      limit: 4,
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      showRating: true,
      showBadge: true,
    },
  },
  "reviews": {
    type: "reviews",
    name: "Customer Reviews",
    category: "SOCIAL_PROOF",
    description: "Customer testimonials with ratings and purchased product tags.",
    iconName: "Heart",
    schema: ReviewsSettingsSchema,
    defaultSettings: {
      title: "Loved by Our Customers",
      subtitle: "Real experiences from verified shoppers across Bangladesh.",
      limit: 4,
    },
  },
  "trust-pillars": {
    type: "trust-pillars",
    name: "Trust & Guarantee Pillars",
    category: "SOCIAL_PROOF",
    description: "4 core pillars: Carefully Selected, Quality Checked, COD, 7-Day Return.",
    iconName: "ShieldCheck",
    schema: TrustSettingsSchema,
    defaultSettings: {
      title: "Why Shop With Toolera?",
      subtitle: "We are built on trust, genuine curation, and reliable local support.",
      pillars: [
        { title: "Carefully Selected", description: "We select products worth discovering.", iconName: "Sparkles" },
        { title: "Quality Checked", description: "Every product is physically inspected before dispatch.", iconName: "ShieldCheck" },
        { title: "Cash on Delivery", description: "Pay conveniently at your doorstep anywhere in Bangladesh.", iconName: "Banknote" },
        { title: "Easy 7-Day Returns", description: "Hassle-free replacement for defective units.", iconName: "RotateCcw" },
      ],
    },
  },
  "newsletter": {
    type: "newsletter",
    name: "Newsletter Subscription Card",
    category: "MARKETING",
    description: "High-conversion subscription card with instant confirmation.",
    iconName: "Mail",
    schema: NewsletterSettingsSchema,
    defaultSettings: {
      tagline: "Stay in the Loop",
      title: "Get the Good Stuff First.",
      description: "Be the first to discover new trending finds and limited flash deals.",
      buttonText: "Subscribe",
    },
  },
  "promo-banner": {
    type: "promo-banner",
    name: "Promotional Banner Card",
    category: "MARKETING",
    description: "Wide graphic banner with title, discount badge and CTA button.",
    iconName: "Tag",
    schema: PromoBannerSettingsSchema,
    defaultSettings: {
      headline: "Flash Deal — 40% Off China Direct Import",
      subtext: "Limited stock available. Free delivery on orders over ৳2,000.",
      buttonText: "Claim Deal",
      buttonLink: "/shop?filter=trending",
      imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=300&q=80",
      height: 220,
    },
  },
  "faq": {
    type: "faq",
    name: "FAQ Section",
    category: "CONTENT",
    description: "Collapsible questions and answers about shipping and returns.",
    iconName: "HelpCircle",
    schema: FaqSettingsSchema,
    defaultSettings: {
      title: "Frequently Asked Questions",
      items: [
        { question: "How long does delivery take?", answer: "1–2 days inside Dhaka Metro, and 2–4 days across the rest of Bangladesh." },
        { question: "Is Cash on Delivery available?", answer: "Yes! Cash on Delivery is available in all 64 districts." },
        { question: "What is your return policy?", answer: "We offer a 7-day hassle-free return policy if an item arrives damaged or malfunctioning." },
      ],
    },
  },
  "countdown": {
    type: "countdown",
    name: "Flash Countdown Bar",
    category: "MARKETING",
    description: "Live countdown timer with promo coupon code trigger.",
    iconName: "Clock",
    schema: CountdownSettingsSchema,
    defaultSettings: {
      title: "Midnight Flash Deals End Soon!",
      targetHours: 12,
      couponCode: "TRENDY40",
      discountText: "Get 40% OFF with code",
      linkUrl: "/shop?filter=trending",
    },
  },
};
