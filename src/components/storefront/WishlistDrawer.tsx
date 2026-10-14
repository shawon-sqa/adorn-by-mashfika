"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { Product } from "@/lib/types/product";

export function WishlistDrawer() {
  const { isOpen, closeWishlist, favoriteIds, toggleFavorite, savedProducts } =
    useWishlistStore();
  const { addItem } = useCartStore();
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchSupabaseProducts();
      setAllCatalogProducts(data);
    }
    loadCatalog();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Resolve favorited products using either savedProducts or allCatalogProducts
  const favoritedProducts: Product[] = favoriteIds
    .map((id) => {
      const fromCatalog = allCatalogProducts.find((p) => p.id === id);
      if (fromCatalog) return fromCatalog;
      return savedProducts.find((p) => p.id === id);
    })
    .filter((p): p is Product => Boolean(p));

  const handleMoveToCart = (product: Product) => {
    if (!product.inStock || product.stockCount <= 0) {
      showToast(`Sorry, "${product.title}" is currently sold out.`);
      return;
    }

    const res = addItem(product, 1);
    if (!res.success) {
      showToast(res.message || "Could not add item to bag.");
      return;
    }

    showToast(`Added "${product.title}" to bag!`);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[80] bg-brand-charcoal text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-brand-primary/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeWishlist}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity animate-in fade-in duration-300"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE3DE] flex items-center justify-between bg-[#FAF7F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4A1525]/10 text-[#4A1525] border border-[#D4A373]/30 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#4A1525] text-[#4A1525]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#240610]">Saved Creations</h3>
              <p className="text-[11px] text-zinc-500 font-light">
                {favoriteIds.length} {favoriteIds.length === 1 ? "item" : "items"} saved to your wishlist
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeWishlist}
            className="p-2 text-zinc-400 hover:text-[#4A1525] rounded-full hover:bg-white transition-colors cursor-pointer"
            aria-label="Close Wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-[#EAE3DE]">
          {favoritedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#4A1525]/10 text-[#4A1525] border border-[#D4A373]/30 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 opacity-50" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#240610]">Your wishlist is empty</h4>
                <p className="text-xs text-zinc-500 max-w-[240px] mt-1 font-light leading-relaxed">
                  Click the heart icon on any handcrafted piece to save it for later.
                </p>
              </div>
              <button
                type="button"
                onClick={closeWishlist}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#4A1525] text-[#F3E5D8] text-xs font-semibold hover:bg-[#3B0E1B] transition-colors shadow-xs cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            favoritedProducts.map((product) => {
              const isSoldOut = !product.inStock || product.stockCount <= 0;

              return (
                <div key={product.id} className="py-4 first:pt-0 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={closeWishlist}
                    className="w-20 h-20 rounded-2xl border border-[#EAE3DE] overflow-hidden relative bg-[#FAF7F5] flex-shrink-0 group"
                  >
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-tr ${product.gradient} flex items-center justify-center p-2 text-center`}
                      >
                        <span className="font-serif text-[10px] text-zinc-700 italic line-clamp-2">
                          {product.title}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info & Actions */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/shop/${product.slug}`}
                        onClick={closeWishlist}
                        className="font-serif text-sm text-brand-charcoal hover:text-brand-primary transition-colors line-clamp-1 font-medium"
                      >
                        {product.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 capitalize mt-0.5">
                      {product.category} Collection
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-brand-charcoal">
                        {formatPrice(product.price)}
                      </span>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => handleMoveToCart(product)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          isSoldOut
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                            : "bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xs cursor-pointer active:scale-95"
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {isSoldOut ? "Sold Out" : "Add to Bag"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {favoritedProducts.length > 0 && (
          <div className="p-5 border-t border-brand-border/60 bg-brand-ivory/30 flex items-center justify-between">
            <Link
              href="/shop"
              onClick={closeWishlist}
              className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
