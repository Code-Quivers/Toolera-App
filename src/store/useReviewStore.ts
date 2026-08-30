import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncToServer } from "@/lib/serverSync";
import { formatDateTime } from "@/lib/formatters";
import { idbStorage } from "@/lib/idbStorage";

export interface ReviewItem {
  id: string;
  productId: string;
  productSlug?: string;
  productTitle: string;
  productImage?: string;

  // Author & Purchase Verification
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  authorLocation?: string;
  avatarUrl?: string;
  orderId?: string;
  verifiedPurchase: boolean;

  // Review Content
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  photos?: string[];
  date: string;
  createdAt?: string;

  // Moderation & Status
  status: "PENDING" | "APPROVED" | "REJECTED";
  isPinned?: boolean;
  moderatedAt?: string;
  adminReply?: {
    comment: string;
    date: string;
    repliedBy: string;
    createdAt?: string;
  };
  helpfulCount?: number;
}

interface ReviewStoreState {
  reviews: ReviewItem[];
  addReview: (review: ReviewItem) => void;
  updateStatus: (id: string, status: "APPROVED" | "PENDING" | "REJECTED") => void;
  addAdminReply: (id: string, replyText: string, repliedBy?: string) => void;
  deleteAdminReply: (id: string) => void;
  deleteReview: (id: string) => void;
  toggleHelpful: (id: string) => void;
  getApprovedReviews: () => ReviewItem[];
  getProductApprovedReviews: (productSlugOrTitle: string) => ReviewItem[];
  canCustomerReview: (
    productTitle: string,
    customerPhone?: string,
    customerOrders?: Array<{ items?: Array<{ title: string }> }>
  ) => boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [];

function getInitialReviews(): ReviewItem[] {
  if (typeof window === "undefined") return DEFAULT_REVIEWS;
  try {
    const keys = ["raifas_mart_reviews_v6", "raifas_mart_reviews_v5"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.reviews && Array.isArray(parsed.state.reviews)) {
          return parsed.state.reviews;
        }
      }
    }
  } catch {}
  return DEFAULT_REVIEWS;
}

export const useReviewStore = create<ReviewStoreState>()(
  persist(
    (set, get) => ({
      reviews: getInitialReviews(),

      addReview: (review) => {
        const timestamped: ReviewItem = {
          ...review,
          date: review.date || formatDateTime(new Date()),
          createdAt: review.createdAt || new Date().toISOString(),
        };
        const updated = [timestamped, ...get().reviews];
        set({ reviews: updated });
        syncToServer("reviews", updated);

        try {
          if (typeof window !== "undefined") {
            const { useNotificationStore } = require("./useNotificationStore");
            useNotificationStore.getState().addNotification({
              type: "REVIEW",
              title: "New Customer Review Submitted",
              description: `${timestamped.authorName} submitted a ${timestamped.rating}★ review for "${timestamped.productTitle}" awaiting approval`,
              targetHref: "/admin/reviews",
              reviewId: timestamped.id,
              badge: `${timestamped.rating} ★`,
            });
          }
        } catch {}
      },

      updateStatus: (id, status) => {
        const nowFormatted = formatDateTime(new Date());
        const updated = get().reviews.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                moderatedAt: `${status === "APPROVED" ? "Approved" : "Rejected"} on ${nowFormatted}`,
              }
            : r
        );
        set({ reviews: updated });
        syncToServer("reviews", updated);
      },

      addAdminReply: (id, replyText, repliedBy = "Raifa's Mart Support") => {
        const nowFormatted = formatDateTime(new Date());
        const updated = get().reviews.map((r) =>
          r.id === id
            ? {
                ...r,
                adminReply: {
                  comment: replyText,
                  date: nowFormatted,
                  createdAt: new Date().toISOString(),
                  repliedBy,
                },
              }
            : r
        );
        set({ reviews: updated });
        syncToServer("reviews", updated);
      },

      deleteAdminReply: (id) => {
        const updated = get().reviews.map((r) => (r.id === id ? { ...r, adminReply: undefined } : r));
        set({ reviews: updated });
        syncToServer("reviews", updated);
      },

      deleteReview: (id) => {
        const updated = get().reviews.filter((r) => r.id !== id);
        set({ reviews: updated });
        syncToServer("reviews", updated);
      },

      toggleHelpful: (id) => {
        const updated = get().reviews.map((r) =>
          r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        );
        set({ reviews: updated });
      },

      getApprovedReviews: () => {
        return get().reviews.filter((r) => r.status === "APPROVED");
      },

      getProductApprovedReviews: (productSlugOrTitle: string) => {
        const target = productSlugOrTitle.toLowerCase().trim();
        return get().reviews.filter((r) => {
          if (r.status !== "APPROVED") return false;
          const matchSlug = r.productSlug && r.productSlug.toLowerCase() === target;
          const matchTitle = r.productTitle && r.productTitle.toLowerCase() === target;
          const matchId = r.productId && r.productId.toLowerCase() === target;
          return matchSlug || matchTitle || matchId;
        });
      },

      canCustomerReview: (productTitle, customerPhone, customerOrders = []) => {
        if (!productTitle) return false;
        const normalizedTarget = productTitle.toLowerCase().trim();

        // 1. Check logged in customer orders list
        if (customerOrders && customerOrders.length > 0) {
          const hasPurchased = customerOrders.some((ord) =>
            ord.items?.some((item) => item.title.toLowerCase().trim() === normalizedTarget)
          );
          if (hasPurchased) return true;
        }

        // 2. Check if phone matches any order in useOrderStore
        if (typeof window !== "undefined" && customerPhone) {
          try {
            const rawOrders = localStorage.getItem("raifas_mart_orders_v4") || localStorage.getItem("raifas_mart_orders");
            if (rawOrders) {
              const parsed = JSON.parse(rawOrders);
              const ordersList: any[] = parsed?.state?.orders || [];
              const cleanTargetPhone = customerPhone.replace(/[^0-9]/g, "");

              const foundOrder = ordersList.find((ord) => {
                const ordPhone = (ord.phone || "").replace(/[^0-9]/g, "");
                if (!ordPhone || !cleanTargetPhone) return false;
                const phoneMatches = ordPhone.includes(cleanTargetPhone) || cleanTargetPhone.includes(ordPhone);
                const itemMatches = ord.items?.some(
                  (it: any) => it.title.toLowerCase().trim() === normalizedTarget
                );
                return phoneMatches && itemMatches;
              });

              if (foundOrder) return true;
            }
          } catch {}
        }

        return false;
      },
    }),
    {
      name: "raifas_mart_reviews_v5",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
