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
} from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { createBrowserClient } from "@/lib/supabase/client";

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    async function checkUser() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    }
    checkUser();
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

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      setIsDropdownOpen(false);
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
      <aside className="w-full md:w-64 bg-[#1C1A1A] text-white flex-shrink-0 flex flex-col border-r border-zinc-800">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-brand-border/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-blush px-3 py-1 rounded-full">
              Boutique Operations
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              className="relative p-2 text-zinc-500 hover:text-brand-charcoal rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Admin Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary" />
            </button>

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
                        Mashfika Rahman
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
