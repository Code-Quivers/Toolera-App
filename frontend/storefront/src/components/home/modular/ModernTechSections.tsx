"use client";

import React from "react";
import Link from "next/link";
import { Star, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCartStore } from "@/store/useCartStore";

export function ModernTechHeroBento() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const hero = products.find(p => p.status !== "DRAFT") || null;
  const second = products.filter(p => p.status !== "DRAFT")[1] || null;
  const shopLink = categories[0] ? `/category/${categories[0].slug}` : "/shop";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 rounded-3xl bg-slate-950 text-white p-8 sm:p-12 flex flex-col justify-between min-h-[380px] relative overflow-hidden shadow-2xl">
          <div className="space-y-3 z-10 max-w-md">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] tracking-wider uppercase">
              Featured Product
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {hero ? (hero.title || hero.name) : "Our Best Products"}
            </h1>
            <p className="text-xs text-slate-400">
              {hero
                ? `Starting from ৳${hero.price.toLocaleString()} — premium quality, fast delivery.`
                : "Browse our full collection of hand-picked products."}
            </p>
            <div className="pt-2">
              <Link
                href={hero ? `/product/${hero.slug}` : shopLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition"
              >
                {hero ? `Shop Now — ৳${hero.price.toLocaleString()}` : "Browse Store"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          {hero?.images?.[0] ? (
            <img
              src={hero.images[0]}
              alt={hero.title || hero.name}
              className="absolute -right-10 -bottom-10 w-80 sm:w-96 object-contain opacity-80 lg:opacity-100 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute -right-10 -bottom-10 w-80 sm:w-96 flex items-end justify-center opacity-20">
              <ShoppingBag className="w-64 h-64" />
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {second ? (
            <>
              <div className="space-y-2 z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-300 text-[10px] font-bold">
                  {second.categorySlug || "Featured"}
                </span>
                <h3 className="text-2xl font-black">{second.title || second.name}</h3>
                <p className="text-xs text-slate-300">৳{second.price.toLocaleString()}</p>
              </div>
              {second.images?.[0] ? (
                <img
                  src={second.images[0]}
                  alt={second.title || second.name}
                  className="max-h-40 object-contain rounded-2xl mx-auto drop-shadow-2xl my-2"
                />
              ) : (
                <div className="max-h-40 flex items-center justify-center my-2">
                  <ShoppingBag className="w-20 h-20 text-white/20" />
                </div>
              )}
              <Link
                href={`/product/${second.slug}`}
                className="text-center w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              >
                View Product
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <ShoppingBag className="w-16 h-16 text-white/20" />
              <p className="text-xs text-slate-400">More products coming soon</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function RoundCategoriesStrip() {
  const { categories } = useCategoryStore();

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-md transition group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 group-hover:border-blue-500 transition bg-slate-50 flex items-center justify-center">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
              ) : (
                <Tag className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">{cat.name}</div>
            {cat.productCount != null && (
              <div className="text-[11px] text-slate-400">{cat.productCount} items</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TheBestOffers() {
  const { products } = useProductStore();
  const { addItem: addToCart } = useCartStore();

  const offers = products.filter(p => p.status !== "DRAFT").slice(0, 5);
  if (offers.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-black text-slate-950">The Best Offers</h2>
        <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
          View All Offers →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {offers.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title || p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-200" />
                  </div>
                )}
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-2">{p.title || p.name}</div>
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
  const { categories } = useCategoryStore();

  const spotlight = products.find(p => p.status !== "DRAFT") || null;
  const grid = products.filter(p => p.status !== "DRAFT").slice(1, 5);
  const shopLink = categories[0] ? `/category/${categories[0].slug}` : "/shop";

  if (!spotlight && grid.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 rounded-3xl bg-slate-950 text-white p-7 flex flex-col justify-between min-h-[360px] shadow-lg relative overflow-hidden">
          <div className="space-y-2 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              Exclusive
            </span>
            <h3 className="text-2xl font-black">{spotlight ? (spotlight.title || spotlight.name) : "Our Best Pick"}</h3>
            <p className="text-xs text-slate-400">
              {spotlight ? `৳${spotlight.price.toLocaleString()} — premium quality guaranteed.` : "Explore our store."}
            </p>
            <div className="pt-2">
              <Link
                href={spotlight ? `/product/${spotlight.slug}` : shopLink}
                className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500"
              >
                {spotlight ? "Order Now" : "Browse Store"}
              </Link>
            </div>
          </div>
          {spotlight?.images?.[0] ? (
            <img
              src={spotlight.images[0]}
              alt={spotlight.title || spotlight.name}
              className="max-h-44 object-contain rounded-xl mx-auto drop-shadow-2xl hover:scale-105 transition-transform"
            />
          ) : (
            <div className="max-h-44 flex items-center justify-center opacity-20">
              <ShoppingBag className="w-28 h-28" />
            </div>
          )}
        </div>

        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {grid.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 hover:shadow-lg transition flex flex-col justify-between space-y-2"
            >
              <div className="space-y-2">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title || p.name}
                    className="aspect-square w-full object-cover rounded-xl bg-slate-50"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{p.title || p.name}</div>
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
