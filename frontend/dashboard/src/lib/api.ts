// Central API client for dashboard
import { getAuthHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options?.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

export const api = {
  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: (params = "") => apiFetch<any[]>(`/api/v1/products${params}`),
  getProduct: (id: string) => apiFetch<any>(`/api/v1/products/${id}`),
  createProduct: (data: unknown) => apiFetch<any>("/api/v1/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: unknown) => apiFetch<any>(`/api/v1/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch<void>(`/api/v1/products/${id}`, { method: "DELETE" }),

  // ── Categories ─────────────────────────────────────────────────────────────
  getCategories: () => apiFetch<any[]>("/api/v1/categories"),
  createCategory: (data: unknown) => apiFetch<any>("/api/v1/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: unknown) => apiFetch<any>(`/api/v1/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => apiFetch<void>(`/api/v1/categories/${id}`, { method: "DELETE" }),

  // ── Orders ─────────────────────────────────────────────────────────────────
  getOrders: (params = "") => apiFetch<any[]>(`/api/v1/orders${params}`),
  getOrder: (id: string) => apiFetch<any>(`/api/v1/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => apiFetch<any>(`/api/v1/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // ── Customers ──────────────────────────────────────────────────────────────
  getCustomers: (params = "") => apiFetch<any[]>(`/api/v1/customers${params}`),
  getCustomer: (id: string) => apiFetch<any>(`/api/v1/customers/${id}`),

  // ── Reviews ────────────────────────────────────────────────────────────────
  getReviews: (params = "") => apiFetch<any[]>(`/api/v1/reviews${params}`),
  updateReview: (id: string, data: unknown) => apiFetch<any>(`/api/v1/reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteReview: (id: string) => apiFetch<void>(`/api/v1/reviews/${id}`, { method: "DELETE" }),

  // ── Coupons ────────────────────────────────────────────────────────────────
  getCoupons: () => apiFetch<any[]>("/api/v1/coupons"),
  createCoupon: (data: unknown) => apiFetch<any>("/api/v1/coupons", { method: "POST", body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: unknown) => apiFetch<any>(`/api/v1/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => apiFetch<void>(`/api/v1/coupons/${id}`, { method: "DELETE" }),

  // ── Attributes ─────────────────────────────────────────────────────────────
  getAttributes: () => apiFetch<any[]>("/api/v1/attributes"),
  createAttribute: (data: unknown) => apiFetch<any>("/api/v1/attributes", { method: "POST", body: JSON.stringify(data) }),
  updateAttribute: (id: string, data: unknown) => apiFetch<any>(`/api/v1/attributes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAttribute: (id: string) => apiFetch<void>(`/api/v1/attributes/${id}`, { method: "DELETE" }),

  // ── Media ──────────────────────────────────────────────────────────────────
  getMedia: () => apiFetch<any[]>("/api/v1/media"),
  uploadMedia: (form: FormData) => {
    const headers = getAuthHeader();
    return fetch(`${BASE}/api/v1/media`, { method: "POST", headers, body: form }).then(r => r.json());
  },
  deleteMedia: (id: string) => apiFetch<void>(`/api/v1/media/${id}`, { method: "DELETE" }),

  // ── Store settings ─────────────────────────────────────────────────────────
  getStore: () => apiFetch<any>("/api/v1/stores/me"),
  updateStore: (data: unknown) => apiFetch<any>("/api/v1/stores/me", { method: "PATCH", body: JSON.stringify(data) }),

  // ── Subscription ───────────────────────────────────────────────────────────
  getSubscription: () => apiFetch<any>("/api/v1/subscriptions/me"),
  createSubscription: (data: unknown) => apiFetch<any>("/api/v1/subscriptions", { method: "POST", body: JSON.stringify(data) }),

  // ── CMS (header/footer/menu/pages) ────────────────────────────────────────
  getHeader: () => apiFetch<any>("/api/v1/cms/header"),
  updateHeader: (data: unknown) => apiFetch<any>("/api/v1/cms/header", { method: "PATCH", body: JSON.stringify(data) }),
  getFooter: () => apiFetch<any>("/api/v1/cms/footer"),
  updateFooter: (data: unknown) => apiFetch<any>("/api/v1/cms/footer", { method: "PATCH", body: JSON.stringify(data) }),
  getMenus: () => apiFetch<any[]>("/api/v1/cms/menus"),
  updateMenus: (data: unknown) => apiFetch<any>("/api/v1/cms/menus", { method: "PUT", body: JSON.stringify(data) }),
  getPages: () => apiFetch<any[]>("/api/v1/cms/pages"),
  createPage: (data: unknown) => apiFetch<any>("/api/v1/cms/pages", { method: "POST", body: JSON.stringify(data) }),
  updatePage: (id: string, data: unknown) => apiFetch<any>(`/api/v1/cms/pages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePage: (id: string) => apiFetch<void>(`/api/v1/cms/pages/${id}`, { method: "DELETE" }),

  // ── Expenses ───────────────────────────────────────────────────────────────
  getExpenses: () => apiFetch<any[]>("/api/v1/expenses"),
  createExpense: (data: unknown) => apiFetch<any>("/api/v1/expenses", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (id: string, data: unknown) => apiFetch<any>(`/api/v1/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteExpense: (id: string) => apiFetch<void>(`/api/v1/expenses/${id}`, { method: "DELETE" }),

  // ── Shipping ───────────────────────────────────────────────────────────────
  getShipping: () => apiFetch<any>("/api/v1/settings/shipping"),
  updateShipping: (data: unknown) => apiFetch<any>("/api/v1/settings/shipping", { method: "PUT", body: JSON.stringify(data) }),

  // ── Invoice settings ───────────────────────────────────────────────────────
  getInvoiceSettings: () => apiFetch<any>("/api/v1/settings/invoice"),
  updateInvoiceSettings: (data: unknown) => apiFetch<any>("/api/v1/settings/invoice", { method: "PUT", body: JSON.stringify(data) }),

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications: () => apiFetch<any[]>("/api/v1/notifications"),
  markNotificationRead: (id: string) => apiFetch<void>(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),

  // ── Stock logs ────────────────────────────────────────────────────────────
  getStockLogs: (params = "") => apiFetch<any[]>(`/api/v1/stock-logs${params}`),
};
