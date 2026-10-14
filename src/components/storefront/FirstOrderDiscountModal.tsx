"use client";

import { useState, useEffect } from "react";
import {
  X,
  Gift,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { fetchStoreSettings, getLocalStoreSettings } from "@/lib/data/storeSettings";
import { createCoupon } from "@/lib/data/supabaseCoupons";
import { syncStorefrontCartSession } from "@/lib/data/cartsRecovery";

const POPUP_DISMISS_KEY = "adorn_first_order_popup_dismissed";
const BD_PHONE_REGEX = /^(?:\+?88|0088)?01[3-9]\d{8}$/;

export function FirstOrderDiscountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { applyCoupon, getSubtotal } = useCartStore();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let mounted = true;

    // Check local settings first for immediate suppression
    const local = getLocalStoreSettings();
    const isLocalAllowed =
      local.show_first_order_popup !== undefined
        ? local.show_first_order_popup === true
        : local.enableFirstOrderPopup === true;

    if (!isLocalAllowed) {
      setIsOpen(false);
      return;
    }

    try {
      const dismissed = localStorage.getItem(POPUP_DISMISS_KEY);
      const claimed = localStorage.getItem("adorn_claimed_first_discount");
      if (dismissed || claimed) return;

      // Also confirm with live store settings from Supabase / updated cache
      fetchStoreSettings().then((liveSettings) => {
        if (!mounted) return;
        const isLiveAllowed =
          liveSettings.show_first_order_popup !== undefined
            ? liveSettings.show_first_order_popup === true
            : liveSettings.enableFirstOrderPopup === true;

        if (!isLiveAllowed) {
          setIsOpen(false);
          return;
        }

        timer = setTimeout(() => {
          if (mounted) setIsOpen(true);
        }, 1500);
      });
    } catch {
      // ignore
    }

    // Listen to live settings changes (e.g. admin toggles off in another tab)
    const handleSettingsUpdate = (e: Event) => {
      const updated = (e as CustomEvent).detail || getLocalStoreSettings();
      const allowed =
        updated.show_first_order_popup !== undefined
          ? updated.show_first_order_popup === true
          : updated.enableFirstOrderPopup === true;
      if (!allowed) {
        setIsOpen(false);
      }
    };

    window.addEventListener("adorn_store_settings_updated", handleSettingsUpdate);
    window.addEventListener("storage", handleSettingsUpdate);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("adorn_store_settings_updated", handleSettingsUpdate);
      window.removeEventListener("storage", handleSettingsUpdate);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(POPUP_DISMISS_KEY, "true");
    } catch {
      // ignore
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!BD_PHONE_REGEX.test(cleanPhone)) {
      setPhoneError("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)");
      return;
    }

    setSubmitting(true);

    // Format: ADORN-XXXX (random uppercase alphanumeric)
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueCouponCode = `ADORN-${randomChars}`;
    setGeneratedCode(uniqueCouponCode);

    const newCouponPayload = {
      code: uniqueCouponCode,
      type: "fixed" as const,
      discount_value: 50,
      description: `First-order welcome gift for ${name.trim() || "Visitor"}`,
      min_order_amount: 0,
      requires_email: true,
      requires_phone: true,
      redemption_type: "one_time" as const,
      max_uses: 1,
      max_uses_per_customer: 1,
      starts_at: null,
      ends_at: null,
      status: "active" as const,
    };

    // Dynamic & Unique First-Order Coupon Generation
    let couponCreatedSuccessfully = false;
    try {
      const res = await createCoupon(newCouponPayload);
      if (res.data) {
        applyCoupon(res.data, 50);
        couponCreatedSuccessfully = true;
      }
    } catch (couponErr: any) {
      console.warn("Coupon insert notice (will fallback locally):", couponErr?.message);
    }

    if (!couponCreatedSuccessfully) {
      applyCoupon(
        {
          id: `cpn-${Date.now()}`,
          ...newCouponPayload,
          used_count: 0,
          created_at: new Date().toISOString(),
        },
        50
      );
    }

    try {
      localStorage.setItem(POPUP_DISMISS_KEY, "true");
      localStorage.setItem("adorn_claimed_first_discount", "true");
      localStorage.setItem("adorn_last_generated_coupon", uniqueCouponCode);

      const customerName = name.trim();
      const customerEmail = email.trim().toLowerCase();
      const customerPhone = cleanPhone;

      // 1. Store name, phone, and email inside cartStore and localStorage
      useCartStore.getState().setShopperDetails({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      });
      localStorage.setItem("adorn_shopper_name", customerName);
      localStorage.setItem("adorn_shopper_phone", customerPhone);
      localStorage.setItem("adorn_shopper_email", customerEmail);

      // 2. Persistent guest cart session id - Validate or generate UUID v4
      const rawSessionId = localStorage.getItem("adorn_cart_session_id") || localStorage.getItem("cart_session_id");
      const isValidUuid =
        rawSessionId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawSessionId);
      const cartSessionId = isValidUuid
        ? rawSessionId
        : typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

      localStorage.setItem("adorn_cart_session_id", cartSessionId);
      localStorage.setItem("cart_session_id", cartSessionId);

      const currentCartState = useCartStore.getState();
      const currentCartItems = currentCartState.items.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        selectedColor: i.selectedColor,
        color: i.selectedColor,
        image: i.product.images?.[0] || null,
        imageUrl: i.product.images?.[0] || null,
      }));
      const currentCartTotal = currentCartState.getSubtotal() || 0;

      // 3. Immediately perform an explicit Supabase upsert directly into the abandoned_carts table
      const { createBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createBrowserClient();

      const payload = {
        id: cartSessionId,
        shopper_name: customerName,
        shopper_email: customerEmail,
        shopper_phone: customerPhone,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        items: currentCartItems || [],
        cart_total: currentCartTotal || 0,
        cart_value: currentCartTotal || 0,
        status: "ACTIVE",
        last_active: new Date().toISOString(),
      };

      const { error } = await supabase.from("abandoned_carts").upsert(payload, { onConflict: "id" });
      if (error) {
        console.error("Abandoned cart sync error:", error);
      } else {
        console.log("Abandoned cart saved successfully!");
      }
    } catch (claimErr) {
      console.error("Abandoned cart sync error:", claimErr);
    }

    setSubmitting(false);
    setUnlocked(true);
  };

  const handleCopy = () => {
    const codeToCopy = generatedCode || "WELCOME50";
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-brand-border/80 overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close gift popup"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-zinc-400 hover:text-brand-charcoal transition-colors z-20 cursor-pointer shadow-2xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-[#FAF7F5] via-[#FAF7F5] to-[#F5EBE6] p-6 text-center border-b border-[#EAE3DE] relative">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#4A1525] border border-[#D4A373]/30">
            <Gift className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#4A1525] border border-[#D4A373]/30 text-[10px] font-bold tracking-wider uppercase mb-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#D4A373]" />
            Special Welcome Gift
          </div>

          <h3 className="font-serif text-2xl text-[#240610] mt-1 tracking-tight">
            Get ৳50 off your first order!
          </h3>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto font-light">
            Unlock this offer, just tell us where to send it
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!unlocked ? (
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                  Your name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mashfika"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                  Email address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                  Phone number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors bg-zinc-50/50 font-mono ${
                    phoneError
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-brand-border focus:border-brand-primary"
                  }`}
                />
                {phoneError && (
                  <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Unlocking your discount...
                  </>
                ) : (
                  <>
                    Get my discount
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center">
                Valid on minimum purchase of ৳1,000. Applicable to all handcrafted jewelry creations.
              </p>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-serif text-lg text-[#240610]">
                  Coupon Unlocked!
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  We've automatically applied <strong>৳50 off</strong> to your shopping bag.
                </p>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#D4A373]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#4A1525]" />
                  <span className="font-mono font-bold text-sm tracking-wider text-[#240610]">
                    {generatedCode || "WELCOME50"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE3DE] text-xs font-medium text-[#240610] hover:text-[#4A1525] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy code
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Shop Now with ৳50 Off
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
