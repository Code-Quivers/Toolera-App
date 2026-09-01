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
  { id: "main", label: "Main Menu", location: "HEADER", items: [] as any[] },
];

// Maps UI location keys to the string a caller passes to getMenuByLocation
const LOCATION_KEY_MAP: Record<string, string> = {
  header: "HEADER",
  categories: "CATEGORIES",
  footer: "FOOTER",
  topBar: "TOP_BAR",
};

export function useMenuStore() {
  const [menus, setMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getMenus().then(d => setMenus(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const getMenuByLocation = useCallback(
    (location: string) => {
      const loc = location.toUpperCase();
      return menus.find((m: any) => {
        // Check primary location field
        if ((m.location || '').toUpperCase() === loc) return true;
        // Check settings.locations object (multi-location assignment)
        const locs: Record<string, boolean> = (m.settings as any)?.locations ?? {};
        return Object.entries(LOCATION_KEY_MAP).some(
          ([key, val]) => val === loc && locs[key]
        );
      }) ?? null;
    },
    [menus]
  );

  const getActiveMenu = useCallback(
    () => menus[0] ?? null,
    [menus]
  );

  return { menus, isLoading, getMenuByLocation, getActiveMenu };
}
