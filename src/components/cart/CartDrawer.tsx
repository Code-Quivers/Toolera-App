"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/formatters";
import { SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { ShippingOption } from "@/types";
import { CouponInput } from "@/components/cart/CouponInput";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getDiscountAmount,
    getTotal,
    selectedShipping,
    setShippingOption,
    getFreeShippingProgress,
    appliedCoupon,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!mounted || !isDrawerOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const freeShipping = getFreeShippingProgress();

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {freeShipping.isEligible ? (
                <span className="text-teal-700 font-bold">You&apos;ve unlocked Free Delivery! 🎉</span>
              ) : (
                <span>
                  Add <strong className="text-slate-900">{formatPrice(freeShipping.remaining)}</strong> more for Free Delivery
                </span>
              )}
            </span>
            <span className="text-slate-500 font-mono">{freeShipping.percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShipping.isEligible ? "bg-teal-500" : "bg-teal-600"
              }`}
              style={{ width: `${freeShipping.percentage}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                Looks like you haven&apos;t added any smart gadgets or trending finds yet.
              </p>
              <button
                onClick={closeDrawer}
                className="px-6 py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
              >
                {/* Item Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="text-xs font-semibold text-slate-900 hover:text-teal-700 transition line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {item.selectedVariant.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3.5">
            {/* Coupon Code Input */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <CouponInput compact />
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && getDiscountAmount() > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <strong className="text-emerald-700 font-bold">FREE</strong>
                  ) : (
                    <span className="text-slate-500 font-medium">Calculated at checkout</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-base text-teal-900">{formatPrice(Math.max(0, subtotal - getDiscountAmount()))}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-teal-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 block"
              >
                View Full Cart Page
              </Link>
            </div>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Cash on Delivery Available • Easy 7-Day Returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
