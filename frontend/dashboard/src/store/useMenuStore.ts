"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

export type MenuItemData = {
  id: string;
  label: string;
  url: string;
  type?: string;
  parentId?: string | null;
  targetBlank?: boolean;
  position?: number;
  promoTitle?: string;
  promoTag?: string;
  promoImage?: string;
};

export type MenuLocations = {
  header?: boolean;
  categories?: boolean;
  footer?: boolean;
  topBar?: boolean;
};

export type MenuData = {
  id: string;
  name: string;
  location: string;
  locations?: MenuLocations;
  autoAddPages?: boolean;
  items: MenuItemData[];
};

export const DEFAULT_MENUS: MenuData[] = [];

export function useMenuStore() {
  const [menus, setMenus] = useState<MenuData[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeMenuIdRef = useRef<string | null>(null);
  activeMenuIdRef.current = activeMenuId;

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getMenus();
      const loaded: MenuData[] = (Array.isArray(data) ? data : []).map((m: any) => ({
        id: m.id,
        name: m.name,
        location: m.location || 'HEADER',
        locations: (m.settings as any)?.locations ?? {},
        autoAddPages: (m.settings as any)?.autoAddPages ?? false,
        items: (m.items || []).map((it: any) => ({
          id: it.id,
          label: it.title || it.label || '',
          url: it.url || '#',
          type: it.type || 'CUSTOM',
          parentId: it.parentId || null,
          targetBlank: it.isExternal || it.targetBlank || false,
          position: it.position ?? 0,
          promoTitle: it.promoTitle,
          promoTag: it.promoTag,
          promoImage: it.promoImage,
        })),
      }));
      setMenus(loaded);
      if (loaded.length > 0 && !activeMenuIdRef.current) {
        setActiveMenuId(loaded[0].id);
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const getActiveMenu = useCallback((): MenuData | null => {
    return menus.find(m => m.id === activeMenuIdRef.current) ?? menus[0] ?? null;
  }, [menus]);

  const createMenu = useCallback((name: string): MenuData => {
    const newMenu: MenuData = { id: crypto.randomUUID(), name, location: 'HEADER', locations: {}, autoAddPages: false, items: [] };
    setMenus(prev => [...prev, newMenu]);
    setActiveMenuId(newMenu.id);
    return newMenu;
  }, []);

  const deleteMenu = useCallback((id: string) => {
    setMenus(prev => {
      const next = prev.filter(m => m.id !== id);
      if (activeMenuIdRef.current === id) {
        setActiveMenuId(next[0]?.id ?? null);
      }
      return next;
    });
  }, []);

  const updateActiveMenu = useCallback((updates: Partial<MenuData>) => {
    setMenus(prev => prev.map(m => m.id === activeMenuIdRef.current ? { ...m, ...updates } : m));
  }, []);

  const setItems = useCallback((items: MenuItemData[]) => {
    setMenus(prev => prev.map(m => m.id === activeMenuIdRef.current ? { ...m, items } : m));
  }, []);

  const addMultipleItems = useCallback((newItems: Omit<MenuItemData, 'id'>[]) => {
    const withIds: MenuItemData[] = newItems.map(item => ({ ...item, id: crypto.randomUUID(), parentId: item.parentId ?? null }));
    setMenus(prev => prev.map(m =>
      m.id === activeMenuIdRef.current
        ? { ...m, items: [...m.items, ...withIds] }
        : m
    ));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<MenuItemData>) => {
    setMenus(prev => prev.map(m =>
      m.id === activeMenuIdRef.current
        ? { ...m, items: m.items.map(it => it.id === id ? { ...it, ...updates } : it) }
        : m
    ));
  }, []);

  const removeItem = useCallback((id: string) => {
    setMenus(prev => prev.map(m =>
      m.id === activeMenuIdRef.current
        ? { ...m, items: m.items.filter(it => it.id !== id && it.parentId !== id) }
        : m
    ));
  }, []);

  const indentItem = useCallback((id: string, direction: 'indent' | 'outdent') => {
    setMenus(prev => prev.map(m => {
      if (m.id !== activeMenuIdRef.current) return m;
      const items = m.items;
      const idx = items.findIndex(i => i.id === id);
      if (idx < 0) return m;
      const item = items[idx];
      let newParentId: string | null = null;
      if (direction === 'indent' && idx > 0) {
        const prevItem = items[idx - 1];
        newParentId = prevItem.parentId || prevItem.id;
      }
      // direction === 'outdent': newParentId stays null (top-level)
      return { ...m, items: items.map(it => it.id === id ? { ...it, parentId: newParentId } : it) };
    }));
  }, []);

  const makeSubItemOf = useCallback((childId: string, parentId: string) => {
    setMenus(prev => prev.map(m =>
      m.id === activeMenuIdRef.current
        ? { ...m, items: m.items.map(it => it.id === childId ? { ...it, parentId: parentId === 'none' ? null : parentId } : it) }
        : m
    ));
  }, []);

  const saveMenus = useCallback(async () => {
    const payload = menus.map(m => ({
      id: m.id,
      name: m.name,
      location: m.location || 'HEADER',
      settings: {
        locations: m.locations ?? {},
        autoAddPages: m.autoAddPages ?? false,
      },
      items: m.items.map((it, idx) => ({
        id: it.id,
        title: it.label,
        url: it.url,
        type: it.type || 'CUSTOM',
        parentId: it.parentId || null,
        targetBlank: it.targetBlank || false,
        isExternal: it.targetBlank || false,
        position: it.position ?? idx,
        promoTitle: it.promoTitle,
        promoTag: it.promoTag,
        promoImage: it.promoImage,
      })),
    }));
    await api.updateMenus(payload);
  }, [menus]);

  return {
    menus,
    activeMenuId,
    getActiveMenu,
    setActiveMenuId,
    createMenu,
    deleteMenu,
    updateActiveMenu,
    setItems,
    addMultipleItems,
    updateItem,
    removeItem,
    indentItem,
    makeSubItemOf,
    saveMenus,
    isLoading,
    fetchMenus,
  };
}
