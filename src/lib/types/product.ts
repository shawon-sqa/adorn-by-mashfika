export interface ColorVariant {
  name: string;
  inStock: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "jewelry" | "accessories" | "fashion";
  inStock: boolean;
  stockCount: number;
  badge?: string;
  colors: string[];
  colorVariants?: ColorVariant[];
  materials: string[];
  gradient: string;
  images: string[];
  details: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}
