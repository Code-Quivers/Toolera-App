import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncToServer } from "@/lib/serverSync";

export type NotificationType = "ORDER" | "REVIEW" | "INVENTORY" | "CUSTOMER" | "SYSTEM";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  targetHref: string;
  orderId?: string;
  reviewId?: string;
  productId?: string;
  badge?: string;
}

interface NotificationStoreState {
  notifications: AdminNotification[];
  soundEnabled: boolean;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<AdminNotification, "id" | "timestamp" | "isRead"> & { timestamp?: string; isRead?: boolean }) => void;
  toggleSound: () => void;
  getUnreadCount: () => number;
}

const DEFAULT_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-ord-1",
    type: "ORDER",
    title: "New Order Placed",
    description: "Rafiqul Islam placed Order #RM-261261-1417 (৳1,270 • Cash on Delivery)",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    targetHref: "/admin/orders?orderId=RM-261261-1417",
    orderId: "RM-261261-1417",
    badge: "৳1,270",
  },
  {
    id: "notif-rev-1",
    type: "REVIEW",
    title: "New Customer Review Awaiting Approval",
    description: "Tanvir Ahmed submitted a 5★ review for 'Anker Zolo 30W Fast Charger'",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isRead: false,
    targetHref: "/admin/reviews",
    badge: "5 ★",
  },
  {
    id: "notif-ord-2",
    type: "ORDER",
    title: "Order Delivered Successfully",
    description: "Order #RM-113417-1428 (৳370) updated to Delivered",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isRead: true,
    targetHref: "/admin/orders?orderId=RM-113417-1428",
    orderId: "RM-113417-1428",
    badge: "Delivered",
  },
  {
    id: "notif-inv-1",
    type: "INVENTORY",
    title: "Low Stock Alert",
    description: "Baseus Magnetic Wireless Power Bank 10000mAh is running low (4 items left)",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    isRead: true,
    targetHref: "/admin/inventory",
    badge: "Stock: 4",
  },
];

function getInitialNotifications(): AdminNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem("raifas_mart_admin_notifications_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.notifications && Array.isArray(parsed.state.notifications)) {
        return parsed.state.notifications;
      }
    }
  } catch {}
  return DEFAULT_NOTIFICATIONS;
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      notifications: getInitialNotifications(),
      soundEnabled: true,

      markAsRead: (id: string) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        });
        syncToServer("adminNotifications", get().notifications);
      },

      markAsUnread: (id: string) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: false } : n
          ),
        });
        syncToServer("adminNotifications", get().notifications);
      },

      toggleRead: (id: string) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: !n.isRead } : n
          ),
        });
        syncToServer("adminNotifications", get().notifications);
      },

      markAllAsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        });
        syncToServer("adminNotifications", get().notifications);
      },

      deleteNotification: (id: string) => {
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        });
        syncToServer("adminNotifications", get().notifications);
      },

      clearAll: () => {
        set({ notifications: [] });
        syncToServer("adminNotifications", []);
      },

      addNotification: (item) => {
        const newNotif: AdminNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: item.timestamp || new Date().toISOString(),
          isRead: item.isRead ?? false,
          ...item,
        };

        set({
          notifications: [newNotif, ...get().notifications],
        });
        syncToServer("adminNotifications", get().notifications);
      },

      toggleSound: () => {
        set({ soundEnabled: !get().soundEnabled });
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: "raifas_mart_admin_notifications_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
