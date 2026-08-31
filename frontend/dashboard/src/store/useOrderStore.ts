"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useOrderStore() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async (params = "") => {
    setIsLoading(true);
    try {
      const data = await api.getOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    const result = await api.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    return result;
  }, []);

  return { orders, isLoading, fetchOrders, updateOrderStatus };
}
