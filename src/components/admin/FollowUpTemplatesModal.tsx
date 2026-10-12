"use client";

import { useState } from "react";
import {
  X,
  Mail,
  MessageCircle,
  Cpu,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  FollowUpTemplatesConfig,
  DEFAULT_TEMPLATES_CONFIG,
  saveTemplatesConfig,
} from "@/lib/data/cartsRecovery";

interface FollowUpTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FollowUpTemplatesConfig;
  onSaved: (newConfig: FollowUpTemplatesConfig) => void;
}

export function FollowUpTemplatesModal({
  isOpen,
  onClose,
  config,
  onSaved,
}: FollowUpTemplatesModalProps) {
  const [activeTab, setActiveTab] = useState<"EMAIL" | "WHATSAPP" | "AUTOMATION">("WHATSAPP");
  const [formData, setFormData] = useState<FollowUpTemplatesConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all recovery templates to boutique default settings?")) {
      setFormData(DEFAULT_TEMPLATES_CONFIG);
      showToast("Reset to default templates");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTemplatesConfig(formData);
      onSaved(formData);
      showToast("Follow-up templates saved successfully");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      showToast("Failed to save templates. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableVariables = [
    { tag: "{{customerFirstName}}", desc: "Customer's first name or 'Valued Customer'" },
    { tag: "{{cartTotal}}", desc: "Total cart value in BDT (e.g. 1,909)" },
    { tag: "{{cartItemsText}}", desc: "Plaintext list of items with selected colors & quantities" },
    { tag: "{{cartItemsHtml}}", desc: "HTML unordered list of items for formatted emails" },
    { tag: "{{checkoutUrl}}", desc: "Direct link to store checkout" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-brand-border/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between bg-zinc-50/70">
          <div>
            <h3 className="font-serif text-lg text-brand-charcoal font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Follow-up templates
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Used by the <span className="font-semibold text-brand-charcoal">Follow up</span> button on each cart
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-brand-charcoal hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-brand-border/60 bg-white flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("EMAIL")}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "EMAIL"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-zinc-400 hover:text-brand-charcoal"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("WHATSAPP")}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "WHATSAPP"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-zinc-400 hover:text-brand-charcoal"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AUTOMATION")}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "AUTOMATION"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-zinc-400 hover:text-brand-charcoal"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Automation
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "EMAIL" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.email.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: { ...prev.email, subject: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/40 text-brand-charcoal"
                  placeholder="e.g. পছন্দের গহনাগুলো কার্টেই রয়ে গেছে 🛍️"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Email Body (HTML / Text)
                </label>
                <textarea
                  rows={8}
                  value={formData.email.body}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: { ...prev.email, body: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-primary bg-zinc-50/40 text-zinc-700 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "WHATSAPP" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  WhatsApp Greeting Message
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Pre-fills WhatsApp web and mobile app when clicking "Follow up" on any cart record.
                </p>
                <textarea
                  rows={9}
                  value={formData.whatsapp.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, message: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs font-mono focus:outline-none focus:border-brand-primary bg-zinc-50/40 text-zinc-700 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "AUTOMATION" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-brand-blush/40 border border-brand-primary/20 space-y-1">
                <span className="text-xs font-semibold text-brand-charcoal block">
                  Abandoned Threshold
                </span>
                <p className="text-[11px] text-zinc-500">
                  Mark active sessions as ABANDONED if no checkout occurred within this timeframe.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={formData.automation.abandonedThresholdMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        automation: {
                          ...prev.automation,
                          abandonedThresholdMinutes: Number(e.target.value) || 30,
                        },
                      }))
                    }
                    className="w-24 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-xs font-mono"
                  />
                  <span className="text-xs text-zinc-600">Minutes</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-brand-border/60">
                <div>
                  <span className="text-xs font-semibold text-brand-charcoal block">
                    One-Click WhatsApp Quick Follow-up
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Directly prefill WhatsApp Web with personal details on "Follow up" click
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.automation.autoWhatsappEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      automation: {
                        ...prev.automation,
                        autoWhatsappEnabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-[#B76E79] rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border/60 space-y-1">
                <span className="text-xs font-semibold text-brand-charcoal block">
                  Step Interval
                </span>
                <p className="text-[11px] text-zinc-500">
                  Recommended minimum cooldown between recovery touches (Step 1 → Step 2 → Step 3).
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={formData.automation.stepIntervalHours}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        automation: {
                          ...prev.automation,
                          stepIntervalHours: Number(e.target.value) || 4,
                        },
                      }))
                    }
                    className="w-24 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-xs font-mono"
                  />
                  <span className="text-xs text-zinc-600">Hours</span>
                </div>
              </div>
            </div>
          )}

          {/* Available Variables Guide */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/70 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal block">
              Available Dynamic Variables
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {availableVariables.map((v) => (
                <div key={v.tag} className="flex items-start gap-1.5">
                  <code className="text-[10px] bg-white border border-brand-border px-1.5 py-0.5 rounded text-brand-primary font-mono shrink-0">
                    {v.tag}
                  </code>
                  <span className="text-zinc-500">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-brand-border/60 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-zinc-500 hover:text-brand-charcoal flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to default
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-brand-border bg-white text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Templates"
              )}
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
