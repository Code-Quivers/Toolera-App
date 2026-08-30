"use client";

import React, { useMemo } from "react";
import { Product, ProductVariant, ProductVariationItem, ProductAttributeConfig, AttributeType } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Zap, AlertCircle, Ban } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

interface VariantSelectorProps {
  product?: Product;
  selectedAttributes?: Record<string, string>;
  onSelectAttribute?: (attrName: string, valueName: string) => void;
  // Legacy or Direct Variation callbacks
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  onSelect?: (variant: ProductVariant) => void;
}

export function VariantSelector({
  product,
  selectedAttributes = {},
  onSelectAttribute,
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  // Check if product uses modern generic attributes & variations
  const isGenericVariable =
    product &&
    product.productAttributes &&
    product.productAttributes.length > 0 &&
    product.productVariations &&
    product.productVariations.length > 0;

  // Generic Variable Product rendering
  if (isGenericVariable && product && product.productAttributes && product.productVariations) {
    const variationAttributes = product.productAttributes.filter(
      (a) => a.usedForVariations && a.values.length > 0
    );

    if (variationAttributes.length === 0) return null;

    return (
      <div className="space-y-5 pt-2 border-t border-slate-100">
        {variationAttributes.map((attr) => {
          const selectedValue = selectedAttributes[attr.name] || attr.values[0]?.name;

          return (
            <div key={attr.id || attr.name} className="space-y-2.5">
              {/* Attribute Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#008B47]" />
                  <span>{attr.name}:</span>
                </span>
                {selectedValue && (
                  <span className="text-slate-900 font-extrabold bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
                    {selectedValue}
                  </span>
                )}
              </div>

              {/* Attribute Values by Type */}
              {/* 1. COLOR SWATCHES */}
              {attr.type === "COLOR" && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {attr.values.map((val) => {
                    const isSelected = selectedValue === val.name;

                    // Smart Availability Check:
                    // Check if there is an active in-stock variation with this candidate value
                    const matchingVars = product.productVariations?.filter((v) => {
                      if (v.status !== "ACTIVE") return false;
                      const hasThisVal = v.attributes.some(
                        (a) => a.attributeName === attr.name && a.valueName === val.name
                      );
                      if (!hasThisVal) return false;

                      // Check other currently selected attributes
                      for (const [otherAttr, otherVal] of Object.entries(selectedAttributes)) {
                        if (otherAttr !== attr.name) {
                          const matchesOther = v.attributes.some(
                            (a) => a.attributeName === otherAttr && a.valueName === otherVal
                          );
                          if (!matchesOther) return false;
                        }
                      }
                      return true;
                    });

                    const isAvailable = (matchingVars?.length || 0) > 0;
                    const isOutOfStock = isAvailable && matchingVars?.every((v) => v.stock === 0);

                    return (
                      <button
                        key={val.id || val.name}
                        type="button"
                        disabled={!isAvailable || isOutOfStock}
                        onClick={() => onSelectAttribute && onSelectAttribute(attr.name, val.name)}
                        className={cn(
                          "group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs focus:outline-none",
                          isSelected
                            ? "border-[#008B47] bg-emerald-50/80 text-[#008B47] ring-2 ring-[#008B47]/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          !isAvailable || isOutOfStock
                            ? "opacity-40 cursor-not-allowed line-through bg-slate-100 text-slate-400"
                            : ""
                        )}
                      >
                        {val.colorHex && (
                          <span
                            className={cn(
                              "w-4 h-4 rounded-full border border-slate-300 shadow-inner shrink-0 transition-transform group-hover:scale-110",
                              isSelected && "ring-2 ring-[#008B47] ring-offset-1"
                            )}
                            style={{ backgroundColor: val.colorHex }}
                          />
                        )}
                        <span>{val.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#008B47] shrink-0" />}
                        {isOutOfStock && <span className="text-[9px] text-rose-500 font-semibold">(Out)</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. BUTTON / PILL (For Size, Wattage, Voltage, Storage, Capacity) */}
              {attr.type === "BUTTON" && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {attr.values.map((val) => {
                    const isSelected = selectedValue === val.name;

                    const matchingVars = product.productVariations?.filter((v) => {
                      if (v.status !== "ACTIVE") return false;
                      const hasThisVal = v.attributes.some(
                        (a) => a.attributeName === attr.name && a.valueName === val.name
                      );
                      if (!hasThisVal) return false;

                      for (const [otherAttr, otherVal] of Object.entries(selectedAttributes)) {
                        if (otherAttr !== attr.name) {
                          const matchesOther = v.attributes.some(
                            (a) => a.attributeName === otherAttr && a.valueName === otherVal
                          );
                          if (!matchesOther) return false;
                        }
                      }
                      return true;
                    });

                    const isAvailable = (matchingVars?.length || 0) > 0;
                    const isOutOfStock = isAvailable && matchingVars?.every((v) => v.stock === 0);

                    return (
                      <button
                        key={val.id || val.name}
                        type="button"
                        disabled={!isAvailable || isOutOfStock}
                        onClick={() => onSelectAttribute && onSelectAttribute(attr.name, val.name)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-xs font-extrabold transition-all shadow-2xs focus:outline-none flex items-center gap-1.5",
                          isSelected
                            ? "border-[#008B47] bg-emerald-50/80 text-[#008B47] ring-2 ring-[#008B47]/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                          !isAvailable || isOutOfStock
                            ? "opacity-40 cursor-not-allowed line-through bg-slate-100 text-slate-400"
                            : ""
                        )}
                      >
                        <span>{val.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#008B47] shrink-0" />}
                        {isOutOfStock && <span className="text-[9px] text-rose-500 font-semibold">(Sold out)</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. IMAGE CARDS (For Design, Pattern, Finish) */}
              {attr.type === "IMAGE" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {attr.values.map((val) => {
                    const isSelected = selectedValue === val.name;

                    return (
                      <button
                        key={val.id || val.name}
                        type="button"
                        onClick={() => onSelectAttribute && onSelectAttribute(attr.name, val.name)}
                        className={cn(
                          "p-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 shadow-2xs focus:outline-none",
                          isSelected
                            ? "border-[#008B47] bg-emerald-50/80 ring-2 ring-[#008B47]/20 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {val.imageUrl ? (
                          <img
                            src={val.imageUrl}
                            alt={val.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-400 text-xs">
                            {val.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className={cn("font-bold text-xs block truncate", isSelected ? "text-[#008B47]" : "text-slate-800")}>
                            {val.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#008B47] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. SELECT DROPDOWN (For Material, Model, etc.) */}
              {(attr.type === "SELECT" || attr.type === "TEXT") && (
                <div className="max-w-xs">
                  <select
                    value={selectedValue}
                    onChange={(e) => onSelectAttribute && onSelectAttribute(attr.name, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#008B47] shadow-2xs"
                  >
                    {attr.values.map((val) => (
                      <option key={val.id || val.name} value={val.name}>
                        {val.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: Legacy flat variants picker if present
  if (!variants || variants.length === 0) return null;

  const active = selectedVariant || variants[0];

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-500">
          Select Option:
        </span>
        <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
          {active?.name}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {variants.map((v) => {
          const isSelected = active?.id === v.id;
          const isOutOfStock = v.stock === 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect && onSelect(v)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-2 relative shadow-2xs",
                isSelected
                  ? "border-[#008B47] bg-emerald-50/70 text-[#008B47] ring-2 ring-[#008B47]/20 shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                isOutOfStock ? "opacity-40 cursor-not-allowed line-through bg-slate-50 text-slate-400" : ""
              )}
            >
              {v.colorHex && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: v.colorHex }}
                />
              )}
              <span>{v.name}</span>
              {v.price > 0 && (
                <span className="text-[10px] text-slate-500 font-normal">
                  ({formatPrice(v.price)})
                </span>
              )}
              {isSelected && <Check className="w-3.5 h-3.5 text-[#008B47] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
