"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Cpu,
  Gamepad2,
  Tv,
  Home,
  Camera,
  Flame,
  Sparkles,
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  ChevronRight,
  Zap,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

// 1. Electronics Hero Bento
export function ElectronicsHeroBento() {
  const sidebarCategories = [
    { name: "Smartphones", icon: <Smartphone className="w-4 h-4" />, slug: "smart-gadgets" },
    { name: "Laptops, Tablets & PCs", icon: <Laptop className="w-4 h-4" />, slug: "desk-setup" },
    { name: "PC Components", icon: <Cpu className="w-4 h-4" />, slug: "desk-setup" },
    { name: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, slug: "smart-gadgets" },
    { name: "Appliances", icon: <Home className="w-4 h-4" />, slug: "home-living" },
    { name: "TV & Audio", icon: <Tv className="w-4 h-4" />, slug: "smart-gadgets" },
    { name: "Home & Outdoor", icon: <Sparkles className="w-4 h-4" />, slug: "home-living" },
    { name: "Cameras", icon: <Camera className="w-4 h-4" />, slug: "smart-gadgets" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Vertical Category Sidebar */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-black tracking-wider uppercase text-slate-400">
            Categories
          </div>
          {sidebarCategories.map((cat) => (
            <Link
              key={cat.name}
              href={`/category/${cat.slug}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition group text-xs font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-blue-600 transition">
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition" />
            </Link>
          ))}
        </div>

        {/* Center Main Hero Banner */}
        <div className="lg:col-span-6 rounded-3xl bg-linear-to-tr from-slate-100 via-blue-50 to-indigo-100 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-blue-100 min-h-[360px]">
          <div className="space-y-2 z-10">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
              VR Innovation
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Unwrap mixed reality <br />
              with <span className="text-blue-600">Meta Quest 3</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-sm">
              Transform your home into an infinite playground with next-gen high-res color passthrough.
            </p>
            <div className="pt-3">
              <Link
                href="/category/smart-gadgets"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80"
            alt="Meta Quest 3"
            className="max-h-48 sm:max-h-56 object-contain self-center z-10 drop-shadow-xl mt-4"
          />
        </div>

        {/* Right Hot Deals Card */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 fill-rose-600" /> Hot Deals
            </span>
            <span className="text-[11px] font-bold text-rose-500">Save 35%</span>
          </div>

          <div className="space-y-2 text-center">
            <div className="font-bold text-sm text-slate-900 line-clamp-1">Only today, 35% discount</div>
            <img
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80"
              alt="Edifier Speaker"
              className="w-36 h-36 mx-auto object-cover rounded-2xl bg-slate-50"
            />
            <div className="font-black text-base text-slate-950">৳4,990</div>
          </div>

          {/* Countdown timer */}
          <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-800 text-xs font-black">
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">14</div>:
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">35</div>:
              <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">59</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 2. Brand Logos Strip
export function BrandLogosStrip() {
  const brandLogos = [
    { name: "Acer", logo: "ACER" },
    { name: "SAMSUNG", logo: "SAMSUNG" },
    { name: "AOC", logo: "AOC" },
    { name: "Apple", logo: " Apple" },
    { name: "ASUS", logo: "ASUS" },
    { name: "BenQ", logo: "BenQ" },
    { name: "BOSE", logo: "BOSE" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 items-center justify-center text-center">
          {brandLogos.map((b) => (
            <div
              key={b.name}
              className="text-slate-400 hover:text-slate-900 font-black text-sm tracking-wider uppercase transition cursor-pointer"
            >
              {b.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. Bestsellers Category Tabs
export function BestsellersCategoryTabs() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<string>("smartphones");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Bestsellers in Category</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "smartphones", label: "Smartphones" },
            { key: "laptops", label: "Laptops & PCs" },
            { key: "audio", label: "Audio & Sound" },
            { key: "gaming", label: "Gaming" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === tab.key
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {products
          .filter((p) => p.status !== "DRAFT")
          .slice(0, 12)
          .map((product) => {
            const inWishlist = isInWishlist(product.id);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-lg transition space-y-2 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-slate-500 hover:text-rose-500 transition"
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-2">{product.title}</div>
                <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{product.rating || 4.9}</span>
                </div>
                <div className="font-black text-xs text-slate-950">৳{product.price.toLocaleString()}</div>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// 4. AirPods Promo Banner
export function AirpodsPromoBanner() {
  const { products } = useProductStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase">
              Special Tech Deal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">AirPods Pro (2nd Gen)</h3>
            <p className="text-xs text-slate-300">
              Active Noise Cancellation with Adaptive Audio and USB-C MagSafe Case.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block px-5 py-2.5 rounded-full bg-white text-slate-950 text-xs font-black hover:bg-slate-100 shadow-md"
              >
                Buy Now — ৳24,500
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 hover:border-blue-400 bg-slate-900/60 hover:bg-slate-900 transition"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-xl bg-slate-800 border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">{item.title}</div>
                  <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{item.rating || 4.9}</span>
                  </div>
                  <div className="font-black text-xs text-blue-400">৳{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 5. Gaming Spotlight
export function GamingSpotlight() {
  const { products } = useProductStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Popular in Gaming</h2>
        <Link href="/category/smart-gadgets" className="text-xs font-bold text-blue-600 hover:underline">
          All Gaming →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {products
          .filter((p) => p.status !== "DRAFT")
          .slice(0, 6)
          .map((product) => (
            <div
              key={product.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-lg transition space-y-2 flex flex-col justify-between"
          >
            <img
              src={product.images[0]}
              alt={product.title}
              className="aspect-square w-full object-cover rounded-xl bg-slate-50"
            />
            <div className="font-bold text-xs text-slate-900 truncate">{product.title}</div>
            <div className="font-black text-xs text-slate-950">৳{product.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
