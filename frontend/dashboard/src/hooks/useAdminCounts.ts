"use client";
import { useState, useEffect } from "react";
import { getAuthHeader } from "@/lib/auth";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");

export interface AdminCounts {
  orders: number;
  customers: number;
  pendingReviews: number;
  pendingOrders: number;
  ordersThisMonth: number;
  totalProducts: number;
}

export function useAdminCounts() {
  const [counts, setCounts] = useState<AdminCounts>({
    orders: 0,
    customers: 0,
    pendingReviews: 0,
    pendingOrders: 0,
    ordersThisMonth: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) return;

    Promise.all([
      fetch(`${API}/api/v1/orders/dashboard-stats`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/api/v1/customers/count`, { headers }).then(r => r.ok ? r.json() : { data: { count: 0 } }),
      fetch(`${API}/api/v1/reviews/count?status=PENDING`, { headers }).then(r => r.ok ? r.json() : { data: { count: 0 } }),
    ]).then(([stats, customers, reviews]) => {
      setCounts({
        orders: stats?.data?.totalOrders ?? 0,
        pendingOrders: stats?.data?.pendingOrders ?? 0,
        ordersThisMonth: stats?.data?.ordersThisMonth ?? 0,
        totalProducts: stats?.data?.totalProducts ?? 0,
        customers: customers?.data?.count ?? 0,
        pendingReviews: reviews?.data?.count ?? 0,
      });
    }).catch(() => {});
  }, []);

  return counts;
}
