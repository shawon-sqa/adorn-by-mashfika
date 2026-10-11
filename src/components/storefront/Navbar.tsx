"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openCart, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  const navLinks = [
    { name: "New Arrivals", href: "/shop?collection=new" },
    { name: "Jewelry", href: "/shop?category=jewelry" },
    { name: "Accessories", href: "/shop?category=accessories" },
    { name: "Fashion", href: "/shop?category=fashion" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-border/60 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-brand-primary text-white text-xs py-1.5 px-4 text-center tracking-wider uppercase font-medium">
        <span>✨ Free Delivery Across Dhaka on Orders Above ৳ 2,000 ✨</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-charcoal hover:text-brand-primary p-2 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div className="flex-1 md:flex-initial text-center md:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-tight text-brand-charcoal group-hover:text-brand-primary transition-colors">
                Adorn by Mashfika
              </span>
              <span className="block text-[10px] tracking-[0.25em] uppercase text-brand-muted font-sans text-center md:text-left -mt-1">
                Elegance in Every Detail
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="flex items-center space-x-4 sm:space-x-5">
            <button
              type="button"
              className="text-brand-charcoal hover:text-brand-primary transition-colors p-1.5 rounded-full hover:bg-brand-blush/60"
              aria-label="Search items"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="hidden sm:flex text-brand-charcoal hover:text-brand-primary transition-colors p-1.5 rounded-full hover:bg-brand-blush/60"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 text-brand-charcoal hover:text-brand-primary transition-colors rounded-full hover:bg-brand-blush/60 flex items-center cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border/60 py-4 px-2 space-y-3 bg-white/95 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-brand-charcoal hover:text-brand-primary hover:bg-brand-blush/40 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between px-3 text-sm text-brand-muted">
              <span>Customer Care: +880 1700-000000</span>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-primary font-medium"
              >
                Track Order
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
