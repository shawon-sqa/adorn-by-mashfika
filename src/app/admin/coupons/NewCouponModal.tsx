"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import {
  SupabaseCoupon,
  CouponType,
  CouponRedemptionType,
  CouponStatus,
} from "@/lib/types/supabase";
import { createCoupon, updateCoupon } from "@/lib/data/supabaseCoupons";

interface NewCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (coupon: SupabaseCoupon) => void;
  initialCoupon?: SupabaseCoupon | null;
}

export function NewCouponModal({
  isOpen,
  onClose,
  onSaved,
  initialCoupon,
}: NewCouponModalProps) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // Eligibility
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [requiresPhone, setRequiresPhone] = useState(false);

  // Redemption
  const [redemptionType, setRedemptionType] =
    useState<CouponRedemptionType>("limited");
  const [maxUses, setMaxUses] = useState<number | "">(100);
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState<number>(1);
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [status, setStatus] = useState<CouponStatus>("active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCoupon) {
      setCode(initialCoupon.code);
      setType(initialCoupon.type);
      setDiscountValue(initialCoupon.discount_value);
      setDescription(initialCoupon.description || "");
      setMinOrderAmount(initialCoupon.min_order_amount ?? "");
      setRequiresEmail(!!initialCoupon.requires_email);
      setRequiresPhone(!!initialCoupon.requires_phone);
      setRedemptionType(initialCoupon.redemption_type);
      setMaxUses(initialCoupon.max_uses ?? "");
      setMaxUsesPerCustomer(initialCoupon.max_uses_per_customer || 1);
      setStartsAt(
        initialCoupon.starts_at ? initialCoupon.starts_at.slice(0, 10) : ""
      );
      setEndsAt(initialCoupon.ends_at ? initialCoupon.ends_at.slice(0, 10) : "");
      setStatus(initialCoupon.status);
    } else {
      setCode("");
      setType("percentage");
      setDiscountValue("");
      setDescription("");
      setMinOrderAmount("");
      setRequiresEmail(false);
      setRequiresPhone(false);
      setRedemptionType("limited");
      setMaxUses(100);
      setMaxUsesPerCustomer(1);
      setStartsAt("");
      setEndsAt("");
      setStatus("active");
    }
    setErrorMessage(null);
  }, [initialCoupon, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialCoupon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage("Please enter a coupon code.");
      return;
    }

    if (discountValue === "" || Number(discountValue) <= 0) {
      setErrorMessage("Please enter a valid positive discount value.");
      return;
    }

    if (type === "percentage" && Number(discountValue) > 100) {
      setErrorMessage("Percentage discount cannot exceed 100%.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialCoupon) {
        const res = await updateCoupon(initialCoupon.id, {
          code: cleanCode,
          type,
          discount_value: Number(discountValue),
          description: description.trim() || null,
          min_order_amount:
            minOrderAmount !== "" && Number(minOrderAmount) > 0
              ? Number(minOrderAmount)
              : null,
          requires_email: requiresEmail,
          requires_phone: requiresPhone,
          redemption_type: redemptionType,
          max_uses:
            redemptionType === "one_time"
              ? 1
              : redemptionType === "limited" && maxUses !== ""
              ? Number(maxUses)
              : null,
          max_uses_per_customer: maxUsesPerCustomer || 1,
          starts_at: startsAt ? new Date(startsAt).toISOString() : null,
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          status,
        });

        if (!res.success || !res.data) {
          setErrorMessage(res.error || "Failed to update coupon.");
          setIsSubmitting(false);
          return;
        }

        onSaved(res.data);
        onClose();
      } else {
        const payload: Omit<SupabaseCoupon, "id" | "used_count" | "created_at"> = {
          code: cleanCode,
          type,
          discount_value: Number(discountValue),
          description: description.trim() || null,
          min_order_amount:
            minOrderAmount !== "" && Number(minOrderAmount) > 0
              ? Number(minOrderAmount)
              : null,
          requires_email: requiresEmail,
          requires_phone: requiresPhone,
          redemption_type: redemptionType,
          max_uses:
            redemptionType === "one_time"
              ? 1
              : redemptionType === "limited" && maxUses !== ""
              ? Number(maxUses)
              : null,
          max_uses_per_customer: maxUsesPerCustomer || 1,
          starts_at: startsAt ? new Date(startsAt).toISOString() : null,
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          status: "active" as CouponStatus,
        };

        const result = await createCoupon(payload);

        if (!result.success || !result.data) {
          setErrorMessage(result.error || "Failed to create coupon.");
          setIsSubmitting(false);
          return;
        }

        onSaved(result.data);
        onClose();
      }
    } catch (err: any) {
      console.error("Coupon action error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-brand-border my-8 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border/60 bg-zinc-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-brand-charcoal">
                {isEditing ? "Edit Coupon" : "New Coupon"}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {isEditing
                  ? `Update settings for coupon ${initialCoupon?.code}`
                  : "Configure promotional discounts and redemption rules"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-brand-charcoal rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-700"
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* SECTION: BASICS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-brand-charcoal uppercase">
                1. Basics
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-charcoal mb-1.5">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-mono uppercase focus:outline-none focus:border-brand-primary tracking-wider"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-charcoal mb-1.5">
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="percentage">Percentage off</option>
                  <option value="fixed">Fixed amount off (৳)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-charcoal mb-1.5">
                Value * {type === "percentage" ? "(%)" : "(৳)"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">
                  {type === "percentage" ? "%" : "৳"}
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  max={type === "percentage" ? 100 : undefined}
                  step="1"
                  placeholder={type === "percentage" ? "15" : "150"}
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-semibold focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brand-charcoal mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Customer-facing or internal note about this promo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>
          </div>

          {/* SECTION: ELIGIBILITY */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-brand-charcoal uppercase">
                2. Eligibility
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Order Conditions
              </span>
            </div>

            <div>
              <label className="block font-semibold text-brand-charcoal mb-1.5">
                Min order amount (৳)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0 (Leave empty for no minimum)"
                  value={minOrderAmount}
                  onChange={(e) =>
                    setMinOrderAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-border/80 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requiresEmail}
                  onChange={(e) => setRequiresEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
                />
                <div>
                  <span className="font-medium text-brand-charcoal block">
                    Requires an email on the order
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Only customers providing an email can redeem
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-brand-border/80 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requiresPhone}
                  onChange={(e) => setRequiresPhone(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
                />
                <div>
                  <span className="font-medium text-brand-charcoal block">
                    Requires a phone on the order
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Verified mobile contact required
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION: REDEMPTION */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-brand-charcoal uppercase">
                3. Redemption
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                Availability
              </span>
            </div>

            {/* Redemption Type Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: "one_time", label: "One-time", desc: "Single use total" },
                { key: "limited", label: "Limited", desc: "Capped usage" },
                { key: "unlimited", label: "Unlimited", desc: "No total cap" },
              ].map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() =>
                    setRedemptionType(card.key as CouponRedemptionType)
                  }
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    redemptionType === card.key
                      ? "border-brand-primary bg-brand-blush/40 ring-1 ring-brand-primary"
                      : "border-brand-border bg-white hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`block font-semibold text-xs ${
                      redemptionType === card.key
                        ? "text-brand-primary"
                        : "text-brand-charcoal"
                    }`}
                  >
                    {card.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {card.desc}
                  </span>
                </button>
              ))}
            </div>

            {redemptionType === "limited" && (
              <div>
                <label className="block font-semibold text-brand-charcoal mb-1.5">
                  Total max redemptions *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="100"
                  value={maxUses}
                  onChange={(e) =>
                    setMaxUses(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-brand-charcoal mb-1.5">
                Max uses per customer
              </label>
              <input
                type="number"
                min="1"
                value={maxUsesPerCustomer}
                onChange={(e) =>
                  setMaxUsesPerCustomer(Number(e.target.value) || 1)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Starts and Ends */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-brand-charcoal mb-1.5">
                  Starts
                </label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-brand-charcoal mb-1.5">
                  Ends
                </label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-border text-zinc-600 hover:bg-zinc-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary-hover transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Create coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
