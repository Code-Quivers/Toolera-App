import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { mockNeedCollections } from "@/data/mockCollections";

export function ShopByNeed() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1 flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Problem-Solving Finds</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curated For Your Daily Life
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Instead of endless scrolling, explore collections designed to solve real problems and elevate your everyday routines.
          </p>
        </div>

        {/* 4 Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockNeedCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/shop?need=${collection.filterTag}`}
              className="group relative flex flex-col rounded-3xl bg-slate-50 border border-slate-200/80 overflow-hidden hover:border-teal-500 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-xs">
                  {collection.tagline}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {collection.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {collection.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
