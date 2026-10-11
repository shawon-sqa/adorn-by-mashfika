import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, Bell, Sparkles } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        {/* Navigation Links wrapped in Suspense for usePathname */}
        <Suspense
          fallback={
            <div className="p-4 space-y-2">
              <div className="h-8 bg-zinc-800/50 rounded-xl animate-pulse" />
              <div className="h-8 bg-zinc-800/50 rounded-xl animate-pulse" />
              <div className="h-8 bg-zinc-800/50 rounded-xl animate-pulse" />
            </div>
          }
        >
          <AdminSidebarNav />
        </Suspense>

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

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
              <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif text-sm font-semibold">
                M
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-brand-charcoal leading-none">
                  Mashfika
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Store Owner</p>
              </div>
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
