import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingStars({
  rating,
  reviewCount,
  showValue = true,
  size = "sm",
  className,
}: RatingStarsProps) {
  const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const starIconSize = sizeMap[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.8;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className={cn(starIconSize, "fill-amber-400 text-amber-400")} />;
          }
          if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="relative inline-block">
                <Star className={cn(starIconSize, "text-slate-200")} />
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className={cn(starIconSize, "fill-amber-400 text-amber-400")} />
                </span>
              </span>
            );
          }
          return <Star key={i} className={cn(starIconSize, "text-slate-200 fill-slate-100")} />;
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-slate-800 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}

      {typeof reviewCount === "number" && (
        <span className="text-xs text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
}
