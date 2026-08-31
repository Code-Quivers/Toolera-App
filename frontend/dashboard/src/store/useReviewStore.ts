"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useReviewStore() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = useCallback(async (params = "") => {
    setIsLoading(true);
    try {
      const data = await api.getReviews(params);
      setReviews(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateReview = useCallback(async (id: string, data: any) => {
    const result = await api.updateReview(id, data);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    return result;
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    await api.deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  return { reviews, isLoading, fetchReviews, updateReview, deleteReview };
}
