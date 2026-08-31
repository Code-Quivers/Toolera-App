"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useCategoryStore() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = useCallback(async (cat: any) => {
    const created = await api.createCategory(cat);
    setCategories(prev => [created, ...prev]);
    return created;
  }, []);

  const updateCategory = useCallback(async (id: string, data: any) => {
    const result = await api.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    return result;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return { categories, isLoading, fetchCategories, addCategory, updateCategory, deleteCategory };
}
