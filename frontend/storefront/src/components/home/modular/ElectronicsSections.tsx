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
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

// Map category name keywords → icon
function categoryIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes("phone") || n.includes("mobile") || n.includes("smart")) return <Smartphone className="w-4 h-4" />;
  if (n.includes("laptop") || n.includes("pc") || n.includes("computer") || n.includes("desk")) return <Laptop className="w-4 h-4" />;
  if (n.includes("gaming") || n.includes("game")) return <Gamepad2 className="w-4 h-4" />;
  if (n.includes("tv") || n.includes("audio") || n.includes("sound") || n.includes("headphone")) return <Tv className="w-4 h-4" />;
  if (n.includes("camera") || n.includes("photo") || n.includes("video")) return <Camera className="w-4 h-4" />;
  if (n.includes("home") || n.includes("appliance") || n.includes("kitchen")) return <Home className="w-4 h-4" />;
  if (n.includes("component") || n.includes("part") || n.includes("cpu") || n.includes("gpu")) return <Cpu className="w-4 h-4" />;
  if (n.includes("fashion") || n.includes("cloth") || n.includes("dress")) return <Sparkles className="w-4 h-4" />;
  return <Tag className="w-4 h-4" />;
}

// 1. Electronics Hero Bento
export function ElectronicsHeroBento() {
  const { categories } = useCategoryStore();
  const { products } = useProductStore();

  // Use first product for the hero or fall back to placeholder
  const heroProduct = products.find(p => p.status !== "DRAFT") || null;
  // Use first category for hero CTA link
  const firstCat = categories[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Vertical Category Sidebar — real DB categories */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-black tracking-wider uppercase text-slate-400">
            Categories
          </div>
          {categories.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">Loading categories…</div>
          ) : (
            categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition group text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 group-hover:text-blue-600 transition">
                    {categoryIcon(cat.name)}
                  </span>
                  <span>{cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition" />
              </Link>
            ))
          )}
          {categories.length > 0 && (
            <Link
              href="/shop"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-bold transition"
            >
              <span>All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Center Main Hero Banner */}
        <div className="lg:col-span-6 rounded-3xl bg-linear-to-tr from-slate-100 via-blue-50 to-indigo-100 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-blue-100 min-h-[360px]">
          <div className="space-y-2 z-10">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
              New Arrivals
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {heroProduct
                ? heroProduct.title || heroProduct.name
                : "Discover Our Latest Collection"}
            </h1>
            <p className="text-xs text-slate-600 max-w-sm">
              {heroProduct
                ? `From ৳${heroProduct.price.toLocaleString()} — shop the best deals`
                : "Browse products from our store, curated just for you."}
            </p>
            <div className="pt-3">
              <Link
                href={heroProduct ? `/product/${heroProduct.slug}` : (firstCat ? `/category/${firstCat.slug}` : "/shop")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {heroProduct?.images?.[0] ? (
            <img
              src={heroProduct.images[0]}
              alt={heroProduct.title || heroProduct.name}
              className="max-h-48 sm:max-h-56 object-contain self-center z-10 drop-shadow-xl mt-4"
            />
          ) : (
            <div className="max-h-48 sm:max-h-56 flex items-center justify-center text-slate-300 mt-4">
              <ShoppingBag className="w-24 h-24" />
            </div>
          )}
        </div>

        {/* Right Hot Deals Card — real products */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 fill-rose-600" /> Hot Deals
            </span>
            {products.length > 0 && (
              <Link href="/shop" className="text-[11px] font-bold text-rose-500 hover:underline">
                View All
              </Link>
            )}
          </div>

          {products.filter(p => p.status !== "DRAFT").slice(1, 4).map(product => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-xl p-1.5 transition"
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title || product.name}
                  className="w-14 h-14 object-cover rounded-xl bg-slate-100 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 line-clamp-2">{product.title || product.name}</div>
                <div className="font-black text-xs text-rose-600 mt-0.5">৳{product.price.toLocaleString()}</div>
              </div>
            </Link>
          ))}

          {products.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-4">Loading products…</div>
          )}
        </div>
      </div>
    </section>
  );
}

