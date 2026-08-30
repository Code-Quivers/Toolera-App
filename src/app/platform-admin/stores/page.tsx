"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Search,
  ArrowLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Ban,
} from "lucide-react";

export default function PlatformStoresListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const stores = [
    { id: "1", name: "Raifa's Mart", slug: "raifas-mart", owner: "Rahim Chowdhury", email: "admin@raifasmart.com", plan: "Growth", status: "ACTIVE", products: 4, orders: 16, revenue: "৳24,500" },
    { id: "2", name: "Gadget World", slug: "gadget-world", owner: "Tanvir Ahmed", email: "tanvir@gadgets.com", plan: "Starter", status: "ACTIVE", products: 18, orders: 42, revenue: "৳68,200" },
    { id: "3", name: "Dhaka Fashion House", slug: "dhaka-fashion", owner: "Sadia Islam", email: "sadia@fashion.com", plan: "Pro", status: "ACTIVE", products: 210, orders: 184, revenue: "৳2,45,000" },
    { id: "4", name: "Organic Bazar BD", slug: "organic-bazar", owner: "Kamal Hossain", email: "kamal@organic.com", plan: "Starter", status: "TRIALING", products: 35, orders: 11, revenue: "৳14,900" },
  ];

  const filtered = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.slug.includes(searchTerm.toLowerCase());
    const matchFilter = activeFilter === "ALL" || s.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/platform-admin"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">All Tenant Stores</h1>
              <span className="text-xs text-slate-400">Master database of all registered e-commerce merchants</span>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {stores.length} Registered Tenants
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search store by name, subdomain, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {["ALL", "ACTIVE", "TRIALING", "SUSPENDED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setActiveFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeFilter === st
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Store</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Lifetime Revenue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        https://{s.slug}.toolera.app
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white block">{s.owner}</span>
                      <span className="text-[10px] text-slate-400">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-emerald-400 border border-slate-700">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{s.revenue}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => alert("Toggling status for " + s.name)}
                        className="text-xs text-slate-400 hover:text-amber-400 font-bold"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() => alert("Change plan for " + s.name)}
                        className="text-xs text-emerald-400 hover:underline font-bold"
                      >
                        Change Plan
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
