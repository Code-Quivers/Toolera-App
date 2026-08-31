"use client";
// Storefront customer store — auth is handled by useCustomerAuthStore; this is for address management
import { useState, useCallback } from "react";
import { getAuthHeader } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface CustomerAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  isDefault?: boolean;
}

export function useCustomerStore() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/customers/me/addresses`, { headers: getAuthHeader() });
      const json = await res.json();
      setAddresses(Array.isArray(json?.data) ? json.data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  const addAddress = useCallback(async (address: Omit<CustomerAddress, "id">) => {
    const res = await fetch(`${API}/api/v1/customers/me/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(address),
    });
    const json = await res.json();
    if (json?.data) setAddresses(prev => [...prev, json.data]);
    return json?.data;
  }, []);

  return { addresses, isLoading, fetchAddresses, addAddress };
}
