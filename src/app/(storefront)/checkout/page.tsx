"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { checkoutFormSchema, OrderRecord } from "@/lib/validations/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { items, getSubtotal, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    deliveryZone: "inside_dhaka" as "inside_dhaka" | "outside_dhaka",
    address: "",
    city: "Dhaka",
    notes: "",
    paymentMethod: "cod" as "cod" | "bkash_manual",
    bkashSenderPhone: "",
    bkashTrxId: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();

  // Dynamic Shipping Calculation:
  // Inside Dhaka: ৳70 (Free if subtotal >= ৳2,000)
  // Outside Dhaka: ৳130 (Flat)
  const shippingFee =
    formData.deliveryZone === "inside_dhaka"
      ? subtotal >= 2000
        ? 0
        : 70
      : 130;

  const grandTotal = subtotal + shippingFee;

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-blush text-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <h1 className="font-serif text-3xl text-brand-charcoal">Your bag is empty</h1>
        <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
          You need at least one creation in your shopping bag before proceeding to checkout.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white text-sm font-semibold tracking-wide hover:bg-brand-primary-hover transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore The Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Auto-update default city when zone switches
      ...(field === "deliveryZone" && {
        city: value === "inside_dhaka" ? "Dhaka" : prev.city === "Dhaka" ? "" : prev.city,
      }),
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    // Validate form inputs with Zod
    const result = checkoutFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setValidationErrors(fieldErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    // Simulate order placement delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate unique order ID
    const generatedId = `ADM-${Math.floor(100000 + Math.random() * 900000)}`;
    const estimatedDelivery =
      formData.deliveryZone === "inside_dhaka"
        ? "24 to 48 Hours (Dhaka Metro Express)"
        : "3 to 5 Business Days (Nationwide Courier)";

    const orderRecord: OrderRecord = {
      orderId: generatedId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        deliveryZone: formData.deliveryZone,
        address: formData.address,
        city: formData.city,
        notes: formData.notes,
      },
      items: items.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        gradient: item.product.gradient,
      })),
      payment: {
        method: formData.paymentMethod,
        status:
          formData.paymentMethod === "bkash_manual"
            ? "pending_verification"
            : "cod_payable",
        bkashSenderPhone: formData.bkashSenderPhone,
        bkashTrxId: formData.bkashTrxId,
      },
      pricing: {
        subtotal,
        shippingFee,
        grandTotal,
      },
      estimatedDelivery,
    };

    // Store order into localStorage
    try {
      const existingRaw = localStorage.getItem("adorn_orders");
      const existingOrders: OrderRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingOrders.unshift(orderRecord);
      localStorage.setItem("adorn_orders", JSON.stringify(existingOrders));
      localStorage.setItem(`adorn_order_${generatedId}`, JSON.stringify(orderRecord));
    } catch {
      // Graceful fallback
    }

    // Clear cart and navigate to confirmation
    clearCart();
    router.push(`/order-success/${generatedId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-primary mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
          <Lock className="w-3.5 h-3.5 text-brand-primary" />
          SSL Encrypted & Safe Order Placement
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact & Delivery Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6">
            <h2 className="font-serif text-xl text-brand-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-blush text-brand-primary text-xs font-bold flex items-center justify-center">
                1
              </span>
              Delivery Address & Contact
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mashfika Rahman"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.fullName
                      ? "border-red-400 bg-red-50/20"
                      : "border-brand-border focus:border-brand-primary bg-brand-ivory/20"
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.fullName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Mobile Number (BD) *
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX (11 digits)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.phone
                      ? "border-red-400 bg-red-50/20"
                      : "border-brand-border focus:border-brand-primary bg-brand-ivory/20"
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-2">
                  Select Delivery Zone *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("deliveryZone", "inside_dhaka")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryZone === "inside_dhaka"
                        ? "border-brand-primary bg-brand-blush/60 shadow-xs"
                        : "border-brand-border bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-brand-charcoal">
                        Inside Dhaka
                      </span>
                      <Truck className="w-4 h-4 text-brand-primary" />
                    </div>
                    <span className="text-xs text-brand-primary font-bold">
                      {subtotal >= 2000 ? "FREE Delivery" : "৳ 70 Shipping"}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">24 - 48 Hours Delivery</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange("deliveryZone", "outside_dhaka")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryZone === "outside_dhaka"
                        ? "border-brand-primary bg-brand-blush/60 shadow-xs"
                        : "border-brand-border bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-brand-charcoal">
                        Outside Dhaka
                      </span>
                      <Truck className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-xs font-semibold text-brand-charcoal">
                      ৳ 130 Flat Shipping
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">3 - 5 Days Courier</p>
                  </button>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Detailed Delivery Address *
                </label>
                <textarea
                  rows={3}
                  placeholder="House number, road number, flat/apt, area, prominent landmark..."
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.address
                      ? "border-red-400 bg-red-50/20"
                      : "border-brand-border focus:border-brand-primary bg-brand-ivory/20"
                  }`}
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.address}
                  </p>
                )}
              </div>

              {/* District / City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  City / District *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka / Chittagong / Sylhet"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.city
                      ? "border-red-400 bg-red-50/20"
                      : "border-brand-border focus:border-brand-primary bg-brand-ivory/20"
                  }`}
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.city}
                  </p>
                )}
              </div>

              {/* Optional Order Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Order Note / Gift Wrapping Request (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any delivery instructions or gift note..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border focus:border-brand-primary bg-brand-ivory/20 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6">
            <h2 className="font-serif text-xl text-brand-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-blush text-brand-primary text-xs font-bold flex items-center justify-center">
                2
              </span>
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Option: Cash on Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === "cod"
                    ? "border-brand-primary bg-brand-blush/40"
                    : "border-brand-border bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={() => handleInputChange("paymentMethod", "cod")}
                  className="mt-1 accent-[#B76E79]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-brand-charcoal">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] font-bold bg-brand-champagne-light text-brand-charcoal px-2 py-0.5 rounded uppercase">
                      Popular
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pay securely in cash directly to the delivery person once your parcel arrives.
                  </p>
                </div>
              </label>

              {/* Option: bKash / Nagad Manual Payment */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === "bkash_manual"
                    ? "border-brand-primary bg-brand-blush/40"
                    : "border-brand-border bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash_manual"
                  checked={formData.paymentMethod === "bkash_manual"}
                  onChange={() => handleInputChange("paymentMethod", "bkash_manual")}
                  className="mt-1 accent-[#B76E79]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm text-brand-charcoal">
                    bKash / Nagad (Send Money / Merchant)
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pay upfront to fast-track your dispatch and avoid handling loose cash.
                  </p>
                </div>
              </label>

              {/* bKash Manual Inputs Instructions */}
              {formData.paymentMethod === "bkash_manual" && (
                <div className="mt-3 p-5 rounded-2xl bg-brand-blush-subtle border border-brand-primary/20 space-y-4 animate-in fade-in-50">
                  <div className="text-xs text-zinc-700 space-y-1.5">
                    <p className="font-semibold text-brand-charcoal">
                      Please send <span className="text-brand-primary font-bold">{formatPrice(grandTotal)}</span> to:
                    </p>
                    <p className="font-mono bg-white inline-block px-3 py-1.5 rounded-lg border border-brand-border text-sm font-bold text-brand-charcoal">
                      bKash Personal: 01700-000000
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Select <strong>Send Money</strong> or <strong>Make Payment</strong>, then enter the sender number and TrxID below for verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                        bKash Sender Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.bkashSenderPhone}
                        onChange={(e) => handleInputChange("bkashSenderPhone", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                        bKash Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BL9A7K80PX"
                        value={formData.bkashTrxId}
                        onChange={(e) => handleInputChange("bkashTrxId", e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary font-mono uppercase"
                      />
                    </div>
                  </div>

                  {validationErrors.bkashTrxId && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.bkashTrxId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-xs space-y-6 sticky top-28">
            <h2 className="font-serif text-xl text-brand-charcoal">Order Summary</h2>

            {/* Items review */}
            <div className="divide-y divide-brand-border/60 max-h-72 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${item.product.gradient} border border-brand-border/60 flex-shrink-0 flex items-center justify-center p-1 text-center`}
                  >
                    <span className="font-serif text-[9px] text-zinc-700 italic line-clamp-2">
                      {item.product.title}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs text-brand-charcoal truncate font-medium">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-xs text-brand-charcoal">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-brand-border/60 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium text-brand-charcoal">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Delivery Charge</span>
                <span className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE (Dhaka Offer)</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-brand-border font-serif text-lg">
                <span className="font-bold text-brand-charcoal">Total Amount</span>
                <span className="font-bold text-2xl text-brand-primary">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="bg-brand-blush/40 p-4 rounded-2xl space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Damage-proof luxury velvet & box packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Inspect your parcel upon delivery</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Your Order...
                </>
              ) : (
                `Confirm Order • ${formatPrice(grandTotal)}`
              )}
            </button>

            <p className="text-[11px] text-zinc-400 text-center">
              By confirming, you agree to Adorn by Mashfika's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
