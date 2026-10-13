"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Clock,
  AlertTriangle,
  ChevronRight,
  Check,
  ShoppingBag,
  Package,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminOrderRecord } from "@/lib/data/adminOrders";
import { Product } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/formatters";

interface AdminNotificationCenterProps {
  orders: AdminOrderRecord[];
  products: Product[];
}

export function AdminNotificationCenter({
  orders,
  products,
}: AdminNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clearedNoticeIds, setClearedNoticeIds] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 1. Pending orders alerts
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "pending" && !clearedNoticeIds.includes(`order-${o.orderId}`)
  );

  // 2. Low stock product alerts (stock < 10)
  const lowStockProducts = products.filter(
    (p) =>
      (p.stockCount ?? 0) < 10 &&
      !clearedNoticeIds.includes(`prod-${p.id}`)
  );

  const totalAlertsCount = pendingOrders.length + lowStockProducts.length;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    const allIds = [
      ...pendingOrders.map((o) => `order-${o.orderId}`),
      ...lowStockProducts.map((p) => `prod-${p.id}`),
    ];
    setClearedNoticeIds((prev) => [...prev, ...allIds]);
  };

  const handleDismissItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClearedNoticeIds((prev) => [...prev, id]);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button with Active Count Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-zinc-500 hover:text-brand-charcoal rounded-full hover:bg-brand-blush/60 transition-colors cursor-pointer focus:outline-none"
        aria-label="Admin Notifications"
        title="Boutique Alerts & Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalAlertsCount > 0 && (
          <span className="absolute top-1 right-1 bg-brand-primary text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
            {totalAlertsCount}
          </span>
        )}
      </button>

      {/* Floating Notification Popover Center */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl border border-brand-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-brand-border/60 bg-[#FAF8F5] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-brand-charcoal">
                  Notification Center
                </h3>
                {totalAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-blush text-brand-primary text-[10px] font-bold">
                    {totalAlertsCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Real-time operational alerts for orders & stock
              </p>
            </div>

            {totalAlertsCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-brand-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y divide-brand-border/50">
            {totalAlertsCount === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-serif text-sm text-brand-charcoal">All caught up!</p>
                <p className="text-xs text-zinc-400">
                  No pending order verifications or urgent stock alerts right now.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Pending Orders Section */}
                {pendingOrders.map((ord) => (
                  <Link
                    key={ord.orderId}
                    href={`/admin/orders/${ord.orderId}`}
                    onClick={() => setIsOpen(false)}
                    className="p-4 flex items-start gap-3 hover:bg-brand-blush-subtle/50 transition-colors group block relative"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-brand-charcoal">
                          Order #{ord.orderId}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 truncate mt-0.5">
                        {ord.customer.fullName} • {formatPrice(ord.pricing.grandTotal)}
                      </p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        Requires staff verification & courier dispatch
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDismissItem(`order-${ord.orderId}`, e)}
                      className="absolute right-3 top-4 p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                ))}

                {/* 2. Low Stock Alerts Section */}
                {lowStockProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/admin/products/${prod.id}/edit`}
                    onClick={() => setIsOpen(false)}
                    className="p-4 flex items-start gap-3 hover:bg-rose-50/40 transition-colors group block relative"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-brand-charcoal truncate">
                          {prod.title}
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        {(prod.stockCount ?? 0) <= 0
                          ? "Out of Stock: 0 units remaining!"
                          : `Low Stock: Only ${prod.stockCount} unit(s) left!`}
                      </p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        Tap to update inventory levels in catalog
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDismissItem(`prod-${prod.id}`, e)}
                      className="absolute right-3 top-4 p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-3 bg-[#FAF8F5] border-t border-brand-border/60 text-center">
            <Link
              href="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all customer orders</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
