"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "@/lib/types/product";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, quantity = 1, selectedColor) => {
        set((state) => {
          const colorKey = selectedColor || product.colors[0] || "Standard";
          const existingIndex = state.items.findIndex(
            (i) => i.product.id === product.id && i.selectedColor === colorKey
          );

          let updatedItems: CartItem[];

          if (existingIndex > -1) {
            updatedItems = state.items.map((item, index) => {
              if (index === existingIndex) {
                return {
                  ...item,
                  quantity: item.quantity + quantity,
                };
              }
              return item;
            });
          } else {
            updatedItems = [
              ...state.items,
              {
                product,
                quantity,
                selectedColor: colorKey,
              },
            ];
          }

          return {
            items: updatedItems,
            isOpen: true, // Automatically open cart drawer to give immediate feedback
          };
        });
      },

      removeItem: (productId: string, selectedColor?: string) => {
        set((state) => ({
          items: state.items.filter((item) => {
            const matchesId = item.product.id === productId;
            const matchesColor = selectedColor ? item.selectedColor === selectedColor : true;
            return !(matchesId && matchesColor);
          }),
        }));
      },

      updateQuantity: (productId: string, quantity: number, selectedColor?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedColor);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            const matchesId = item.product.id === productId;
            const matchesColor = selectedColor ? item.selectedColor === selectedColor : true;
            if (matchesId && matchesColor) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "adorn-cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not drawer visibility state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
