"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/formatters";
import { SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, ShieldCheck, Truck, ChevronRight, Tag } from "lucide-react";
import { CouponInput } from "@/components/cart/CouponInput";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
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

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 py-12 text-center text-slate-500">Loading cart...</div>;
  }

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const freeShipping = getFreeShippingProgress();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white rounded-full border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-5 shadow-xs">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h1>
          <p className="text-sm text-slate-500 mt-2 mb-8">
            You haven&apos;t added any trending China products to your cart yet. Explore our curated collections!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm transition shadow-md"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">Shopping Cart</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-slate-500 hover:text-rose-600 font-semibold self-start sm:self-auto transition"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
            <span className="flex items-center gap-2 text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {freeShipping.isEligible ? (
                <span className="text-teal-700 font-bold">You&apos;ve unlocked Free Delivery! 🎉</span>
              ) : (
                <span>
                  Add <strong className="text-slate-900">{formatPrice(freeShipping.remaining)}</strong> more to get Free Delivery across Bangladesh!
                </span>
              )}
            </span>
            <span className="text-slate-500 font-mono text-xs">{freeShipping.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShipping.isEligible ? "bg-teal-500" : "bg-teal-600"
              }`}
              style={{ width: `${freeShipping.percentage}%` }}
            />
          </div>
        </div>

        {/* 2-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-teal-700 transition line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {item.selectedVariant && (
                      <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">
                        {item.selectedVariant.name}
                      </span>
                    )}
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {formatPrice(item.price)} each
                    </div>
                  </div>
                </div>

                {/* Quantity adjuster, total & remove button */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-slate-600 hover:text-slate-900 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-slate-600 hover:text-slate-900 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline"
              >
                <span>← Continue Discovering More Products</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Coupon Code Box */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Have a Promo Code?
                </label>
                <CouponInput />
              </div>

              {/* Calculation lines */}
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
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
                      <strong className="text-emerald-700 font-bold">FREE Delivery</strong>
                    ) : (
                      <span className="text-slate-500 font-medium">Calculated at checkout</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-teal-900">{formatPrice(Math.max(0, subtotal - getDiscountAmount()))}</span>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  * Shipping method (Inside/Outside Dhaka) is selected at checkout.
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 px-6 bg-slate-900 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust badges */}
              <div className="pt-2 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Cash on Delivery available all over Bangladesh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Inspected before packing &amp; fast doorstep dispatch</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
