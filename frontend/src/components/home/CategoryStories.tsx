"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export function CategoryStories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const displayCategories = mounted ? categories : [];

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Carousel Navigation Arrows */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop by Categories
            </h2>
          </div>

          {/* Carousel Next & Prev Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous categories"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next categories"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition shadow-xs active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {displayCategories.length > 0 ? (
            displayCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex-none w-32 sm:w-44 group flex flex-col items-center text-center select-none"
              >
                {/* Category Box */}
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 p-1 group-hover:border-teal-500 group-hover:shadow-md transition-all duration-300">
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                    <Image
                      src={cat.image || "/assets/placeholder.png"}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 120px, 160px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/25 group-hover:bg-slate-950/10 transition-colors" />
                  </div>
                </div>

                {/* Category Title & Count */}
                <span className="mt-3 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition leading-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {
                    products.filter(
                      (p) =>
                        (p.categorySlug && p.categorySlug.toLowerCase() === cat.slug.toLowerCase()) ||
                        (p.category && p.category.toLowerCase() === cat.name.toLowerCase())
                    ).length
                  }{" "}
                  products
                </span>
              </Link>
            ))
          ) : (
            /* Lightweight Skeleton Placeholders for Instant 0ms SSR Hydration */
            [1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex-none w-32 sm:w-44 flex flex-col items-center animate-pulse">
                <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl bg-slate-100 border border-slate-200/60" />
                <div className="w-16 h-3 bg-slate-200 rounded mt-3" />
                <div className="w-10 h-2.5 bg-slate-100 rounded mt-1.5" />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
