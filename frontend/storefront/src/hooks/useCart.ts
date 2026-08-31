"use client";
import { useState, useEffect, useCallback } from "react";
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

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const add = useCallback((item: Omit<CartItem, "id">) => {
    setItems(cartAdd(item));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems(updateCartQty(id, qty));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(cartRemove(id));
  }, []);

  const clear = useCallback(() => {
    setItems(cartClear());
  }, []);

  return {
    items,
    add,
    updateQty,
    remove,
    clear,
    total: cartTotal(items),
    count: cartCount(items),
  };
}
