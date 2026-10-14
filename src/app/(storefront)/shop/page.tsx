"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { Product } from "@/lib/types/product";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SortDropdown, SortOption } from "@/components/storefront/SortDropdown";

export type CategoryFilter =
  | "all"
  | "necklaces"
  | "earrings"
  | "bangles"
  | "bridal"
  | "fashion"
  | "jewelry"
  | "accessories";

export function matchesCategory(product: Product, cat: string): boolean {
  if (!cat || cat === "all") return true;
  const pCat = (product.category || "").toLowerCase();
  const text = `${product.title} ${product.subtitle} ${product.description} ${(product.materials || []).join(" ")}`.toLowerCase();

  switch (cat) {
    case "necklaces":
      return pCat === "necklaces" || /necklace|choker|haar|pendant|dori/.test(text);
    case "earrings":
      return pCat === "earrings" || /earring|jhumka|jhumki|stud|chandelier/.test(text);
    case "bangles":
      return pCat === "bangles" || /bangle|bracelet|ring|kada|cuff/.test(text);
    case "bridal":
      return pCat === "bridal" || pCat === "bridal sets" || /bridal|wedding|kundan royal|choker set/.test(text);
    case "fashion":
      return pCat === "fashion" || /fashion|dupatta|kurti|jacket|silk|saree|dress/.test(text);
    case "jewelry":
      return pCat === "jewelry" || /jewelry|jewellery|gold|silver|necklace|earring|choker|jhumka|ring/.test(text);
    case "accessories":
      return pCat === "accessories" || /clutch|potli|comb|hair|bag|purse|accessory|accessories/.test(text);
    default:
      return pCat === cat || text.includes(cat.toLowerCase());
  }
}

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CategoryFilter) || "all";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlCategory = searchParams.get("category") as CategoryFilter;
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    const urlQuery = searchParams.get("q");
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const data = await fetchSupabaseProducts();
        setProducts(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: "All Collections", value: "all" },
    { label: "Necklaces", value: "necklaces" },
    { label: "Earrings", value: "earrings" },
    { label: "Bangles & Rings", value: "bangles" },
    { label: "Bridal Sets", value: "bridal" },
    { label: "Boutique Fashion", value: "fashion" },
    { label: "Jewelry", value: "jewelry" },
    { label: "Accessories", value: "accessories" },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => matchesCategory(p, selectedCategory));
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full bg-[#FAF7F5] min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold tracking-[0.25em] uppercase text-[#D4A373] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            The Boutique Collection
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#240610] tracking-tight">
            Curated For Elegance
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
            Explore artisanal jewelry, statement bridal pieces, and contemporary luxury accessories handcrafted for timeless beauty.
          </p>
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-white rounded-2xl border border-[#EAE3DE] p-4 sm:p-5 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-[#4A1525] text-white shadow-md shadow-[#4A1525]/20 ring-2 ring-[#4A1525]/20 scale-[1.02]"
                    : "bg-[#FAF7F5] border border-[#E7DFD8] text-[#554348] hover:border-[#D4A373] hover:text-[#4A1525]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jhumka, choker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#EAE3DE] text-xs focus:outline-none focus:border-[#4A1525] bg-[#FAF7F5] text-[#240610]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Custom Luxury Sort Dropdown */}
            <SortDropdown
              value={sortBy}
              onChange={(val) => setSortBy(val)}
            />
          </div>
        </div>

        {/* Product Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAE3DE] py-16 px-4 text-center">
            <p className="font-serif text-xl text-[#240610]">No items match your criteria</p>
            <p className="text-xs text-zinc-400 mt-2">
              Try adjusting your category selection or clear search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#FAF7F5] border border-[#E7DFD8] text-[#4A1525] text-xs font-semibold hover:bg-[#4A1525] hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 text-xs text-[#554348]">
              <span>
                Showing <strong>{filteredProducts.length}</strong> creations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-brand-primary font-semibold">
            Loading Catalog...
          </p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
