"use client";
// Global loading state without Zustand — module-level singleton with listeners
import { useEffect, useState } from "react";

interface SoftLoadingState {
  isLoading: boolean;
  progress: number;
  message: string | null;
}

let state: SoftLoadingState = { isLoading: false, progress: 0, message: null };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

function startLoading(message?: string) {
  if (timeoutId) clearTimeout(timeoutId);
  if (intervalId) clearInterval(intervalId);
  state = { isLoading: true, progress: 15, message: message ?? null };
  notify();
  intervalId = setInterval(() => {
    if (state.progress < 85) {
      state = { ...state, progress: Math.min(85, state.progress + Math.random() * 15 + 5) };
      notify();
    }
  }, 150);
}

function stopLoading() {
  if (intervalId) clearInterval(intervalId);
  state = { ...state, progress: 100 };
  notify();
  timeoutId = setTimeout(() => {
    state = { isLoading: false, progress: 0, message: null };
    notify();
  }, 300);
}

function triggerAction(message?: string, durationMs = 450) {
  startLoading(message);
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(stopLoading, durationMs);
}

export function useSoftLoadingStore() {
  const [snap, setSnap] = useState<SoftLoadingState>(state);

  useEffect(() => {
    const handler = () => setSnap({ ...state });
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return {
    isLoading: snap.isLoading,
    progress: snap.progress,
    message: snap.message,
    startLoading,
    stopLoading,
    triggerAction,
    setProgress: (p: number) => { state = { ...state, progress: Math.min(100, Math.max(0, p)) }; notify(); },
  };
}

export function triggerSoftAction(message?: string, durationMs = 400) {
  triggerAction(message, durationMs);
}
