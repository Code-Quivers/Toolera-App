// Server-side API helpers — used in Next.js page.tsx (server components)
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || "";

export function storeQs(extra?: string): string {
  const parts: string[] = [];
  if (STORE_SLUG) parts.push(`storeSlug=${encodeURIComponent(STORE_SLUG)}`);
  if (extra) parts.push(extra);
  return parts.length ? `?${parts.join("&")}` : "";
}

// Normalize a raw API product so category is always a string and images always string[]
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

export async function ssrFetch<T = any>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

export async function fetchStoreInfo() {
  return ssrFetch<any>(`/api/v1/cms${storeQs()}`, 300);
}

export async function fetchProduct(slug: string) {
  const p = await ssrFetch<any>(`/api/v1/products/${slug}${storeQs()}`);
  return p ? normalizeProduct(p) : null;
}

export async function fetchProducts(extra?: string) {
  const data = await ssrFetch<any>(`/api/v1/products${storeQs(extra)}`);
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(normalizeProduct);
}

export async function fetchCategory(slug: string) {
  return ssrFetch<any>(`/api/v1/categories/${slug}${storeQs()}`);
}

export async function fetchCategories() {
  const data = await ssrFetch<any[]>(`/api/v1/categories${storeQs()}`, 300);
  return Array.isArray(data) ? data : [];
}
