"use client";

import React from "react";
import { CMSSectionItem } from "@/lib/cms/types";
import {
  Sliders, LayoutGrid, Flame, Sparkles, Zap, Award, Heart,
  ShieldCheck, Mail, Tag, HelpCircle, Clock, AlignLeft,
  Monitor, Cpu, Package, Store,
} from "lucide-react";

interface Props {
  sections: CMSSectionItem[];
  isPreview?: boolean;
}

// Visual preview card for each section type
function SectionPreviewCard({ section }: { section: CMSSectionItem }) {
  const s = section.settings || {};
  const type = section.type;

  // --- hero-slider ---
  if (type === "hero-slider") {
    const slide = s.slides?.[0];
    return (
      <div className="rounded-2xl overflow-hidden bg-slate-950 text-white p-6 min-h-[120px] relative flex flex-col justify-between" style={{ background: slide?.themeColor || "#0f172a" }}>
        <div className="space-y-1 z-10">
          {slide?.badge && <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">{slide.badge}</span>}
          <div className="text-xl font-black tracking-tight">{slide?.title || "Hero Banner Slider"}</div>
          <div className="text-xs text-white/60">{slide?.subtitle || "Add slides in the configure panel"}</div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {slide?.buttonText && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold">{slide.buttonText}</span>}
          {(s.slides?.length || 0) > 1 && <span className="text-[10px] text-white/50">{s.slides.length} slides</span>}
        </div>
        <div className="absolute top-3 right-3"><Sliders className="w-5 h-5 text-white/20" /></div>
      </div>
    );
  }

  // --- category-carousel ---
  if (type === "category-carousel") {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 p-4">
        <div className="text-sm font-bold text-slate-900">{s.title || "Shop by Categories"}</div>
        <div className="text-[11px] text-slate-400 mb-3">{s.tagline || "Curated Collections"} · {s.limit || 8} categories</div>
        <div className="flex gap-2">
          {Array.from({ length: Math.min(s.limit || 8, 6) }).map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-xs flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
          {(s.limit || 8) > 6 && <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-xs flex items-center justify-center text-[10px] font-bold text-slate-400">+{(s.limit || 8) - 6}</div>}
        </div>
      </div>
    );
  }

  // --- trending / new-arrivals / best-sellers ---
  if (type === "trending-products" || type === "new-arrivals" || type === "best-sellers") {
    const Icon = type === "trending-products" ? Flame : type === "new-arrivals" ? Zap : Award;
    const cols = s.columnsCount || 4;
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-emerald-600" />
          <div className="text-sm font-bold text-slate-900">{s.title || type}</div>
        </div>
        <div className="text-[11px] text-slate-400">{s.subtitle || ""}</div>
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
          {Array.from({ length: Math.min(s.limit || 4, 8) }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-slate-50 border border-slate-100 flex items-end p-1.5">
              <div className="w-full h-1.5 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold">{s.source || "trending"}</span>
          <span>{s.layout === "grid" ? "Grid" : "Carousel"}</span>
          <span>{s.limit || 8} items</span>
        </div>
      </div>
    );
  }

  // --- spotlight ---
  if (type === "spotlight") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider">{s.badgeText || "TODAY'S FIND"}</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{s.customTitle || "Product Spotlight"}</div>
          <div className="text-[11px] text-slate-500">{s.customDescription || "Auto-selects featured product"}</div>
        </div>
      </div>
    );
  }

  // --- reviews ---
  if (type === "reviews") {
    const revCount = (s.customReviews || s.reviews || []).length;
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <div className="text-sm font-bold text-slate-900">{s.title || "Customer Reviews"}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: Math.min(revCount || 2, 4) }).map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 space-y-1">
              <div className="text-[10px] text-amber-500">⭐⭐⭐⭐⭐</div>
              <div className="h-1.5 rounded-full bg-slate-200 w-3/4" />
              <div className="h-1 rounded-full bg-slate-100 w-full" />
            </div>
          ))}
        </div>
        {revCount > 0 && <div className="text-[10px] text-slate-400">{revCount} review card{revCount !== 1 ? "s" : ""} configured</div>}
      </div>
    );
  }

  // --- trust-pillars ---
  if (type === "trust-pillars") {
    const pillars = s.pillars || [];
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div className="text-sm font-bold text-slate-900">{s.title || "Trust & Guarantee Pillars"}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(pillars.length > 0 ? pillars : Array.from({ length: 4 })).slice(0, 4).map((_: any, i: number) => (
            <div key={i} className="rounded-xl bg-emerald-50 border border-emerald-100 p-2 flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="h-1 rounded-full bg-emerald-100 w-full" />
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400">{pillars.length || 4} guarantee card{(pillars.length || 4) !== 1 ? "s" : ""}</div>
      </div>
    );
  }

  // --- newsletter ---
  if (type === "newsletter") {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-4 flex items-center gap-4">
        <Mail className="w-8 h-8 text-white/70 shrink-0" />
        <div>
          <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">{s.tagline || "Stay in the Loop"}</div>
          <div className="text-sm font-black">{s.title || "Get the Good Stuff First."}</div>
          <div className="mt-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-[10px] font-bold inline-block">{s.buttonText || "Subscribe"}</div>
        </div>
      </div>
    );
  }

  // --- promo-banner ---
  if (type === "promo-banner") {
    return (
      <div
        className="rounded-2xl overflow-hidden relative flex items-center gap-4 p-4 min-h-[80px]"
        style={{
          backgroundImage: s.imageUrl ? `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${s.imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundColor: !s.imageUrl ? "#1e293b" : undefined,
        }}
      >
        <Tag className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <div className="text-sm font-black text-white">{s.headline || "Promotional Banner"}</div>
          <div className="text-[11px] text-white/70">{s.subtext || ""}</div>
          {s.buttonText && <span className="mt-1 px-3 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black inline-block">{s.buttonText}</span>}
        </div>
      </div>
    );
  }

  // --- faq ---
  if (type === "faq") {
    const items = s.items || [];
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-violet-500" />
          <div className="text-sm font-bold text-slate-900">{s.title || "Frequently Asked Questions"}</div>
        </div>
        <div className="space-y-1.5">
          {(items.length > 0 ? items : Array.from({ length: 3 })).slice(0, 4).map((_: any, i: number) => (
            <div key={i} className="h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center px-3 gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-200" />
              <div className="h-1.5 rounded-full bg-slate-200 w-2/3" />
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400">{items.length || 3} Q&A item{(items.length || 3) !== 1 ? "s" : ""}</div>
      </div>
    );
  }

  // --- countdown ---
  if (type === "countdown") {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white p-4 flex items-center justify-between">
        <div>
          <Clock className="w-4 h-4 text-white/70 mb-1" />
          <div className="text-sm font-black">{s.title || "Flash Countdown"}</div>
          <div className="text-[11px] text-white/80">{s.discountText || "Limited time deal"} <span className="font-mono font-black bg-white/20 px-1.5 rounded">{s.couponCode || "CODE"}</span></div>
        </div>
        <div className="flex gap-1.5">
          {["00", "12", "00"].map((t, i) => (
            <div key={i} className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">{t}</div>
          ))}
        </div>
      </div>
    );
  }

  // --- rich-text ---
  if (type === "rich-text") {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-slate-400" />
          <div className="text-sm font-bold text-slate-900">{s.heading || "Rich Text Block"}</div>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-slate-100 w-full" />
          <div className="h-1.5 rounded-full bg-slate-100 w-4/5" />
          <div className="h-1.5 rounded-full bg-slate-100 w-3/4" />
        </div>
      </div>
    );
  }

  // --- theme / modular sections ---
  const themeColors: Record<string, { bg: string; icon: React.ReactNode }> = {
    "modern-tech-hero-bento": { bg: "#0f172a", icon: <Cpu className="w-5 h-5 text-blue-400" /> },
    "round-categories-strip": { bg: "#f8fafc", icon: <LayoutGrid className="w-5 h-5 text-slate-400" /> },
    "the-best-offers": { bg: "#fff7ed", icon: <Tag className="w-5 h-5 text-orange-400" /> },
    "nothing-phone-spotlight": { bg: "#0f172a", icon: <Monitor className="w-5 h-5 text-slate-400" /> },
    "electronics-hero-bento": { bg: "#1e3a5f", icon: <Cpu className="w-5 h-5 text-cyan-400" /> },
    "brand-logos-strip": { bg: "#f1f5f9", icon: <Store className="w-5 h-5 text-slate-400" /> },
    "bestsellers-category-tabs": { bg: "#f0fdf4", icon: <Award className="w-5 h-5 text-emerald-500" /> },
    "gaming-spotlight": { bg: "#1a0533", icon: <Monitor className="w-5 h-5 text-purple-400" /> },
    "supermarket-hero-split": { bg: "#f0fdf4", icon: <Package className="w-5 h-5 text-green-500" /> },
    "grocery-deal-of-the-day": { bg: "#fef9c3", icon: <Tag className="w-5 h-5 text-yellow-500" /> },
    "beauty-hero-floral": { bg: "#fdf2f8", icon: <Sparkles className="w-5 h-5 text-pink-400" /> },
    "beauty-ingredients-3step": { bg: "#fff0f6", icon: <Sparkles className="w-5 h-5 text-rose-400" /> },
    "beauty-bento-collage": { bg: "#fce7f3", icon: <LayoutGrid className="w-5 h-5 text-pink-500" /> },
    "furniture-hero-mountain": { bg: "#f5f0e8", icon: <Store className="w-5 h-5 text-amber-700" /> },
    "furniture-brand-logos": { bg: "#fafaf9", icon: <Package className="w-5 h-5 text-stone-400" /> },
    "furniture-room-categories": { bg: "#f9f5ef", icon: <LayoutGrid className="w-5 h-5 text-amber-600" /> },
    "fashion-hero-editorial": { bg: "#0a0a0a", icon: <Sparkles className="w-5 h-5 text-white/40" /> },
    "fashion-gender-tabs": { bg: "#fafafa", icon: <LayoutGrid className="w-5 h-5 text-slate-400" /> },
    "airpods-promo-banner": { bg: "#f8fafc", icon: <Monitor className="w-5 h-5 text-slate-400" /> },
  };

  const theme = themeColors[type];
  const friendlyName = type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="rounded-2xl p-4 min-h-[80px] flex items-center gap-3" style={{ backgroundColor: theme?.bg || "#f8fafc", border: "1px solid #e2e8f0" }}>
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        {theme?.icon || <LayoutGrid className="w-5 h-5 text-slate-400" />}
      </div>
      <div>
        <div className="text-sm font-black" style={{ color: theme?.bg === "#0f172a" || theme?.bg === "#0a0a0a" || theme?.bg === "#1a0533" || theme?.bg === "#1e3a5f" ? "white" : "#0f172a" }}>
          {friendlyName}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: theme?.bg === "#0f172a" || theme?.bg === "#0a0a0a" || theme?.bg === "#1a0533" || theme?.bg === "#1e3a5f" ? "rgba(255,255,255,0.5)" : "#64748b" }}>
          Theme preset · auto-populated from catalog
        </div>
      </div>
    </div>
  );
}

export function SectionRenderer({ sections, isPreview }: Props) {
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs gap-2">
        <span className="text-2xl">🧩</span>
        <span>No sections added yet. Click + Add Section to get started.</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${isPreview ? "pointer-events-none" : ""}`}>
      {sections
        .filter(s => s.enabled)
        .sort((a, b) => a.position - b.position)
        .map(section => (
          <div key={section.id} className={`w-full transition-all duration-200 ${isPreview && !section.enabled ? "opacity-40 grayscale" : ""}`}>
            <SectionPreviewCard section={section} />
          </div>
        ))}
    </div>
  );
}
