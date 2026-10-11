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

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { openCart, getTotalItems } = useCartStore();
  const { openWishlist, getTotalFavorites } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
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
    { name: "About Us", href: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border/70 transition-all shadow-2xs">
        {/* Top Announcement Bar */}
        <div className="bg-brand-primary text-white text-[11px] sm:text-xs py-1.5 px-4 text-center tracking-wider uppercase font-medium">
          <span>✨ Free Delivery Across Dhaka on Orders Above ৳ 2,000 ✨</span>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile hamburger menu toggle */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-brand-charcoal hover:text-brand-primary p-2 -ml-2 rounded-xl hover:bg-brand-blush/40 transition-colors focus:outline-none"
                aria-label="Open Mobile Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Brand Logo & Luxury Monogram ("AM") */}
            <div className="flex-1 md:flex-initial text-center md:text-left">
              <Link href="/" className="inline-flex items-center gap-3 group text-left">
                {/* Luxury Rose-Gold Monogram Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#B76E79] via-[#C98A93] to-[#E8C5C8] p-[1.5px] shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <span className="font-serif font-bold text-sm sm:text-base text-brand-primary tracking-wider group-hover:scale-105 transition-transform">
                      AM
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl lg:text-[26px] tracking-tight text-brand-charcoal group-hover:text-brand-primary transition-colors leading-tight font-normal">
                    Adorn by Mashfika
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-[0.26em] uppercase text-brand-primary font-sans font-semibold -mt-0.5">
                    Elegance in Every Detail
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-7 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-brand-charcoal hover:text-brand-primary transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-primary hover:after:w-full after:transition-all after:duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Utility Icons (Search, Wishlist, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-3.5">
              {/* Search Icon Trigger */}
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                className="text-brand-charcoal hover:text-brand-primary transition-colors p-2 rounded-full hover:bg-brand-blush/60 cursor-pointer"
                aria-label="Open Search Bar"
                title="Search collection"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist Trigger */}
              <button
                type="button"
                onClick={openWishlist}
                className="relative p-2 text-brand-charcoal hover:text-brand-primary transition-colors rounded-full hover:bg-brand-blush/60 flex items-center cursor-pointer"
                aria-label="Open Wishlist"
                title="Saved Creations"
              >
                <Heart
                  className={`h-5 w-5 ${
                    totalFavorites > 0 ? "text-rose-500 fill-rose-500" : ""
                  }`}
                />
                {totalFavorites > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                    {totalFavorites}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-brand-charcoal hover:text-brand-primary transition-colors rounded-full hover:bg-brand-blush/60 flex items-center cursor-pointer"
                aria-label="Open Shopping Bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-brand-primary text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
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
              <div className="p-5 border-b border-brand-border/70 flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B76E79] to-[#E8C5C8] p-[1px] shadow-2xs">
                    <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
                      <span className="font-serif font-bold text-xs text-brand-primary">
                        AM
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-serif font-medium text-sm text-brand-charcoal block">
                      Adorn by Mashfika
                    </span>
                    <span className="text-[8px] tracking-[0.2em] uppercase text-brand-primary font-bold block">
                      Boutique Collection
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-charcoal hover:bg-zinc-100 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Search Button in Drawer */}
              <div className="p-4 border-b border-brand-border/50">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOverlayOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-brand-border/80 bg-brand-ivory/50 text-xs text-zinc-500 hover:border-brand-primary hover:text-brand-charcoal transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-brand-primary" />
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
                    className="flex items-center justify-between px-3.5 py-3 text-sm font-medium text-brand-charcoal hover:text-brand-primary hover:bg-brand-blush/40 rounded-xl transition-colors"
                  >
                    <span>{link.name}</span>
                    <div className="flex items-center gap-2">
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-blush text-brand-primary text-[10px] font-bold">
                          {link.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Direct Actions (Wishlist & Cart) */}
              <div className="p-4 border-t border-brand-border/60 space-y-2 bg-[#FAF8F5]/60 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openWishlist();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-brand-border/80 text-xs font-semibold text-brand-charcoal hover:border-brand-primary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Saved Wishlist</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px]">
                    {totalFavorites}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Shopping Bag</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[11px]">
                    {totalItems} items
                  </span>
                </button>
              </div>
            </div>

            {/* Concierge & Support Footer */}
            <div className="p-5 border-t border-brand-border/70 bg-[#FCFAF8] space-y-2 text-xs text-zinc-500">
              <div className="flex items-center gap-2 text-brand-charcoal font-semibold">
                <Phone className="w-3.5 h-3.5 text-brand-primary" />
                <span>Concierge: 01353655433</span>
              </div>
              <a
                href="https://wa.me/8801353655433"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-700 font-medium hover:underline text-[11px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp (Instant Reply)
              </a>
              <p className="text-[10px] text-zinc-400 pt-1">
                Dhaka Metro Express & Nationwide Courier
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
