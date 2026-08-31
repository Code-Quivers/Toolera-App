"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCategoryStore, CategoryItem } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Edit,
  ExternalLink,
  Download,
  Search,
  X,
  Check,
  Save,
  Package,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { products } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatImage, setNewCatImage] = useState("https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80");
  const [newCatDesc, setNewCatDesc] = useState("");
  
  const getProductCountForCat = (slug: string, name: string) => {
    return products.filter(
      (p) =>
        (p.categorySlug && p.categorySlug.toLowerCase() === slug.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === name.toLowerCase())
    ).length;
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-slug generator for new category
  const handleNameChange = (val: string) => {
    setNewCatName(val);
    setNewCatSlug(val.trim().toLowerCase().replace(/\s+/g, "-"));
  };

  // Create Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, "-"),
      image: newCatImage.trim() || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80",
      itemCount: 0,
      description: newCatDesc.trim() || `Trending China ${newCatName.trim()} curated for Bangladesh.`,
    };

    addCategory(newCat);
    setNewCatName("");
    setNewCatSlug("");
    setNewCatImage("https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80");
    setNewCatDesc("");
    setIsAddModalOpen(false);
    showNotification(`Category "${newCat.name}" created successfully!`);
  };

  // Update / Edit Category
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    updateCategory(editingCategory.id, editingCategory);
    setEditingCategory(null);
    showNotification(`Category "${editingCategory.name}" updated!`);
  };

  // Delete Category
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategory(id);
      showNotification(`Category "${name}" deleted.`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Category Name", "Slug", "Item Count", "Description", "Image URL"];
    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.slug}"`,
      c.itemCount ?? 0,
      `"${(c.description || "").replace(/"/g, '""')}"`,
      `"${c.image}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toolera-categories-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filtered.length} categories to CSV!`);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#008B47]" />
            <span>Categories &amp; Collections</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize China trendy products into curated collections with full CRUD, live view, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Categories (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
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
            placeholder="Search categories by name, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
          />
        </div>

        <span className="text-xs font-mono font-bold text-slate-400">
          Total: {categories.length} Categories
        </span>
      </div>

      {/* Categories Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Collection</th>
              <th className="py-3 px-3">Slug Link</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Products</th>
              <th className="py-3 px-3 text-right">CRUD Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No categories found.
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition">
                  {/* Image & Name */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {cat.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      /category/{cat.slug}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <p className="text-slate-500 line-clamp-1 text-[11px]">
                      {cat.description}
                    </p>
                  </td>

                  {/* Count */}
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {getProductCountForCat(cat.slug, cat.name)} items
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Live Category Link */}
                      <Link
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#008B47] text-slate-600 transition"
                        title="View Category on Store"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Category"
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
      {/* 1. ADD NEW CATEGORY MODAL                                      */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-base text-slate-900">Create New Collection</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Smart Audio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Slug *</label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. smart-audio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description for this curated collection..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div>
                <ImageUploader
                  value={newCatImage}
                  onChange={setNewCatImage}
                  label="Category Thumbnail Picture"
                  recommendedDimensions="400x400 px Square"
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
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. EDIT CATEGORY MODAL                                         */}
      {/* ============================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-base text-slate-900">Edit Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description ?? ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div>
                <ImageUploader
                  value={editingCategory.image ?? undefined}
                  onChange={(url) => setEditingCategory({ ...editingCategory, image: url })}
                  label="Category Thumbnail Picture"
                  recommendedDimensions="400x400 px Square"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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
