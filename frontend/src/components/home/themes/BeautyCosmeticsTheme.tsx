"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  Leaf,
  Flower2,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function BeautyCosmeticsTheme() {
  const { addItem: addToCart } = useCartStore();

  return (
    <div className="space-y-16 pb-16 bg-[#FDFAF7]">
      {/* ============================================================== */}
      {/* 1. HERO FLORAL CLEAN BANNER                                    */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-rose-50 via-pink-50 to-amber-50/60 border border-rose-100 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-4 max-w-lg z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>100% Organic &amp; Vegan</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 leading-tight">
              Fix your look. <br />
              <span className="text-rose-600 font-sans italic">Organic Skincare.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Formulated with cold-pressed botanical oils, active plant ceramides, and pure floral essences.
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <Link
                href="/shop"
                className="px-6 py-3 rounded-full bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition transform hover:scale-105"
              >
                Shop Collection
              </Link>
              <Link
                href="/pages/about-us"
                className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition"
              >
                Our Formula
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
              alt="Organic Skincare Bottles"
              className="max-h-72 object-contain rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. 3-COLUMN BOTANICAL CATEGORY CARDS                           */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Tonic Care",
              desc: "Pure rosewater & witch hazel balance for glowing hydration.",
              img: "https://images.unsplash.com/photo-1608248597359-0a67d69286d9?auto=format&fit=crop&w=400&q=80",
            },
            {
              title: "Ocean Minerals",
              desc: "Deep sea algae serum with bioactive hyaluronic complex.",
              img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80",
            },
            {
              title: "Skin Serenity",
              desc: "Overnight recovery oil with chamomile & lavender petals.",
              img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80",
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-rose-100 p-6 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition group"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-rose-50/50 p-2 border border-rose-100">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-black text-base text-slate-900">{cat.title}</h3>
                <p className="text-xs text-slate-500 max-w-xs">{cat.desc}</p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. 4-ITEM PHOTO BENTO COLLAGE (Editorial Beauty Models & Textures) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tag: "Editorial Glow", img: "https://images.unsplash.com/photo-1512290900672-1f486241ec85?auto=format&fit=crop&w=500&q=80" },
            { tag: "Coconut Botanicals", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80" },
            { tag: "Clay Mask Routine", img: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=500&q=80" },
            { tag: "Pure Rosemary", img: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-4/5 rounded-3xl overflow-hidden bg-slate-100 shadow-xs group"
            >
              <img
                src={item.img}
                alt={item.tag}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white font-serif font-black text-xs sm:text-sm tracking-wide">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 3-STEP ORGANIC INGREDIENTS PROCESS                          */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
            Conscious Formulation
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950">
            Organic Ingredients We Swear By
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ethically sourced botanical actives hand-picked from organic Himalayan farms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "1.",
              title: "Wild Mountain Honey",
              desc: "Natural humectant that locks 24-hour hydration without heavy oils.",
              img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
            },
            {
              num: "2.",
              title: "Cold-Pressed Jojoba",
              desc: "Bio-identical lipid matrix mimicking skin's natural barrier.",
              img: "https://images.unsplash.com/photo-1608248597359-0a67d69286d9?auto=format&fit=crop&w=400&q=80",
            },
            {
              num: "3.",
              title: "Damask Rose Essence",
              desc: "Soothes inflammation, tightens pores, and rejuvenates youth.",
              img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-rose-100 p-6 space-y-4 shadow-2xs hover:shadow-lg transition text-left"
            >
              <div className="aspect-video rounded-2xl overflow-hidden bg-rose-50">
                <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="font-serif font-black text-2xl text-rose-600">{step.num}</div>
                <h4 className="font-serif font-bold text-sm text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. INSTAGRAM LIFESTYLE FEED STRIP                              */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">@woodmart_organic</span>
          <h3 className="font-serif font-black text-lg text-slate-900">Follow Our Daily Glow Routine</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1512290900672-1f486241ec85?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=300&q=80",
          ].map((url, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 group shadow-xs">
              <img
                src={url}
                alt="Instagram Feed"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
