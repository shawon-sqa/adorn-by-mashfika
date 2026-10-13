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
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  AdminOrderRecord,
  OrderStatus,
} from "@/lib/data/adminOrders";
import {
  fetchSupabaseOrders,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
} from "@/lib/data/supabaseOrders";
import { formatPrice } from "@/lib/utils/formatters";

interface AdminOrderDetailClientProps {
  orderId: string;
}

const COURIER_PRESETS = [
  "Steadfast Courier",
  "Pathao Express",
  "RedX Delivery",
  "Paperfly",
  "In-House Delivery",
];

export function AdminOrderDetailClient({ orderId }: AdminOrderDetailClientProps) {
  const router = useRouter();

  const [order, setOrder] = useState<AdminOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierInput, setCourierInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [courierNotesInput, setCourierNotesInput] = useState("");
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Luxury Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    async function loadSingleOrder() {
      // Check Supabase first
      const sbOrders = await fetchSupabaseOrders();
      const sbFound = sbOrders.find((o) => o.orderId === orderId);
      if (sbFound) {
        setOrder(sbFound);
        setCourierInput(sbFound.courierName || "");
        setTrackingInput(sbFound.trackingNumber || "");
        setCourierNotesInput(sbFound.courierNotes || "");
        setLoading(false);
        return;
      }

      // Check local storage fallback
      const orders = getAdminOrders();
      const found = orders.find((o) => o.orderId === orderId);
      if (found) {
        setOrder(found);
        setCourierInput(found.courierName || "");
        setTrackingInput(found.trackingNumber || "");
        setCourierNotesInput(found.courierNotes || "");
      }
      setLoading(false);
    }
    loadSingleOrder();
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

  const handleStatusChange = async (newStatus: OrderStatus) => {
    // 1. Update in Supabase cloud
    await updateSupabaseOrderStatus(
      order.orderId,
      newStatus,
      {
        courierName: courierInput || undefined,
        trackingNumber: trackingInput || undefined,
        courierNotes: courierNotesInput || undefined,
      },
      order.customer.notes
    );

    // 2. Update in local storage
    const updated = updateAdminOrderStatus(
      order.orderId,
      newStatus,
      courierInput,
      trackingInput,
      courierNotesInput
    );
    const found = updated.find((o) => o.orderId === order.orderId);
    if (found) {
      setOrder(found);
    } else {
      setOrder({ ...order, orderStatus: newStatus });
    }
    triggerFeedback();
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Supabase
    await updateSupabaseOrderStatus(
      order.orderId,
      order.orderStatus,
      {
        courierName: courierInput || undefined,
        trackingNumber: trackingInput || undefined,
        courierNotes: courierNotesInput || undefined,
      },
      order.customer.notes
    );

    // 2. Update local storage
    const updated = updateAdminOrderStatus(
      order.orderId,
      order.orderStatus,
      courierInput,
      trackingInput,
      courierNotesInput
    );
    const found = updated.find((o) => o.orderId === order.orderId);
    if (found) setOrder(found);
    triggerFeedback();
  };

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete in Supabase cloud
      await deleteSupabaseOrder(order.orderId);

      // 2. Delete locally
      deleteAdminOrder(order.orderId);

      router.push("/admin/orders");
    } catch (err) {
      console.error("Delete order error:", err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCopyTracking = () => {
    if (!order.trackingNumber && !trackingInput) return;
    const trackVal = trackingInput || order.trackingNumber || "";
    navigator.clipboard.writeText(trackVal);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const triggerFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeColor = (st: OrderStatus) => {
    switch (st) {
      case "draft":
        return "bg-zinc-100 text-zinc-700 border-zinc-300";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  // Financial calculations: (Subtotal - Discount) + Shipping Fee
  const subtotal =
    Number(order.pricing.subtotal) ||
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Number(order.pricing.discountAmount) || 0;
  const shippingFee = Number(order.pricing.shippingFee) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  // Is dispatch card active? Active especially when confirmed, shipped, or delivered
  const isDispatchActive =
    order.orderStatus === "confirmed" ||
    order.orderStatus === "shipped" ||
    order.orderStatus === "delivered";

  return (
    <>
      {/* Print Specific Global Stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }
              body, html {
                background-color: #ffffff !important;
                color: #1A1A1A !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              aside, header, nav, .no-print, button, a[href="/admin/orders"] {
                display: none !important;
              }
              main {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
              }
            }
          `,
        }}
      />

      {/* Screen Interactive Container (Hidden during window.print()) */}
      <div className="space-y-8 print:hidden">
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
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeColor(
                    order.orderStatus
                  )}`}
                >
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold text-brand-charcoal hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Delete Order
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
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-brand-charcoal">
                  Order Lifecycle Status
                </h3>
                <span className="text-xs text-zinc-400">
                  Click any status to update state
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "draft",
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
                        ? "bg-brand-charcoal text-white shadow-xs scale-[1.02]"
                        : "bg-[#FAF8F5] text-zinc-600 hover:bg-zinc-200/80 border border-brand-border/50"
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
              className={`bg-white p-6 rounded-2xl border shadow-2xs space-y-4 transition-all ${
                isDispatchActive
                  ? "border-brand-primary/40 ring-2 ring-brand-primary/10"
                  : "border-brand-border/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-brand-charcoal flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-primary" />
                  Dispatch & Courier Logistics
                  {isDispatchActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Active Delivery
                    </span>
                  )}
                </h3>

                {(order.trackingNumber || trackingInput) && (
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-[#FAF8F5] hover:bg-white text-brand-charcoal text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedTracking ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied Tracking!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Copy Tracking Code</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Courier partner presets */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Quick Select Courier Partner
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COURIER_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCourierInput(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        courierInput === p
                          ? "bg-brand-primary text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                      Courier Provider Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Steadfast / Pathao / RedX"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-[#FCFAF8]"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary font-mono uppercase bg-[#FCFAF8]"
                    />
                  </div>
                </div>
              </div>

              {/* Courier Dispatch Notes */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Courier Dispatch & Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched via Banani hub, fragile jewelry box handling"
                  value={courierNotesInput}
                  onChange={(e) => setCourierNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-[#FCFAF8]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Save Courier & Tracking Logistics
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
                      <div className="w-14 h-14 rounded-xl border border-brand-border/60 flex-shrink-0 overflow-hidden relative bg-brand-ivory flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-tr ${item.gradient || "from-pink-100 to-rose-100"} flex items-center justify-center p-1 text-center`}
                          >
                            <span className="font-serif text-[9px] text-zinc-700 italic line-clamp-2">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm text-brand-charcoal font-medium leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-400">Qty: {item.quantity}</span>
                          {item.selectedColor && (
                            <span className="text-[10px] font-medium bg-brand-blush text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
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
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      Coupon Discount {order.pricing.couponCode ? `(${order.pricing.couponCode})` : ""}:
                    </span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping Fee</span>
                  <span className="font-medium">
                    {shippingFee === 0
                      ? "FREE"
                      : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-brand-border font-serif text-base font-bold text-brand-charcoal">
                  <span>Total Receivable</span>
                  <span className="text-brand-primary text-xl">
                    {formatPrice(grandTotal)}
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

        {/* Luxury Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-brand-border/80 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-serif text-xl text-brand-charcoal">
                  Delete Order #{order.orderId}?
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Are you sure you want to delete this order for{" "}
                  <strong className="text-brand-charcoal">
                    {order.customer.fullName}
                  </strong>{" "}
                  ({formatPrice(grandTotal)})? This will remove all items and
                  order history from both Supabase cloud database and active records.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-brand-border/60 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order Reference:</span>
                  <span className="font-mono font-bold">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer Phone:</span>
                  <span className="font-mono">{order.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Current Status:</span>
                  <span className="uppercase font-semibold text-brand-charcoal">
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl border border-brand-border bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          LUXURY PRINTABLE INVOICE (Visible exclusively during window.print())
         ========================================================================= */}
      <div className="hidden print:block text-brand-charcoal bg-white p-8 sm:p-12 max-w-4xl mx-auto font-sans print:m-0 print:p-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-brand-primary/30 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-serif text-2xl font-bold flex items-center justify-center border-2 border-brand-champagne/40">
                A
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-brand-charcoal tracking-wide">
                  Adorn by Mashfika
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-primary font-semibold">
                  Elegance in Every Detail
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-600 space-y-0.5">
              <p className="font-medium">Dhaka, Bangladesh</p>
              <p>Official Phone: +880 1353-655433</p>
              <p>Email: contact@adornbymashfika.com</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-blush text-brand-primary text-[10px] font-bold uppercase tracking-wider border border-brand-primary/20 mb-2">
              Official Invoice
            </span>
            <h2 className="font-mono text-xl font-bold text-brand-charcoal">
              #{order.orderId}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Date: {new Date(order.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" })}
            </p>
            <p className="text-xs text-zinc-500">
              Status: <span className="uppercase font-semibold text-brand-charcoal">{order.orderStatus}</span>
            </p>
          </div>
        </div>

        {/* Bill To & Order Meta Grid */}
        <div className="grid grid-cols-2 gap-8 py-4 border-b border-zinc-200 mb-6 text-xs">
          <div>
            <h3 className="font-semibold uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
              Bill To / Customer Details
            </h3>
            <p className="font-bold text-sm text-brand-charcoal">
              {order.customer.fullName}
            </p>
            <p className="text-zinc-600 mt-1 font-mono">
              Phone: {order.customer.phone}
            </p>
            <p className="text-zinc-600 mt-1 leading-relaxed">
              Address: {order.customer.address}, {order.customer.city}
            </p>
            {order.customer.notes && (
              <p className="text-zinc-500 italic mt-2">
                Note: "{order.customer.notes}"
              </p>
            )}
          </div>

          <div className="text-right space-y-1.5">
            <h3 className="font-semibold uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
              Order Meta & Logistics
            </h3>
            <p className="text-zinc-600">
              <span className="text-zinc-400">Payment Method: </span>
              <strong className="text-brand-charcoal uppercase">
                {order.payment.method === "cod" ? "Cash on Delivery" : "bKash Manual"}
              </strong>
            </p>
            {order.payment.bkashTrxId && (
              <p className="text-zinc-600 font-mono">
                <span className="text-zinc-400">bKash TrxID: </span>
                <strong className="text-brand-primary">{order.payment.bkashTrxId}</strong>
              </p>
            )}
            <p className="text-zinc-600">
              <span className="text-zinc-400">Delivery Zone: </span>
              <strong>
                {order.customer.deliveryZone === "inside_dhaka" ? "Dhaka Metro Express" : "Nationwide Courier"}
              </strong>
            </p>
            {order.courierName && (
              <p className="text-zinc-600">
                <span className="text-zinc-400">Courier: </span>
                <strong>{order.courierName}</strong>
                {order.trackingNumber && ` (${order.trackingNumber})`}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="mb-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-brand-primary/20 text-brand-charcoal bg-brand-blush/40">
                <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider">Item Name</th>
                <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider text-center">Variant / Color</th>
                <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider text-center">Quantity</th>
                <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider text-right">Unit Price</th>
                <th className="py-2.5 px-3 font-semibold uppercase text-[10px] tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-lg border border-zinc-200"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-brand-charcoal leading-snug">{item.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-zinc-600">
                    {item.selectedColor || "Standard"}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-brand-charcoal">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-600 font-mono">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-charcoal font-mono">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2 text-xs border-t-2 border-brand-primary/20 pt-4">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-semibold font-mono text-brand-charcoal">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount {order.pricing.couponCode ? `(${order.pricing.couponCode})` : ""}:</span>
                <span className="font-mono">- {formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold font-mono text-brand-charcoal">
                {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 text-sm font-bold text-brand-charcoal">
              <span className="font-serif">Grand Total Receivable:</span>
              <span className="text-base text-brand-primary font-mono font-bold">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-zinc-200 text-center text-[11px] text-zinc-500 space-y-1">
          <p className="font-serif italic text-brand-charcoal font-medium">
            Thank you for shopping with Mashfika.
          </p>
          <p>
            For customer support, WhatsApp: <strong className="text-brand-primary font-mono">01353655433</strong>
          </p>
          <p className="text-[10px] text-zinc-400">
            Adorn by Mashfika — Elegance in Every Detail. Dhaka, Bangladesh.
          </p>
        </div>
      </div>
    </>
  );
}
