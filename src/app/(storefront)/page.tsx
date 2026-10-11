import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatters";

// Curated preview items
const FEATURED_HIGHLIGHTS = [
  {
    id: "1",
    title: "Kundan Royal Choker Set",
    category: "Bridal & Festive Jewelry",
    price: 4850,
    badge: "Bestseller",
    gradient: "from-[#F7E7CE] to-[#F3D1DC]",
  },
  {
    id: "2",
    title: "Handcrafted Rose-Quartz Jhumkas",
    category: "Statement Earrings",
    price: 2450,
    badge: "Handcrafted",
    gradient: "from-[#FADADD] to-[#F4C2C2]",
  },
  {
    id: "3",
    title: "Embroidered Velvet Potli Clutch",
    category: "Luxury Accessories",
    price: 3200,
    badge: "Limited Edition",
    gradient: "from-[#EDE6D6] to-[#E3CBB3]",
  },
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F7] via-[#FAF8F5] to-[#FAF8F5] py-20 lg:py-32 border-b border-brand-border/40">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-blush rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-brand-champagne-light rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blush border border-brand-primary/20 text-brand-primary text-xs tracking-wider uppercase font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-champagne" />
            Autumn Festive Collection 2026
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-brand-charcoal tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Elegance in <span className="italic font-serif text-brand-primary">Every Detail</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-600 max-w-2xl mx-auto font-sans font-light leading-relaxed">
            Discover exquisite handcrafted jewelry, artisanal accessories, and bespoke contemporary fashion designed for modern elegance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?category=jewelry"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white border border-brand-border text-brand-charcoal font-medium text-sm hover:border-brand-primary/60 hover:text-brand-primary transition-all duration-200 shadow-sm"
            >
              Explore Jewelry
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Value Props */}
      <section className="py-12 bg-white border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Swift Nationwide Shipping</h4>
                <p className="text-xs text-zinc-500 mt-0.5">24-48 hrs in Dhaka, 3-5 days across all districts</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Artisanal Quality Guaranteed</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Premium materials, anti-tarnish polishing</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start p-4 rounded-xl hover:bg-brand-blush-subtle transition-colors">
              <div className="w-12 h-12 rounded-full bg-brand-blush flex items-center justify-center text-brand-primary flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-medium text-brand-charcoal text-sm">Cash on Delivery & bKash</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Convenient payment methods at your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary block mb-2">
              Curated by Mashfika
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal">
              Featured Highlights
            </h2>
          </div>
          <Link
            href="/shop"
            className="mt-4 sm:mt-0 text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 group"
          >
            View all creations
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_HIGHLIGHTS.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-brand-border/80 card-hover flex flex-col"
            >
              <div className={`h-64 sm:h-72 w-full bg-gradient-to-tr ${item.gradient} relative flex items-center justify-center p-6`}>
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-charcoal text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
                <span className="font-serif text-zinc-600/60 italic text-lg select-none text-center">
                  [ {item.title} ]
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[11px] uppercase tracking-wider text-brand-muted font-medium mb-1">
                  {item.category}
                </span>
                <h3 className="font-serif text-lg text-brand-charcoal group-hover:text-brand-primary transition-colors mb-3">
                  {item.title}
                </h3>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-border/40">
                  <span className="font-semibold text-brand-charcoal text-base">
                    {formatPrice(item.price)}
                  </span>
                  <Link
                    href={`/shop`}
                    className="text-xs font-medium text-brand-primary bg-brand-blush hover:bg-brand-primary hover:text-white px-3.5 py-1.5 rounded-full transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
