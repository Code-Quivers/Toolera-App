"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePageStore, CustomPage } from "@/store/usePageStore";
import { slugify } from "@/lib/utils";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  Globe,
  Check,
} from "lucide-react";

const STOREFRONT_URL = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "");

function getLiveUrl(page: any): string {
  // Homepage pages use the storefront root
  if (page.isHomepage || page.slug?.startsWith("homepage-")) return STOREFRONT_URL + "/";
  // Strip any leading /pages/ that may already be in the slug
  const cleanSlug = (page.slug || "").replace(/^\/pages\//, "");
  return `${STOREFRONT_URL}/pages/${cleanSlug}`;
}

export default function AdminPagesPage() {
  const { pages, addPage, updatePage, deletePage } = usePageStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"STANDARD" | "POLICY" | "BUILDER">("STANDARD");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setType("STANDARD");
    setStatus("PUBLISHED");
    setSeoTitle("");
    setSeoDescription("");
    setModalOpen(true);
  };

  const handleOpenEdit = (page: CustomPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setType(page.type);
    setStatus(page.status);
    setSeoTitle(page.seoTitle || "");
    setSeoDescription(page.seoDescription || "");
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPage && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a page title.");
      return;
    }

    const finalSlug = slug.trim() || slugify(title);

    if (editingPage) {
      updatePage(editingPage.id, {
        title,
        slug: finalSlug,
        content,
        type,
        status,
        seoTitle: seoTitle || `${title} | Toolera`,
        seoDescription: seoDescription || content.slice(0, 150),
      });
      showNotification(`Page "${title}" updated successfully!`);
    } else {
      addPage({
        title,
        slug: finalSlug,
        content,
        type,
        status,
        seoTitle: seoTitle || `${title} | Toolera`,
        seoDescription: seoDescription || content.slice(0, 150),
      });
      showNotification(`New page "${title}" created and published!`);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, pageTitle: string) => {
    if (confirm(`Are you sure you want to delete page "${pageTitle}"?`)) {
      deletePage(id);
      showNotification(`Page "${pageTitle}" deleted.`);
    }
  };

  const filtered = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilter === "ALL" || p.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pages Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, and publish custom content and policy pages displayed across your store.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeFilter === filter
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Page Title</th>
              <th className="py-3 px-3">URL Slug</th>
              <th className="py-3 px-3">Page Type</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((page) => (
              <tr key={page.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-3">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{page.title}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                  /pages/{page.slug}
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {page.type}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      page.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(page)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <a
                      href={getLiveUrl(page)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition"
                      title="View Live Page on Storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(page.id, page.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT PAGE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSavePage}
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingPage ? `Edit Page: ${editingPage.title}` : "Create New Custom Page"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Page Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return &amp; Exchange Policy"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. return-exchange-policy"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Page Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="STANDARD">Standard Informational Page</option>
                  <option value="POLICY">Legal &amp; Policy Page</option>
                  <option value="BUILDER">Custom Landing Page</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="PUBLISHED">Published (Visible Live)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Page Body Content</label>
              <textarea
                rows={6}
                placeholder="Write your page content in Markdown or text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
              />
            </div>

            {/* SEO Settings */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-800">Search Engine Optimization (SEO)</div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Meta Title</label>
                <input
                  type="text"
                  placeholder="Custom SEO Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Custom SEO snippet for Google search"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                {editingPage ? "Save Changes" : "Publish Page"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
