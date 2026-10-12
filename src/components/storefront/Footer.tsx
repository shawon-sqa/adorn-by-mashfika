"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useStoreSettings } from "@/lib/data/storeSettings";

export function Footer() {
  const storeSettings = useStoreSettings();
  const phone = storeSettings.contactPhone || "01353655433";
  const rawPhone = phone.replace(/\D/g, "") || "01353655433";
  const waNumber = rawPhone.startsWith("88") ? rawPhone : `88${rawPhone}`;
  const email = storeSettings.contactEmail || "adornbymashfika@gmail.com";
  const address = storeSettings.address || "Dhaka, Bangladesh";

  return (
    <footer className="bg-[#171616] text-[#E0DCD7] border-t border-brand-primary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl tracking-wide text-white">
              {storeSettings.storeName || "Adorn by Mashfika"}
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-champagne font-medium">
              {storeSettings.tagline || "Elegance in Every Detail"}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Curated jewelry, handpicked accessories, and bespoke contemporary fashion designed to make every occasion memorable.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-brand-primary transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-brand-primary transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Collections */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-sans">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/shop?category=jewelry" className="hover:text-brand-champagne transition-colors">
                  Necklaces & Chokers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=earrings" className="hover:text-brand-champagne transition-colors">
                  Statement Earrings & Jhumkas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bracelets" className="hover:text-brand-champagne transition-colors">
                  Bangles & Bracelets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-brand-champagne transition-colors">
                  Hair Ornaments & Clutches
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fashion" className="hover:text-brand-champagne transition-colors">
                  Boutique Pret Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-sans">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/faq" className="hover:text-brand-champagne transition-colors font-medium text-white/90 flex items-center gap-1.5">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-champagne transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-brand-champagne transition-colors">
                  Delivery & Shipping (All Bangladesh)
                </Link>
              </li>
              <li>
                <Link href="/returns-exchange" className="hover:text-brand-champagne transition-colors">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white font-sans">
              Boutique Concierge
            </h4>
            <div className="space-y-2.5 text-sm text-zinc-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-brand-champagne flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-brand-champagne flex-shrink-0" />
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-champagne transition-colors"
                >
                  {phone} (WhatsApp available)
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-brand-champagne flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-brand-champagne transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-block text-[11px] uppercase tracking-wider text-brand-champagne bg-zinc-800/80 px-2.5 py-1 rounded">
                Cash on Delivery & bKash Supported
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Adorn by Mashfika. All rights reserved.</p>
          <p className="text-zinc-400">Crafted for timeless feminine beauty.</p>
        </div>
      </div>
    </footer>
  );
}
