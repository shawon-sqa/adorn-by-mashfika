"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "01",
    title: "The Royal Emerald & Gold Suite",
    subtitle: "Handcrafted Heritage Collection",
    tag: "Festive Collection 2026",
    image: "/images/hero-1.jpg",
  },
  {
    id: "02",
    title: "Bridal Diamond & Pearl Couture",
    subtitle: "Bespoke Artisanal Radiance",
    tag: "Bridal Edition 2026",
    image: "/images/hero-2.jpg",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-advance slides every 6 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  const handleShopNowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      e.preventDefault();
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#240610] text-white selection:bg-[#D4A373] selection:text-[#240610]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Adorn by Mashfika Luxury Showcase"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#D4A373]/15 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[480px] h-[480px] rounded-full bg-[#B76E79]/20 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] rounded-full bg-[#D4A373]/10 blur-[100px] pointer-events-none" />

      {/* Subtle boutique background pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #D4A373 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Mobile background banner with dark gradient overlay for crystal-clear readability */}
      <div className="absolute inset-0 lg:hidden pointer-events-none z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={`mobile-${slide.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.25] scale-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A1525]/92 via-[#3B0E1B]/95 to-[#240610]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto min-h-[580px] sm:min-h-[620px] lg:min-h-[680px] xl:min-h-[720px] flex flex-col lg:flex-row items-stretch">
        {/* ========================================================= */}
        {/* LEFT CONTAINER (60% on desktop)                          */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[58%] xl:w-[60%] flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-24 py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#4A1525] via-[#3B0E1B] to-[#240610] lg:bg-transparent relative z-20">
          {/* Top & Middle Content Group */}
          <div className="space-y-6 sm:space-y-8 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
            {/* Small Subheading Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 backdrop-blur-md shadow-xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="text-[#D4A373] text-[11px] sm:text-xs font-serif uppercase tracking-[0.22em] font-medium">
                ✦ 100% Curated Boutique Pieces
              </span>
            </div>

            {/* Main Title: High-end Playfair/Serif typography with italic accent */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-[#FAF8F5] tracking-tight leading-[1.08] sm:leading-[1.1]">
              Elegance and <br />
              style you can <br className="hidden sm:inline" />
              <span className="italic font-serif text-[#D4A373] font-light">trust</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[#F5E6D3]/85 font-sans font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover bespoke handcrafted jewelry, artisanal accessories, and contemporary boutique
              fashion designed for modern grace.
            </p>

            {/* CTA Button Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5">
              {/* Primary Button: Warm champagne gold pill button */}
              <Link
                href="#products"
                onClick={handleShopNowClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#D4A373] text-[#240610] font-semibold hover:bg-[#C59262] px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-lg shadow-[#D4A373]/25 hover:shadow-xl hover:shadow-[#D4A373]/35 transform hover:-translate-y-0.5 group active:scale-[0.98]"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button: Elegant outline glass pill button */}
              <Link
                href="/new-arrivals"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 rounded-full border border-white/30 text-white text-xs sm:text-sm font-medium tracking-widest uppercase hover:bg-white/10 hover:border-white/50 backdrop-blur-xs transition-all duration-300 active:scale-[0.98]"
              >
                NEW ARRIVALS
              </Link>
            </div>
          </div>

          {/* Trust Badges Strip at bottom */}
          <div className="pt-8 lg:pt-12 mt-8 lg:mt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm font-serif italic text-[#D4A373]">
              <div className="flex items-center gap-2">
                <span className="not-italic text-[11px] text-[#D4A373]">✦</span>
                <span className="tracking-wide">Delivery all over Bangladesh</span>
              </div>
              <span className="hidden sm:inline text-white/20 not-italic">•</span>
              <div className="flex items-center gap-2">
                <span className="not-italic text-[11px] text-[#D4A373]">✦</span>
                <span className="tracking-wide">Cash on Delivery</span>
              </div>
              <span className="hidden sm:inline text-white/20 not-italic">•</span>
              <div className="flex items-center gap-2">
                <span className="not-italic text-[11px] text-[#D4A373]">✦</span>
                <span className="tracking-wide">Premium Gift Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CONTAINER (40% on desktop) with diagonal clip-path   */}
        {/* ========================================================= */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[46%] xl:w-[44%] z-10 overflow-hidden">
          {/* Diagonal Clip Path wrapper: 12% at top, 0% at bottom */}
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
          >
            {/* Jewelry Images with smooth cross-fade */}
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentSlide === idx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.03]"
                />
              </div>
            ))}

            {/* Luxury Vignettes & Atmospheric Lighting */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#240610]/60 via-transparent to-[#240610]/40 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#240610]/80 via-transparent to-transparent pointer-events-none z-10" />

            {/* Floating Boutique Glass Tag (bottom-left of right image) */}
            <div className="absolute bottom-10 left-[18%] z-20 hidden xl:block max-w-xs p-4 rounded-2xl bg-[#240610]/75 backdrop-blur-md border border-[#D4A373]/30 shadow-2xl transition-transform duration-500 hover:scale-105">
              <span className="text-[10px] uppercase font-serif tracking-widest text-[#D4A373] block mb-1">
                ✦ {HERO_SLIDES[currentSlide].tag}
              </span>
              <p className="font-serif text-sm text-white font-medium leading-snug">
                {HERO_SLIDES[currentSlide].title}
              </p>
              <p className="text-[11px] text-[#F5E6D3]/70 font-light mt-0.5">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
            </div>
          </div>

          {/* Golden Diagonal Boundary Accent Line */}
          <svg
            className="absolute inset-y-0 left-0 w-full h-full pointer-events-none z-30"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="goldDiagonalGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A373" stopOpacity="0" />
                <stop offset="25%" stopColor="#D4A373" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FAF8F5" stopOpacity="1" />
                <stop offset="75%" stopColor="#D4A373" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line
              x1="12"
              y1="0"
              x2="0"
              y2="100"
              stroke="url(#goldDiagonalGlow)"
              strokeWidth="0.8"
              filter="url(#goldGlow)"
            />
          </svg>

          {/* Ultra-Modern Boutique Slide Indicators on the Right Edge */}
          <aside
            aria-label="Hero slide controls"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 bg-[#240610]/70 backdrop-blur-md border border-[#D4A373]/25 rounded-full py-4 px-2 shadow-2xl"
          >
            {/* Prev button */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="text-white/60 hover:text-[#D4A373] transition-colors p-1"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Active Slide Number */}
            <span className="font-serif text-[#D4A373] text-xs font-semibold tracking-wider">
              0{currentSlide + 1}
            </span>

            {/* Pagination Line Indicators */}
            <div className="flex flex-col gap-1.5 my-1" role="tablist">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  role="tab"
                  aria-selected={currentSlide === idx}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx
                      ? "h-6 bg-[#D4A373] shadow-[0_0_8px_rgba(212,163,115,0.8)]"
                      : "h-2 bg-white/30 hover:bg-white/60"
                    }`}
                />
              ))}
            </div>

            {/* Total Slides */}
            <span className="font-serif text-white/40 text-[10px] tracking-wider">
              0{HERO_SLIDES.length}
            </span>

            {/* Next button */}
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="text-white/60 hover:text-[#D4A373] transition-colors p-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </aside>
        </div>
      </div>

      {/* Mobile Slide Pagination Dots (visible on mobile only) */}
      <div className="lg:hidden flex items-center justify-center gap-2 pb-6 relative z-20">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${currentSlide === idx
                ? "w-6 h-1.5 bg-[#D4A373] shadow-[0_0_8px_rgba(212,163,115,0.7)]"
                : "w-2 h-1.5 bg-white/40"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
