"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductStore, ExtendedProduct } from "@/store/useProductStore";
import { formatPrice } from "@/lib/formatters";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Flame,
  Star,
  CheckSquare,
  Square,
  X,
  Eye,
  Copy,
  Download,
  Filter,
  Check,
  Layers,
  Sparkles,
  Tag,
  Boxes,
} from "lucide-react";

export default function AdminProductsPage() {
  const { products, deleteProduct, quickEditProduct, duplicateProduct, bulkAction } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals & Drawers
  const [quickEditingProduct, setQuickEditingProduct] = useState<ExtendedProduct | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ExtendedProduct | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "all" || p.categorySlug === selectedCat;
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const categoriesList = Array.from(new Set(products.map((p) => p.categorySlug)));

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = (action: "trending" | "featured" | "delete" | "publish" | "draft") => {
    if (selectedIds.length === 0) return;

    if (action === "delete") {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} selected product(s)?`)) {
        bulkAction(selectedIds, "delete");
        setSelectedIds([]);
        showNotification(`${selectedIds.length} products deleted.`);
      }
    } else {
      bulkAction(selectedIds, action);
      setSelectedIds([]);
      showNotification(`Applied ${action} to ${selectedIds.length} products!`);
    }
  };

  // Single Delete
  const handleDeleteProduct = (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deleteProduct(id);
      if (viewingProduct?.id === id) setViewingProduct(null);
      showNotification(`Product "${title}" deleted.`);
    }
  };

  // Duplicate Product
  const handleDuplicate = (id: string, title: string) => {
    duplicateProduct(id);
    showNotification(`Duplicated "${title}" successfully!`);
  };

  // Quick Edit Save
  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditingProduct) return;
    quickEditProduct(quickEditingProduct.id, quickEditingProduct);
    setQuickEditingProduct(null);
    showNotification("Product updated successfully!");
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Title",
      "Slug",
      "SKU",
      "Category",
      "Sale Price (BDT)",
      "Compare Price (BDT)",
      "Cost Price (BDT)",
      "Stock",
      "Status",
      "Badge",
      "Rating",
      "Sales Count",
    ];

    const rows = filtered.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.slug}"`,
      `"${p.sku}"`,
      `"${p.categorySlug}"`,
      p.price,
      p.compareAtPrice || "",
      p.costPrice || "",
      p.stock,
      `"${p.status}"`,
      `"${p.badge || ""}"`,
      p.rating,
      p.reviewCount,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toolera-products-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filtered.length} products to CSV!`);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-[#008B47]" />
            <span>Products Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full product catalog CRUD, instant preview, live store view, quick edit, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Bulk Quick Editor Button */}
          <Link
            href="/admin/products/bulk"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Bulk Quick-Editor</span>
          </Link>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Products (CSV)</span>
          </button>

          {/* Add Product Button */}
          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* Inventory Restock Alert Banner */}
      {(() => {
        const outOfStock = products.filter((p) => (p.stockQuantity ?? p.stock ?? 0) <= 0);
        const lowStock = products.filter((p) => {
          const s = p.stockQuantity ?? p.stock ?? 0;
          return s > 0 && s <= 5;
        });

        if (outOfStock.length === 0 && lowStock.length === 0) return null;

        return (
          <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
                ⚠️
              </div>
              <div>
                <span className="font-black text-sm block text-amber-950">Inventory Restock Alert</span>
                <span className="text-amber-800">
                  {outOfStock.length} product(s) Out of Stock • {lowStock.length} product(s) Low Stock (&le; 5 units remaining)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {outOfStock.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition"
                >
                  Out of Stock ({outOfStock.length})
                </button>
              )}
              {lowStock.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition"
                >
                  Low Stock ({lowStock.length})
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Category Filter */}
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#008B47]"
            >
              <option value="all">All Categories ({products.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, " ")}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#008B47]"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-[#008B47] text-white text-[11px]">
                {selectedIds.length} Selected
              </span>
              <span>Bulk Actions:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkAction("trending")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 transition flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Mark Trending</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkAction("publish")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 transition"
              >
                Publish
              </button>

              <button
                type="button"
                onClick={() => handleBulkAction("draft")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Set as Draft
              </button>

              <button
                type="button"
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3 w-10">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#008B47]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Category &amp; SKU</th>
              <th className="py-3 px-3">Price (BDT)</th>
              <th className="py-3 px-3">Stock</th>
              <th className="py-3 px-3">Status &amp; Badges</th>
              <th className="py-3 px-3 text-right">CRUD Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const isSelected = selectedIds.includes(prod.id);
                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isSelected ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSelect(prod.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#008B47]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Product Image & Title */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setViewingProduct(prod)}
                          className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group"
                        >
                          <img
                            src={prod.images[0] || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80"}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="max-w-xs space-y-0.5">
                          <span
                            onClick={() => setViewingProduct(prod)}
                            className="font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-[#008B47] transition"
                          >
                            {prod.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{prod.rating}</span>
                            </span>
                            <span>•</span>
                            <span>{prod.reviewCount} reviews</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & SKU */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold capitalize">
                          {prod.categorySlug.replace(/-/g, " ")}
                        </span>
                        <div className="font-mono text-[10px] text-slate-400">
                          {prod.sku}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="font-black text-slate-900 block text-xs">
                          {formatPrice(prod.price)}
                        </span>
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3">
                      {prod.stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px]">
                          Low: {prod.stock} units
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {prod.stock} in stock
                        </span>
                      )}
                    </td>

                    {/* Status & Badges */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {prod.status === "PUBLISHED" ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Draft
                          </span>
                        )}
                        {prod.isTrending && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-black flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            <span>TRENDING</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Preview */}
                        <button
                          type="button"
                          onClick={() => setViewingProduct(prod)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="View Product Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* View on Store Link */}
                        <a
                          href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}/product/${prod.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#008B47] text-slate-600 transition"
                          title="View Live on Store"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Product (Full Page) */}
                        <Link
                          href={`/admin/products/edit/${prod.id}`}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#008B47] transition"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod.id, prod.title)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* 1. VIEW PRODUCT DETAILS MODAL                                   */}
      {/* ============================================================== */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-[#008B47]" />
                <div>
                  <h3 className="font-black text-base text-slate-900">Product Preview</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {viewingProduct.id} • SKU: {viewingProduct.sku}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5 text-xs">
              {/* Product Photos Gallery */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Product Photos ({viewingProduct.images.length})</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {viewingProduct.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Category */}
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#008B47] text-[10px] font-black uppercase">
                  {viewingProduct.categorySlug}
                </span>
                <h2 className="text-lg font-black text-slate-900">{viewingProduct.title}</h2>
              </div>

              {/* Price & Stock Details */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sale Price</span>
                  <span className="text-base font-black text-[#008B47]">{formatPrice(viewingProduct.price)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Compare Price</span>
                  <span className="text-sm font-bold text-slate-400 line-through">
                    {viewingProduct.compareAtPrice ? formatPrice(viewingProduct.compareAtPrice) : "None"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Inventory</span>
                  <span className="text-sm font-extrabold text-slate-900">{viewingProduct.stock} in stock</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Short Description</label>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {viewingProduct.shortDescription}
                </p>
              </div>

              {/* Specifications */}
              {viewingProduct.specifications && viewingProduct.specifications.length > 0 && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-700">Technical Specifications</label>
                  <div className="grid grid-cols-2 gap-2">
                    {viewingProduct.specifications.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                        <span className="text-slate-400 font-bold">{s.label}:</span>
                        <span className="font-extrabold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/products/edit/${viewingProduct.id}`}
                  className="px-4 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </Link>
                <Link
                  href={`/product/${viewingProduct.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-200 text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. QUICK EDIT MODAL                                            */}
      {/* ============================================================== */}
      {quickEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-base text-slate-900">Quick Edit Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditingProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={quickEditingProduct.title}
                  onChange={(e) =>
                    setQuickEditingProduct({ ...quickEditingProduct, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sale Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={quickEditingProduct.price}
                    onChange={(e) =>
                      setQuickEditingProduct({
                        ...quickEditingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Compare Price (BDT)</label>
                  <input
                    type="number"
                    value={quickEditingProduct.compareAtPrice || ""}
                    onChange={(e) =>
                      setQuickEditingProduct({
                        ...quickEditingProduct,
                        compareAtPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={quickEditingProduct.stock}
                    onChange={(e) =>
                      setQuickEditingProduct({
                        ...quickEditingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SKU</label>
                  <input
                    type="text"
                    value={quickEditingProduct.sku}
                    onChange={(e) =>
                      setQuickEditingProduct({
                        ...quickEditingProduct,
                        sku: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={quickEditingProduct.status}
                  onChange={(e) =>
                    setQuickEditingProduct({
                      ...quickEditingProduct,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                >
                  <option value="PUBLISHED">Published (Live on Store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setQuickEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
