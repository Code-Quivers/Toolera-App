"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useMediaStore() {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMedia();
      setMediaFiles(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const uploadFile = useCallback(async (form: FormData) => {
    const result = await api.uploadMedia(form);
    if (result?.data) setMediaFiles(prev => [result.data, ...prev]);
    return result;
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    await api.deleteMedia(id);
    setMediaFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  return { mediaFiles, isLoading, fetchMedia, uploadFile, deleteFile };
}
