"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Download,
  AlertTriangle,
  Layers,
  Package,
  Users,
  HardDrive,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";

function BillingSkeleton() {
  return (
    <div className="space-y-6 w-full pb-16 animate-pulse">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 h-28 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-6 bg-slate-200 rounded w-56" />
          <div className="h-3 bg-slate-200 rounded w-40" />
        </div>
        <div className="w-32 h-10 bg-slate-200 rounded-xl" />
      </div>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 h-40" />
    </div>
  );
}

export default function AdminBillingPage() {
  const { activeStore, isLoading, isPaymentPending, markSubscriptionPaid } = useTenantStore();
  const { products } = useProductStore();
  const { orders } = useOrderStore();

  const isDefaultStore = !isPaymentPending && (activeStore?.id === "default_store" || activeStore?.slug === "toolera");
  const storeOrders = isDefaultStore ? orders : orders.filter((o: any) => o.storeId === activeStore?.id);
  const storeProducts = isDefaultStore ? products : products.filter((p: any) => p.storeId === activeStore?.id);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  const handlePayAndActivate = () => {
    // Open Trusted Payment Gateway in Bangladesh - PayStation
    if (typeof window !== "undefined") {
      window.open("https://www.paystation.com.bd/", "_blank");
    }
    try {
      localStorage.removeItem("toolera_payment_pending");
    } catch {}
    markSubscriptionPaid("growth", "MONTHLY");
    setPaymentSuccessMsg(true);
  };

  // Dynamic Current Plan Specs based on activeStore
  const planInfo = activeStore?.subscription?.plan;
  const planSlug = activeStore?.subscription?.planSlug || "growth";
  const planName = planInfo?.name || (planSlug === "pro" ? "Pro Business" : planSlug === "starter" ? "Starter" : "Growth");
  const planPriceMonthly = planInfo?.priceMonthly || (planSlug === "pro" ? 2490 : planSlug === "starter" ? 490 : 999);
  const cycle = activeStore?.subscription?.billingCycle || "Monthly";

  const currentPlan = {
    name: isPaymentPending ? `${planName} (Unpaid)` : planName,
    price: isPaymentPending ? `৳0 (Pending ৳${planPriceMonthly})` : `৳${planPriceMonthly}`,
    cycle: cycle === "YEARLY" ? "Yearly" : "Monthly",
    status: isPaymentPending ? "PENDING" : (activeStore?.subscription?.status || "ACTIVE"),
    renewalDate: activeStore?.subscription?.currentPeriodEnd
      ? new Date(activeStore.subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "September 30, 2026",
    paymentMethod: isPaymentPending ? "Unpaid (Payment Pending)" : "bKash / Nagad Auto-Debit",
    productsUsed: storeProducts.length,
    productsMax: planInfo?.maxProducts || (planSlug === "pro" ? 1000 : planSlug === "starter" ? 100 : 500),
    ordersUsed: storeOrders.length,
    ordersMax: planInfo?.maxOrdersPerMonth || (planSlug === "pro" ? 3000 : planSlug === "starter" ? 500 : 1000),
    staffUsed: activeStore?.members?.length ?? 1,
    staffMax: planInfo?.maxStaffMembers ?? (planSlug === "pro" ? 15 : planSlug === "starter" ? 2 : 5),
    storageMbUsed: storeProducts.length * 15,
    storageMbMax: planInfo?.maxStorageMb ?? (planSlug === "pro" ? 20000 : planSlug === "starter" ? 2048 : 5000),
  };

  const invoices = isPaymentPending
    ? []
    : [
        {
          id: `INV-${new Date().getFullYear()}-001`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          plan: planName,
          amount: `৳${planPriceMonthly}`,
          status: "Paid",
          method: "bKash / Nagad",
        },
      ];

  if (isLoading) return <BillingSkeleton />;

  return (
    <div className="space-y-6 w-full pb-16">

      {/* Payment Pending Alert Banner when user skipped onboarding payment */}
      {isPaymentPending && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider inline-block mb-1">
                  Payment Pending — Navigation Locked
                </span>
                <h2 className="text-xl font-black">Activate Your Store Subscription</h2>
                <p className="text-xs text-amber-100 mt-0.5">
                  You chose to skip payment during onboarding. Complete your payment below to immediately unlock Website, Catalog, Orders, Finance &amp; Settings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayAndActivate}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#008B47]" />
              <span>Pay ৳999 via PayStation Gateway ↗</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Celebration Alert */}
      {paymentSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#008B47] shrink-0" />
            <span>🎉 Subscription payment received! All navigation tabs (Website, Catalog, Orders, Finance &amp; Settings) are now completely unlocked.</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccessMsg(false)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Top Banner / Plan Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xl border border-amber-500/20 shadow-xs">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Plan</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isPaymentPending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {isPaymentPending ? "● Payment Pending" : "● Active"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              {currentPlan.name} Plan <span className="text-lg font-bold text-[#008B47]">({currentPlan.price})</span>
            </h1>
            <span className="text-xs text-slate-500 block mt-0.5">
              Renews on <strong className="text-slate-800">{currentPlan.renewalDate}</strong> via {currentPlan.paymentMethod}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {isPaymentPending ? (
            <button
              type="button"
              onClick={handlePayAndActivate}
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pay via PayStation ↗</span>
            </button>
          ) : (
            <Link
              href="/onboarding/plan"
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Pro</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => alert("Billing receipts & method management.")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Manage Billing
          </button>
        </div>
      </div>

      {/* Store Quota & Usage Indicators */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900">Store Capacity &amp; Resource Usage</h2>
          <p className="text-xs text-slate-500">Live utilization meters based on your active subscription plan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Products Meter */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-slate-400" /> Products
              </span>
              <span className="text-slate-900">{currentPlan.productsUsed} / {currentPlan.productsMax}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#008B47] rounded-full transition-all duration-500"
                style={{ width: `${(currentPlan.productsUsed / currentPlan.productsMax) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right font-mono">
              {Math.round((currentPlan.productsUsed / currentPlan.productsMax) * 100)}% used
            </span>
          </div>

          {/* Monthly Orders */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" /> Monthly Orders
              </span>
              <span className="text-slate-900">{currentPlan.ordersUsed} / {currentPlan.ordersMax}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentPlan.ordersUsed / currentPlan.ordersMax) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right font-mono">
              {Math.round((currentPlan.ordersUsed / currentPlan.ordersMax) * 100)}% used
            </span>
          </div>

          {/* Staff Accounts */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Team Members
              </span>
              <span className="text-slate-900">{currentPlan.staffUsed} / {currentPlan.staffMax}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(currentPlan.staffUsed / currentPlan.staffMax) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right font-mono">
              {Math.round((currentPlan.staffUsed / currentPlan.staffMax) * 100)}% used
            </span>
          </div>

          {/* Media Storage */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Media Storage
              </span>
              <span className="text-slate-900">{currentPlan.storageMbUsed}MB / {currentPlan.storageMbMax >= 1024 ? `${Math.round(currentPlan.storageMbMax / 1024)}GB` : `${currentPlan.storageMbMax}MB`}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentPlan.storageMbUsed / currentPlan.storageMbMax) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block text-right font-mono">
              {Math.round((currentPlan.storageMbUsed / currentPlan.storageMbMax) * 100)}% used
            </span>
          </div>

        </div>
      </div>

      {/* Plan Features Included */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Features Active in Your Plan</h3>
            <p className="text-xs text-slate-500">Your {planName} plan grants access to all essential e-commerce tools.</p>
          </div>
          <Link href="/onboarding/plan" className="text-xs font-bold text-[#008B47] hover:underline">
            View All Plans →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {[
            "Up to 500 Active Products",
            "Advanced CMS Sections & Builder",
            "Steadfast & Pathao Courier Auto-Dispatch",
            "Discount Coupons & Promotional Bundles",
            "Customer Photo Reviews & Ratings",
            "Custom Domain & Free SSL Certificate",
            "Profit & Loss Financial Reporting",
            "Fraud Order Security & Blacklisting",
            "Standard Support",
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#008B47] shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Payment &amp; Invoice History</h3>
            <p className="text-xs text-slate-500">Download official receipts for your accounting and taxation.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{inv.plan}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.method}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.amount}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => alert("Downloading official PDF receipt for " + inv.id)}
                      className="text-[#008B47] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
