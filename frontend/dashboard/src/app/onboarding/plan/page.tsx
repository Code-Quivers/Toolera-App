"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  badge: string | null;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStaffMembers: number;
  features: string[];
}

function formatLimit(n: number, unit = "") {
  return n === -1 ? `Unlimited${unit ? " " + unit : ""}` : `${n.toLocaleString()}${unit ? " " + unit : ""}`;
}

function PlanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200 space-y-4">
          <div className="h-5 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-40" />
          <div className="h-8 bg-slate-200 rounded w-28" />
          <div className="space-y-2 pt-2">
            {[0, 1, 2, 3, 4].map((j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}
          </div>
          <div className="h-10 bg-slate-200 rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPlanPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/subscriptions/plans`)
      .then((r) => r.json())
      .then((json) => {
        const data: Plan[] = json?.data ?? [];
        setPlans(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.trialDays > 0) {
      router.push(`/onboarding/complete?plan=${plan.slug}&trial=true`);
    } else {
      router.push(`/checkout/subscription?plan=${plan.slug}&cycle=${billingCycle}`);
    }
  };

  const handleSkipPayment = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-[#008B47]" />
            <span>Step 04 / 05 — Choose Subscription</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Simple, Transparent Pricing for Bangladesh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            All plans include full e-commerce checkout, local courier integration, and your own dedicated storefront.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-3 inline-flex items-center p-1 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                billingCycle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycle === "YEARLY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 uppercase">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <PlanSkeleton />
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${plans.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {plans.map((plan) => {
              const isFree = plan.trialDays > 0;
              const isHighlight = plan.badge === "MOST POPULAR";
              const price = isFree
                ? 0
                : billingCycle === "MONTHLY"
                ? plan.priceMonthly
                : Math.round(plan.priceYearly / 12);

              const ctaText = isFree
                ? `Start Free ${plan.trialDays}-Day Trial`
                : `Select ${plan.name}`;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border ${
                    isHighlight
                      ? "border-2 border-[#008B47] shadow-xl ring-4 ring-emerald-500/10 scale-[1.02]"
                      : isFree
                      ? "border-2 border-amber-300 shadow-sm"
                      : "border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm whitespace-nowrap ${
                        isFree
                          ? "bg-amber-400 text-amber-900"
                          : "bg-[#008B47] text-white"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                    </div>

                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        {isFree ? (
                          <span className="text-3xl font-black text-amber-600">৳0</span>
                        ) : (
                          <span className="text-3xl font-black text-slate-900">৳{price}</span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">/ month</span>
                      </div>
                      {isFree ? (
                        <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                          Free for {plan.trialDays} days — no credit card required
                        </span>
                      ) : billingCycle === "YEARLY" ? (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Billed annually (৳{plan.priceYearly}/yr)
                        </span>
                      ) : null}
                    </div>

                    {/* Quota Highlights */}
                    <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700 font-bold border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Product Quota:</span>
                        <span>{formatLimit(plan.maxProducts, "Products")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Monthly Orders:</span>
                        <span>{formatLimit(plan.maxOrdersPerMonth, "Orders / mo")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Team Access:</span>
                        <span>{formatLimit(plan.maxStaffMembers, "Members")}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        What's Included:
                      </span>
                      {(Array.isArray(plan.features) ? plan.features : []).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-[#008B47] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                        isFree
                          ? "bg-amber-400 hover:bg-amber-500 text-amber-900"
                          : isHighlight
                          ? "bg-[#008B47] hover:bg-[#007a3e] text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation & Skip Payment Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <Link
            href="/onboarding/store"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Store Settings &amp; Delivery</span>
          </Link>

          <button
            type="button"
            onClick={handleSkipPayment}
            className="px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>⚡ Skip Payment for Now (Pay Later from Dashboard)</span>
            <ArrowRight className="w-4 h-4 text-amber-700" />
          </button>
        </div>

      </div>

      <footer className="text-center text-[11px] text-slate-400 pt-8 pb-4">
        Need custom enterprise volume? Contact our Dhaka helpline: 01700-000000
      </footer>
    </div>
  );
}
