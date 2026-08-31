"use client";
import { useState, useEffect, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useCategoryStore() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getCategories().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getCategoryBySlug = useCallback((slug: string) => categories.find(c => c.slug === slug), [categories]);

  return { categories, isLoading, getCategoryBySlug };
}
