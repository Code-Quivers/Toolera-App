// Storefront API client — public endpoints
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// Each storefront deployment sets NEXT_PUBLIC_STORE_SLUG to identify its store.
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || "";

// Normalize a raw API product so that `category` is always a string (name),
// `images` is always string[], and computed slug/name fields are present.
export function normalizeProduct(p: any): any {
  if (!p || typeof p !== "object") return p;
  const catRaw = p.category;
  const categoryName = typeof catRaw === "string" ? catRaw : catRaw?.name ?? "";
  const categorySlug = typeof catRaw === "string" ? (p.categorySlug ?? "") : (catRaw?.slug ?? p.categorySlug ?? "");
  const images: string[] = Array.isArray(p.images)
    ? p.images.map((img: any) => (typeof img === "string" ? img : img?.url ?? "")).filter(Boolean)
    : [];
  return {
    ...p,
    category: categoryName,
    categorySlug,
    images,
    name: p.title ?? p.name ?? "",
    title: p.title ?? p.name ?? "",
    rating: p.rating ?? p.calculatedRating ?? 0,
    reviewCount: p.reviewCount ?? p.calculatedReviewCount ?? 0,
    stock: p.stock ?? p.stockQuantity ?? 0,
  };
}

function slugParam() {
  return STORE_SLUG ? `?slug=${encodeURIComponent(STORE_SLUG)}` : "";
}

async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

function storeParam(extra = "") {
  const base = STORE_SLUG ? `storeSlug=${encodeURIComponent(STORE_SLUG)}` : "";
  if (!base) return extra ? `?${extra}` : "";
  return extra ? `?${base}&${extra}` : `?${base}`;
}

export const sfApi = {
  getProducts: (params = "") => {
    const qs = STORE_SLUG
      ? `?storeSlug=${encodeURIComponent(STORE_SLUG)}${params ? "&" + params.replace(/^\?/, "") : ""}`
      : params;
    return apiFetch<any[]>(`/api/v1/products${qs}`).then(list => (Array.isArray(list) ? list : []).map(normalizeProduct));
  },
  getProduct: (slug: string) => apiFetch<any>(`/api/v1/products/${slug}`).then(p => normalizeProduct(p)),

  getCategories: () => apiFetch<any[]>(`/api/v1/categories${storeParam()}`),

  getPages: () => apiFetch<any[]>(`/api/v1/cms/pages${slugParam()}`),
  getPage: (slug: string) => apiFetch<any>(`/api/v1/cms/pages/${slug}`),

  getCmsConfig: () => apiFetch<any>(`/api/v1/cms${slugParam()}`),
  getHeader: () => apiFetch<any>(`/api/v1/cms/header${slugParam()}`),
  getFooter: () => apiFetch<any>(`/api/v1/cms/footer${slugParam()}`),
  getMenus: () => apiFetch<any[]>(`/api/v1/cms/menus${slugParam()}`),
  getShipping: () => apiFetch<any>("/api/v1/settings/shipping"),

  getReviews: (productId: string) => apiFetch<any[]>(`/api/v1/reviews?productId=${productId}`),
  submitReview: (data: unknown) => apiFetch<any>("/api/v1/reviews", { method: "POST", body: JSON.stringify(data) }),

  getCoupons: () => apiFetch<any[]>("/api/v1/coupons/public"),
  validateCoupon: (code: string) => apiFetch<any>(`/api/v1/coupons/validate/${code}`),

  createOrder: (data: unknown) => apiFetch<any>(`/api/v1/orders${storeParam()}`, { method: "POST", body: JSON.stringify(data) }),
  getOrder: (id: string) => apiFetch<any>(`/api/v1/orders/${id}`),

  getCustomerOrders: (customerId: string) => apiFetch<any[]>(`/api/v1/orders?customerId=${customerId}`),
};
