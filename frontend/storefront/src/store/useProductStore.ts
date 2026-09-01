"use client";
import { useState, useEffect, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface ExtendedProduct {
  id: string;
  name: string;
  title?: string;
  slug: string;
  price: number;
  images?: string[];
  status?: string;
  tags?: string[];
  categorySlug?: string;
  category?: any;
  rating?: number;
  [key: string]: any;
}

// Module-level singleton — one fetch shared across all component instances
let productState: ExtendedProduct[] = [];
let productLoading = false;
let productLoaded = false;
let productFetchPromise: Promise<void> | null = null;
const productListeners = new Set<() => void>();

function notifyProducts() { productListeners.forEach(l => l()); }

function fetchProducts(): Promise<void> {
  if (productFetchPromise) return productFetchPromise;
  productFetchPromise = sfApi.getProducts()
    .then(d => {
      productState = Array.isArray(d) ? d : [];
      productLoaded = true;
      notifyProducts();
    })
    .catch(() => {})
    .finally(() => {
      productLoading = false;
      productFetchPromise = null;
    });
  productLoading = true;
  return productFetchPromise;
}

export function useProductStore() {
  const [products, setProducts] = useState<ExtendedProduct[]>(productState);
  const [isLoading, setIsLoading] = useState(!productLoaded);

  useEffect(() => {
    if (productLoaded) { setProducts([...productState]); setIsLoading(false); }
    const h = () => { setProducts([...productState]); setIsLoading(productLoading); };
    productListeners.add(h);
    fetchProducts();
    return () => { productListeners.delete(h); };
  }, []);

  const getProductBySlug = useCallback((slug: string) => products.find(p => p.slug === slug), [products]);
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  return { products, isLoading, getProductBySlug, getProductById };
}
