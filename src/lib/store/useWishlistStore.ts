"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/lib/types/product";

interface WishlistStore {
  favoriteIds: string[];
  savedProducts: Product[];
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleFavorite: (product: Product | string) => void;
  isFavorite: (productId: string) => boolean;
  getTotalFavorites: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      savedProducts: [],
      isOpen: false,

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      toggleWishlistDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

      toggleFavorite: (target: Product | string) => {
        const id = typeof target === "string" ? target : target.id;
        const state = get();
        const exists = state.favoriteIds.includes(id);

        if (exists) {
          set({
            favoriteIds: state.favoriteIds.filter((item) => item !== id),
            savedProducts: state.savedProducts.filter((p) => p.id !== id),
          });
        } else {
          set({
            favoriteIds: [...state.favoriteIds, id],
            savedProducts:
              typeof target !== "string"
                ? [...state.savedProducts, target]
                : state.savedProducts,
          });
        }
      },

      isFavorite: (productId: string) => {
        return get().favoriteIds.includes(productId);
      },

      getTotalFavorites: () => {
        return get().favoriteIds.length;
      },
    }),
    {
      name: "adorn-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteIds: state.favoriteIds,
        savedProducts: state.savedProducts,
      }),
    }
  )
);
