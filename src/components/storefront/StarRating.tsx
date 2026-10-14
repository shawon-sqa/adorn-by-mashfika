"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating = 4.9,
  reviewCount = 18,
  showCount = true,
  size = "md",
  className = "",
}: StarRatingProps) {
  // Clamped rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const starSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* 5 Stars with fractional / smooth visual fills */}
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${clampedRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          // Calculate fill percentage for this star
          const fillPercentage = Math.max(
            0,
            Math.min(100, (clampedRating - (starIndex - 1)) * 100)
          );

          return (
            <div key={starIndex} className="relative inline-block">
              {/* Background empty star */}
              <Star className={`${starSize} text-zinc-200 fill-zinc-200 stroke-none`} />

              {/* Foreground filled star with clip path / width */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${starSize} text-[#D4A373] fill-[#D4A373] stroke-none`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCount && (
        <span className="text-xs text-zinc-500 font-medium tracking-tight">
          <span className="font-semibold text-brand-charcoal">{clampedRating.toFixed(1)}</span>
          <span className="text-zinc-400 ml-1 font-normal">({reviewCount} reviews)</span>
        </span>
      )}
    </div>
  );
}
