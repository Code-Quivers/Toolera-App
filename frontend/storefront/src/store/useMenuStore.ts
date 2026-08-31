"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export interface MenuItemData {
  id: string;
  label: string;
  href: string;
  children?: MenuItemData[];
}

export function useMenuStore() {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getMenus().then(d => setMenus(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return { menus, isLoading };
}
