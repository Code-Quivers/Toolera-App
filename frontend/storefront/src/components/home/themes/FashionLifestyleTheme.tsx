"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Flame,
  Tag,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

export function FashionLifestyleTheme() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const [selectedGender, setSelectedGender] = useState<"women" | "men">("women");

  return (
    <div className="space-y-16 pb-16 bg-white">
      {/* ============================================================== */}
      {/* 1. EDITORIAL FASHION HERO                                       */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[460px] flex flex-col md:flex-row items-center justify-between p-8 sm:p-14 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
            alt="Fashion Lookbook"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

          <div className="space-y-4 max-w-lg z-10 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider">
              Autumn / Winter 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase">
              NEW SEASON <br />
              <span className="text-rose-500">LOOKBOOK.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Oversized silhouettes, tailored wool trench coats, and minimal organic cotton essentials.
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <Link
                href="/shop"
                className="px-6 py-3 rounded-full bg-white text-slate-950 font-black text-xs hover:bg-rose-600 hover:text-white transition shadow-lg"
              >
                Shop Women
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 rounded-full bg-transparent border border-white text-white font-black text-xs hover:bg-white/10 transition"
              >
                Shop Men
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SEASON COLLECTIONS BENTO                                    */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Streetwear Drops",
              tag: "Exclusive",
              img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
            },
            {
              title: "Tailored Outerwear",
              tag: "Trending",
              img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
            },
            {
              title: "Minimal Accessories",
              tag: "New In",
              img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="relative aspect-4/5 rounded-3xl overflow-hidden group shadow-md"
            >
              <img
                src={c.img}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 space-y-2 text-white">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] uppercase self-start">
                  {c.tag}
                </span>
                <h3 className="text-xl font-black">{c.title}</h3>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. TRENDING OUTFITS & APPAREL                                  */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Trending Apparel
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGender("women")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedGender === "women" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setSelectedGender("men")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedGender === "men" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Men
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {products.slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between space-y-3"
            >
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => addToCart(p)}
                  className="absolute bottom-3 left-3 right-3 py-2 bg-slate-950/90 backdrop-blur-xs hover:bg-rose-600 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  Quick Add • ৳{p.price.toLocaleString()}
                </button>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Toolera Signature</div>
                <h4 className="font-bold text-xs text-slate-900 truncate">{p.title}</h4>
                <div className="font-black text-xs text-slate-950">৳{p.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
