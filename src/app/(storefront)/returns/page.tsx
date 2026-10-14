import { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  ArrowRight,
  HelpCircle,
  FileText,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Adorn by Mashfika Luxury Boutique",
  description:
    "Our 48-Hour Exchange Guarantee ensures peace of mind. Learn how to request an exchange for handcrafted jewelry, sizing adjustments, or transit defects.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-serif uppercase tracking-[0.2em] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            Hassle-Free Boutique Guarantee
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#240610] tracking-tight">
            Returns & Exchange Policy
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-light leading-relaxed">
            We take immense pride in the craftsmanship of every piece. If an item arrives damaged in transit or doesn’t fit your occasion, our concierge is here to make it right.
          </p>
        </div>

        {/* 48-Hour Guarantee Highlight Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A1525] via-[#3B0E1B] to-[#240610] text-[#FAF7F5] p-6 sm:p-8 border border-[#D4A373]/30 shadow-xl shadow-[#4A1525]/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-block text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                ✦ Client Protection Promise
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
                Our 48-Hour Easy Exchange Guarantee
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl font-light">
                Report transit damages, missing stones, incorrect sizes, or defects within 48 hours of parcel delivery for a seamless replacement or store credit.
              </p>
            </div>
            <a
              href="https://wa.me/8801353655433?text=Hello%20Adorn%20by%20Mashfika%2C%20I%20would%20like%20to%20request%20an%20exchange."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#D4A373] hover:bg-[#C59262] text-[#240610] font-medium text-xs font-serif tracking-wider uppercase shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Request Exchange
            </a>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Section 1: How to Request an Exchange (3 Simple Steps) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                How to Request an Exchange in 3 Simple Steps
              </h2>
              <p className="text-xs text-zinc-500">
                A streamlined, effortless process handled directly by our boutique care team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm hover:border-[#D4A373] transition-all relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A1525] text-[#D4A373] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-[#240610]">
                Contact WhatsApp Concierge
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                Send a message to our official concierge line at <strong>01353655433</strong> with your Order Reference ID (e.g. #ADM-928412).
              </p>
              <div className="text-[11px] text-[#4A1525] font-medium">
                ✓ Available 7 days a week (10 AM - 11 PM)
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm hover:border-[#D4A373] transition-all relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A1525] text-[#D4A373] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-[#240610]">
                Share Unboxing Photo / Video
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                Share a quick photo or video highlighting the transit defect, broken lock, or sizing issue within 48 hours of receiving the parcel.
              </p>
              <div className="text-[11px] text-zinc-500">
                * Please include the parcel label if possible
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm hover:border-[#D4A373] transition-all relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4A1525] text-[#D4A373] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-[#240610]">
                Doorstep Reverse Pickup & Swap
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                Our courier will coordinate a doorstep reverse pickup and deliver your fresh replacement piece safely without you needing to travel.
              </p>
              <div className="text-[11px] text-emerald-700 font-medium">
                ✓ Free pickup for verified transit defects
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Conditions for Exchange & Hygiene Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conditions Card */}
          <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#240610]">
                Conditions for Exchange
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Items must be completely <strong>unworn, unaltered, and unused</strong> in original showroom state.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Must be enclosed with original crushed-velvet pouches, hard-box casing, and boutique tags intact.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Exchange requests must be submitted within <strong>48 hours</strong> of courier delivery confirmation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Custom bespoke bridal orders or personalized size engravings are non-exchangeable unless defective.
                </span>
              </li>
            </ul>
          </div>

          {/* Hygiene Policy Card */}
          <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#240610]">
                Earrings & Hygiene Policy
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
              To safeguard the health and hygiene standards of all our patrons, we observe strict hygiene protocols for intimate bodily jewelry:
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE] space-y-2 text-xs text-[#240610]">
              <div className="font-semibold text-[#4A1525]">Pierced Jewelry & Earring Posts:</div>
              <p className="text-zinc-600 font-light leading-relaxed">
                Pierced earrings (jhumkas, studs, drops, ear cuffs) cannot be returned once the protective tamper-evident seal is broken, unless there is a verifiable manufacturing or transit defect present upon delivery.
              </p>
            </div>

            <div className="text-[11px] text-zinc-500 font-light">
              This policy ensures that every piece you receive from Adorn by Mashfika is 100% brand new, unworn, and clinically pristine.
            </div>
          </div>
        </div>

        {/* Section 3: Refunds & Settlement */}
        <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                Refunds & Settlement Protocol
              </h2>
              <p className="text-xs text-zinc-500">
                What happens if an exchanged item is out of stock in our studio?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                Option 1: Preferred
              </span>
              <h4 className="font-serif text-base font-bold text-[#240610]">
                Instant Boutique Store Credit
              </h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                Receive an immediate digital voucher code equal to 100% of your paid amount. Valid for 12 months with no minimum spend restriction across all jewelry and fashion collections.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                Option 2: Direct Refund
              </span>
              <h4 className="font-serif text-base font-bold text-[#240610]">
                bKash, Nagad, or Bank Transfer
              </h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                If a replacement cannot be provided, we issue a prompt monetary refund directly to your original bKash wallet, Nagad number, or Bangladeshi bank account within 3 to 5 business days following return inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Concierge Support & Quick Links */}
        <div className="bg-[#FAF7F5] border border-[#EAE3DE] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl font-bold text-[#240610]">
              Need assistance with an active exchange?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 font-light">
              Our concierge team is standing by to assist with your order reference.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/8801353655433?text=Hello%20Adorn%20by%20Mashfika%2C%20I%20have%20an%20exchange%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] font-medium text-xs font-serif tracking-wider uppercase shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
              Chat on WhatsApp
            </a>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FAF7F5] text-[#240610] border border-[#EAE3DE] text-xs font-medium tracking-wider transition-all"
            >
              Track Order Status
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs text-zinc-600 hover:text-[#4A1525] underline transition-colors"
            >
              Read FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
