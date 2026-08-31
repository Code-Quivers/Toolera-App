"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useCouponStore() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const addCoupon = useCallback(async (coupon: any) => {
    const created = await api.createCoupon(coupon);
    setCoupons(prev => [created, ...prev]);
    return created;
  }, []);

  const updateCoupon = useCallback(async (id: string, data: any) => {
    const result = await api.updateCoupon(id, data);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    return result;
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    await api.deleteCoupon(id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  }, []);

  return { coupons, isLoading, fetchCoupons, addCoupon, updateCoupon, deleteCoupon };
}
