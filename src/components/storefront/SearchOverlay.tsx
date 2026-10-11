"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/lib/types/product";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { formatPrice } from "@/lib/utils/formatters";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products from Supabase on mount
  useEffect(() => {
    async function loadProducts() {
      const data = await fetchSupabaseProducts();
      setAllProducts(data);
    }
    loadProducts();
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time filter
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFilteredResults([]);
      return;
    }

    const matches = allProducts.filter((p) => {
      const text = `${p.title} ${p.subtitle} ${p.description} ${p.category} ${(p.materials || []).join(" ")}`.toLowerCase();
      return text.includes(q);
    });

    setFilteredResults(matches.slice(0, 6));
  }, [query, allProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = (slug: string) => {
    onClose();
    router.push(`/shop/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col items-center justify-start pt-6 sm:pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-border/80 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-b border-brand-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search necklaces, earrings, rings, bridal sets..."
            className="flex-1 bg-transparent text-sm sm:text-base text-brand-charcoal placeholder-zinc-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-brand-charcoal rounded-xl border border-brand-border/60 hover:bg-zinc-50 transition-colors text-xs font-semibold cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Quick Suggestion Pills when query is empty */}
        {!query && (
          <div className="p-5 sm:p-6 bg-[#FCFAF8] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {["Kundan Choker", "Rose Quartz Jhumkas", "Bridal Sets", "Velvet Potli", "Cocktail Rings", "Dupattas"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full bg-white border border-brand-border/80 text-xs text-brand-charcoal hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Matching Results Dropdown */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-brand-border/50">
            {filteredResults.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <p className="font-serif text-base text-brand-charcoal">No creations found</p>
                <p className="text-xs text-zinc-400">
                  Try searching for keywords like "choker", "earring", "bangle", or "potli".
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-3 px-5 py-2 rounded-full bg-brand-blush text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Search catalog for "{query}"
                </button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-[#FAF8F5] text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Matching Creations ({filteredResults.length})</span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-brand-primary hover:underline flex items-center gap-1"
                  >
                    View all in shop <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {filteredResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.slug)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-brand-blush-subtle/60 transition-colors group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl border border-brand-border/80 overflow-hidden relative flex-shrink-0 bg-brand-ivory flex items-center justify-center">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-tr ${product.gradient} flex items-center justify-center p-1 text-center`}>
                          <span className="font-serif text-[8px] text-zinc-600 line-clamp-2">
                            {product.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm text-brand-charcoal group-hover:text-brand-primary transition-colors truncate font-medium">
                        {product.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-light">
                        {product.subtitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-brand-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.stockCount <= 0 && (
                          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
