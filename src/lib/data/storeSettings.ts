import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  insideDhakaDeliveryFee: string;
  outsideDhakaDeliveryFee: string;
  freeDeliveryThreshold: string;
  bkashNumber: string;
  enableFirstOrderPopup: boolean;
  show_first_order_popup?: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Adorn by Mashfika",
  tagline: "Elegance in Every Detail.",
  contactPhone: "01353655433",
  contactEmail: "hello@adornbymashfika.com",
  address: "Gulshan-2 / Banani, Dhaka, Bangladesh",
  insideDhakaDeliveryFee: "70",
  outsideDhakaDeliveryFee: "130",
  freeDeliveryThreshold: "2000",
  bkashNumber: "01353655433",
  enableFirstOrderPopup: true,
  show_first_order_popup: true,
};

const SETTINGS_STORAGE_KEY = "adorn_store_settings";

export function getLocalStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const popupAllowed =
        parsed.show_first_order_popup !== undefined
          ? Boolean(parsed.show_first_order_popup)
          : parsed.enableFirstOrderPopup !== undefined
          ? Boolean(parsed.enableFirstOrderPopup)
          : true;

      return {
        ...DEFAULT_STORE_SETTINGS,
        ...parsed,
        enableFirstOrderPopup: popupAllowed,
        show_first_order_popup: popupAllowed,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveLocalStoreSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return;
  try {
    const popupAllowed =
      settings.show_first_order_popup !== undefined
        ? Boolean(settings.show_first_order_popup)
        : Boolean(settings.enableFirstOrderPopup);

    const normalized = {
      ...settings,
      enableFirstOrderPopup: popupAllowed,
      show_first_order_popup: popupAllowed,
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(
      new CustomEvent("adorn_store_settings_updated", { detail: normalized })
    );
  } catch {
    // fallback
  }
}

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    setSettings(getLocalStoreSettings());

    let mounted = true;
    fetchStoreSettings().then((live) => {
      if (mounted) setSettings(live);
    });

    const handleUpdate = (e: Event) => {
      if ((e as CustomEvent).detail) {
        setSettings((e as CustomEvent).detail);
      } else {
        setSettings(getLocalStoreSettings());
      }
    };

    window.addEventListener("adorn_store_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("adorn_store_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return settings;
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const local = getLocalStoreSettings();
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      const dbPopupSetting =
        row.show_first_order_popup !== undefined && row.show_first_order_popup !== null
          ? Boolean(row.show_first_order_popup)
          : row.enable_first_order_popup !== undefined && row.enable_first_order_popup !== null
          ? Boolean(row.enable_first_order_popup)
          : local.show_first_order_popup !== undefined
          ? Boolean(local.show_first_order_popup)
          : local.enableFirstOrderPopup !== undefined
          ? Boolean(local.enableFirstOrderPopup)
          : true;

      const merged: StoreSettings = {
        storeName: row.store_name || local.storeName,
        tagline: row.tagline || local.tagline,
        contactPhone: row.phone || local.contactPhone,
        contactEmail: row.email || local.contactEmail,
        address: local.address,
        insideDhakaDeliveryFee: row.inside_dhaka_fee
          ? String(row.inside_dhaka_fee)
          : local.insideDhakaDeliveryFee,
        outsideDhakaDeliveryFee: row.outside_dhaka_fee
          ? String(row.outside_dhaka_fee)
          : local.outsideDhakaDeliveryFee,
        freeDeliveryThreshold: row.free_delivery_above
          ? String(row.free_delivery_above)
          : local.freeDeliveryThreshold,
        bkashNumber: row.payment_number || local.bkashNumber,
        enableFirstOrderPopup: dbPopupSetting,
        show_first_order_popup: dbPopupSetting,
      };
      saveLocalStoreSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn("fetchStoreSettings notice:", err);
  }
  return local;
}

export async function updateStoreSettings(
  settings: StoreSettings
): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately persist locally so reload always retains values
  saveLocalStoreSettings(settings);

  const popupAllowed =
    settings.show_first_order_popup !== undefined
      ? Boolean(settings.show_first_order_popup)
      : Boolean(settings.enableFirstOrderPopup);

  // 2. Attempt updating or inserting in Supabase store_settings table
  try {
    const supabase = createBrowserClient();
    const dbPayload: Record<string, any> = {
      store_name: settings.storeName,
      tagline: settings.tagline,
      phone: settings.contactPhone,
      email: settings.contactEmail,
      inside_dhaka_fee: Number(settings.insideDhakaDeliveryFee) || 70,
      outside_dhaka_fee: Number(settings.outsideDhakaDeliveryFee) || 130,
      free_delivery_above: Number(settings.freeDeliveryThreshold) || 2000,
      payment_number: settings.bkashNumber,
      show_first_order_popup: popupAllowed,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1);

    if (existing && existing.length > 0) {
      let { error: updateErr } = await supabase
        .from("store_settings")
        .update(dbPayload)
        .eq("id", existing[0].id);

      if (updateErr && updateErr.message?.includes("show_first_order_popup")) {
        delete dbPayload.show_first_order_popup;
        const retry = await supabase
          .from("store_settings")
          .update(dbPayload)
          .eq("id", existing[0].id);
        updateErr = retry.error;
      }

      if (updateErr) {
        console.warn("Supabase store_settings update notice:", updateErr.message);
      }
    } else {
      let { error: insertErr } = await supabase
        .from("store_settings")
        .insert(dbPayload);

      if (insertErr && insertErr.message?.includes("show_first_order_popup")) {
        delete dbPayload.show_first_order_popup;
        const retry = await supabase
          .from("store_settings")
          .insert(dbPayload);
        insertErr = retry.error;
      }

      if (insertErr) {
        console.warn("Supabase store_settings insert notice:", insertErr.message);
      }
    }
  } catch (err) {
    console.warn("updateStoreSettings exception:", err);
  }

  return { success: true };
}
