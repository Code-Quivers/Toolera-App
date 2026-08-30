"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Flame,
  ArrowRight,
  Droplets,
  Award,
  Layers,
  Compass,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

// ==========================================
// 1. SUPERMARKET MEGA THEME SECTIONS
// ==========================================
export function SupermarketHeroSplit() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-linear-to-br from-rose-500 to-amber-500 text-white p-7 flex flex-col justify-between shadow-lg min-h-[300px]">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
              Daily Grocery Fresh
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Organic Fresh Produce</h2>
            <p className="text-xs text-white/90">Direct from local farms to your kitchen.</p>
          </div>
          <Link href="/shop" className="inline-block px-5 py-2.5 bg-white text-rose-600 rounded-full font-black text-xs shadow-md hover:bg-rose-50 w-fit">
            Shop Fresh Produce →
          </Link>
        </div>

        <div className="rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 text-white p-7 flex flex-col justify-between shadow-lg min-h-[300px]">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
              Smart Cleaning
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Household Essentials</h2>
            <p className="text-xs text-white/90">Bulk discounts on detergents & paper goods.</p>
          </div>
          <Link href="/shop" className="inline-block px-5 py-2.5 bg-white text-emerald-700 rounded-full font-black text-xs shadow-md hover:bg-emerald-50 w-fit">
            Explore Deals →
          </Link>
        </div>

        <div className="rounded-3xl bg-linear-to-br from-indigo-700 to-purple-800 text-white p-7 flex flex-col justify-between shadow-lg min-h-[300px]">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
              Fast Express
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">1-Hour Dhaka Delivery</h2>
            <p className="text-xs text-white/90">Free delivery on orders over ৳1,500.</p>
          </div>
          <Link href="/shop" className="inline-block px-5 py-2.5 bg-white text-indigo-800 rounded-full font-black text-xs shadow-md hover:bg-indigo-50 w-fit">
            Order Express →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function GroceryDealOfTheDay() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Daily Best Deals</h2>
        <Link href="/shop" className="text-xs font-bold text-emerald-600 hover:underline">
          View All Items →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products
          .filter((p) => p.status !== "DRAFT")
          .slice(0, 8)
          .map((product) => (
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
              className="w-full py-1.5 bg-slate-950 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 2. BEAUTY & COSMETICS THEME SECTIONS
// ==========================================
export function BeautyHeroFloral() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-rose-100 via-pink-50 to-amber-50 p-8 sm:p-14 border border-rose-100 shadow-xl flex flex-col md:flex-row items-center justify-between">
        <div className="space-y-4 max-w-lg z-10">
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
            100% Organic Botanical Skincare
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 leading-tight">
            Nourish Your Skin <br />
            <span className="italic text-rose-600 font-normal">With Pure Nature</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Clean, cruelty-free formulas crafted with antioxidant-rich plant botanicals.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
            >
              <span>Explore Skincare Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
          alt="Beauty Care"
          className="w-72 sm:w-96 rounded-2xl object-cover shadow-2xl mt-6 md:mt-0"
        />
      </div>
    </section>
  );
}

export function BeautyIngredients3Step() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Pure Sourcing</span>
          <h2 className="text-2xl font-serif text-slate-900">How We Formulate Pure Beauty</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white mx-auto flex items-center justify-center font-black">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Cold-Pressed Botanicals</h3>
            <p className="text-xs text-slate-500">Extracted without heat to preserve bioactive vitamins.</p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white mx-auto flex items-center justify-center font-black">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Zero Harmful Toxins</h3>
            <p className="text-xs text-slate-500">Free of parabens, sulfates, synthetic dyes, and silicones.</p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white mx-auto flex items-center justify-center font-black">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Dermatologist Tested</h3>
            <p className="text-xs text-slate-500">Clinically evaluated for hypoallergenic & sensitive skin.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BeautyBentoCollage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end p-8 bg-slate-900 text-white">
          <img
            src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
            alt="Hydrating Serums"
            className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition duration-500"
          />
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-serif">Hydrating Hyaluronic Serums</h3>
            <p className="text-xs text-slate-200">Plump, deeply hydrated skin in 7 days.</p>
            <Link href="/shop" className="inline-block px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold">
              Shop Serums →
            </Link>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end p-8 bg-slate-900 text-white">
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
            alt="Facial Oils"
            className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition duration-500"
          />
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-serif">Organic Rosehip Glow Oils</h3>
            <p className="text-xs text-slate-200">Restorative bedtime nourishment for radiance.</p>
            <Link href="/shop" className="inline-block px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold">
              Shop Oils →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 3. MINIMALIST FURNITURE THEME SECTIONS
