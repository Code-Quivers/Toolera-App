"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Store,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Package,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

function OnboardingCompleteContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "Growth";
  const { activeStore } = useTenantStore();

  const storeName = activeStore?.name || "Raifa's Mart";
  const storeSlug = activeStore?.slug || "raifas-mart";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full text-center space-y-6">
        
        {/* Celebration Badge */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-[#008B47]/30 text-[#008B47] mx-auto flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
          <Sparkles className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            🎉 Onboarding Complete &amp; Subscription Active
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Store is Live &amp; Ready!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Congratulations! <strong className="text-slate-900">{storeName}</strong> has been configured with your branding, delivery rules, and catalog engine.
          </p>
        </div>

        {/* Live URL Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md text-left space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Storefront Address
          </span>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono font-black text-slate-800 truncate">
              https://{storeSlug}.toolera.app
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ● Online
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <Package className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-600 block">Catalog Ready</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <Sliders className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-600 block">Theme Styled</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <ShoppingBag className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-600 block">Orders Active</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            target="_blank"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 pt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Need help getting started? Visit Settings or contact support anytime.</span>
        </div>

      </div>
    </div>
  );
}

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <OnboardingCompleteContent />
    </Suspense>
  );
}
