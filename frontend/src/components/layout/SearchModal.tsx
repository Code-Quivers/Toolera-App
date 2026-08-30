"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { formatPrice } from "@/lib/formatters";
import { Product } from "@/types";

export function SearchModal() {
  const { isOpen, closeSearch, query, setQuery } = useSearchStore();
  const { products } = useProductStore();
  const { categories } = useCategoryStore();
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = products.filter((product) => {
      if (product.status === "DRAFT") return false;
      return (
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.shortDescription.toLowerCase().includes(q) ||
        product.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
    setResults(filtered);
  }, [query, products]);

  // Keyboard shortcut listener (Cmd/Ctrl + K or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useSearchStore.getState().openSearch();
      }
      if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={closeSearch} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trendy gadgets, desk items, home decor..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === "" ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Popular Categories
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={closeSearch}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded-full text-xs font-medium text-slate-700 transition"
                  >
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Trending Searches
              </div>
              <div className="space-y-1">
                {["Magnetic Desk Lamp", "100-Speed Turbo Fan", "Anti-Gravity Humidifier", "3-in-1 MagSafe Charger"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Products ({results.length})
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-teal-600 font-medium">{product.category}</span>
                    <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-teal-700 transition">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-900">{formatPrice(product.price)}</span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-600 font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for keywords like &ldquo;lamp&rdquo;, &ldquo;fan&rdquo;, &ldquo;desk&rdquo;, or browse our catalog.</p>
              <Link
                href="/shop"
                onClick={closeSearch}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Search curated China trendy products</span>
          <span className="hidden sm:inline">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
