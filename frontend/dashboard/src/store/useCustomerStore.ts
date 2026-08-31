"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useCustomerStore() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = useCallback(async (params = "") => {
    setIsLoading(true);
    try {
      const data = await api.getCustomers(params);
      setCustomers(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return { customers, isLoading, fetchCustomers };
}
