export interface AbandonedCartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  imageUrl?: string;
  gradient?: string;
}

export interface AbandonedCartLead {
  id: string;
  shopperName: string;
  phone: string;
  email?: string;
  items: AbandonedCartItem[];
  cartTotal: number;
  abandonedAt: string; // ISO date string
  lastFollowedUpAt?: string; // ISO date string
  followUpCount: number;
  channel?: "whatsapp" | "email" | "phone";
  guestIdentifier?: string;
}

const ABANDONED_CARTS_KEY = "adorn_abandoned_carts";

export const INITIAL_ABANDONED_CARTS: AbandonedCartLead[] = [
  {
    id: "cart-lead-1",
    shopperName: "Tanzila Hossain",
    phone: "01788990011",
    email: "tanzila.hossain@gmail.com",
    cartTotal: 7300,
    abandonedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    followUpCount: 0,
    guestIdentifier: "Guest Session #Dhaka-941",
    items: [
      {
        id: "prod-1",
        title: "Kundan Royal Choker Set",
        price: 4850,
        quantity: 1,
        selectedColor: "Antique Gold & Emerald",
        imageUrl: "/images/products/kundan-choker-1.jpg",
      },
      {
        id: "prod-2",
        title: "Handcrafted Rose-Quartz Jhumkas",
        price: 2450,
        quantity: 1,
        selectedColor: "Rose Gold",
        imageUrl: "/images/products/rose-quartz-jhumka.jpg",
      },
    ],
  },
  {
    id: "cart-lead-2",
    shopperName: "Samira Akhtar",
    phone: "01811554433",
    email: "samira.akhtar@yahoo.com",
    cartTotal: 5200,
    abandonedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    lastFollowedUpAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    followUpCount: 1,
    channel: "whatsapp",
    guestIdentifier: "Guest Session #Ctg-218",
    items: [
      {
        id: "prod-5",
        title: "Silk Organza Embroidered Dupatta",
        price: 5200,
        quantity: 1,
        selectedColor: "Blush Pink",
        imageUrl: "/images/products/silk-dupatta.jpg",
      },
    ],
  },
  {
    id: "cart-lead-3",
    shopperName: "Mehnaz Karim",
    phone: "01922338877",
    email: "mehnaz.karim@outlook.com",
    cartTotal: 3200,
    abandonedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    followUpCount: 0,
    guestIdentifier: "Guest Session #Sylhet-502",
    items: [
      {
        id: "prod-3",
        title: "Embroidered Velvet Potli Clutch",
        price: 3200,
        quantity: 1,
        selectedColor: "Burgundy Wine",
        imageUrl: "/images/products/velvet-potli.jpg",
      },
    ],
  },
];

export function getAbandonedCarts(): AbandonedCartLead[] {
  if (typeof window === "undefined") return INITIAL_ABANDONED_CARTS;
  try {
    const raw = localStorage.getItem(ABANDONED_CARTS_KEY);
    if (!raw) {
      localStorage.setItem(ABANDONED_CARTS_KEY, JSON.stringify(INITIAL_ABANDONED_CARTS));
      return INITIAL_ABANDONED_CARTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ABANDONED_CARTS;
  }
}

export function saveAbandonedCarts(carts: AbandonedCartLead[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ABANDONED_CARTS_KEY, JSON.stringify(carts));
  } catch {
    // Ignore
  }
}

export function recordFollowUp(
  cartId: string,
  channel: "whatsapp" | "email" | "phone"
): AbandonedCartLead[] {
  const current = getAbandonedCarts();
  const updated = current.map((c) => {
    if (c.id === cartId) {
      return {
        ...c,
        lastFollowedUpAt: new Date().toISOString(),
        followUpCount: (c.followUpCount || 0) + 1,
        channel,
      };
    }
    return c;
  });
  saveAbandonedCarts(updated);
  return updated;
}

export function dismissAbandonedCart(cartId: string): AbandonedCartLead[] {
  const current = getAbandonedCarts();
  const updated = current.filter((c) => c.id !== cartId);
  saveAbandonedCarts(updated);
  return updated;
}
