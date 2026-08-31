"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  Truck,
  Users,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Ban,
  AlertOctagon,
  UserX,
  Check,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { slugify } from "@/lib/utils";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useFraudSecurityStore } from "@/store/useFraudSecurityStore";
import { useTenantStore } from "@/store/useTenantStore";

export default function AdminDashboardPage() {
  const { isPaymentPending: tenantPending, activeStore } = useTenantStore();
  const isPaymentPending =
    tenantPending ||
    !activeStore?.subscription ||
    activeStore.subscription.status === "PENDING" ||
    activeStore.subscription.status === "UNPAID" ||
    activeStore.subscription.status === "TRIALING" ||
    activeStore.subscription.status !== "ACTIVE";

  const { products } = useProductStore();
  const { orders } = useOrderStore();
  const { categories } = useCategoryStore();
  const { customers } = useCustomerStore();
  const fraudStore = useFraudSecurityStore();

  const [blockPhoneInput, setBlockPhoneInput] = useState("");
  const [blockReasonInput, setBlockReasonInput] = useState("");
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);

  // Multi-tenant store-aware data isolation
  const isDefaultStore = !isPaymentPending && (activeStore?.id === "default_store" || activeStore?.slug === "toolera");
  const storeOrders = isDefaultStore ? orders : orders.filter((o: any) => o.storeId === activeStore?.id);
  const storeProducts = isDefaultStore ? products : products.filter((p: any) => p.storeId === activeStore?.id);
  const storeCustomers = isDefaultStore ? customers : customers.filter((c: any) => c.storeId === activeStore?.id);

  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const checklistItems = [
    { label: "Store information", done: Boolean(activeStore?.name) },
    { label: "Logo & branding", done: Boolean(activeStore?.name) },
    { label: "Delivery settings", done: true },
    { label: "Payment methods", done: true },
    { label: "First product added", done: storeProducts.length > 0 },
    { label: "Customize homepage", done: !isPaymentPending },
    { label: "Shipping courier linked", done: !isPaymentPending },
    { label: "Subscription activated", done: !isPaymentPending },
  ];
  const completedChecklistCount = checklistItems.filter((i) => i.done).length;
  const setupScore = Math.round((completedChecklistCount / checklistItems.length) * 100);

  const totalRevenue = storeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = storeOrders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING"
  ).length;
  const lowStockCount = storeProducts.filter((p) => Number(p.stock) <= (p.lowStockThreshold || 5)).length;
  const recentOrders = storeOrders.slice(0, 8);

  // Evaluate orders against anti-fraud security engine
  const flaggedRiskOrders = storeOrders
    .map((o) => ({
      order: o,
      risk: fraudStore.evaluateOrderRisk(o, storeOrders),
    }))
    .filter((item) => item.risk.isHighRisk || item.risk.isFake);

  const handleQuickBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockPhoneInput.trim()) return;
    fraudStore.addToBlacklist(
      blockPhoneInput.trim(),
      "Flagged from Dashboard",
      blockReasonInput.trim() || "Manual Blacklist from Dashboard"
    );
    setBlockPhoneInput("");
    setBlockReasonInput("");
    setSecurityFeedback("✅ Phone number added to Blacklist successfully!");
    setTimeout(() => setSecurityFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Payment Pending Alert Card when store is unpaid */}
      {isPaymentPending && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  Your store navigation (Products, Orders, Website Customizer, Settings) is hidden until subscription payment is completed.
                </p>
              </div>
            </div>
            <Link
              href="/admin/billing"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#008B47]" />
              <span>Pay ৳999 &amp; Unlock All Navigation →</span>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Store Overview
            </h1>
            {isPaymentPending ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                ● Payment Required
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                ● Online
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Good morning! Here is what&apos;s happening with {activeStore?.name || "your store"} today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isPaymentPending ? (
            <Link
              href="/admin/billing"
              className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Pay &amp; Unlock Store Tabs</span>
            </Link>
          ) : (
            <>
              <Link
                href="/admin/banners"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 shadow-2xs transition"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manage 1600x514 Banners</span>
              </Link>
              <Link
                href="/admin/products/new"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Store Setup Score & Checklist */}
      {!checklistDismissed && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-amber-50/40 border border-emerald-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#008B47]" />
                <h3 className="text-sm font-black text-slate-900">Complete your store setup</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {completedChecklistCount} / {checklistItems.length} Done ({setupScore}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete these essential milestones to maximize conversions and customer trust.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChecklistDismissed(true)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold self-start sm:self-auto cursor-pointer"
            >
              Dismiss ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#008B47] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${setupScore}%` }}
            />
          </div>

          {/* Checklist Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {checklistItems.map((item, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition ${
                  item.done
                    ? "bg-white border-emerald-200 text-slate-800 font-bold"
                    : "bg-slate-50/80 border-slate-200 text-slate-400"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#008B47] shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <Link
              href="/admin/settings/store"
              className="text-xs font-bold text-[#008B47] hover:underline inline-flex items-center gap-1"
            >
              <span>Continue Setup Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Sales */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <span>From {storeOrders.length} total orders placed</span>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Orders</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{storeOrders.length} Orders</div>
          <div className="text-[11px] text-indigo-600 font-semibold">
            <span>{pendingOrdersCount} pending dispatch</span>
          </div>
        </div>

        {/* Card 3: Active Products */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Products</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{storeProducts.length} Items</div>
          <div className="text-[11px] text-slate-400 font-medium">
            {storeProducts.length > 0 ? categories.length : 0} curated categories • {storeCustomers.length} registered customers
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-medium">
            <span>Estimated Net Profit</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {(() => {
            const estimatedCOGS = storeOrders.reduce((sum, order) => {
              const orderCOGS = (order.items || []).reduce((itemSum, it) => {
                const prod = storeProducts.find((p) => p.title.toLowerCase() === it.title.toLowerCase() || p.id === it.id);
                const unitCost = prod?.costPrice ? prod.costPrice : it.price * 0.55;
                return itemSum + unitCost * (it.qty || 1);
              }, 0);
              return sum + orderCOGS;
            }, 0);
            const deliveryFees = storeOrders.length * 85;
            const netProfit = Math.max(0, totalRevenue - estimatedCOGS - deliveryFees);
            const marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

            return (
              <>
                <div className="text-2xl font-black text-emerald-400">{formatPrice(netProfit)}</div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between">
                  <span>After COGS &amp; Courier</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-bold">
                    {marginPct}% Margin
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Financial P&L Breakdown Banner */}
      {(() => {
        const estimatedCOGS = storeOrders.reduce((sum, order) => {
          const orderCOGS = (order.items || []).reduce((itemSum, it) => {
            const prod = storeProducts.find((p) => p.title.toLowerCase() === it.title.toLowerCase() || p.id === it.id);
            const unitCost = prod?.costPrice ? prod.costPrice : it.price * 0.55;
            return itemSum + unitCost * (it.qty || 1);
          }, 0);
          return sum + orderCOGS;
        }, 0);
        const deliveryFees = storeOrders.length * 85;
        const netProfit = Math.max(0, totalRevenue - estimatedCOGS - deliveryFees);

        return (
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Financial Performance (P&amp;L)</span>
              <div className="font-black text-slate-900 text-sm">Real-time Net Margin &amp; Cost Deductions</div>
            </div>
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Gross Revenue</span>
                <span className="text-xs font-black text-slate-900">{formatPrice(totalRevenue)}</span>
              </div>
              <div className="text-slate-300 font-bold">-</div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Wholesale COGS</span>
                <span className="text-xs font-black text-slate-700">{formatPrice(estimatedCOGS)}</span>
              </div>
              <div className="text-slate-300 font-bold">-</div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Courier Logistics</span>
                <span className="text-xs font-black text-slate-700">{formatPrice(deliveryFees)}</span>
              </div>
              <div className="text-slate-300 font-bold">=</div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">Real Net Profit</span>
                <span className="text-sm font-black text-[#008B47]">{formatPrice(netProfit)}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* FAKE ORDER SECURITY & ANTI-FRAUD INTELLIGENCE (ফেক অর্ডার রোধ)  */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Fake Order Security &amp; Anti-Fraud Protection (ফেক অর্ডার রোধ ও সিকিউরিটি)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Realtime Engine Active
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Automated detection for fake orders, 15-min duplicate checkout spam, and blacklisted COD buyers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Review Flagged Orders ({flaggedRiskOrders.length})</span>
            </Link>
          </div>
        </div>

        {/* Security Metrics Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Suspicious / Fake Orders</span>
              <span className={`text-xl font-black ${flaggedRiskOrders.length > 0 ? "text-rose-600" : "text-slate-800"}`}>
                {flaggedRiskOrders.length} Detected
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Store Blacklisted Numbers</span>
              <span className="text-xl font-black text-slate-800">
                {fraudStore.blacklistedNumbers.length} Phone Numbers
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 block uppercase">Anti-Fraud Safeguards</span>
              <span className="text-xs font-extrabold text-emerald-900 block mt-0.5">
                Duplicate Blocker &amp; Phone Verify On
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Suspicious Orders Alert List (If any detected) */}
        {flaggedRiskOrders.length > 0 ? (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Orders Flagged as High Risk / Suspicious ({flaggedRiskOrders.length})</span>
              </span>
              <span className="text-[11px] text-rose-700 font-medium">Verify via phone call before dispatching parcel</span>
            </div>

            <div className="space-y-2">
              {flaggedRiskOrders.slice(0, 3).map(({ order, risk }) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl bg-white border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">#{order.id}</span>
                      <span className="font-bold text-slate-700">{order.customer}</span>
                      <span className="font-mono text-slate-500">({order.phone})</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        {risk.riskLevel} (Score: {risk.riskScore}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-600 font-medium">
                      ⚠️ {risk.reasons.join(" • ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/orders?orderId=${order.id}`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                    >
                      Inspect Order
                    </Link>
                    <button
                      type="button"
                      onClick={() => fraudStore.addToBlacklist(order.phone, order.customer, "Flagged from Dashboard")}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      Block Customer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>No active fake orders or high-risk checkout spam detected in your current orders.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">All recent orders are clean</span>
          </div>
        )}

        {/* Quick Blacklist Action */}
        <div className="pt-2 border-t border-slate-100">
          <form onSubmit={handleQuickBlacklist} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex gap-2">
              <input
                type="text"
                placeholder="Enter 11-digit fake mobile number (e.g. 017xxxxxxxx)..."
                value={blockPhoneInput}
                onChange={(e) => setBlockPhoneInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs outline-none focus:border-rose-500 focus:bg-white"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Fake COD / Returned parcel)..."
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                className="hidden sm:block flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>+ Add to Blacklist</span>
            </button>
          </form>
          {securityFeedback && (
            <p className="text-emerald-700 font-bold text-xs mt-2">{securityFeedback}</p>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Real-time live orders placed across Bangladesh</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            View All Orders ({storeOrders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Purchased Products</th>
                <th className="py-3 px-3">District / Phone</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-xs">No orders placed yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      When customers place orders from the storefront, they will appear here in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      <Link
                        href={`/admin/orders?orderId=${order.id}`}
                        className="hover:text-[#008B47] hover:underline"
                        title="View Full Order Slip"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800 font-semibold">{order.customer}</td>

                    {/* Purchased Products with Storefront Link */}
                    <td className="py-3.5 px-3 min-w-[210px] max-w-xs">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map((item, i) => {
                            const matchedProduct = products.find(
                              (p) =>
                                p.id === (item as any).productId ||
                                p.id === (item as any).id ||
                                p.title.toLowerCase() === item.title.toLowerCase()
                            );
                            const slug = (item as any).slug || matchedProduct?.slug || slugify(item.title);
                            const productUrl = `/product/${slug}`;

                            return (
                              <div key={i} className="flex items-center gap-2">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={productUrl}
                                    target="_blank"
                                    className="font-bold text-slate-800 hover:text-[#008B47] hover:underline truncate text-[11px] leading-tight flex items-center gap-1 group"
                                    title={`Open "${item.title}" on storefront`}
                                  >
                                    <span className="truncate">{item.title}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#008B47] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Link>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-bold text-slate-700 bg-slate-100 px-1 py-0.2 rounded">
                                      Qty: {item.qty}
                                    </span>
                                    {item.variantName && (
                                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded truncate max-w-[90px]">
                                        {item.variantName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {order.items.length > 2 && (
                            <Link
                              href={`/admin/orders?orderId=${order.id}`}
                              className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 pt-0.5"
                            >
                              <span>+{order.items.length - 2} more product{order.items.length - 2 > 1 ? "s" : ""}</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No products listed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      <div>{order.district || "Dhaka"}</div>
                      <div className="text-[10px] text-slate-400">{order.phone}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {order.payment}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : order.status === "SHIPPED"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : order.status === "PROCESSING"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : order.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400 text-[11px]">
                      {order.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
