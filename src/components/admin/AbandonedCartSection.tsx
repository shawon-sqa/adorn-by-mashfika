"use client";

import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Trash2,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  AbandonedCartLead,
  recordFollowUp,
  dismissAbandonedCart,
} from "@/lib/data/abandonedCarts";
import { formatPrice } from "@/lib/utils/formatters";

interface AbandonedCartSectionProps {
  initialCarts: AbandonedCartLead[];
}

export function AbandonedCartSection({ initialCarts }: AbandonedCartSectionProps) {
  const [carts, setCarts] = useState<AbandonedCartLead[]>(initialCarts);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDismiss = (cartId: string, name: string) => {
    const confirmed = window.confirm(`Dismiss active cart follow-up for "${name}"?`);
    if (!confirmed) return;
    const remaining = dismissAbandonedCart(cartId);
    setCarts(remaining);
    showToast(`Cart lead for ${name} removed`);
  };

  const generateWhatsAppLink = (cart: AbandonedCartLead) => {
    const cleanPhone = cart.phone.replace(/[^0-9]/g, "");
    // Format to 880 prefix if BD phone
    const formattedPhone = cleanPhone.startsWith("0")
      ? `88${cleanPhone}`
      : cleanPhone.startsWith("88")
      ? cleanPhone
      : `880${cleanPhone}`;

    const itemsList = cart.items
      .map((i) => `• ${i.title}${i.selectedColor ? ` (${i.selectedColor})` : ""}`)
      .join("\n");

    const message = `Assalamu Alaikum ${cart.shopperName},\n\nWe noticed you left some exquisite handcrafted pieces in your bag at Adorn by Mashfika:\n${itemsList}\n\nTotal: ${formatPrice(cart.cartTotal)}\n\nWould you like any assistance completing your reservation or custom sizing details? We would love to assist you!\n\nWarm regards,\nAdorn by Mashfika Concierge`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  const generateMailtoLink = (cart: AbandonedCartLead) => {
    const subject = `Your curated pieces are waiting — Adorn by Mashfika`;
    const itemsList = cart.items
      .map((i) => `- ${i.title}${i.selectedColor ? ` (${i.selectedColor})` : ""}`)
      .join("\n");

    const body = `Dear ${cart.shopperName},\n\nWe noticed you were browsing our handcrafted boutique collections and left these cherished creations in your bag:\n\n${itemsList}\n\nCart Total: ${formatPrice(cart.cartTotal)}\n\nOur concierge team is at your disposal if you have any questions regarding delivery, payment, or styling.\n\nWarm regards,\nAdorn by Mashfika\nhttps://adornbymashfika.com`;

    return `mailto:${cart.email || ""}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleFollowUpClick = (
    cartId: string,
    channel: "whatsapp" | "email",
    url: string
  ) => {
    const updated = recordFollowUp(cartId, channel);
    setCarts(updated);
    setActivePopover(null);
    showToast(`Logged ${channel.toUpperCase()} follow-up`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Not contacted yet";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Followed up just now";
    if (diffHours === 1) return "Followed up 1 hour ago";
    if (diffHours < 24) return `Followed up ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Followed up ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (carts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg text-brand-charcoal">
              Active Customer Carts & Abandoned Follow-Ups
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-blush text-brand-primary text-[10px] font-bold">
              {carts.length} Leads
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Shoppers with items saved in cart ready for boutique customer service engagement.
          </p>
        </div>

        {toastMessage && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {toastMessage}
          </div>
        )}
      </div>

      {/* Grid of Cart Leads */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {carts.map((cart) => (
          <div
            key={cart.id}
            className="rounded-2xl border border-brand-border/80 p-5 bg-[#FCFAF8] hover:border-brand-primary/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-brand-charcoal text-sm">
                    {cart.shopperName}
                  </h3>
                  <p className="text-xs text-brand-primary font-mono mt-0.5">
                    {cart.phone}
                  </p>
                  {cart.email && (
                    <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                      {cart.email}
                    </p>
                  )}
                  {cart.guestIdentifier && (
                    <span className="inline-block mt-1 text-[10px] text-zinc-400 bg-white px-2 py-0.5 rounded-md border border-brand-border/60">
                      {cart.guestIdentifier}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDismiss(cart.id, cart.shopperName)}
                  title="Dismiss lead"
                  className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items Previews */}
              <div className="mt-4 pt-3 border-t border-brand-border/60">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Curated Creations ({cart.items.length})
                </span>

                <div className="space-y-2">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg border border-brand-border/80 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-zinc-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-charcoal truncate font-medium">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Qty: {item.quantity}{" "}
                          {item.selectedColor && `• ${item.selectedColor}`}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-zinc-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom info & Actions */}
            <div className="pt-3 border-t border-brand-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Cart Total</span>
                <span className="font-serif font-bold text-base text-brand-primary">
                  {formatPrice(cart.cartTotal)}
                </span>
              </div>

              {/* Status info */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Clock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{formatTimeAgo(cart.lastFollowedUpAt)}</span>
                {cart.followUpCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">
                    {cart.followUpCount} contacted
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActivePopover(activePopover === cart.id ? null : cart.id)
                  }
                  className="w-full py-2 px-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Follow Up with Customer
                </button>

                {/* Popover options */}
                {activePopover === cart.id && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-xl border border-brand-border shadow-lg z-20 space-y-1 animate-in fade-in slide-in-from-bottom-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleFollowUpClick(
                          cart.id,
                          "whatsapp",
                          generateWhatsAppLink(cart)
                        )
                      }
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Send WhatsApp Reminder</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </button>

                    {cart.email && (
                      <button
                        type="button"
                        onClick={() =>
                          handleFollowUpClick(
                            cart.id,
                            "email",
                            generateMailtoLink(cart)
                          )
                        }
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-zinc-700 hover:bg-brand-blush hover:text-brand-primary transition-colors cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-brand-primary" />
                        <span>Send Email Reminder</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
