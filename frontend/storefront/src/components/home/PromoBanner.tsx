"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, ExternalLink } from "lucide-react";

export interface ImageBannerItem {
  id: string;
  image: string;
  link: string;
  title?: string;
  target?: "_self" | "_blank";
  active?: boolean;
}

interface PromoBannerProps {
  settings?: {
    mode?: "image-only" | "editorial";
    headline?: string;
    subtext?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    banners?: ImageBannerItem[];
    columns?: 1 | 2 | 3;
    aspectRatio?: "wide" | "standard" | "square" | "compact";
  };
}

export function PromoBanner({ settings }: PromoBannerProps) {
  const mode = settings?.mode || (settings?.banners && settings.banners.length > 0 ? "image-only" : "editorial");
  const banners = settings?.banners?.filter((b) => b.active !== false) || [];
  const columns = settings?.columns || (banners.length === 3 ? 3 : banners.length === 2 ? 2 : 1);

  // If Image-Only Mode with explicit banner items
  if (mode === "image-only" && banners.length > 0) {
    const gridColsClass =
      columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1";

    return (
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
            {banners.map((item) => (
              <Link
                key={item.id}
                href={item.link || "#"}
                target={item.target || "_self"}
                className="group relative block rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 bg-slate-100"
              >
                <div className="relative w-full aspect-[16/6] sm:aspect-[16/7] lg:aspect-[1600/500]">
                  <Image
                    src={item.image}
                    alt={item.title || "Promotional Banner"}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Single Image-Only mode (direct imageUrl + buttonLink without text overlay)
  if (mode === "image-only" && settings?.imageUrl) {
    return (
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            href={settings.buttonLink || "/shop"}
            className="group relative block rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 bg-slate-100"
          >
            <div className="relative w-full aspect-[16/5] sm:aspect-[1600/400]">
              <Image
                src={settings.imageUrl}
                alt="Promotional Banner"
                fill
                sizes="(max-width: 1600px) 100vw, 1600px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>
        </div>
      </section>
    );
  }

  // Editorial Mode with text & CTA button
  const headline = settings?.headline || "Flash Deal — 40% Off China Direct Import";
  const subtext = settings?.subtext || "Limited stock available. Free delivery on orders over ৳2,000.";
  const buttonText = settings?.buttonText || "Claim Deal";
  const buttonLink = settings?.buttonLink || "/shop?filter=trending";
  const imageUrl =
    settings?.imageUrl ||
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=300&q=80";

  return (
    <section className="py-6 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-25">
            <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

          {/* Text Info */}
          <div className="relative z-10 space-y-2 max-w-xl text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008B47]/20 border border-[#008B47]/40 text-[#008B47] text-xs font-bold bg-white/90">
              <Tag className="w-3.5 h-3.5" />
              <span>SPECIAL PROMOTION</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              {headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">{subtext}</p>
          </div>

          {/* Button */}
          <div className="relative z-10 shrink-0">
            <Link
              href={buttonLink}
              className="px-6 py-3.5 rounded-2xl bg-[#008B47] hover:bg-[#007a3e] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
