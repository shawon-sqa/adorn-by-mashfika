"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, CartItem } from "@/lib/types/product";
import { SupabaseCoupon } from "@/lib/types/supabase";
import {
  getOrCreateCartSessionId,
  syncCartToSupabase,
} from "@/lib/utils/cartTracker";

export interface AppliedCouponState {
  code: string;
  type: "percentage" | "fixed";
  discount_value: number;
  discountAmount: number;
  min_order_amount?: number | null;
}

interface CartStore {
  sessionId: string;
  shopperName: string;
  shopperPhone: string;
  shopperEmail: string;
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCouponState | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setShopperDetails: (details: { name?: string; phone?: string; email?: string }) => void;
  addItem: (product: Product, quantity?: number, selectedColor?: string) => { success: boolean; message?: string };
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => { success: boolean; message?: string };
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
  applyCoupon: (coupon: SupabaseCoupon, discountAmount?: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      sessionId: getOrCreateCartSessionId(),
      shopperName: "",
      shopperPhone: "",
      shopperEmail: "",
      items: [],
      isOpen: false,
      appliedCoupon: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setShopperDetails: (details) => {
        set((state) => ({
          shopperName: details.name !== undefined ? details.name : state.shopperName,
          shopperPhone: details.phone !== undefined ? details.phone : state.shopperPhone,
          shopperEmail: details.email !== undefined ? details.email : state.shopperEmail,
        }));

        // Immediately trigger background sync
        const state = get();
        try {
          syncCartToSupabase({
            sessionId: state.sessionId,
            shopperName: details.name !== undefined ? details.name : state.shopperName,
            shopperPhone: details.phone !== undefined ? details.phone : state.shopperPhone,
            shopperEmail: details.email !== undefined ? details.email : state.shopperEmail,
            items: state.items.map((i) => ({
              id: i.product.id,
              title: i.product.title,
              price: i.product.price,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
              color: i.selectedColor,
              imageUrl: i.product.images?.[0],
              image: i.product.images?.[0],
            })),
            cartTotal: state.getSubtotal(),
            status: state.items.length > 0 ? "ACTIVE" : "ABANDONED",
          });
        } catch (err) {
          console.error("[CartStore] setShopperDetails syncCartToSupabase failed:", err);
        }
      },

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

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;
        const subtotal = get().getSubtotal();
        if (appliedCoupon.min_order_amount && subtotal < appliedCoupon.min_order_amount) {
          return 0;
        }
        if (appliedCoupon.type === "percentage") {
          return Math.round((subtotal * appliedCoupon.discount_value) / 100);
        }
        return Math.min(appliedCoupon.discount_value, subtotal);
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      applyCoupon: (coupon: SupabaseCoupon, explicitDiscountAmount?: number) => {
        const subtotal = get().getSubtotal();
        const computedDiscount =
          coupon.type === "percentage"
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : Math.min(coupon.discount_value, subtotal);

        set({
          appliedCoupon: {
            code: coupon.code,
            type: coupon.type,
            discount_value: coupon.discount_value,
            discountAmount: explicitDiscountAmount !== undefined ? explicitDiscountAmount : computedDiscount,
            min_order_amount: coupon.min_order_amount,
          },
        });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },
    }),
    {
      name: "adorn-cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist items, coupon, and shopper lead info across pages and reloads
      partialize: (state) => ({
        sessionId: state.sessionId,
        shopperName: state.shopperName,
        shopperPhone: state.shopperPhone,
        shopperEmail: state.shopperEmail,
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined" && state.items.length > 0) {
          try {
            syncCartToSupabase({
              sessionId: state.sessionId,
              shopperName: state.shopperName,
              shopperPhone: state.shopperPhone,
              shopperEmail: state.shopperEmail,
              items: state.items.map((i) => ({
                id: i.product.id,
                title: i.product.title,
                price: i.product.price,
                quantity: i.quantity,
                selectedColor: i.selectedColor,
                color: i.selectedColor,
                imageUrl: i.product.images?.[0],
                image: i.product.images?.[0],
              })),
              cartTotal: state.getSubtotal(),
              status: "ACTIVE",
            }).catch((err) => {
              console.error("[CartStore] Rehydration sync failed:", err);
            });
          } catch (err) {
            console.error("[CartStore] Rehydration exception:", err);
          }
        }
      },
    }
  )
);

// Subscribe to store updates to synchronize active cart to abandoned_carts on item mutations
if (typeof window !== "undefined") {
  let syncTimeout: any = null;
  useCartStore.subscribe((state, prevState) => {
    if (state.items !== prevState.items) {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        try {
          syncCartToSupabase({
            sessionId: state.sessionId,
            shopperName: state.shopperName,
            shopperPhone: state.shopperPhone,
            shopperEmail: state.shopperEmail,
            items: state.items.map((i) => ({
              id: i.product.id,
              title: i.product.title,
              price: i.product.price,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
              color: i.selectedColor,
              imageUrl: i.product.images?.[0],
              image: i.product.images?.[0],
            })),
            cartTotal: state.getSubtotal(),
            status: state.items.length > 0 ? "ACTIVE" : "ABANDONED",
          }).catch((err) => {
            console.error("[CartStore] Items mutation sync failed:", err);
          });
        } catch (err) {
          console.error("[CartStore] Subscription sync exception:", err);
        }
      }, 300);
    }
  });
}
