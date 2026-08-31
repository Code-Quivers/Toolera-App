import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Product, ProductVariant, ShippingOption } from "@/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from "@/lib/constants";
import { idbStorage } from "@/lib/idbStorage";

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_BDT";
  discountValue: number;
  discountAmount: number;
  description?: string;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  selectedShipping: ShippingOption;
  appliedCoupon: AppliedCoupon | null;
  
  // Actions
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setShippingOption: (option: ShippingOption) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Computed Getters
  getSubtotal: () => number;
  getShippingCost: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getFreeShippingProgress: () => { remaining: number; percentage: number; isEligible: boolean };
}

import { triggerSoftAction } from "./useSoftLoadingStore";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      selectedShipping: SHIPPING_OPTIONS[0],
      appliedCoupon: null,

      addItem: (product, quantity = 1, variant) => {
        triggerSoftAction("Added to cart • Updating total...", 400);
        const itemId = variant ? `${product.id}-${variant.id}` : product.id;
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex((item) => item.id === itemId);

        const itemPrice = variant ? variant.price : product.price;
        const itemComparePrice = variant ? variant.compareAtPrice : product.compareAtPrice;
        const itemImage = variant?.image || product.images[0];
        const maxStock = variant ? variant.stock : product.stock;

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = Math.min(updatedItems[existingItemIndex].quantity + quantity, maxStock);
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQty,
          };
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            title: product.title,
            slug: product.slug,
            price: itemPrice,
            compareAtPrice: itemComparePrice,
            image: itemImage,
            quantity: Math.min(quantity, maxStock),
            selectedVariant: variant,
            maxStock,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (itemId) => {
        triggerSoftAction("Removing item from cart...", 300);
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        triggerSoftAction("Updating quantity...", 250);
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        const updatedItems = get().items.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: Math.min(quantity, item.maxStock) };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      setShippingOption: (option) => set({ selectedShipping: option }),

      applyCoupon: (codeRaw: string) => {
        const code = (codeRaw || "").trim().toUpperCase();
        if (!code) return { success: false, message: "Please enter a coupon code." };

        const subtotal = get().getSubtotal();
        if (subtotal === 0) {
          return { success: false, message: "Your cart is empty." };
        }

        try {
          const { useCouponStore } = require("./useCouponStore");
          const allCoupons = useCouponStore.getState().coupons || [];
          const found = allCoupons.find((c: any) => c.code.toUpperCase() === code);

          if (!found) {
            return { success: false, message: `Coupon code "${code}" is invalid or does not exist.` };
          }

          if (!found.active) {
            return { success: false, message: `Coupon "${code}" is currently inactive.` };
          }

          if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
            return { success: false, message: `Coupon "${code}" has expired.` };
          }

          if (subtotal < (found.minOrder || 0)) {
            return {
              success: false,
              message: `Minimum order of ৳${found.minOrder} required for coupon "${code}".`,
            };
          }

          const discountAmount =
            found.discountType === "PERCENTAGE"
              ? Math.round((subtotal * found.discountValue) / 100)
              : Math.min(subtotal, found.discountValue);

          set({
            appliedCoupon: {
              code: found.code,
              discountType: found.discountType,
              discountValue: found.discountValue,
              discountAmount,
              description: found.description,
            },
          });

          triggerSoftAction(`Coupon "${found.code}" applied! Saved ৳${discountAmount}`, 500);

          return {
            success: true,
            message: `Coupon "${found.code}" applied successfully! You saved ৳${discountAmount.toLocaleString("en-BD")}.`,
          };
        } catch {
          return { success: false, message: "Could not apply coupon at this moment." };
        }
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
        triggerSoftAction("Coupon removed", 300);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;

        let threshold = 2000;
        let isEnabled = true;
        try {
          const { useShippingSettingsStore } = require("./useShippingSettingsStore");
          const settings = useShippingSettingsStore.getState();
          threshold = settings.freeShippingThreshold || 2000;
          isEnabled = settings.isFreeShippingEnabled !== false;
        } catch {}

        if (isEnabled && subtotal >= threshold) return 0;
        return get().selectedShipping.cost;
      },

      getDiscountAmount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const subtotal = get().getSubtotal();
        if (coupon.discountType === "PERCENTAGE") {
          return Math.round((subtotal * coupon.discountValue) / 100);
        }
        return Math.min(subtotal, coupon.discountValue);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const shipping = get().getShippingCost();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getSubtotal();
        let threshold = 2000;
        let isEnabled = true;
        try {
          const { useShippingSettingsStore } = require("./useShippingSettingsStore");
          const settings = useShippingSettingsStore.getState();
          threshold = settings.freeShippingThreshold || 2000;
          isEnabled = settings.isFreeShippingEnabled !== false;
        } catch {}

        const isEligible = isEnabled && subtotal >= threshold;
        const remaining = Math.max(0, threshold - subtotal);
        const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));
        return { remaining, percentage, isEligible, threshold, isEnabled };
      },
    }),
    {
      name: "raifas_mart_cart",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        items: state.items,
        selectedShipping: state.selectedShipping,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
