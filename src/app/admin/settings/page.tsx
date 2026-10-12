"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Store,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  Gift,
} from "lucide-react";
import {
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  fetchStoreSettings,
  updateStoreSettings,
} from "@/lib/data/storeSettings";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchStoreSettings().then((data) => {
      if (mounted) {
        setSettings(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (type: "success" | "info" | "error", text: string) => {
    setToastMessage({ type, text });
    if (type !== "info") {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleChange = (field: keyof StoreSettings, val: any) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    showToast("info", "Saving Changes...");

    try {
      const res = await updateStoreSettings(settings);
      if (res.success) {
        showToast("success", "Changes Saved");
      } else {
        showToast("error", res.error || "Failed to save changes");
      }
    } catch {
      showToast("error", "Error saving changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
          Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Configure boutique policies, delivery charges, and payment numbers.
        </p>
      </div>

      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toastMessage.type === "info"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : toastMessage.type === "info" ? (
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-4">
          <h2 className="font-serif text-lg text-brand-charcoal flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-primary" />
            Boutique Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Concierge Contact Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Policies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-4">
          <h2 className="font-serif text-lg text-brand-charcoal flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            Shipping & Delivery Rates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Inside Dhaka Fee (৳)
              </label>
              <input
                type="number"
                value={settings.insideDhakaDeliveryFee}
                onChange={(e) => handleChange("insideDhakaDeliveryFee", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Outside Dhaka Fee (৳)
              </label>
              <input
                type="number"
                value={settings.outsideDhakaDeliveryFee}
                onChange={(e) => handleChange("outsideDhakaDeliveryFee", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Free Delivery Above (৳)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => handleChange("freeDeliveryThreshold", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-4">
          <h2 className="font-serif text-lg text-brand-charcoal flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-primary" />
            Payment Credentials
          </h2>

          <div className="max-w-md">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
              bKash / Nagad Receiving Number
            </label>
            <input
              type="text"
              value={settings.bkashNumber}
              onChange={(e) => handleChange("bkashNumber", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary font-mono"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Customers will send manual payments to this number during checkout.
            </p>
          </div>
        </div>

        {/* Promotions & Popups */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-4">
          <h2 className="font-serif text-lg text-brand-charcoal flex items-center gap-2">
            <Gift className="w-4 h-4 text-brand-primary" />
            Promotions & Popups
          </h2>
          <p className="text-xs text-zinc-500">
            Control automated marketing overlays and boutique welcome gestures.
          </p>

          <div className="pt-2">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-cream/50 border border-brand-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-brand-charcoal block">
                  Enable First-Order Discount Popup
                </span>
                <span className="text-[11px] text-zinc-500">
                  Display the welcome gift box modal offering 10% off for first-time visitors
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={
                  settings.show_first_order_popup !== undefined
                    ? settings.show_first_order_popup
                    : settings.enableFirstOrderPopup
                }
                onClick={() => {
                  const currentVal =
                    settings.show_first_order_popup !== undefined
                      ? settings.show_first_order_popup
                      : settings.enableFirstOrderPopup;
                  const nextVal = !currentVal;
                  setSettings((prev) => ({
                    ...prev,
                    enableFirstOrderPopup: nextVal,
                    show_first_order_popup: nextVal,
                  }));
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (settings.show_first_order_popup !== undefined
                    ? settings.show_first_order_popup
                    : settings.enableFirstOrderPopup)
                    ? "bg-brand-primary"
                    : "bg-zinc-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    (settings.show_first_order_popup !== undefined
                      ? settings.show_first_order_popup
                      : settings.enableFirstOrderPopup)
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save All Settings"
          )}
        </button>
      </form>
    </div>
  );
}
