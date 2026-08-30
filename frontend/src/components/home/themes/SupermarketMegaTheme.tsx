"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Tv,
  Home,
  Headphones,
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  Flame,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export function SupermarketMegaTheme() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  return (
    <div className="space-y-12 pb-16 bg-[#F8F9FA]">
      {/* ============================================================== */}
      {/* 1. HERO 3-WAY SPLIT: Galaxy Flip6 + Smart Washing + Icon Grid  */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Galaxy Flip6 (Col 5) */}
          <div className="lg:col-span-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 p-8 flex flex-col justify-between min-h-[360px] shadow-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Pre-Order Offer
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Samsung Galaxy Flip6
              </h2>
              <p className="text-xs text-slate-600">Galaxy AI powered with zero gap hinge design.</p>
              <Link
                href="/shop"
                className="inline-block px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                Pre-Order →
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80"
              alt="Samsung Flip"
              className="max-h-40 object-contain mx-auto mt-4 drop-shadow-xl"
            />
          </div>

          {/* Card 2: Smart Washing Machine (Col 4) */}
          <div className="lg:col-span-4 rounded-3xl bg-emerald-950 text-white p-8 flex flex-col justify-between min-h-[360px] shadow-md">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Smart Home
              </span>
              <h3 className="text-2xl font-black">AI Washing Machine</h3>
              <p className="text-xs text-slate-300">Intelligent fabric sensor &amp; steam sanitize.</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80"
              alt="Smart Appliance"
              className="max-h-40 object-contain mx-auto mt-4 drop-shadow-xl"
            />
          </div>

          {/* Card 3: 8 Category Grid + Best Deals (Col 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs space-y-4">
            <div>
              <div className="text-xs font-extrabold uppercase text-slate-400 pb-2 border-b border-slate-100">
                Top Categories
              </div>
              <div className="grid grid-cols-4 gap-2 pt-3">
                {[
                  { name: "Mobiles", icon: <Smartphone className="w-4 h-4 text-blue-600" /> },
                  { name: "Laptops", icon: <Laptop className="w-4 h-4 text-purple-600" /> },
                  { name: "Audio", icon: <Headphones className="w-4 h-4 text-rose-600" /> },
                  { name: "TV", icon: <Tv className="w-4 h-4 text-amber-600" /> },
                ].map((cat, i) => (
                  <div key={i} className="text-center p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 transition cursor-pointer">
                    <div className="flex justify-center">{cat.icon}</div>
                    <div className="text-[9px] font-bold text-slate-700 mt-1">{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-rose-600">Deal of the Week</span>
              <div className="font-extrabold text-xs text-slate-900">Apple Watch Ultra 2</div>
              <div className="font-black text-sm text-slate-950">৳89,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. VALUE PROPS STRIP                                           */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-black text-xs">Free Delivery</div>
                <div className="text-[10px] text-slate-400">On orders over ৳2,000</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-black text-xs">Genuine Guarantee</div>
                <div className="text-[10px] text-slate-400">100% authentic tech</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-black text-xs">7-Day Easy Returns</div>
                <div className="text-[10px] text-slate-400">Hassle-free replacement</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="font-black text-xs">24/7 Hotline</div>
                <div className="text-[10px] text-slate-400">01712-345678</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SPLIT SECTION: Left Vertical Banner + 2-Row Product Grid    */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Vertical Urbanears Banner (Col 3) */}
          <div className="lg:col-span-3 rounded-3xl bg-linear-to-b from-sky-400 to-blue-600 text-white p-7 flex flex-col justify-between shadow-md min-h-[460px]">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-white/80">Audio Spotlight</span>
              <h3 className="text-2xl font-black">Alby Urbanears</h3>
              <p className="text-xs text-white/90">True Wireless Earbuds with dual microphones.</p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Shop ৳4,500
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
              alt="Earbuds"
              className="max-h-44 object-contain rounded-2xl mx-auto drop-shadow-xl"
            />
          </div>

          {/* Right 2-Row Products Grid (Col 9) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:shadow-lg transition flex flex-col justify-between space-y-2"
              >
                <div className="space-y-2">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="aspect-square w-full object-cover rounded-xl bg-slate-50"
                  />
                  <div className="font-bold text-xs text-slate-900 line-clamp-2">{product.title}</div>
                  <div className="font-black text-xs text-slate-950">৳{product.price.toLocaleString()}</div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-1.5 bg-slate-950 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 3-CARD FEATURE SPOTLIGHT (Watch Ultra, Armchair, Dyson)     */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              tag: "Wearable Tech",
              title: "Next Level Adventure",
              subtitle: "Apple Watch Ultra 2 with titanium precision case.",
              btn: "Shop Watch",
              img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80",
            },
            {
              tag: "Living Interior",
              title: "Hearth Soft Series",
              subtitle: "Minimalist full-grain genuine leather lounge armchair.",
              btn: "Explore Chair",
              img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
            },
            {
              tag: "Beauty Tech",
              title: "Hair Dryer Blue Blush",
              subtitle: "Supersonic intelligent heat control with styling concentrator.",
              btn: "View Tech",
              img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-rose-600">{card.tag}</span>
                <h3 className="text-lg font-black text-slate-950">{card.title}</h3>
                <p className="text-xs text-slate-500">{card.subtitle}</p>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <Link
                href="/shop"
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs text-center transition block shadow-xs"
              >
                {card.btn} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
