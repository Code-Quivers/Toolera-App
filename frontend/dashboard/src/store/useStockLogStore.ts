"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type StockLogType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN" | "DAMAGE" | string;

export interface StockLog {
  id?: string;
  productId: string;
  productTitle: string;
  sku?: string;
  type: StockLogType;
  qty: number;
  note?: string;
  costLoss?: number;
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
    if (globalLogs.length === 0 && !globalLoading) doFetch();
    return () => { listeners.delete(rerender); };
  }, []);

  const fetchStockLogs = useCallback((params = "") => doFetch(params), []);

  const addLog = useCallback((log: Omit<StockLog, "id" | "createdAt">) => {
    const entry: StockLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    globalLogs = [entry, ...globalLogs];
    notify();
  }, []);

  return {
    logs: globalLogs,
    stockLogs: globalLogs,
    isLoading: globalLoading,
    fetchStockLogs,
    addLog,
  };
}
