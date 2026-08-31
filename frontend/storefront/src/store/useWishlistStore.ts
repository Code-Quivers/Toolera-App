"use client";
// Wishlist — stored in localStorage; no Zustand
import { useEffect, useState } from "react";

const KEY = "rm_wishlist";

function load(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function save(ids: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(ids));
}

let ids: string[] = load();
const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }

export function useWishlistStore() {
  const [snap, setSnap] = useState<string[]>(ids);

  useEffect(() => {
    setSnap(load());
    const h = () => setSnap([...ids]);
    listeners.add(h);
    return () => { listeners.delete(h); };
  }, []);

  const toggle = (productId: string) => {
    ids = ids.includes(productId) ? ids.filter(i => i !== productId) : [...ids, productId];
    save(ids);
    notify();
  };

  const isWishlisted = (productId: string) => snap.includes(productId);

  return { wishlist: snap, toggle, isWishlisted };
}
