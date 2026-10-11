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
  addItem: (product: Product, quantity?: number, selectedColor?: string) => { success: boolean; message?: string };
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => { success: boolean; message?: string };
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
        const colorKey = selectedColor || product.colors[0] || "Standard";

        // Check if selected color variant is explicitly marked out of stock
        if (product.colorVariants && product.colorVariants.length > 0) {
          const variant = product.colorVariants.find(
            (v) => v.name.toLowerCase() === colorKey.toLowerCase()
          );
          if (variant && !variant.inStock) {
            return {
              success: false,
              message: `Sorry, ${product.title} in "${colorKey}" is currently sold out.`,
            };
          }
        }

        // Check overall product stock
        const availableStock = product.stockCount ?? (product.inStock ? 99 : 0);
        if (availableStock <= 0 || !product.inStock) {
          return {
            success: false,
            message: `Sorry, "${product.title}" is currently sold out.`,
          };
        }

        const state = get();
        const existingIndex = state.items.findIndex(
          (i) => i.product.id === product.id && i.selectedColor === colorKey
        );

        const currentQtyInCart = existingIndex > -1 ? state.items[existingIndex].quantity : 0;
        const requestedTotalQty = currentQtyInCart + quantity;

        if (requestedTotalQty > availableStock) {
          return {
            success: false,
            message: `Only ${availableStock} unit(s) of "${product.title}" available in stock.`,
          };
        }

        let updatedItems: CartItem[];

        if (existingIndex > -1) {
          updatedItems = state.items.map((item, index) => {
            if (index === existingIndex) {
              return {
                ...item,
                quantity: requestedTotalQty,
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

        set({
          items: updatedItems,
          isOpen: true,
        });

        return { success: true };
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
          return { success: true };
        }

        const state = get();
        const itemToUpdate = state.items.find((item) => {
          const matchesId = item.product.id === productId;
          const matchesColor = selectedColor ? item.selectedColor === selectedColor : true;
          return matchesId && matchesColor;
        });

        if (itemToUpdate) {
          const maxStock = itemToUpdate.product.stockCount ?? (itemToUpdate.product.inStock ? 99 : 0);
          if (quantity > maxStock) {
            return {
              success: false,
              message: `Cannot add more than ${maxStock} unit(s) in stock.`,
            };
          }
        }

        set((s) => ({
          items: s.items.map((item) => {
            const matchesId = item.product.id === productId;
            const matchesColor = selectedColor ? item.selectedColor === selectedColor : true;
            if (matchesId && matchesColor) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));

        return { success: true };
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
