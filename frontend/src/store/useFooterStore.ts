import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface FooterAssuranceItem {
  title: string;
  subtitle: string;
  iconName: string;
}

export interface FooterSettings {
  // Layout
  columnsCount: 3 | 4 | 5;

  // Top Value Assurance Banner
  showTopAssuranceBanner: boolean;
  assurancePillars: FooterAssuranceItem[];

  // Column 1: Brand & Contact
  brandLogoType: "IMAGE" | "TEXT";
  brandTitle: string;
  brandLogoUrl: string;

  // Computer / Desktop Dimensions
  brandLogoWidth: number;
  brandLogoHeight: number;

  // Mobile Device Dimensions
  mobileBrandLogoWidth: number;
  mobileBrandLogoHeight: number;

  description: string;
  address: string;
  phone: string;
  email: string;

  // Column 2: Quick Links (e.g. Shop)
  col2Title: string;
  col2Links: FooterLinkItem[];

  // Column 3: Customer Care
  col3Title: string;
  col3Links: FooterLinkItem[];

  // Column 4: Payment Options
  col4Title: string;
  col4Note: string;
  enableCodBadge: boolean;
  enableBkashBadge: boolean;
  enableNagadBadge: boolean;
  deliveryHours: string;

  // Column 5: Extra / Social
  col5Title: string;
  col5Text: string;
  facebookUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;

  // Bottom Bar
  copyrightText: string;
  bottomLinks: FooterLinkItem[];
  attributionText: string;
}

interface FooterStoreState {
  settings: FooterSettings;
  updateSettings: (updated: Partial<FooterSettings>) => void;
  resetToDefaults: () => void;
}

export const defaultFooterSettings: FooterSettings = {
  columnsCount: 4,

  // Top Value Assurance Banner
  showTopAssuranceBanner: true,
  assurancePillars: [
    { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
    { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
    { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
    { title: "24/7 Live Support", subtitle: "Dedicated hotline assistance", iconName: "Headphones" },
  ],

  // Brand Column
  brandLogoType: "IMAGE",
  brandTitle: "RAIFA'S MART",
  brandLogoUrl: "/assets/RaifasMart Logo Footer.png",

  // Desktop Dimensions
  brandLogoWidth: 160,
  brandLogoHeight: 40,

  // Mobile Dimensions
  mobileBrandLogoWidth: 120,
  mobileBrandLogoHeight: 32,

  description:
    "Discover what's trending. We curate unique, smart, and useful lifestyle products from China with direct quality inspection for shoppers in Bangladesh.",
  address: "Gulshan-1, Dhaka-1212, Bangladesh",
  phone: "+880 1712-345678",
  email: "support@raifasmart.com",

  // Col 2: Shop
  col2Title: "SHOP",
  col2Links: [
    { id: "fl-1", label: "All Products", url: "/shop" },
    { id: "fl-2", label: "Trending Now", url: "/shop?filter=trending" },
    { id: "fl-3", label: "New Arrivals", url: "/shop?filter=new-arrivals" },
    { id: "fl-4", label: "Best Sellers", url: "/shop?filter=best-sellers" },
    { id: "fl-5", label: "Smart Gadgets", url: "/category/smart-gadgets" },
    { id: "fl-6", label: "Desk Setup", url: "/category/desk-setup" },
  ],

  // Col 3: Customer Care
  col3Title: "CUSTOMER CARE",
  col3Links: [
    { id: "fl-7", label: "WhatsApp Support", url: "https://wa.me/8801712345678" },
    { id: "fl-8", label: "Order Tracking", url: "/order-success" },
    { id: "fl-9", label: "Shipping Policy (1–3 Days)", url: "/pages/shipping-policy" },
    { id: "fl-10", label: "7-Day Easy Return Policy", url: "/pages/returns" },
    { id: "fl-11", label: "FAQ & Help", url: "/pages/contact" },
  ],

  // Col 4: Payment Options
  col4Title: "PAYMENT OPTIONS",
  col4Note: "We accept convenient payment methods in Bangladesh:",
  enableCodBadge: true,
  enableBkashBadge: true,
  enableNagadBadge: true,
  deliveryHours: "Delivery hotline: 10:00 AM – 10:00 PM",

  // Col 5: Connect
  col5Title: "CONNECT WITH US",
  col5Text: "Follow our social channels to watch daily unboxing videos of viral China gadgets.",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  whatsappNumber: "+880 1712-345678",

  // Bottom Bar
  copyrightText: "© 2026 Raifa's Mart. All rights reserved. Curated for Bangladesh.",
  bottomLinks: [
    { id: "bfl-1", label: "Privacy Policy", url: "/pages/privacy-policy" },
    { id: "bfl-2", label: "Terms of Service", url: "/pages/terms" },
  ],
  attributionText: "Made with modern Next.js",
};

export const useFooterStore = create<FooterStoreState>()(
  persist(
    (set, get) => ({
      settings: defaultFooterSettings,
      updateSettings: (updated) => {
        set({ settings: { ...get().settings, ...updated } });
      },
      resetToDefaults: () => set({ settings: defaultFooterSettings }),
    }),
    {
      name: "raifas_mart_footer_settings_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
