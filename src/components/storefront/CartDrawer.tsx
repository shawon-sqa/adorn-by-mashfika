"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const totalCount = getTotalItems();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-primary" />
            <h2 className="font-serif text-lg tracking-wide text-brand-charcoal">
              Your Shopping Bag
            </h2>
            <span className="text-xs bg-brand-blush text-brand-primary font-semibold px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-zinc-400 hover:text-brand-charcoal rounded-full hover:bg-zinc-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-brand-blush-subtle px-5 py-2.5 border-b border-brand-border/40 text-xs">
          {subtotal >= 2000 ? (
            <p className="text-emerald-700 font-medium text-center">
              🎉 Congratulations! You have unlocked <strong>Free Delivery</strong> in Dhaka!
            </p>
          ) : (
            <p className="text-brand-muted text-center">
              Add <strong>{formatPrice(2000 - subtotal)}</strong> more for{" "}
              <span className="text-brand-primary font-semibold">Free Delivery</span> in Dhaka.
            </p>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-brand-border/60">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary mb-4">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <p className="font-serif text-lg text-brand-charcoal">Your bag is empty</p>
              <p className="text-xs text-zinc-400 max-w-xs mt-1">
                Explore our handcrafted jewelry & boutique collection to find your statement piece.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-brand-primary-hover transition-colors shadow-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product.id}-${item.selectedColor}-${idx}`} className="pt-4 first:pt-0 flex gap-4">
                {/* Visual Thumbnail */}
                <div className="w-20 h-20 rounded-xl border border-brand-border/60 flex-shrink-0 overflow-hidden relative bg-brand-ivory flex items-center justify-center">
                  {item.product.images && item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-tr ${item.product.gradient} flex items-center justify-center p-2 text-center`}
                    >
                      <span className="font-serif text-[11px] text-zinc-700/70 italic line-clamp-2">
                        {item.product.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-sm text-brand-charcoal leading-snug line-clamp-1">
                        {item.product.title}
                      </h4>
                      {item.selectedColor && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-[10px] font-medium bg-brand-blush text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20">
                            Color: {item.selectedColor}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedColor)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold text-brand-charcoal text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-brand-border rounded-full bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                        }
                        className="p-1 hover:text-brand-primary rounded-l-full transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-brand-charcoal min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                        }
                        className="p-1 hover:text-brand-primary rounded-r-full transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-brand-ivory/50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="font-bold text-base text-brand-charcoal">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Taxes & standard delivery calculated at checkout (Inside Dhaka: ৳80 | Outside: ৳150).
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full py-2 text-xs text-brand-muted hover:text-brand-charcoal tracking-wide transition-colors uppercase font-medium"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
