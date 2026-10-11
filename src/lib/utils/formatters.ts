/**
 * Formats numeric price into Bangladeshi Taka currency format (e.g., "৳ 1,250")
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(amount);

  return `৳ ${formatted}`;
}

/**
 * Formats a phone number for Bangladeshi standard display
 */
export function formatBDPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("880")) {
    return `+880 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}
