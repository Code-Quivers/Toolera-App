"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getAuthHeader } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function valFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options?.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `API error ${res.status}`);
  return (json?.data ?? json) as T;
}

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

  const addAttributeValue = useCallback(async (attributeId: string, value: any) => {
    const created = await valFetch<any>(`/api/v1/attributes/${attributeId}/values`, {
      method: "POST",
      body: JSON.stringify(value),
    });
    setAttributes(prev => prev.map(a =>
      a.id === attributeId
        ? { ...a, values: [...(a.values ?? []), created] }
        : a
    ));
    return created;
  }, []);

  const updateAttributeValue = useCallback(async (attributeId: string, valueId: string, data: any) => {
    const updated = await valFetch<any>(`/api/v1/attributes/${attributeId}/values/${valueId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setAttributes(prev => prev.map(a =>
      a.id === attributeId
        ? { ...a, values: (a.values ?? []).map((v: any) => v.id === valueId ? { ...v, ...data } : v) }
        : a
    ));
    return updated;
  }, []);

  const deleteAttributeValue = useCallback(async (attributeId: string, valueId: string) => {
    await valFetch(`/api/v1/attributes/${attributeId}/values/${valueId}`, { method: "DELETE" });
    setAttributes(prev => prev.map(a =>
      a.id === attributeId
        ? { ...a, values: (a.values ?? []).filter((v: any) => v.id !== valueId) }
        : a
    ));
  }, []);

  return {
    attributes,
    isLoading,
    fetchAttributes,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    addAttributeValue,
    updateAttributeValue,
    deleteAttributeValue,
  };
}
