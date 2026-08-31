"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Eye, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useQuickViewStore } from "@/store/useQuickViewStore";
import { formatPrice, calculateDiscount } from "@/lib/formatters";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openQuickView } = useQuickViewStore();
  const [added, setAdded] = React.useState(false);

  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-card-hover transition-shadow duration-300 h-full justify-between",
        className
      )}
    >
      {/* Product Image & Badges Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badge && (
            <Badge
              variant={
                product.badge === "TRENDING"
                  ? "trending"
                  : product.badge === "HOT"
                  ? "hot"
                  : product.badge === "NEW"
                  ? "new"
                  : "default"
              }
              className="text-[9px] sm:text-[10px] px-1.5 py-0.2 sm:px-2 sm:py-0.5"
            >
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-600 text-white shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2 right-2 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10",
            inWishlist
              ? "bg-rose-50 text-rose-600 shadow-sm"
              : "bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500 hover:scale-110 shadow-xs"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", inWishlist ? "fill-rose-600" : "")} />
        </button>

        {/* Quick View Desktop Trigger */}
        <button
          onClick={handleQuickView}
          className="hidden md:flex absolute bottom-2.5 left-1/2 -translate-x-1/2 items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-medium rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 shadow-md"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <div className="text-[11px] font-medium text-teal-700 uppercase tracking-wider mb-1 line-clamp-1">
            {product.category}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.title}
            </Link>
          </h3>

          {/* Star Rating */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Low stock notice */}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-medium text-amber-600">
                ⚡ Only {product.stock} left
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            aria-label="Add to Cart"
            className={cn(
              "p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-200 shrink-0",
              added
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-900 hover:bg-teal-700 text-white shadow-xs hover:shadow-md"
            )}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
