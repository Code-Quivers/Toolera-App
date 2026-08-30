"use client";

import React from "react";
import Image from "next/image";
import { Heart, Star, Sparkles, MessageSquare } from "lucide-react";
import { useReviewStore, ReviewItem } from "@/store/useReviewStore";

const DEFAULT_CURATED_REVIEWS: ReviewItem[] = [
  {
    id: "cr-1",
    productId: "prod-1",
    productTitle: "Handmade Decorative Bottle with LED Light",
    authorName: "Tanvir Ahmed",
    authorLocation: "Dhanmondi, Dhaka",
    rating: 5,
    comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    verifiedPurchase: true,
    status: "APPROVED",
    date: "2 days ago",
  },
  {
    id: "cr-2",
    productId: "prod-2",
    productTitle: "Desk Setup & Organizer Accessories",
    authorName: "Nusrat Jahan",
    authorLocation: "Chittagong",
    rating: 5,
    comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Raifa's Mart!",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    verifiedPurchase: true,
    status: "APPROVED",
    date: "4 days ago",
  },
  {
    id: "cr-3",
    productId: "prod-3",
    productTitle: "Smart Tech & Viral Gadgets",
    authorName: "Mahmud Hasan",
    authorLocation: "Uttara, Dhaka",
    rating: 5,
    comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    verifiedPurchase: true,
    status: "APPROVED",
    date: "1 week ago",
  },
  {
    id: "cr-4",
    productId: "prod-4",
    productTitle: "Handcraft & Home Decor Collection",
    authorName: "Sadia Rahman",
    authorLocation: "Sylhet",
    rating: 5,
    comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    verifiedPurchase: true,
    status: "APPROVED",
    date: "1 week ago",
  },
];

interface CustomerReviewsProps {
  settings?: {
    title?: string;
    headline?: string;
    heading?: string;
    subtitle?: string;
    tagline?: string;
    subtext?: string;
    description?: string;
    pillText?: string;
    layout?: "carousel" | "grid";
    columnsCount?: number;
    limit?: number;
    customReviews?: Array<{
      id?: string;
      authorName: string;
      authorLocation?: string;
      rating: number;
      comment: string;
      productTitle?: string;
      avatarUrl?: string;
    }>;
    reviews?: Array<{
      id?: string;
      authorName: string;
      authorLocation?: string;
      rating: number;
      comment: string;
      productTitle?: string;
      avatarUrl?: string;
    }>;
  };
}

import { ChevronLeft, ChevronRight } from "lucide-react";

export function CustomerReviews({ settings }: CustomerReviewsProps = {}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { getApprovedReviews } = useReviewStore();
  const storeReviews = getApprovedReviews();

  const customList = settings?.customReviews || settings?.reviews;
  const reviews =
    customList && customList.length > 0
      ? customList
      : storeReviews.length > 0
      ? storeReviews
      : DEFAULT_CURATED_REVIEWS;

  const layout = settings?.layout || "grid";
  const columnsCount = settings?.columnsCount || 4;
  const limit = settings?.limit || 12;

  const title =
    settings?.title ||
    settings?.headline ||
    settings?.heading ||
    "Loved by Our Customers";

  const subtitle =
    settings?.subtitle ||
    settings?.subtext ||
    settings?.description ||
    "Real experiences from verified shoppers across Bangladesh.";

  const pillText =
    settings?.pillText ||
    settings?.tagline ||
    "Community Feedback";

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Navigation Arrows for Carousel Mode */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
              <span>{pillText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Carousel Arrows */}
          {layout === "carousel" && (
            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs cursor-pointer"
                title="Previous Reviews"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs cursor-pointer"
                title="Next Reviews"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 1. CAROUSEL LAYOUT */}
        {layout === "carousel" ? (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {reviews.slice(0, limit).map((review, i) => (
              <div
                key={review.id || i}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card hover:border-slate-300 transition-all duration-300"
              >
                <div>
                  {/* Rating stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx < Math.round(review.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-800 ml-1">
                      {(review.rating || 5).toFixed(1)}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-4">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Author & Product Info */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={
                        review.avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                      }
                      alt={review.authorName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {review.authorName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {review.authorLocation || "Dhaka"} •{" "}
                      <span className="text-teal-600 font-medium">Customer Review</span>
                    </div>
                    {review.productTitle && (
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                        Item: {review.productTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2. GRID LAYOUT */
          <div className={`grid gap-6 ${getGridColsClass(columnsCount)}`}>
            {reviews.slice(0, limit).map((review, i) => (
              <div
                key={review.id || i}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card hover:border-slate-300 transition-all duration-300"
              >
                <div>
                  {/* Rating stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx < Math.round(review.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-slate-800 ml-1">
                      {(review.rating || 5).toFixed(1)}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Author & Product Info */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={
                        review.avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                      }
                      alt={review.authorName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {review.authorName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {review.authorLocation || "Dhaka"} •{" "}
                      <span className="text-teal-600 font-medium">Customer Review</span>
                    </div>
                    {review.productTitle && (
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                        Item: {review.productTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
