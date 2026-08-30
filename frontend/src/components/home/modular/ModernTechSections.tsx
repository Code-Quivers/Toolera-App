"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

export function ModernTechHeroBento() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 rounded-3xl bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between min-h-[380px] relative overflow-hidden shadow-2xl">
          <div className="space-y-3 z-10 max-w-md">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-wider uppercase">
              Apple Shopping Event
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              MacBook Pro <br />
              <span className="text-blue-500">M3 Max Chip</span>
            </h1>
            <p className="text-xs text-slate-400">
              Mind-blowing performance with up to 22 hours of battery life and Liquid Retina XDR display.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition"
              >
                <span>Buy Now — From ৳185,000</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
            alt="MacBook Pro"
            className="absolute -right-10 -bottom-10 w-80 sm:w-96 object-contain opacity-80 lg:opacity-100 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-2 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-[10px] font-bold">
              Spatial Audio
            </span>
            <h3 className="text-2xl font-black">Sony WH-1000XM5</h3>
            <p className="text-xs text-slate-300">Industry-leading noise cancellation.</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
            alt="Headphones"
            className="max-h-40 object-contain rounded-2xl mx-auto drop-shadow-2xl my-2"
          />
          <Link
            href="/category/smart-gadgets"
            className="text-center w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            Explore XM5 Series
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RoundCategoriesStrip() {
  const roundCategories = [
    { name: "Apple iPhone", count: "14 items", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "MacBook Air", count: "8 items", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80", slug: "desk-setup" },
    { name: "Motherboards", count: "12 items", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80", slug: "desk-setup" },
    { name: "VR Lenses", count: "6 items", img: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
    { name: "Smart Keyboards", count: "10 items", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80", slug: "desk-setup" },
    { name: "Smartwatches", count: "15 items", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80", slug: "smart-gadgets" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {roundCategories.map((c) => (
          <Link
            key={c.name}
            href={`/category/${c.slug}`}
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-md transition group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 group-hover:border-blue-500 transition">
              <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">{c.name}</div>
            <div className="text-[11px] text-slate-400">{c.count}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TheBestOffers() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-black text-slate-950">The Best Offers</h2>
        <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
          View All Offers →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products
          .filter((p) => p.status !== "DRAFT")
          .slice(0, 5)
          .map((p) => (
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
  );
}

export function NothingPhoneSpotlight() {
  const { products } = useProductStore();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{p.title}</div>
                <div className="font-black text-xs text-slate-950">৳{p.price.toLocaleString()}</div>
              </div>
              <Link
                href={`/product/${p.slug}`}
                className="text-center w-full py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold transition"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
