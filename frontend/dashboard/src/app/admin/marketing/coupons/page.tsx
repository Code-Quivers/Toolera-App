"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Edit,
  Download,
  Search,
  Check,
  X,
  Percent,
  Save,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { CouponItem, useCouponStore } from "@/store/useCouponStore";
export type { CouponItem };

export default function AdminCouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCouponStore();

  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Coupon Form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED_BDT">("FIXED_BDT");
  const [newValue, setNewValue] = useState<number | string>(100);
  const [newMinOrder, setNewMinOrder] = useState<number | string>(1000);
  const [newLimit, setNewLimit] = useState<number | string>(500);
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newDesc, setNewDesc] = useState("");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const created: CouponItem = {
      id: `coup-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discountType: newType,
      discountValue: Number(newValue),
      minOrder: Number(newMinOrder),
      usageLimit: Number(newLimit) || 500,
      usageCount: 0,
      active: true,
      expiryDate: newExpiry || "2026-12-31",
      description: newDesc.trim() || `Promo code ${newCode.trim().toUpperCase()}`,
    };

    addCoupon(created);
    setNewCode("");
    setNewValue(100);
    setNewMinOrder(1000);
    setNewDesc("");
    setIsAddModalOpen(false);
    showNotification(`Coupon "${created.code}" created successfully!`);
  };

  // Update Coupon
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    updateCoupon(editingCoupon.id, editingCoupon);
    setEditingCoupon(null);
    showNotification(`Coupon "${editingCoupon.code}" updated!`);
  };

  // Toggle Active
  const toggleActive = (id: string) => {
    const coup = coupons.find((c) => c.id === id);
    if (coup) {
      updateCoupon(id, { active: !coup.active });
    }
  };

  // Delete Coupon
  const handleDelete = (id: string, code: string) => {
    if (confirm(`Delete promo code "${code}"?`)) {
      deleteCoupon(id);
      showNotification(`Coupon "${code}" deleted.`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Coupon Code",
      "Discount Type",
      "Discount Value",
      "Min Order (BDT)",
      "Usage Count",
      "Usage Limit",
      "Status",
      "Expiry Date",
      "Description",
    ];

    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.code}"`,
      `"${c.discountType}"`,
      c.discountValue,
      c.minOrder,
      c.usageCount,
      c.usageLimit,
      c.active ? "Active" : "Inactive",
      `"${c.expiryDate || "N/A"}"`,
      `"${(c.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toolera-coupons-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filtered.length} coupons to CSV!`);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-[#008B47]" />
            <span>Coupons &amp; Promotions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create discount vouchers, manage min spend rules, track redemptions, and export CSV.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Coupons (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
          />
        </div>

        <span className="text-xs font-mono font-bold text-slate-400">
          Active: {coupons.filter((c) => c.active).length} / {coupons.length}
        </span>
      </div>

      {/* Coupons Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Promo Code</th>
              <th className="py-3 px-3">Discount Value</th>
              <th className="py-3 px-3">Min Order</th>
              <th className="py-3 px-3">Usage</th>
              <th className="py-3 px-3">Expiry Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">CRUD Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No coupons found.
                </td>
              </tr>
            ) : (
              filtered.map((coup) => (
                <tr key={coup.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008B47] flex items-center justify-center font-mono font-black">
                        %
                      </div>
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm block">
                          {coup.code}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">
                          {coup.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs">
                      {coup.discountType === "PERCENTAGE"
                        ? `${coup.discountValue}% OFF`
                        : `৳${coup.discountValue} OFF`}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {formatPrice(coup.minOrder)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-slate-700 font-mono">
                      {coup.usageCount} / {coup.usageLimit}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 font-mono">
                    {coup.expiryDate || "No Expiry"}
                  </td>

                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(coup.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                        coup.active
                          ? "bg-emerald-50 text-[#008B47] border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {coup.active ? "Active" : "Disabled"}
                    </button>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCoupon({ ...coup })}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Edit Coupon"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(coup.id, coup.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Coupon"
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

      {/* ============================================================== */}
      {/* 1. ADD COUPON MODAL                                            */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-base text-slate-900">Create Discount Promo Code</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black uppercase focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Discount Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="FIXED_BDT">Fixed Amount (৳ BDT)</option>
                    <option value="PERCENTAGE">Percentage (% OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Minimum Order Spend (BDT)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Usage Limit</label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Special weekend promotion for all items"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EDIT COUPON MODAL                                           */}
      {/* ============================================================== */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-base text-slate-900">Edit Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black uppercase focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Discount Type</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="FIXED_BDT">Fixed Amount (৳ BDT)</option>
                    <option value="PERCENTAGE">Percentage (% OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discountValue}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Minimum Order Spend (BDT)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrder}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        minOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Usage Limit</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        usageLimit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  value={editingCoupon.expiryDate || ""}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  value={editingCoupon.description || ""}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
