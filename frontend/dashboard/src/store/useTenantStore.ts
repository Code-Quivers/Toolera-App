"use client";
import { useState, useEffect, useCallback } from "react";
import { getAuthHeader } from "@/lib/auth";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");

export interface StoreModel {
  id: string;
  name: string;
  slug: string;
  customDomain?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  currency: string;
  currencySymbol: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "INACTIVE";
  ownerId: string;
  subscription?: {
    id: string;
    planSlug: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
    plan?: { name: string; priceMonthly: number; priceYearly: number; maxProducts: number; maxOrdersPerMonth: number; maxStaffMembers: number; maxStorageMb: number };
  } | null;
  members?: any[];
  createdAt: string;
}

const CACHE_KEY = "rm_active_store_cache";

export function useTenantStore() {
  const [stores, setStores] = useState<StoreModel[]>([]);
  const [activeStore, setActiveStoreState] = useState<StoreModel | null>(() => {
    try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentPending, setIsPaymentPendingState] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/stores/me`, { headers: getAuthHeader() });
      if (!res.ok) return;
      const json = await res.json();
      const store = json?.data ?? json;
      if (store?.id) {
        setStores([store]);
        setActiveStoreState(store);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(store)); } catch {}
        const sub = store.subscription;
        const pending = !!sub && (sub.status === "PENDING" || sub.status === "UNPAID" || sub.status === "CANCELLED" || sub.status === "EXPIRED");
        setIsPaymentPendingState(pending);
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (getAuthHeader().Authorization) fetchStores();
  }, [fetchStores]);

  const setActiveStore = useCallback((store: StoreModel) => setActiveStoreState(store), []);
  const setCreateModalOpen = useCallback((open: boolean) => setIsCreateModalOpen(open), []);
  const setPaymentPending = useCallback((pending: boolean) => setIsPaymentPendingState(pending), []);

  const markSubscriptionPaid = useCallback((planSlug = "pro", cycle = "monthly") => {
    if (!activeStore) return;
    const updated: StoreModel = {
      ...activeStore,
      subscription: {
        id: crypto.randomUUID(),
        planSlug,
        status: "ACTIVE",
        billingCycle: cycle,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    setActiveStoreState(updated);
    setStores(prev => prev.map(s => s.id === updated.id ? updated : s));
    setIsPaymentPendingState(false);
  }, [activeStore]);

  const createStore = useCallback(async (data: Partial<StoreModel>): Promise<{ success: boolean; message?: string; store?: StoreModel }> => {
    try {
      const res = await fetch(`${API}/api/v1/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json?.data) {
        setStores(prev => [...prev, json.data]);
        setActiveStoreState(json.data);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(json.data)); } catch {}
        return { success: true, store: json.data };
      }
      return { success: false, message: json.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }, []);

  const updateStore = useCallback(async (id: string, data: Partial<StoreModel>): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/api/v1/stores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStores(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        if (activeStore?.id === id) setActiveStoreState(prev => prev ? { ...prev, ...data } : prev);
      }
      return res.ok;
    } catch { return false; }
  }, [activeStore]);

  const deleteStore = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/api/v1/stores/${id}`, { method: "DELETE", headers: getAuthHeader() });
      if (res.ok) setStores(prev => prev.filter(s => s.id !== id));
      return res.ok;
    } catch { return false; }
  }, []);

  const addMember = useCallback(async (storeId: string, email: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/api/v1/stores/${storeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ email, role }),
      });
      return res.ok;
    } catch { return false; }
  }, []);

  const removeMember = useCallback(async (storeId: string, memberId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/api/v1/stores/${storeId}/members/${memberId}`, {
        method: "DELETE", headers: getAuthHeader(),
      });
      return res.ok;
    } catch { return false; }
  }, []);

  return {
    stores, activeStore, isLoading, isPaymentPending, isCreateModalOpen,
    error: null as string | null,
    fetchStores, setActiveStore, setCreateModalOpen, setPaymentPending,
    markSubscriptionPaid, createStore, updateStore, deleteStore, addMember, removeMember,
  };
}
