"use client";

import React, { useState, useEffect } from "react";
import { useAttributeStore } from "@/store/useAttributeStore";
import { useProductStore } from "@/store/useProductStore";
import { GlobalAttribute, GlobalAttributeValue, AttributeType } from "@/types";
import { 
  Palette, 
  Square, 
  ListFilter, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  X, 
  Layers, 
  Settings2, 
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { cn } from "@/lib/utils";

const TYPE_META: Record<AttributeType, { label: string; icon: any; color: string; desc: string }> = {
  COLOR: { label: "Color Swatch", icon: Palette, color: "text-pink-600 bg-pink-50 border-pink-200", desc: "Visual color dots/circles for colors, light colors, finishes" },
  BUTTON: { label: "Button / Pill", icon: Square, color: "text-blue-600 bg-blue-50 border-blue-200", desc: "Pill buttons for sizes, wattage, storage, capacity, voltage" },
  SELECT: { label: "Select Dropdown", icon: ListFilter, color: "text-purple-600 bg-purple-50 border-purple-200", desc: "Dropdown select for material, compatibility, model, origin" },
  IMAGE: { label: "Image Swatch", icon: ImageIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-200", desc: "Visual image cards for designs, patterns, styles" },
  TEXT: { label: "Plain Text", icon: TypeIcon, color: "text-amber-600 bg-amber-50 border-amber-200", desc: "Descriptive custom specs (not used for variations)" },
};

export default function AttributesAdminPage() {
  const { 
    attributes, 
    fetchAttributes, 
    addAttribute, 
    deleteAttribute, 
    addAttributeValue, 
    updateAttributeValue, 
    deleteAttributeValue,
  } = useAttributeStore();
  
  const { products } = useProductStore();

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  // Form State for New Attribute
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<AttributeType>("COLOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Search and Filter
  const [search, setSearch] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Managing Values Modal State
  const [activeManagingAttr, setActiveManagingAttr] = useState<GlobalAttribute | null>(null);
  const [valName, setValName] = useState("");
  const [valSlug, setValSlug] = useState("");
  const [valColorHex, setValColorHex] = useState("#0f172a");
  const [valImageUrl, setValImageUrl] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingValId, setEditingValId] = useState<string | null>(null);
  const [editingValData, setEditingValData] = useState<{ name: string; slug: string; colorHex?: string; imageUrl?: string }>({ name: "", slug: "" });

  // Delete Safety Warning Modal
  const [deleteConfirmAttr, setDeleteConfirmAttr] = useState<{ attr: GlobalAttribute; usageCount: number } | null>(null);

  // Auto generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    if (createError) setCreateError(null);
  };

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setCreateError(null);
    try {
      await addAttribute({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type,
      });
      setName("");
      setSlug("");
      setType("COLOR");
    } catch (err: any) {
      const msg: string = err?.message ?? "Failed to create attribute";
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        setCreateError(`An attribute named "${name.trim()}" already exists. Use a different name.`);
      } else {
        setCreateError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate usage count across existing products
  const getAttributeUsageCount = (attributeId: string, attrSlug: string) => {
    return products.filter((p) => {
      if (p.productAttributes && p.productAttributes.length > 0) {
        return p.productAttributes.some((pa) => pa.attributeId === attributeId || pa.slug === attrSlug || pa.name.toLowerCase() === attrSlug.toLowerCase());
      }
      return false;
    }).length;
  };

  // Filtered attributes list
  const filteredAttributes = attributes.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedTypeFilter === "ALL" || a.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Current managed attribute live reference
  const currentAttr = activeManagingAttr ? attributes.find((a) => a.id === activeManagingAttr.id) || activeManagingAttr : null;

  // Add value handler
  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAttr || !valName.trim()) return;
    try {
      await addAttributeValue(currentAttr.id, {
        name: valName.trim(),
        slug: valSlug.trim() || valName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        colorHex: currentAttr.type === "COLOR" ? valColorHex : undefined,
        imageUrl: currentAttr.type === "IMAGE" ? valImageUrl : undefined,
      });
      setValName("");
      setValSlug("");
      setValImageUrl("");
      setValColorHex("#0f172a");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditValue = async (attributeId: string, valueId: string) => {
    await updateAttributeValue(attributeId, valueId, editingValData);
    setEditingValId(null);
  };

  const initiateDeleteAttribute = (attr: GlobalAttribute) => {
    const usage = getAttributeUsageCount(attr.id, attr.slug);
    setDeleteConfirmAttr({ attr, usageCount: usage });
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#008B47]/10 flex items-center justify-center text-[#008B47] border border-[#008B47]/20 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Attributes</h1>
              <p className="text-sm text-slate-500 font-medium">
                Create reusable global attributes (Color, Size, Wattage, Design, Material) for all store products.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#008B47]" />
            <span>{attributes.length} Global Attributes Active</span>
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full">
        {/* Left Column: Add New Attribute Form */}
        <div className="w-full lg:w-[380px] xl:w-[400px] shrink-0 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6 lg:sticky lg:top-20">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#008B47]" />
              <span>Add New Attribute</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Define an attribute type to generate variation options across different product categories.
            </p>
          </div>

          <form onSubmit={handleCreateAttribute} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Attribute Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Color, Size, Wattage, Design"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-[#008B47] transition"
              />
              <p className="text-[11px] text-slate-400">The title displayed to customers on product pages.</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Slug</label>
              <input
                type="text"
                placeholder="e.g. color, size, wattage"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47] transition"
              />
              <p className="text-[11px] text-slate-400">Unique URL-friendly key.</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Display Type <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(TYPE_META) as AttributeType[]).map((tKey) => {
                  const meta = TYPE_META[tKey];
                  const Icon = meta.icon;
                  const isSelected = type === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setType(tKey)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-2xl border text-left transition-all duration-150",
                        isSelected 
                          ? "border-[#008B47] bg-emerald-50/50 ring-2 ring-[#008B47]/20 shadow-2xs" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl border shrink-0", meta.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>{meta.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#008B47]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{meta.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {createError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{createError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Attribute</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Global Attributes (Full Width Flex) */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attributes or slugs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-[#008B47] transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-[11px]">
              {(["ALL", "COLOR", "BUTTON", "SELECT", "IMAGE", "TEXT"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setSelectedTypeFilter(filterKey)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg font-bold transition-all",
                    selectedTypeFilter === filterKey
                      ? "bg-[#008B47] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  )}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Attributes List Table / Cards */}
          <div className="space-y-3.5">
            {filteredAttributes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">No attributes found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first global attribute on the left (e.g. Color, Size, Wattage, Design) to start building flexible product variations.
                </p>
              </div>
            ) : (
              filteredAttributes.map((attr) => {
                const meta = TYPE_META[attr.type] || TYPE_META.BUTTON;
                const Icon = meta.icon;
                const usage = getAttributeUsageCount(attr.id, attr.slug);

                return (
                  <div
                    key={attr.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-black text-slate-900 tracking-tight">{attr.name}</span>
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {attr.slug}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border", meta.color)}>
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                        {usage > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                            Used by {usage} {usage === 1 ? "product" : "products"}
                          </span>
                        )}
                      </div>

                      {/* Values Preview Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(attr.values ?? []).length === 0 ? (
                          <span className="text-xs text-slate-400 italic font-medium">No values added yet. Click Manage Values to add.</span>
                        ) : (
                          (attr.values ?? []).map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                            >
                              {attr.type === "COLOR" && v.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-slate-300 shadow-inner shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span>{v.name}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveManagingAttr(attr)}
                        className="px-3.5 py-2 rounded-xl bg-[#008B47]/10 hover:bg-[#008B47]/20 text-[#008B47] text-xs font-bold border border-[#008B47]/20 transition flex items-center gap-1.5"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Manage Values ({(attr.values ?? []).length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => initiateDeleteAttribute(attr)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title="Delete / Archive Attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MANAGE VALUES MODAL / DRAWER */}
      {currentAttr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={cn("p-2 rounded-xl border", TYPE_META[currentAttr.type]?.color)}>
                  {React.createElement(TYPE_META[currentAttr.type]?.icon || Square, { className: "w-4 h-4" })}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Manage Values: <span className="text-[#008B47]">{currentAttr.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Type: {TYPE_META[currentAttr.type]?.label} ({currentAttr.values.length} configured)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveManagingAttr(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Add New Value Form */}
              <form onSubmit={handleAddValue} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#008B47]" />
                  <span>Add New {currentAttr.name} Value</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Value Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Midnight Black / 65W GaN / Handcrafted Glass"
                      value={valName}
                      onChange={(e) => {
                        setValName(e.target.value);
                        setValSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. midnight-black"
                      value={valSlug}
                      onChange={(e) => setValSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                </div>

                {/* Color Hex Picker if COLOR type */}
                {currentAttr.type === "COLOR" && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="font-bold text-slate-700">Color Hex:</span>
                    <input
                      type="color"
                      value={valColorHex}
                      onChange={(e) => setValColorHex(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={valColorHex}
                      onChange={(e) => setValColorHex(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px]"
                    />
                    {/* Quick Palettes */}
                    <div className="flex items-center gap-1.5">
                      {["#0f172a", "#ffffff", "#059669", "#1e3a8a", "#dc2626", "#d97706", "#fef3c7", "#e0f2fe"].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setValColorHex(hex)}
                          className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Picker if IMAGE type */}
                {currentAttr.type === "IMAGE" && (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Choose Image from Library</span>
                    </button>
                    {valImageUrl && (
                      <div className="flex items-center gap-2">
                        <img src={valImageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">{valImageUrl}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!valName.trim()}
                    className="px-4 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Value</span>
                  </button>
                </div>
              </form>

              {/* Existing Values List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Existing Values ({currentAttr.values.length})</span>
                </div>

                {currentAttr.values.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 italic">
                    No values added yet. Add a value above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                    {currentAttr.values.map((v) => {
                      const isEditing = editingValId === v.id;

                      if (isEditing) {
                        return (
                          <div key={v.id} className="p-3 bg-emerald-50/50 flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={editingValData.name}
                              onChange={(e) => setEditingValData({ ...editingValData, name: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                            />
                            {currentAttr.type === "COLOR" && (
                              <input
                                type="color"
                                value={editingValData.colorHex || "#000000"}
                                onChange={(e) => setEditingValData({ ...editingValData, colorHex: e.target.value })}
                                className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleSaveEditValue(currentAttr.id, v.id)}
                              className="px-3 py-1 bg-[#008B47] text-white rounded-lg font-bold text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingValId(null)}
                              className="px-2 py-1 text-slate-500 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div key={v.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            {currentAttr.type === "COLOR" && (
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-inner shrink-0"
                                style={{ backgroundColor: v.colorHex || "#0f172a" }}
                              />
                            )}
                            {currentAttr.type === "IMAGE" && v.imageUrl && (
                              <img src={v.imageUrl} alt={v.name} className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900">{v.name}</span>
                            <span className="font-mono text-[11px] text-slate-400">({v.slug})</span>
                            {v.colorHex && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {v.colorHex}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingValId(v.id);
                                setEditingValData({ name: v.name, slug: v.slug, colorHex: v.colorHex, imageUrl: v.imageUrl });
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAttributeValue(currentAttr.id, v.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveManagingAttr(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition"
              >
                Done Managing Values
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE / ARCHIVE SAFETY MODAL */}
      {deleteConfirmAttr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Attribute: "{deleteConfirmAttr.attr.name}"?
              </h3>
              {deleteConfirmAttr.usageCount > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <p className="font-bold">⚠ This attribute is currently used by {deleteConfirmAttr.usageCount} products.</p>
                  <p className="text-[11px] text-amber-800">
                    Deleting it will remove it from the global library. We recommend archiving or deactivating instead.
                  </p>
                </div>
              ) : (
                <p className="text-slate-500">
                  This will permanently delete this attribute and its {(deleteConfirmAttr.attr.values ?? []).length} values from the global library.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAttr(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteAttribute(deleteConfirmAttr.attr.id);
                  setDeleteConfirmAttr(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-xs"
              >
                Delete Attribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal for image values */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(selectedUrl) => {
          const url = typeof selectedUrl === "string" ? selectedUrl : (selectedUrl as any)?.url || "";
          setValImageUrl(url);
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
