"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface CustomerItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  district?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  [key: string]: any;
}

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

  const addCustomer = useCallback((customer: any) => {
    setCustomers(prev => [customer, ...prev]);
  }, []);

  const updateCustomer = useCallback((id: string, data: any) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const recordDuePayment = useCallback((id: string, amount: number, _method?: string, _note?: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, dueAmount: Math.max(0, (c.dueAmount || 0) - amount) } : c));
  }, []);

  const addCustomerDue = useCallback((phone: string, amount: number) => {
    setCustomers(prev => prev.map(c =>
      (c.phone === phone || c.customerPhone === phone)
        ? { ...c, dueAmount: (c.dueAmount || 0) + amount }
        : c
    ));
  }, []);

  return { customers, isLoading, fetchCustomers, addCustomer, updateCustomer, deleteCustomer, recordDuePayment, addCustomerDue };
}
