import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount?: number;
  description?: string;
}

interface CategoryStoreState {
  categories: CategoryItem[];
  addCategory: (category: CategoryItem) => void;
  updateCategory: (id: string, updated: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  getCategoryBySlug: (slug: string) => CategoryItem | undefined;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [];

// Synchronous 0ms Initial State Loader to eliminate any page refresh flash
function getInitialCategories(): CategoryItem[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const keys = ["raifas_mart_categories_v4", "raifas_mart_categories_v3"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.categories && Array.isArray(parsed.state.categories)) {
          return parsed.state.categories;
        }
      }
    }
  } catch {}
  return DEFAULT_CATEGORIES;
}

export const useCategoryStore = create<CategoryStoreState>()(
  persist(
    (set, get) => ({
      categories: getInitialCategories(),

      addCategory: (newCategory) => {
        set({ categories: [newCategory, ...get().categories] });
      },

      updateCategory: (id, updated) => {
        set({
          categories: get().categories.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        });
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((c) => c.id !== id),
        });
      },

      getCategoryBySlug: (slug) => {
        return get().categories.find((c) => c.slug === slug);
      },
    }),
    {
      name: "raifas_mart_categories_v4",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
