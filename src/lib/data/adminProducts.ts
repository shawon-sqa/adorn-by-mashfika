import { Product } from "@/lib/types/product";
import { PRODUCTS_DATA } from "@/lib/data/products";

const ADMIN_PRODUCTS_KEY = "adorn_admin_products";

export function getAdminProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS_DATA;
  try {
    const stored = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!stored) {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(PRODUCTS_DATA));
      return PRODUCTS_DATA;
    }
    return JSON.parse(stored);
  } catch {
    return PRODUCTS_DATA;
  }
}

export function saveAdminProduct(newProduct: Product): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAdminProducts();
    const updated = [newProduct, ...current];
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
