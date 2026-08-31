"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type StockLogType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN" | "DAMAGE" | string;

export function useStockLogStore() {
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStockLogs = useCallback(async (params = "") => {
    setIsLoading(true);
    try {
      const data = await api.getStockLogs(params);
      setStockLogs(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchStockLogs(); }, [fetchStockLogs]);

  return { stockLogs, isLoading, fetchStockLogs };
}
