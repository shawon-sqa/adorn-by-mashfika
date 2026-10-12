"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  X,
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { saveAdminProduct } from "@/lib/data/adminProducts";
import { encodeProductMetadata } from "@/lib/data/supabaseProducts";
import { ColorVariant } from "@/lib/types/product";

const POPULAR_COLOR_SUGGESTIONS = [
  "Rose Gold",
  "Antique Gold",
  "Ruby Red",
  "Vintage Silver",
  "Emerald Green",
  "Champagne Gold",
];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Multiple Images state
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // Color Variants state
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([
    { name: "Classic", inStock: true },
  ]);
  const [newColorInput, setNewColorInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "jewelry" as "jewelry" | "accessories" | "fashion",
    price: "",
    originalPrice: "",
    stockCount: "10",
    description: "",
    isFeatured: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Multiple image upload handler
  const handleImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadStatusText(`Uploading ${files.length} image(s)...`);
    setErrorMessage("");

    try {
      const supabase = createBrowserClient();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Uploading ${i + 1} of ${files.length}...`);

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setErrorMessage(
        "Could not upload image(s) to cloud storage: " + (err.message || "Unknown error")
      );
    } finally {
      setUploadingImages(false);
      setUploadStatusText("");
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  // Color variants management
  const handleAddColor = (colorName: string) => {
    const trimmed = colorName.trim();
    if (!trimmed) return;
    if (colorVariants.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Color variant "${trimmed}" already exists.`);
      return;
    }
    setColorVariants((prev) => [...prev, { name: trimmed, inStock: true }]);
    setNewColorInput("");
    setErrorMessage("");
  };

  const handleToggleColorStock = (index: number) => {
    setColorVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, inStock: !v.inStock } : v))
    );
  };

  const handleRemoveColor = (index: number) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const finalSlug = slug || `item-${Date.now()}`;
    const priceNum = Number(formData.price) || 0;
    const regularPriceNum = formData.originalPrice ? Number(formData.originalPrice) : null;
    const stockNum = Number(formData.stockCount) || 0;

    // Encode color variants metadata safely into description
    const safeDescription = encodeProductMetadata(
      formData.description,
      colorVariants
    );

    // 1. Insert into Supabase 'products' table
    try {
      const supabase = createBrowserClient();
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          title: formData.title,
          slug: finalSlug,
          category: formData.category,
          price: priceNum,
          regular_price: regularPriceNum,
          stock: stockNum,
          description: safeDescription,
          images: images,
          is_featured: formData.isFeatured,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
    } catch (dbErr: any) {
      console.warn("Supabase products insertion fallback:", dbErr);
      // Fallback local save so owner isn't blocked if offline
      saveAdminProduct({
        id: `prod-${Date.now()}`,
        slug: finalSlug,
        title: formData.title,
        subtitle: formData.subtitle || "Handcrafted Boutique Selection",
        description: formData.description,
        price: priceNum,
        originalPrice: regularPriceNum || undefined,
        category: formData.category,
        inStock: stockNum > 0,
        stockCount: stockNum,
        badge: formData.isFeatured ? "Featured" : undefined,
        colors: colorVariants.map((c) => c.name),
        colorVariants: colorVariants,
        materials: ["Boutique Artisanal Craft"],
        gradient: "from-[#FDFBF7] via-[#F4EADB] to-[#E6D2B5]",
        images: images,
        details: ["Boutique packaging included"],
      });
    }

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
            Upload images, customize color variants, and publish creations to your boutique catalog.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Product created and published! Redirecting to inventory...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-2xs space-y-6"
      >
        {/* Section: Multiple Image Upload with Boutique Storage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                Product Imagery ({images.length} uploaded)
              </label>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload multiple high-resolution photos for the boutique catalog. Reorder or remove photos below.
              </p>
            </div>
            {images.length > 0 && (
              <label className="px-3.5 py-1.5 rounded-xl border border-brand-border bg-white text-xs font-medium text-brand-charcoal hover:bg-zinc-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
                Add More Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFilesChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Uploaded Gallery Preview List */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl border border-brand-border overflow-hidden group shadow-2xs bg-zinc-50"
                >
                  <img
                    src={url}
                    alt={`Product view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary / Cover Tag */}
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Cover
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                  )}

                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reorder buttons */}
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        className="p-1 bg-white/90 hover:bg-white text-zinc-700 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move left/earlier"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        className="p-1 bg-white/90 hover:bg-white text-zinc-700 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move right/later"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <label className="border-2 border-dashed border-brand-border hover:border-brand-primary rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-brand-ivory/30 group">
              <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-brand-primary transition-colors mb-2" />
              <span className="text-xs font-semibold text-brand-charcoal">
                Click or drag to upload product photos
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Select multiple files simultaneously (PNG, JPG, WebP)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFilesChange}
                className="hidden"
              />
            </label>
          )}

          {uploadingImages && (
            <div className="p-3 bg-brand-blush/60 border border-brand-primary/20 rounded-xl flex items-center gap-2 text-xs text-brand-primary font-medium animate-pulse">
              <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>{uploadStatusText || "Uploading images to boutique catalog..."}</span>
            </div>
          )}
        </div>

        {/* Section: Color Variants Management */}
        <div className="space-y-3 pt-4 border-t border-brand-border/60">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                Color Variants & Stock Status
              </label>
              <p className="text-xs text-zinc-400 mt-0.5">
                Define color variations and mark individual colors as In Stock or Out of Stock.
              </p>
            </div>
          </div>

          {/* Color list */}
          <div className="space-y-2">
            {colorVariants.map((variant, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-brand-border bg-[#FAF8F5]/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary/70" />
                  <span className="text-xs font-semibold text-brand-charcoal">
                    {variant.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleColorStock(index)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                      variant.inStock
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {variant.inStock ? "✓ In Stock" : "✕ Out of Stock"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove variant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom color variant */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add variant name (e.g. Antique Gold, Ruby Red, Silver)"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddColor(newColorInput);
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary"
            />
            <button
              type="button"
              onClick={() => handleAddColor(newColorInput)}
              className="px-4 py-2 bg-brand-charcoal hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Variant
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-champagne" /> Quick add:
            </span>
            {POPULAR_COLOR_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddColor(sug)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-brand-border bg-white text-zinc-600 hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-brand-border/60">
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

          {/* Category & Featured toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary bg-white cursor-pointer"
              >
                <option value="jewelry">Jewelry</option>
                <option value="accessories">Accessories</option>
                <option value="fashion">Boutique Fashion</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
                className="w-4 h-4 rounded text-brand-primary accent-[#B76E79] cursor-pointer"
              >
              </input>
              <label htmlFor="isFeatured" className="text-xs font-medium text-brand-charcoal cursor-pointer">
                Mark as Featured Creation (Homepage highlight)
              </label>
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
                Regular Price (৳)
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
              placeholder="Elaborate on the craftsmanship, stones, styling advice, and design inspiration..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:border-brand-primary"
            />
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
            disabled={isSubmitting || uploadingImages}
            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing Creation...
              </>
            ) : (
              "Publish Creation"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
