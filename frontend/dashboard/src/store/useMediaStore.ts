"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  dimensions?: string;
  fileType?: string;
  altText?: string;
  createdAt?: string;
}

// Module-level singleton so media list is shared across modal instances
let globalMedia: MediaItem[] = [];
const listeners = new Set<(list: MediaItem[]) => void>();
function notifyAll(list: MediaItem[]) {
  globalMedia = list;
  listeners.forEach(l => l(list));
}

export function useMediaStore() {
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>(globalMedia);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = (list: MediaItem[]) => setMediaFiles([...list]);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const fetchMedia = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await api.getMedia();
      const items: MediaItem[] = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: d.id,
        name: d.filename || d.name || d.url?.split("/").pop() || "file",
        url: d.url,
        size: d.size ? `${Math.round(d.size / 1024)} KB` : undefined,
        fileType: d.mimeType || d.fileType,
        altText: d.altText,
        createdAt: d.createdAt,
      }));
      notifyAll(items);
    } catch {} finally { setIsLoading(false); }
  }, [isLoading]);

  useEffect(() => {
    if (globalMedia.length === 0) fetchMedia();
  }, []);

  const addMedia = useCallback((item: Omit<MediaItem, "id"> & { id?: string }): MediaItem => {
    const newItem: MediaItem = { id: item.id || crypto.randomUUID(), ...item };
    notifyAll([newItem, ...globalMedia]);
    return newItem;
  }, []);

  const addMultipleMedia = useCallback((items: (Omit<MediaItem, "id"> & { id?: string })[]): MediaItem[] => {
    const newItems = items.map(it => ({ id: it.id || crypto.randomUUID(), ...it } as MediaItem));
    notifyAll([...newItems, ...globalMedia]);
    return newItems;
  }, []);

  const updateMedia = useCallback((id: string, updates: Partial<MediaItem>) => {
    notifyAll(globalMedia.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMedia = useCallback(async (id: string) => {
    notifyAll(globalMedia.filter(m => m.id !== id));
    try { await api.deleteMedia(id); } catch {}
  }, []);

  const uploadFile = useCallback(async (form: FormData) => {
    const result = await api.uploadMedia(form);
    if (result?.data) {
      const d = result.data;
      const item: MediaItem = {
        id: d.id || crypto.randomUUID(),
        name: d.filename || d.name || d.url?.split("/").pop() || "file",
        url: d.url,
        size: d.size ? `${Math.round(d.size / 1024)} KB` : undefined,
        fileType: d.mimeType || d.fileType,
        altText: d.altText,
        createdAt: d.createdAt,
      };
      notifyAll([item, ...globalMedia]);
    }
    return result;
  }, []);

  const deleteFile = deleteMedia;

  return { mediaFiles, mediaList: mediaFiles, isLoading, fetchMedia, addMedia, addMultipleMedia, updateMedia, deleteMedia, uploadFile, deleteFile };
}
