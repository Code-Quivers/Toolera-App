"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useQuickViewStore } from "@/store/useQuickViewStore";
import { useCartStore } from "@/store/useCartStore";
import { ProductVariant } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/formatters";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { VariantSelector } from "./VariantSelector";

export function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string>("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedVariant(product.variants?.[0]);
      setActiveImage(product.images[0]);

      // Initialize selected attributes
      const map: Record<string, string> = {};
      if (product.productAttributes && product.productAttributes.length > 0) {
        if (product.defaultVariationId && product.productVariations) {
          const defaultVar = product.productVariations.find((v) => v.id === product.defaultVariationId);
          if (defaultVar) {
            defaultVar.attributes.forEach((a) => {
              map[a.attributeName] = a.valueName;
            });
          }
        }
        if (Object.keys(map).length === 0) {
          product.productAttributes.forEach((attr) => {
            if (attr.usedForVariations && attr.values.length > 0) {
              map[attr.name] = attr.values[0].name;
            }
          });
        }
      }
      setSelectedAttributes(map);
    }
  }, [product]);

  // Find active variation matching currently selected attributes
  const activeVariation = React.useMemo(() => {
    if (!product?.productVariations || product.productVariations.length === 0) return undefined;
    return product.productVariations.find((v) => {
      if (v.status !== "ACTIVE") return false;
      return v.attributes.every((a) => selectedAttributes[a.attributeName] === a.valueName);
    });
  }, [product?.productVariations, selectedAttributes]);

  const handleSelectAttribute = (attrName: string, valueName: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: valueName,
    }));
  };

  useEffect(() => {
    if (activeVariation?.image) {
      setActiveImage(activeVariation.image);
    }
  }, [activeVariation]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const currentPrice = activeVariation
    ? activeVariation.price
    : selectedVariant
    ? selectedVariant.price
    : product.price;

  const comparePrice = activeVariation
    ? activeVariation.compareAtPrice || activeVariation.price
    : selectedVariant?.compareAtPrice || product.compareAtPrice;

  const discount = calculateDiscount(currentPrice, comparePrice);

  const currentStock = activeVariation
    ? activeVariation.stock
    : selectedVariant
    ? selectedVariant.stock
    : product.stock;

  const handleAddToCart = () => {
    const variantPayload: ProductVariant | undefined = activeVariation
      ? {
          id: activeVariation.id,
          name: activeVariation.attributes.map((a) => a.valueName).join(" / "),
          sku: activeVariation.sku || product.sku,
          price: activeVariation.price,
          compareAtPrice: activeVariation.compareAtPrice,
          stock: activeVariation.stock,
          image: activeVariation.image,
        }
      : selectedVariant;

    addItem(product, quantity, variantPayload);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      closeQuickView();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeQuickView} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Images */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200">
            <Image
              src={activeImage || product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
            {product.badge && (
              <div className="absolute top-3 left-3">
                <Badge variant="trending">{product.badge}</Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    activeImage === img ? "border-teal-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                {product.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
                {product.title}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> In Stock ({currentStock})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(currentPrice)}
              </span>
              {comparePrice > currentPrice && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(comparePrice)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variant selector */}
            <VariantSelector
              product={product}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={handleSelectAttribute}
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quantity
              </div>
              <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-600 hover:text-slate-900 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="p-2 text-slate-600 hover:text-slate-900 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-teal-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Cart • {formatPrice(currentPrice * quantity)}</span>
                </>
              )}
            </button>

            <Link
              href={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="w-full py-2 text-center text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-center gap-1 group"
            >
              <span>View Full Product Details & Specs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
