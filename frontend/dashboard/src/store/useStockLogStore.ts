"use client";
import { useState, useEffect, useCallback } from "react";
import { api, onDashboardSlugSet, getDashboardStoreSlug } from "@/lib/api";

export type StockLogType = "IN" | "OUT" | "ADJUSTMENT" | "RESTOCK" | "MANUAL" | "RETURN" | "DAMAGE" | string;

export interface StockLog {
  id?: string;
  productId: string;
  productTitle: string;
  sku?: string;
  type: StockLogType;
  qty: number;
  delta?: number;
  previousStock?: number;
  newStock?: number;
  costLoss?: number;
  note?: string;
  actor?: string;
  createdAt?: string;
}

// Module-level singleton
let globalLogs: StockLog[] = [];
let globalLoading = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

async function doFetch(params = "") {
  if (globalLoading) return;
  globalLoading = true;
  notify();
  try {
    const data = await api.getStockLogs(params);
    globalLogs = Array.isArray(data) ? data : [];
  } catch {
    globalLogs = [];
  } finally {
    globalLoading = false;
    notify();
  }
}

export function useStockLogStore() {
  const [, tick] = useState(0);

  useEffect(() => {
    const rerender = () => tick(n => n + 1);
    listeners.add(rerender);
    // Fetch when the dashboard store slug becomes available — the admin layout
    // calls setDashboardStoreSlug() after its async store fetch resolves, which
    // is after child effects have already run. Subscribe here so we fetch at
    // the right time regardless of timing.
    // If slug already set (e.g. navigating back to this page), fetch immediately
    if (getDashboardStoreSlug() && globalLogs.length === 0 && !globalLoading) doFetch();
    // Otherwise wait for slug to become available (set by admin layout after its async store fetch)
    const unsub = onDashboardSlugSet(() => {
      if (globalLogs.length === 0 && !globalLoading) doFetch();
    });
    return () => { listeners.delete(rerender); unsub(); };
  }, []);

  const fetchStockLogs = useCallback((params = "") => doFetch(params), []);

  const addLog = useCallback(async (log: Omit<StockLog, "id" | "createdAt">) => {
    // qty may be passed as delta from the inventory page — normalize
    const qty = (log as any).qty ?? Math.abs((log as any).delta ?? 0);

    const tempId = crypto.randomUUID();
    const entry: StockLog = {
      ...log,
      qty,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    globalLogs = [entry, ...globalLogs];
    notify();

    // Persist to backend — throws on failure so callers can catch
    const saved = await api.createStockLog({
      productId: log.productId,
      productTitle: log.productTitle,
      sku: log.sku,
      type: log.type,
      qty,
      previousStock: (log as any).previousStock,
      newStock: (log as any).newStock,
      note: log.note,
      actor: (log as any).actor,
      costLoss: log.costLoss,
    });

    // Replace optimistic entry with the real DB record
    if (saved?.id) {
      globalLogs = globalLogs.map(l => l.id === tempId ? { ...entry, ...saved } : l);
      notify();
    }
  }, []);

  return {
    logs: globalLogs,
    stockLogs: globalLogs,
    isLoading: globalLoading,
    fetchStockLogs,
    addLog,
  };
}
