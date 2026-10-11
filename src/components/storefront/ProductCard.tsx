"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, Heart, Ban } from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/formatters";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { StarRating } from "@/components/storefront/StarRating";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useWishlistStore();
  const favorited = isFavorite(product.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSoldOut = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) {
      showToast("Sorry, this creation is currently sold out.");
      return;
    }

    const res = addItem(product, 1);
    if (!res.success) {
      showToast(res.message || "Sorry, this creation is currently sold out.");
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-brand-border/80 card-hover flex flex-col relative transition-all duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-3 inset-x-3 z-30 bg-brand-charcoal/95 backdrop-blur-xs text-white text-[11px] font-medium p-2.5 rounded-xl shadow-lg border border-rose-500/30 text-center animate-in fade-in slide-in-from-top-1">
          {toastMessage}
        </div>
      )}

      {/* Visual Image / Gradient area */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        <Link
          href={`/shop/${product.slug}`}
          className={`block w-full h-full bg-gradient-to-tr ${product.gradient} flex items-center justify-center p-6 overflow-hidden cursor-pointer`}
        >
          {/* Real uploaded product image if present */}
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                isSoldOut ? "opacity-75 grayscale-25" : "group-hover:scale-105"
              }`}
            />
          ) : (
            /* Mock Product Title Display */
            <div className="text-center p-4">
              <span className="font-serif text-zinc-700/70 italic text-lg sm:text-xl block group-hover:scale-105 transition-transform duration-300">
                {product.title}
              </span>
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest block mt-1">
                {product.materials[0] || "Artisanal Selection"}
              </span>
            </div>
          )}
        </Link>

        {/* Badges: Sold Out or Promo Badge */}
        {isSoldOut ? (
          <span className="absolute top-3 left-3 bg-rose-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10 pointer-events-none flex items-center gap-1">
            <Ban className="w-3 h-3" />
            Sold Out
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-brand-charcoal text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs z-10 pointer-events-none">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist Love Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-zinc-600 hover:text-brand-primary transition-all duration-200 shadow-xs z-20 cursor-pointer group/heart active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              favorited
                ? "text-rose-600 fill-rose-600 scale-110"
                : "text-zinc-500 group-hover/heart:text-rose-500"
            }`}
          />
        </button>

        {/* Quick Action Floating Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleQuickAdd}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-full shadow-md flex items-center justify-center gap-1.5 transition-colors ${
              isSoldOut
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : "bg-brand-primary text-white hover:bg-brand-primary-hover cursor-pointer"
            }`}
          >
            {isSoldOut ? (
              "Sold Out"
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Quick Add
              </>
            )}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="p-2 bg-white/90 text-brand-charcoal rounded-full shadow-md hover:bg-white transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">
            {product.category}
          </span>
          <StarRating
            rating={product.rating || 4.9}
            reviewCount={product.reviewCount || 18}
            showCount={false}
            size="sm"
          />
        </div>

        <Link
          href={`/shop/${product.slug}`}
          className="font-serif text-base text-brand-charcoal group-hover:text-brand-primary transition-colors line-clamp-1 mb-1"
        >
          {product.title}
        </Link>

        <p className="text-xs text-zinc-500 line-clamp-1 mb-4 font-light">
          {product.subtitle}
        </p>

        <div className="mt-auto flex items-baseline justify-between pt-3 border-t border-brand-border/40">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-brand-charcoal text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isSoldOut
                ? "bg-rose-50 text-rose-700 font-semibold border border-rose-200"
                : "text-emerald-700 bg-emerald-50"
            }`}
          >
            {isSoldOut ? "Sold Out" : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}
