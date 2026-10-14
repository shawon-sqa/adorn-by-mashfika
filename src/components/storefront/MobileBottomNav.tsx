"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  Home,
  ShoppingBag,
  Search,
  Heart,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

function MobileBottomNavContent({ onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { openCart, getTotalItems } = useCartStore();
  const { openWishlist, getTotalFavorites } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalFavorites = mounted ? getTotalFavorites() : 0;

  const isHome = pathname === "/";
  const isShop = pathname ? pathname.startsWith("/shop") : false;

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE3DE] px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
            isHome
              ? "text-[#4A1525] font-semibold"
              : "text-zinc-500 hover:text-[#240610]"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
            isShop
              ? "text-[#4A1525] font-semibold"
              : "text-zinc-500 hover:text-[#240610]"
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </Link>

        {/* Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-zinc-500 hover:text-[#4A1525] transition-colors cursor-pointer"
          aria-label="Search Collection"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={openWishlist}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-zinc-500 hover:text-[#4A1525] transition-colors relative cursor-pointer"
          aria-label="View Wishlist"
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 mb-0.5 ${
                totalFavorites > 0 ? "text-rose-500 fill-rose-500" : ""
              }`}
            />
            {totalFavorites > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#D4A373] text-[#240610] text-[9px] font-bold h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {totalFavorites}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </button>

        {/* Cart Bag */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-zinc-500 hover:text-[#4A1525] transition-colors relative cursor-pointer"
          aria-label="View Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-[#240610]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#D4A373] text-[#240610] text-[9px] font-bold h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Bag</span>
        </button>
      </div>
    </nav>
  );
}

export function MobileBottomNav({ onOpenSearch }: MobileBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavContent onOpenSearch={onOpenSearch} />
    </Suspense>
  );
}
