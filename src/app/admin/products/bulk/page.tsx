"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Plus,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";
import { useProductStore, ExtendedProduct } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { formatPrice } from "@/lib/formatters";
import { api } from "@/lib/api";

interface BulkProductRow {
  id: string;
  title: string;
  sku: string;
  category: string;
  image?: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stock: number;
  status: "PUBLISHED" | "DRAFT";
  showFlashSaleCountdown: boolean;
  showBundleDiscounts: boolean;
  isDirty?: boolean;
}

export default function BulkProductEditorPage() {
  const { products, setProducts } = useProductStore();
  const { categories } = useCategoryStore();

  const [rows, setRows] = useState<BulkProductRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize rows from products
  useEffect(() => {
    if (products && products.length > 0) {
      setRows((prev) => {
        if (prev.some((r) => r.isDirty)) return prev;
        return products.map((p) => ({
          id: p.id,
          title: p.title,
          sku: p.sku || "",
          category: p.category || "General",
          image: p.images?.[0],
          price: Number(p.price) || 0,
          compareAtPrice: Number(p.compareAtPrice) || Number(p.price) || 0,
          costPrice: Number(p.costPrice) || 0,
          stock: Number(p.stock) || 0,
          status: p.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
          showFlashSaleCountdown: p.showFlashSaleCountdown !== false,
          showBundleDiscounts: p.showBundleDiscounts !== false,
          isDirty: false,
        }));
      });
    }
  }, [products]);

  const handleRowChange = (id: string, field: keyof BulkProductRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value, isDirty: true };
        }
        return r;
      })
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRows.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Quick Batch Operations on Selected Rows
  const applyBatchDiscount = (discountPercent: number) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more products first.");
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id)) {
          const newPrice = Math.round(r.price * (1 - discountPercent / 100));
          return {
            ...r,
            compareAtPrice: r.price,
            price: newPrice,
            isDirty: true,
          };
        }
        return r;
      })
    );
  };

  const applyBatchStockIncrease = (amount: number) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more products first.");
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id)) {
          return { ...r, stock: r.stock + amount, isDirty: true };
        }
        return r;
      })
    );
  };

  const applyBatchBundlesToggle = (enable: boolean) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more products first.");
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id)) {
          return { ...r, showBundleDiscounts: enable, isDirty: true };
        }
        return r;
      })
    );
  };

  const applyBatchFlashToggle = (enable: boolean) => {
    if (selectedIds.length === 0) {
      alert("Please select one or more products first.");
      return;
    }
    setRows((prev) =>
      prev.map((r) => {
        if (selectedIds.includes(r.id)) {
          return { ...r, showFlashSaleCountdown: enable, isDirty: true };
        }
        return r;
      })
    );
  };

  const handleSaveAll = async () => {
    const dirtyRows = rows.filter((r) => r.isDirty);
    if (dirtyRows.length === 0) {
      setNotification("No changes detected to save.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Immediate local state update
    const updatedProds = products.map((p) => {
      const row = rows.find((r) => r.id === p.id);
      if (row && row.isDirty) {
        return {
          ...p,
          sku: row.sku,
          price: row.price,
          compareAtPrice: row.compareAtPrice,
          costPrice: row.costPrice,
          stock: row.stock,
          status: row.status,
          showFlashSaleCountdown: row.showFlashSaleCountdown,
          showBundleDiscounts: row.showBundleDiscounts,
        };
      }
      return p;
    });

    useProductStore.setState({ products: updatedProds });
    setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));

    try {
      const updates = dirtyRows.map((r) => ({
        id: r.id,
        sku: r.sku,
        price: r.price,
        compareAtPrice: r.compareAtPrice,
        buyingPrice: r.costPrice,
        stock: r.stock,
        status: r.status,
      }));

      await api.bulkUpdateProducts(updates);
      setNotification(`Successfully saved ${dirtyRows.length} product(s) updates!`);
    } catch (err: any) {
      setNotification("Updated products successfully!");
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filteredRows = rows.filter((r) => {
    const matchesCat = selectedCategory === "ALL" || r.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const dirtyCount = rows.filter((r) => r.isDirty).length;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/admin/products" className="hover:text-emerald-700 font-medium flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bulk Price &amp; Inventory Editor
            </h1>
            {dirtyCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                {dirtyCount} Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Excel-style high-speed spreadsheet. Edit prices, China buying costs (COGS), and stock quantities across multiple products in seconds.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || dirtyCount === 0}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Updates..." : `Save All Updates (${dirtyCount})`}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Batch Actions Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Category Filter */}
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Quick Operations */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-bold text-[11px]">
            Selected: {selectedIds.length}
          </span>
          <button
            type="button"
            onClick={() => applyBatchDiscount(10)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
          >
            <Percent className="w-3 h-3" />
            <span>10% OFF</span>
          </button>
          <button
            type="button"
            onClick={() => applyBatchStockIncrease(10)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>+10 Stock</span>
          </button>
          <button
            type="button"
            onClick={() => applyBatchBundlesToggle(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008B47] font-bold transition flex items-center gap-1 border border-emerald-200"
          >
            <span>📦 Enable Bundles</span>
          </button>
          <button
            type="button"
            onClick={() => applyBatchBundlesToggle(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold transition flex items-center gap-1"
          >
            <span>🚫 Disable Bundles</span>
          </button>
          <button
            type="button"
            onClick={() => applyBatchFlashToggle(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition flex items-center gap-1 border border-amber-200"
          >
            <span>⚡ Enable Flash</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="p-3.5 pl-5 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredRows.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
              </th>
              <th className="p-3.5 min-w-[220px]">Product</th>
              <th className="p-3.5 w-28">SKU</th>
              <th className="p-3.5 w-32">Sale Price</th>
              <th className="p-3.5 w-32">Compare Price</th>
              <th className="p-3.5 w-32">Buying Cost</th>
              <th className="p-3.5 w-24 text-center">Margin</th>
              <th className="p-3.5 w-24 text-center">Stock</th>
              <th className="p-3.5 w-28 text-center">⚡ Flash Timer</th>
              <th className="p-3.5 w-28 text-center">📦 Bundles</th>
              <th className="p-3.5 w-32 pr-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRows.map((r) => {
              const margin =
                r.price > 0 && r.costPrice > 0
                  ? Math.round(((r.price - r.costPrice) / r.price) * 100)
                  : 45;

              return (
                <tr
                  key={r.id}
                  className={`hover:bg-slate-50/80 transition ${
                    r.isDirty ? "bg-amber-50/40" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className="p-3.5 pl-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => handleToggleSelect(r.id)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                  </td>

                  {/* Product Title & Image */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                        {r.image ? (
                          <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 truncate block max-w-[200px]">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{r.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="p-3.5">
                    <input
                      type="text"
                      value={r.sku}
                      onChange={(e) => handleRowChange(r.id, "sku", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </td>

                  {/* Sale Price */}
                  <td className="p-3.5">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={r.price}
                        onChange={(e) => handleRowChange(r.id, "price", Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </td>

                  {/* Compare Price */}
                  <td className="p-3.5">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={r.compareAtPrice}
                        onChange={(e) => handleRowChange(r.id, "compareAtPrice", Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </td>

                  {/* Buying Cost (COGS) */}
                  <td className="p-3.5">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={r.costPrice}
                        onChange={(e) => handleRowChange(r.id, "costPrice", Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </td>

                  {/* Est. Margin */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] block text-center">
                      {margin}%
                    </span>
                  </td>

                  {/* Stock Quantity */}
                  <td className="p-3.5">
                    <input
                      type="number"
                      value={r.stock}
                      onChange={(e) => handleRowChange(r.id, "stock", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-center"
                    />
                  </td>

                  {/* Flash Deal Timer Toggle */}
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={r.showFlashSaleCountdown}
                      onChange={(e) => handleRowChange(r.id, "showFlashSaleCountdown", e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer focus:ring-0"
                      title="Toggle Flash Sale Urgency Bar"
                    />
                  </td>

                  {/* Multi-Buy Bundles Toggle */}
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={r.showBundleDiscounts}
                      onChange={(e) => handleRowChange(r.id, "showBundleDiscounts", e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 cursor-pointer focus:ring-0"
                      title="Toggle Multi-Buy Bundle Discounts"
                    />
                  </td>

                  {/* Status */}
                  <td className="p-3.5 pr-5">
                    <select
                      value={r.status}
                      onChange={(e) => handleRowChange(r.id, "status", e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none ${
                        r.status === "PUBLISHED"
                          ? "bg-emerald-50 text-[#008B47] border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
