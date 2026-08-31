"use client";
// Cart not available in dashboard — stub to satisfy imports from storefront layout components
import { useState } from "react";

export function useCartStore() {
  const [items] = useState<any[]>([]);
  return { items, count: 0, total: 0, add: () => {}, remove: () => {}, clear: () => {}, updateQty: () => {} };
}
