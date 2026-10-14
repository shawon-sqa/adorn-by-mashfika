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
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#F0EAE5] flex flex-col relative transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-[#4A1525]/8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-3 inset-x-3 z-30 bg-[#240610]/95 backdrop-blur-xs text-white text-[11px] font-medium p-2.5 rounded-xl shadow-lg border border-[#D4A373]/40 text-center animate-in fade-in slide-in-from-top-1">
          {toastMessage}
        </div>
      )}

      {/* Visual Image / 1:1 Square Ratio with Soft Zoom on Hover */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F5]">
        <Link
          href={`/shop/${product.slug}`}
          className={`block w-full h-full bg-gradient-to-tr ${product.gradient} flex items-center justify-center p-6 overflow-hidden cursor-pointer`}
        >
          {/* Real uploaded product image if present */}
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out ${isSoldOut ? "opacity-75 grayscale-25" : "group-hover:scale-105"
                }`}
            />
          ) : (
            /* Mock Product Title Display */
            <div className="text-center p-4">
              <span className="font-serif text-[#240610]/70 italic text-lg sm:text-xl block group-hover:scale-105 transition-transform duration-300">
                {product.title}
              </span>
              <span className="text-[11px] text-[#9A7079] uppercase tracking-widest block mt-1 font-medium">
                {product.materials[0] || "Artisanal Selection"}
              </span>
            </div>
          )}
        </Link>

        {/* Badges: Sold Out, Discount Percentage, or Promo Badge */}
        {isSoldOut ? (
          <span className="absolute top-3 left-3 bg-[#240610]/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10 pointer-events-none flex items-center gap-1 border border-white/20">
            <Ban className="w-3 h-3 text-[#D4A373]" />
            Sold Out
          </span>
        ) : product.originalPrice && product.originalPrice > product.price ? (
          <span className="absolute top-3 left-3 bg-[#4A1525] text-[#F3E5D8] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#D4A373]/30 uppercase tracking-wider shadow-sm z-10 pointer-events-none">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-[#4A1525] text-[#F3E5D8] border border-[#D4A373]/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs z-10 pointer-events-none">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist Love Button: Glassmorphism pill button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-[#4A1525] transition-all duration-200 shadow-xs z-20 cursor-pointer border border-white/40 group/heart active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${favorited
                ? "text-[#4A1525] fill-[#4A1525] scale-110"
                : "text-[#554348] group-hover/heart:text-[#4A1525]"
              }`}
          />
        </button>

        {/* Action Floating Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform translate-y-1 group-hover:translate-y-0">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleQuickAdd}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all ${isSoldOut
                ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                : "bg-[#4A1525] text-[#F3E5D8] hover:bg-[#3B0E1B] border border-[#D4A373]/40 cursor-pointer hover:shadow-lg active:scale-95"
              }`}
          >
            {isSoldOut ? (
              "Sold Out"
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="p-2 bg-white/95 text-[#4A1525] rounded-full shadow-md hover:bg-white hover:text-[#240610] transition-colors flex items-center justify-center border border-[#D4A373]/30"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wider text-[#9A7079] font-medium">
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
          className="font-serif text-base text-[#240610] group-hover:text-[#4A1525] transition-colors line-clamp-1 mb-1 leading-snug"
        >
          {product.title}
        </Link>

        <p className="text-xs text-zinc-500 line-clamp-1 mb-4 font-light leading-relaxed">
          {product.subtitle}
        </p>

        <div className="mt-auto flex items-baseline justify-between pt-3 border-t border-[#F0EAE5]">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[#240610] text-base font-sans">
              ৳ {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                ৳ {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSoldOut
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "text-emerald-800 bg-emerald-50/80 border border-emerald-200/60"
              }`}
          >
            {isSoldOut ? "Sold Out" : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}
