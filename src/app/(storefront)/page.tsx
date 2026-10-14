"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Clock } from "lucide-react";
import { Product } from "@/lib/types/product";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { matchesCategory, CategoryFilter } from "@/app/(storefront)/shop/page";
import { Hero } from "@/components/storefront/Hero";
import { SortDropdown, SortOption } from "@/components/storefront/SortDropdown";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

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

  const displayedProducts = products
    .filter((p) => matchesCategory(p, activeCategory))
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="w-full bg-[#FAF7F5]">
      {/* Luxury Split-Screen Hero */}
      <Hero />

      {/* Brand Value Props / Luxury Trust Strip */}
      <section className="py-12 bg-[#FAF7F5] border-b border-[#EAE3DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl bg-white/70 hover:bg-white border border-[#EAE3DE] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#D4A373]/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#4A1525]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#4A1525] flex-shrink-0 shadow-xs">
                <Truck className="w-5 h-5 text-[#4A1525]" />
              </div>
              <div>
                <h4 className="font-serif text-[#240610] font-medium text-sm sm:text-base tracking-tight">Swift Nationwide Shipping</h4>
                <p className="text-xs text-zinc-600 mt-0.5 font-light leading-relaxed">24-48 hrs in Dhaka, 3-5 days across all districts</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 hover:bg-white border border-[#EAE3DE] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#D4A373]/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#4A1525]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#4A1525] flex-shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#4A1525]" />
              </div>
              <div>
                <h4 className="font-serif text-[#240610] font-medium text-sm sm:text-base tracking-tight">Artisanal Quality Guaranteed</h4>
                <p className="text-xs text-zinc-600 mt-0.5 font-light leading-relaxed">Premium materials, anti-tarnish polishing</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 hover:bg-white border border-[#EAE3DE] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#D4A373]/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#4A1525]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#4A1525] flex-shrink-0 shadow-xs">
                <Clock className="w-5 h-5 text-[#4A1525]" />
              </div>
              <div>
                <h4 className="font-serif text-[#240610] font-medium text-sm sm:text-base tracking-tight">Cash on Delivery & bKash</h4>
                <p className="text-xs text-zinc-600 mt-0.5 font-light leading-relaxed">Convenient payment methods at your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Collections & Dynamic Category Filtering Section from Supabase */}
      <section id="products" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-serif font-semibold tracking-[0.25em] uppercase text-[#D4A373] block mb-2">
              ✦ CURATED BY MASHFIKA
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#240610] tracking-tight">
              All Collections
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-light leading-relaxed">
              Handpicked creations crafted with unmatched precision and timeless poise.
            </p>
          </div>
          <Link
            href="/shop"
            className="border border-[#D4A373] text-[#4A1525] hover:bg-[#4A1525] hover:text-[#F3E5D8] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 group whitespace-nowrap self-start sm:self-auto shadow-2xs hover:shadow-md cursor-pointer"
          >
            <span>View all creations ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Filter Pills & Custom Luxury Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
            {homeCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.value
                    ? "bg-[#4A1525] text-white shadow-md shadow-[#4A1525]/20 ring-2 ring-[#4A1525]/20 scale-[1.02]"
                    : "bg-[#FAF7F5] border border-[#E7DFD8] text-[#554348] hover:border-[#D4A373] hover:text-[#4A1525]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="self-end sm:self-auto shrink-0">
            <SortDropdown value={sortBy} onChange={(val) => setSortBy(val)} />
          </div>
        </div>

        {/* Real-time Grid without jitter */}
        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#F0EAE5] py-16 px-4 text-center">
            <p className="font-serif text-lg text-[#240610]">No creations found in this collection</p>
            <p className="text-xs text-zinc-400 mt-1">
              Explore our other artisanal collections or view the full boutique catalog.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-4 px-6 py-2 rounded-full bg-[#FAF7F5] border border-[#E7DFD8] text-[#4A1525] text-xs font-semibold hover:bg-[#4A1525] hover:text-white transition-colors"
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
              className="inline-flex items-center gap-2 border border-[#D4A373] text-[#4A1525] hover:bg-[#4A1525] hover:text-[#F3E5D8] px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
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
