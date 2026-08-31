"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export function usePageStore() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getPages().then(d => setPages(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getPageBySlug = (slug: string) => pages.find(p => p.slug === slug);

  return { pages, isLoading, getPageBySlug };
}
