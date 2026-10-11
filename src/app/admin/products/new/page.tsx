"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Product } from "@/lib/types/product";
import { saveAdminProduct } from "@/lib/data/adminProducts";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "jewelry" as "jewelry" | "accessories" | "fashion",
    price: "",
    originalPrice: "",
    stockCount: "10",
    description: "",
    materials: "",
    colors: "",
    badge: "New Arrival",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      slug: slug || `item-${Date.now()}`,
      title: formData.title,
      subtitle: formData.subtitle || "Handcrafted Boutique Selection",
      description: formData.description,
      price: Number(formData.price) || 1500,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category,
      inStock: Number(formData.stockCount) > 0,
      stockCount: Number(formData.stockCount) || 10,
      badge: formData.badge || undefined,
      colors: formData.colors ? formData.colors.split(",").map((c) => c.trim()) : ["Gold", "Silver"],
      materials: formData.materials
        ? formData.materials.split(",").map((m) => m.trim())
        : ["Artisanal Plated Brass", "Semi-precious Accents"],
      gradient: "from-[#FDFBF7] via-[#F4EADB] to-[#E6D2B5]",
      images: ["/images/products/placeholder.jpg"],
      details: [
        "Finely crafted with premium anti-tarnish protection",
        "Includes signature Adorn by Mashfika satin packaging",
      ],
    };

    saveAdminProduct(newProd);
    setSuccess(true);

    setTimeout(() => {
      router.push("/admin/products");
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 bg-white rounded-xl border border-brand-border hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-600" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
            Add New Product
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create a new boutique creation in your storefront.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Product created successfully! Redirecting to catalog...</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-6"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Polki Emerald Layered Choker"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
              Subtitle / One-line Hook
            </label>
            <input
              type="text"
              placeholder="e.g. 22K Gold Plated Heritage Necklace"
              value={formData.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary bg-white"
              >
                <option value="jewelry">Jewelry</option>
                <option value="accessories">Accessories</option>
                <option value="fashion">Boutique Fashion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Badge / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Bestseller, New Arrival, Festive"
                value={formData.badge}
                onChange={(e) => handleChange("badge", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Selling Price (৳) *
              </label>
              <input
                type="number"
                required
                placeholder="3500"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Regular / Strikethrough Price (৳)
              </label>
              <input
                type="number"
                placeholder="4200"
                value={formData.originalPrice}
                onChange={(e) => handleChange("originalPrice", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={formData.stockCount}
                onChange={(e) => handleChange("stockCount", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
              Product Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Elaborate on the craftsmanship, gems, styling advice, and design inspiration..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Materials & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Materials (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Brass alloy, Kundan, Pearls"
                value={formData.materials}
                onChange={(e) => handleChange("materials", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Color Variations (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Antique Gold, Rose Gold, Silver"
                value={formData.colors}
                onChange={(e) => handleChange("colors", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Saving Creation..." : "Publish Creation"}
          </button>
        </div>
      </form>
    </div>
  );
}
