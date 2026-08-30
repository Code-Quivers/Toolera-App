"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Wallet,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Layers,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { useProductStore } from "@/store/useProductStore";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatPrice } from "@/lib/formatters";

export default function AdminProfitLossPage() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { expenses } = useExpenseStore();

  const [timeRange, setTimeRange] = useState<"THIS_MONTH" | "LAST_30" | "THIS_YEAR" | "ALL">("THIS_MONTH");

  // Date Filtering
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const firstDayOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const firstDayOfYearStr = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  const filterByDate = (dateString?: string) => {
    if (!dateString) return true;
    const itemDate = dateString.split("T")[0];
    if (timeRange === "THIS_MONTH") return itemDate >= firstDayOfMonthStr;
    if (timeRange === "LAST_30") return itemDate >= thirtyDaysAgoStr;
    if (timeRange === "THIS_YEAR") return itemDate >= firstDayOfYearStr;
    return true;
  };

  // 1. Filtered Orders (excluding cancelled orders)
  const validOrders = orders.filter(
    (o) => o.status !== "CANCELLED" && filterByDate(o.time)
  );

  // 2. Gross Sales Revenue
  const grossSalesRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // 3. COGS Calculation
  let totalCOGS = 0;
  validOrders.forEach((o) => {
    o.items?.forEach((item) => {
      // Look up product to find costPrice
      const matched = products.find(
        (p) => p.title.toLowerCase() === item.title.toLowerCase() || p.id === (item as any).productId
      );
      const costPerUnit = matched?.costPrice || Math.round(item.price * 0.65); // Fallback: 65% estimated procurement cost
      totalCOGS += costPerUnit * item.qty;
    });
  });

  // 4. Gross Profit
  const grossProfit = grossSalesRevenue - totalCOGS;
  const grossMargin = grossSalesRevenue > 0 ? (grossProfit / grossSalesRevenue) * 100 : 0;

  // 5. Operating Expenses
  const filteredExpenses = expenses.filter((e) => filterByDate(e.date));
  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for expenses
  const expenseByCategory: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });

  // 6. Net Profit / Loss
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMargin = grossSalesRevenue > 0 ? (netProfit / grossSalesRevenue) * 100 : 0;
  const isNetProfitable = netProfit >= 0;

  // Export CSV
  const handleExportCSV = () => {
    const lines = [
      ["FINANCIAL PROFIT & LOSS STATEMENT", ""],
      ["Period", timeRange],
      ["Generated At", new Date().toLocaleString()],
      ["", ""],
      ["INCOME / REVENUE", "AMOUNT (BDT)"],
      ["Gross Sales Revenue (Delivered & Active Orders)", grossSalesRevenue],
      ["Total Units Sold", validOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.qty, 0) || 0), 0)],
      ["", ""],
      ["COST OF GOODS SOLD (COGS)", ""],
      ["Product Procurement & Inventory Cost", totalCOGS],
      ["GROSS PROFIT", grossProfit],
      ["Gross Margin %", `${grossMargin.toFixed(1)}%`],
      ["", ""],
      ["OPERATING EXPENSES", ""],
      ...Object.entries(expenseByCategory).map(([cat, amt]) => [cat, amt]),
      ["TOTAL OPERATING EXPENSES", totalOperatingExpenses],
      ["", ""],
      ["NET OPERATING PROFIT / (LOSS)", netProfit],
      ["Net Profit Margin %", `${netMargin.toFixed(1)}%`],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + lines.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `profit-loss-statement-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#008B47]" />
            <span>Profit &amp; Loss (P&amp;L) Financial Statement (লাভ-ক্ষতি রিপোর্ট)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time business net profitability: Revenue − COGS (Cost of Goods) − Operational Overheads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Filter Pills */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange("THIS_MONTH")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === "THIS_MONTH" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange("LAST_30")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === "LAST_30" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange("THIS_YEAR")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === "THIS_YEAR" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setTimeRange("ALL")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeRange === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Statement (CSV/Excel)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales Revenue</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(grossSalesRevenue)}</div>
          <p className="text-[11px] text-slate-400 font-medium">{validOrders.length} Completed Orders</p>
        </div>

        {/* COGS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Cost of Goods (COGS)</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{formatPrice(totalCOGS)}</div>
          <p className="text-[11px] text-slate-400 font-medium">Product procurement costs</p>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Operating Expenses</span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{formatPrice(totalOperatingExpenses)}</div>
          <p className="text-[11px] text-slate-400 font-medium">{filteredExpenses.length} Expense records</p>
        </div>

        {/* Net Profit */}
        <div
          className={`p-5 rounded-2xl border shadow-2xs space-y-2 ${
            isNetProfitable ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isNetProfitable ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              Net Profit / (Loss)
            </span>
            {isNetProfitable ? (
              <ArrowUpRight className="w-4 h-4 text-[#008B47]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-2xl font-black ${
              isNetProfitable ? "text-[#008B47]" : "text-rose-700"
            }`}
          >
            {formatPrice(netProfit)}
          </div>
          <p
            className={`text-[11px] font-bold ${
              isNetProfitable ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            Net Margin: {netMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Structured Financial P&L Ledger Statement */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Income &amp; Expense Accounting Breakdown</h3>
            <p className="text-xs text-slate-400">Formal profit and loss statement conforming to GAAP standards.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 font-mono">
            {timeRange.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-6 text-xs font-medium text-slate-700">
          {/* 1. REVENUE SECTION */}
          <div className="space-y-2">
            <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] text-emerald-800 border-b border-slate-100 pb-1">
              1. Revenue (মোট বিক্রয় আয়)
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Gross Product Sales</span>
              <span className="font-mono font-bold">{formatPrice(grossSalesRevenue)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-slate-500 pl-4 border-l-2 border-slate-200">
              <span>Total Orders Delivered / Confirmed</span>
              <span>{validOrders.length} orders</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-200 font-extrabold text-slate-900 bg-slate-50/60 px-3 rounded-xl">
              <span>Total Net Revenue</span>
              <span className="font-mono font-black text-sm">{formatPrice(grossSalesRevenue)}</span>
            </div>
          </div>

          {/* 2. COST OF GOODS SOLD SECTION */}
          <div className="space-y-2">
            <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] text-amber-800 border-b border-slate-100 pb-1">
              2. Cost of Goods Sold (COGS - পণ্যের ক্রয়মূল্য)
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Direct Inventory Procurement Cost</span>
              <span className="font-mono font-bold text-amber-700">({formatPrice(totalCOGS)})</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-200 font-extrabold text-slate-900 bg-amber-50/50 px-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span>Gross Profit (মোট লাভ)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900">
                  Margin: {grossMargin.toFixed(1)}%
                </span>
              </div>
              <span className="font-mono font-black text-sm text-amber-950">{formatPrice(grossProfit)}</span>
            </div>
          </div>

          {/* 3. OPERATING EXPENSES SECTION */}
          <div className="space-y-2">
            <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] text-rose-800 border-b border-slate-100 pb-1 flex items-center justify-between">
              <span>3. Operating Expenses (ব্যবসার পরিচালন খরচ)</span>
              <Link href="/admin/expenses" className="text-rose-600 hover:underline text-[10px] font-bold">
                View Expense Details →
              </Link>
            </div>

            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="py-2 text-slate-400 italic">No expenses recorded for this time period.</div>
            ) : (
              Object.entries(expenseByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between py-1 text-slate-600">
                  <span>{cat}</span>
                  <span className="font-mono font-bold">({formatPrice(amt)})</span>
                </div>
              ))
            )}

            <div className="flex items-center justify-between py-2 border-t border-slate-200 font-extrabold text-slate-900 bg-rose-50/50 px-3 rounded-xl">
              <span>Total Operating Overheads</span>
              <span className="font-mono font-black text-sm text-rose-700">({formatPrice(totalOperatingExpenses)})</span>
            </div>
          </div>

          {/* 4. FINAL NET PROFIT / LOSS SUMMARY */}
          <div
            className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
              isNetProfitable
                ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                : "bg-rose-50 border-rose-400 text-rose-950"
            }`}
          >
            <div>
              <div className="text-base font-black tracking-tight">
                {isNetProfitable ? "NET PROFIT (প্রকৃত নিট লাভ)" : "NET LOSS (নিট ক্ষতি)"}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Calculated as Net Sales Revenue minus COGS minus Operational Expenses.
              </span>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black font-mono">
                {formatPrice(netProfit)}
              </div>
              <span className="text-xs font-extrabold block">
                Net Profit Margin: {netMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
