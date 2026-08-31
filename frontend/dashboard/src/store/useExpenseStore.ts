"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useExpenseStore() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: any) => {
    const created = await api.createExpense(expense);
    setExpenses(prev => [created, ...prev]);
    return created;
  }, []);

  const updateExpense = useCallback(async (id: string, data: any) => {
    const result = await api.updateExpense(id, data);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    return result;
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await api.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  return { expenses, isLoading, fetchExpenses, addExpense, updateExpense, deleteExpense };
}
