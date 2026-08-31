"use client";

import React, { useState } from "react";
import { Tag, CheckCircle2, XCircle, X, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCouponStore } from "@/store/useCouponStore";
import { formatPrice } from "@/lib/formatters";

interface CouponInputProps {
  compact?: boolean;
  className?: string;
}

export function CouponInput({ compact = false, className = "" }: CouponInputProps) {
  const { appliedCoupon, applyCoupon, removeCoupon, getDiscountAmount } = useCartStore();
  const { coupons } = useCouponStore();
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const activeCoupons = coupons.filter((c) => c.active);

  const handleApply = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      setMessage({ text: "Please enter a coupon code.", isError: true });
      return;
    }
    const result = applyCoupon(code);
    setMessage({ text: result.message, isError: !result.success });
    if (result.success) {
      setCouponCode("");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const discountAmount = getDiscountAmount();

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Applied Coupon Banner */}
      {appliedCoupon ? (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-black text-xs text-emerald-950">
                <span className="font-mono tracking-wider">{appliedCoupon.code}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">
                  {appliedCoupon.discountType === "PERCENTAGE"
                    ? `${appliedCoupon.discountValue}% OFF`
                    : `৳${appliedCoupon.discountValue} OFF`}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                You saved {formatPrice(discountAmount)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/80 hover:text-emerald-900 transition text-xs font-bold flex items-center gap-1 shrink-0"
            title="Remove coupon"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Remove</span>
          </button>
        </div>
      ) : (
        /* Coupon Input Box */
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Discount code / Coupon"
                value={couponCode}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (message) setMessage(null);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={!couponCode.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition shadow-xs shrink-0"
            >
              Apply
            </button>
          </div>

          {/* Quick Apply Available Coupon Chips */}
          {!compact && activeCoupons.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Available:
              </span>
              {activeCoupons.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleApply(c.code)}
                  className="px-2 py-0.5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 font-mono font-bold text-[10px] transition flex items-center gap-1"
                >
                  <span>{c.code}</span>
                  <span className="text-[9px] text-emerald-600">
                    ({c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `৳${c.discountValue}`})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <div
          className={`text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in ${
            message.isError ? "text-rose-600" : "text-emerald-700"
          }`}
        >
          {message.isError ? (
            <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
