"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, MessageCircle, X, Sparkles, Clock, ArrowRight } from "lucide-react";

export function FloatingContactButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const whatsappUrl =
    "https://wa.me/8801353655433?text=Hello%20Adorn%20by%20Mashfika%2C%20I%20have%20an%20inquiry.";
  const phoneUrl = "tel:+8801353655433";

  // Close when clicking outside the widget
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      ref={widgetRef}
      aria-label="Floating Concierge and Support Contacts"
      className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-50 flex flex-col items-end"
    >
      {/* Expandable Luxury Popup Card */}
      {isOpen && (
        <div className="mb-3 w-[290px] sm:w-[320px] bg-white rounded-3xl border border-[#EAE3DE] shadow-2xl overflow-hidden text-[#240610] animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="bg-[#FAF7F5] p-4 border-b border-[#EAE3DE] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4A1525] text-[#D4A373] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-[#D4A373] animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#240610] tracking-wide leading-tight">
                  Boutique Concierge
                </h3>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Available Now
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white hover:bg-zinc-100 border border-[#EAE3DE] text-zinc-500 hover:text-[#4A1525] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close concierge card"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Welcome to <strong className="font-medium text-[#4A1525]">Adorn by Mashfika</strong>. How may our styling and jewelry concierge assist you today?
            </p>

            {/* WhatsApp Action Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white p-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md shadow-[#25D366]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 fill-current text-white" />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">Chat on WhatsApp</span>
                  <span className="text-[10px] font-normal text-white/80">Instant reply & inquiries</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Direct Phone Call Action Button */}
            <a
              href={phoneUrl}
              className="w-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] border border-[#D4A373]/30 p-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md shadow-[#4A1525]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D4A373]/20 flex items-center justify-center flex-shrink-0 text-[#D4A373]">
                  <Phone className="w-4 h-4 text-[#D4A373]" />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">Call Concierge</span>
                  <span className="text-[10px] font-normal text-[#F3E5D8]/75">+880 1353655433</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D4A373] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Support Timing Note */}
          <div className="px-4 py-2.5 bg-[#FAF7F5] border-t border-[#EAE3DE] flex items-center justify-center gap-1.5 text-[11px] text-[#7A6268] font-light">
            <Clock className="w-3.5 h-3.5 text-[#D4A373] flex-shrink-0" />
            <span>Available Daily • 10:00 AM - 11:00 PM</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close boutique concierge" : "Open boutique concierge"}
        aria-expanded={isOpen}
        className="w-[52px] h-[52px] rounded-full bg-[#4A1525] text-[#D4A373] border border-[#D4A373]/40 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative group"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#D4A373] transition-transform duration-200 rotate-90" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-[#D4A373] transition-transform group-hover:scale-110" />
            {/* Ambient online badge */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#240610] rounded-full shadow-xs" />
          </>
        )}

        {/* Hover Tooltip when closed on desktop */}
        {!isOpen && (
          <span className="hidden md:block pointer-events-none absolute right-16 bg-[#240610] text-[#F3E5D8] border border-[#D4A373]/30 text-[11px] font-medium px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
            Boutique Concierge
          </span>
        )}
      </button>
    </aside>
  );
}
