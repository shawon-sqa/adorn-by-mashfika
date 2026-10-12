"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ExternalLink,
  Bell,
  Sparkles,
  Settings,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { createBrowserClient } from "@/lib/supabase/client";
import { fetchSupabaseOrders } from "@/lib/data/supabaseOrders";
import { getAdminOrders, AdminOrderRecord } from "@/lib/data/adminOrders";
import { getAdminProducts } from "@/lib/data/adminProducts";
import { Product } from "@/lib/types/product";

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    async function checkUserAndMetrics() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }

      // Load metrics for Notification Center
      const sbOrders = await fetchSupabaseOrders();
      setOrders(sbOrders.length > 0 ? sbOrders : getAdminOrders());
      setProducts(getAdminProducts());
    }
    checkUserAndMetrics();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileDrawerOpen]);

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setIsDropdownOpen(false);
      setMobileDrawerOpen(false);
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  // If on /admin/login, bypass sidebar, topbar, and admin padding entirely
  if (isLoginPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-[#1C1A1A] text-white flex-shrink-0 flex-col border-r border-zinc-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80">
          <Link href="/admin" className="flex flex-col">
            <span className="font-serif text-xl tracking-wide text-white">
              Adorn by Mashfika
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-brand-champagne font-medium mt-0.5">
              Admin Portal
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <AdminSidebarNav />

        {/* Live Storefront Link */}
        <div className="p-4 border-t border-zinc-800/80">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-champagne" />
              View Live Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>
      </aside>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 bg-[#1C1A1A] text-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-serif text-lg tracking-wide text-white block">
                    Adorn by Mashfika
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-brand-champagne font-bold block">
                    Admin Portal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AdminSidebarNav onNavigate={() => setMobileDrawerOpen(false)} />
            </div>

            <div className="p-4 border-t border-zinc-800 space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-champagne" />
                  View Storefront
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-brand-border/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-zinc-600 hover:text-brand-charcoal hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-blush px-3 py-1 rounded-full hidden sm:inline-block">
              Boutique Operations
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Functional Notification Center Bell */}
            <AdminNotificationCenter orders={orders} products={products} />

            {/* Interactive Professional Profile Dropdown */}
            <div className="relative pl-4 border-l border-brand-border" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-full sm:rounded-2xl hover:bg-brand-blush/40 transition-colors cursor-pointer group focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-label="User account menu"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-sm font-semibold shadow-2xs group-hover:bg-brand-primary-hover transition-colors">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : "M"}
                  </div>
                  {/* Verified active indicator dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-brand-charcoal leading-none truncate max-w-[130px]">
                    {userEmail ? userEmail.split("@")[0] : "Mashfika"}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Store Owner</p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-charcoal transition-transform duration-200 hidden sm:block ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Floating Menu Anchored to Bottom-Right */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl border border-brand-border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-brand-border/60">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-brand-charcoal">
                        Mashfika
                      </p>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">
                      {userEmail || "admin@adornbymashfika.com"}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-brand-charcoal hover:bg-brand-blush/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-zinc-500" />
                      <span>Store Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-brand-charcoal hover:bg-brand-blush/50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-brand-champagne" />
                        <span>View Live Store</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </Link>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-brand-border/60 my-1" />

                  {/* Sign Out Option */}
                  <div className="px-1.5 py-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
