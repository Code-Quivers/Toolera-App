"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Truck, Package, Phone, ArrowRight, MessageSquare, ShieldCheck, Home } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/formatters";
import { siteConfig } from "@/config/site";
import { OrderSummary } from "@/types";
import { useCartStore } from "@/store/useCartStore";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderNumber") || searchParams.get("orderId") || "RM-829104-4912";
  const { clearCart } = useCartStore();

  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    // Instant scroll to top so user sees the order confirmation at the top of the page
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 50);

      const saved =
        sessionStorage.getItem("last_completed_order") ||
        sessionStorage.getItem("last_order_summary");
      if (saved) {
        try {
          setOrder(JSON.parse(saved));
        } catch {
          // fallback
        }
      }
    }

    // Clear cart once order is confirmed and displayed
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16 border-b border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-card mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto text-teal-600 mb-6 shadow-sm animate-bounce-slow">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Order Successfully Placed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            We&apos;ve received your order and our team is preparing it for inspection and dispatch.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
            <span className="text-slate-500">Order Number:</span>
            <strong className="font-mono font-bold text-slate-900">{order?.orderNumber || orderId}</strong>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              <span>Order Summary</span>
            </h2>
            <span className="text-xs text-slate-500">
              Estimated Delivery: <strong>{order?.estimatedDeliveryDate || "1–3 Business Days"}</strong>
            </span>
          </div>

          {/* Purchased Items List */}
          {order?.items && (
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                      <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-1">
                        <span className="font-semibold">Qty: {item.quantity}</span>
                        {(item.selectedVariant?.name || (item as any).variantName) && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-extrabold text-[11px]">
                            {item.selectedVariant?.name || (item as any).variantName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing breakdown */}
          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(order?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Cost</span>
              <span className="font-semibold text-slate-900">
                {order?.shippingCost === 0 ? "FREE" : formatPrice(order?.shippingCost || 0)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Paid / Due</span>
              <span className="text-teal-900 text-lg">{formatPrice(order?.total || 0)}</span>
            </div>
          </div>

          {/* Customer & Address Details */}
          {order?.customer && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-900 text-sm mb-1">Delivery Destination:</div>
              <div><strong>Name:</strong> {order.customer.fullName}</div>
              <div><strong>Phone:</strong> {order.customer.phone}</div>
              <div><strong>Address:</strong> {order.customer.address}, {order.customer.area}, {order.customer.district}</div>
              <div>
                <strong>Payment Method:</strong>{" "}
                <span className="uppercase font-semibold text-teal-700">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
                </span>
              </div>
            </div>
          )}

          {/* WhatsApp Support CTA */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Want to confirm immediately or track your parcel on WhatsApp?
              </span>
            </div>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}?text=Hi%20Raifa's%20Mart,%20I%20just%20placed%20order%20${order?.orderNumber || orderId}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shrink-0"
            >
              Chat on WhatsApp
            </a>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Discover More Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading order summary...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
