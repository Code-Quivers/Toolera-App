"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  position?: number;
  isActive?: boolean;
  productCount?: number;
  itemCount?: number;
  createdAt?: string;
}

// Module-level singleton — all hook instances share one list
let globalCategories: CategoryItem[] = [];
let globalLoading = false;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

async function doFetch() {
  if (globalLoading) return fetchPromise;
  globalLoading = true;
  notify();
  fetchPromise = (async () => {
    try {
      const data = await api.getCategories();
      globalCategories = Array.isArray(data) ? data : [];
    } catch {
      globalCategories = [];
    } finally {
      globalLoading = false;
      fetchPromise = null;
      notify();
    }
  })();
  return fetchPromise;
}

export function useCategoryStore() {
  const [, tick] = useState(0);

  useEffect(() => {
    const rerender = () => tick(n => n + 1);
    listeners.add(rerender);
    // Always fetch fresh on mount — no localStorage cache
    doFetch();
    return () => { listeners.delete(rerender); };
  }, []);

  const fetchCategories = useCallback(() => doFetch(), []);

  const addCategory = useCallback(async (cat: any) => {
    const created = await api.createCategory(cat);
    // Optimistic: add to top immediately, then re-fetch for real DB order
    globalCategories = [created, ...globalCategories];
    notify();
    await doFetch();
    return created;
  }, []);

  const updateCategory = useCallback(async (id: string, data: any) => {
    // Optimistic update
    globalCategories = globalCategories.map(c => c.id === id ? { ...c, ...data } : c);
    notify();
    const result = await api.updateCategory(id, data);
    await doFetch();
    return result;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    // Optimistic remove
    globalCategories = globalCategories.filter(c => c.id !== id);
    notify();
    await api.deleteCategory(id);
    await doFetch();
  }, []);

  return {
    categories: globalCategories,
    isLoading: globalLoading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
