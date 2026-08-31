import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions?: string;
  uploadedAt: string;
  altText?: string;
  caption?: string;
  fileType?: string;
}

interface MediaStoreState {
  mediaList: MediaItem[];
  addMedia: (item: Omit<MediaItem, "id" | "uploadedAt">) => MediaItem;
  addMultipleMedia: (items: Array<Omit<MediaItem, "id" | "uploadedAt">>) => MediaItem[];
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
}

export const defaultMedia: MediaItem[] = [
  {
    id: "media-logo-main",
    name: "RaifasMart Logo.png",
    url: "/assets/RaifasMart Logo.png",
    size: "522 KB",
    dimensions: "1200x320",
    uploadedAt: "2026-08-25T12:00:00.000Z",
    altText: "Raifa's Mart Official Logo",
    fileType: "image/png",
  },
  {
    id: "media-logo-footer",
    name: "RaifasMart Logo Footer.png",
    url: "/assets/RaifasMart Logo Footer.png",
    size: "484 KB",
    dimensions: "1200x320",
    uploadedAt: "2026-08-25T12:00:00.000Z",
    altText: "Raifa's Mart White Footer Logo",
    fileType: "image/png",
  },
  {
    id: "media-favicon",
    name: "favicon.png",
    url: "/assets/favicon.png",
    size: "1.1 MB",
    dimensions: "512x512",
    uploadedAt: "2026-08-25T12:00:00.000Z",
    altText: "Raifa's Mart Favicon Icon",
    fileType: "image/png",
  },
  {
    id: "media-hero-gadgets",
    name: "hero-smart-gadgets-banner.webp",
    url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=514&q=85",
    size: "245 KB",
    dimensions: "1600x514",
    uploadedAt: "2026-08-25T10:00:00.000Z",
    altText: "Hero Smart Gadgets Direct Import Banner",
    fileType: "image/webp",
  },
  {
    id: "media-hero-desk",
    name: "hero-desk-setup-banner.webp",
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&h=514&q=85",
    size: "218 KB",
    dimensions: "1600x514",
    uploadedAt: "2026-08-25T10:00:00.000Z",
    altText: "Hero Minimalist Desk Setup Banner",
    fileType: "image/webp",
  },
  {
    id: "media-hero-home",
    name: "hero-home-living-decor.webp",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&h=514&q=85",
    size: "230 KB",
    dimensions: "1600x514",
    uploadedAt: "2026-08-25T10:00:00.000Z",
    altText: "Hero Cozy Home & Living Decor",
    fileType: "image/webp",
  },
  {
    id: "media-prod-lamp",
    name: "magnetic-desk-lamp.webp",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    size: "184 KB",
    dimensions: "1024x1024",
    uploadedAt: "2026-08-24T18:00:00.000Z",
    altText: "Magnetic Desk Lamp",
    fileType: "image/webp",
  },
  {
    id: "media-prod-diffuser",
    name: "flame-diffuser-led.webp",
    url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    size: "210 KB",
    dimensions: "1024x1024",
    uploadedAt: "2026-08-24T18:00:00.000Z",
    altText: "Flame Aromatherapy Diffuser",
    fileType: "image/webp",
  },
  {
    id: "media-prod-speaker",
    name: "retro-bluetooth-speaker.webp",
    url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    size: "195 KB",
    dimensions: "1024x1024",
    uploadedAt: "2026-08-24T18:00:00.000Z",
    altText: "Retro Bluetooth Speaker",
    fileType: "image/webp",
  },
  {
    id: "media-prod-charger",
    name: "3in1-foldable-wireless-charger.webp",
    url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    size: "165 KB",
    dimensions: "1024x1024",
    uploadedAt: "2026-08-24T18:00:00.000Z",
    altText: "3-in-1 Foldable Wireless Charging Station",
    fileType: "image/webp",
  },
  {
    id: "media-prod-keyboard",
    name: "mechanical-wireless-keyboard.webp",
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    size: "228 KB",
    dimensions: "1024x1024",
    uploadedAt: "2026-08-24T18:00:00.000Z",
    altText: "Custom Mechanical RGB Keyboard",
    fileType: "image/webp",
  },
];

export const useMediaStore = create<MediaStoreState>()(
  persist(
    (set, get) => ({
      mediaList: defaultMedia,

      addMedia: (item) => {
        const newItem: MediaItem = {
          ...item,
          id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          uploadedAt: new Date().toISOString(),
        };

        const current = get().mediaList;
        set({ mediaList: [newItem, ...current] });
        return newItem;
      },

      addMultipleMedia: (items) => {
        const newItems: MediaItem[] = items.map((item, idx) => ({
          ...item,
          id: `media-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          uploadedAt: new Date().toISOString(),
        }));

        const current = get().mediaList;
        set({ mediaList: [...newItems, ...current] });
        return newItems;
      },

      updateMedia: (id, updates) => {
        set({
          mediaList: get().mediaList.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        });
      },

      deleteMedia: (id) => {
        set({ mediaList: get().mediaList.filter((m) => m.id !== id) });
      },
    }),
    {
      name: "raifas_mart_media_library_v2",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
