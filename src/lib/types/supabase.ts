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
  status: "draft" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
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

export type CouponType = "percentage" | "fixed";
export type CouponRedemptionType = "one_time" | "limited" | "unlimited";
export type CouponStatus = "active" | "used_up" | "disabled";

export interface SupabaseCoupon {
  id: string;
  code: string;
  type: CouponType;
  discount_value: number;
  description?: string | null;
  min_order_amount?: number | null;
  requires_email?: boolean;
  requires_phone?: boolean;
  redemption_type: CouponRedemptionType;
  max_uses?: number | null;
  max_uses_per_customer?: number;
  used_count: number;
  starts_at?: string | null;
  ends_at?: string | null;
  status: CouponStatus;
  created_at?: string;
}

