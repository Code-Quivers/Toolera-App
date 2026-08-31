"use client";
// Quick view UI state — module-level singleton without Zustand
import { useEffect, useState } from "react";

interface QuickViewState {
  isOpen: boolean;
  productId: string | null;
}

let state: QuickViewState = { isOpen: false, productId: null };
const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }
function set(s: Partial<QuickViewState>) { state = { ...state, ...s }; notify(); }

export function useQuickViewStore() {
  const [snap, setSnap] = useState<QuickViewState>(state);

  useEffect(() => {
    const h = () => setSnap({ ...state });
    listeners.add(h);
    return () => { listeners.delete(h); };
  }, []);

  return {
    isOpen: snap.isOpen,
    productId: snap.productId,
    open: (productId: string) => set({ isOpen: true, productId }),
    close: () => set({ isOpen: false, productId: null }),
  };
}
