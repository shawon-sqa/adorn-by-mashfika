"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { AdminOrderRecord, OrderStatus, INITIAL_MOCK_ORDERS } from "@/lib/data/adminOrders";
import { formatPrice } from "@/lib/utils/formatters";

// Status pipeline mapping
const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  {
    key: "draft",
    label: "Draft",
    desc: "Order registered in boutique system",
  },
  {
    key: "pending",
    label: "Pending",
    desc: "Under concierge review & verification",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    desc: "Quality verified & packaged in velvet pouch",
  },
  {
    key: "shipped",
    label: "In Transit",
    desc: "Dispatched with courier partner",
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Handed over safely to recipient",
  },
];

function getStatusStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 1;
}

export function TrackOrderClient() {
  const searchParams = useSearchParams();
  const [orderRef, setOrderRef] = useState(
    searchParams.get("orderId") || searchParams.get("order") || searchParams.get("ref") || ""
  );
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [isSearching, setIsSearching] = useState(false);
  const [foundOrder, setFoundOrder] = useState<AdminOrderRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // If query parameters are present on load, trigger auto-search
  useEffect(() => {
    const qOrder = searchParams.get("orderId") || searchParams.get("order") || searchParams.get("ref");
    const qPhone = searchParams.get("phone");
    if (qOrder) {
      setOrderRef(qOrder);
      if (qPhone) {
        setPhone(qPhone);
        executeSearch(qOrder, qPhone);
      }
    }
  }, [searchParams]);

  const normalizePhone = (num: string) => {
    const clean = num.replace(/\D/g, "");
    if (clean.length > 11 && clean.startsWith("88")) {
      return clean.slice(2);
    }
    return clean;
  };

  const executeSearch = async (targetRef: string, targetPhone: string) => {
    const cleanRef = targetRef.trim().replace(/^#/, "").toUpperCase();
    const cleanEnteredPhone = normalizePhone(targetPhone);

    if (!cleanRef) {
      setErrorMessage("Please enter your Order Reference ID (e.g. ADM-928412).");
      return;
    }

    if (!cleanEnteredPhone || cleanEnteredPhone.length < 11) {
      setErrorMessage("Please enter a valid 11-digit Bangladeshi contact phone number.");
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      let matched: AdminOrderRecord | null = null;

      // 1. Attempt Supabase Query
      try {
        const supabase = createBrowserClient();
        const { data: dbOrders, error } = await supabase
          .from("orders")
          .select("*, order_items(*, products(id, title, images))")
          .or(`order_number.ilike.%${cleanRef}%,id.ilike.%${cleanRef}%`);

        if (!error && dbOrders && dbOrders.length > 0) {
          // Find matching by phone
          const candidate = dbOrders.find((ord: any) => {
            const dbPhone = normalizePhone(ord.customer_phone || "");
            return dbPhone.endsWith(cleanEnteredPhone) || cleanEnteredPhone.endsWith(dbPhone);
          });

          if (candidate) {
            // Transform to AdminOrderRecord structure
            const { cleanNotes, logistics, couponMeta } = parseNotes(candidate.notes);
            const items = (candidate.order_items || []).map((it: any) => ({
              id: it.product_id || it.id,
              title: it.product_name || it.product_title || it.products?.title || "Handcrafted Jewelry Item",
              price: Number(it.price ?? it.unit_price ?? 0),
              quantity: Number(it.quantity) || 1,
              selectedColor: it.variant || it.color || it.selected_color || undefined,
              gradient: "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]",
              imageUrl: it.image_url || it.product_image || it.products?.images?.[0] || undefined,
            }));

            matched = {
              orderId: candidate.order_number || candidate.id,
              createdAt: candidate.created_at,
              orderStatus: (candidate.status || "pending") as OrderStatus,
              customer: {
                fullName: candidate.customer_name || "Valued Customer",
                phone: candidate.customer_phone || targetPhone,
                deliveryZone: candidate.delivery_zone || "inside_dhaka",
                address: candidate.address || "Dhaka, Bangladesh",
                city: candidate.city || "Dhaka",
                notes: cleanNotes,
              },
              items: items.length > 0 ? items : [
                {
                  id: "item-1",
                  title: "Adorn Boutique Curated Order",
                  price: candidate.subtotal || candidate.total || 0,
                  quantity: 1,
                  gradient: "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]",
                },
              ],
              payment: {
                method: candidate.payment_method === "bkash_manual" ? "bkash_manual" : "cod",
                status: candidate.payment_method === "cod" ? "cod_payable" : "pending_verification",
                bkashSenderPhone: candidate.bkash_sender,
                bkashTrxId: candidate.bkash_trx_id,
              },
              pricing: {
                subtotal: candidate.subtotal || candidate.total,
                shippingFee: candidate.delivery_fee || 0,
                grandTotal: candidate.total,
                discountAmount: couponMeta?.discountAmount,
                couponCode: couponMeta?.couponCode,
              },
              estimatedDelivery:
                candidate.delivery_zone === "inside_dhaka"
                  ? "24 to 48 Hours (Dhaka Metro Express)"
                  : "3 to 5 Business Days (Nationwide Courier)",
              courierName: logistics?.courierName || (candidate.status === "shipped" || candidate.status === "delivered" ? "Steadfast Courier" : undefined),
              trackingNumber: logistics?.trackingNumber,
              courierNotes: logistics?.courierNotes,
            };
          }
        }
      } catch (sbErr) {
        console.warn("Supabase tracking fetch fallback:", sbErr);
      }

      // 2. Check Local Storage Orders if not matched from Supabase
      if (!matched && typeof window !== "undefined") {
        try {
          const directStored = localStorage.getItem(`adorn_order_${cleanRef}`);
          if (directStored) {
            const parsed = JSON.parse(directStored);
            const userPhone = normalizePhone(parsed.customer?.phone || "");
            if (userPhone.endsWith(cleanEnteredPhone) || cleanEnteredPhone.endsWith(userPhone)) {
              matched = {
                ...parsed,
                orderStatus: parsed.orderStatus || "pending",
              };
            }
          }

          if (!matched) {
            const adminRaw = localStorage.getItem("adorn_admin_orders");
            if (adminRaw) {
              const list: AdminOrderRecord[] = JSON.parse(adminRaw);
              const found = list.find((o) => {
                const idMatch = (o.orderId || "").toUpperCase().includes(cleanRef);
                const phoneMatch = normalizePhone(o.customer?.phone || "").endsWith(cleanEnteredPhone);
                return idMatch && phoneMatch;
              });
              if (found) matched = found;
            }
          }

          if (!matched) {
            const userRaw = localStorage.getItem("adorn_orders");
            if (userRaw) {
              const list = JSON.parse(userRaw);
              const found = list.find((o: any) => {
                const idMatch = (o.orderId || "").toUpperCase().includes(cleanRef);
                const phoneMatch = normalizePhone(o.customer?.phone || "").endsWith(cleanEnteredPhone);
                return idMatch && phoneMatch;
              });
              if (found) {
                matched = {
                  ...found,
                  orderStatus: found.orderStatus || "pending",
                };
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // 3. Check Initial Mock Orders (for immediate offline testing)
      if (!matched) {
        const mockFound = INITIAL_MOCK_ORDERS.find((o) => {
          const idMatch = (o.orderId || "").toUpperCase().includes(cleanRef);
          const phoneMatch = normalizePhone(o.customer?.phone || "").endsWith(cleanEnteredPhone);
          return idMatch && phoneMatch;
        });
        if (mockFound) matched = mockFound;
      }

      if (matched) {
        setFoundOrder(matched);
      } else {
        setFoundOrder(null);
        setErrorMessage(
          "We could not locate any order with this Reference ID and Contact Phone combination. Please verify your details or message our boutique concierge on WhatsApp."
        );
      }
    } catch {
      setErrorMessage("An unexpected error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(orderRef, phone);
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const activeStepIdx = foundOrder ? getStatusStepIndex(foundOrder.orderStatus) : 0;
  const isCancelled = foundOrder?.orderStatus === "cancelled";

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-serif uppercase tracking-[0.2em] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            Adorn Concierge Logistics
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#240610] tracking-tight">
            Track Your Boutique Order
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto font-light leading-relaxed">
            Enter your order reference number and recipient phone number below to receive live parcel and dispatch updates.
          </p>
        </div>

        {/* Tracking Search Form Card */}
        <div className="bg-white rounded-3xl border border-[#EAE3DE] shadow-xl shadow-[#4A1525]/5 p-6 sm:p-10 mb-10 transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Order Reference Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-2 font-serif">
                  Order Reference ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4A373]" />
                  <input
                    type="text"
                    required
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. ADM-928412"
                    className="w-full bg-[#FAF7F5] border border-[#EAE3DE] focus:border-[#4A1525] focus:bg-white focus:ring-2 focus:ring-[#D4A373]/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#240610] font-mono placeholder:text-zinc-400 placeholder:font-sans transition-all outline-none"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-2 font-serif">
                  Customer Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4A373]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#FAF7F5] border border-[#EAE3DE] focus:border-[#4A1525] focus:bg-white focus:ring-2 focus:ring-[#D4A373]/20 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#240610] font-mono placeholder:text-zinc-400 placeholder:font-sans transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] font-medium text-sm tracking-wide shadow-md shadow-[#4A1525]/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Searching Boutique Records...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Track Parcel Now
                  </>
                )}
              </button>

              {/* Quick sample link for convenient client verification */}
              <div className="text-xs text-zinc-500 text-center sm:text-right">
                Need a sample?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setOrderRef("ADM-928412");
                    setPhone("01711223344");
                    executeSearch("ADM-928412", "01711223344");
                  }}
                  className="text-[#4A1525] font-semibold underline hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Fill Sample Order (#ADM-928412)
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">{errorMessage}</p>
                <p className="text-xs text-amber-800/80">
                  Tip: Please ensure you are entering the same 11-digit phone number provided during checkout.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Tracking Result View */}
        {foundOrder && (
          <div className="space-y-8 animate-fadeIn">
            {/* Main Status & Order Header Card */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#FAF7F5] via-[#FAF7F5] to-[#F5EBE6] p-6 sm:p-8 border-b border-[#EAE3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                      ✦ Order Found
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#4A1525]/10 text-[#4A1525] border border-[#4A1525]/15 uppercase font-medium">
                      {foundOrder.orderStatus}
                    </span>
                  </div>
                  <h2 className="font-mono text-2xl sm:text-3xl font-bold text-[#240610] tracking-wider mt-1">
                    #{foundOrder.orderId}
                  </h2>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-zinc-600 space-y-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#4A1525]" />
                    Placed on:{" "}
                    <strong className="text-[#240610]">
                      {new Date(foundOrder.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                    Est. Delivery:{" "}
                    <strong className="text-[#240610]">{foundOrder.estimatedDelivery}</strong>
                  </span>
                </div>
              </div>

              {/* Progress Stepper Section */}
              <div className="p-6 sm:p-10">
                {isCancelled ? (
                  <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                    <h3 className="font-serif text-lg font-bold">This Order Has Been Cancelled</h3>
                    <p className="text-xs text-red-700 max-w-md mx-auto">
                      This order was cancelled by request or due to verification requirements. For any queries or store credit assistance, please contact our concierge team.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 font-serif mb-8 text-center sm:text-left">
                      Order Journey Progress
                    </h3>

                    {/* Stepper Grid */}
                    <div className="relative">
                      {/* Connecting Line Desktop */}
                      <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-[#EAE3DE] -z-0">
                        <div
                          className="h-full bg-gradient-to-r from-[#4A1525] to-[#D4A373] transition-all duration-700"
                          style={{
                            width: `${(Math.max(0, activeStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx < activeStepIdx;
                          const isCurrent = idx === activeStepIdx;
                          const isUpcoming = idx > activeStepIdx;

                          return (
                            <div
                              key={step.key}
                              className={`flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2 ${
                                isUpcoming ? "opacity-45" : "opacity-100"
                              }`}
                            >
                              {/* Step Icon Badge */}
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-sm transition-all duration-300 flex-shrink-0 ${
                                  isCompleted
                                    ? "bg-[#4A1525] text-white shadow-sm ring-4 ring-[#4A1525]/10"
                                    : isCurrent
                                    ? "bg-[#D4A373] text-[#240610] font-bold shadow-md ring-4 ring-[#D4A373]/30 scale-105 animate-pulse"
                                    : "bg-white border-2 border-[#EAE3DE] text-zinc-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-5 h-5 stroke-[2.5]" />
                                ) : isCurrent ? (
                                  <Truck className="w-5 h-5" />
                                ) : (
                                  idx + 1
                                )}
                              </div>

                              <div>
                                <span
                                  className={`block text-xs font-serif font-bold uppercase tracking-wider ${
                                    isCurrent ? "text-[#4A1525]" : "text-[#240610]"
                                  }`}
                                >
                                  {step.label}
                                </span>
                                <span className="text-[11px] text-zinc-500 font-light block leading-tight mt-0.5">
                                  {step.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courier Logistics Box */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-[#D4A373]" />
                <h3 className="font-serif text-lg text-[#240610] font-bold">
                  Logistics & Courier Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                    Courier Partner
                  </span>
                  <div className="text-sm font-semibold text-[#240610]">
                    {foundOrder.courierName || "Steadfast Courier (Metro & Nationwide)"}
                  </div>
                  <span className="text-[11px] text-[#4A1525] mt-1 inline-block">
                    ✓ Hand-to-hand doorstep delivery
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                    Consignment / Tracking ID
                  </span>
                  {foundOrder.trackingNumber ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-[#240610]">
                        {foundOrder.trackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(foundOrder.trackingNumber!)}
                        className="p-1 rounded text-zinc-500 hover:text-[#4A1525] hover:bg-white transition-all cursor-pointer"
                        title="Copy Consignment ID"
                      >
                        {copiedTracking ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      Assigned upon courier pickup
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Real-time SMS updates sent
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                    Delivery Destination
                  </span>
                  <div className="text-xs text-[#240610] leading-snug font-medium">
                    {foundOrder.customer?.address || "Address on File"}
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1">
                    {foundOrder.customer?.city || "Dhaka"}, Bangladesh
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items & Receivable Card */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-lg text-[#240610] font-bold mb-5 flex items-center justify-between">
                <span>Items in This Parcel</span>
                <span className="text-xs font-mono font-normal text-zinc-500">
                  {foundOrder.items.length} item{foundOrder.items.length > 1 ? "s" : ""}
                </span>
              </h3>

              <div className="divide-y divide-[#EAE3DE]/80">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#EAE3DE] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-[#D4A373]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[#240610] leading-tight line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Qty: {item.quantity}
                          {item.selectedColor && (
                            <span className="ml-2 text-zinc-400">
                              • Color: <strong className="text-zinc-600">{item.selectedColor}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm font-semibold text-[#240610]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-6 pt-5 border-t border-[#EAE3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF7F5] rounded-2xl p-4">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                    Payment Method & Status
                  </span>
                  <div className="text-xs font-semibold text-[#240610] flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {foundOrder.payment.method === "bkash_manual"
                      ? "bKash Verified Payment"
                      : "Cash on Delivery (Pay upon arrival)"}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">
                    Total Amount Receivable
                  </span>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#4A1525]">
                    {formatPrice(foundOrder.pricing.grandTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Concierge WhatsApp Assistance CTA */}
            <div className="bg-[#4A1525] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-[#4A1525]/15">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#D4A373] uppercase font-serif tracking-widest font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Boutique Concierge Assistance
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Have a question about your parcel delivery?
                </h3>
                <p className="text-xs sm:text-sm text-white/75 font-light max-w-md">
                  Our customer care team is available on WhatsApp daily from 10:00 AM to 11:00 PM to assist with address changes or timing requests.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={`https://wa.me/8801353655433?text=Hello%20Adorn%20by%20Mashfika%2C%20I%20am%20inquiring%20about%20my%20order%20%23${foundOrder.orderId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+8801353655433"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F3E5D8] border border-white/20 text-xs font-medium tracking-wider transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Concierge
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Initial Prompt State when no search executed yet */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-center">
            <div className="p-6 rounded-3xl bg-white border border-[#EAE3DE] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#240610]">Live Parcel Journey</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Follow real-time progress from boutique quality inspection to doorstep arrival.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#EAE3DE] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#240610]">Doorstep Inspection</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Inspect your tamper-proof velvet packaging before completing Cash on Delivery.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#EAE3DE] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center mx-auto">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#240610]">Dedicated Support</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Direct WhatsApp contact with our Dhaka headquarters for any scheduling notes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract logistics & coupon notes safely
function parseNotes(rawNotes?: string | null) {
  if (!rawNotes) return {};
  let currentNotes = rawNotes;
  let logistics: any = undefined;
  let couponMeta: any = undefined;

  const logisticsRegex = /<!--ADORN_LOGISTICS:(.*?)-->/;
  const logMatch = currentNotes.match(logisticsRegex);
  if (logMatch && logMatch[1]) {
    try {
      logistics = JSON.parse(logMatch[1]);
      currentNotes = currentNotes.replace(logisticsRegex, "");
    } catch {
      // ignore
    }
  }

  const couponRegex = /<!--ADORN_COUPON:(.*?)-->/;
  const cpnMatch = currentNotes.match(couponRegex);
  if (cpnMatch && cpnMatch[1]) {
    try {
      couponMeta = JSON.parse(cpnMatch[1]);
      currentNotes = currentNotes.replace(couponRegex, "");
    } catch {
      // ignore
    }
  }

  return { cleanNotes: currentNotes.trim(), logistics, couponMeta };
}
