export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_zone: "inside_dhaka" | "outside_dhaka";
  address: string;
  city: string;
  payment_method: "cod" | "bkash_manual";
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  bkash_sender?: string | null;
  bkash_trx_id?: string | null;
  notes?: string | null;
  created_at: string;
  order_items?: SupabaseOrderItem[];
}

export interface SupabaseOrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_title: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string | null;
}

export interface SupabaseProduct {
  id: string;
  title: string;
  slug: string;
  category: "jewelry" | "accessories" | "fashion";
  price: number;
  regular_price?: number | null;
  stock: number;
  description?: string | null;
  images: string[];
  is_featured: boolean;
  created_at: string;
}