// ==========================================
export function FurnitureHeroMountain() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="relative rounded-3xl overflow-hidden min-h-[460px] flex flex-col justify-center p-8 sm:p-16 bg-[#1A1A1A] text-white">
        <img
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80"
          alt="Minimalist Living"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-widest uppercase">
            Architectural Living
          </span>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight">
            Minimalist Form. <br />
            <span className="font-serif italic font-normal">Enduring Comfort.</span>
          </h1>
          <p className="text-xs text-slate-300">
            Handcrafted solid teak, Italian top-grain leather, and seamless ergonomic silhouettes.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs shadow-xl hover:bg-slate-100 transition"
            >
              Explore Living Room Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FurnitureBrandLogos() {
  const furnitureLogos = ["ALESSI", "Kartell", "FLOS", "HAY", "Cassina", "B&B ITALIA"];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center text-center">
          {furnitureLogos.map((brand) => (
            <div key={brand} className="text-slate-400 font-serif font-bold text-sm tracking-widest uppercase">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FurnitureRoomCategories() {
  const rooms = [
    { title: "Living Room", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80", count: "24 items" },
    { title: "Dining & Kitchen", img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80", count: "16 items" },
    { title: "Workspace & Office", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80", count: "18 items" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Shop by Room</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link
            key={room.title}
            href="/shop"
            className="group relative rounded-3xl overflow-hidden aspect-4/3 flex items-end p-6 bg-slate-900 text-white shadow-md"
          >
            <img
              src={room.img}
              alt={room.title}
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
            />
            <div className="relative z-10">
              <h3 className="text-lg font-bold">{room.title}</h3>
              <p className="text-xs text-slate-300">{room.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 4. FASHION & LIFESTYLE THEME SECTIONS
// ==========================================
export function FashionHeroEditorial() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[460px] flex flex-col md:flex-row items-center justify-between p-8 sm:p-14 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt="Fashion Lookbook"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 max-w-md space-y-4">
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
            Autumn / Winter Lookbook
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            ELEVATE YOUR <br />
            <span className="text-amber-400">EVERYDAY STYLE</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Timeless tailoring, minimalist streetwear silhouettes, and premium fabrics.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-full bg-white text-slate-950 font-black text-xs shadow-xl hover:bg-slate-100 transition"
            >
              Shop New Collection →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FashionGenderTabs() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();
  const [gender, setGender] = useState<"women" | "men">("women");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Season Picks</h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
          <button
            onClick={() => setGender("women")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              gender === "women" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500"
            }`}
          >
            Women
          </button>
          <button
            onClick={() => setGender("men")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              gender === "men" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500"
            }`}
          >
            Men
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {products
          .filter((p) => p.status !== "DRAFT")
          .slice(0, 8)
          .map((p) => (
          <div key={p.id} className="group flex flex-col justify-between space-y-3">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={p.images[0]}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <button
                onClick={() => addToCart(p)}
                className="absolute bottom-3 left-3 right-3 py-2 bg-slate-950/90 backdrop-blur-xs hover:bg-rose-600 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition duration-200"
              >
                Quick Add • ৳{p.price.toLocaleString()}
              </button>
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 line-clamp-1">{p.title}</div>
              <div className="font-black text-xs text-slate-950">৳{p.price.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
