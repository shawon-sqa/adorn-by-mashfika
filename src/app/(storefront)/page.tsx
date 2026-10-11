"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock } from "lucide-react";
import { Product } from "@/lib/types/product";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { matchesCategory, CategoryFilter } from "@/app/(storefront)/shop/page";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    async function loadCatalog() {
      const all = await fetchSupabaseProducts();
      setProducts(all);
    }
    loadCatalog();
  }, []);

  const homeCategories: { label: string; value: CategoryFilter }[] = [
    { label: "All Collections", value: "all" },
    { label: "Necklaces", value: "necklaces" },
    { label: "Earrings", value: "earrings" },
    { label: "Bangles", value: "bangles" },
    { label: "Bridal Sets", value: "bridal" },
    { label: "Fashion", value: "fashion" },
  ];

  const displayedProducts = products.filter((p) => matchesCategory(p, activeCategory));

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F7] via-[#FAF8F5] to-[#FAF8F5] py-20 lg:py-32 border-b border-brand-border/40">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-blush rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-brand-champagne-light rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blush border border-brand-primary/20 text-brand-primary text-xs tracking-wider uppercase font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-champagne" />
            Autumn Festive Collection 2026
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-brand-charcoal tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Elegance in <span className="italic font-serif text-brand-primary">Every Detail</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-600 max-w-2xl mx-auto font-sans font-light leading-relaxed">
            Discover exquisite handcrafted jewelry, artisanal accessories, and bespoke contemporary fashion designed for modern elegance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?category=jewelry"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white border border-brand-border text-brand-charcoal font-medium text-sm hover:border-brand-primary/60 hover:text-brand-primary transition-all duration-200 shadow-sm"
            >
              Explore Jewelry
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Value Props */}
      <section className="py-12 bg-white border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Swift Nationwide Shipping</h4>
                <p className="text-xs text-zinc-500 mt-0.5">24-48 hrs in Dhaka, 3-5 days across all districts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Artisanal Quality Guaranteed</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Premium materials, anti-tarnish polishing</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Cash on Delivery & bKash</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Convenient payment methods at your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Collections & Dynamic Category Filtering Section from Supabase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary block mb-2">
              Curated by Mashfika
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal">
              All Collections
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Handpicked creations crafted with unmatched precision and timeless poise.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 group whitespace-nowrap self-start sm:self-auto"
          >
            View all creations ({products.length})
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {homeCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.value
                  ? "bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary/20 scale-[1.02]"
                  : "bg-white border border-brand-border text-brand-charcoal hover:bg-brand-blush hover:border-brand-primary/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Real-time Grid without jitter */}
        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border/60 py-16 px-4 text-center">
            <p className="font-serif text-lg text-brand-charcoal">No creations found in this collection</p>
            <p className="text-xs text-zinc-400 mt-1">
              Explore our other artisanal collections or view the full boutique catalog.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-6 py-2 rounded-full bg-brand-blush text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors"
            >
              View All Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
            {displayedProducts.slice(0, 6).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}

        {displayedProducts.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              href={`/shop?category=${activeCategory}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-brand-border hover:border-brand-primary text-brand-charcoal hover:text-brand-primary text-xs font-semibold tracking-wider uppercase transition-all shadow-xs"
            >
              Explore All {activeCategory !== "all" ? homeCategories.find((c) => c.value === activeCategory)?.label : ""} ({displayedProducts.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
