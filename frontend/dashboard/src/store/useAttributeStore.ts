"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useAttributeStore() {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAttributes();
      setAttributes(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAttributes(); }, [fetchAttributes]);

  const addAttribute = useCallback(async (attr: any) => {
    const created = await api.createAttribute(attr);
    setAttributes(prev => [created, ...prev]);
    return created;
  }, []);

  const updateAttribute = useCallback(async (id: string, data: any) => {
    const result = await api.updateAttribute(id, data);
    setAttributes(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    return result;
  }, []);

  const deleteAttribute = useCallback(async (id: string) => {
    await api.deleteAttribute(id);
    setAttributes(prev => prev.filter(a => a.id !== id));
  }, []);

  return { attributes, isLoading, fetchAttributes, addAttribute, updateAttribute, deleteAttribute };
}
