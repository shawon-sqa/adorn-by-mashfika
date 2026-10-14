"use client";

import { useState } from "react";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WishlistDrawer } from "@/components/storefront/WishlistDrawer";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";
import { SearchOverlay } from "@/components/storefront/SearchOverlay";
import { FirstOrderDiscountModal } from "@/components/storefront/FirstOrderDiscountModal";
import { FloatingContactButtons } from "@/components/storefront/FloatingContactButtons";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F5] pb-16 md:pb-0 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full bg-[#FAF7F5]">{children}</main>
      <CartDrawer />
      <WishlistDrawer />
      <FirstOrderDiscountModal />
      <Footer />

      {/* Floating Concierge & Support Contacts */}
      <FloatingContactButtons />

      {/* Floating / Sticky Mobile Bottom Nav */}
      <MobileBottomNav onOpenSearch={() => setMobileSearchOpen(true)} />

      {/* Mobile Bottom Nav Search Overlay */}
      <SearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </div>
  );
}
