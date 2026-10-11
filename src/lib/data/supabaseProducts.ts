import { createBrowserClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types/product";
import { SupabaseProduct } from "@/lib/types/supabase";
import { PRODUCTS_DATA } from "@/lib/data/products";

// Convert Supabase row to unified storefront Product model
export function mapSupabaseToProduct(sp: SupabaseProduct): Product {
  const defaultGradient =
    sp.category === "jewelry"
      ? "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]"
      : sp.category === "accessories"
      ? "from-[#EDE6D6] via-[#EFE5DB] to-[#E3CBB3]"
      : "from-[#FFEBE8] via-[#FFF3F1] to-[#FCE3DF]";

  return {
    id: sp.id,
    slug: sp.slug,
    title: sp.title,
    subtitle: `${sp.category.charAt(0).toUpperCase() + sp.category.slice(1)} • Premium Selection`,
    description: sp.description || "Handcrafted with artisanal attention to detail.",
    price: sp.price,
    originalPrice: sp.regular_price || undefined,
    category: sp.category,
    inStock: sp.stock > 0,
    stockCount: sp.stock,
    badge: sp.is_featured ? "Featured" : sp.stock <= 5 ? "Low Stock" : undefined,
    colors: ["Classic"],
    materials: ["Boutique Artisanal Craft"],
    gradient: defaultGradient,
    images: sp.images && sp.images.length > 0 ? sp.images : [],
    details: [
      "Handcrafted with fine attention to detail",
      "Authentic Adorn by Mashfika boutique packaging included",
    ],
  };
}

export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return PRODUCTS_DATA;
    }

    const dbMapped = data.map((row) => mapSupabaseToProduct(row as SupabaseProduct));
    return dbMapped;
  } catch (err) {
    console.warn("fetchSupabaseProducts fallback to mock data:", err);
    return PRODUCTS_DATA;
  }
}

export async function fetchSupabaseProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return mapSupabaseToProduct(data as SupabaseProduct);
    }
  } catch (err) {
    console.warn("fetchSupabaseProductBySlug fallback:", err);
  }

  // Fallback to local mock data
  return PRODUCTS_DATA.find((p) => p.slug === slug);
}
