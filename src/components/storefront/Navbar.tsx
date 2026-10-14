"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Heart,
  Sparkles,
  Phone,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { SearchOverlay } from "@/components/storefront/SearchOverlay";
import { useStoreSettings } from "@/lib/data/storeSettings";

export function Navbar() {
  const [currentPath, setCurrentPath] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const storeSettings = useStoreSettings();

  const { openCart, getTotalItems } = useCartStore();
  const { openWishlist, getTotalFavorites } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const totalItems = mounted ? getTotalItems() : 0;
  const totalFavorites = mounted ? getTotalFavorites() : 0;

  const navLinks = [
    { name: "New Arrivals", href: "/shop?collection=new", badge: "Trending" },
    { name: "Jewelry", href: "/shop?category=jewelry" },
    { name: "Accessories", href: "/shop?category=accessories" },
    { name: "Fashion", href: "/shop?category=fashion" },
    { name: "FAQ", href: "/faq" },
    { name: "About Us", href: "/about" },
  ];

  const freeDeliveryThreshold = Number(storeSettings.freeDeliveryThreshold) || 2000;
  const rawPhone = storeSettings.contactPhone.replace(/\D/g, "") || "01353655433";
  const waNumber = rawPhone.startsWith("88") ? rawPhone : `88${rawPhone}`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F5]/85 backdrop-blur-md border-b border-[#EAE3DE] transition-all shadow-xs">
        {/* Top Announcement Bar: Rich Burgundy gradient with shimmering gold icons */}
        <div className="bg-gradient-to-r from-[#4A1525] via-[#3B0E1B] to-[#4A1525] text-[#F3E5D8] text-[11px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium border-b border-[#D4A373]/20 flex items-center justify-center gap-2">
          <span className="text-[#D4A373] animate-pulse">✦</span>
          <span>FREE DELIVERY ACROSS DHAKA ON ORDERS ABOVE ৳ {freeDeliveryThreshold.toLocaleString()}</span>
          <span className="text-[#D4A373] animate-pulse">✦</span>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile hamburger menu toggle */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#240610] hover:text-[#4A1525] p-2 -ml-2 rounded-xl hover:bg-[#FAF7F5] transition-colors focus:outline-none"
                aria-label="Open Mobile Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Brand Logo & Luxury Monogram ("AM") */}
            <div className="flex-1 md:flex-initial text-center md:text-left">
              <Link href="/" className="inline-flex items-center gap-3 group text-left">
                {/* Luxury Burgundy & Gold Monogram Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#4A1525] via-[#3B0E1B] to-[#D4A373] p-[1.5px] shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <div className="w-full h-full bg-[#FAF7F5] rounded-[14px] flex items-center justify-center">
                    <span className="font-serif font-bold text-sm sm:text-base text-[#4A1525] tracking-wider group-hover:scale-105 transition-transform">
                      AM
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl lg:text-[26px] tracking-tight text-[#240610] group-hover:text-[#4A1525] transition-colors leading-tight font-normal">
                    Adorn by Mashfika
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-[0.26em] uppercase text-[#D4A373] font-sans font-semibold -mt-0.5">
                    Elegance in Every Detail
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links with active indicator */}
            <div className="hidden md:flex items-center space-x-7 lg:space-x-8">
              {navLinks.map((link) => {
                const isExactActive =
                  mounted &&
                  currentPath === link.href.split("?")[0] &&
                  (link.href === "/shop" || link.href === "/faq" || link.href === "/about");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#4A1525] after:transition-all after:duration-300 ${isExactActive
                        ? "text-[#4A1525] font-semibold after:w-full"
                        : "text-[#240610] hover:text-[#4A1525] after:w-0 hover:after:w-full"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Utility Icons (Search, Wishlist, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-3.5">
              {/* Search Icon Trigger */}
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                className="text-[#240610] hover:text-[#4A1525] transition-colors p-2 rounded-full hover:bg-[#FAF7F5] cursor-pointer"
                aria-label="Open Search Bar"
                title="Search collection"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist Trigger */}
              <button
                type="button"
                onClick={openWishlist}
                className="relative p-2 text-[#240610] hover:text-[#4A1525] transition-colors rounded-full hover:bg-[#FAF7F5] flex items-center cursor-pointer"
                aria-label="Open Wishlist"
                title="Saved Creations"
              >
                <Heart
                  className={`h-5 w-5 ${totalFavorites > 0 ? "text-[#4A1525] fill-[#4A1525]" : ""
                    }`}
                />
                {totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4A373] text-[#240610] text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                    {totalFavorites}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-[#240610] hover:text-[#4A1525] transition-colors rounded-full hover:bg-[#FAF7F5] flex items-center cursor-pointer"
                aria-label="Open Shopping Bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4A373] text-[#240610] text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Interactive Luxury Search Modal Overlay */}
      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
      />

      {/* Sleek Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#EAE3DE] flex items-center justify-between bg-[#FAF7F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4A1525] via-[#3B0E1B] to-[#D4A373] p-[1.5px] shadow-2xs">
                    <div className="w-full h-full bg-[#FAF7F5] rounded-[9.5px] flex items-center justify-center border border-[#D4A373]/30">
                      <span className="font-serif font-bold text-xs text-[#4A1525] tracking-wider">
                        AM
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-serif font-medium text-sm text-[#240610] block">
                      Adorn by Mashfika
                    </span>
                    <span className="text-[8px] tracking-[0.2em] uppercase text-[#D4A373] font-sans font-bold block">
                      Boutique Collection
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-[#4A1525] hover:bg-white transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Search Button in Drawer */}
              <div className="p-4 border-b border-[#EAE3DE]/60">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOverlayOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#EAE3DE] bg-[#FAF7F5] text-xs text-zinc-500 hover:border-[#4A1525] focus:border-[#4A1525] focus:ring-2 focus:ring-[#D4A373]/20 transition-all text-left shadow-2xs cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#4A1525]" />
                  <span>Search jewelry, chokers...</span>
                </button>
              </div>

              {/* Nav Links */}
              <div className="py-2 px-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 text-sm font-medium text-[#240610] hover:text-[#4A1525] hover:bg-[#FAF7F5] rounded-xl transition-colors font-sans"
                  >
                    <span>{link.name}</span>
                    <div className="flex items-center gap-2">
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4A373]/15 text-[#4A1525] border border-[#D4A373]/40 text-[10px] font-bold">
                          {link.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Direct Actions (Wishlist & Cart) */}
              <div className="p-4 border-t border-[#EAE3DE] space-y-2.5 bg-[#FAF7F5]/60 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWishlist();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3DE] text-xs font-semibold text-[#240610] hover:border-[#4A1525] transition-colors shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#4A1525] fill-[#4A1525]" />
                    <span>Saved Wishlist</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F5] text-[#4A1525] border border-[#D4A373]/30 font-bold text-[11px]">
                    {totalFavorites}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#4A1525] text-[#F3E5D8] text-xs font-semibold hover:bg-[#3B0E1B] transition-colors shadow-md shadow-[#4A1525]/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
                    <span>View Shopping Bag</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4A373] text-[#240610] font-bold text-[11px]">
                    {totalItems} items
                  </span>
                </button>
              </div>
            </div>

            {/* Concierge & Support Footer */}
            <div className="p-5 border-t border-[#EAE3DE] bg-[#FAF7F5] space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2 text-[#240610] font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#4A1525]" />
                <span>Concierge: +880 1353655433</span>
              </div>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-700 font-medium hover:underline text-[11px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp (+880 1353655433)
              </a>
              <p className="text-[10px] text-zinc-400 pt-0.5">
                Dhaka Metro Express & Nationwide Courier
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
