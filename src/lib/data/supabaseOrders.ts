import { createBrowserClient } from "@/lib/supabase/client";
import { SupabaseOrder, SupabaseOrderItem } from "@/lib/types/supabase";
import { AdminOrderRecord, OrderStatus, INITIAL_MOCK_ORDERS } from "./adminOrders";

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
      }));

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
          notes: ord.notes || undefined,
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
        },
        estimatedDelivery:
          ord.delivery_zone === "inside_dhaka"
            ? "24 to 48 Hours (Dhaka Metro Express)"
            : "3 to 5 Business Days (Nationwide Courier)",
      };
    });
  } catch (err) {
    console.error("fetchSupabaseOrders exception:", err);
    return [];
  }
}

export async function updateSupabaseOrderStatus(
  orderNumber: string,
  newStatus: OrderStatus
): Promise<boolean> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
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
