import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Gem,
  Hammer,
  Truck,
  Heart,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Adorn by Mashfika",
  description:
    "Adorn by Mashfika is a boutique celebration of elegance, craftsmanship, and timeless grace. Discover our story, artisan lookbook, and curated statement pieces.",
  openGraph: {
    title: "About Us | Adorn by Mashfika",
    description:
      "A boutique celebration of elegance, craftsmanship, and timeless grace. Curating statement jewelry and bespoke accessories in Bangladesh.",
  },
};

export default function AboutPage() {
  const whoWeAreCards = [
    {
      icon: Gem,
      title: "Curators of Fine Detail",
      description:
        "Handpicked materials, skin-friendly hypoallergenic alloys, anti-tarnish micro-finishes, and lustrous cultured pearls curated with uncompromising aesthetic standards.",
      tag: "Flawless Standards",
    },
    {
      icon: Hammer,
      title: "Artisan First",
      description:
        "Collaborating closely with dedicated South Asian jewel smiths and artisans to preserve authentic, timeless artistry across every stone setting and carving.",
      tag: "Authentic Craftsmanship",
    },
    {
      icon: Truck,
      title: "Dedicated to You",
      description:
        "Swift nationwide doorstep delivery across all 64 districts in Bangladesh, accompanied by our signature preservation gift boxes and attentive customer concierge.",
      tag: "Nationwide Care",
    },
  ];

  const lookbookImages = [
    {
      src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      caption: "Heritage Kundan Choker",
      subcaption: "Hand-set emerald stones & pearl cluster drops",
    },
    {
      src: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      caption: "Rose-Quartz Bell Jhumkas",
      subcaption: "Lightweight 22K rose-gold plated bridal tassels",
    },
    {
      src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      caption: "Velvet Zardozi Potli Clutch",
      subcaption: "Intricate metallic embroidery & pearl handles",
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* 1. Clean Header & 2-Line Introduction */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F7] via-[#FAF8F5] to-[#FAF8F5] py-20 lg:py-28 border-b border-brand-border/40">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-1/3 w-96 h-96 bg-brand-blush rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-champagne-light rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blush border border-brand-primary/20 text-brand-primary text-xs tracking-widest uppercase font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            About Adorn by Mashfika
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brand-charcoal font-normal leading-[1.25] tracking-tight">
            Adorn by Mashfika is a boutique celebration of elegance, craftsmanship, and timeless grace.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 font-serif italic max-w-2xl mx-auto leading-relaxed text-brand-primary/90">
            "We curate statement jewelry and bespoke accessories designed to make every moment feel extraordinary."
          </p>
        </div>
      </section>

      {/* 2. "Our Story" Section */}
      <section className="py-20 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-brand-border/80 p-8 sm:p-12 lg:p-14 shadow-2xs space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-brand-primary">
            <span className="w-6 h-[1.5px] bg-brand-primary inline-block" />
            Our Story
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl text-brand-charcoal leading-tight">
            A Journey of Passion, Heritage & Modern Poise
          </h2>

          <div className="space-y-5 text-zinc-600 text-sm sm:text-base leading-relaxed font-light">
            <p>
              Adorn by Mashfika began not simply as an e-commerce brand, but as an intimate creative pursuit born from a genuine adoration for traditional South Asian jewelry and modern feminine aesthetics. Founded by <strong className="font-medium text-brand-charcoal">Mashfika Rahman</strong> in Dhaka, the boutique was envisioned to bring women pieces that evoke royal splendor without feeling cumbersome or fleeting.
            </p>
            <p>
              Growing up captivated by the intricate majesty of classical Mughal Kundan, heirloom Polki motifs, and luminous cultured pearls, Mashfika saw an opportunity to celebrate these centuries-old craft traditions in versatile, contemporary silhouettes. Whether it is an ethereal floral jhumka for an intimate family evening or an opulent royal choker for your grand bridal celebration, each curation embodies delicate poise and effortless confidence.
            </p>
            <p>
              Every collection we unveil is hand-selected with rigorous scrutiny for skin-friendly hypoallergenic plating, lightweight comfort, and enduring luster — so you can cherish and wear your favorite creations through years of memorable celebrations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Visual Boutique Lookbook Grid (Photo Showcase) */}
      <section className="py-16 bg-[#FAF7F2] border-y border-brand-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
              Visual Boutique Lookbook
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal">
              Textures of Elegance
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-light">
              A glimpse into the intricate artistry, fine stone settings, and artisanal finishes that define our creations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {lookbookImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden border border-brand-primary/20 bg-white shadow-xs transition-all duration-500 hover:shadow-xl hover:border-brand-primary/50"
              >
                <div className="aspect-4/5 overflow-hidden relative">
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-1">
                    <span className="text-[10px] uppercase font-semibold tracking-widest text-brand-champagne-light">
                      Curated Lookbook #{idx + 1}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-normal leading-snug">
                      {img.caption}
                    </h3>
                    <p className="text-xs text-zinc-200 font-light line-clamp-2">
                      {img.subcaption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "Who We Are?" Section */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
            Our Foundation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal">
            Who We Are
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light">
            Guided by three pillars that define every collection we curate and every customer we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {whoWeAreCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-brand-border/80 p-8 bg-white hover:border-brand-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blush text-brand-primary flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 transition-all shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary block mb-1">
                      {card.tag}
                    </span>
                    <h3 className="font-serif text-xl text-brand-charcoal font-medium">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/50 flex items-center gap-2 text-xs text-brand-primary font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>The Adorn Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Subtle Call to Action */}
      <section className="py-20 bg-gradient-to-t from-[#FFF0F3] via-[#FAF8F5] to-[#FAF8F5] border-t border-brand-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-brand-blush text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
            <Heart className="w-5 h-5 fill-brand-primary/20 text-brand-primary" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal tracking-tight">
            Discover the pieces that speak to you.
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto font-light leading-relaxed">
            From regal bridal chokers and artisan jhumkas to velvet potli bags, explore our complete boutique collection curated for timeless feminine elegance.
          </p>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-primary text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Our Creations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
