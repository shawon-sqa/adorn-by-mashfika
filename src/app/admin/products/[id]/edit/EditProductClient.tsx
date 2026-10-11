"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { SupabaseProduct } from "@/lib/types/supabase";
import { PRODUCTS_DATA } from "@/lib/data/products";

interface EditProductClientProps {
  productId: string;
}

export function EditProductClient({ productId }: EditProductClientProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    category: "jewelry" as "jewelry" | "accessories" | "fashion",
    price: "",
    regularPrice: "",
    stockCount: "10",
    description: "",
    isFeatured: false,
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (!error && data) {
          const p = data as SupabaseProduct;
          setFormData({
            title: p.title,
            category: p.category,
            price: p.price.toString(),
            regularPrice: p.regular_price ? p.regular_price.toString() : "",
            stockCount: p.stock.toString(),
            description: p.description || "",
            isFeatured: p.is_featured,
          });
          if (p.images && p.images.length > 0) {
            setImagePreview(p.images[0]);
            setUploadedImageUrl(p.images[0]);
          }
        } else {
          // Check fallback mock data by id or slug
          const mock = PRODUCTS_DATA.find((m) => m.id === productId || m.slug === productId);
          if (mock) {
            setFormData({
              title: mock.title,
              category: mock.category,
              price: mock.price.toString(),
              regularPrice: mock.originalPrice ? mock.originalPrice.toString() : "",
              stockCount: mock.stockCount.toString(),
              description: mock.description,
              isFeatured: mock.badge === "Featured" || mock.badge === "Bestseller",
            });
            if (mock.images && mock.images.length > 0) {
              setImagePreview(mock.images[0]);
              setUploadedImageUrl(mock.images[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Error loading product for edit:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);
    setErrorMessage("");

    try {
      const supabase = createBrowserClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setUploadedImageUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setErrorMessage(
        "Could not upload image to cloud storage: " + (err.message || "Unknown error")
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const priceNum = Number(formData.price) || 0;
    const regularPriceNum = formData.regularPrice ? Number(formData.regularPrice) : null;
    const stockNum = Number(formData.stockCount) || 0;
    const imagesArray = uploadedImageUrl ? [uploadedImageUrl] : [];

    try {
      const supabase = createBrowserClient();

      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: formData.title,
          category: formData.category,
          price: priceNum,
          regular_price: regularPriceNum,
          stock: stockNum,
          description: formData.description,
          images: imagesArray,
          is_featured: formData.isFeatured,
        })
        .eq("id", productId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to update product:", err);
      setErrorMessage("Could not update product: " + (err.message || "Unknown error"));
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

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
            Edit Creation
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Modify product details, pricing, stock levels, or update imagery.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Product updated successfully! Returning to catalog...</span>
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
        {/* Section: Image Upload with Supabase Storage */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
            Product Imagery
          </label>
          <p className="text-xs text-zinc-400">
            Keep existing image or upload a replacement.
          </p>

          {imagePreview ? (
            <div className="relative w-48 h-48 rounded-2xl border border-brand-border overflow-hidden group shadow-xs">
              <img
                src={imagePreview}
                alt="Product Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-1.5">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Cloud...</span>
                </div>
              )}
              {uploadedImageUrl && (
                <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ready ✓
                </span>
              )}
            </div>
          ) : (
            <label className="border-2 border-dashed border-brand-border hover:border-brand-primary rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-brand-ivory/30 group">
              <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-brand-primary transition-colors mb-2" />
              <span className="text-xs font-semibold text-brand-charcoal">
                Click to upload replacement image
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Saved directly to Supabase `product-images` bucket
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
          )}
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
              />
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
                value={formData.regularPrice}
                onChange={(e) => handleChange("regularPrice", e.target.value)}
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
            disabled={isSubmitting || uploadingImage}
            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating in Supabase...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
