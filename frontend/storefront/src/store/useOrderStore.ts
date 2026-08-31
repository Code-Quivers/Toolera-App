"use client";
import { useState, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useOrderStore() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createOrder = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const result = await sfApi.createOrder(data);
      setOrders(prev => [result, ...prev]);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomerOrders = useCallback(async (customerId: string) => {
    setIsLoading(true);
    try {
      const data = await sfApi.getCustomerOrders(customerId);
      setOrders(Array.isArray(data) ? data : []);
    } catch {} finally {
      setIsLoading(false);
    }
  }, []);

  return { orders, isLoading, createOrder, fetchCustomerOrders };
}
