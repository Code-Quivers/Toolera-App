"use client";
import { useState, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface ReviewItem {
  id: string;
  productId: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export function useReviewStore() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const data = await sfApi.getReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch {} finally {
      setIsLoading(false);
    }
  }, []);

  const submitReview = useCallback(async (data: Partial<ReviewItem>) => {
    const created = await sfApi.submitReview(data);
    setReviews(prev => [created, ...prev]);
    return created;
  }, []);

  return { reviews, isLoading, fetchReviews, submitReview };
}
