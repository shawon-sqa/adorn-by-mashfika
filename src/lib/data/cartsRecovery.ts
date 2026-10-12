import { createBrowserClient } from "@/lib/supabase/client";

export type CartStatus = "ACTIVE" | "ABANDONED" | "CONVERTED";

export interface CartProductItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  imageUrl?: string;
  gradient?: string;
}

export interface AbandonedCartRecord {
  id: string;
  session_id?: string;
  shopper_name: string;
  customer_phone?: string;
  customer_email?: string;
  items: CartProductItem[];
  cart_value: number;
  cart_total?: number;
  currency: string;
  status: CartStatus;
  recovery_step: number; // 0, 1, 2, 3
  last_follow_up_at?: string | null;
  last_follow_up_channel?: "WHATSAPP" | "EMAIL" | null;
  is_archived: boolean;
  last_active_at: string;
  last_active?: string;
  created_at: string;
}

export interface FollowUpTemplatesConfig {
  email: {
    subject: string;
    body: string;
  };
  whatsapp: {
    message: string;
  };
  automation: {
    abandonedThresholdMinutes: number;
    autoWhatsappEnabled: boolean;
    autoEmailEnabled: boolean;
    stepIntervalHours: number;
  };
}

export const DEFAULT_TEMPLATES_CONFIG: FollowUpTemplatesConfig = {
  email: {
    subject: "পছন্দের গহনাগুলো কার্টেই রয়ে গেছে 🛍️",
    body: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; rounded: 12px;">
  <h2 style="color: #b76e79; font-size: 20px;">Assalamu Alaikum {{customerFirstName}},</h2>
  <p>আমরা লক্ষ্য করেছি আপনি Adorn by Mashfika-তে আপনার শপিং ব্যাগে কিছু চমৎকার গহনা রেখে গেছেন:</p>
  {{cartItemsHtml}}
  <p style="font-weight: bold; font-size: 16px; margin: 16px 0;">Total Value: ৳ {{cartTotal}}</p>
  <p>পছন্দের পিসগুলো স্টক শেষ হওয়ার আগেই অর্ডার সম্পন্ন করতে নিচের বাটনে ক্লিক করুন:</p>
  <a href="{{checkoutUrl}}" style="display: inline-block; background-color: #b76e79; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">Complete Your Order</a>
  <br /><br />
  <p style="color: #777; font-size: 12px;">যেকোনো সহায়তায় আমাদের সাথে WhatsApp-এ (01353655433) যোগাযোগ করতে পারেন।<br />Adorn by Mashfika Concierge</p>
</div>`,
  },
  whatsapp: {
    message: `Assalamu Alaikum {{customerFirstName}},

We noticed you left some exquisite handcrafted pieces in your bag at Adorn by Mashfika:
{{cartItemsText}}

Total: ৳ {{cartTotal}}

Would you like any assistance completing your reservation or custom sizing details? We would love to assist you!

Complete your order here: {{checkoutUrl}}

Warm regards,
Adorn by Mashfika Concierge (01353655433)`,
  },
  automation: {
    abandonedThresholdMinutes: 30,
    autoWhatsappEnabled: true,
    autoEmailEnabled: false,
    stepIntervalHours: 4,
  },
};

const CARTS_STORAGE_KEY = "adorn_abandoned_carts_v2";
const TEMPLATES_STORAGE_KEY = "adorn_followup_templates_v2";
export const ACTIVE_SESSION_CART_KEY = "adorn_active_session_cart_id";

// Initial mock carts if table is fresh or offline
export const INITIAL_MOCK_CARTS: AbandonedCartRecord[] = [
  {
    id: "cart-adm-101",
    session_id: "sess-dhaka-812",
    shopper_name: "Sadia Rahman",
    customer_phone: "01788990011",
    customer_email: "sadia.rahman@gmail.com",
    cart_value: 7300,
    currency: "BDT",
    status: "ABANDONED",
    recovery_step: 1,
    last_follow_up_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    last_follow_up_channel: "WHATSAPP",
    is_archived: false,
    last_active_at: new Date(Date.now() - 32 * 60 * 1000).toISOString(), // 32m ago
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "prod-1",
        title: "Kundan Royal Choker Set",
        price: 4850,
        quantity: 1,
        selectedColor: "Antique Gold & Emerald",
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "prod-2",
        title: "Handcrafted Rose-Quartz Jhumkas",
        price: 2450,
        quantity: 1,
        selectedColor: "Rose Gold",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  {
    id: "cart-adm-102",
    session_id: "sess-ctg-404",
    shopper_name: "Tanzila Hossain",
    customer_phone: "01811554433",
    customer_email: "tanzila.hossain@yahoo.com",
    cart_value: 5200,
    currency: "BDT",
    status: "ACTIVE",
    recovery_step: 0,
    last_follow_up_at: null,
    last_follow_up_channel: null,
    is_archived: false,
    last_active_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8m ago
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    items: [
      {
        id: "prod-5",
        title: "Silk Organza Embroidered Dupatta",
        price: 5200,
        quantity: 1,
        selectedColor: "Blush Pink",
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  {
    id: "cart-adm-103",
    session_id: "sess-syl-219",
    shopper_name: "Anonymous",
    customer_phone: "",
    customer_email: "",
    cart_value: 1909,
    currency: "BDT",
    status: "ABANDONED",
    recovery_step: 0,
    last_follow_up_at: null,
    last_follow_up_channel: null,
    is_archived: false,
    last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "prod-3",
        title: "Embroidered Velvet Potli Clutch",
        price: 1909,
        quantity: 1,
        selectedColor: "Burgundy Wine",
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
  {
    id: "cart-adm-104",
    session_id: "sess-dhk-991",
    shopper_name: "Mehnaz Karim",
    customer_phone: "01922338877",
    customer_email: "mehnaz.karim@outlook.com",
    cart_value: 4850,
    currency: "BDT",
    status: "CONVERTED",
    recovery_step: 2,
    last_follow_up_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    last_follow_up_channel: "WHATSAPP",
    is_archived: false,
    last_active_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "prod-1",
        title: "Kundan Royal Choker Set",
        price: 4850,
        quantity: 1,
        selectedColor: "Antique Gold & Emerald",
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
      },
    ],
  },
];

// Helper to get local carts
export function getLocalCarts(): AbandonedCartRecord[] {
  if (typeof window === "undefined") return INITIAL_MOCK_CARTS;
  try {
    const raw = localStorage.getItem(CARTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CARTS));
      return INITIAL_MOCK_CARTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_CARTS;
  }
}

export function saveLocalCarts(carts: AbandonedCartRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts));
  } catch {
    // ignore
  }
}

// Fetch all carts directly from Supabase abandoned_carts table
export async function fetchAbandonedCarts(): Promise<AbandonedCartRecord[]> {
  try {
    const supabase = createBrowserClient();
    // Query directly from Supabase ordered by last_active DESC
    let query = await supabase
      .from("abandoned_carts")
      .select("*")
      .order("last_active", { ascending: false });

    if (query.error && query.error.message?.includes("last_active")) {
      query = await supabase
        .from("abandoned_carts")
        .select("*")
        .order("last_active_at", { ascending: false });
    }

    const data = query.data;
    const error = query.error;

    if (error) {
      console.error("[CartsRecovery] Supabase query error:", error.message);
    }

    if (!error && Array.isArray(data)) {
      const parsed: AbandonedCartRecord[] = data.map((row: any) => {
        const rawItems = Array.isArray(row.items) ? row.items : [];
        const normalizedItems: CartProductItem[] = rawItems.map((item: any) => ({
          id: item.id || `item-${Math.random()}`,
          title: item.title || item.name || "Product Item",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          selectedColor: item.selectedColor || item.color,
          imageUrl: item.imageUrl || item.image || (Array.isArray(item.images) ? item.images[0] : undefined),
          gradient: item.gradient,
        }));

        const totalVal = Number(row.cart_total !== undefined ? row.cart_total : row.cart_value) || 0;
        const activeTime = row.last_active || row.last_active_at || row.created_at || new Date().toISOString();

        return {
          id: row.id,
          session_id: row.session_id || row.cart_session_id || row.id,
          shopper_name: row.shopper_name || "Anonymous",
          customer_phone: row.customer_phone || row.shopper_phone || "",
          customer_email: row.customer_email || row.shopper_email || "",
          items: normalizedItems,
          cart_value: totalVal,
          cart_total: totalVal,
          currency: row.currency || "BDT",
          status: (row.status?.toUpperCase() || "ACTIVE") as CartStatus,
          recovery_step: Number(row.recovery_step) || 0,
          last_follow_up_at: row.last_follow_up || row.last_follow_up_at || null,
          last_follow_up_channel: (row.follow_up_channel || row.last_follow_up_channel || null) as "WHATSAPP" | "EMAIL" | null,
          is_archived: !!row.is_archived,
          last_active_at: activeTime,
          last_active: activeTime,
          created_at: row.created_at || new Date().toISOString(),
        };
      });

      // Save to localStorage for instant client rendering
      saveLocalCarts(parsed);
      return parsed;
    }
  } catch (err) {
    console.error("[CartsRecovery] fetchAbandonedCarts exception:", err);
  }

  // If table is completely unreachable due to network disconnect, fallback to local cache
  return getLocalCarts();
}

// Upsert or sync active cart from storefront
export async function syncStorefrontCartSession(payload: {
  sessionId?: string;
  shopperName?: string;
  phone?: string;
  email?: string;
  items: CartProductItem[];
  cartValue: number;
  status?: CartStatus;
}): Promise<string> {
  const sessionId =
    payload.sessionId ||
    (typeof window !== "undefined"
      ? localStorage.getItem(ACTIVE_SESSION_CART_KEY) || `sess-${Date.now()}`
      : `sess-${Date.now()}`);

  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_SESSION_CART_KEY, sessionId);
  }

  const now = new Date().toISOString();
  const cartRecord: AbandonedCartRecord = {
    id: `cart-${sessionId}`,
    session_id: sessionId,
    shopper_name: payload.shopperName?.trim() || "Anonymous",
    customer_phone: payload.phone?.trim() || "",
    customer_email: payload.email?.trim() || "",
    items: payload.items,
    cart_value: payload.cartValue,
    currency: "BDT",
    status: payload.status || (payload.items.length > 0 ? "ACTIVE" : "ABANDONED"),
    recovery_step: 0,
    last_follow_up_at: null,
    last_follow_up_channel: null,
    is_archived: false,
    last_active_at: now,
    created_at: now,
  };

  // 1. Update localStorage
  const local = getLocalCarts();
  const existingIdx = local.findIndex((c) => c.session_id === sessionId || c.id === cartRecord.id);
  let updatedList: AbandonedCartRecord[];
  if (existingIdx > -1) {
    const existing = local[existingIdx];
    updatedList = [...local];
    updatedList[existingIdx] = {
      ...existing,
      shopper_name: payload.shopperName || existing.shopper_name,
      customer_phone: payload.phone || existing.customer_phone,
      customer_email: payload.email || existing.customer_email,
      items: payload.items,
      cart_value: payload.cartValue,
      status: payload.status || (existing.status === "CONVERTED" ? "CONVERTED" : "ACTIVE"),
      last_active_at: now,
    };
  } else {
    updatedList = [cartRecord, ...local];
  }
  saveLocalCarts(updatedList);

  // 2. Try Supabase upsert silently with resilient payload
  try {
    const supabase = createBrowserClient();
    const formattedItems = payload.items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      image: i.imageUrl,
      imageUrl: i.imageUrl,
      color: i.selectedColor,
      selectedColor: i.selectedColor,
    }));

    const primaryPayload: Record<string, any> = {
      id: sessionId,
      session_id: sessionId,
      shopper_name: cartRecord.shopper_name,
      shopper_phone: cartRecord.customer_phone || null,
      customer_phone: cartRecord.customer_phone || null,
      shopper_email: cartRecord.customer_email || null,
      customer_email: cartRecord.customer_email || null,
      items: formattedItems,
      cart_total: cartRecord.cart_value,
      cart_value: cartRecord.cart_value,
      status: cartRecord.status,
      last_active: now,
      last_active_at: now,
      recovery_step: 0,
      is_archived: false,
      created_at: now,
    };

    let { error } = await supabase
      .from("abandoned_carts")
      .upsert(primaryPayload, { onConflict: "id" });

    // If upsert failed due to unexpected column name, retry with fallback payload
    if (error) {
      const fallbackPayload: Record<string, any> = {
        id: `cart-${sessionId}`,
        session_id: sessionId,
        shopper_name: cartRecord.shopper_name,
        customer_phone: cartRecord.customer_phone || null,
        customer_email: cartRecord.customer_email || null,
        items: formattedItems,
        cart_value: cartRecord.cart_value,
        status: cartRecord.status,
        last_active_at: now,
      };
      await supabase
        .from("abandoned_carts")
        .upsert(fallbackPayload, { onConflict: "id" });
    }
  } catch (err) {
    // Ignore fallback silently
  }

  return sessionId;
}

// Mark cart as converted after successful order
export async function markCartAsConverted(sessionId?: string): Promise<void> {
  const currentSession =
    sessionId ||
    (typeof window !== "undefined"
      ? localStorage.getItem(ACTIVE_SESSION_CART_KEY)
      : null);

  if (!currentSession) return;

  const now = new Date().toISOString();
  const local = getLocalCarts();
  const updated = local.map((c) => {
    if (
      c.session_id === currentSession ||
      c.id === currentSession ||
      c.id === `cart-${currentSession}`
    ) {
      return {
        ...c,
        status: "CONVERTED" as CartStatus,
        last_active_at: now,
        last_active: now,
      };
    }
    return c;
  });
  saveLocalCarts(updated);

  try {
    const supabase = createBrowserClient();
    await supabase
      .from("abandoned_carts")
      .update({
        status: "CONVERTED",
        last_active_at: now,
        last_active: now,
      })
      .or(`session_id.eq.${currentSession},id.eq.${currentSession},id.eq.cart-${currentSession}`);
  } catch {
    // Ignore silently
  }
}

// Record follow up timestamp, step, and channel
export async function recordCartFollowUp(
  cartId: string,
  channel: "WHATSAPP" | "EMAIL"
): Promise<AbandonedCartRecord[]> {
  const now = new Date().toISOString();
  const local = getLocalCarts();
  const updated = local.map((c) => {
    if (c.id === cartId || c.session_id === cartId) {
      return {
        ...c,
        last_follow_up_at: now,
        last_follow_up: now,
        last_follow_up_channel: channel,
        follow_up_channel: channel,
        recovery_step: Math.min(3, (c.recovery_step || 0) + 1),
      };
    }
    return c;
  });
  saveLocalCarts(updated);

  try {
    const supabase = createBrowserClient();
    const target = updated.find((c) => c.id === cartId || c.session_id === cartId);
    if (target) {
      const updatePayload: Record<string, any> = {
        last_follow_up: now,
        last_follow_up_at: now,
        follow_up_channel: channel,
        last_follow_up_channel: channel,
        recovery_step: target.recovery_step,
      };

      const { error } = await supabase
        .from("abandoned_carts")
        .update(updatePayload)
        .or(`id.eq.${cartId},session_id.eq.${cartId}`);

      if (error) {
        console.warn("[CartsRecovery] Update follow up warning:", error.message);
        // Fallback with minimal columns
        await supabase
          .from("abandoned_carts")
          .update({
            last_follow_up_at: now,
            last_follow_up_channel: channel,
          })
          .or(`id.eq.${cartId},session_id.eq.${cartId}`);
      }
    }
  } catch (err) {
    console.error("[CartsRecovery] Error recording follow up:", err);
  }

  return updated;
}

// Archive or delete cart directly from Supabase
export async function deleteOrArchiveCart(
  cartId: string,
  permanent = false
): Promise<AbandonedCartRecord[]> {
  const local = getLocalCarts();
  let updated: AbandonedCartRecord[];

  if (permanent) {
    updated = local.filter((c) => c.id !== cartId && c.session_id !== cartId);
  } else {
    updated = local.map((c) => (c.id === cartId || c.session_id === cartId ? { ...c, is_archived: true } : c));
  }
  saveLocalCarts(updated);

  try {
    const supabase = createBrowserClient();
    if (permanent) {
      const { error } = await supabase
        .from("abandoned_carts")
        .delete()
        .or(`id.eq.${cartId},session_id.eq.${cartId}`);
      if (error) {
        console.error("[CartsRecovery] Failed to delete cart:", error.message);
      }
    } else {
      const { error } = await supabase
        .from("abandoned_carts")
        .update({ is_archived: true })
        .or(`id.eq.${cartId},session_id.eq.${cartId}`);
      if (error) {
        console.error("[CartsRecovery] Failed to archive cart:", error.message);
      }
    }
  } catch (err) {
    console.error("[CartsRecovery] Error deleting cart:", err);
  }

  return updated;
}

// Templates persistence
export function getLocalTemplatesConfig(): FollowUpTemplatesConfig {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES_CONFIG;
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) return { ...DEFAULT_TEMPLATES_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_TEMPLATES_CONFIG;
}

export function saveLocalTemplatesConfig(config: FollowUpTemplatesConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export async function fetchTemplatesConfig(): Promise<FollowUpTemplatesConfig> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("followup_templates")
      .select("*")
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      const merged: FollowUpTemplatesConfig = {
        email: {
          subject: row.email_subject || DEFAULT_TEMPLATES_CONFIG.email.subject,
          body: row.email_body || DEFAULT_TEMPLATES_CONFIG.email.body,
        },
        whatsapp: {
          message: row.whatsapp_message || DEFAULT_TEMPLATES_CONFIG.whatsapp.message,
        },
        automation: {
          abandonedThresholdMinutes:
            Number(row.abandoned_threshold_minutes) ||
            DEFAULT_TEMPLATES_CONFIG.automation.abandonedThresholdMinutes,
          autoWhatsappEnabled:
            row.auto_whatsapp_enabled !== undefined
              ? !!row.auto_whatsapp_enabled
              : DEFAULT_TEMPLATES_CONFIG.automation.autoWhatsappEnabled,
          autoEmailEnabled:
            row.auto_email_enabled !== undefined
              ? !!row.auto_email_enabled
              : DEFAULT_TEMPLATES_CONFIG.automation.autoEmailEnabled,
          stepIntervalHours:
            Number(row.step_interval_hours) ||
            DEFAULT_TEMPLATES_CONFIG.automation.stepIntervalHours,
        },
      };
      saveLocalTemplatesConfig(merged);
      return merged;
    }
  } catch {}

  return getLocalTemplatesConfig();
}

export async function saveTemplatesConfig(
  config: FollowUpTemplatesConfig
): Promise<{ success: boolean; error?: string }> {
  saveLocalTemplatesConfig(config);

  try {
    const supabase = createBrowserClient();
    const dbPayload = {
      email_subject: config.email.subject,
      email_body: config.email.body,
      whatsapp_message: config.whatsapp.message,
      abandoned_threshold_minutes: config.automation.abandonedThresholdMinutes,
      auto_whatsapp_enabled: config.automation.autoWhatsappEnabled,
      auto_email_enabled: config.automation.autoEmailEnabled,
      step_interval_hours: config.automation.stepIntervalHours,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase.from("followup_templates").select("id").limit(1);
    if (existing && existing.length > 0) {
      await supabase.from("followup_templates").update(dbPayload).eq("id", existing[0].id);
    } else {
      await supabase.from("followup_templates").insert(dbPayload);
    }
  } catch (err: any) {
    console.warn("Supabase templates save warning:", err?.message);
  }

  return { success: true };
}

// Template variable interpolation
export function interpolateTemplate(
  template: string,
  cart: AbandonedCartRecord,
  baseUrl: string = "https://adornbymashfika.com"
): string {
  const firstName =
    cart.shopper_name && cart.shopper_name !== "Anonymous"
      ? cart.shopper_name.split(" ")[0]
      : "Valued Customer";

  const itemsText = cart.items
    .map((item) => `• ${item.title}${item.selectedColor ? ` (${item.selectedColor})` : ""} x${item.quantity}`)
    .join("\n");

  const itemsHtml = `<ul style="margin: 10px 0; padding-left: 20px;">
    ${cart.items
      .map(
        (i) =>
          `<li style="margin-bottom: 6px;"><strong>${i.title}</strong>${
            i.selectedColor ? ` <em>(${i.selectedColor})</em>` : ""
          } &times; ${i.quantity} &mdash; ৳${(i.price * i.quantity).toLocaleString()}</li>`
      )
      .join("")}
  </ul>`;

  const checkoutUrl = `${baseUrl}/checkout`;

  return template
    .replace(/\{\{customerFirstName\}\}/g, firstName)
    .replace(/\{\{cartTotal\}\}/g, cart.cart_value.toLocaleString())
    .replace(/\{\{cartItemsText\}\}/g, itemsText)
    .replace(/\{\{cartItemsHtml\}\}/g, itemsHtml)
    .replace(/\{\{checkoutUrl\}\}/g, checkoutUrl);
}
