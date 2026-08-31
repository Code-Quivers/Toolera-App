"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Cpu,
  Gamepad2,
  Tv,
  Home,
  Camera,
  Headphones,
  Flame,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export function ModernTechTheme() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const roundCategories = [
    { name: "Apple iPhone", count: "14 items", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "MacBook Air", count: "8 items", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80", slug: "desk-setup" },
    { name: "Motherboards", count: "12 items", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80", slug: "desk-setup" },
    { name: "VR Lenses", count: "6 items", img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "Headsets", count: "18 items", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "Drones", count: "5 items", img: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "Apple iPad", count: "9 items", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
  ];

  return (
    <div className="space-y-12 pb-16 bg-white">
      {/* ============================================================== */}
      {/* 1. HERO BENTO GRID (Apple Shopping Event + Aurora Headset + 2 sub-cards) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Hero Card: Apple Shopping Event (Col 7) */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-xl min-h-[400px]">
            <div className="space-y-3 z-10 max-w-sm">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-[10px] uppercase">
                Apple Event
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Apple Shopping Event
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Shop early bird deals on M3 MacBooks, iPads, and AirPods with instant cashbacks.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition transform hover:scale-105"
                >
                  <span>Shop Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative mt-4 flex justify-center items-center">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
                alt="MacBook Setup"
                className="max-h-48 object-contain rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Right Column: Aurora Headset top + 2 sub-cards bottom (Col 5) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Top Card: Aurora Headset */}
            <div className="relative flex-1 rounded-3xl bg-linear-to-r from-rose-50 to-pink-50 border border-pink-100 p-6 flex items-center justify-between shadow-xs overflow-hidden">
              <div className="space-y-2 max-w-[200px] z-10">
                <span className="text-[10px] font-extrabold uppercase text-pink-600">Flash Deal</span>
                <h3 className="text-xl font-black text-slate-900">Aurora Headset</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-700">
                  <span className="px-1.5 py-0.5 rounded bg-white border">12d</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border">14h</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border">32m</span>
                </div>
                <Link
                  href="/shop"
                  className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-500 transition"
                >
                  Buy Now
                </Link>
              </div>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=350&q=80"
                alt="Aurora Headset"
                className="max-h-32 object-contain rounded-xl drop-shadow-md hover:scale-105 transition-transform"
              />
            </div>

            {/* Bottom 2 Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-blue-50/80 border border-blue-100 p-4 space-y-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase">New Arrivals</span>
                <div className="font-extrabold text-xs text-slate-900">PS5 Controllers</div>
                <Link href="/shop" className="text-[11px] font-bold text-blue-600 hover:underline block">
                  Shop 30% Off →
                </Link>
              </div>
              <div className="rounded-3xl bg-amber-50/80 border border-amber-100 p-4 space-y-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Retro Style</span>
                <div className="font-extrabold text-xs text-slate-900">Vintage Cameras</div>
                <Link href="/shop" className="text-[11px] font-bold text-amber-700 hover:underline block">
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. POPULAR CATEGORIES (Icon Circular / Square Cards)          */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="text-xl font-black text-slate-950">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {roundCategories.map((c, idx) => (
            <Link
              key={idx}
              href={`/category/${c.slug}`}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-md transition text-center space-y-2 group"
            >
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-white border border-slate-200 p-1 flex items-center justify-center">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform"
                />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. THE BEST OFFERS (Blue Button DTC Grid)                      */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-950">The Best Offers</h2>
          <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
            View All Offers →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[9px]">
                    -20%
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-2">{p.title}</div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] text-slate-500 font-bold">{p.rating || 4.9}</span>
                </div>
                <div className="font-black text-sm text-slate-950">৳{p.price.toLocaleString()}</div>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-xs transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. NEW GOODS SPOTLIGHT (Nothing Phone 1 + 4 Products)           */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Nothing Phone Spotlight (Col 4) */}
          <div className="lg:col-span-4 rounded-3xl bg-slate-950 text-white p-7 flex flex-col justify-between min-h-[360px] shadow-lg relative overflow-hidden">
            <div className="space-y-2 z-10">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                Exclusive
              </span>
              <h3 className="text-2xl font-black">Nothing Phone (2)</h3>
              <p className="text-xs text-slate-400">Glyph interface with Snapdragon 8+ Gen 1 power.</p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500"
                >
                  Order Now
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80"
              alt="Nothing Phone"
              className="max-h-44 object-contain rounded-xl mx-auto drop-shadow-2xl hover:scale-105 transition-transform"
            />
          </div>

          {/* Right 4 Products Grid (Col 8) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.slice(4, 8).map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 hover:shadow-lg transition flex flex-col justify-between space-y-2"
              >
                <div className="space-y-2">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="aspect-square w-full object-cover rounded-xl bg-slate-50"
                  />
                  <div className="font-bold text-xs text-slate-900 line-clamp-2">{p.title}</div>
                  <div className="font-black text-xs text-slate-950">৳{p.price.toLocaleString()}</div>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FULL-WIDTH APPLE EVENT GRADIENT BANNER                      */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-linear-to-r from-rose-500 via-purple-600 to-indigo-600 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] uppercase">
              Mega Shopping Festival
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Apple Shopping Event</h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md">
              Hurry and get discounts on all Apple devices up to 25% off with instant delivery.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-xs font-mono font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm">128 days</div>
              <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm">13 hours</div>
              <div className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm">21 mins</div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-700">28 secs</div>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=80"
            alt="Apple Gadgets"
            className="max-h-48 object-contain rounded-2xl drop-shadow-2xl"
          />
        </div>
      </section>
    </div>
  );
}
