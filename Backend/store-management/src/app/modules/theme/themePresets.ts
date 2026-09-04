export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    id: "sec-hero",
    type: "hero-slider",
    position: 0,
    enabled: true,
    settings: {
      autoplay: true,
      interval: 5000,
      boxed: true,
      slides: [],
    },
  },
  {
    id: "sec-categories",
    type: "category-carousel",
    position: 1,
    enabled: true,
    settings: {
      title: "Shop by Categories",
      tagline: "Curated Collections",
      limit: 8,
      showCount: true,
    },
  },
  {
    id: "sec-trending",
    type: "trending-products",
    position: 2,
    enabled: true,
    settings: {
      title: "Trending Now",
      subtitle: "Swipe through the viral products everyone's discovering right now.",
      source: "trending",
      limit: 8,
      showUrgencyBar: true,
      showRating: true,
      showQuickAdd: true,
    },
  },
  {
    id: "sec-new-arrivals",
    type: "new-arrivals",
    position: 3,
    enabled: true,
    settings: {
      title: "New Arrivals",
      subtitle: "Fresh finds, just added to our collection this week.",
      source: "new-arrivals",
      limit: 4,
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      showRating: true,
      showBadge: true,
    },
  },
  {
    id: "sec-best-sellers",
    type: "best-sellers",
    position: 4,
    enabled: true,
    settings: {
      title: "Best Sellers",
      subtitle: "Customer favorites that keep selling out.",
      source: "best-sellers",
      limit: 4,
      columns: { desktop: 4, tablet: 3, mobile: 2 },
      showRating: true,
      showBadge: true,
    },
  },
  {
    id: "sec-reviews",
    type: "reviews",
    position: 5,
    enabled: true,
    settings: {
      title: "Loved by Our Customers",
      subtitle: "Real experiences from verified shoppers across Bangladesh.",
      limit: 4,
    },
  },
  {
    id: "sec-trust",
    type: "trust-pillars",
    position: 6,
    enabled: true,
    settings: {
      title: "Why Shop With Toolera?",
      subtitle: "We are built on trust, genuine curation, and reliable local support.",
      pillars: [
        { title: "Carefully Selected", description: "We select products worth discovering.", iconName: "Sparkles" },
        { title: "Cash on Delivery", description: "Pay when you receive your parcel in BD.", iconName: "ShieldCheck" },
        { title: "Fast BD Delivery", description: "Prompt courier dispatch to all 64 districts.", iconName: "Truck" },
        { title: "7-Day Easy Return", description: "Hassle-free exchange policy on defects.", iconName: "RotateCcw" },
      ],
    },
  },
];

export const THEME_PRESET_SECTIONS: Record<string, any[]> = {
  ORIGINAL_RAIFAS_MART: DEFAULT_HOMEPAGE_SECTIONS,

  ELECTRONICS_MARKETPLACE: [
    { id: "sec-elec-hero", type: "electronics-hero-bento", enabled: true, position: 0, settings: {} },
    { id: "sec-elec-brands", type: "brand-logos-strip", enabled: true, position: 1, settings: {} },
    { id: "sec-elec-tabs", type: "bestsellers-category-tabs", enabled: true, position: 2, settings: {} },
    { id: "sec-elec-airpods", type: "airpods-promo-banner", enabled: true, position: 3, settings: {} },
    { id: "sec-elec-gaming", type: "gaming-spotlight", enabled: true, position: 4, settings: {} },
    {
      id: "sec-elec-trust",
      type: "trust-pillars",
      enabled: true,
      position: 5,
      settings: {
        title: "Why Buy From Electronics Marketplace?",
        subtitle: "Official warranties, fast Dhaka dispatch, and quality inspection.",
      },
    },
  ],

  MODERN_TECH_GADGETS: [
    { id: "sec-tech-hero", type: "modern-tech-hero-bento", enabled: true, position: 0, settings: {} },
    { id: "sec-tech-round", type: "round-categories-strip", enabled: true, position: 1, settings: {} },
    { id: "sec-tech-offers", type: "the-best-offers", enabled: true, position: 2, settings: {} },
    { id: "sec-tech-nothing", type: "nothing-phone-spotlight", enabled: true, position: 3, settings: {} },
    {
      id: "sec-tech-trust",
      type: "trust-pillars",
      enabled: true,
      position: 4,
      settings: {
        title: "Why Modern Tech Lovers Choose Us",
        subtitle: "Direct factory sourcing, viral gadgets, and unboxing satisfaction.",
      },
    },
  ],

  SUPERMARKET_MEGA_STORE: [
    { id: "sec-super-hero", type: "supermarket-hero-split", enabled: true, position: 0, settings: {} },
    { id: "sec-super-value", type: "supermarket-value-props", enabled: true, position: 1, settings: {} },
    { id: "sec-super-urbanears", type: "supermarket-urbanears-grid", enabled: true, position: 2, settings: {} },
    { id: "sec-super-spotlight", type: "supermarket-feature-spotlight", enabled: true, position: 3, settings: {} },
    {
      id: "sec-super-trust",
      type: "trust-pillars",
      enabled: true,
      position: 4,
      settings: {
        title: "Freshness & Quality Guaranteed",
        subtitle: "Direct farm sourcing, hygienic packing, and same-day delivery.",
      },
    },
  ],

  BEAUTY_COSMETICS: [
    { id: "sec-beauty-hero", type: "beauty-hero-slider", enabled: true, position: 0, settings: {} },
    { id: "sec-beauty-routine", type: "skin-routine-steps", enabled: true, position: 1, settings: {} },
    { id: "sec-beauty-products", type: "best-sellers", enabled: true, position: 2, settings: {} },
    { id: "sec-beauty-reviews", type: "reviews", enabled: true, position: 3, settings: {} },
  ],

  MINIMALIST_FURNITURE: [
    { id: "sec-furn-hero", type: "minimalist-hero-banner", enabled: true, position: 0, settings: {} },
    { id: "sec-furn-rooms", type: "room-category-cards", enabled: true, position: 1, settings: {} },
    { id: "sec-furn-products", type: "new-arrivals", enabled: true, position: 2, settings: {} },
    { id: "sec-furn-craft", type: "craftsmanship-trust", enabled: true, position: 3, settings: {} },
  ],

  FASHION_LIFESTYLE: [
    { id: "sec-fashion-hero", type: "fashion-lookbook-hero", enabled: true, position: 0, settings: {} },
    { id: "sec-fashion-season", type: "seasonal-collections", enabled: true, position: 1, settings: {} },
    { id: "sec-fashion-trending", type: "trending-products", enabled: true, position: 2, settings: {} },
    { id: "sec-fashion-instagram", type: "instagram-community", enabled: true, position: 3, settings: {} },
  ],
};
