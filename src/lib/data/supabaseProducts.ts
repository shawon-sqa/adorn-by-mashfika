import { createBrowserClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types/product";
import { SupabaseProduct } from "@/lib/types/supabase";
import { PRODUCTS_DATA } from "@/lib/data/products";

export function parseProductMetadata(rawDesc?: string | null): {
  cleanDescription: string;
  colorVariants: { name: string; inStock: boolean }[];
} {
  if (!rawDesc) {
    return { cleanDescription: "", colorVariants: [] };
  }
  const metaRegex = /<!--ADORN_META:(.*?)-->/;
  const match = rawDesc.match(metaRegex);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      const cleanDescription = rawDesc.replace(metaRegex, "").trim();
      return {
        cleanDescription,
        colorVariants: Array.isArray(parsed.colorVariants) ? parsed.colorVariants : [],
      };
    } catch {
      // Ignore JSON parse error and fallback
    }
  }
  return { cleanDescription: rawDesc.trim(), colorVariants: [] };
}

export function encodeProductMetadata(
  cleanDesc: string,
  colorVariants: { name: string; inStock: boolean }[]
): string {
  if (!colorVariants || colorVariants.length === 0) {
    return cleanDesc.trim();
  }
  return `${cleanDesc.trim()}\n\n<!--ADORN_META:${JSON.stringify({ colorVariants })}-->`;
}

// Convert Supabase row to unified storefront Product model
export function mapSupabaseToProduct(sp: SupabaseProduct): Product {
  const defaultGradient =
    sp.category === "jewelry"
      ? "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]"
      : sp.category === "accessories"
      ? "from-[#EDE6D6] via-[#EFE5DB] to-[#E3CBB3]"
      : "from-[#FFEBE8] via-[#FFF3F1] to-[#FCE3DF]";

  const { cleanDescription, colorVariants } = parseProductMetadata(sp.description);
  const derivedColors =
    colorVariants.length > 0
      ? colorVariants.map((v) => v.name)
      : ["Classic"];

  return {
    id: sp.id,
    slug: sp.slug,
    title: sp.title,
    subtitle: `${sp.category.charAt(0).toUpperCase() + sp.category.slice(1)} • Premium Selection`,
    description: cleanDescription || "Handcrafted with artisanal attention to detail.",
    price: sp.price,
    originalPrice: sp.regular_price || undefined,
    category: sp.category,
    inStock: sp.stock > 0,
    stockCount: sp.stock,
    badge: sp.is_featured ? "Featured" : sp.stock <= 5 ? "Low Stock" : undefined,
    colors: derivedColors,
    colorVariants:
      colorVariants.length > 0
        ? colorVariants
        : derivedColors.map((c) => ({ name: c, inStock: true })),
    materials: ["Boutique Artisanal Craft"],
    gradient: defaultGradient,
    images: sp.images && sp.images.length > 0 ? sp.images : [],
    details: [
      "Handcrafted with fine attention to detail",
      "Authentic Adorn by Mashfika boutique packaging included",
    ],
    rating: 4.9,
    reviewCount: 18,
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
