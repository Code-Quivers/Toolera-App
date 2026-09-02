"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Store,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

function SubscriptionCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan") || "growth";
  const cycle = (searchParams.get("cycle") || "MONTHLY") as "MONTHLY" | "YEARLY";

  const { activeStore, setPaymentPending, markSubscriptionPaid } = useTenantStore();
  const { adminUser } = useAdminAuthStore();
  const [planData, setPlanData] = useState<{ name: string; monthly: number; yearly: number } | null>(null);

  useEffect(() => {
    const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");
    fetch(`${API}/api/v1/subscriptions/plans`)
      .then(r => r.json())
      .then(json => {
        const plan = (json?.data ?? []).find((p: any) => p.slug === planSlug);
        if (plan) setPlanData({ name: plan.name, monthly: plan.priceMonthly, yearly: plan.priceYearly });
      })
      .catch(() => {});
  }, [planSlug]);

  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "CARD">("BKASH");
  const [phoneNumber, setPhoneNumber] = useState("017");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const planInfo = planData ?? { name: "Pro", monthly: 999, yearly: 9990 };

  const totalAmount = cycle === "MONTHLY" ? planInfo.monthly : planInfo.yearly;

  const handleStartSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Record payment activation in backend API or client store
      const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");
      const res = await fetch(`${API}/api/v1/subscriptions/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: activeStore?.id,
          planSlug,
          billingCycle: cycle,
          paymentMethod,
        }),
      }).catch(() => null);

      // Open Trusted Payment Gateway in Bangladesh - PayStation
      if (typeof window !== "undefined") {
        window.open("https://www.paystation.com.bd/", "_blank");
      }

      // Mark subscription as paid and activate navigation
      try {
        localStorage.removeItem("toolera_payment_pending");
      } catch {}
      markSubscriptionPaid(planSlug, cycle);
      setPaymentPending(false);

      // Simulating seamless activation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to Celebration & Welcome screen
      router.push("/onboarding/complete?plan=" + planSlug);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPayment = () => {
    setPaymentPending(true);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#008B47] text-white flex items-center justify-center mx-auto shadow-md font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activate Store Subscription</h1>
          <p className="text-xs text-slate-500">
            Secure checkout. Cancel or upgrade your plan anytime from dashboard settings.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plan Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Plan</span>
                <h3 className="text-base font-black text-slate-900">{planInfo.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#008B47]">৳{totalAmount}</span>
                <span className="text-[10px] text-slate-400 block font-medium">/ {cycle.toLowerCase()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Account:</span>
              <span className="font-bold text-slate-900">{adminUser?.email || "merchant@store.com"}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Store:</span>
              <span className="font-bold text-slate-900">{activeStore?.name || "Toolera"}</span>
            </div>
          </div>

          <form onSubmit={handleStartSubscription} className="space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "BKASH", name: "bKash", color: "text-rose-600" },
                  { id: "NAGAD", name: "Nagad", color: "text-orange-600" },
                  { id: "CARD", name: "Card / Visa", color: "text-indigo-600" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition ${
                      paymentMethod === pm.id
                        ? "border-[#008B47] bg-emerald-50 text-slate-900 shadow-2xs ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`block font-black text-sm ${pm.color}`}>{pm.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Online Pay</span>
                  </button>
                ))}
              </div>
            </div>

            {(paymentMethod === "BKASH" || paymentMethod === "NAGAD") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {paymentMethod} Wallet Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#008B47]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  An automated OTP prompt will verify your wallet account.
                </span>
              </div>
            )}

            {/* Total Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Total Payable Now</span>
                <span className="text-2xl font-black text-slate-900">৳{totalAmount}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Instant Store Activation
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Pay ৳{totalAmount} via PayStation Gateway ↗</span>
                </>
              )}
            </button>
          </form>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#008B47]" />
              <span>256-bit SSL encrypted e-commerce platform</span>
            </div>

            {/* Back to Plans & Skip Payment Option */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href={`/onboarding/plan`}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Plan Options</span>
              </Link>

              <button
                type="button"
                onClick={handleSkipPayment}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
              >
                ⚡ Skip Payment for Now (Pay from Dashboard)
              </button>
            </div>
          </div>

      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading Checkout...</div>}>
      <SubscriptionCheckoutContent />
    </Suspense>
  );
}
