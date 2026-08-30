import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ShippingOption } from "@/types";

export interface ShippingSettings {
  insideDhakaCost: number;
  outsideDhakaCost: number;
  freeShippingThreshold: number;
  isFreeShippingEnabled: boolean;
  freeShippingBannerText: string;
  showFlashSaleCountdown: boolean;
  showBundleDiscounts: boolean;
  bundle2Qty?: number;
  bundle2DiscountPercent?: number;
  bundle3Qty?: number;
  bundle3DiscountPercent?: number;
  bundle3FreeDelivery?: boolean;
  flashSaleBannerTitle?: string;
  flashSaleScarcityText?: string;
  flashSaleProgressPercent?: number;
  flashSaleTimerHours?: number;
  flashSaleSavingsBadge?: string;
  // Product Page Delivery Timeline & Courier Widget Template
  showDeliveryTimeline: boolean;
  deliveryTimelineTemplate: "TIMELINE_3STEP" | "COMPACT_CARD" | "MINIMAL_BAR";
  deliveryTimelineTitle?: string;
  deliveryCourierBadgeText?: string;
  showSteadfastBadge?: boolean;
  showPathaoBadge?: boolean;
  deliveryDhakaTime?: string;
  deliveryOutsideDhakaTime?: string;
  showCodTrustBadge?: boolean;
  showReturnTrustBadge?: boolean;
  // VAT & Tax Management
  vatEnabled: boolean;
  vatRate: number; // e.g. 5, 7.5, 15
  vatRegistrationNumber?: string;
  vatInclusive: boolean;
}

interface ShippingSettingsStore extends ShippingSettings {
  updateSettings: (newSettings: Partial<ShippingSettings>) => void;
  getShippingOptions: () => ShippingOption[];
}

const DEFAULT_SETTINGS: ShippingSettings = {
  insideDhakaCost: 70,
  outsideDhakaCost: 130,
  freeShippingThreshold: 2000,
  isFreeShippingEnabled: true,
  freeShippingBannerText: "Add {remaining} more to get Free Delivery across Bangladesh!",
  showFlashSaleCountdown: true,
  showBundleDiscounts: true,
  bundle2Qty: 2,
  bundle2DiscountPercent: 10,
  bundle3Qty: 3,
  bundle3DiscountPercent: 18,
  bundle3FreeDelivery: true,
  flashSaleBannerTitle: "Flash Sale Offer Ending Soon:",
  flashSaleScarcityText: "84% Sold — Limited China Import Stock",
  flashSaleProgressPercent: 84,
  flashSaleTimerHours: 6,
  flashSaleSavingsBadge: "AUTO",
  showDeliveryTimeline: true,
  deliveryTimelineTemplate: "TIMELINE_3STEP",
  deliveryTimelineTitle: "Estimated Delivery Timeline",
  deliveryCourierBadgeText: "Steadfast & Pathao Express",
  showSteadfastBadge: true,
  showPathaoBadge: true,
  deliveryDhakaTime: "1–2 Days",
  deliveryOutsideDhakaTime: "2–4 Days",
  showCodTrustBadge: true,
  showReturnTrustBadge: true,
  vatEnabled: true,
  vatRate: 5, // 5% default standard VAT in BD
  vatRegistrationNumber: "BIN-004819283-0101",
  vatInclusive: false,
};

function getInitialSettings(): ShippingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("raifas_mart_shipping_settings_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        return { ...DEFAULT_SETTINGS, ...parsed.state };
      }
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export const useShippingSettingsStore = create<ShippingSettingsStore>()(
  persist(
    (set, get) => ({
      ...getInitialSettings(),

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
        try {
          if (typeof window !== "undefined") {
            const { syncToServer } = require("@/lib/serverSync");
            syncToServer("shippingSettings", { ...get(), ...newSettings });
          }
        } catch {}
      },

      getShippingOptions: () => [
        {
          id: "inside-dhaka",
          name: "Inside Dhaka Metro",
          cost: get().insideDhakaCost,
          estimatedDays: "1–2 Days",
        },
        {
          id: "outside-dhaka",
          name: "Outside Dhaka (All Bangladesh)",
          cost: get().outsideDhakaCost,
          estimatedDays: "2–4 Days",
        },
      ],
    }),
    {
      name: "raifas_mart_shipping_settings_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

