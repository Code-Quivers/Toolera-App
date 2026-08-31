"use client";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const SIZE = {
  sm: { star: "text-xs", text: "text-xs" },
  md: { star: "text-sm", text: "text-sm" },
  lg: { star: "text-base", text: "text-sm" },
};

export function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
}: RatingStarsProps) {
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;
  const { star, text } = SIZE[size];

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex ${star}`} aria-label={`${clamped} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) return <span key={i} className="text-yellow-400">★</span>;
          if (i === full && half) return <span key={i} className="text-yellow-300">★</span>;
          return <span key={i} className="text-gray-300">★</span>;
        })}
      </span>
      {showValue && (
        <span className={`text-gray-600 ${text}`}>
          {clamped.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-1 text-gray-400">({reviewCount})</span>
          )}
        </span>
      )}
    </span>
  );
}
