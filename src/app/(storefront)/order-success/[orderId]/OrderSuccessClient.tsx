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
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Thank you celebration banner */}
      <div className="text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-blush text-brand-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Order Confirmed
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl text-brand-charcoal tracking-tight">
          Thank you for choosing Adorn
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto font-light">
          Your order has been received. Our concierge team is now preparing your handcrafted boutique parcel.
        </p>
      </div>

      {/* Invoice receipt container */}
      <div className="bg-white rounded-3xl border border-brand-border/80 shadow-md overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-[#FAF8F5] to-[#FFF0F3] p-6 sm:p-8 border-b border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-muted font-medium">
              Order Reference
            </span>
            <div className="font-mono text-2xl font-bold text-brand-charcoal tracking-wider mt-0.5">
              #{orderId}
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-zinc-600 space-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              {order ? new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }) : "Today"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              Estimated Delivery:{" "}
              <strong>
                {order ? order.estimatedDelivery : "24–48 Hours"}
              </strong>
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Order Items Review */}
          <div>
            <h3 className="font-serif text-lg text-brand-charcoal mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-primary" />
              Purchased Creations
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="divide-y divide-brand-border/60 border-t border-b border-brand-border/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl border border-brand-border/60 flex-shrink-0 overflow-hidden relative bg-brand-ivory flex items-center justify-center">
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
                        <h4 className="font-serif text-sm text-brand-charcoal font-medium">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-500">Qty: {item.quantity}</span>
                          {item.selectedColor && (
                            <span className="text-[10px] font-medium bg-brand-blush text-brand-primary px-2 py-0.5 rounded-full border border-brand-primary/20">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-brand-charcoal">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-brand-ivory/50 p-5 rounded-2xl border border-brand-border/60 text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-brand-charcoal">
                Recipient Details
              </h4>
              <p className="font-medium text-brand-charcoal text-sm">
                {order?.customer.fullName || "Valued Customer"}
              </p>
              <p className="text-zinc-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-primary" />
                {order?.customer.phone}
              </p>
              <p className="text-zinc-500">
                Zone:{" "}
                <span className="capitalize font-medium text-brand-charcoal">
                  {order?.customer.deliveryZone === "inside_dhaka"
                    ? "Inside Dhaka Metro"
                    : "Outside Dhaka Nationwide"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold uppercase tracking-wider text-brand-charcoal">
                Delivery Address & Payment
              </h4>
              <p className="text-zinc-700 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
                {order?.customer.address}, {order?.customer.city}
              </p>
              <div className="pt-1">
                <span className="font-medium text-zinc-700">Payment: </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-blush text-brand-primary font-semibold text-[11px]">
                  {order?.payment.method === "cod"
                    ? "Cash on Delivery"
                    : `bKash TrxID: ${order?.payment.bkashTrxId || "Recorded"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-brand-border/60 pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(order?.pricing.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee</span>
              <span>
                {order?.pricing.shippingFee === 0
                  ? "FREE"
                  : formatPrice(order?.pricing.shippingFee || 0)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-brand-border font-serif text-lg font-bold text-brand-charcoal">
              <span>Grand Total</span>
              <span className="text-2xl text-brand-primary">
                {formatPrice(order?.pricing.grandTotal || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-50 p-6 sm:p-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* WhatsApp concierge */}
          <a
            href={`https://wa.me/8801700000000?text=Hi%20Adorn%20by%20Mashfika%2C%20I%20have%20an%20inquiry%20regarding%20my%20order%20${orderId}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Concierge WhatsApp Support
          </a>

          {/* Continue Shopping button */}
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            Explore More Pieces
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
