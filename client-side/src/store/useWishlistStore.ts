import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

import { triggerSoftAction } from "./useSoftLoadingStore";

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((item) => item.id === product.id);

        if (exists) {
          triggerSoftAction("Removed from wishlist", 250);
          set({ items: currentItems.filter((item) => item.id !== product.id) });
        } else {
          triggerSoftAction("Saved to wishlist ♥", 300);
          set({ items: [...currentItems, product] });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "raifas_mart_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
