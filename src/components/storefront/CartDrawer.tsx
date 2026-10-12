"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { validateCouponCode } from "@/lib/data/supabaseCoupons";
import { useStoreSettings } from "@/lib/data/storeSettings";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const storeSettings = useStoreSettings();

  const {
    items,
    isOpen,
    appliedCoupon,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscountAmount,
    getFinalTotal,
    applyCoupon,
    removeCoupon,
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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    try {
      const subtotal = getSubtotal();
      const res = await validateCouponCode(code, subtotal);

      if (!res.valid || !res.coupon) {
        setCouponError(res.error || "Invalid coupon code.");
        return;
      }

      applyCoupon(res.coupon, res.discountAmount || 0);
      setCouponSuccess(`Coupon ${res.coupon.code} applied!`);
      setCouponInput("");
      setTimeout(() => setCouponSuccess(null), 3000);
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
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
        {(() => {
          const threshold = Number(storeSettings.freeDeliveryThreshold) || 2000;
          return (
            <div className="bg-brand-blush-subtle px-5 py-2.5 border-b border-brand-border/40 text-xs">
              {subtotal >= threshold ? (
                <p className="text-emerald-700 font-medium text-center">
                  🎉 Congratulations! You have unlocked <strong>Free Delivery</strong> in Dhaka!
                </p>
              ) : (
                <p className="text-brand-muted text-center">
                  Add <strong>{formatPrice(threshold - subtotal)}</strong> more for{" "}
                  <span className="text-brand-primary font-semibold">Free Delivery</span> in Dhaka.
                </p>
              )}
            </div>
          );
        })()}

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
          <div className="p-5 border-t border-brand-border bg-brand-ivory/50 space-y-3.5">
            {/* Coupon Code Redemption Section */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-blush/60 border border-brand-primary/30 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-brand-primary text-white">
                      <Tag className="w-3 h-3" />
                    </span>
                    <div>
                      <span className="font-mono font-bold tracking-wider text-brand-primary">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.discount_value}% discount applied`
                          : `${formatPrice(appliedCoupon.discount_value)} discount applied`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    title="Remove coupon"
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. ADORN50)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError(null);
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-mono uppercase focus:outline-none focus:border-brand-primary tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[64px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-in fade-in">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium animate-in fade-in">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      {couponSuccess}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Subtotal</span>
                <span className="font-medium text-brand-charcoal">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold animate-in fade-in">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Coupon Discount
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pt-2 border-t border-brand-border/60">
                <span className="font-semibold text-brand-charcoal">Total Amount</span>
                <span className="font-bold text-base text-brand-primary">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500">
              Taxes & standard delivery calculated at checkout (Inside Dhaka: ৳80 | Outside: ৳150).
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full py-1.5 text-xs text-brand-muted hover:text-brand-charcoal tracking-wide transition-colors uppercase font-medium cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
