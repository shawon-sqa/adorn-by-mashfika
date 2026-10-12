import { createBrowserClient } from "@/lib/supabase/client";
import { SupabaseOrder, SupabaseOrderItem } from "@/lib/types/supabase";
import { AdminOrderRecord, OrderStatus, INITIAL_MOCK_ORDERS } from "./adminOrders";

interface LogisticsMeta {
  courierName?: string;
  trackingNumber?: string;
  courierNotes?: string;
}

export interface OrderCouponMeta {
  couponCode?: string;
  discountAmount?: number;
}

function parseOrderNotes(rawNotes?: string | null): {
  cleanNotes?: string;
  logistics?: LogisticsMeta;
  couponMeta?: OrderCouponMeta;
} {
  if (!rawNotes) return {};
  let currentNotes = rawNotes;
  let logistics: LogisticsMeta | undefined;
  let couponMeta: OrderCouponMeta | undefined;

  const logisticsRegex = /<!--ADORN_LOGISTICS:(.*?)-->/;
  const logMatch = currentNotes.match(logisticsRegex);
  if (logMatch && logMatch[1]) {
    try {
      logistics = JSON.parse(logMatch[1]);
      currentNotes = currentNotes.replace(logisticsRegex, "");
    } catch {
      // Fallback
    }
  }

  const couponRegex = /<!--ADORN_COUPON:(.*?)-->/;
  const cpnMatch = currentNotes.match(couponRegex);
  if (cpnMatch && cpnMatch[1]) {
    try {
      couponMeta = JSON.parse(cpnMatch[1]);
      currentNotes = currentNotes.replace(couponRegex, "");
    } catch {
      // Fallback
    }
  }

  return {
    cleanNotes: currentNotes.trim() || undefined,
    logistics,
    couponMeta,
  };
}

export function encodeOrderNotes(
  cleanNotes: string = "",
  logistics?: LogisticsMeta,
  couponMeta?: OrderCouponMeta
): string {
  let result = cleanNotes.trim();
  if (couponMeta && (couponMeta.couponCode || couponMeta.discountAmount)) {
    result = `${result}${result ? "\n\n" : ""}<!--ADORN_COUPON:${JSON.stringify(couponMeta)}-->`;
  }
  if (logistics && (logistics.courierName || logistics.trackingNumber || logistics.courierNotes)) {
    result = `${result}${result ? "\n\n" : ""}<!--ADORN_LOGISTICS:${JSON.stringify(logistics)}-->`;
  }
  return result.trim();
}

export async function fetchSupabaseOrders(): Promise<AdminOrderRecord[]> {
  try {
    const supabase = createBrowserClient();
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error || !dbOrders) {
      console.warn("Error fetching Supabase orders, returning fallback:", error);
      return [];
    }

    return dbOrders.map((ord: SupabaseOrder) => {
      const items = (ord.order_items || []).map((item: SupabaseOrderItem) => ({
        id: item.product_id || item.id,
        title: item.product_title,
        price: item.price,
        quantity: item.quantity,
        gradient: "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]",
        imageUrl: item.image_url || undefined,
      }));

      const { cleanNotes, logistics, couponMeta } = parseOrderNotes(ord.notes);

      return {
        orderId: ord.order_number,
        createdAt: ord.created_at,
        orderStatus: ord.status as OrderStatus,
        customer: {
          fullName: ord.customer_name,
          phone: ord.customer_phone,
          deliveryZone: ord.delivery_zone,
          address: ord.address,
          city: ord.city,
          notes: cleanNotes,
        },
        items: items.length > 0 ? items : [
          {
            id: "item-1",
            title: "Boutique Order",
            price: ord.subtotal,
            quantity: 1,
            gradient: "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]",
          },
        ],
        payment: {
          method: ord.payment_method,
          status: ord.payment_method === "cod" ? "cod_payable" : "pending_verification",
          bkashSenderPhone: ord.bkash_sender || undefined,
          bkashTrxId: ord.bkash_trx_id || undefined,
        },
        pricing: {
          subtotal: ord.subtotal,
          shippingFee: ord.delivery_fee,
          grandTotal: ord.total,
          discountAmount: couponMeta?.discountAmount,
          couponCode: couponMeta?.couponCode,
        },
        estimatedDelivery:
          ord.delivery_zone === "inside_dhaka"
            ? "24 to 48 Hours (Dhaka Metro Express)"
            : "3 to 5 Business Days (Nationwide Courier)",
        courierName: logistics?.courierName,
        trackingNumber: logistics?.trackingNumber,
        courierNotes: logistics?.courierNotes,
      };
    });
  } catch (err) {
    console.error("fetchSupabaseOrders exception:", err);
    return [];
  }
}

export async function updateSupabaseOrderStatus(
  orderNumber: string,
  newStatus: OrderStatus,
  logistics?: LogisticsMeta,
  existingCustomerNotes?: string
): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const updatePayload: Record<string, any> = { status: newStatus };

    if (logistics) {
      updatePayload.notes = encodeOrderNotes(existingCustomerNotes || "", logistics);
    }

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("order_number", orderNumber);

    if (error) {
      console.error("Supabase update error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("updateSupabaseOrderStatus exception:", err);
    return false;
  }
}

export async function deleteSupabaseOrder(orderNumber: string): Promise<boolean> {
  try {
    const supabase = createBrowserClient();

    // First find order ID to delete associated order_items
    const { data: orderData } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .single();

    if (orderData?.id) {
      // Delete child order items first
      await supabase.from("order_items").delete().eq("order_id", orderData.id);
    }

    // Delete order row
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("order_number", orderNumber);

    if (error) {
      console.error("Supabase delete order error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("deleteSupabaseOrder exception:", err);
    return false;
  }
}
