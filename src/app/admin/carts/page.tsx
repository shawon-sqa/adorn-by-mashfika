"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Settings,
  Trash2,
  MessageCircle,
  Mail,
  ExternalLink,
  Archive,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ShoppingBag,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  AbandonedCartRecord,
  CartStatus,
  FollowUpTemplatesConfig,
  DEFAULT_TEMPLATES_CONFIG,
  fetchAbandonedCarts,
  deleteOrArchiveCart,
  recordCartFollowUp,
  fetchTemplatesConfig,
  interpolateTemplate,
} from "@/lib/data/cartsRecovery";
import { FollowUpTemplatesModal } from "@/components/admin/FollowUpTemplatesModal";
import { formatPrice } from "@/lib/utils/formatters";

// Relative time helper
function formatTimeAgo(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "recently";
  }
}

function formatFollowUpDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  } catch {
    return isoDate;
  }
}

export default function AdminCartsPage() {
  const [carts, setCarts] = useState<AbandonedCartRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | CartStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [templatesConfig, setTemplatesConfig] = useState<FollowUpTemplatesConfig>(DEFAULT_TEMPLATES_CONFIG);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [fetchedCarts, fetchedTemplates] = await Promise.all([
      fetchAbandonedCarts(),
      fetchTemplatesConfig(),
    ]);
    setCarts(fetchedCarts);
    setTemplatesConfig(fetchedTemplates);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered and searched carts
  const filteredCarts = useMemo(() => {
    return carts.filter((c) => {
      // Archived filter - filter out archived carts from active views
      if (!showArchived && Boolean(c.is_archived)) return false;
      if (showArchived && !c.is_archived) return false;

      // Status filter
      if (activeFilter !== "ALL" && c.status !== activeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.shopper_name.toLowerCase().includes(query);
        const matchPhone = c.customer_phone?.toLowerCase().includes(query);
        const matchEmail = c.customer_email?.toLowerCase().includes(query);
        const matchItem = c.items.some((i) => i.title.toLowerCase().includes(query));
        if (!matchName && !matchPhone && !matchEmail && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [carts, activeFilter, searchQuery, showArchived]);

  // Handle follow up via WhatsApp (Opens https://wa.me/880${cleanPhone}?text=...)
  const handleWhatsAppFollowUp = async (cart: AbandonedCartRecord) => {
    const rawPhone = (cart.customer_phone || "").replace(/[^0-9]/g, "");
    if (!rawPhone) {
      alert("No phone number recorded for this cart session yet.");
      return;
    }

    // Clean phone number: 11 digit e.g. 017XXXXXXXX -> 88017XXXXXXXX
    const cleanDigits = rawPhone.startsWith("88") ? rawPhone.slice(2) : rawPhone;
    const finalPhone = cleanDigits.startsWith("0") ? `88${cleanDigits}` : `880${cleanDigits}`;

    const message = interpolateTemplate(templatesConfig.whatsapp.message, cart);
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Record follow up timestamp & channel in Supabase
    const updated = await recordCartFollowUp(cart.id, "WHATSAPP");
    setCarts(updated);
    showToast(`WhatsApp follow-up logged for ${cart.shopper_name}`);
  };

  // Handle follow up via Email (Opens mailto:${email}?subject=...&body=...)
  const handleEmailFollowUp = async (cart: AbandonedCartRecord) => {
    const rawEmail = (cart.customer_email || "").trim();
    if (!rawEmail) {
      alert("No email address recorded for this cart session yet.");
      return;
    }

    const subject = templatesConfig.email.subject || "Your Adorn by Mashfika shopping bag is waiting 🛍️";
    // Plaintext summary for mailto body
    const body = `Dear ${cart.shopper_name && cart.shopper_name !== "Anonymous" ? cart.shopper_name : "Customer"},\n\nWe noticed you left items in your cart at Adorn by Mashfika.\nTotal value: BDT ${cart.cart_value.toLocaleString()}\n\nYou can complete your order here:\nhttps://adornbymashfika.com/checkout\n\nWarm regards,\nAdorn by Mashfika Concierge`;
    const mailtoUrl = `mailto:${encodeURIComponent(rawEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    // Record follow up timestamp & channel in Supabase
    const updated = await recordCartFollowUp(cart.id, "EMAIL");
    setCarts(updated);
    showToast(`Email follow-up logged for ${cart.shopper_name}`);
  };

  // Handle delete
  const handleDelete = async (cart: AbandonedCartRecord) => {
    const confirmText = showArchived
      ? `Permanently delete cart record for "${cart.shopper_name}" from Supabase?`
      : `Archive cart record for "${cart.shopper_name}"?`;

    if (!window.confirm(confirmText)) return;

    const updated = await deleteOrArchiveCart(cart.id, showArchived);
    setCarts(updated);
    showToast(showArchived ? "Cart permanently removed from Supabase" : "Cart archived");
  };

  const getStatusBadge = (status: CartStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case "ABANDONED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
            Abandoned
          </span>
        );
      case "CONVERTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Converted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal font-normal tracking-tight">
            Carts
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time shopping sessions, abandoned lead tracking, and automated WhatsApp follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-brand-border bg-white text-zinc-600 hover:text-brand-charcoal hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setTemplatesModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-brand-border bg-white hover:bg-zinc-50 text-xs font-semibold text-brand-charcoal transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-brand-primary" />
            <span>⚙ Settings</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-border/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/50 pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(["ALL", "ACTIVE", "ABANDONED", "CONVERTED"] as const).map((tab) => {
              const count = carts.filter((c) => {
                if (c.is_archived && !showArchived) return false;
                if (!c.is_archived && showArchived) return false;
                return tab === "ALL" ? true : c.status === tab;
              }).length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tab
                      ? "bg-brand-primary text-white shadow-xs"
                      : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-brand-border/60"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeFilter === tab ? "bg-white/25 text-white" : "bg-zinc-200/80 text-zinc-700"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Archived Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 accent-[#B76E79] rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-zinc-400" />
                Show Archived ({carts.filter((c) => c.is_archived).length})
              </span>
            </label>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by shopper name, phone, email, or cart item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-zinc-50/50 text-xs focus:outline-none focus:border-brand-primary text-brand-charcoal"
          />
        </div>
      </div>

      {/* Main Carts Table */}
      <div className="bg-white rounded-3xl border border-brand-border/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border/70 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 select-none">
                <th className="py-3.5 px-5">Shopper</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Cart value</th>
                <th className="py-3.5 px-4">Last active</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Recovery</th>
                <th className="py-3.5 px-4">Last follow-up</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
                      <p className="font-serif text-sm text-brand-charcoal">No cart sessions found</p>
                      <p className="text-[11px] text-zinc-400">
                        {searchQuery
                          ? "Try a different search query."
                          : "Live customer carts and leads will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => {
                  return (
                    <tr
                      key={cart.id}
                      className="hover:bg-zinc-50/60 transition-colors group"
                    >
                      {/* Shopper info */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-brand-charcoal block group-hover:text-brand-primary transition-colors">
                            {cart.shopper_name}
                          </span>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {cart.customer_phone ? (
                              <span>{cart.customer_phone}</span>
                            ) : (
                              <span className="text-zinc-400 italic">No phone</span>
                            )}
                          </div>
                          {cart.customer_email && (
                            <span className="text-[10px] text-zinc-400 block truncate max-w-[160px]">
                              {cart.customer_email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items previews with rounded stacked badges */}
                      <td className="py-4 px-4">
                        <div className="flex items-center -space-x-2 relative">
                          {cart.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={`${item.id}-${idx}`}
                              title={`${item.title} (${item.quantity}x)`}
                              className="w-8 h-8 rounded-full border-2 border-white bg-brand-ivory overflow-hidden relative shadow-2xs shrink-0 flex items-center justify-center cursor-help"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-serif text-[9px] text-zinc-600">
                                  {item.title.charAt(0)}
                                </span>
                              )}
                            </div>
                          ))}
                          {cart.items.length > 3 && (
                            <span className="w-8 h-8 rounded-full border-2 border-white bg-brand-blush text-brand-primary text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              +{cart.items.length - 3}
                            </span>
                          )}
                          <span className="text-[11px] text-zinc-400 ml-3">
                            {cart.items.reduce((acc, i) => acc + i.quantity, 0)} item{cart.items.reduce((acc, i) => acc + i.quantity, 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>

                      {/* Cart Value */}
                      <td className="py-4 px-4">
                        <span className="font-serif font-bold text-sm text-brand-charcoal">
                          {formatPrice(cart.cart_total !== undefined && cart.cart_total !== null ? cart.cart_total : cart.cart_value)}
                        </span>
                      </td>

                      {/* Last active relative time */}
                      <td className="py-4 px-4">
                        <span className="text-zinc-500 text-[11px] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {formatTimeAgo(cart.last_active || cart.last_active_at)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(cart.status)}
                      </td>

                      {/* Recovery step indicators (1, 2, 3) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5" title={`Recovery touch: Step ${cart.recovery_step || 0} of 3`}>
                          {[1, 2, 3].map((step) => {
                            const completed = (cart.recovery_step || 0) >= step;
                            return (
                              <span
                                key={step}
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                                  completed
                                    ? "bg-brand-primary text-white shadow-2xs"
                                    : "bg-zinc-100 text-zinc-400 border border-brand-border/60"
                                }`}
                              >
                                {step}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Last follow-up */}
                      <td className="py-4 px-4">
                        {cart.last_follow_up_at ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-zinc-600 font-mono block">
                              {formatFollowUpDate(cart.last_follow_up_at)}
                            </span>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {cart.last_follow_up_channel || "WHATSAPP"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppFollowUp(cart)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold tracking-wide transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Send customized WhatsApp recovery message"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          {cart.customer_email && (
                            <button
                              type="button"
                              onClick={() => handleEmailFollowUp(cart)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold tracking-wide transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Send Email recovery message"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(cart)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={showArchived ? "Permanently delete" : "Archive cart"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up Templates Modal */}
      <FollowUpTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        config={templatesConfig}
        onSaved={(newCfg) => setTemplatesConfig(newCfg)}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
