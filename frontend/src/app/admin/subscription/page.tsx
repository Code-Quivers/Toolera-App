"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Smartphone,
  Coins,
  RefreshCcw,
} from "lucide-react";
import { useSubscriptionStore, PlanModel } from "@/store/useSubscriptionStore";
import { useTenantStore } from "@/store/useTenantStore";

export default function SubscriptionBillingPage() {
  const {
    plans,
    currentSubscription,
    currentPlan,
    usage,
    daysRemaining,
    invoices,
    isLoading,
    isCheckoutOpen,
    selectedPlanForCheckout,
    selectedCycle,
    openCheckout,
    closeCheckout,
    setSelectedCycle,
    checkout,
    cancelRenewal,
    fetchPlans,
    fetchCurrentSubscription,
    fetchInvoices,
  } = useSubscriptionStore();

  const { activeStore } = useTenantStore();

  // Checkout modal form state
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "CARD" | "DEMO">("BKASH");
  const [trxIdInput, setTrxIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("01712345678");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Selected billing toggle on page
  const [billingCycleToggle, setBillingCycleToggle] = useState<"MONTHLY" | "YEARLY">("YEARLY");

  useEffect(() => {
    fetchPlans();
    if (activeStore) {
      fetchCurrentSubscription(activeStore.id);
      fetchInvoices(activeStore.id);
    } else {
      fetchCurrentSubscription();
      fetchInvoices();
    }
  }, [fetchPlans, fetchCurrentSubscription, fetchInvoices, activeStore]);

  const handleStartCheckout = (plan: PlanModel) => {
    openCheckout(plan, billingCycleToggle);
    setCheckoutStatus(null);
    setTrxIdInput("");
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout || !activeStore) return;

    setCheckoutSubmitting(true);
    setCheckoutStatus(null);

    const res = await checkout({
      storeId: activeStore.id,
      planSlug: selectedPlanForCheckout.slug,
      billingCycle: selectedCycle,
      paymentMethod,
      transactionId: trxIdInput.trim() || undefined,
      customerPhone: phoneInput.trim() || undefined,
    });

    setCheckoutSubmitting(false);
    setCheckoutStatus(res);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaS Subscription & Billing Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Manage Subscription & Scale Your Store
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unlock higher product limits, automated courier integrations, custom domain SSL, and dedicated 24/7 priority support.
            </p>
          </div>

          {/* Current Active Plan Badge Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-right space-y-1 self-start md:self-auto min-w-[200px]">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Current Plan
            </div>
            <div className="text-xl font-black text-white flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{currentPlan?.name || "Pro Business"}</span>
            </div>
            <div className="text-xs text-emerald-400 font-medium">
              {daysRemaining} days remaining in cycle
            </div>
          </div>
        </div>
      </div>

      {/* Usage & Plan Limits Meter Section */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Current Resource Usage & Plan Limits</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Products Usage */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-xs">Catalog Products</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {usage.products.current} / {usage.products.max === -1 ? "∞" : usage.products.max}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, usage.products.percent)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {usage.products.max === -1
                ? "Unlimited product capacity enabled."
                : `${usage.products.max - usage.products.current} slots available in current tier.`}
            </p>
          </div>

          {/* Monthly Orders Usage */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-xs">Monthly Orders</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {usage.ordersThisMonth.current} /{" "}
                {usage.ordersThisMonth.max === -1 ? "∞" : usage.ordersThisMonth.max}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, usage.ordersThisMonth.percent)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Resets on 1st of next month automatically.
            </p>
          </div>

          {/* Staff Members Usage */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-xs">Team & Staff Seats</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {usage.staffMembers.current} / {usage.staffMembers.max}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, usage.staffMembers.percent)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Manage team logins & granular role permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Tiers & Billing Toggle */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Compare SaaS Subscription Plans
            </h2>
            <p className="text-xs text-slate-500">
              Upgrade or switch anytime. Upgrades take effect instantly.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setBillingCycleToggle("MONTHLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                billingCycleToggle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycleToggle("YEARLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                billingCycleToggle === "YEARLY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.slug === plan.slug;
            const price =
              billingCycleToggle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;
            const periodLabel = billingCycleToggle === "YEARLY" ? "/year" : "/month";

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl border flex flex-col justify-between p-6 sm:p-7 relative transition-all shadow-xs hover:shadow-lg ${
                  plan.badge === "Most Popular"
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200"
                }`}
              >
                {/* Popular Pill */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base">{plan.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-tight min-h-[30px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        ৳{price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{periodLabel}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight font-medium">{feat}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Plan Button */}
                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCheckout(plan)}
                      className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        plan.badge === "Most Popular"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice & Billing History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Billing History & Invoices</span>
        </h2>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4 sm:px-6">Invoice #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Plan / Description</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right sm:pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 sm:px-6 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-slate-800">
                      {inv.notes || "Subscription Charge"}
                    </td>
                    <td className="p-4 font-bold text-slate-900">৳{inv.amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">
                      {inv.paymentMethod}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right sm:pr-6">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Checkout / Upgrade Modal */}
      {isCheckoutOpen && selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Upgrade to {selectedPlanForCheckout.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target Store: <strong>{activeStore?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={closeCheckout}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {checkoutStatus && (
              <div
                className={`p-3 text-xs font-bold rounded-2xl border ${
                  checkoutStatus.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {checkoutStatus.message}
              </div>
            )}

            <form onSubmit={handleProcessPayment} className="space-y-5 text-xs">
              {/* Plan Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Due</span>
                  <div className="text-2xl font-black text-slate-900">
                    ৳
                    {(selectedCycle === "YEARLY"
                      ? selectedPlanForCheckout.priceYearly
                      : selectedPlanForCheckout.priceMonthly
                    ).toLocaleString()}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 text-xs">
                  {selectedCycle === "YEARLY" ? "1 Year Plan (Save 20%)" : "1 Month Plan"}
                </span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Choose Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      paymentMethod === "BKASH"
                        ? "border-pink-500 bg-pink-50 text-pink-900 font-bold ring-1 ring-pink-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-pink-600" />
                    <span>bKash Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NAGAD")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      paymentMethod === "NAGAD"
                        ? "border-orange-500 bg-orange-50 text-orange-900 font-bold ring-1 ring-orange-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>Nagad Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      paymentMethod === "CARD"
                        ? "border-slate-900 bg-slate-100 text-slate-900 font-bold ring-1 ring-slate-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <span>Card / Visa / MC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("DEMO")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      paymentMethod === "DEMO"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Instant Sandbox Demo</span>
                  </button>
                </div>
              </div>

              {/* Transaction Input if bKash / Nagad */}
              {paymentMethod !== "DEMO" && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Account Phone Number</label>
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 9J87H6TRX"
                      value={trxIdInput}
                      onChange={(e) => setTrxIdInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="px-5 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{checkoutSubmitting ? "Processing..." : "Complete & Activate Plan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
