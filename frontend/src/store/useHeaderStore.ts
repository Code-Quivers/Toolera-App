import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NavbarLayoutType =
  | "WOODMART_MARKETPLACE"   // 1. Marketplace with Big Search + Support + Worldwide badge + Bottom Category Drawer & Links
  | "GROCERY_DIRECT"         // 2. Direct E-commerce with Top utility + Green All-Categories button + Promo tags + Quick Cart
  | "TECH_SaaS_CLEAN"        // 3. SaaS Tech E-commerce with Category Pill inside search bar + Discount pill + Actions
  | "CLASSIC_SPLIT"          // 4. Classic 2-Tier with Top announcement, logo, search, cart, and bottom subnav
  | "INLINE_CLEAN"           // 5. Minimalist 1-Row DTC with central menu items
  | "CENTERED_BRAND"         // 6. Centered Luxury Logo with balanced left/right navigation links
  | "MEGA_SEARCH_PORTAL"     // 7. Search Portal with wide input, hotline badge, and category pills
  | "SIDE_DRAWER_FOCUSED"    // 8. Drawer-focused with prominent Hamburger Category trigger
  | "TWO_TIER_COMPACT"       // 9. Compact 2-Tier with hotline & customer care top bar
  | "TRANSPARENT_OVERLAY";   // 10. Floating Glassmorphism Hero header

export interface HeaderSettings {
  // Navbar Layout Template (Select 1 of 10)
  navbarLayout: NavbarLayoutType;

  // Logo & Branding
  logoType: "IMAGE" | "TEXT";
  logoText: string;
  logoImageUrl: string;
  faviconUrl: string; // 512x512

  // Social Media Sharing (OpenGraph for Facebook, WhatsApp, Telegram, Twitter)
  ogImageUrl: string; // 1200x630
  ogTitle: string;
  ogDescription: string;

  // Computer / Desktop Dimensions
  logoWidth: number;
  logoHeight: number;
  headerHeight: number;

  // Mobile Device Dimensions
  mobileLogoWidth: number;
  mobileLogoHeight: number;
  mobileHeaderHeight: number;

  // Top Announcement Bar
  showTopBar: boolean;
  topBarText: string;
  topBarBgColor: string;
  topBarTextColor: string;

  // Header Options
  isSticky: boolean;
  hotlinePhone: string;
  supportHours: string;
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showCategoriesDrawer: boolean;
  showShippingBadge: boolean;
}

interface HeaderStoreState {
  settings: HeaderSettings;
  updateSettings: (updated: Partial<HeaderSettings>) => void;
  resetToDefaults: () => void;
}

export const defaultHeaderSettings: HeaderSettings = {
  navbarLayout: "WOODMART_MARKETPLACE",

  logoType: "IMAGE",
  logoText: "RAIFA'S MART",
  logoImageUrl: "/assets/RaifasMart Logo.png",
  faviconUrl: "/assets/favicon.png",

  // Social Media Share Defaults (1200x630)
  ogImageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&h=630&q=80",
  ogTitle: "Raifa's Mart — Discover What's Trending. Smart Finds. Better Prices.",
  ogDescription: "Discover trending smart gadgets, viral desktop setups, and unique lifestyle finds with cash on delivery in Bangladesh.",

  // Desktop Dimensions
  logoWidth: 240,
  logoHeight: 48,
  headerHeight: 76,

  // Mobile Dimensions
  mobileLogoWidth: 140,
  mobileLogoHeight: 36,
  mobileHeaderHeight: 58,

  showTopBar: true,
  topBarText: "⚡ FLASH SALE: Free delivery inside Dhaka on orders over ৳2,500! Cash on delivery available nationwide.",
  topBarBgColor: "#0F172A",
  topBarTextColor: "#F8FAFC",
  isSticky: true,
  hotlinePhone: "01712-345678",
  supportHours: "24/7 Support",
  showSearch: true,
  showWishlist: true,
  showCart: true,
  showCategoriesDrawer: true,
  showShippingBadge: true,
};

// Check and migrate existing saved preferences from any legacy storage keys
function getInitialHeaderSettings(): HeaderSettings {
  if (typeof window === "undefined") return defaultHeaderSettings;
  try {
    const keys = [
      "raifas_mart_header_settings_v3",
      "raifas_mart_header_settings_v2",
      "raifas_mart_header_settings",
    ];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.settings) {
          return { ...defaultHeaderSettings, ...parsed.state.settings };
        }
      }
    }
  } catch {}
  return defaultHeaderSettings;
}

export const useHeaderStore = create<HeaderStoreState>()(
  persist(
    (set, get) => ({
      settings: getInitialHeaderSettings(),
      updateSettings: (updated) => {
        const newSettings = { ...get().settings, ...updated };
        set({ settings: newSettings });
      },
      resetToDefaults: () => set({ settings: defaultHeaderSettings }),
    }),
    {
      name: "raifas_mart_header_settings_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
