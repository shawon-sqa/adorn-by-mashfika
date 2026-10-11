"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  AdminOrderRecord,
  OrderStatus,
} from "@/lib/data/adminOrders";
import { formatPrice } from "@/lib/utils/formatters";

interface AdminOrderDetailClientProps {
  orderId: string;
}

export function AdminOrderDetailClient({ orderId }: AdminOrderDetailClientProps) {
  const router = useRouter();

  const [order, setOrder] = useState<AdminOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierInput, setCourierInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const orders = getAdminOrders();
    const found = orders.find((o) => o.orderId === orderId);
    if (found) {
      setOrder(found);
      setCourierInput(found.courierName || "");
      setTrackingInput(found.trackingNumber || "");
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-brand-border text-center max-w-md mx-auto">
        <h2 className="font-serif text-xl text-brand-charcoal">Order Not Found</h2>
        <p className="text-xs text-zinc-400 mt-2">
          Could not locate order reference #{orderId}.
        </p>
        <Link
          href="/admin/orders"
          className="mt-6 inline-block px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    const updated = updateAdminOrderStatus(
      order.orderId,
      newStatus,
      courierInput,
      trackingInput
    );
    const found = updated.find((o) => o.orderId === order.orderId);
    if (found) setOrder(found);
    triggerFeedback();
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateAdminOrderStatus(
      order.orderId,
      order.orderStatus,
      courierInput,
      trackingInput
    );
    const found = updated.find((o) => o.orderId === order.orderId);
    if (found) setOrder(found);
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Back and Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white rounded-xl border border-brand-border hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-brand-charcoal">
                Order #{order.orderId}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-blush text-brand-primary border border-brand-primary/20">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-charcoal hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Invoice
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Order changes saved successfully!
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Order items, Status Updater, Delivery Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Updater Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base text-brand-charcoal">
              Update Fulfillment Status
            </h3>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ] as OrderStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    order.orderStatus === st
                      ? "bg-brand-charcoal text-white shadow-xs"
                      : "bg-[#FAF8F5] text-zinc-600 hover:bg-zinc-200/80"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Courier & Tracking Assignment */}
          <form
            onSubmit={handleSaveShipping}
            className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs space-y-4"
          >
            <h3 className="font-serif text-base text-brand-charcoal flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-primary" />
              Dispatch & Courier Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast / Pathao / RedX"
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Tracking Number / Consignment ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. STF-BD-89210"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Update Logistics Info
            </button>
          </form>

          {/* Order Items Table */}
          <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-brand-border/60">
              <h3 className="font-serif text-base text-brand-charcoal">
                Order Items ({order.items.length})
              </h3>
            </div>

            <div className="divide-y divide-brand-border/50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${item.gradient} border border-brand-border/60 flex items-center justify-center p-1 text-center`}
                    >
                      <span className="font-serif text-[9px] text-zinc-700 italic line-clamp-2">
                        {item.title}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm text-brand-charcoal font-medium">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Qty: {item.quantity}{" "}
                        {item.selectedColor ? `• Variant: ${item.selectedColor}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-brand-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="p-6 bg-[#FAF8F5] border-t border-brand-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-medium text-brand-charcoal">
                  {formatPrice(order.pricing.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Fee</span>
                <span className="font-medium">
                  {order.pricing.shippingFee === 0
                    ? "FREE"
                    : formatPrice(order.pricing.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-brand-border font-serif text-base font-bold text-brand-charcoal">
                <span>Total Receivable</span>
                <span className="text-brand-primary text-xl">
                  {formatPrice(order.pricing.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Customer & Payment Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base text-brand-charcoal">
              Customer Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 block">Name</span>
                <span className="font-semibold text-brand-charcoal text-sm">
                  {order.customer.fullName}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block">Phone</span>
                <a
                  href={`tel:${order.customer.phone}`}
                  className="font-semibold text-brand-primary hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {order.customer.phone}
                </a>
              </div>

              <div>
                <span className="text-zinc-400 block">Delivery Address</span>
                <p className="text-zinc-700 leading-relaxed mt-0.5">
                  {order.customer.address}, {order.customer.city}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold uppercase">
                  {order.customer.deliveryZone === "inside_dhaka"
                    ? "Dhaka Metro"
                    : "Nationwide Courier"}
                </span>
              </div>

              {order.customer.notes && (
                <div className="pt-2 border-t border-brand-border">
                  <span className="text-zinc-400 block">Customer Note</span>
                  <p className="italic text-zinc-600 mt-0.5">
                    "{order.customer.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base text-brand-charcoal flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-primary" />
              Payment Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Method</span>
                <span className="font-bold uppercase text-brand-charcoal">
                  {order.payment.method === "cod" ? "Cash on Delivery" : "bKash Manual"}
                </span>
              </div>

              {order.payment.bkashTrxId && (
                <div className="p-3 bg-brand-blush rounded-xl border border-brand-primary/20 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-zinc-500">Sender Phone</span>
                    <span className="font-mono font-semibold text-brand-charcoal">
                      {order.payment.bkashSenderPhone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-zinc-500">Transaction ID</span>
                    <span className="font-mono font-bold text-brand-primary uppercase">
                      {order.payment.bkashTrxId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
