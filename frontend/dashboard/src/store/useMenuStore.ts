"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type MenuItemData = any;

export const DEFAULT_MENUS = [{ id: "main", label: "Main Menu", items: [] }];

export function useMenuStore() {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMenus();
      setMenus(Array.isArray(data) ? data : []);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const saveMenus = useCallback(async (data: any) => {
    const result = await api.updateMenus(data);
    setMenus(Array.isArray(data) ? data : menus);
    return result;
  }, [menus]);

  return { menus, isLoading, fetchMenus, saveMenus };
}
