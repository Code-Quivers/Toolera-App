"use client";
import { useState, useEffect, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface ExtendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  status?: string;
  tags?: string[];
  [key: string]: any;
}

export function useProductStore() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getProducts().then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getProductBySlug = useCallback((slug: string) => products.find(p => p.slug === slug), [products]);
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  return { products, isLoading, getProductBySlug, getProductById };
}
