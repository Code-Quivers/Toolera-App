"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    plan?: {
      name: string;
      priceMonthly: number;
      priceYearly: number;
      maxProducts: number;
      maxOrdersPerMonth: number;
    };
  } | null;
  metrics?: {
    productsCount: number;
    ordersCount: number;
    revenue: number;
  };
  members?: Array<{
    id: string;
    role: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  createdAt: string;
}

interface TenantState {
  stores: StoreModel[];
  activeStore: StoreModel | null;
  isLoading: boolean;
  error: string | null;
  isCreateModalOpen: boolean;
  isPaymentPending: boolean;
  
  // Actions
  setPaymentPending: (pending: boolean) => void;
  markSubscriptionPaid: (planSlug?: string, cycle?: string) => void;
  fetchStores: () => Promise<void>;
  setActiveStore: (store: StoreModel) => void;
  setCreateModalOpen: (open: boolean) => void;
  createStore: (data: {
    name: string;
    slug: string;
    customDomain?: string;
    description?: string;
    currency?: string;
    currencySymbol?: string;
    planSlug?: string;
  }) => Promise<{ success: boolean; message?: string; store?: StoreModel }>;
  updateStore: (id: string, data: Partial<StoreModel>) => Promise<boolean>;
  deleteStore: (id: string) => Promise<boolean>;
  addMember: (storeId: string, email: string, role: string) => Promise<boolean>;
  removeMember: (storeId: string, memberId: string) => Promise<boolean>;
}

const DEFAULT_STORE: StoreModel = {
  id: "default_store",
  name: "Raifa's Mart",
  slug: "raifas-mart",
  customDomain: "raifasmart.com",
  description: "Trending Lifestyle & Smart Tech Store in Bangladesh",
  currency: "BDT",
  currencySymbol: "৳",
  status: "ACTIVE",
  ownerId: "admin_user",
  subscription: {
    id: "sub_default",
    planSlug: "starter",
    status: "PENDING",
    billingCycle: "MONTHLY",
    currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    plan: {
      name: "Starter Trial",
      priceMonthly: 999,
      priceYearly: 9990,
      maxProducts: 500,
      maxOrdersPerMonth: 1000,
    },
  },
  metrics: {
    productsCount: 14,
    ordersCount: 38,
    revenue: 48900,
  },
  createdAt: new Date().toISOString(),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      stores: [DEFAULT_STORE],
      activeStore: DEFAULT_STORE,
      isLoading: false,
      error: null,
      isCreateModalOpen: false,
      isPaymentPending: true,

      setPaymentPending: (pending: boolean) => set({ isPaymentPending: pending }),

      markSubscriptionPaid: (planSlug = "growth", cycle = "MONTHLY") => {
        const currentActive = get().activeStore;
        if (currentActive) {
          const updated: StoreModel = {
            ...currentActive,
            status: "ACTIVE",
            subscription: {
              id: "sub_" + Date.now().toString(36),
              planSlug,
              status: "ACTIVE",
              billingCycle: cycle,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                name: planSlug.charAt(0).toUpperCase() + planSlug.slice(1),
                priceMonthly: 999,
                priceYearly: 9990,
                maxProducts: 500,
                maxOrdersPerMonth: 1000,
              },
            },
          };
          set({ activeStore: updated, isPaymentPending: false });
        } else {
          set({ isPaymentPending: false });
        }
      },

      fetchStores: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/stores`);
          if (res.ok) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
              const currentActive = get().activeStore;
              const matchingActive = currentActive
                ? result.data.find((s: StoreModel) => s.id === currentActive.id || s.slug === currentActive.slug)
                : result.data[0];

              set({
                stores: result.data,
                activeStore: matchingActive || result.data[0],
                isLoading: false,
              });
              return;
            }
          }
          // Fallback if backend is offline or empty
          set({ isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      setActiveStore: (store: StoreModel) => {
        set({ activeStore: store });
      },

      setCreateModalOpen: (open: boolean) => {
        set({ isCreateModalOpen: open });
      },

      createStore: async (data) => {
        try {
          set({ isLoading: true });
          const res = await fetch(`${API_BASE}/stores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const result = await res.json();
          if (res.ok && result.success) {
            const newStore = result.data;
            set((state) => ({
              stores: [newStore, ...state.stores],
              activeStore: newStore,
              isLoading: false,
              isCreateModalOpen: false,
            }));
            return { success: true, store: newStore };
          } else {
            set({ isLoading: false });
            return { success: false, message: result.message || "Failed to create store" };
          }
        } catch (err: any) {
          // Client-side fallback if server is unreachable
          const fallbackStore: StoreModel = {
            id: `store_${Date.now()}`,
            name: data.name,
            slug: data.slug.toLowerCase(),
            customDomain: data.customDomain || null,
            description: data.description || null,
            currency: data.currency || "BDT",
            currencySymbol: data.currencySymbol || "৳",
            status: "ACTIVE",
            ownerId: "current_user",
            subscription: {
              id: `sub_${Date.now()}`,
              planSlug: data.planSlug || "starter",
              status: "TRIALING",
              billingCycle: "MONTHLY",
              currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                name: data.planSlug === "pro" ? "Pro Business" : "Starter",
                priceMonthly: data.planSlug === "pro" ? 2490 : 990,
                priceYearly: data.planSlug === "pro" ? 24900 : 9900,
                maxProducts: data.planSlug === "pro" ? 1000 : 100,
                maxOrdersPerMonth: data.planSlug === "pro" ? 3000 : 500,
              },
            },
            metrics: {
              productsCount: 0,
              ordersCount: 0,
              revenue: 0,
            },
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            stores: [fallbackStore, ...state.stores],
            activeStore: fallbackStore,
            isLoading: false,
            isCreateModalOpen: false,
          }));

          return { success: true, store: fallbackStore };
        }
      },

      updateStore: async (id, data) => {
        try {
          const res = await fetch(`${API_BASE}/stores/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (res.ok && result.success) {
            const updated = result.data;
            set((state) => ({
              stores: state.stores.map((s) => (s.id === id ? { ...s, ...updated } : s)),
              activeStore: state.activeStore?.id === id ? { ...state.activeStore, ...updated } : state.activeStore,
            }));
            return true;
          }
        } catch {}

        // Fallback local update
        set((state) => ({
          stores: state.stores.map((s) => (s.id === id ? { ...s, ...data } : s)),
          activeStore: state.activeStore?.id === id ? { ...state.activeStore, ...data } : state.activeStore,
        }));
        return true;
      },

      deleteStore: async (id) => {
        try {
          await fetch(`${API_BASE}/stores/${id}`, { method: "DELETE" });
        } catch {}

        set((state) => {
          const filtered = state.stores.filter((s) => s.id !== id);
          return {
            stores: filtered,
            activeStore: state.activeStore?.id === id ? filtered[0] || null : state.activeStore,
          };
        });
        return true;
      },

      addMember: async (storeId, email, role) => {
        try {
          const res = await fetch(`${API_BASE}/stores/${storeId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, role }),
          });
          if (res.ok) {
            get().fetchStores();
            return true;
          }
        } catch {}
        return true;
      },

      removeMember: async (storeId, memberId) => {
        try {
          await fetch(`${API_BASE}/stores/${storeId}/members/${memberId}`, { method: "DELETE" });
          get().fetchStores();
          return true;
        } catch {}
        return true;
      },
    }),
    {
      name: "toolera_tenant_store_v2",
      partialize: (state) => ({
        stores: state.stores,
        activeStore: state.activeStore,
        isPaymentPending: state.isPaymentPending,
      }),
    }
  )
);
