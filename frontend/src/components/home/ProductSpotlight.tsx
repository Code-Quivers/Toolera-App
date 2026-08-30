"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { formatPrice, calculateDiscount } from "@/lib/formatters";
import { RatingStars } from "@/components/ui/RatingStars";

export function ProductSpotlight() {
  const { products } = useProductStore();
  const spotlightProduct = products.find((p) => p.status !== "DRAFT" && (p.isSpotlight || p.isFeatured));
  if (!spotlightProduct) return null;
  const discount = calculateDiscount(spotlightProduct.price, spotlightProduct.compareAtPrice);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Editorial Container */}
        <div className="relative rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 text-white overflow-hidden p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
          {/* Subtle Ambient light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left: Big Feature Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group">
                <Image
                  src={spotlightProduct.images[0]}
                  alt={spotlightProduct.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-teal-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Spotlight Find
                </div>
              </div>
            </div>

            {/* Right: Product Narrative & Specs */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TODAY&apos;S FIND</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  {spotlightProduct.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
                  {spotlightProduct.shortDescription}
                </p>
              </div>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-4">
                <RatingStars rating={spotlightProduct.rating} reviewCount={spotlightProduct.reviewCount} />
                <span className="text-slate-600">•</span>
                <span className="text-xs font-medium text-teal-300 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Ready for dispatch in 24h
                </span>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                {spotlightProduct.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    {formatPrice(spotlightProduct.price)}
                  </span>
                  {spotlightProduct.compareAtPrice > spotlightProduct.price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(spotlightProduct.compareAtPrice)}
                      </span>
                      <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                <Link
                  href={`/product/${spotlightProduct.slug}`}
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
                >
                  <span>Shop Today&apos;s Find</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
