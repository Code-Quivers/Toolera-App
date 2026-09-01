"use client";
import { useState, useEffect, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  [key: string]: any;
}

// Module-level singleton — one fetch shared across all component instances
let categoryState: Category[] = [];
let categoryLoading = false;
let categoryLoaded = false;
let categoryFetchPromise: Promise<void> | null = null;
const categoryListeners = new Set<() => void>();

function notifyCategories() { categoryListeners.forEach(l => l()); }

function fetchCategories(): Promise<void> {
  if (categoryFetchPromise) return categoryFetchPromise;
  categoryFetchPromise = sfApi.getCategories()
    .then(d => {
      categoryState = Array.isArray(d) ? d : [];
      categoryLoaded = true;
      notifyCategories();
    })
    .catch(() => {})
    .finally(() => {
      categoryLoading = false;
      categoryFetchPromise = null;
    });
  categoryLoading = true;
  return categoryFetchPromise;
}

export function useCategoryStore() {
  const [categories, setCategories] = useState<Category[]>(categoryState);
  const [isLoading, setIsLoading] = useState(!categoryLoaded);

  useEffect(() => {
    if (categoryLoaded) { setCategories([...categoryState]); setIsLoading(false); }
    const h = () => { setCategories([...categoryState]); setIsLoading(categoryLoading); };
    categoryListeners.add(h);
    fetchCategories();
    return () => { categoryListeners.delete(h); };
  }, []);

  const getCategoryBySlug = useCallback((slug: string) => categories.find(c => c.slug === slug), [categories]);

  return { categories, isLoading, getCategoryBySlug };
}
