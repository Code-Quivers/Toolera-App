"use client";

import { create } from "zustand";

interface SoftLoadingState {
  isLoading: boolean;
  progress: number;
  message: string | null;
  startLoading: (message?: string) => void;
  setProgress: (progress: number) => void;
  stopLoading: () => void;
  triggerAction: (message?: string, durationMs?: number) => void;
}

let timeoutId: NodeJS.Timeout | null = null;
let progressIntervalId: NodeJS.Timeout | null = null;

export const useSoftLoadingStore = create<SoftLoadingState>((set, get) => ({
  isLoading: false,
  progress: 0,
  message: null,

  startLoading: (message) => {
    if (timeoutId) clearTimeout(timeoutId);
    if (progressIntervalId) clearInterval(progressIntervalId);

    set({ isLoading: true, progress: 15, message: message || null });

    // Smooth simulated incremental progress
    progressIntervalId = setInterval(() => {
      const current = get().progress;
      if (current < 85) {
        const increment = Math.random() * 15 + 5;
        set({ progress: Math.min(85, current + increment) });
      }
    }, 150);
  },

  setProgress: (progress) => {
    set({ progress: Math.min(100, Math.max(0, progress)) });
  },

  stopLoading: () => {
    if (progressIntervalId) clearInterval(progressIntervalId);
    set({ progress: 100 });

    timeoutId = setTimeout(() => {
      set({ isLoading: false, progress: 0, message: null });
    }, 300);
  },

  triggerAction: (message, durationMs = 450) => {
    get().startLoading(message);
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      get().stopLoading();
    }, durationMs);
  },
}));

/**
 * Global helper to trigger a soft loading animation for any user action
 */
export function triggerSoftAction(message?: string, durationMs = 400) {
  useSoftLoadingStore.getState().triggerAction(message, durationMs);
}
