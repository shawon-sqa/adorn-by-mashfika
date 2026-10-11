"use client";

import { useState } from "react";
import { CheckCircle2, Store, Bell, Shield, Phone, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    storeName: "Adorn by Mashfika",
    tagline: "Elegance in Every Detail.",
    contactPhone: "+880 1700-000000",
    contactEmail: "hello@adornbymashfika.com",
    address: "Gulshan-2 / Banani, Dhaka, Bangladesh",
    insideDhakaDeliveryFee: "70",
    outsideDhakaDeliveryFee: "130",
    freeDeliveryThreshold: "2000",
    bkashNumber: "01700-000000",
  });

  const handleChange = (field: string, val: string) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Store settings updated successfully!
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

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          Save All Settings
        </button>
      </form>
    </div>
  );
}
