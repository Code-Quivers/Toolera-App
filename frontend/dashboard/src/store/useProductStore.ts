"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface ExtendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  tags?: string[];
  [key: string]: any;
}

export function useProductStore() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = useCallback(async (product: any) => {
    const created = await api.createProduct(product);
    setProducts(prev => [created, ...prev]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id: string, updated: any) => {
    const result = await api.updateProduct(id, updated);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    return result;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProductBySlug = useCallback((slug: string) => products.find(p => p.slug === slug), [products]);
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  return { products, isLoading, error, fetchProducts, addProduct, updateProduct, deleteProduct, getProductBySlug, getProductById };
}
