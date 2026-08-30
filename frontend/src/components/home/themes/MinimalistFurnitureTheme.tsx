"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Compass,
  Play,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function MinimalistFurnitureTheme() {
  const { addItem: addToCart } = useCartStore();

  const furnitureLogos = [
    { name: "ALESSI", logo: "ALESSI" },
    { name: "Kartell", logo: "Kartell" },
    { name: "FLOS", logo: "FLOS" },
    { name: "HAY", logo: "HAY" },
    { name: "Cassina", logo: "Cassina" },
    { name: "B&B Italia", logo: "B&B ITALIA" },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#FAFAF8]">
      {/* ============================================================== */}
      {/* 1. HERO SECTION: Mountain Landscape with Leather Armchair     */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-slate-200 min-h-[440px] flex flex-col md:flex-row items-center justify-between p-8 sm:p-14 shadow-md">
          {/* Mountain Landscape Background */}
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Mountain Landscape"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-transparent" />

          {/* Hero Content */}
          <div className="space-y-4 max-w-lg z-10 text-center md:text-left">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-widest">
              Craftsmanship 2026 Collection
            </span>
            <h1 className="text-4xl sm:text-6xl font-sans font-black text-slate-900 tracking-tight leading-none">
              Brand New <br />
              <span className="text-emerald-700">Armchairs.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Keeping the good parts and taking out the bad. Ergonomic Danish design with premium saddle leather.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg transition transform hover:scale-105"
              >
                <span>Explore Chair</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cut-out Leather Armchair */}
          <div className="relative z-10 flex justify-center items-center mt-6 md:mt-0">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80"
              alt="Brand New Armchair"
              className="max-h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FEATURED 3-CHAIR MINIMALIST SHOWCASE                        */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
            Minimalist Living
          </span>
          <h2 className="text-2xl font-black text-slate-900">Featured Categories</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: "Lounge Chairs", count: "14 Models", img: "https://images.unsplash.com/photo-1580481077190-736b3b5fa896?auto=format&fit=crop&w=400&q=80" },
            { name: "Pots & Planters", count: "8 Models", img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
            { name: "Dining Chairs", count: "24 Models", img: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80" },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href="/shop"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col items-center space-y-4 hover:shadow-xl hover:border-emerald-300 transition group"
            >
              <div className="h-44 flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="max-h-40 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  {cat.name}
                </div>
                <div className="text-xs text-slate-400 font-semibold">{cat.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MASONRY / BENTO INTERIOR GRID                               */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card 1: White Armchair (Col 4) */}
          <div className="md:col-span-4 bg-slate-100 rounded-3xl p-8 flex flex-col justify-between min-h-[320px] shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800">Scandi Collection</span>
              <h3 className="text-xl font-black text-slate-900">Minimal Armchairs</h3>
            </div>
            <img
              src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80"
              alt="Minimal Chair"
              className="max-h-44 object-contain mx-auto"
            />
          </div>

          {/* Card 2: Hot Sale Green (Col 4) */}
          <div className="md:col-span-4 bg-emerald-800 text-white rounded-3xl p-8 flex flex-col justify-between shadow-md">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-300">Seasonal Promo</span>
              <h3 className="text-2xl font-black">HOT SALE UP TO 70%</h3>
              <p className="text-xs text-emerald-100">Discounts on solid oak dining tables and chairs.</p>
            </div>
            <Link
              href="/shop"
              className="self-start px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 transition"
            >
              Shop Discount
            </Link>
          </div>

          {/* Card 3: Yellow Sofa Showcase (Col 4) */}
          <div className="md:col-span-4 bg-amber-50 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Factory Direct</span>
              <h3 className="text-lg font-black text-slate-900">Velvet Sofa Series</h3>
            </div>
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80"
              alt="Yellow Sofa"
              className="max-h-36 object-contain mx-auto mt-2"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. ABOUT OUR FACTORY (Dark Architectural Section)              */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-950 text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
          <div className="lg:col-span-6 grid grid-cols-2 gap-2 p-2">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80"
              alt="Modern Living"
              className="w-full h-48 object-cover rounded-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80"
              alt="Minimalist Wood"
              className="w-full h-48 object-cover rounded-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80"
              alt="Interior Studio"
              className="w-full h-48 object-cover rounded-2xl col-span-2"
            />
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">
                Our Heritage &amp; Factory
              </span>
              <h2 className="text-3xl font-black tracking-tight">
                ABOUT OUR FACTORY &amp; CRAFTSMANSHIP
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                For over two decades, our master woodworkers have blended traditional Scandinavian joinery with CNC precision to produce sustainable heirlooms for contemporary spaces.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div>
                <div className="font-black text-2xl text-emerald-400">100%</div>
                <div className="text-xs text-slate-300 font-bold">FSC Certified Oak</div>
              </div>
              <div>
                <div className="font-black text-2xl text-emerald-400">10-Year</div>
                <div className="text-xs text-slate-300 font-bold">Structural Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FURNITURE BRAND LOGOS                                       */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 items-center justify-items-center opacity-60 hover:opacity-100 transition-opacity">
            {furnitureLogos.map((b, i) => (
              <div key={i} className="font-serif font-black text-sm sm:text-base text-slate-700">
                {b.logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
