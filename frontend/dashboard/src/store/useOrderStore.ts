"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  area?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  status?: string;
  notes?: string;
  trackingCode?: string;
  items: Array<{
    id: string;
    productId?: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export function useOrderStore() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async (params = "") => {
    setIsLoading(true);
    try {
      const data = await api.getOrders(params);
      const list = Array.isArray(data) ? data : [];
      setOrders(list.map((o: any) => ({ ...o, status: o.orderStatus ?? o.status })));
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const addOrder = useCallback(async (orderData: any) => {
    const created = await api.createOrder(orderData);
    setOrders(prev => [{ ...created, status: created.orderStatus ?? created.status }, ...prev]);
    return created;
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    const result = await api.updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus: status, status } : o));
    return result;
  }, []);

  const updateTracking = useCallback(async (id: string, trackingCode: string) => {
    const result = await api.updateOrderTracking(id, trackingCode);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, trackingCode } : o));
    return result;
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    await api.deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const convertDraftToOrder = useCallback(async (id: string) => {
    const result = await api.updateOrderStatus(id, "PENDING");
    setOrders(prev => prev.map(o => o.id === id ? { ...o, orderStatus: "PENDING", status: "PENDING" } : o));
    return result;
  }, []);

  return { orders, isLoading, fetchOrders, addOrder, updateOrderStatus, updateTracking, deleteOrder, convertDraftToOrder };
}
