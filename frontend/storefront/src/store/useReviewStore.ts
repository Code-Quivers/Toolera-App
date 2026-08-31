"use client";
import { useState, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface ReviewItem {
  id: string;
  productId: string;
  productTitle?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  helpfulCount?: number;
  createdAt: string;
}

export function useReviewStore() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
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

  // Optimistically adds a review to local state (shown as PENDING until approved)
  const addReview = useCallback((review: Partial<ReviewItem>) => {
    const newReview: ReviewItem = {
      id: review.id || `local-${Date.now()}`,
      productId: review.productId || "",
      productTitle: review.productTitle,
      customerId: review.customerId,
      customerName: review.customerName || "Anonymous",
      customerPhone: review.customerPhone,
      rating: review.rating || 5,
      comment: review.comment || "",
      status: review.status || "PENDING",
      helpfulCount: 0,
      createdAt: review.createdAt || new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);
    // Fire-and-forget API submission
    sfApi.submitReview(review).catch(() => {});
  }, []);

  const toggleHelpful = useCallback((id: string) => {
    setHelpfulIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setReviews(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, helpfulCount: (r.helpfulCount ?? 0) + (helpfulIds.has(id) ? -1 : 1) }
          : r
      )
    );
  }, [helpfulIds]);

  const getApprovedReviews = useCallback(
    () => reviews.filter(r => r.status === "APPROVED"),
    [reviews]
  );

  // Returns approved reviews for a product matched by productId, productTitle, or slug
  const getProductApprovedReviews = useCallback(
    (productIdentifier: string) =>
      reviews.filter(
        r =>
          r.status === "APPROVED" &&
          (r.productId === productIdentifier || r.productTitle === productIdentifier)
      ),
    [reviews]
  );

  // Checks whether a customer who placed an order for this product can leave a review
  const canCustomerReview = useCallback(
    (productTitle: string, phone?: string, orders?: any[]): boolean => {
      if (!phone || !orders || orders.length === 0) return false;
      return orders.some((order: any) =>
        order.items?.some(
          (item: any) =>
            item.title === productTitle || item.productTitle === productTitle
        )
      );
    },
    []
  );

  return {
    reviews,
    isLoading,
    fetchReviews,
    submitReview,
    addReview,
    toggleHelpful,
    getApprovedReviews,
    getProductApprovedReviews,
    canCustomerReview,
  };
}
