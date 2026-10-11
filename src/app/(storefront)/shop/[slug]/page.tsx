import { notFound } from "next/navigation";
import { getProductBySlug, PRODUCTS_DATA } from "@/lib/data/products";
import { ProductDetailClient } from "./ProductDetailClient";

// Generate static parameters for all mock products so Next.js prerenders all slugs
export function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({
    slug: product.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products from same category
  const relatedProducts = PRODUCTS_DATA.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
