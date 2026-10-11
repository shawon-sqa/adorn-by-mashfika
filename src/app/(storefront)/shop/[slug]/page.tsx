import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PRODUCTS_DATA } from "@/lib/data/products";
import {
  fetchSupabaseProductBySlug,
  fetchSupabaseProducts,
} from "@/lib/data/supabaseProducts";
import { ProductDetailClient } from "./ProductDetailClient";

export function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({
    slug: product.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function ProductDetailContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchSupabaseProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products from same category
  const allProducts = await fetchSupabaseProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
