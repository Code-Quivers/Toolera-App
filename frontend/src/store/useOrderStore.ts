import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface OrderItem {
  id: string;
  customer: string;
  phone: string;
  address: string;
  district: string;
  total: number;
  paidAmount?: number;
  dueAmount?: number;
  vatAmount?: number;
  shippingCost?: number;
  payment: string;
  status: "DRAFT" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  time: string;
  courierTracking: string | null;
  courierProvider?: string | null;
  courierStatus?: string | null;
  notes?: string;
  items: Array<{ title: string; variantName?: string; sku?: string; qty: number; price: number; image?: string }>;
}

interface OrderStoreState {
  orders: OrderItem[];
  addOrder: (order: OrderItem) => void;
  updateOrderStatus: (id: string, status: OrderItem["status"]) => void;
  updateTracking: (id: string, tracking: string, provider?: string) => void;
  deleteOrder: (id: string) => void;
  convertDraftToOrder: (id: string) => void;
}

const DEFAULT_ORDERS: OrderItem[] = [];

function getInitialOrders(): OrderItem[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem("raifas_mart_orders_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.orders && Array.isArray(parsed.state.orders)) {
        return parsed.state.orders;
      }
    }
  } catch {}
  return DEFAULT_ORDERS;
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: getInitialOrders(),

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },

      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)),
        });

        // Live cross-store sync to customer portal
        try {
          if (typeof window !== "undefined") {
            const { useCustomerAuthStore } = require("./useCustomerAuthStore");
            const authState = useCustomerAuthStore.getState();
            if (authState) {
              const updatedOrders = (authState.orders || []).map((o: any) =>
                o.id === id ? { ...o, status } : o
              );
              const updatedUsers = (authState.registeredUsers || []).map((u: any) => ({
                ...u,
                orders: (u.orders || []).map((o: any) => (o.id === id ? { ...o, status } : o)),
              }));
              useCustomerAuthStore.setState({
                orders: updatedOrders,
                registeredUsers: updatedUsers,
              });
            }
          }
        } catch (err) {
          console.warn("Failed to sync status to customer auth store:", err);
        }
      },

      updateTracking: (id, tracking, provider = "STEADFAST") => {
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, courierTracking: tracking, courierProvider: provider, status: "SHIPPED" } : o
          ),
        });

        // Live cross-store sync to customer portal
        try {
          if (typeof window !== "undefined") {
            const { useCustomerAuthStore } = require("./useCustomerAuthStore");
            const authState = useCustomerAuthStore.getState();
            if (authState) {
              const updatedOrders = (authState.orders || []).map((o: any) =>
                o.id === id ? { ...o, courierTracking: tracking } : o
              );
              const updatedUsers = (authState.registeredUsers || []).map((u: any) => ({
                ...u,
                orders: (u.orders || []).map((o: any) =>
                  o.id === id ? { ...o, courierTracking: tracking } : o
                ),
              }));
              useCustomerAuthStore.setState({
                orders: updatedOrders,
                registeredUsers: updatedUsers,
              });
            }
          }
        } catch (err) {
          console.warn("Failed to sync tracking to customer auth store:", err);
        }
      },

      deleteOrder: (id) => {
        set({
          orders: get().orders.filter((o) => o.id !== id),
        });
      },

      convertDraftToOrder: (id) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status: "PENDING", time: new Date().toISOString() } : o
          ),
        });
      },
    }),
    {
      name: "raifas_mart_orders_v1",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
