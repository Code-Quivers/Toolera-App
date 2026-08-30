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
  Headphones,
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

export function ElectronicsMarketplaceTheme() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<string>("smartphones");

  const brandLogos = [
    { name: "Acer", logo: "ACER" },
    { name: "SAMSUNG", logo: "SAMSUNG" },
    { name: "AOC", logo: "AOC" },
    { name: "Apple", logo: " Apple" },
    { name: "ASUS", logo: "ASUS" },
    { name: "BenQ", logo: "BenQ" },
    { name: "BOSE", logo: "BOSE" },
  ];

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
    <div className="space-y-12 pb-16 bg-[#FAFAFC]">
      {/* ============================================================== */}
      {/* 1. HERO SECTION: Category Sidebar + Meta Quest 3 Banner + Hot Deals */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Vertical Category Sidebar (Col 3) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs justify-between">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                Categories
              </div>
              {sidebarCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-blue-600 transition">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 px-2">
              <Link
                href="/shop"
                className="flex items-center justify-between text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Center Main Hero Banner: Meta Quest 3 (Col 6) */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden bg-linear-to-br from-indigo-50 via-slate-100 to-blue-50 border border-slate-200/80 p-8 sm:p-10 flex flex-col justify-between shadow-xs min-h-[380px]">
            <div className="space-y-3 z-10 max-w-md">
              <span className="inline-flex px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-wide uppercase shadow-xs">
                VR Innovation
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                Unwrap mixed reality with <span className="text-blue-600">Meta Quest 3</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Transform your home into an infinite playground with next-gen high-res color passthrough.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition transform hover:scale-105 active:scale-95"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Central VR Headset Mockup */}
            <div className="relative mt-4 flex justify-center items-center">
              <img
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=700&q=80"
                alt="Meta Quest 3"
                className="max-h-48 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 rounded-2xl"
              />
            </div>

            {/* Sub-nav quick pills */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 text-[11px] font-bold text-slate-600 z-10">
              <span className="hover:text-blue-600 cursor-pointer">Surface Laptop</span>
              <span>•</span>
              <span className="hover:text-blue-600 cursor-pointer">Galaxy Fold 7 | Flip 7</span>
              <span>•</span>
              <span className="hover:text-blue-600 cursor-pointer">Meta Quest 3</span>
            </div>
          </div>

          {/* Right Hot Deal Card: Soundbox Deal with Live Countdown (Col 3) */}
          <div className="lg:col-span-3 bg-linear-to-b from-amber-50/60 to-white rounded-3xl p-6 border border-amber-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>Hot Deals</span>
                </span>
                <span className="text-[10px] font-extrabold text-rose-600 uppercase">Save 35%</span>
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                Only today, 35% discount
              </div>

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80"
                  alt="Acoustic Speakers"
                  className="object-contain max-h-36 hover:scale-105 transition-transform"
                />
              </div>

              <div className="space-y-1 pt-1">
                <div className="font-bold text-xs text-slate-900 truncate">
                  Audioengine A2+ Wireless
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] text-slate-400 font-bold ml-1">(4.9)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-slate-950">৳24,500</span>
                  <span className="text-xs text-slate-400 line-through">৳36,000</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => products[0] && addToCart(products[0])}
              className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Claim Deal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. TECH BRAND LOGO STRIP (Acer, Asus, Apple, AOC, BenQ, Bose) */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-4 items-center justify-items-center opacity-70 hover:opacity-100 transition-opacity">
            {brandLogos.map((b, idx) => (
              <div
                key={idx}
                className="font-black text-sm sm:text-base text-slate-500 tracking-wider hover:text-blue-600 transition cursor-pointer"
              >
                {b.logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. BESTSELLERS IN CATEGORY (Multi-Tab Multi-Column Grid)        */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Bestsellers in Category
          </h2>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["smartphones", "tablets", "watches", "laptops"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 6-Column Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {products.slice(0, 12).map((product) => {
            const inWishlist = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition ${
                        inWishlist
                          ? "bg-rose-50 text-rose-600"
                          : "bg-white/80 text-slate-400 hover:text-rose-600"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {product.categorySlug}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-blue-600 transition block"
                    >
                      {product.title}
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-950">৳{product.price.toLocaleString()}</div>
                    {product.compareAtPrice && (
                      <div className="text-[10px] text-slate-400 line-through">
                        ৳{product.compareAtPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white transition shadow-2xs"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. LIMITED OFFERS: AirPods Pro Banner + Stacked Deals List     */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">Limited Offers!</h2>
              <p className="text-xs text-slate-500">Hurry up! Deal expires in limited countdown.</p>
            </div>
            {/* Live Countdown Box */}
            <div className="flex items-center gap-2 text-xs font-mono font-black">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-white">09d</div>
              <span>:</span>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-white">14h</div>
              <span>:</span>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-white">42m</div>
              <span>:</span>
              <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white">18s</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Big AirPods Banner */}
            <div className="lg:col-span-5 relative rounded-2xl bg-slate-950 text-white p-8 overflow-hidden min-h-[300px] flex flex-col justify-between">
              <div className="space-y-2 z-10">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  All Wireless Connection
                </span>
                <h3 className="text-2xl sm:text-3xl font-black">AirPods Pro 3</h3>
                <p className="text-xs text-slate-300">Active Noise Cancellation with Transparency Mode.</p>
                <div className="pt-3">
                  <Link
                    href="/shop"
                    className="inline-flex px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    View Offer
                  </Link>
                </div>
              </div>

              <div className="relative mt-4 flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=500&q=80"
                  alt="AirPods"
                  className="max-h-36 object-contain rounded-xl drop-shadow-xl"
                />
              </div>
            </div>

            {/* Right 2x2 Mini Deals List */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition"
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{item.title}</div>
                    <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{item.rating || 4.9}</span>
                    </div>
                    <div className="font-black text-xs text-slate-950">৳{item.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. POPULAR IN GAMING                                            */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-950">Popular in Gaming</h2>
          <Link href="/category/smart-gadgets" className="text-xs font-bold text-blue-600 hover:underline">
            All Gaming →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {products.slice(2, 8).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-lg transition space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="aspect-square w-full object-cover rounded-xl bg-slate-50"
                />
                <div className="font-bold text-xs text-slate-900 line-clamp-2">{product.title}</div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-black text-xs text-slate-950">৳{product.price.toLocaleString()}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. USEFUL ARTICLES & GUIDES (4-Card Blog Grid)                  */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-black text-slate-950">Useful Articles</h2>
          <Link href="/pages/about-us" className="text-xs font-bold text-blue-600 hover:underline">
            All Articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Review of the new MacBook Pro on M3 Pro chips",
              date: "14 Oct",
              tag: "Tech Guide",
              image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
            },
            {
              title: "What's New in PlayStation 5 Slim and Colors",
              date: "18 Oct",
              tag: "Gaming",
              image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80",
            },
            {
              title: "Top 5 Most Powerful Vertical Vacuum Cleaners",
              date: "20 Oct",
              tag: "Appliances",
              image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=500&q=80",
            },
            {
              title: "How do I share Apple AirTag with other users?",
              date: "27 Oct",
              tag: "Tutorial",
              image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
            },
          ].map((art, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition space-y-3 p-3 flex flex-col justify-between"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold">
                  {art.date}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-blue-600">{art.tag}</span>
                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                  {art.title}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                Read Full Guide →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. SEO STORE DESCRIPTION & VALUE PROPS                         */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="font-black text-sm sm:text-base text-slate-900">
            Online store of modern household appliances and electronics
          </h3>
          <p>
            Welcome to the premier curated electronics &amp; viral tech destination in Bangladesh. We bring you genuine gadgets, authentic accessories, smart home automation, and desktop workspace essentials backed by cash on delivery nationwide.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">Nationwide Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-slate-800">7-Day Replacement Policy</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Official Brand Warranty</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
