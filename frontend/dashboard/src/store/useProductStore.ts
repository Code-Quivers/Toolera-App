"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface ExtendedProduct {
  id: string;
  name: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  stock: number;
  stockQuantity?: number;
  categorySlug: string;
  images: string[];
  status: "DRAFT" | "PUBLISHED";
  isTrending?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  shortDescription?: string;
  specifications?: { label: string; value: string }[];
  badge?: string;
  [key: string]: any;
}

function normalizeProduct(p: any): ExtendedProduct {
  const images: string[] = Array.isArray(p.images)
    ? p.images.map((img: any) => (typeof img === "string" ? img : img?.url ?? "")).filter(Boolean)
    : [];
  return {
    ...p,
    name: p.title ?? p.name ?? "",
    title: p.title ?? p.name ?? "",
    categorySlug: p.categorySlug ?? p.category?.slug ?? "",
    images,
    rating: p.rating ?? p.calculatedRating ?? 0,
    reviewCount: p.reviewCount ?? p.calculatedReviewCount ?? 0,
    stock: p.stock ?? p.stockQuantity ?? 0,
    stockQuantity: p.stock ?? p.stockQuantity ?? 0,
  };
}

export function useProductStore() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts();
      const list = Array.isArray(data) ? data : [];
      setProducts(list.map(normalizeProduct));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = useCallback(async (product: any) => {
    const created = await api.createProduct(product);
    setProducts(prev => [normalizeProduct(created), ...prev]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id: string, updated: any) => {
    const result = await api.updateProduct(id, updated);
    const normalized = normalizeProduct({ ...products.find(p => p.id === id), ...updated, ...result });
    setProducts(prev => prev.map(p => p.id === id ? normalized : p));
    return result;
  }, [products]);

  const quickEditProduct = useCallback(async (id: string, data: Partial<ExtendedProduct>) => {
    await api.updateProduct(id, data);
    setProducts(prev => prev.map(p => p.id === id ? normalizeProduct({ ...p, ...data }) : p));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicateProduct = useCallback(async (id: string) => {
    const source = products.find(p => p.id === id);
    if (!source) return;
    const { id: _id, slug, sku, createdAt, updatedAt, ...rest } = source;
    const newProduct = {
      ...rest,
      title: `${rest.title} (Copy)`,
      slug: `${slug}-copy-${Date.now()}`,
      sku: `${sku}-COPY`,
      status: "DRAFT" as const,
    };
    const created = await api.createProduct(newProduct);
    setProducts(prev => [normalizeProduct(created), ...prev]);
  }, [products]);

  const bulkAction = useCallback(async (
    ids: string[],
    action: "trending" | "featured" | "delete" | "publish" | "draft"
  ) => {
    if (action === "delete") {
      await Promise.all(ids.map(id => api.deleteProduct(id)));
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    } else {
      const updates: Partial<ExtendedProduct> = {};
      if (action === "trending") updates.isTrending = true;
      if (action === "featured") updates.isFeatured = true;
      if (action === "publish") updates.status = "PUBLISHED";
      if (action === "draft") updates.status = "DRAFT";
      await Promise.all(ids.map(id => api.updateProduct(id, updates)));
      setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
    }
  }, []);

  const getProductBySlug = useCallback((slug: string) => products.find(p => p.slug === slug), [products]);
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    quickEditProduct,
    deleteProduct,
    duplicateProduct,
    bulkAction,
    getProductBySlug,
    getProductById,
  };
}
