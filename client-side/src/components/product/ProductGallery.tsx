"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Film, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  title: string;
}

type MediaItem = {
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnail?: string;
};

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
    : null;
}

export function ProductGallery({ images, videoUrl, videoThumbnail, title }: ProductGalleryProps) {
  // Combine images and optional video into media array
  const mediaItems: MediaItem[] = React.useMemo(() => {
    const list: MediaItem[] = images.map((img) => ({
      type: "IMAGE" as const,
      url: img,
      thumbnail: img,
    }));

    if (videoUrl && videoUrl.trim()) {
      list.push({
        type: "VIDEO" as const,
        url: videoUrl.trim(),
        thumbnail: videoThumbnail || images[0] || "/assets/RaifasMart Logo.png",
      });
    }

    return list;
  }, [images, videoUrl, videoThumbnail]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [images[0], videoUrl]);

  const prevMedia = () => {
    setSelectedIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const nextMedia = () => {
    setSelectedIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const currentItem = mediaItems[selectedIndex] || mediaItems[0] || { type: "IMAGE", url: "/placeholder.png" };
  const ytEmbedUrl = currentItem.type === "VIDEO" ? getYouTubeEmbedUrl(currentItem.url) : null;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnail Bar */}
      {mediaItems.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar py-1">
          {mediaItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border-2 shrink-0 transition-all duration-200 group/thumb cursor-pointer",
                selectedIndex === idx
                  ? "border-[#008B47] shadow-sm scale-105"
                  : "border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={item.thumbnail || item.url || "/placeholder.png"}
                alt={`${title} - view ${idx + 1}`}
                fill
                unoptimized={
                  typeof (item.thumbnail || item.url) === "string" &&
                  ((item.thumbnail || item.url).includes("localhost") ||
                    (item.thumbnail || item.url).startsWith("blob:") ||
                    (item.thumbnail || item.url).startsWith("data:") ||
                    (item.thumbnail || item.url).includes("127.0.0.1"))
                }
                sizes="80px"
                className="object-cover"
              />

              {/* Video Indicator on Thumbnail */}
              {item.type === "VIDEO" && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <div className="w-6 h-6 rounded-full bg-[#008B47] text-white flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 text-white/90">
                    Video
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Big Preview (Image or Video) */}
      <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-slate-900/5 border border-slate-200/80 shadow-sm group">
        {currentItem.type === "VIDEO" ? (
          /* Video Player */
          <div className="w-full h-full flex items-center justify-center bg-black">
            {ytEmbedUrl ? (
              <iframe
                src={ytEmbedUrl}
                title={`${title} - Product Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={currentItem.url}
                controls
                autoPlay
                playsInline
                loop
                poster={currentItem.thumbnail}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ) : (
          /* Image Preview */
          <Image
            src={currentItem.url || "/placeholder.png"}
            alt={title}
            fill
            priority
            unoptimized={
              typeof currentItem.url === "string" &&
              (currentItem.url.includes("localhost") ||
                currentItem.url.startsWith("blob:") ||
                currentItem.url.startsWith("data:") ||
                currentItem.url.includes("127.0.0.1"))
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Previous / Next Arrow buttons on main media */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              aria-label="Previous media"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMedia}
              aria-label="Next media"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
