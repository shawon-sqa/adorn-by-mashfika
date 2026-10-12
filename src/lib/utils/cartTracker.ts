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

export const isValidUuid = (str: string | null | undefined): boolean => {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent UUID guest cart identifier in localStorage.
 * Always guarantees a valid standard RFC4122 UUID v4.
 */
export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") {
    return "00000000-0000-4000-8000-000000000000";
  }

  try {
    let sessionId = localStorage.getItem(ADORN_CART_SESSION_ID_KEY);
    if (!sessionId || !isValidUuid(sessionId)) {
      const alt = localStorage.getItem("cart_session_id") || localStorage.getItem("adorn_active_session_cart_id");
      if (alt && isValidUuid(alt)) {
        sessionId = alt;
      } else {
        sessionId = generateUuidV4();
      }
      localStorage.setItem(ADORN_CART_SESSION_ID_KEY, sessionId);
      localStorage.setItem("cart_session_id", sessionId);
    } else {
      localStorage.setItem("cart_session_id", sessionId);
    }

    return sessionId;
  } catch (err) {
    console.warn("[CartTracker] Error accessing localStorage:", err);
    return generateUuidV4();
  }
}

/**
 * Robustly upsert cart session into Supabase abandoned_carts table.
 * Guarantees a valid standard RFC4122 UUID v4 for the primary key.
 */
export async function syncCartToSupabase(cartData: SyncCartData): Promise<string> {
  // Ensure the id field sent to Supabase abandoned_carts is always a valid standard RFC4122 UUID v4
  let sessionId = cartData.sessionId;
  if (!sessionId || !isValidUuid(sessionId)) {
    sessionId = getOrCreateCartSessionId();
  }
  if (!isValidUuid(sessionId)) {
    sessionId = generateUuidV4();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ADORN_CART_SESSION_ID_KEY, sessionId);
        localStorage.setItem("cart_session_id", sessionId);
      } catch {}
    }
  }

  const legacySessionName = cartData.sessionId && !isValidUuid(cartData.sessionId) ? cartData.sessionId : undefined;
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
      (c: any) =>
        c.id === sessionId ||
        c.session_id === sessionId ||
        (legacySessionName && (c.id === legacySessionName || c.session_id === legacySessionName))
    );
    const localRecord = {
      id: sessionId,
      session_id: legacySessionName || sessionId,
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

  // Verified schema payload matching exact columns in abandoned_carts table:
  // id (guaranteed valid UUID v4), shopper_name, shopper_phone, shopper_email, items, cart_total, status, last_active
  const payload = {
    id: sessionId,
    shopper_name: shopperName,
    shopper_phone: shopperPhone,
    shopper_email: shopperEmail,
    items: formattedItems,
    cart_total: cartTotal,
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
      last_active: now,
    });

    const { error } = await supabase
      .from("abandoned_carts")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("[CartTracker] Supabase abandoned_carts sync notice (fallback active):", error.message);
    } else {
      console.log("[CartTracker] Successfully synced abandoned cart:", sessionId);
    }
  } catch (err: any) {
    console.warn("[CartTracker] Abandoned cart sync notice:", err?.message || err);
  }

  return sessionId;
}

/**
 * Mark cart session as CONVERTED in Supabase and localStorage.
 */
export async function markCartSessionConverted(sessionId?: string): Promise<void> {
  let targetId = sessionId;
  if (!targetId || !isValidUuid(targetId)) {
    targetId = getOrCreateCartSessionId();
  }
  const now = new Date().toISOString();

  console.log("[CartTracker] Marking cart as CONVERTED:", targetId);

  // Update local cache
  try {
    const rawLocal = localStorage.getItem("adorn_abandoned_carts_v2");
    if (rawLocal) {
      const localList = JSON.parse(rawLocal);
      const updated = localList.map((c: any) =>
        c.id === targetId ||
        c.session_id === targetId ||
        (sessionId && (c.id === sessionId || c.session_id === sessionId))
          ? { ...c, status: "CONVERTED", last_active: now, last_active_at: now }
          : c
      );
      localStorage.setItem("adorn_abandoned_carts_v2", JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("[CartTracker] LocalStorage convert cache notice:", err);
  }

  // Update Supabase if targetId is a valid UUID
  if (isValidUuid(targetId)) {
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("abandoned_carts")
        .update({
          status: "CONVERTED",
          last_active: now,
        })
        .eq("id", targetId);

      if (error) {
        console.warn("[CartTracker] Convert notice:", error.message);
      } else {
        console.log("[CartTracker] Successfully marked cart as CONVERTED in Supabase:", targetId);
      }
    } catch (err: any) {
      console.warn("[CartTracker] Notice updating cart to CONVERTED:", err?.message || err);
    }
  }
}
