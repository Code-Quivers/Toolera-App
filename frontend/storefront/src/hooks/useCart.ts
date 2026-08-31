"use client";
import { useSyncExternalStore, useCallback, useEffect } from "react";
import {
  getCart,
  addToCart as cartAdd,
  updateCartQty,
  removeFromCart as cartRemove,
  clearCart as cartClear,
  cartTotal,
  cartCount,
  type CartItem,
} from "@/lib/cart";
import { SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { ShippingOption } from "@/types";

// ── Coupon ────────────────────────────────────────────────────────────────────

export interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
}

// Hardcoded demo coupons; replace with API-backed validation when ready.
const DEMO_COUPONS: AppliedCoupon[] = [
  { code: "DEMO10", type: "PERCENTAGE", value: 10 },
  { code: "SAVE100", type: "FIXED", value: 100, minOrder: 500 },
  { code: "WELCOME20", type: "PERCENTAGE", value: 20, minOrder: 1000 },
];

// ── Module-level global state (shared across all hook instances) ───────────────

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  selectedShipping: ShippingOption | null;
  appliedCoupon: AppliedCoupon | null;
  _hydrated: boolean;
}

let _state: CartState = {
  items: [],
  isDrawerOpen: false,
  selectedShipping: SHIPPING_OPTIONS[0] ?? null,
  appliedCoupon: null,
  _hydrated: false,
};

const _listeners = new Set<() => void>();

function _getSnapshot(): CartState {
  return _state;
}

function _subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

function _setState(partial: Partial<CartState>): void {
  _state = { ..._state, ...partial };
  _listeners.forEach((fn) => fn());
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCart() {
  const { items, isDrawerOpen, selectedShipping, appliedCoupon, _hydrated } =
    useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (!_hydrated) {
      _setState({ items: getCart(), _hydrated: true });
    }
  }, [_hydrated]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    _setState({ items: cartAdd(item) });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    _setState({ items: updateCartQty(id, qty) });
  }, []);

  const removeItem = useCallback((id: string) => {
    _setState({ items: cartRemove(id) });
  }, []);

  const clearCart = useCallback(() => {
    _setState({ items: cartClear(), appliedCoupon: null });
  }, []);

  // ── Drawer ────────────────────────────────────────────────────────────────

  const openDrawer = useCallback(() => _setState({ isDrawerOpen: true }), []);
  const closeDrawer = useCallback(() => _setState({ isDrawerOpen: false }), []);

  // ── Shipping ──────────────────────────────────────────────────────────────

  const setShippingOption = useCallback((option: ShippingOption) => {
    _setState({ selectedShipping: option });
  }, []);

  // ── Coupons ───────────────────────────────────────────────────────────────

  const applyCoupon = useCallback(
    (code: string): { success: boolean; message: string } => {
      const upper = code.trim().toUpperCase();
      const match = DEMO_COUPONS.find((c) => c.code === upper);
      if (!match) {
        return { success: false, message: "Invalid or expired coupon code." };
      }
      const subtotal = cartTotal(_state.items);
      if (match.minOrder && subtotal < match.minOrder) {
        return {
          success: false,
          message: `Minimum order of ৳${match.minOrder} required for this coupon.`,
        };
      }
      _setState({ appliedCoupon: match });
      return {
        success: true,
        message:
          match.type === "PERCENTAGE"
            ? `${match.value}% discount applied!`
            : `৳${match.value} discount applied!`,
      };
    },
    []
  );

  const removeCoupon = useCallback(() => _setState({ appliedCoupon: null }), []);

  // ── Computed getters ──────────────────────────────────────────────────────

  const getItemCount = useCallback(() => cartCount(items), [items]);

  const getSubtotal = useCallback(() => cartTotal(items), [items]);

  const getShippingCost = useCallback((): number => {
    const subtotal = cartTotal(items);
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return selectedShipping?.cost ?? 0;
  }, [items, selectedShipping]);

  const getDiscountAmount = useCallback((): number => {
    if (!appliedCoupon) return 0;
    const subtotal = cartTotal(items);
    if (appliedCoupon.type === "PERCENTAGE") {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [items, appliedCoupon]);

  const getTotal = useCallback((): number => {
    return Math.max(
      0,
      getSubtotal() + getShippingCost() - getDiscountAmount()
    );
  }, [getSubtotal, getShippingCost, getDiscountAmount]);

  const getFreeShippingProgress = useCallback((): number => {
    const subtotal = cartTotal(items);
    return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  }, [items]);

  return {
    items,
    isDrawerOpen,
    selectedShipping,
    appliedCoupon,
    // mutations
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    // drawer
    openDrawer,
    closeDrawer,
    // shipping
    setShippingOption,
    // coupons
    applyCoupon,
    removeCoupon,
    // getters
    getItemCount,
    getSubtotal,
    getShippingCost,
    getDiscountAmount,
    getTotal,
    getFreeShippingProgress,
  };
}
