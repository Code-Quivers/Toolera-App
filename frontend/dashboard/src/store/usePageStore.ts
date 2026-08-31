"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function usePageStore() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getPages();
      setPages(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const addPage = useCallback(async (page: any) => {
    const created = await api.createPage(page);
    setPages(prev => [created, ...prev]);
    return created;
  }, []);

  const updatePage = useCallback(async (id: string, data: any) => {
    const result = await api.updatePage(id, data);
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    return result;
  }, []);

  const deletePage = useCallback(async (id: string) => {
    await api.deletePage(id);
    setPages(prev => prev.filter(p => p.id !== id));
  }, []);

  return { pages, isLoading, fetchPages, addPage, updatePage, deletePage };
}
