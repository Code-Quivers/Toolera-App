"use client";
import { useState, useEffect } from "react";
import { getAuthHeader } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AdminCounts {
  orders: number;
  customers: number;
  pendingReviews: number;
}

export function useAdminCounts() {
  const [counts, setCounts] = useState<AdminCounts>({ orders: 0, customers: 0, pendingReviews: 0 });

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;

    Promise.all([
      fetch(`${API}/api/v1/orders/count`, { headers }).then(r => r.ok ? r.json() : { count: 0 }),
      fetch(`${API}/api/v1/customers/count`, { headers }).then(r => r.ok ? r.json() : { count: 0 }),
      fetch(`${API}/api/v1/reviews/count?status=PENDING`, { headers }).then(r => r.ok ? r.json() : { count: 0 }),
    ]).then(([orders, customers, reviews]) => {
      setCounts({
        orders: orders?.data?.count ?? orders?.count ?? 0,
        customers: customers?.data?.count ?? customers?.count ?? 0,
        pendingReviews: reviews?.data?.count ?? reviews?.count ?? 0,
      });
    }).catch(() => {});
  }, []);

  return counts;
}
