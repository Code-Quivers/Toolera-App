"use client";
import { useState, useEffect, useCallback } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface MenuItemData {
  id: string;
  label: string;
  href: string;
  children?: MenuItemData[];
}

export const DEFAULT_MENUS = [
  { id: "main", label: "Main Menu", location: "header", items: [] as any[] },
];

export function useMenuStore() {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getMenus().then(d => setMenus(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getMenuByLocation = useCallback(
    (location: string) => menus.find((m: any) => m.location === location) ?? null,
    [menus]
  );

  const getActiveMenu = useCallback(
    () => menus[0] ?? null,
    [menus]
  );

  return { menus, isLoading, getMenuByLocation, getActiveMenu };
}
