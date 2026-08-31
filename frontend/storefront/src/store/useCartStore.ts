"use client";
// Re-export useCart under old store name for backward compatibility
export { useCart as useCartStore } from "@/hooks/useCart";
export type { CartItem } from "@/lib/cart";
