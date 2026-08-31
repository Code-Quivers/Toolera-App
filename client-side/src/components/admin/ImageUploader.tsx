"use client";

import React, { useState } from "react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { UploadCloud, Image as ImageIcon, Check, X, Link as LinkIcon, Layers, Sparkles } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  recommendedDimensions?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  recommendedDimensions,
}: ImageUploaderProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");

  const handleMediaSelect = (selectedUrl: string) => {
    onChange(selectedUrl);
    setUrlInput(selectedUrl);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsUrlMode(false);
    }
  };

  return (
    <div className="space-y-2 w-full text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#008B47]" />
          <span>{label}</span>
        </label>
        {recommendedDimensions && (
          <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {recommendedDimensions}
          </span>
        )}
      </div>

      {/* Main Image Selector Box */}
      <div className="space-y-3">
        {value ? (
          /* Image Preview & Quick Actions */
          <div className="relative rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-4 group hover:border-[#008B47] transition">
            <div className="relative w-full sm:w-40 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={value}
                alt="Selected"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="font-mono text-[11px] text-slate-500 truncate max-w-sm bg-white p-2 rounded-lg border border-slate-200">
                {value}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Choose from Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUrlMode(!isUrlMode)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition flex items-center gap-1"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Enter Direct URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setUrlInput("");
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div
            onClick={() => setIsMediaModalOpen(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008B47] bg-white hover:bg-emerald-50/20 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008B47] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <span className="font-extrabold text-xs text-slate-900 block group-hover:text-[#008B47] transition">
                Open Media Library / Upload Picture
              </span>
              <span className="text-[11px] text-slate-400">
                Browse existing media or upload new files with 1 click
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                className="px-4 py-1.5 bg-[#008B47] text-white rounded-xl text-xs font-bold shadow-xs pointer-events-none"
              >
                Select or Upload Image
              </button>
            </div>
          </div>
        )}

        {/* Direct URL Input Toggle */}
        {isUrlMode && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in">
            <label className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#008B47]" />
              <span>Direct Image Web URL</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-1.5 bg-[#008B47] text-white rounded-xl font-bold text-xs hover:bg-[#007a3e] transition"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Library Popup Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        initialSelectedUrl={value}
        title={`Select or Upload ${label}`}
        recommendedDimensions={recommendedDimensions}
      />
    </div>
  );
}
