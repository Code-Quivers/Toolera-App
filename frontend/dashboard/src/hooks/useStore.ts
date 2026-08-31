"use client";
import { useState, useEffect } from "react";
import { getAuthHeader, type AdminUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  currency: string;
  currencySymbol: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "INACTIVE";
  subscription?: {
    id: string;
    planSlug: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
    plan?: { name: string; priceMonthly: number };
  } | null;
  members?: Array<{ id: string; role: string; user: Pick<AdminUser, 'id' | 'name' | 'email'> }>;
}

export function useStore() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) { setLoading(false); return; }

    fetch(`${API}/api/v1/stores/me`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) setStore(json.data);
        else if (json?.id) setStore(json as StoreInfo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isPaymentPending = !!store?.subscription && (
    store.subscription.status === "PENDING" ||
    store.subscription.status === "UNPAID" ||
    store.subscription.status === "CANCELLED" ||
    store.subscription.status === "EXPIRED"
  );

  return { store, loading, isPaymentPending };
}
