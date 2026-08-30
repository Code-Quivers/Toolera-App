"use client";

import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Tag,
  Trash2,
  Edit,
  TrendingDown,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  PieChart,
  ArrowDownRight,
} from "lucide-react";
import { useExpenseStore, ExpenseItem, ExpenseCategory } from "@/store/useExpenseStore";
import { formatPrice } from "@/lib/formatters";

const CATEGORIES: ExpenseCategory[] = [
  "Shop Rent",
  "Marketing & Ads",
  "Packaging Materials",
  "Staff Salary",
  "Delivery & Courier Fee",
  "Utilities & Internet",
  "Office & Store Supplies",
  "Maintenance & Repairs",
  "Other",
];

export default function AdminExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "THIS_MONTH" | "LAST_30">("THIS_MONTH");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Marketing & Ads");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem["paymentMethod"]>("BKASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setCategory("Marketing & Ads");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("BKASH");
    setReferenceNumber("");
    setNotes("");
    setEditingExpense(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount.toString());
    setDate(exp.date);
    setPaymentMethod(exp.paymentMethod);
    setReferenceNumber(exp.referenceNumber || "");
    setNotes(exp.notes || "");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: title.trim(),
        category,
        amount: numAmount,
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        title: title.trim(),
        category,
        amount: numAmount,
        date,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, expTitle: string) => {
    if (confirm(`Are you sure you want to delete expense "${expTitle}"?`)) {
      deleteExpense(id);
    }
  };

  // Date Filtering Logic
  const todayStr = new Date().toISOString().split("T")[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.referenceNumber && exp.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || exp.category === selectedCategory;

    let matchesTime = true;
    if (timeFilter === "THIS_MONTH") {
      matchesTime = exp.date >= firstDayOfMonthStr;
    } else if (timeFilter === "LAST_30") {
      matchesTime = exp.date >= thirtyDaysAgoStr;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Calculate totals
  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthTotal = expenses
    .filter((e) => e.date >= firstDayOfMonthStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Category Distribution
  const categoryStats: Record<string, number> = {};
  filteredExpenses.forEach((exp) => {
    categoryStats[exp.category] = (categoryStats[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Title", "Category", "Amount (BDT)", "Date", "Payment Method", "Reference", "Notes"];
    const rows = filteredExpenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      e.date,
      e.paymentMethod,
      `"${e.referenceNumber || ""}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `expenses-report-${todayStr}.csv`);
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
            <Wallet className="w-7 h-7 text-rose-500" />
            <span>Expense Management (এক্সপেন্স ম্যানেজমেন্ট)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track business overheads, shop rent, ad spend, runner fees, and operating costs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Expenses (CSV/Excel)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record New Expense</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(thisMonthTotal)}</div>
          <p className="text-[11px] text-slate-400">From 1st of current month</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today Expense</span>
            <ArrowDownRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPrice(todayTotal)}</div>
          <p className="text-[11px] text-slate-400">Recorded for today</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Filtered Total</span>
            <TrendingDown className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-900">{formatPrice(totalFilteredAmount)}</div>
          <p className="text-[11px] text-slate-400">{filteredExpenses.length} records matching</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Top Spending Category</span>
            <PieChart className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            {sortedCategories[0] ? sortedCategories[0][0] : "None"}
          </div>
          <p className="text-[11px] text-slate-400 font-bold">
            {sortedCategories[0] ? formatPrice(sortedCategories[0][1]) : "৳0"}
          </p>
        </div>
      </div>

      {/* Category Spending Breakdown Progress Bars */}
      {sortedCategories.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-500" />
            <span>Category Spending Distribution</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map(([cat, catAmount]) => {
              const pct = Math.round((catAmount / (totalFilteredAmount || 1)) * 100);
              return (
                <div key={cat} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{cat}</span>
                    <span className="font-extrabold text-slate-900">{formatPrice(catAmount)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">{pct}% of total</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Time Filter */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeFilter("THIS_MONTH")}
              className={`px-3 py-1 rounded-lg transition ${
                timeFilter === "THIS_MONTH" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter("LAST_30")}
              className={`px-3 py-1 rounded-lg transition ${
                timeFilter === "LAST_30" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                timeFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Expense Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Reference / Note</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">No expenses found matching the criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600 font-bold">{exp.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {exp.referenceNumber && (
                        <span className="font-mono text-[11px] block text-slate-700">
                          {exp.referenceNumber}
                        </span>
                      )}
                      {exp.notes && <span className="text-[11px] text-slate-400 block">{exp.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 whitespace-nowrap text-sm">
                      {formatPrice(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-500" />
                <span>{editingExpense ? "Edit Expense" : "Record New Expense"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facebook Ads Boosting, Shop Rent, Runner Conveyance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Amount (BDT ৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as ExpenseItem["paymentMethod"])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Reference / Voucher No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TRX-9041 or Voucher #042"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any details about this expense..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
                >
                  {editingExpense ? "Save Changes" : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
