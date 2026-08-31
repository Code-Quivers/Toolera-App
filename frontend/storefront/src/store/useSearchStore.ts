"use client";
// Search UI state — module-level singleton without Zustand
import { useEffect, useState } from "react";

interface SearchState {
  isOpen: boolean;
  query: string;
}

let state: SearchState = { isOpen: false, query: "" };
const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }
function set(s: Partial<SearchState>) { state = { ...state, ...s }; notify(); }

export function useSearchStore() {
  const [snap, setSnap] = useState<SearchState>(state);

  useEffect(() => {
    const h = () => setSnap({ ...state });
    listeners.add(h);
    return () => { listeners.delete(h); };
  }, []);

  return {
    isOpen: snap.isOpen,
    query: snap.query,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, query: "" }),
    setQuery: (q: string) => set({ query: q }),
  };
}
