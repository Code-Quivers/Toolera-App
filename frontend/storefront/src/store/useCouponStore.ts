"use client";
import { useState, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useCouponStore() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateCoupon = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      return await sfApi.validateCoupon(code);
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { coupons, isLoading, validateCoupon };
}
