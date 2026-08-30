"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductStore, ExtendedProduct } from "@/store/useProductStore";
import { useStockLogStore, StockLogType } from "@/store/useStockLogStore";
import { useExpenseStore } from "@/store/useExpenseStore";
import { formatPrice } from "@/lib/formatters";
import {
  Warehouse,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowUpRight,
  Download,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  X,
  Boxes,
  RotateCcw,
  Check,
  Save,
  Package,
  History,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  ArrowDownRight,
} from "lucide-react";

export default function AdminInventoryPage() {
  const { products, quickEditProduct } = useProductStore();
  const { logs, addLog } = useStockLogStore();
  const { addExpense } = useExpenseStore();

  const [activeTab, setActiveTab] = useState<"INVENTORY" | "HISTORY" | "WASTAGE">("INVENTORY");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<ExtendedProduct | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("RESTOCK");

  // Wastage / Damage Write-Off Modal
  const [wastageModalOpen, setWastageModalOpen] = useState(false);
  const [wastageProductId, setWastageProductId] = useState("");
  const [wastageQty, setWastageQty] = useState<number>(1);
  const [wastageReason, setWastageReason] = useState("Transit Damaged");
  const [wastageUnitCost, setWastageUnitCost] = useState<string>("");
  const [wastageNote, setWastageNote] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterMode === "LOW_STOCK") return matchesSearch && p.stock <= (p.lowStockThreshold || 8) && p.stock > 0;
    if (filterMode === "OUT_OF_STOCK") return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 8) && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  // Stock Quick Increment/Decrement
  const handleStockDelta = (product: ExtendedProduct, delta: number) => {
    const oldStock = product.stock;
    const newStock = Math.max(0, oldStock + delta);
    quickEditProduct(product.id, { stock: newStock });

    addLog({
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      previousStock: oldStock,
      newStock,
      delta,
      type: delta > 0 ? "RESTOCK" : "MANUAL",
      note: `Quick ${delta > 0 ? "increment" : "decrement"} from matrix`,
      actor: "Admin",
    });

    showNotification(`Stock adjusted to ${newStock} units`);
  };

  // Stock Adjustment Save Modal
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const oldStock = adjustingProduct.stock;
    const newStock = Math.max(0, oldStock + adjustQty);

    quickEditProduct(adjustingProduct.id, {
      stock: newStock,
      lowStockThreshold: adjustingProduct.lowStockThreshold || 5,
    });

    addLog({
      productId: adjustingProduct.id,
      productTitle: adjustingProduct.title,
      sku: adjustingProduct.sku,
      previousStock: oldStock,
      newStock,
      delta: adjustQty,
      type: adjustQty > 0 ? "RESTOCK" : "MANUAL",
      note: `Manual adjustment (${adjustReason})`,
      actor: "Admin",
    });

    setAdjustingProduct(null);
    setAdjustQty(0);
    showNotification(`Successfully updated inventory for "${adjustingProduct.title}" to ${newStock} units!`);
  };

  // Record Damage / Wastage Submit
  const handleRecordWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === wastageProductId);
    if (!product || wastageQty <= 0) return;

    const oldStock = product.stock;
    const actualDeduct = Math.min(product.stock, wastageQty);
    const newStock = Math.max(0, oldStock - actualDeduct);
    const unitCost = parseFloat(wastageUnitCost) || product.costPrice || Math.round(product.price * 0.7);
    const totalLoss = unitCost * actualDeduct;

    // 1. Update product stock
    quickEditProduct(product.id, { stock: newStock });

    // 2. Add Stock Log
    addLog({
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      previousStock: oldStock,
      newStock,
      delta: -actualDeduct,
      type: "DAMAGE",
      costLoss: totalLoss,
      note: `${wastageReason}${wastageNote ? `: ${wastageNote}` : ""}`,
      actor: "Admin",
    });

    // 3. Record in Expense store as Damage/Loss
    addExpense({
      title: `Inventory Damage Write-off: ${product.title} (${actualDeduct} units)`,
      category: "Other",
      amount: totalLoss,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "CASH",
      notes: `${wastageReason}. Wrote off ${actualDeduct} units.`,
    });

    setWastageModalOpen(false);
    setWastageProductId("");
    setWastageQty(1);
    setWastageNote("");
    setWastageUnitCost("");
    showNotification(`Recorded ${actualDeduct} units of damage write-off (৳${totalLoss} total loss).`);
  };

  // Export Inventory CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Product Title",
      "SKU",
      "Category",
      "Current Stock",
      "Low Stock Threshold",
      "Cost Price (BDT)",
      "Sale Price (BDT)",
      "Stock Status",
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.categorySlug}"`,
      p.stock,
      p.lowStockThreshold || 5,
      p.costPrice || 0,
      p.price,
      p.stock === 0 ? "OUT_OF_STOCK" : p.stock <= (p.lowStockThreshold || 8) ? "LOW_STOCK" : "IN_STOCK",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory-matrix-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported inventory matrix to CSV!`);
  };

  // Filtered Logs
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.sku && l.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.note && l.note.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "WASTAGE") return matchesSearch && l.type === "DAMAGE";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Warehouse className="w-7 h-7 text-[#008B47]" />
            <span>Inventory, Stock &amp; Wastage Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time warehouse inventory, restock items, view stock audit logs, and record wastage write-offs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Stock (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setWastageModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>- Record Wastage / Damage</span>
          </button>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Total Stock Units</span>
            <div className="text-2xl font-black text-slate-900">{totalStockUnits.toLocaleString()}</div>
            <span className="text-[11px] text-slate-500">{products.length} Products Active</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008B47] flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Low Stock Warnings</span>
            <div className="text-2xl font-black text-amber-600">{lowStockCount}</div>
            <span className="text-[11px] text-amber-700 font-medium">Reorder Recommended</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Wastage &amp; Damaged Units</span>
            <div className="text-2xl font-black text-rose-600">
              {logs
                .filter((l) => l.type === "DAMAGE")
                .reduce((acc, l) => acc + Math.abs(l.delta), 0)}
            </div>
            <span className="text-[11px] text-rose-700 font-medium">
              Loss: {formatPrice(logs.filter((l) => l.type === "DAMAGE").reduce((acc, l) => acc + (l.costLoss || 0), 0))}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "INVENTORY"
              ? "bg-[#008B47] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Live Inventory &amp; Restock</span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "HISTORY"
              ? "bg-[#008B47] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Movement &amp; Audit Log ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("WASTAGE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "WASTAGE"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Wastage &amp; Damage Write-offs</span>
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "INVENTORY"
                ? "Search inventory by title, SKU, or category..."
                : "Search audit log by title, note, or SKU..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
          />
        </div>

        {activeTab === "INVENTORY" && (
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilterMode("LOW_STOCK")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "LOW_STOCK" ? "bg-amber-500 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterMode("OUT_OF_STOCK")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "OUT_OF_STOCK" ? "bg-rose-500 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: LIVE INVENTORY TABLE */}
      {activeTab === "INVENTORY" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">SKU / Code</th>
                  <th className="py-3.5 px-4">Cost / Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-center">Stock Status</th>
                  <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isOutOfStock = p.stock === 0;
                    const isLowStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 8);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              <Image
                                src={p.images?.[0] || "/assets/placeholder.png"}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{p.title}</div>
                              <span className="text-[10px] text-slate-400 font-medium capitalize">
                                {p.categorySlug.replace(/-/g, " ")}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {p.sku || "N/A"}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{formatPrice(p.price)}</div>
                          {p.costPrice && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Cost: {formatPrice(p.costPrice)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                              isOutOfStock
                                ? "bg-rose-100 text-rose-800"
                                : isLowStock
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {p.stock} units
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Min: {p.lowStockThreshold || 5}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                              Low Stock Alert
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-[#008B47]">
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleStockDelta(p, -1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center shadow-2xs font-black transition"
                              title="Minus 1 Unit"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 font-mono font-bold text-center text-slate-800">
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockDelta(p, 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-[#008B47] flex items-center justify-center shadow-2xs font-black transition"
                              title="Plus 1 Unit"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustQty(0);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: AUDIT LOGS & WASTAGE */}
      {(activeTab === "HISTORY" || activeTab === "WASTAGE") && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4 text-center">Previous</th>
                  <th className="py-3.5 px-4 text-center">Change (Delta)</th>
                  <th className="py-3.5 px-4 text-center">New Stock</th>
                  <th className="py-3.5 px-4">Notes / Reason</th>
                  <th className="py-3.5 px-4">Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No stock movement logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => {
                    const isPositive = l.delta > 0;
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(l.timestamp).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{l.productTitle}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              l.type === "RESTOCK"
                                ? "bg-emerald-100 text-emerald-800"
                                : l.type === "SALE"
                                ? "bg-blue-100 text-blue-800"
                                : l.type === "DAMAGE"
                                ? "bg-rose-100 text-rose-800"
                                : l.type === "RETURN"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {l.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                          {l.previousStock}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-black">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isPositive ? `+${l.delta}` : l.delta}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                          {l.newStock}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {l.note}
                          {l.costLoss && (
                            <span className="block font-bold text-rose-600 text-[10px]">
                              Loss: {formatPrice(l.costLoss)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{l.actor}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Adjust Inventory Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Adjust Stock Quantity</h3>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">{adjustingProduct.title}</span>
                <span className="text-slate-500 font-mono">Current Stock: <strong>{adjustingProduct.stock} units</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Quantity to Add / Subtract</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                  />
                  <span className="text-[10px] text-slate-400">e.g. +50 or -5</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="RESTOCK">Supplier Restock</option>
                    <option value="MANUAL">Physical Audit Count</option>
                    <option value="RETURN">Customer Return</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
                <span>New Resulting Stock:</span>
                <span className="text-base font-black text-[#008B47]">
                  {Math.max(0, adjustingProduct.stock + adjustQty)} units
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Wastage / Damage Write-Off Modal */}
      {wastageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Record Wastage &amp; Damage Write-off</span>
              </h3>
              <button
                type="button"
                onClick={() => setWastageModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordWastage} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Select Damaged Product *</label>
                <select
                  required
                  value={wastageProductId}
                  onChange={(e) => {
                    setWastageProductId(e.target.value);
                    const sel = products.find((p) => p.id === e.target.value);
                    if (sel) {
                      setWastageUnitCost(String(sel.costPrice || Math.round(sel.price * 0.7)));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Damaged Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={wastageQty}
                    onChange={(e) => setWastageQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Loss per Unit (Cost Price) ৳</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={wastageUnitCost}
                    onChange={(e) => setWastageUnitCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Damage Reason *</label>
                <select
                  value={wastageReason}
                  onChange={(e) => setWastageReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="Transit Damaged">Courier / In-Transit Damaged</option>
                  <option value="Factory Defect">Factory Defect / Fabric Ruined</option>
                  <option value="Expired / Spoiled">Expired / Past Best Before</option>
                  <option value="Warehouse Handling Loss">Warehouse Handling Drop / Broken</option>
                  <option value="Lost / Theft">Lost / Unaccounted Shrinkage</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Audit Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Details of inspection..."
                  value={wastageNote}
                  onChange={(e) => setWastageNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center justify-between font-bold">
                <span>Total Financial Loss Recorded:</span>
                <span className="text-base font-black text-rose-700">
                  {formatPrice((parseFloat(wastageUnitCost) || 0) * wastageQty)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWastageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
                >
                  Write Off &amp; Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
