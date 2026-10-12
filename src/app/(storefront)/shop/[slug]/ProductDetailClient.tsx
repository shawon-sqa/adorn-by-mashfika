"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  Check,
  Plus,
  Minus,
  ZoomIn,
  Star,
  MessageSquare,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Product, ColorVariant, ProductReview } from "@/lib/types/product";
import { formatPrice } from "@/lib/utils/formatters";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { ProductCard } from "@/components/storefront/ProductCard";
import { StarRating } from "@/components/storefront/StarRating";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    author: "Zareen Fatima",
    rating: 5,
    date: "3 days ago",
    comment:
      "Stunning craftsmanship! The gold polish looks regal and feels so luxurious. Arrived in beautiful boutique packaging.",
  },
  {
    id: "rev-2",
    author: "Anika Tabassum",
    rating: 5,
    date: "1 week ago",
    comment:
      "Wore this to a wedding reception and received endless compliments. Lightweight and comfortable all evening.",
  },
  {
    id: "rev-3",
    author: "Mehnaz Chowdhury",
    rating: 4.8,
    date: "2 weeks ago",
    comment:
      "Exactly as pictured! Fast delivery in Gulshan within 24 hours. Will definitely purchase again.",
  },
];

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  // Color Variants handling
  const variants: ColorVariant[] =
    product.colorVariants && product.colorVariants.length > 0
      ? product.colorVariants
      : product.colors.map((c) => ({ name: c, inStock: true }));

  const initialVariant = variants.find((v) => v.inStock)?.name || variants[0]?.name || "Standard";

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(initialVariant);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reviews state with localStorage persistence
  const [reviews, setReviews] = useState<ProductReview[]>(DEFAULT_REVIEWS);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Gallery Active Image & Navigation
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Interactive Hover Zoom Lens State
  const [isHovered, setIsHovered] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  const { addItem, openCart } = useCartStore();
  const { isFavorite, toggleFavorite } = useWishlistStore();
  const favorited = isFavorite(product.id);

  const imagesList = product.images && product.images.length > 0 ? product.images : [];
  const totalImages = imagesList.length;

  const currentSelectedVariant = variants.find((v) => v.name === selectedColor);
  const isVariantOutOfStock = currentSelectedVariant ? !currentSelectedVariant.inStock : false;
  const isOverallProductSoldOut = !product.inStock || (product.stockCount !== undefined && product.stockCount <= 0);
  const isSelectedOutOfStock = isOverallProductSoldOut || isVariantOutOfStock;

  const availableStock = product.stockCount ?? (product.inStock ? 99 : 0);

  // Load reviews from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`adorn_reviews_${product.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else if (product.reviews && product.reviews.length > 0) {
        setReviews(product.reviews);
      }
    } catch {
      // Ignore
    }
  }, [product.id, product.reviews]);

  // Dynamically compute aggregate rating and review count
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
      : product.rating || 5.0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Next and Prev handlers
  const handlePrevImage = () => {
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (totalImages <= 1) return;
    setActiveImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalImages <= 1) return;
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalImages]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const handleAddToCart = () => {
    if (isSelectedOutOfStock) {
      showToast("Sorry, this creation is currently sold out.");
      return;
    }

    const res = addItem(product, quantity, selectedColor);
    if (!res.success) {
      showToast(res.message || "Sorry, this creation is currently sold out.");
      return;
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (isSelectedOutOfStock) {
      showToast("Sorry, this creation is currently sold out.");
      return;
    }

    const res = addItem(product, quantity, selectedColor);
    if (!res.success) {
      showToast(res.message || "Sorry, this creation is currently sold out.");
      return;
    }

    openCart();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim() || "Verified Buyer",
      rating: reviewRating,
      date: "Just now",
      comment: reviewComment.trim(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`adorn_reviews_${product.id}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setReviewAuthor("");
    setReviewComment("");
    setReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const activeImageUrl = imagesList[activeImageIndex] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[80] bg-brand-charcoal text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-rose-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-brand-muted mb-8">
        <Link href="/" className="hover:text-brand-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/shop" className="hover:text-brand-primary transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link
          href={`/shop?category=${product.category}`}
          className="capitalize hover:text-brand-primary transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-brand-charcoal font-medium truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Gallery / Showcase */}
        <div className="space-y-4">
          {/* Main Active Image Showcase with Smooth Hover Zoom and Carousel Controls */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            className={`group/mainImage w-full aspect-square rounded-3xl bg-gradient-to-tr ${product.gradient} border border-brand-border/80 flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${
              activeImageUrl ? "cursor-zoom-in" : ""
            }`}
          >
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={product.title}
                style={{
                  transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  transform: isHovered ? "scale(2.2)" : "scale(1)",
                  transition: isHovered
                    ? "transform 0.08s ease-out"
                    : "transform 0.3s ease-in-out",
                }}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-300 ${
                  isOverallProductSoldOut ? "opacity-75 grayscale-25" : ""
                }`}
              />
            ) : (
              <div className="text-center space-y-2 p-6 max-w-sm pointer-events-none">
                <Sparkles className="w-6 h-6 text-brand-champagne mx-auto animate-pulse" />
                <h2 className="font-serif text-2xl sm:text-3xl text-zinc-800 italic">
                  {product.title}
                </h2>
                <p className="text-xs text-zinc-600 uppercase tracking-widest">
                  Artisanal Boutique Craft
                </p>
              </div>
            )}

            {/* Badges: Sold Out, Discount Percentage, or Promo Badge */}
            {isOverallProductSoldOut ? (
              <span className="absolute top-5 left-5 bg-rose-600/95 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md z-10 pointer-events-none flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" />
                Sold Out
              </span>
            ) : product.originalPrice && product.originalPrice > product.price ? (
              <span className="absolute top-5 left-5 bg-gradient-to-r from-rose-500 to-[#C59B9B] text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none border border-rose-300/40">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            ) : product.badge ? (
              <span className="absolute top-5 left-5 bg-white/95 backdrop-blur-xs text-brand-charcoal text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs z-10 pointer-events-none">
                {product.badge}
              </span>
            ) : null}

            {/* Carousel Navigation Arrows (< and >) */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-brand-charcoal hover:text-brand-primary transition-all duration-200 shadow-md z-20 cursor-pointer active:scale-90 hover:scale-105 opacity-90 group-hover/mainImage:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 hover:bg-white text-brand-charcoal hover:text-brand-primary transition-all duration-200 shadow-md z-20 cursor-pointer active:scale-90 hover:scale-105 opacity-90 group-hover/mainImage:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter indicator */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium tracking-wider z-10 pointer-events-none">
                  {activeImageIndex + 1} / {totalImages}
                </div>
              </>
            )}

            {/* Wishlist Love Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product);
              }}
              className="absolute top-5 right-5 p-2.5 bg-white/90 rounded-full text-zinc-600 hover:text-brand-primary hover:bg-white transition-all shadow-xs z-20 cursor-pointer active:scale-90 group/fav"
              aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  favorited
                    ? "text-rose-600 fill-rose-600 scale-110"
                    : "text-zinc-500 group-hover/fav:text-rose-500"
                }`}
              />
            </button>

            {/* Hover Zoom Hint */}
            {activeImageUrl && (
              <div
                className={`absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-[11px] font-medium text-zinc-700 px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 pointer-events-none transition-opacity duration-200 z-10 ${
                  isHovered ? "opacity-0" : "opacity-90"
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 text-brand-primary" />
                Hover to Zoom Detail
              </div>
            )}
          </div>

          {/* Multiple Images Thumbnail Selector */}
          {totalImages > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer relative bg-zinc-50 ${
                    activeImageIndex === idx
                      ? "border-brand-primary ring-2 ring-brand-primary/20 shadow-xs scale-102"
                      : "border-brand-border/80 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Material & Feature tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {product.materials.map((mat) => (
              <span
                key={mat}
                className="text-[11px] bg-white border border-brand-border px-3 py-1 rounded-full text-zinc-600 font-medium"
              >
                ✓ {mat}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Information, Options, & Purchase */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">
                {product.category} Collection
              </span>
              <StarRating
                rating={averageRating}
                reviewCount={totalReviewsCount}
                size="md"
              />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-1 tracking-tight">
              {product.title}
            </h1>
            <p className="text-sm text-zinc-500 font-light mt-1">
              {product.subtitle}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-brand-border/60">
            <span className="font-bold text-3xl text-brand-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-base text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span>Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                <span className="text-rose-400">•</span>
                <span>({formatPrice(product.originalPrice - product.price)})</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Color Selection with Out of Stock Badging */}
          {variants.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal block">
                  Color Variation: <span className="text-brand-primary">{selectedColor}</span>
                </span>
                {isSelectedOutOfStock && (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    Currently unavailable
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isSelected = selectedColor === v.name;
                  const isOut = !v.inStock || isOverallProductSoldOut;

                  return (
                    <button
                      key={v.name}
                      type="button"
                      disabled={isOut}
                      onClick={() => !isOut && setSelectedColor(v.name)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-2 ${
                        isOut
                          ? "border-zinc-200 bg-zinc-100/80 text-zinc-400 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "border-brand-primary bg-brand-blush text-brand-primary shadow-xs font-semibold cursor-pointer ring-2 ring-brand-primary/20"
                          : "border-brand-border bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer"
                      }`}
                    >
                      <span className={isOut ? "line-through decoration-zinc-400" : ""}>
                        {v.name}
                      </span>
                      {isOut && (
                        <span className="no-underline text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
                          Out of stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                Quantity:
              </span>
              <div className="flex items-center border border-brand-border rounded-full bg-white">
                <button
                  type="button"
                  disabled={isSelectedOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:text-brand-primary rounded-l-full transition-colors cursor-pointer disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold text-brand-charcoal min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isSelectedOutOfStock || quantity >= availableStock}
                  onClick={() => {
                    if (quantity < availableStock) {
                      setQuantity(quantity + 1);
                    } else {
                      showToast(`Only ${availableStock} units available.`);
                    }
                  }}
                  className="p-2 hover:text-brand-primary rounded-r-full transition-colors cursor-pointer disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-zinc-400">
                {isOverallProductSoldOut
                  ? "Sold out"
                  : `${availableStock} units in stock`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isSelectedOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary-hover transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSelectedOutOfStock ? (
                  "Sold Out"
                ) : addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSelectedOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-full bg-brand-charcoal text-white font-medium text-sm hover:bg-black transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSelectedOutOfStock ? "Unavailable" : "Order via Cash on Delivery"}
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Highlights */}
          <div className="border-t border-brand-border/60 pt-6 space-y-3 bg-brand-ivory/60 p-5 rounded-2xl">
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <Truck className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>Dhaka Delivery:</strong> 24–48 Hours (৳80). Outside Dhaka: 3–5 Days (৳150).
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>100% Quality Inspected:</strong> Anti-tarnish treated & luxury packaged.
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-700">
              <RotateCcw className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>
                <strong>7-Day Easy Exchange:</strong> Hassle-free support for size or style issues.
              </span>
            </div>
          </div>

          {/* Key Product Details / Highlights list */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-3">
              Craftsmanship & Specifications:
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600">
              {product.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-primary font-bold mt-0.5">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Reviews Section */}
      <section className="mt-20 pt-12 border-t border-brand-border/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Aggregate Score & Submit Review Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-primary">
                <MessageSquare className="w-4 h-4" />
                Customer Ratings
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-4xl sm:text-5xl text-brand-charcoal font-medium">
                  {averageRating}
                </span>
                <div>
                  <StarRating rating={averageRating} reviewCount={totalReviewsCount} showCount={false} size="lg" />
                  <p className="text-xs text-zinc-400 mt-1 font-light">
                    Based on {totalReviewsCount} verified customer reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Review Submission Form */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-4"
            >
              <h4 className="font-serif text-lg text-brand-charcoal">Write a Review</h4>
              <p className="text-xs text-zinc-400 font-light">
                Share your impressions of the craftsmanship and styling with fellow patrons.
              </p>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Thank you! Your feedback has been published.</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
                  Your Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating || reviewRating;
                    const isFilled = starVal <= activeVal;

                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setReviewRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-zinc-300 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            isFilled ? "text-[#D4AF37] fill-[#D4AF37]" : "text-zinc-200 fill-zinc-200"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-semibold text-brand-charcoal ml-2">
                    {reviewRating} / 5
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mashfika"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-brand-ivory/20"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                  Your Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about the finish, weight, stones, and styling..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-brand-ivory/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Right: Existing Reviews Feed */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-serif text-xl text-brand-charcoal mb-4">
              Customer Experiences ({totalReviewsCount})
            </h4>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-brand-border/70 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-serif text-sm font-medium text-brand-charcoal">
                        {rev.author}
                      </h5>
                      <p className="text-[10px] text-zinc-400 font-light">{rev.date}</p>
                    </div>
                    <StarRating rating={rev.rating} showCount={false} size="sm" />
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-light">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-brand-border/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
              Complete Your Look
            </h3>
            <Link
              href="/shop"
              className="text-xs font-medium text-brand-primary hover:underline"
            >
              View More Creations →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
