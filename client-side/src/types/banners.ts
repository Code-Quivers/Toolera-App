export type HeroBannerSlide = {
  id: string;
  slideType?: "editorial" | "image-only";
  title?: string;
  subtitle?: string;
  tagline?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  badge?: string;
  themeColor?: string; // e.g. 'teal', 'slate', 'rose'
  active: boolean;
};

export type SiteAnnouncement = {
  text: string;
  highlightText: string;
  linkText?: string;
  linkHref?: string;
  active: boolean;
};

export type AdminStoreSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  insideDhakaDeliveryCost: number;
  outsideDhakaDeliveryCost: number;
  freeShippingThreshold: number;
  currencySymbol: string;
};
