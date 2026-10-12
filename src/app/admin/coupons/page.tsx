"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Search,
  Trash2,
  Power,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
} from "lucide-react";
import { SupabaseCoupon } from "@/lib/types/supabase";
import {
  fetchCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "@/lib/data/supabaseCoupons";
import { formatPrice } from "@/lib/utils/formatters";
import { NewCouponModal } from "./NewCouponModal";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<SupabaseCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<SupabaseCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<SupabaseCoupon | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadCouponsData = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCouponsData();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = async (coupon: SupabaseCoupon) => {
    const nextStatus = coupon.status === "active" ? "disabled" : "active";
    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: nextStatus } : c))
    );

    const res = await toggleCouponStatus(coupon.id, nextStatus);
    if (res.success) {
      showToast(
        "success",
        `Coupon ${coupon.code} is now ${nextStatus === "active" ? "Active" : "Disabled"}.`
      );
    } else {
      showToast("error", "Failed to update coupon status.");
      loadCouponsData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteCoupon(couponToDelete.id);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
        showToast("success", `Coupon "${couponToDelete.code}" deleted.`);
      } else {
        showToast("error", "Failed to delete coupon.");
      }
    } catch {
      showToast("error", "Error deleting coupon.");
    } finally {
      setIsDeleting(false);
      setCouponToDelete(null);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
              Coupons
            </h1>
            <span className="text-xs bg-brand-blush text-brand-primary font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/20">
              {coupons.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Create discount codes, order eligibility conditions, and monitor
            customer redemptions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCouponToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New coupon
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by coupon code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            Showing <strong>{filteredCoupons.length}</strong> coupon
            {filteredCoupons.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-zinc-500 uppercase tracking-wider border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-6 font-semibold">Code</th>
                <th className="py-3 px-6 font-semibold">Discount</th>
                <th className="py-3 px-6 font-semibold">Eligibility</th>
                <th className="py-3 px-6 font-semibold">Usage</th>
                <th className="py-3 px-6 font-semibold">Source</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                    <p className="mt-2 text-xs font-medium">Loading coupons...</p>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <Ticket className="w-8 h-8 opacity-40 mx-auto text-brand-charcoal mb-2" />
                    <p className="font-medium text-sm text-brand-charcoal">
                      No coupons found
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {searchQuery
                        ? "Try clearing your search query"
                        : "Click '+ New coupon' to create your first discount voucher."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isPercentage = c.type === "percentage";
                  const discountFormatted = isPercentage
                    ? `${c.discount_value}% off`
                    : `${formatPrice(c.discount_value)} off`;

                  const eligibilityRules: string[] = [];
                  if (c.min_order_amount) {
                    eligibilityRules.push(`Min ৳${c.min_order_amount.toLocaleString()}`);
                  }
                  if (c.requires_email) eligibilityRules.push("Email required");
                  if (c.requires_phone) eligibilityRules.push("Phone required");
                  const eligibilityText =
                    eligibilityRules.length > 0
                      ? eligibilityRules.join(" • ")
                      : "Everyone";

                  const usageText =
                    c.redemption_type === "one_time"
                      ? `${c.used_count}/1 use`
                      : c.redemption_type === "limited" && c.max_uses
                      ? `${c.used_count}/${c.max_uses} uses`
                      : `${c.used_count} uses`;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-brand-blush text-brand-primary flex-shrink-0">
                            <Tag className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="font-mono font-bold tracking-wider text-brand-charcoal uppercase">
                              {c.code}
                            </span>
                            {c.description && (
                              <p className="text-[10px] text-zinc-400 truncate max-w-xs mt-0.5">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* DISCOUNT */}
                      <td className="py-4 px-6 font-bold text-brand-charcoal">
                        {discountFormatted}
                      </td>

                      {/* ELIGIBILITY */}
                      <td className="py-4 px-6">
                        <span className="text-zinc-600 font-medium">
                          {eligibilityText}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-6 font-medium text-zinc-600">
                        {usageText}
                      </td>

                      {/* SOURCE */}
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                          Manual
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6">
                        {c.status === "active" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : c.status === "used_up" ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            Used Up
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setCouponToEdit(c);
                              setIsModalOpen(true);
                            }}
                            title="Edit Coupon"
                            className="p-1.5 rounded-lg border border-brand-border text-zinc-600 hover:text-brand-primary hover:border-brand-primary/50 hover:bg-brand-blush/30 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Disabled */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            title={
                              c.status === "active"
                                ? "Disable Coupon"
                                : "Activate Coupon"
                            }
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              c.status === "active"
                                ? "border-brand-border text-zinc-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/50"
                                : "border-brand-border text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setCouponToDelete(c)}
                            title="Delete Coupon"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Coupon Drawer / Modal */}
      <NewCouponModal
        isOpen={isModalOpen}
        initialCoupon={couponToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setCouponToEdit(null);
        }}
        onSaved={(savedCoupon) => {
          setCoupons((prev) => {
            const exists = prev.some((c) => c.id === savedCoupon.id);
            if (exists) {
              return prev.map((c) =>
                c.id === savedCoupon.id ? savedCoupon : c
              );
            }
            return [savedCoupon, ...prev];
          });
          showToast(
            "success",
            couponToEdit
              ? `Coupon "${savedCoupon.code}" updated successfully!`
              : `Coupon "${savedCoupon.code}" created successfully!`
          );
        }}
      />

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-brand-border space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl text-brand-charcoal">
                Delete Coupon?
              </h3>
              <p className="text-xs text-zinc-500 mt-2">
                Are you sure you want to permanently delete coupon code{" "}
                <strong className="text-brand-charcoal">
                  "{couponToDelete.code}"
                </strong>
                ? Customers will no longer be able to redeem this discount.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCouponToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-border text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
