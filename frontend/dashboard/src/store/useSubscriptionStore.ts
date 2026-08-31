"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useSubscriptionStore() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try { setSubscription(await api.getSubscription()); } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const createSubscription = useCallback(async (data: any) => {
    const result = await api.createSubscription(data);
    setSubscription(result);
    return result;
  }, []);

  return { subscription, isLoading, fetchSubscription, createSubscription };
}
