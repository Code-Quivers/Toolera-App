"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  CreditCard,
  Zap,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function PlatformAdminDashboardPage() {
  const stats = [
    { title: "Monthly Recurring Revenue (MRR)", value: "৳1,89,810", change: "+14.2% this month", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { title: "Active Merchant Stores", value: "142", change: "12 registered this week", icon: Store, color: "text-indigo-600 bg-indigo-50" },
    { title: "Paid Subscriptions", value: "128", change: "92% conversion rate", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
    { title: "Registered SaaS Accounts", value: "156", change: "100% tenant isolated", icon: Users, color: "text-blue-600 bg-blue-50" },
  ];

  const recentStores = [
    { name: "Toolera", slug: "toolera", owner: "Rahim Chowdhury (admin@toolera.store)", plan: "Growth", status: "ACTIVE", products: 4, orders: 16, created: "Aug 30, 2026" },
    { name: "Gadget World", slug: "gadget-world", owner: "Tanvir Ahmed", plan: "Starter", status: "ACTIVE", products: 18, orders: 42, created: "Aug 28, 2026" },
    { name: "Dhaka Fashion House", slug: "dhaka-fashion", owner: "Sadia Islam", plan: "Pro", status: "ACTIVE", products: 210, orders: 184, created: "Aug 25, 2026" },
    { name: "Organic Bazar BD", slug: "organic-bazar", owner: "Kamal Hossain", plan: "Starter", status: "TRIALING", products: 35, orders: 11, created: "Aug 29, 2026" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Platform Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Toolera SaaS Platform Administration</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <span className="text-xs text-slate-400">Master tenant management &amp; revenue oversight</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/platform-admin/stores"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Store className="w-3.5 h-3.5" />
              <span>All Tenant Stores</span>
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Back to Merchant Admin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{st.title}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${st.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">{st.value}</span>
                  <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">{st.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Stores Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Active Merchant Tenants</h2>
              <p className="text-xs text-slate-400">Stores currently running on your SaaS infrastructure.</p>
            </div>
            <Link
              href="/platform-admin/stores"
              className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View All 142 Stores</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Store Name &amp; URL</th>
                  <th className="py-3.5 px-4">Owner Account</th>
                  <th className="py-3.5 px-4">Subscription Plan</th>
                  <th className="py-3.5 px-4">Catalog / Orders</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {recentStores.map((store, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{store.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        https://{store.slug}.toolera.app
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{store.owner}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-emerald-400 border border-slate-700">
                        {store.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {store.products} prods &bull; {store.orders} orders
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        store.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href="/"
                        target="_blank"
                        className="text-xs text-slate-400 hover:text-white font-bold"
                      >
                        Inspect
                      </Link>
                      <button
                        type="button"
                        onClick={() => alert("Store management action for " + store.name)}
                        className="text-xs text-emerald-400 hover:underline font-bold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
