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
  materials: string[];
  gradient: string;
  images: string[];
  details: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}
