import { OrderRecord } from "@/lib/validations/checkout";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AdminOrderRecord extends OrderRecord {
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
}

export const INITIAL_MOCK_ORDERS: AdminOrderRecord[] = [
  {
    orderId: "ADM-928412",
    createdAt: "2026-10-11T09:30:00.000Z",
    orderStatus: "pending",
    customer: {
      fullName: "Nusrat Jahan",
      phone: "01711223344",
      deliveryZone: "inside_dhaka",
      address: "House 24, Road 11, Block D, Banani",
      city: "Dhaka",
      notes: "Please call before arriving, deliver after 2 PM",
    },
    items: [
      {
        id: "prod-1",
        title: "Kundan Royal Choker Set",
        price: 4850,
        quantity: 1,
        selectedColor: "Antique Gold & Emerald",
        gradient: "from-[#F7E7CE] via-[#FCEADE] to-[#F3D1DC]",
      },
    ],
    payment: {
      method: "bkash_manual",
      status: "pending_verification",
      bkashSenderPhone: "01711223344",
      bkashTrxId: "BK9X8A12QP",
    },
    pricing: {
      subtotal: 4850,
      shippingFee: 0,
      grandTotal: 4850,
    },
    estimatedDelivery: "24 to 48 Hours (Dhaka Metro Express)",
  },
  {
    orderId: "ADM-814920",
    createdAt: "2026-10-10T14:15:00.000Z",
    orderStatus: "confirmed",
    customer: {
      fullName: "Farhana Chowdhury",
      phone: "01822334455",
      deliveryZone: "outside_dhaka",
      address: "Mehedibag R/A, Lane 3, House 12",
      city: "Chittagong",
    },
    items: [
      {
        id: "prod-2",
        title: "Handcrafted Rose-Quartz Jhumkas",
        price: 2450,
        quantity: 1,
        selectedColor: "Rose Gold",
        gradient: "from-[#FADADD] via-[#FDE8E9] to-[#F4C2C2]",
      },
      {
        id: "prod-4",
        title: "Pearl Statement Cocktail Ring",
        price: 1650,
        quantity: 1,
        selectedColor: "Champagne Gold",
        gradient: "from-[#FFF6E9] via-[#FAF0E6] to-[#EAD7D1]",
      },
    ],
    payment: {
      method: "cod",
      status: "cod_payable",
    },
    pricing: {
      subtotal: 4100,
      shippingFee: 130,
      grandTotal: 4230,
    },
    estimatedDelivery: "3 to 5 Business Days (Nationwide Courier)",
    courierName: "Steadfast Courier",
    trackingNumber: "STF-BD-89210",
  },
  {
    orderId: "ADM-731904",
    createdAt: "2026-10-09T18:40:00.000Z",
    orderStatus: "shipped",
    customer: {
      fullName: "Sadia Alam",
      phone: "01933445566",
      deliveryZone: "inside_dhaka",
      address: "Flat 4B, Concord Tower, Dhanmondi 27",
      city: "Dhaka",
    },
    items: [
      {
        id: "prod-3",
        title: "Embroidered Velvet Potli Clutch",
        price: 3200,
        quantity: 1,
        selectedColor: "Burgundy Wine",
        gradient: "from-[#EDE6D6] via-[#EFE5DB] to-[#E3CBB3]",
      },
    ],
    payment: {
      method: "cod",
      status: "cod_payable",
    },
    pricing: {
      subtotal: 3200,
      shippingFee: 0,
      grandTotal: 3200,
    },
    estimatedDelivery: "24 to 48 Hours (Dhaka Metro Express)",
    courierName: "Pathao Express",
    trackingNumber: "PTH-91283",
  },
  {
    orderId: "ADM-609124",
    createdAt: "2026-10-08T11:20:00.000Z",
    orderStatus: "delivered",
    customer: {
      fullName: "Mashiyat Tasnim",
      phone: "01755667788",
      deliveryZone: "inside_dhaka",
      address: "House 18, Road 4, Sector 7, Uttara",
      city: "Dhaka",
    },
    items: [
      {
        id: "prod-5",
        title: "Silk Organza Embroidered Dupatta",
        price: 5200,
        quantity: 1,
        selectedColor: "Blush Pink",
        gradient: "from-[#FFEBE8] via-[#FFF3F1] to-[#FCE3DF]",
      },
    ],
    payment: {
      method: "bkash_manual",
      status: "pending_verification",
      bkashSenderPhone: "01755667788",
      bkashTrxId: "BK7721AA99",
    },
    pricing: {
      subtotal: 5200,
      shippingFee: 0,
      grandTotal: 5200,
    },
    estimatedDelivery: "Delivered on 10 Oct 2026",
    courierName: "RedX Delivery",
    trackingNumber: "RDX-77192",
  },
];

const ADMIN_ORDERS_KEY = "adorn_admin_orders";

export function getAdminOrders(): AdminOrderRecord[] {
  if (typeof window === "undefined") return INITIAL_MOCK_ORDERS;
  try {
    const stored = localStorage.getItem(ADMIN_ORDERS_KEY);
    if (!stored) {
      // Check user placed orders in checkout
      const userOrdersRaw = localStorage.getItem("adorn_orders");
      const userOrders: OrderRecord[] = userOrdersRaw ? JSON.parse(userOrdersRaw) : [];
      const merged: AdminOrderRecord[] = [
        ...userOrders.map((o) => ({
          ...o,
          orderStatus: "pending" as OrderStatus,
        })),
        ...INITIAL_MOCK_ORDERS,
      ];
      localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_MOCK_ORDERS;
  }
}

export function saveAdminOrders(orders: AdminOrderRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Ignore
  }
}

export function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  courierName?: string,
  trackingNumber?: string
): AdminOrderRecord[] {
  const current = getAdminOrders();
  const updated = current.map((ord) => {
    if (ord.orderId === orderId) {
      return {
        ...ord,
        orderStatus: newStatus,
        ...(courierName !== undefined && { courierName }),
        ...(trackingNumber !== undefined && { trackingNumber }),
      };
    }
    return ord;
  });
  saveAdminOrders(updated);
  return updated;
}
