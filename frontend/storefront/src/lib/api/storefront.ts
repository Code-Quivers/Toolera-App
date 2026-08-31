// Storefront API client — public endpoints
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

export const sfApi = {
  getProducts: (params = "") => apiFetch<any[]>(`/api/v1/products${params}`),
  getProduct: (slug: string) => apiFetch<any>(`/api/v1/products/${slug}`),

  getCategories: () => apiFetch<any[]>("/api/v1/categories"),

  getPages: () => apiFetch<any[]>("/api/v1/cms/pages"),
  getPage: (slug: string) => apiFetch<any>(`/api/v1/cms/pages/${slug}`),

  getHeader: () => apiFetch<any>("/api/v1/cms/header"),
  getFooter: () => apiFetch<any>("/api/v1/cms/footer"),
  getMenus: () => apiFetch<any[]>("/api/v1/cms/menus"),
  getShipping: () => apiFetch<any>("/api/v1/settings/shipping"),

  getReviews: (productId: string) => apiFetch<any[]>(`/api/v1/reviews?productId=${productId}`),
  submitReview: (data: unknown) => apiFetch<any>("/api/v1/reviews", { method: "POST", body: JSON.stringify(data) }),

  getCoupons: () => apiFetch<any[]>("/api/v1/coupons/public"),
  validateCoupon: (code: string) => apiFetch<any>(`/api/v1/coupons/validate/${code}`),

  createOrder: (data: unknown) => apiFetch<any>("/api/v1/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrder: (id: string) => apiFetch<any>(`/api/v1/orders/${id}`),

  getCustomerOrders: (customerId: string) => apiFetch<any[]>(`/api/v1/orders?customerId=${customerId}`),
};
