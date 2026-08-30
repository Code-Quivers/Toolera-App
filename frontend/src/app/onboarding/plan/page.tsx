"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

export default function OnboardingPlanPage() {
  const router = useRouter();
  const { setPaymentPending } = useTenantStore();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const plans = [
    {
      slug: "starter",
      name: "Starter",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      description: "Ideal for new sellers launching their first store",
      productLimit: "100 Products",
      orderLimit: "200 Orders / mo",
      staffLimit: "2 Team Members",
      features: [
        "100 Products Catalog",
        "E-Commerce Visual CMS",
        "Order & Courier Dispatch",
        "Steadfast & Pathao Booking",
        "Inventory & Stock Tracking",
        "Standard Theme Customizer",
      ],
      ctaText: "Select Starter",
      highlight: false,
    },
    {
      slug: "growth",
      name: "Growth",
      monthlyPrice: 999,
      yearlyPrice: 9990,
      badge: "MOST POPULAR",
      description: "Everything you need to scale your e-commerce brand",
      productLimit: "500 Products",
      orderLimit: "1,000 Orders / mo",
      staffLimit: "5 Team Members",
      features: [
        "500 Products Catalog",
        "Advanced CMS & Sections",
        "Discount Coupons & Bundles",
        "Reviews & Photo Feedback",
        "Profit & Loss Analytics",
        "Custom Domain & DNS",
        "Up to 5 Staff Accounts",
      ],
      ctaText: "Start with Growth",
      highlight: true,
    },
    {
      slug: "pro",
      name: "Pro Enterprise",
      monthlyPrice: 1999,
      yearlyPrice: 19990,
      badge: "POWER SELLER",
      description: "For high-volume merchants demanding maximum scale",
      productLimit: "Unlimited Products",
      orderLimit: "Unlimited Orders",
      staffLimit: "15 Team Members",
      features: [
        "Unlimited Products Catalog",
        "Unlimited Monthly Orders",
        "GA4 & Meta Ad Pixels",
        "Automated SMS Gateways",
        "Multi-Staff Role Gating",
        "Priority 24/7 Support",
        "Custom Domain & SSL",
      ],
      ctaText: "Go Unlimited with Pro",
      highlight: false,
    },
  ];

  const handleSelectPlan = (planSlug: string) => {
    router.push(`/checkout/subscription?plan=${planSlug}&cycle=${billingCycle}`);
  };

  const handleSkipPayment = () => {
    setPaymentPending(true);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const price = billingCycle === "MONTHLY" ? p.monthlyPrice : Math.round(p.yearlyPrice / 12);
            return (
              <div
                key={p.slug}
                className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border ${
                  p.highlight
                    ? "border-2 border-[#008B47] shadow-xl ring-4 ring-emerald-500/10 scale-[1.02]"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#008B47] text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>
                  </div>

                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">৳{price}</span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    {billingCycle === "YEARLY" && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Billed annually (৳{p.yearlyPrice}/yr)
                      </span>
                    )}
                  </div>

                  {/* Quota Highlights */}
                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700 font-bold border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Product Quota:</span>
                      <span>{p.productLimit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Monthly Orders:</span>
                      <span>{p.orderLimit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Team Access:</span>
                      <span>{p.staffLimit}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      What's Included:
                    </span>
                    {p.features.map((feat, i) => (
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
                    onClick={() => handleSelectPlan(p.slug)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                      p.highlight
                        ? "bg-[#008B47] hover:bg-[#007a3e] text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

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
