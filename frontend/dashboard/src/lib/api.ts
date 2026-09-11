// Central API client for dashboard
import { getAuthHeader, clearAdminToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Active store slug — set by the admin layout when the store is known.
// Appended as ?storeSlug= to product/category/order reads so the business
// service can resolve the correct store without relying on auth-token fallback.
let _dashboardSlug = "";
const _slugListeners = new Set<(slug: string) => void>();
export function getDashboardStoreSlug(): string { return _dashboardSlug; }
export function onDashboardSlugSet(cb: (slug: string) => void): () => void {
  _slugListeners.add(cb);
  return () => _slugListeners.delete(cb);
}
export function setDashboardStoreSlug(slug: string) {
  _dashboardSlug = slug;
  _slugListeners.forEach(cb => cb(slug));
}
function sq(extra = "") {
  const base = _dashboardSlug ? `storeSlug=${encodeURIComponent(_dashboardSlug)}` : "";
  if (!base && !extra) return "";
  if (!base) return `?${extra}`;
  return extra ? `?${base}&${extra}` : `?${base}`;
}

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
  if (res.status === 401) {
    clearAdminToken();
    if (typeof window !== "undefined") {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(json?.message || `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

export const api = {
  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: (params = "") => apiFetch<any[]>(`/api/v1/products${sq(params.replace(/^\?/, ""))}`),
  getProduct: (id: string) => apiFetch<any>(`/api/v1/products/${id}`),
  createProduct: (data: unknown) => apiFetch<any>("/api/v1/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: unknown) => apiFetch<any>(`/api/v1/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch<void>(`/api/v1/products/${id}`, { method: "DELETE" }),

  // ── Categories ─────────────────────────────────────────────────────────────
  getCategories: () => apiFetch<any[]>(`/api/v1/categories${sq()}`),
  createCategory: (data: unknown) => apiFetch<any>("/api/v1/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: unknown) => apiFetch<any>(`/api/v1/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => apiFetch<void>(`/api/v1/categories/${id}`, { method: "DELETE" }),

  // ── Orders ─────────────────────────────────────────────────────────────────
  getOrders: (params = "") => apiFetch<any[]>(`/api/v1/orders${params}`),
  getOrder: (id: string) => apiFetch<any>(`/api/v1/orders/${id}`),
  createOrder: (data: unknown) => apiFetch<any>("/api/v1/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) => apiFetch<any>(`/api/v1/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateOrderTracking: (id: string, trackingCode: string) => apiFetch<any>(`/api/v1/orders/${id}/tracking`, { method: "PATCH", body: JSON.stringify({ trackingCode }) }),
  deleteOrder: (id: string) => apiFetch<void>(`/api/v1/orders/${id}`, { method: "DELETE" }),

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
  getMedia: () => apiFetch<any[]>("/api/v1/upload/media"),
  uploadMedia: (form: FormData) => {
    const headers = getAuthHeader();
    return fetch(`${BASE}/api/v1/upload/single`, { method: "POST", headers, body: form }).then(r => r.json());
  },
  uploadMultipleMedia: (form: FormData) => {
    const headers = getAuthHeader();
    return fetch(`${BASE}/api/v1/upload/multiple`, { method: "POST", headers, body: form }).then(r => r.json());
  },
  deleteMedia: (id: string) => apiFetch<void>(`/api/v1/upload/media/${id}`, { method: "DELETE" }),

  // ── Store settings ─────────────────────────────────────────────────────────
  getStore: () => apiFetch<any>("/api/v1/stores/me"),
  updateStore: (data: unknown) => apiFetch<any>("/api/v1/stores/me", { method: "PATCH", body: JSON.stringify(data) }),

  // ── Subscription ───────────────────────────────────────────────────────────
  getPlans: () => apiFetch<any[]>("/api/v1/subscriptions/plans"),
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
  getStockLogs: (params = "") => apiFetch<any[]>(`/api/v1/stock-logs${sq(params.replace(/^\?/, ""))}`),
  createStockLog: (data: unknown) => apiFetch<any>(`/api/v1/stock-logs${sq()}`, { method: "POST", body: JSON.stringify(data) }),

  // ── CMS config (SEO / pixels) ─────────────────────────────────────────────
  getCmsConfig: () => apiFetch<any>("/api/v1/settings/cms"),
  updateCmsConfig: (data: unknown) => apiFetch<any>("/api/v1/settings/cms", { method: "PUT", body: JSON.stringify(data) }),
  updateSeoSettings: (data: unknown) => apiFetch<any>("/api/v1/settings/seo", { method: "PUT", body: JSON.stringify(data) }),

  // ── Courier / delivery ────────────────────────────────────────────────────
  getCourierSettings: () => apiFetch<any>("/api/v1/settings/courier"),
  updateCourierSettings: (data: unknown) => apiFetch<any>("/api/v1/settings/courier", { method: "PUT", body: JSON.stringify(data) }),
  getCourierBalance: () => apiFetch<any>("/api/v1/settings/courier/balance"),
  testPathaoConnection: () => apiFetch<any>("/api/v1/settings/courier/test-pathao"),

  // ── SMS gateway ───────────────────────────────────────────────────────────
  getSmsSettings: () => apiFetch<any>("/api/v1/settings/sms"),
  updateSmsSettings: (data: unknown) => apiFetch<any>("/api/v1/settings/sms", { method: "PUT", body: JSON.stringify(data) }),
  getSmsBalance: () => apiFetch<any>("/api/v1/settings/sms/balance"),
  sendTestSms: (phone: string, message: string) => apiFetch<any>("/api/v1/settings/sms/test", { method: "POST", body: JSON.stringify({ phone, message }) }),

  // ── Payment gateways ──────────────────────────────────────────────────────
  getPaymentSettings: () => apiFetch<any>("/api/v1/settings/payment"),
  updatePaymentSettings: (data: unknown) => apiFetch<any>("/api/v1/settings/payment", { method: "PUT", body: JSON.stringify(data) }),

  // ── Backup / restore ──────────────────────────────────────────────────────
  exportBackup: () => apiFetch<any>("/api/v1/settings/backup/export"),
  restoreBackup: (data: unknown) => apiFetch<any>("/api/v1/settings/backup/restore", { method: "POST", body: JSON.stringify(data) }),

  // ── Abandoned leads ───────────────────────────────────────────────────────
  getAbandonedLeads: (params = "") => apiFetch<any>(`/api/v1/abandoned-leads${params}`),
  markLeadRecovered: (id: string) => apiFetch<any>(`/api/v1/abandoned-leads/${id}/recovered`, { method: "PATCH" }),

  // ── Courier booking / tracking ────────────────────────────────────────────
  bookCourier: (data: unknown) => apiFetch<any>("/api/v1/courier/book", { method: "POST", body: JSON.stringify(data) }),
  trackCourier: (trackingId: string) => apiFetch<any>(`/api/v1/courier/track/${trackingId}`),

  // ── Bulk product operations ───────────────────────────────────────────────
  bulkUpdateProducts: (data: unknown) => apiFetch<any>("/api/v1/products/bulk", { method: "PATCH", body: JSON.stringify(data) }),
};
