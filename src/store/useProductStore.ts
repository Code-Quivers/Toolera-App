import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types";
import { idbStorage } from "@/lib/idbStorage";

export interface ExtendedProduct extends Product {
  costPrice?: number;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishDate?: string;
  lowStockThreshold?: number;
  deliveryType?: string;
  customDeliveryInsideDhaka?: string;
  customDeliveryOutsideDhaka?: string;
  returnPolicy?: string;
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedProductIds?: string[];
  showFlashSaleCountdown?: boolean;
  showBundleDiscounts?: boolean;
  createdAt?: string;
}

interface ProductStoreState {
  products: ExtendedProduct[];
  addProduct: (product: ExtendedProduct) => void;
  updateProduct: (id: string, updated: Partial<ExtendedProduct>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  quickEditProduct: (id: string, fields: Partial<ExtendedProduct>) => void;
  bulkAction: (ids: string[], action: "trending" | "featured" | "delete" | "publish" | "draft") => void;
  getProductBySlug: (slug: string) => ExtendedProduct | undefined;
  getProductById: (id: string) => ExtendedProduct | undefined;
}

const DEFAULT_PRODUCTS: ExtendedProduct[] = [];

// Synchronous 0ms Initial State Loader to eliminate any page refresh flash
function getInitialProducts(): ExtendedProduct[] {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  try {
    const keys = ["raifas_mart_product_store_v4", "raifas_mart_product_store_v3"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.products && Array.isArray(parsed.state.products)) {
          return parsed.state.products;
        }
      }
    }
  } catch {}
  return DEFAULT_PRODUCTS;
}

export const useProductStore = create<ProductStoreState>()(
  persist(
    (set, get) => ({
      products: getInitialProducts(),

      addProduct: (newProduct) => {
        set({ products: [newProduct, ...get().products] });
      },

      updateProduct: (id, updated) => {
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        });
      },

      deleteProduct: (id) => {
        set({
          products: get().products.filter((p) => p.id !== id),
        });
      },

      duplicateProduct: (id) => {
        const prod = get().products.find((p) => p.id === id);
        if (!prod) return;
        const newProd: ExtendedProduct = {
          ...prod,
          id: `prod-${Date.now()}`,
          title: `${prod.title} (Copy)`,
          slug: `${prod.slug}-copy-${Date.now().toString().slice(-4)}`,
          sku: `${prod.sku}-COPY`,
          createdAt: new Date().toISOString(),
        };
        set({ products: [newProd, ...get().products] });
      },

      quickEditProduct: (id, fields) => {
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...fields } : p)),
        });
      },

      bulkAction: (ids, action) => {
        if (action === "delete") {
          set({ products: get().products.filter((p) => !ids.includes(p.id)) });
        } else if (action === "trending") {
          set({
            products: get().products.map((p) =>
              ids.includes(p.id) ? { ...p, isTrending: true, badge: "TRENDING" as const } : p
            ),
          });
        } else if (action === "featured") {
          set({
            products: get().products.map((p) =>
              ids.includes(p.id) ? { ...p, isFeatured: true, badge: "HOT" as const } : p
            ),
          });
        } else if (action === "publish") {
          set({
            products: get().products.map((p) =>
              ids.includes(p.id) ? { ...p, status: "PUBLISHED" as const } : p
            ),
          });
        } else if (action === "draft") {
          set({
            products: get().products.map((p) =>
              ids.includes(p.id) ? { ...p, status: "DRAFT" as const } : p
            ),
          });
        }
      },

      getProductBySlug: (slug) => {
        return get().products.find((p) => p.slug === slug);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },
    }),
    {
      name: "raifas_mart_product_store_v4",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
