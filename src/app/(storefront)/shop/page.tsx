"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { ProductCard } from "@/components/product/ProductCard";
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, Filter, Heart } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { useWishlistStore } from "@/store/useWishlistStore";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialFilter = searchParams.get("filter") || "all";
  const initialNeed = searchParams.get("need") || "";
  const isWishlistView = searchParams.get("view") === "wishlist";

  const { items: wishlistItems } = useWishlistStore();
  const { products: storeProducts } = useProductStore();
  const { categories } = useCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>("popular");
  const [maxPrice, setMaxPrice] = useState<number>(4500);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let list = isWishlistView
      ? wishlistItems
      : storeProducts.filter((p) => p.status !== "DRAFT");

    // Filter by category
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    // Filter by URL filter param
    if (initialFilter === "trending") {
      list = list.filter((p) => p.isTrending);
    } else if (initialFilter === "new-arrivals") {
      list = list.filter((p) => p.isNewArrival || p.badge === "NEW");
    } else if (initialFilter === "best-sellers") {
      list = list.filter((p) => p.isBestSeller || p.badge === "BEST SELLER");
    }

    // Filter by need collection
    if (initialNeed) {
      list = list.filter((p) => p.needCategory === initialNeed);
    }

    // Filter by price
    list = list.filter((p) => p.price <= maxPrice);

    // Filter by rating
    if (minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    // Filter by stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sorting
    if (selectedSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "newest") {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      // Popular (rating * review count)
      list.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
    }

    return list;
  }, [
    isWishlistView,
    wishlistItems,
    selectedCategory,
    initialFilter,
    initialNeed,
    maxPrice,
    minRating,
    inStockOnly,
    selectedSort,
  ]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setMaxPrice(4500);
    setMinRating(0);
    setInStockOnly(false);
    setSelectedSort("popular");
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {isWishlistView ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="text-rose-600">Saved Items</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Catalog</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isWishlistView ? "My Wishlist" : "Explore All Products"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isWishlistView
              ? "Products you've saved for later. Move them to your cart anytime."
              : "Browse our full collection of China trendy products and lifestyle gadgets."}
          </p>
        </div>

        {/* Action Bar (Filter trigger on mobile + Sort & count on desktop) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <span className="text-xs sm:text-sm font-medium text-slate-600">
              Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> products
            </span>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <label htmlFor="sort" className="text-slate-500 font-medium hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label="Sort products"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-fit sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                Filter Catalog
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Categories
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    selectedCategory === "all"
                      ? "bg-teal-50 text-teal-900 font-bold"
                      : "text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  All Categories ({storeProducts.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex justify-between items-center ${
                      selectedCategory === cat.slug
                        ? "bg-teal-50 text-teal-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {storeProducts.filter((p) => (p.categorySlug && p.categorySlug.toLowerCase() === cat.slug.toLowerCase()) || (p.category && p.category.toLowerCase() === cat.name.toLowerCase())).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                <span>Max Price</span>
                <span className="text-teal-700">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="4500"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>৳500</span>
                <span>৳4,500</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Rating
              </h4>
              <div className="space-y-1 text-xs">
                {[0, 4.5, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      minRating === ratingVal
                        ? "bg-teal-50 text-teal-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {ratingVal === 0 ? "Any Rating" : `★ ${ratingVal} & above`}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No products match your filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your price range, clearing selected categories, or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-bold text-slate-900 text-base">Filter Catalog</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl ${
                      selectedCategory === "all" ? "bg-teal-50 text-teal-900 font-bold" : "text-slate-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl ${
                        selectedCategory === cat.slug ? "bg-teal-50 text-teal-900 font-bold" : "text-slate-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>Max Price</span>
                  <span className="text-teal-700">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4500"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2 text-center text-xs text-slate-500 font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
