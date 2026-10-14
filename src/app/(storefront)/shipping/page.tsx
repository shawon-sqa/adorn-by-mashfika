import { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Clock,
  ShieldCheck,
  Package,
  MapPin,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Phone,
  MessageCircle,
  ArrowRight,
  Gift,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Delivery & Shipping Guide | Adorn by Mashfika Luxury Boutique",
  description:
    "Fast, secure, and insured doorstep delivery across Dhaka and all 64 districts of Bangladesh. Learn about delivery timelines, rates, and luxury velvet packaging.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F5] py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#4A1525] text-xs font-serif uppercase tracking-[0.2em] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            Fast & Insured Nationwide Dispatch
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#240610] tracking-tight">
            Delivery & Shipping Information
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto font-light leading-relaxed">
            Every handcrafted piece is packed with meticulous care from our Dhaka boutique and dispatched via trusted express couriers to your doorstep across all 64 districts.
          </p>
        </div>

        {/* Free Shipping Highlight Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A1525] via-[#3B0E1B] to-[#240610] text-[#FAF7F5] p-6 sm:p-8 border border-[#D4A373]/30 shadow-xl shadow-[#4A1525]/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-block text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                ✦ Boutique Complimentary Offer
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
                Free Delivery Across Dhaka on Orders Above ৳ 2,500
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl font-light">
                Shop your favorite statement chokers, jhumkas, and pret wear. Complimentary delivery is automatically applied at checkout for qualifying baskets.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#D4A373] hover:bg-[#C59262] text-[#240610] font-medium text-xs font-serif tracking-wider uppercase shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Section 1: Nationwide Coverage Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                Nationwide Coverage & Delivery Rates
              </h2>
              <p className="text-xs text-zinc-500">
                Transparent flat-rate shipping for both metropolitan Dhaka and outer districts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dhaka Metro Card */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm hover:border-[#D4A373] transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                  Zone 1: Metro Dhaka
                </span>
                <span className="font-mono text-2xl font-bold text-[#4A1525]">৳ 70</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#240610] mb-2">
                Inside Dhaka Metro Express
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed mb-6">
                Direct courier dispatch across Gulshan, Banani, Dhanmondi, Uttara, Mirpur, Old Dhaka, and all metropolitan areas.
              </p>
              <div className="space-y-2.5 pt-4 border-t border-[#EAE3DE] text-xs text-[#240610]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4A373]" />
                  <span>
                    Estimated Time: <strong>24 to 48 Hours</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Free delivery threshold: <strong>Orders above ৳ 2,500</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#4A1525]" />
                  <span>Cash on Delivery (COD) & bKash Accepted</span>
                </div>
              </div>
            </div>

            {/* Outside Dhaka Card */}
            <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-8 shadow-sm hover:border-[#D4A373] transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-[#D4A373] font-serif font-semibold">
                  Zone 2: All 64 Districts
                </span>
                <span className="font-mono text-2xl font-bold text-[#4A1525]">৳ 130</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#240610] mb-2">
                Outside Dhaka & Divisional Hubs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed mb-6">
                Doorstep delivery to Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, and all surrounding upazilas.
              </p>
              <div className="space-y-2.5 pt-4 border-t border-[#EAE3DE] text-xs text-[#240610]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4A373]" />
                  <span>
                    Estimated Time: <strong>3 to 5 Business Days</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fully insured against damage or transit loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#4A1525]" />
                  <span>Cash on Delivery (COD) supported nationwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trusted Logistics Partners */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                Trusted Logistics Partners
              </h2>
              <p className="text-xs text-zinc-500">
                We collaborate with Bangladesh’s leading courier networks equipped with live SMS and tracking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-[#EAE3DE] p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#EAE3DE] mx-auto flex items-center justify-center text-[#4A1525] font-serif font-bold text-sm">
                SF
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Steadfast Courier</h4>
              <p className="text-xs text-zinc-500 font-light">
                Our primary nationwide partner offering live SMS alerts and door-to-door handoff.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE3DE] p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#EAE3DE] mx-auto flex items-center justify-center text-[#4A1525] font-serif font-bold text-sm">
                PT
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Pathao Express</h4>
              <p className="text-xs text-zinc-500 font-light">
                Ultra-fast intra-city dispatches across Dhaka metro with rider contact verification.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE3DE] p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#EAE3DE] mx-auto flex items-center justify-center text-[#4A1525] font-serif font-bold text-sm">
                RX
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">RedX Delivery</h4>
              <p className="text-xs text-zinc-500 font-light">
                Extensive coverage for suburban regions, zila headquarters, and coastal hubs.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE3DE] p-5 shadow-sm text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#EAE3DE] mx-auto flex items-center justify-center text-[#4A1525] font-serif font-bold text-sm">
                PF
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Paperfly Logistics</h4>
              <p className="text-xs text-zinc-500 font-light">
                Dedicated doorstep reach into remote thanas and upazila union councils.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Luxury Velvet Packaging */}
        <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                Luxury Velvet Packaging
              </h2>
              <p className="text-xs text-zinc-500">
                Because unboxing jewelry should feel like an heirloom gift.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#D4A373]/20 text-[#4A1525] flex items-center justify-center text-xs font-serif font-bold">
                1
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Crushed Velvet Pouches</h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                Each choker, ring, and earring set is enclosed in our soft boutique velvet pouch to protect precious polki, pearls, and gold-plated luster from oxidation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#D4A373]/20 text-[#4A1525] flex items-center justify-center text-xs font-serif font-bold">
                2
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Hard-Box Structural Casing</h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                Reinforced high-density boutique boxes safeguard stones from pressure shocks, ensuring jhumkas and intricate bridal pieces arrive in pristine showroom condition.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#D4A373]/20 text-[#4A1525] flex items-center justify-center text-xs font-serif font-bold">
                3
              </div>
              <h4 className="font-serif text-sm font-bold text-[#240610]">Tamper-Proof Security Seal</h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                Parcels are wrapped in double-layer shockproof air bubble wrap and secured with an official branded security seal before dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Delivery Instructions & COD */}
        <div className="bg-white rounded-3xl border border-[#EAE3DE] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A1525]/10 text-[#4A1525] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#240610] font-bold">
                Doorstep Verification & COD Protocol
              </h2>
              <p className="text-xs text-zinc-500">
                Guaranteed peace of mind for every recipient.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2.5">
              <h4 className="font-serif text-sm font-bold text-[#240610] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Doorstep Parcel Verification
              </h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                You are warmly welcomed to inspect the exterior condition and tamper-evident seal of the package in front of the courier delivery rider prior to handing over Cash on Delivery.
              </p>
              <div className="text-[11px] text-zinc-500 pt-1">
                * If a package appears tampered or crushed in transit, please take a photo and refuse acceptance immediately.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EAE3DE]/80 space-y-2.5">
              <h4 className="font-serif text-sm font-bold text-[#240610] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#4A1525]" />
                Cash on Delivery (COD) Guidelines
              </h4>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">
                For Cash on Delivery orders, we kindly request having the exact invoice total ready in cash. Many riders also accept rider-to-merchant bKash transfers upon delivery for your convenience.
              </p>
              <div className="text-[11px] text-zinc-500 pt-1">
                * Couriers attempt delivery up to 3 times with phone notifications before returning the parcel.
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Direct Action Links & Support Stack */}
        <div className="bg-[#FAF7F5] border border-[#EAE3DE] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl font-bold text-[#240610]">
              Already placed an order with us?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 font-light">
              Track your parcel status live or get in touch with our boutique concierge.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A1525] hover:bg-[#3B0E1B] text-[#F3E5D8] font-medium text-xs font-serif tracking-wider uppercase shadow-md transition-all cursor-pointer"
            >
              Track Your Order
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/8801353655433?text=Hello%20Adorn%20by%20Mashfika%2C%20I%20have%20a%20delivery%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FAF7F5] text-[#240610] border border-[#EAE3DE] text-xs font-medium tracking-wider transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp Concierge
            </a>
            <Link
              href="/returns"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs text-zinc-600 hover:text-[#4A1525] underline transition-colors"
            >
              View Exchange Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
