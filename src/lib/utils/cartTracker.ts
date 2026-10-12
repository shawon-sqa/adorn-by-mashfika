import { createBrowserClient } from "@/lib/supabase/client";

export const ADORN_CART_SESSION_ID_KEY = "adorn_cart_session_id";

export interface CartTrackerItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  color?: string;
  imageUrl?: string;
  image?: string;
}

export interface SyncCartData {
  sessionId?: string;
  shopperName?: string;
  shopperPhone?: string;
  shopperEmail?: string;
  items: CartTrackerItem[];
  cartTotal: number;
  status?: "ACTIVE" | "ABANDONED" | "CONVERTED";
}

/**
 * Get or create a persistent UUID guest cart identifier in localStorage.
 * Uses crypto.randomUUID() when available.
 */
export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") {
    return "00000000-0000-0000-0000-000000000000";
  }

  try {
    const existing =
      localStorage.getItem(ADORN_CART_SESSION_ID_KEY) ||
      localStorage.getItem("cart_session_id") ||
      localStorage.getItem("adorn_active_session_cart_id");

    if (existing && existing.length > 5) {
      localStorage.setItem(ADORN_CART_SESSION_ID_KEY, existing);
      localStorage.setItem("cart_session_id", existing);
      localStorage.setItem("adorn_active_session_cart_id", existing);
      return existing;
    }

    let newId: string;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      newId = crypto.randomUUID();
    } else {
      // RFC4122 v4 UUID fallback
      newId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    localStorage.setItem(ADORN_CART_SESSION_ID_KEY, newId);
    localStorage.setItem("cart_session_id", newId);
    localStorage.setItem("adorn_active_session_cart_id", newId);
    return newId;
  } catch (err) {
    console.error("[CartTracker] Error accessing localStorage:", err);
    return "00000000-0000-0000-0000-000000000000";
  }
}

/**
 * Robustly upsert cart session into Supabase abandoned_carts table.
 * Includes console.log and defensive error handling.
 */
export async function syncCartToSupabase(cartData: SyncCartData): Promise<string> {
  const sessionId = cartData.sessionId || getOrCreateCartSessionId();
  const now = new Date().toISOString();

  // Normalize items array
  const formattedItems = (cartData.items || []).map((item) => ({
    id: item.id,
    title: item.title,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    color: item.selectedColor || item.color || null,
    selectedColor: item.selectedColor || item.color || null,
    image: item.imageUrl || item.image || null,
    imageUrl: item.imageUrl || item.image || null,
  }));

  const shopperName = (cartData.shopperName && cartData.shopperName.trim()) || "Anonymous";
  const shopperPhone = (cartData.shopperPhone && cartData.shopperPhone.trim()) || null;
  const shopperEmail = (cartData.shopperEmail && cartData.shopperEmail.trim()) || null;
  const cartTotal = Number(cartData.cartTotal) || 0;
  const status = cartData.status || (formattedItems.length > 0 ? "ACTIVE" : "ABANDONED");

  // Keep localStorage cache updated
  try {
    const rawLocal = localStorage.getItem("adorn_abandoned_carts_v2");
    const localList = rawLocal ? JSON.parse(rawLocal) : [];
    const existingIndex = localList.findIndex(
      (c: any) => c.id === sessionId || c.session_id === sessionId
    );
    const localRecord = {
      id: sessionId,
      session_id: sessionId,
      shopper_name: shopperName,
      customer_phone: shopperPhone || "",
      customer_email: shopperEmail || "",
      items: formattedItems,
      cart_value: cartTotal,
      cart_total: cartTotal,
      currency: "BDT",
      status,
      recovery_step: 0,
      last_follow_up_at: null,
      last_follow_up_channel: null,
      is_archived: false,
      last_active_at: now,
      last_active: now,
      created_at: now,
    };

    if (existingIndex > -1) {
      localList[existingIndex] = {
        ...localList[existingIndex],
        ...localRecord,
        recovery_step: localList[existingIndex].recovery_step || 0,
        last_follow_up_at: localList[existingIndex].last_follow_up_at || null,
      };
    } else {
      localList.unshift(localRecord);
    }
    localStorage.setItem("adorn_abandoned_carts_v2", JSON.stringify(localList));
  } catch (err) {
    console.warn("[CartTracker] LocalStorage cache notice:", err);
  }

  // Verified schema payload matching exact columns in abandoned_carts table
  const primaryPayload: Record<string, any> = {
    id: sessionId,
    shopper_name: shopperName,
    shopper_phone: shopperPhone,
    customer_phone: shopperPhone,
    shopper_email: shopperEmail,
    customer_email: shopperEmail,
    items: formattedItems,
    cart_total: cartTotal,
    cart_value: cartTotal,
    status,
    last_active: now,
  };

  try {
    const supabase = createBrowserClient();
    console.log("[CartTracker] Syncing abandoned cart to Supabase:", {
      id: sessionId,
      shopper_name: shopperName,
      itemsCount: formattedItems.length,
      cart_total: cartTotal,
      status,
    });

    const { error } = await supabase
      .from("abandoned_carts")
      .upsert(primaryPayload, { onConflict: "id" });

    if (error) {
      console.warn("[CartTracker] Upsert primary payload error, trying fallback:", error.message);
      // Secondary fallback payload with standard columns
      const fallbackPayload: Record<string, any> = {
        id: sessionId,
        shopper_name: shopperName,
        customer_phone: shopperPhone,
        customer_email: shopperEmail,
        items: formattedItems,
        cart_value: cartTotal,
        status,
        last_active_at: now,
      };

      const { error: fallbackErr } = await supabase
        .from("abandoned_carts")
        .upsert(fallbackPayload, { onConflict: "id" });

      if (fallbackErr) {
        console.error("[CartTracker] Supabase abandoned_carts upsert failed:", fallbackErr.message);
      } else {
        console.log("[CartTracker] Successfully synced via fallback payload:", sessionId);
      }
    } else {
      console.log("[CartTracker] Successfully synced abandoned cart:", sessionId);
    }
  } catch (err) {
    console.error("[CartTracker] Unexpected error during syncCartToSupabase:", err);
  }

  return sessionId;
}

/**
 * Mark cart session as CONVERTED in Supabase and localStorage.
 */
export async function markCartSessionConverted(sessionId?: string): Promise<void> {
  const targetId = sessionId || getOrCreateCartSessionId();
  const now = new Date().toISOString();

  console.log("[CartTracker] Marking cart as CONVERTED:", targetId);

  // Update local cache
  try {
    const rawLocal = localStorage.getItem("adorn_abandoned_carts_v2");
    if (rawLocal) {
      const localList = JSON.parse(rawLocal);
      const updated = localList.map((c: any) =>
        c.id === targetId || c.session_id === targetId
          ? { ...c, status: "CONVERTED", last_active: now, last_active_at: now }
          : c
      );
      localStorage.setItem("adorn_abandoned_carts_v2", JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("[CartTracker] LocalStorage convert cache notice:", err);
  }

  // Update Supabase
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("abandoned_carts")
      .update({
        status: "CONVERTED",
        last_active: now,
        last_active_at: now,
      })
      .or(`id.eq.${targetId},session_id.eq.${targetId}`);

    if (error) {
      console.error("[CartTracker] Failed to mark cart as CONVERTED in Supabase:", error.message);
    } else {
      console.log("[CartTracker] Successfully marked cart as CONVERTED in Supabase:", targetId);
    }
  } catch (err) {
    console.error("[CartTracker] Error updating cart to CONVERTED:", err);
  }
}
