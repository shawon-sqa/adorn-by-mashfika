"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/formatters";
import { useCartStore } from "@/lib/store/useCartStore";
import { ProductCard } from "@/components/storefront/ProductCard";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Standard");
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedColor);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-brand-muted mb-8">
        <Link href="/" className="hover:text-brand-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/shop" className="hover:text-brand-primary transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link
          href={`/shop?category=${product.category}`}
          className="capitalize hover:text-brand-primary transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-brand-charcoal font-medium truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Gallery / Showcase */}
        <div className="space-y-4">
          <div
            className={`w-full aspect-square rounded-3xl bg-gradient-to-tr ${product.gradient} border border-brand-border/80 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-sm`}
          >
            {product.badge && (
              <span className="absolute top-5 left-5 bg-white/95 backdrop-blur-xs text-brand-charcoal text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {product.badge}
              </span>
            )}
            <button
              type="button"
              className="absolute top-5 right-5 p-2.5 bg-white/90 rounded-full text-zinc-500 hover:text-brand-primary hover:bg-white transition-all shadow-xs"
              aria-label="Add to Wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 p-6 max-w-sm">
              <Sparkles className="w-6 h-6 text-brand-champagne mx-auto animate-pulse" />
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-800 italic">
                {product.title}
              </h2>
              <p className="text-xs text-zinc-600 uppercase tracking-widest">
                Artisanal Boutique Craft
              </p>
            </div>
          </div>

          {/* Material & Feature tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {product.materials.map((mat) => (
              <span
                key={mat}
                className="text-[11px] bg-white border border-brand-border px-3 py-1 rounded-full text-zinc-600 font-medium"
              >
                ✓ {mat}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Information, Options, & Purchase */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
              {product.category} Collection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-1 tracking-tight">
              {product.title}
            </h1>
            <p className="text-sm text-zinc-500 font-light mt-1">
              {product.subtitle}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-brand-border/60">
            <span className="font-bold text-3xl text-brand-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Save {formatPrice(product.originalPrice - product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal block">
                Color Variation: <span className="text-brand-primary">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selectedColor === color
                        ? "border-brand-primary bg-brand-blush text-brand-primary shadow-xs"
                        : "border-brand-border bg-white text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                Quantity:
              </span>
              <div className="flex items-center border border-brand-border rounded-full bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-brand-primary rounded-l-full transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold text-brand-charcoal min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:text-brand-primary rounded-r-full transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-full bg-brand-charcoal text-white font-medium text-sm hover:bg-black transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                Order via Cash on Delivery
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Highlights */}
          <div className="border-t border-brand-border/60 pt-6 space-y-3 bg-brand-ivory/60 p-5 rounded-2xl">
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <Truck className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>Dhaka Delivery:</strong> 24–48 Hours (৳80). Outside Dhaka: 3–5 Days (৳150).
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>100% Quality Inspected:</strong> Anti-tarnish treated & luxury packaged.
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <RotateCcw className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>7-Day Easy Exchange:</strong> Hassle-free support for size or style issues.
              </span>
            </div>
          </div>

          {/* Key Product Details / Highlights list */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-3">
              Craftsmanship & Specifications:
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600">
              {product.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-primary font-bold mt-0.5">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-border/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
              Complete Your Look
            </h3>
            <Link
              href="/shop"
              className="text-xs font-medium text-brand-primary hover:underline"
            >
              View More Creations →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
