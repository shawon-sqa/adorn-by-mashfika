import { z } from "zod";

export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name must be less than 80 characters"),
  phone: z
    .string()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)"
    ),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"], {
    error: "Please select a delivery zone",
  }),
  address: z
    .string()
    .min(10, "Please provide detailed street address, house/road number, and area")
    .max(300, "Address is too long"),
  city: z
    .string()
    .min(2, "City or district is required")
    .max(50, "City name is too long"),
  notes: z.string().max(300, "Notes must be under 300 characters").optional(),
  paymentMethod: z.enum(["cod", "bkash_manual"], {
    error: "Please select a payment method",
  }),
  bkashSenderPhone: z.string().optional(),
  bkashTrxId: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === "bkash_manual") {
      return (
        !!data.bkashSenderPhone &&
        /^01[3-9]\d{8}$/.test(data.bkashSenderPhone) &&
        !!data.bkashTrxId &&
        data.bkashTrxId.length >= 8
      );
    }
    return true;
  },
  {
    message: "Please provide a valid 11-digit bKash sender number and Transaction ID (min 8 characters)",
    path: ["bkashTrxId"],
  }
);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    deliveryZone: "inside_dhaka" | "outside_dhaka";
    address: string;
    city: string;
    notes?: string;
  };
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    gradient: string;
  }[];
  payment: {
    method: "cod" | "bkash_manual";
    status: "pending_verification" | "cod_payable";
    bkashSenderPhone?: string;
    bkashTrxId?: string;
  };
  pricing: {
    subtotal: number;
    shippingFee: number;
    grandTotal: number;
  };
  estimatedDelivery: string;
}
