"use client";

import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/formatters";
import { useCartStore } from "@/lib/store/useCartStore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-brand-border/80 card-hover flex flex-col relative transition-all duration-300">
      {/* Visual Image / Gradient area */}
      <Link
        href={`/shop/${product.slug}`}
        className={`relative h-64 sm:h-72 w-full bg-gradient-to-tr ${product.gradient} flex items-center justify-center p-6 overflow-hidden cursor-pointer`}
      >
        {/* Real uploaded product image if present */}
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-brand-charcoal text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs z-10">
            {product.badge}
          </span>
        )}

        {/* Quick Action Floating Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-3 bg-brand-primary text-white text-xs font-semibold rounded-full shadow-md hover:bg-brand-primary-hover flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Quick Add
          </button>
          <span className="p-2 bg-white/90 text-brand-charcoal rounded-full shadow-md hover:bg-white transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium mb-1">
          {product.category}
        </span>

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
            className={`text-[11px] font-medium ${
              product.inStock ? "text-emerald-700" : "text-zinc-400"
            }`}
          >
            {product.inStock ? "In Stock" : "Sold Out"}
          </span>
        </div>
      </div>
    </div>
  );
}
