"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { OrderRecord } from "@/lib/validations/checkout";
import { formatPrice } from "@/lib/utils/formatters";

interface OrderSuccessClientProps {
  orderId: string;
}

export function OrderSuccessClient({ orderId }: OrderSuccessClientProps) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`adorn_order_${orderId}`);
      if (stored) {
        setOrder(JSON.parse(stored));
      } else {
        const listRaw = localStorage.getItem("adorn_orders");
        if (listRaw) {
          const list: OrderRecord[] = JSON.parse(listRaw);
          const found = list.find((o) => o.orderId === orderId);
          if (found) setOrder(found);
        }
      }

      // Ensure abandoned cart session is finalized as CONVERTED in Supabase
      import("@/lib/utils/cartTracker").then(({ markCartSessionConverted }) => {
        markCartSessionConverted();
      }).catch(() => {});
      import("@/lib/data/cartsRecovery").then(({ markCartAsConverted }) => {
        markCartAsConverted();
      }).catch(() => {});
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F5]">
        <div className="w-8 h-8 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Thank you celebration banner */}
        <div className="text-center space-y-4 mb-12">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-serif uppercase tracking-[0.2em] font-medium shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            Order Confirmed
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#240610] tracking-tight">
            Thank you for choosing Adorn
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto font-light leading-relaxed">
            Your order has been received. Our concierge team is now preparing your handcrafted boutique parcel.
          </p>
        </div>

        {/* Invoice receipt container: Pure white card with subtle champagne border */}
        <div className="bg-white rounded-2xl border border-[#EAE3DE] shadow-sm overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-[#FAF7F5] via-[#FAF7F5] to-[#F5EBE6] p-6 sm:p-8 border-b border-[#EAE3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                ✦ Order Reference
              </span>
            <div className="font-mono text-2xl font-bold text-[#240610] tracking-wider mt-0.5">
              #{orderId}
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-zinc-600 space-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4A1525]" />
              {order ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }) : "Today"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A1525]" />
              Estimated Delivery:{" "}
              <strong className="text-[#240610]">
                {order ? order.estimatedDelivery : "24–48 Hours"}
              </strong>
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Order Items Review */}
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-[#240610] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#4A1525]" />
              Purchased Creations
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="divide-y divide-[#F0EAE5] border-t border-b border-[#EAE3DE]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl border border-[#F0EAE5] flex-shrink-0 overflow-hidden relative bg-[#FAF7F5] flex items-center justify-center">
                        {item.imageUrl || (item as any).image_url ? (
                          <img
                            src={item.imageUrl || (item as any).image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center p-1 text-center`}
                          >
                            <span className="font-serif text-[9px] text-zinc-700 italic line-clamp-2">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm text-[#240610] font-medium">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-500">Qty: {item.quantity}</span>
                          {item.selectedColor && (
                            <span className="text-[10px] font-medium bg-[#FAF7F5] text-[#4A1525] px-2 py-0.5 rounded-full border border-[#E7DFD8]">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[#240610]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3">Order items recorded.</p>
            )}
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF7F5] p-5 rounded-2xl border border-[#EAE3DE] text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-[#240610] font-serif">
                Recipient Details
              </h4>
              <p className="font-medium text-[#240610] text-sm">
                {order?.customer.fullName || "Valued Customer"}
              </p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#4A1525]" />
                {order?.customer.phone}
              </p>
              <p className="text-zinc-500">
                Zone:{" "}
                <span className="capitalize font-medium text-[#240610]">
                  {order?.customer.deliveryZone === "inside_dhaka"
                    ? "Inside Dhaka Metro"
                    : "Outside Dhaka Nationwide"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-[#240610] font-serif">
                Delivery Address & Payment
              </h4>
              <p className="text-zinc-700 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#4A1525] flex-shrink-0 mt-0.5" />
                {order?.customer.address}, {order?.customer.city}
              </p>
              <div className="pt-1">
                <span className="font-medium text-zinc-700">Payment: </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-[#4A1525] border border-[#D4A373]/30 font-semibold text-[11px]">
                  {order?.payment.method === "cod"
                    ? "Cash on Delivery"
                    : `bKash TrxID: ${order?.payment.bkashTrxId || "Recorded"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-[#EAE3DE] pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-[#240610]">{formatPrice(order?.pricing.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee</span>
              <span className="font-medium">
                {order?.pricing.shippingFee === 0
                  ? "FREE"
                  : formatPrice(order?.pricing.shippingFee || 0)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-[#EAE3DE] font-serif text-lg font-bold text-[#240610]">
              <span>Grand Total</span>
              <span className="text-2xl text-[#4A1525] font-serif">
                {formatPrice(order?.pricing.grandTotal || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF7F5] p-6 sm:p-8 border-t border-[#EAE3DE] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* WhatsApp concierge: Luxury emerald green/gold pill button */}
          <a
            href={`https://wa.me/8801353655433?text=${encodeURIComponent(
              `Hello Adorn by Mashfika, I would like to inquire about my order #${orderId}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white border border-[#D4A373]/40 text-xs font-semibold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#D4A373]" />
            <span>Concierge WhatsApp Support</span>
          </a>

          {/* Continue Shopping button: Styled in rich burgundy */}
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] border border-[#D4A373]/30 text-xs font-semibold uppercase tracking-widest transition-all shadow-md hover:shadow-lg shadow-[#4A1525]/20 cursor-pointer"
          >
            <span>Explore More Pieces</span>
            <ArrowRight className="w-4 h-4 text-[#D4A373]" />
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
