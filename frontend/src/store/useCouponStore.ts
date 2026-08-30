import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface CouponItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_BDT";
  discountValue: number;
  minOrder: number;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  expiryDate?: string;
  description?: string;
}

interface CouponStoreState {
  coupons: CouponItem[];
  addCoupon: (coupon: CouponItem) => void;
  updateCoupon: (id: string, updated: Partial<CouponItem>) => void;
  deleteCoupon: (id: string) => void;
}

const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: "coup-welcome10",
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrder: 500,
    usageLimit: 1000,
    usageCount: 12,
    active: true,
    expiryDate: "2026-12-31",
    description: "10% off on orders above ৳500",
  },
  {
    id: "coup-save50",
    code: "SAVE50",
    discountType: "FIXED_BDT",
    discountValue: 50,
    minOrder: 300,
    usageLimit: 500,
    usageCount: 45,
    active: true,
    expiryDate: "2026-12-31",
    description: "Flat ৳50 discount on orders above ৳300",
  },
  {
    id: "coup-raifa100",
    code: "RAIFA100",
    discountType: "FIXED_BDT",
    discountValue: 100,
    minOrder: 1000,
    usageLimit: 500,
    usageCount: 28,
    active: true,
    expiryDate: "2026-12-31",
    description: "Flat ৳100 discount on orders above ৳1000",
  },
];

function getInitialCoupons(): CouponItem[] {
  if (typeof window === "undefined") return DEFAULT_COUPONS;
  try {
    const raw = localStorage.getItem("raifas_mart_coupons_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.coupons && Array.isArray(parsed.state.coupons) && parsed.state.coupons.length > 0) {
        return parsed.state.coupons;
      }
    }
  } catch {}
  return DEFAULT_COUPONS;
}

export const useCouponStore = create<CouponStoreState>()(
  persist(
    (set, get) => ({
      coupons: getInitialCoupons(),

      addCoupon: (coupon) => {
        set({ coupons: [coupon, ...get().coupons] });
      },

      updateCoupon: (id, updated) => {
        set({
          coupons: get().coupons.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        });
      },

      deleteCoupon: (id) => {
        set({
          coupons: get().coupons.filter((c) => c.id !== id),
        });
      },
    }),
    {
      name: "raifas_mart_coupons_v1",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
