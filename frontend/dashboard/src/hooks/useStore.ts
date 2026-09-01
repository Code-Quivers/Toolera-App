"use client";
import { useState, useEffect } from "react";
import { getAuthHeader, type AdminUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STORE_CACHE_KEY = "rm_active_store_cache";

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
    // Read cache first so the redirect guard never sees store=null while loading
    try {
      const cached = localStorage.getItem(STORE_CACHE_KEY);
      if (cached) setStore(JSON.parse(cached) as StoreInfo);
    } catch {}

    const headers = getAuthHeader();
    if (!headers.Authorization) { setLoading(false); return; }

    fetch(`${API}/api/v1/stores/me`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setStore(json.data);
          try { localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(json.data)); } catch {}
        } else if (json?.id) {
          setStore(json as StoreInfo);
          try { localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(json)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isPaymentPending = !!store?.subscription && ["PENDING", "UNPAID", "CANCELLED", "EXPIRED"].includes(store.subscription.status);

  return { store, loading, isPaymentPending };
}
