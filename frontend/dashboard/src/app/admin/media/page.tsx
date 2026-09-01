"use client";

import React, { useState, useRef, useMemo } from "react";
import { useMediaStore } from "@/store/useMediaStore";
import {
  Image as ImageIcon,
  Plus,
  Copy,
  Check,
  Trash2,
  Search,
  UploadCloud,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function AdminMediaPage() {
  const { mediaList, addMedia, updateMedia, deleteMedia, isLoading: isFetchingMedia, fetchError, fetchMedia } = useMediaStore();

  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedId, setSelectedId] = useState<string | null>(mediaList[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "banners" | "products" | "logos">("all");
  const [isUploading, setIsUploading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedItem = useMemo(() => {
    return mediaList.find((m) => m.id === selectedId) || null;
  }, [mediaList, selectedId]);

  const filteredList = useMemo(() => {
    return mediaList.filter((item) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAlt = item.altText?.toLowerCase().includes(q);
        if (!matchesName && !matchesAlt) return false;
      }

      if (filterType === "banners") {
        return item.dimensions?.includes("1600") || item.name.toLowerCase().includes("banner");
      }
      if (filterType === "products") {
        return (
          item.dimensions?.includes("1024") ||
          item.name.toLowerCase().includes("lamp") ||
          item.name.toLowerCase().includes("diffuser") ||
          item.name.toLowerCase().includes("speaker")
        );
      }
      if (filterType === "logos") {
        return (
          item.name.toLowerCase().includes("logo") ||
          item.name.toLowerCase().includes("favicon") ||
          item.url.includes("assets")
        );
      }

      return true;
    });
  }, [mediaList, searchTerm, filterType]);

  const processAndUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      showNotification("Please upload valid image files (PNG, JPG, WebP, SVG).");
      setIsUploading(false);
      return;
    }

    try {
      const form = new FormData();
      validFiles.forEach((f) => form.append("images", f));

      const { api } = await import("@/lib/api");
      const result = await api.uploadMultipleMedia(form);
      const uploaded: any[] = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];

      if (uploaded.length === 0) {
        throw new Error(result?.message || "Upload failed — no files returned from server.");
      }

      const newItems = uploaded.map((d: any) =>
        addMedia({
          id: d.id,
          name: d.filename || d.name || d.url?.split("/").pop() || "file",
          url: d.url,
          size: d.size ? `${Math.round(d.size / 1024)} KB` : undefined,
          fileType: d.mimeType || d.fileType,
          altText: d.altText || d.filename?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          createdAt: d.createdAt,
        })
      );

      setSelectedId(newItems[0]?.id ?? null);
      setActiveTab("library");
      showNotification(`${uploaded.length} file(s) uploaded to MinIO successfully!`);
    } catch (err: any) {
      showNotification(`Upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    showNotification("Image URL copied to clipboard!");
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this media file?")) {
      deleteMedia(id);
      if (selectedId === id) setSelectedId(null);
      showNotification("Media item deleted.");
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-[#008B47]" />
            <span>Store Media Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload, inspect, and select high-resolution images, 1600×514 banners, and branding assets for your entire store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => processAndUpload(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Add New Media</span>
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

      {/* WordPress Media Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[680px]">
        {/* Navigation Tabs */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-4 py-1.5 rounded-lg font-extrabold text-xs transition flex items-center gap-1.5 ${
                activeTab === "library"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media Library</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                {mediaList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-1.5 rounded-lg font-extrabold text-xs transition flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Upload Files */}
        {activeTab === "upload" && (
          <div className="flex-1 p-12 flex flex-col items-center justify-center bg-slate-50/50">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="max-w-2xl w-full p-12 rounded-3xl border-3 border-dashed border-slate-300 hover:border-[#008B47] bg-white transition cursor-pointer flex flex-col items-center justify-center gap-4 text-center group shadow-xs"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#008B47] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                {isUploading ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : (
                  <UploadCloud className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  {isUploading ? "Processing Media..." : "Drop files to upload"}
                </h3>
                <p className="text-xs text-slate-500">
                  or click to select images from your computer
                </p>
              </div>

              <button
                type="button"
                className="px-6 py-3 bg-[#008B47] text-white rounded-xl text-xs font-black shadow-xs pointer-events-none"
              >
                Select Files
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Media Library */}
        {activeTab === "library" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Grid Column */}
            <div className="flex-1 flex flex-col border-r border-slate-200">
              {/* Search Toolbar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search media..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="all">All Media</option>
                    <option value="banners">Banners (1600×514)</option>
                    <option value="products">Product Photos</option>
                    <option value="logos">Logos &amp; Icons</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[600px]">
                {isFetchingMedia ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                    <svg className="animate-spin w-8 h-8 text-[#008B47]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm font-medium">Loading media library...</span>
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-500">
                    <span className="text-sm font-medium">{fetchError}</span>
                    <button
                      onClick={fetchMedia}
                      className="px-4 py-2 bg-[#008B47] text-white text-xs font-bold rounded-xl hover:bg-[#007a3e] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                    <span className="text-sm font-medium">No media files found.</span>
                    <span className="text-xs">Upload images using the Upload tab.</span>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredList.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? "ring-3 ring-[#008B47] ring-offset-2 shadow-md bg-slate-950"
                            : "hover:ring-2 hover:ring-slate-300 bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#008B47] text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Attachment Details Sidebar */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-50 p-6 overflow-y-auto space-y-4 text-xs">
              {selectedItem ? (
                <div className="space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
                    Attachment Details
                  </h3>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-xs flex items-center justify-center">
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-slate-600 border-b border-slate-200 pb-3">
                    <div className="font-extrabold text-slate-900 text-xs truncate">
                      {selectedItem.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(selectedItem.uploadedAt).toLocaleDateString()} • {selectedItem.size}
                    </div>
                    {selectedItem.dimensions && (
                      <div className="text-[11px] font-mono font-bold text-[#008B47]">
                        Dimensions: {selectedItem.dimensions} px
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Alt Text</label>
                      <input
                        type="text"
                        value={selectedItem.altText || ""}
                        onChange={(e) =>
                          updateMedia(selectedItem.id, { altText: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">Title</label>
                      <input
                        type="text"
                        value={selectedItem.name}
                        onChange={(e) =>
                          updateMedia(selectedItem.id, { name: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px]">File URL</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={selectedItem.url}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-500 truncate"
                        />
                        <button
                          type="button"
                          onClick={() => copyUrl(selectedItem.url)}
                          className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedItem.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>

                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline text-xs font-bold flex items-center gap-1"
                    >
                      <span>View Full Image</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No image selected</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
