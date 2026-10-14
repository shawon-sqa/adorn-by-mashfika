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
  Plus,
  Minus,
  Trash2,
  Tag,
  Loader2,
  X,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { checkoutFormSchema, OrderRecord } from "@/lib/validations/checkout";
import { validateCouponCode } from "@/lib/data/supabaseCoupons";
import { encodeOrderNotes } from "@/lib/data/supabaseOrders";
import { useStoreSettings } from "@/lib/data/storeSettings";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const storeSettings = useStoreSettings();

  const insideFee = Number(storeSettings.insideDhakaDeliveryFee) || 70;
  const outsideFee = Number(storeSettings.outsideDhakaDeliveryFee) || 130;
  const freeThreshold = Number(storeSettings.freeDeliveryThreshold) || 2000;
  const bkashNumber = storeSettings.bkashNumber || "01353655433";

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const {
    items,
    appliedCoupon,
    shopperName,
    shopperPhone,
    shopperEmail,
    setShopperDetails,
    getSubtotal,
    getDiscountAmount,
    applyCoupon,
    removeCoupon,
    clearCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

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
    if (shopperName || shopperPhone) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || shopperName || "",
        phone: prev.phone || shopperPhone || "",
      }));
    }
  }, [shopperName, shopperPhone]);

  // Safely sync shopper details back to cart store in an effect without updating during render
  useEffect(() => {
    if (
      (formData.fullName && formData.fullName !== shopperName) ||
      (formData.phone && formData.phone !== shopperPhone)
    ) {
      setShopperDetails({
        name: formData.fullName,
        phone: formData.phone,
      });
    }
  }, [formData.fullName, formData.phone, shopperName, shopperPhone, setShopperDetails]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F5]">
        <div className="w-8 h-8 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  // Compute discount amount accurately:
  // If percentage: Math.round((subtotal * coupon.discount_value) / 100)
  // If fixed: Math.min(coupon.discount_value, subtotal)
  const appliedDiscount = appliedCoupon
    ? appliedCoupon.min_order_amount && subtotal < appliedCoupon.min_order_amount
      ? 0
      : appliedCoupon.type === "percentage"
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0;

  // Dynamic Shipping Calculation from Store Settings:
  const shippingFee =
    formData.deliveryZone === "inside_dhaka"
      ? subtotal >= freeThreshold
        ? 0
        : insideFee
      : outsideFee;

  // Grand total calculation:
  const grandTotal = Math.max(0, subtotal - appliedDiscount) + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    try {
      const res = await validateCouponCode(code, subtotal);

      if (!res.valid || !res.coupon) {
        setCouponError(res.error || "Invalid coupon code.");
        return;
      }

      const calculatedDiscount =
        res.coupon.type === "percentage"
          ? Math.round((subtotal * res.coupon.discount_value) / 100)
          : Math.min(res.coupon.discount_value, subtotal);

      applyCoupon(res.coupon, calculatedDiscount);
      setCouponSuccess(`Coupon ${res.coupon.code} applied!`);
      setCouponInput("");
      setTimeout(() => setCouponSuccess(null), 3000);
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF7F5] py-20 px-4">
        <div className="max-w-md w-full mx-auto text-center bg-white border border-[#EAE3DE] shadow-sm rounded-2xl p-8 sm:p-10">
          <div className="w-20 h-20 bg-[#4A1525]/10 text-[#4A1525] border border-[#D4A373]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 opacity-70" />
          </div>
          <h1 className="font-serif text-3xl text-[#240610]">Your bag is empty</h1>
          <p className="mt-3 text-sm text-zinc-500 max-w-sm mx-auto">
            You need at least one creation in your shopping bag before proceeding to checkout.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] text-sm font-semibold tracking-wide transition-colors shadow-md shadow-[#4A1525]/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Explore The Collection
            </Link>
          </div>
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
        imageUrl: item.product.images?.[0] || undefined,
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
        discountAmount: appliedDiscount > 0 ? appliedDiscount : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      },
      estimatedDelivery,
    };

    // 1. Insert into Supabase cloud database
    try {
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();

      // Encode coupon metadata alongside customer notes so admin portal can display the used coupon
      const finalNotes = encodeOrderNotes(formData.notes || "", undefined, {
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: appliedDiscount > 0 ? appliedDiscount : undefined,
      });

      let finalInsertedOrder: any = null;

      // Base payload matching verified database schema
      const baseOrderPayload = {
        order_number: generatedId,
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        delivery_zone: formData.deliveryZone,
        address: formData.address,
        city: formData.city,
        payment_method: formData.paymentMethod,
        subtotal,
        delivery_fee: shippingFee,
        total: grandTotal,
        status: "pending",
        bkash_sender: formData.bkashSenderPhone || null,
        bkash_trx_id: formData.bkashTrxId || null,
        notes: finalNotes || null,
      };

      const { data: insertedOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          ...baseOrderPayload,
          total_amount: grandTotal,
          discount_amount: appliedDiscount > 0 ? appliedDiscount : 0,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        } as any)
        .select()
        .single();

      if (orderError) {
        // Fallback for database schema if extra columns aren't in table schema
        const { data: fallbackOrder, error: fallbackError } = await supabase
          .from("orders")
          .insert(baseOrderPayload)
          .select()
          .single();

        if (!fallbackError && fallbackOrder) {
          finalInsertedOrder = fallbackOrder;
        }
      } else if (insertedOrder) {
        finalInsertedOrder = insertedOrder;
      }

      if (finalInsertedOrder?.id) {
        // Insert order items
        const orderItemsPayload = items.map((item) => ({
          order_id: finalInsertedOrder.id,
          product_id: item.product.id,
          product_title: item.selectedColor
            ? `${item.product.title} (Color: ${item.selectedColor})`
            : item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          image_url: item.product.images?.[0] || null,
        }));

        await supabase.from("order_items").insert(orderItemsPayload);
      }

      // Loop through all ordered items and decrement stock for each product in Supabase
      const { decrementProductStock } = await import("@/lib/data/supabaseProducts");
      for (const item of items) {
        try {
          await decrementProductStock(item.product.id, item.quantity);
        } catch (stockErr) {
          console.error(`[Checkout] Failed to decrement stock for item ${item.product.id}:`, stockErr);
        }
      }
    } catch (sbErr) {
      console.warn("Supabase insertion fallback to local storage:", sbErr);
    }

    // 2. Also keep localStorage copy for immediate offline/client receipt rendering
    try {
      const existingRaw = localStorage.getItem("adorn_orders");
      const existingOrders: OrderRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingOrders.unshift(orderRecord);
      localStorage.setItem("adorn_orders", JSON.stringify(existingOrders));
      localStorage.setItem(`adorn_order_${generatedId}`, JSON.stringify(orderRecord));
    } catch {
      // Graceful fallback
    }

    // 3. Mark abandoned cart session as CONVERTED so it is updated in Supabase abandoned_carts
    try {
      const { markCartSessionConverted } = await import("@/lib/utils/cartTracker");
      await markCartSessionConverted();

      const { markCartAsConverted } = await import("@/lib/data/cartsRecovery");
      await markCartAsConverted();
    } catch (convertErr) {
      console.warn("[Checkout] Failed to mark cart as converted:", convertErr);
    }

    // Clear cart and navigate to confirmation
    clearCart();
    router.push(`/order-success/${generatedId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#4A1525] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#240610]">
            Secure Checkout
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#4A1525]" />
            SSL Encrypted & Safe Order Placement
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Customer Contact & Delivery Details */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3DE] shadow-sm space-y-6">
            <h2 className="font-serif text-xl text-[#240610] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A1525]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-bold flex items-center justify-center">
                1
              </span>
              Delivery Address & Contact
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name (e.g., Mashfika)"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.fullName
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#E7DFD8] focus:border-[#4A1525] bg-[#FAF7F5]/30"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Mobile Number (BD) *
                </label>
                <input
                  type="tel"
                  placeholder="Enter your 11-digit mobile number (e.g., 017XXXXXXXX)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.phone
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#E7DFD8] focus:border-[#4A1525] bg-[#FAF7F5]/30"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-2">
                  Select Delivery Zone *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("deliveryZone", "inside_dhaka")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryZone === "inside_dhaka"
                        ? "border-[#D4A373] bg-[#FAF7F5] text-[#240610] shadow-sm ring-2 ring-[#D4A373]/30"
                        : "border-[#EAE3DE] bg-white hover:border-[#D4A373]/50 text-[#554348]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[#240610]">
                        Inside Dhaka
                      </span>
                      <Truck className="w-4 h-4 text-[#4A1525]" />
                    </div>
                    <span className="text-xs text-[#4A1525] font-bold">
                      {subtotal >= freeThreshold ? "FREE Delivery" : `৳ ${insideFee} Shipping`}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">24 - 48 Hours Delivery</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange("deliveryZone", "outside_dhaka")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      formData.deliveryZone === "outside_dhaka"
                        ? "border-[#D4A373] bg-[#FAF7F5] text-[#240610] shadow-sm ring-2 ring-[#D4A373]/30"
                        : "border-[#EAE3DE] bg-white hover:border-[#D4A373]/50 text-[#554348]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[#240610]">
                        Outside Dhaka
                      </span>
                      <Truck className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-xs font-semibold text-[#240610]">
                      ৳ {outsideFee} Flat Shipping
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">3 - 5 Days Courier</p>
                  </button>
                </div>
              </div>

              {/* Detailed Street Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Detailed Delivery Address *
                </label>
                <textarea
                  rows={3}
                  placeholder="House no., Road no., Area / Thana"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.address
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#E7DFD8] focus:border-[#4A1525] bg-[#FAF7F5]/30"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  City / District *
                </label>
                <input
                  type="text"
                  placeholder="Select or enter your city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${
                    validationErrors.city
                      ? "border-red-400 bg-red-50/20"
                      : "border-[#E7DFD8] focus:border-[#4A1525] bg-[#FAF7F5]/30"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#240610] mb-1.5">
                  Order Note / Gift Wrapping Request (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any special delivery instructions (optional)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E7DFD8] focus:border-[#4A1525] bg-[#FAF7F5]/30 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Selection */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3DE] shadow-sm space-y-6">
            <h2 className="font-serif text-xl text-[#240610] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4A1525]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-bold flex items-center justify-center">
                2
              </span>
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Option: Cash on Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === "cod"
                    ? "border-[#D4A373] bg-[#FAF7F5] shadow-sm ring-2 ring-[#D4A373]/30"
                    : "border-[#EAE3DE] bg-white hover:border-[#D4A373]/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={() => handleInputChange("paymentMethod", "cod")}
                  className="mt-1 accent-[#4A1525]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#240610]">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] font-bold bg-[#D4A373]/20 text-[#4A1525] border border-[#D4A373]/30 px-2.5 py-0.5 rounded-full uppercase">
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
                    ? "border-[#D4A373] bg-[#FAF7F5] shadow-sm ring-2 ring-[#D4A373]/30"
                    : "border-[#EAE3DE] bg-white hover:border-[#D4A373]/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash_manual"
                  checked={formData.paymentMethod === "bkash_manual"}
                  onChange={() => handleInputChange("paymentMethod", "bkash_manual")}
                  className="mt-1 accent-[#4A1525]"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm text-[#240610]">
                    bKash / Nagad (Send Money / Merchant)
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pay upfront to fast-track your dispatch and avoid handling loose cash.
                  </p>
                </div>
              </label>

              {/* bKash Manual Inputs Instructions */}
              {formData.paymentMethod === "bkash_manual" && (
                <div className="mt-3 p-5 rounded-2xl bg-[#FAF7F5] border border-[#D4A373]/30 space-y-4 animate-in fade-in-50">
                  <div className="text-xs text-zinc-700 space-y-1.5">
                    <p className="font-semibold text-[#240610]">
                      Please send <span className="text-[#4A1525] font-bold">{formatPrice(grandTotal)}</span> to:
                    </p>
                    <p className="font-mono bg-white inline-block px-3 py-1.5 rounded-lg border border-[#E7DFD8] text-sm font-bold text-[#4A1525]">
                      bKash / Nagad: {bkashNumber}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Select <strong>Send Money</strong> or <strong>Make Payment</strong>, then enter the sender number and TrxID below for verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#240610] mb-1">
                        bKash Sender Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your 11-digit mobile number (e.g., 017XXXXXXXX)"
                        value={formData.bkashSenderPhone}
                        onChange={(e) => handleInputChange("bkashSenderPhone", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7DFD8] bg-white text-xs focus:outline-none focus:border-[#4A1525]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#240610] mb-1">
                        bKash Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BL9A7K80PX"
                        value={formData.bkashTrxId}
                        onChange={(e) => handleInputChange("bkashTrxId", e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7DFD8] bg-white text-xs focus:outline-none focus:border-[#4A1525] font-mono uppercase"
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
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3DE] shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#240610]">Order Summary</h2>
              <span className="text-xs text-[#4A1525] font-semibold bg-[#4A1525]/10 px-2.5 py-0.5 rounded-full border border-[#D4A373]/30">
                {items.reduce((acc, i) => acc + i.quantity, 0)} item{items.reduce((acc, i) => acc + i.quantity, 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Temporary Stock Notice Banner */}
            {stockNotice && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{stockNotice}</span>
              </div>
            )}

            {/* Items review with Quantity Modifiers */}
            <div className="divide-y divide-[#F0EAE5] max-h-80 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const maxStock = item.product.stockCount ?? (item.product.inStock ? 99 : 0);
                const isAtMaxStock = item.quantity >= maxStock;

                return (
                  <div key={idx} className="py-3.5 first:pt-0 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-[#F0EAE5] flex-shrink-0 overflow-hidden relative bg-[#FAF7F5] flex items-center justify-center">
                      {item.product.images && item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-tr ${item.product.gradient} flex items-center justify-center p-1 text-center`}
                        >
                          <span className="font-serif text-[9px] text-zinc-700 italic line-clamp-2">
                            {item.product.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs text-[#240610] truncate font-medium">
                        {item.product.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-zinc-400">
                          {formatPrice(item.product.price)} each
                        </span>
                        {item.selectedColor && (
                          <span className="text-[10px] font-medium bg-[#FAF7F5] text-[#4A1525] px-1.5 py-0.2 rounded border border-[#E7DFD8]">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>

                      {/* Interactive Quantity Adjuster */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center rounded-lg border border-[#E7DFD8] bg-[#FAF7F5] p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity === 1) {
                                const confirmRemove = window.confirm(
                                  `Remove "${item.product.title}" from your order?`
                                );
                                if (confirmRemove) {
                                  removeItem(item.product.id, item.selectedColor);
                                }
                              } else {
                                updateQuantity(item.product.id, item.quantity - 1, item.selectedColor);
                              }
                            }}
                            title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                            className="w-6 h-6 flex items-center justify-center rounded text-[#240610] hover:bg-white hover:text-[#4A1525] transition-colors cursor-pointer"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3 h-3 text-red-500" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>

                          <span className="w-7 text-center font-semibold text-xs text-[#240610]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={isAtMaxStock}
                            onClick={() => {
                              const res = updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedColor
                              );
                              if (!res.success && res.message) {
                                setStockNotice(res.message);
                                setTimeout(() => setStockNotice(null), 3500);
                              }
                            }}
                            title={isAtMaxStock ? "Max stock reached" : "Increase quantity"}
                            className="w-6 h-6 flex items-center justify-center rounded text-[#240610] hover:bg-white hover:text-[#4A1525] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Direct remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            const confirmRemove = window.confirm(
                              `Remove "${item.product.title}" from your order?`
                            );
                            if (confirmRemove) {
                              removeItem(item.product.id, item.selectedColor);
                            }
                          }}
                          className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-semibold text-xs text-[#240610] block">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Redemption Input / Applied Tag */}
            <div className="pt-2 border-t border-[#EAE3DE] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#240610] block">
                Have a coupon or promo code?
              </span>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F5] border border-[#D4A373]/30 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#4A1525] text-[#D4A373]">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="font-mono font-bold tracking-wider text-[#4A1525]">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.discount_value}% savings applied`
                          : `${formatPrice(appliedCoupon.discount_value)} savings applied`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    title="Remove coupon"
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter coupon code (e.g. ADORN50)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError(null);
                        }}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E7DFD8] bg-[#FAF7F5]/30 text-xs font-mono uppercase focus:outline-none focus:border-[#4A1525] tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={handleApplyCoupon}
                      className="px-5 py-2.5 rounded-xl bg-[#4A1525] text-[#F3E5D8] text-xs font-semibold hover:bg-[#3B0E1B] transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[70px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {couponSuccess}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-[#EAE3DE] text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium text-[#240610]">{formatPrice(subtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold animate-in fade-in">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#4A1525]" />
                    Coupon Discount ({appliedCoupon?.code})
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    - ৳ {appliedDiscount.toLocaleString()}
                  </span>
                </div>
              )}

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

              <div className="flex justify-between items-baseline pt-3 border-t border-[#EAE3DE] font-serif text-lg">
                <span className="font-bold text-[#240610]">Total Amount</span>
                <span className="font-bold text-2xl text-[#4A1525] font-serif">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#EAE3DE] space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Damage-proof luxury velvet & box packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Inspect your parcel upon delivery</span>
              </div>
            </div>

            {/* Submit Order Button: Luxury Burgundy Primary CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] font-bold text-sm transition-all shadow-lg shadow-[#4A1525]/25 hover:shadow-xl hover:shadow-[#4A1525]/35 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
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
  </div>
  );
}