// 2. Brand Logos Strip
export function BrandLogosStrip() {
  const { categories } = useCategoryStore();

  // Show categories as a quick-nav strip instead of hardcoded brand logos
  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-slate-500 hover:text-slate-900 font-black text-sm tracking-wider uppercase transition px-3 py-1 rounded-full hover:bg-slate-100"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. Bestsellers Category Tabs — real categories + real products filtered by category
export function BestsellersCategoryTabs() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const tabs = categories.slice(0, 5);
  const [activeTab, setActiveTab] = useState<string>("");

  // Set first tab as default once categories load
  React.useEffect(() => {
    if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0].slug);
  }, [tabs.length]);

  const visibleProducts = products
    .filter(p => p.status !== "DRAFT")
    .filter(p => {
      if (!activeTab) return true;
      return (p.categorySlug || p.category?.slug) === activeTab;
    })
    .slice(0, 12);

  // Fall back to all products when no match for active tab
  const displayProducts = visibleProducts.length > 0
    ? visibleProducts
    : products.filter(p => p.status !== "DRAFT").slice(0, 12);

  if (products.length === 0 && categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Bestsellers by Category</h2>
        <div className="flex flex-wrap gap-2">
          {tabs.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === cat.slug
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {displayProducts.map((product) => {
          const inWishlist = isInWishlist(product.id);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-lg transition space-y-2 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-slate-500 hover:text-rose-500 transition"
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </div>
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="font-bold text-xs text-slate-900 line-clamp-2">{product.title || product.name}</div>
                </Link>
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

      {displayProducts.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">No products yet in this category.</div>
      )}
    </section>
  );
}

// 4. Promo Banner — real products
export function AirpodsPromoBanner() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const featuredProducts = products.filter(p => p.status !== "DRAFT").slice(0, 4);
  const shopLink = categories[0] ? `/category/${categories[0].slug}` : "/shop";

  if (featuredProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase">
              Special Deal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              {featuredProducts[0]?.title || featuredProducts[0]?.name || "Top Products"}
            </h3>
            <p className="text-xs text-slate-300">
              Discover the best products from our store at unbeatable prices.
            </p>
            <div className="pt-2">
              <Link
                href={shopLink}
                className="inline-block px-5 py-2.5 rounded-full bg-white text-slate-950 text-xs font-black hover:bg-slate-100 shadow-md"
              >
                Shop Now — from ৳{Math.min(...featuredProducts.map(p => p.price)).toLocaleString()}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 hover:border-blue-400 bg-slate-900/60 hover:bg-slate-900 transition"
              >
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title || item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-slate-800 border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-slate-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">{item.title || item.name}</div>
                  <div className="flex items-center gap-1 text-amber-400 text-[10px]">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{item.rating || 4.9}</span>
                  </div>
                  <div className="font-black text-xs text-blue-400">৳{item.price.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 5. Products Spotlight — real products
export function GamingSpotlight() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const spotlightProducts = products.filter(p => p.status !== "DRAFT").slice(0, 6);
  const shopLink = categories[0] ? `/category/${categories[0].slug}` : "/shop";

  if (spotlightProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-950">Popular Products</h2>
        <Link href={shopLink} className="text-xs font-bold text-blue-600 hover:underline">
          All Products →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {spotlightProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:shadow-lg transition space-y-2 flex flex-col justify-between"
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title || product.name}
                className="aspect-square w-full object-cover rounded-xl bg-slate-50"
              />
            ) : (
              <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-slate-200" />
              </div>
            )}
            <div className="font-bold text-xs text-slate-900 truncate">{product.title || product.name}</div>
            <div className="font-black text-xs text-slate-950">৳{product.price.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
