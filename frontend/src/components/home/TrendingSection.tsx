"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Flame, ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Sliders } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { ProductCard } from "@/components/product/ProductCard";

interface TrendingSectionProps {
  settings?: {
    title?: string;
    subtitle?: string;
    layout?: "carousel" | "grid";
    category?: string;
    source?: "trending" | "best-sellers" | "new-arrivals" | "sale" | "all";
    limit?: number;
    columnsCount?: number;
  };
}

export function TrendingSection({ settings }: TrendingSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { products } = useProductStore();

  const title = settings?.title || "Trending Now";
  const subtitle = settings?.subtitle || "Viral products discovered across Bangladesh.";
  const layout = settings?.layout || "carousel";
  const categoryFilter = settings?.category || "all";
  const source = settings?.source || "trending";
  const limit = settings?.limit || 8;
  const columnsCount = settings?.columnsCount || 4;

  // Filter products by source and category
  let filtered = products.filter((p) => p.status !== "DRAFT");

  // 1. Category Filter
  if (categoryFilter && categoryFilter !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.categorySlug === categoryFilter ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  // 2. Source Filter
  if (source === "trending") {
    filtered = filtered.filter(
      (p) => p.isTrending || p.badge === "TRENDING" || p.badge === "HOT"
    );
  } else if (source === "best-sellers") {
    filtered = filtered.filter((p) => p.isBestSeller || p.badge === "BEST SELLER");
  } else if (source === "new-arrivals") {
    filtered = filtered.filter((p) => p.isNewArrival || p.badge === "NEW");
  } else if (source === "sale") {
    filtered = filtered.filter((p) => p.isOnSale || (p.compareAtPrice && p.compareAtPrice > p.price) || p.badge === "SALE");
  }

  // Display only strictly matching filtered products (no fallback to unrelated products)
  const displayProducts = filtered.slice(0, limit);

  if (displayProducts.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 260;
      const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 6:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-6";
      case 4:
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    }
  };

  return (
    <section className="py-8 sm:py-14 bg-slate-50/60 border-b border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-0.5 sm:mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>High Demand</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/shop${categoryFilter !== "all" ? `?category=${categoryFilter}` : "?filter=trending"}`}
              className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition mr-1 sm:mr-2"
            >
              <span>See All ({displayProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Carousel Navigation Arrows */}
            {layout === "carousel" && (
              <>
                <button
                  onClick={() => scroll("left")}
                  aria-label="Previous products"
                  className="hidden sm:flex w-9 h-9 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 items-center justify-center transition shadow-xs active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  aria-label="Next products"
                  className="hidden sm:flex w-9 h-9 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 items-center justify-center transition shadow-xs active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Display: Carousel vs Grid */}
        {layout === "grid" ? (
          <div className={`grid ${getGridColsClass(columnsCount)} gap-3 sm:gap-6`}>
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-2.5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-3 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0"
          >
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex-none w-[calc(50%-5px)] min-w-[150px] max-w-[210px] sm:w-[270px] lg:w-[285px] snap-start"
              >
                <ProductCard product={product} priority={index < 4} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
