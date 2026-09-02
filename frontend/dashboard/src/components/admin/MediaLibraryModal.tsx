"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMediaStore, MediaItem } from "@/store/useMediaStore";
import {
  X,
  UploadCloud,
  Search,
  Check,
  Trash2,
  Copy,
  CheckCircle2,
  ImageIcon,
  Loader2,
  FileText,
  Filter,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedUrl: string, item?: MediaItem) => void;
  onSelectMultiple?: (selectedUrls: string[]) => void;
  multiple?: boolean;
  initialSelectedUrl?: string;
  title?: string;
  buttonLabel?: string;
  recommendedDimensions?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  multiple = false,
  initialSelectedUrl,
  title = "Select or Upload Media",
  buttonLabel = "Select & Insert Media",
  recommendedDimensions,
}: MediaLibraryModalProps) {
  const { mediaList, addMedia, addMultipleMedia, updateMedia, deleteMedia } = useMediaStore();

  // Active Tab: "upload" or "library"
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");

  // Selected item ID(s)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "banners" | "products" | "logos">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select initial URL on open if provided
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedUrl) {
        const found = mediaList.find((m) => m.url === initialSelectedUrl);
        if (found) {
          setSelectedId(found.id);
          setActiveTab("library");
        } else {
          if (mediaList.length > 0) setSelectedId(mediaList[0].id);
        }
      } else if (mediaList.length > 0 && !selectedId) {
        setSelectedId(mediaList[0].id);
      }
    }
  }, [isOpen, initialSelectedUrl, mediaList]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return mediaList.find((m) => m.id === selectedId) || null;
  }, [mediaList, selectedId]);

  // Filtered & Sorted Media List
  const filteredList = useMemo(() => {
    return mediaList
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
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
      })
      .sort((a, b) => {
        const dateA = new Date(a.uploadedAt).getTime();
        const dateB = new Date(b.uploadedAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [mediaList, searchQuery, filterType, sortOrder]);

  // Process & Upload File
  const processAndUploadFile = async (file: File): Promise<MediaItem> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("File is not an image");
    }

    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");
    const apiUrl = `${base}/api/v1`;

    // 1. Try uploading to Backend REST API
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Get auth token if available
      let token = "";
      try {
        token = localStorage.getItem("rm_admin_token") || "";
      } catch {}

      const res = await fetch(`${apiUrl}/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        const item = addMedia({
          name: file.name,
          url: json.data.url,
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: "Uploaded HD",
          fileType: file.type,
          altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        });
        return item;
      }
    } catch (uploadErr) {
      console.warn("Backend cloud upload unavailable, falling back to local client processor:", uploadErr);
    }

    // 2. Fallback to client-side canvas WebP optimization
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;

        if (file.type.includes("svg")) {
          const item = addMedia({
            name: file.name,
            url: rawDataUrl,
            size: `${Math.round(file.size / 1024)} KB`,
            dimensions: "Vector SVG",
            fileType: "image/svg+xml",
          });
          resolve(item);
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          const origW = img.width;
          const origH = img.height;

          const MAX_DIM = 2400;
          let w = origW;
          let h = origH;

          if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            } else {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            
            // Generate clean optimized WebP or PNG dataURL
            let outputDataUrl: string;
            let fileType = "image/webp";
            
            try {
              outputDataUrl = canvas.toDataURL("image/webp", 0.88);
            } catch {
              outputDataUrl = canvas.toDataURL("image/jpeg", 0.88);
              fileType = "image/jpeg";
            }

            const sizeKb = Math.round((outputDataUrl.length * 3) / 4 / 1024);
            const item = addMedia({
              name: file.name,
              url: outputDataUrl,
              size: `${sizeKb} KB`,
              dimensions: `${origW}x${origH}`,
              fileType,
              altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            });
            resolve(item);
          } else {
            const item = addMedia({
              name: file.name,
              url: rawDataUrl,
              size: `${Math.round(file.size / 1024)} KB`,
              dimensions: `${origW}x${origH}`,
              fileType: file.type,
            });
            resolve(item);
          }
        };
        img.onerror = () => {
          reject(new Error("Image failed to load"));
        };
        img.src = rawDataUrl;
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(20);

    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, WebP, SVG).");
      setIsUploading(false);
      return;
    }

    try {
      const newIds: string[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const item = await processAndUploadFile(validFiles[i]);
        newIds.push(item.id);
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }

      if (newIds.length > 0) {
        setSelectedId(newIds[newIds.length - 1]);
        setSelectedIds((prev) => [...prev, ...newIds]);
      }
      setActiveTab("library");
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred while uploading. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDeleteSelected = () => {
    if (!selectedItem) return;
    if (confirm(`Are you sure you want to permanently delete "${selectedItem.name}"?`)) {
      deleteMedia(selectedItem.id);
      setSelectedId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== selectedItem.id));
    }
  };

  const handleItemClick = (item: MediaItem) => {
    setSelectedId(item.id);
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    } else {
      setSelectedIds([item.id]);
    }
  };

  const handleSelectAndInsert = () => {
    if (multiple && onSelectMultiple) {
      const itemsToInsert = mediaList.filter((m) =>
        selectedIds.length > 0 ? selectedIds.includes(m.id) : m.id === selectedId
      );
      if (itemsToInsert.length === 0 && selectedItem) {
        itemsToInsert.push(selectedItem);
      }
      if (itemsToInsert.length > 0) {
        onSelectMultiple(itemsToInsert.map((m) => m.url));
        onClose();
        return;
      }
    }

    if (selectedItem) {
      onSelect(selectedItem.url, selectedItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-6xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#008B47] text-white flex items-center justify-center shadow-xs">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {title}
                </h2>
                {recommendedDimensions && (
                  <span className="text-[11px] font-bold text-amber-700 font-mono">
                    Target: {recommendedDimensions}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
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
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden flex items-center border-b border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg ${
              activeTab === "upload" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Upload Files
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg ${
              activeTab === "library" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            Media Library ({mediaList.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tab 1: Upload Files */}
          {activeTab === "upload" && (
            <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center overflow-y-auto bg-slate-50/50">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`max-w-2xl w-full p-12 rounded-3xl border-3 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center group ${
                  isDragging
                    ? "border-[#008B47] bg-emerald-50/50 scale-[1.01]"
                    : "border-slate-300 hover:border-[#008B47] bg-white hover:bg-emerald-50/20 shadow-xs"
                }`}
              >
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#008B47] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-[#008B47]" />
                  ) : (
                    <UploadCloud className="w-10 h-10" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {isUploading ? "Uploading & Optimizing Media..." : "Drop files anywhere to upload"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    or click the button below to browse from your computer.
                  </p>
                </div>

                {isUploading ? (
                  <div className="w-full max-w-xs space-y-2 pt-2">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#008B47] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#008B47]">
                      {uploadProgress}% processed
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-6 py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Select Files</span>
                  </button>
                )}

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Supported formats: PNG, JPG, WebP, SVG</span>
                  <span>•</span>
                  <span>Instant auto-compression</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Media Library */}
          {activeTab === "library" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Filter Bar + Media Grid */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-white">
                {/* Search & Filter Toolbar */}
                <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search media items..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#008B47]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-[#008B47] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Add New</span>
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {filteredList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
                      <p className="text-sm font-bold text-slate-700">No media items found</p>
                      <p className="text-xs mt-1 text-slate-400">
                        Try a different search query or upload new media.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {filteredList.map((item) => {
                        const isSelected = multiple
                          ? selectedIds.includes(item.id) || (selectedIds.length === 0 && selectedId === item.id)
                          : selectedId === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                              isSelected
                                ? "ring-3 ring-[#008B47] ring-offset-2 shadow-md bg-slate-950"
                                : "hover:ring-2 hover:ring-slate-300 bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.altText || item.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />

                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#008B47] text-white flex items-center justify-center shadow-md animate-in zoom-in-75 font-bold text-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}

                            {multiple && !isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md border border-white/80 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}

                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] text-white font-mono truncate">
                                {item.name}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Attachment Details Sidebar */}
              <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto flex flex-col justify-between text-xs space-y-4">
                {selectedItem ? (
                  <div className="space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
                      Attachment Details
                    </h3>

                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 shadow-xs flex items-center justify-center">
                      <img
                        src={selectedItem.url}
                        alt={selectedItem.altText || selectedItem.name}
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
                        <div className="text-[11px] font-mono font-bold text-emerald-700">
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
                          placeholder="Describe this image for SEO & accessibility"
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
                        <label className="font-bold text-slate-700 text-[11px] flex items-center justify-between">
                          <span>File URL</span>
                          {copyFeedback && (
                            <span className="text-emerald-700 font-bold text-[10px]">
                              Copied!
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={selectedItem.url}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-500 truncate"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(selectedItem.url)}
                            className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                            title="Copy URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                    <ImageIcon className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No media item selected</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click any thumbnail to view its details and insert it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-16 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {selectedItem ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="truncate max-w-[200px] sm:max-w-xs">
                  <span className="font-extrabold text-xs text-slate-900 block truncate">
                    {selectedItem.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedItem.dimensions || selectedItem.size}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Please select an image to continue
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={multiple ? selectedIds.length === 0 && !selectedItem : !selectedItem}
              onClick={handleSelectAndInsert}
              className="px-6 py-2.5 bg-[#008B47] hover:bg-[#007a3e] disabled:opacity-40 disabled:hover:bg-[#008B47] text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>
                {multiple && selectedIds.length > 1
                  ? `Insert ${selectedIds.length} Selected Images`
                  : buttonLabel}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
