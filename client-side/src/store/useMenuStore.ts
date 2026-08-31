import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface MenuItemData {
  id: string;
  label: string;
  url: string;
  type: "PAGE" | "CATEGORY" | "CUSTOM" | "FILTER";
  targetBlank?: boolean;
  parentId?: string | null; // For hierarchical submenus
  icon?: string;
  promoTag?: string;
  promoTitle?: string;
  promoDescription?: string;
  promoImage?: string;
  promoButtonText?: string;
  promoButtonLink?: string;
}

export interface MenuDefinition {
  id: string;
  name: string;
  autoAddPages: boolean;
  locations: {
    header: boolean;
    categories: boolean; // Categories Menu (Sidebar & Mega Menu)
    footer: boolean;
    topBar: boolean;
    mobile: boolean;
  };
  items: MenuItemData[];
}

interface MenuStoreState {
  menus: MenuDefinition[];
  activeMenuId: string;

  // Active Menu Getters & Setters
  getActiveMenu: () => MenuDefinition;
  setActiveMenuId: (id: string) => void;
  createMenu: (name: string) => MenuDefinition;
  deleteMenu: (id: string) => void;
  updateActiveMenu: (updated: Partial<MenuDefinition>) => void;

  // Items Actions on Active Menu
  setItems: (items: MenuItemData[]) => void;
  addItem: (item: Omit<MenuItemData, "id">) => void;
  addMultipleItems: (items: Omit<MenuItemData, "id">[]) => void;
  updateItem: (id: string, updated: Partial<MenuItemData>) => void;
  removeItem: (id: string) => void;
  indentItem: (id: string, direction: "indent" | "outdent") => void;
  makeSubItemOf: (itemId: string, parentId: string) => void;

  // Query menus by location
  getMenuByLocation: (loc: "header" | "categories" | "footer" | "topBar" | "mobile") => MenuDefinition | undefined;
}

export const DEFAULT_MENUS: MenuDefinition[] = [
  {
    id: "menu-header",
    name: "Primary Menu (Header)",
    autoAddPages: false,
    locations: {
      header: true,
      categories: false,
      footer: false,
      topBar: false,
      mobile: true,
    },
    items: [
      { id: "m-1", label: "Shop All", url: "/shop", type: "FILTER" },
      { id: "m-2", label: "Trending Now", url: "/shop?filter=trending", type: "FILTER" },
      { id: "m-3", label: "New Arrivals", url: "/shop?filter=new-arrivals", type: "FILTER" },
      { id: "m-4", label: "Best Sellers", url: "/shop?filter=best-sellers", type: "FILTER" },
      { id: "m-5", label: "Smart Gadgets", url: "/category/smart-gadgets", type: "CATEGORY" },
      { id: "m-6", label: "Desk Setup", url: "/category/desk-setup", type: "CATEGORY" },
      { id: "m-7", label: "Home & Living", url: "/category/home-living", type: "CATEGORY" },
      { id: "m-8", label: "Lifestyle & Travel", url: "/category/lifestyle-travel", type: "CATEGORY" },
    ],
  },
  {
    id: "menu-categories",
    name: "Categories Menu (Sidebar & Mega Menu)",
    autoAddPages: false,
    locations: {
      header: false,
      categories: true,
      footer: false,
      topBar: false,
      mobile: false,
    },
    items: [
      // Category 1: Smartphones & Mobile
      { id: "cat-m-1", label: "Smartphones & Mobile", url: "/category/smart-gadgets", type: "CATEGORY" },
      // Column 1
      { id: "cat-m-1-c1", label: "Smartphones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c1-1", label: "Apple", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-2", label: "Samsung", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-3", label: "Google", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-4", label: "Nokia", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-5", label: "Motorola", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-6", label: "Refurbished phones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1" },
      { id: "cat-m-1-c1-acc", label: "Accessories", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c1-acc-1", label: "Memory cards", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1-acc" },
      { id: "cat-m-1-c1-acc-2", label: "Stand holders", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1-acc" },
      { id: "cat-m-1-c1-acc-3", label: "Car holders", url: "/category/car-accessories", type: "CATEGORY", parentId: "cat-m-1-c1-acc" },
      { id: "cat-m-1-c1-acc-4", label: "Selfie sticks", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c1-acc" },

      // Column 2
      { id: "cat-m-1-c2", label: "Power Banks", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c2-1", label: "Baseus", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2" },
      { id: "cat-m-1-c2-2", label: "Remax", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2" },
      { id: "cat-m-1-c2-3", label: "Hoco", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2" },
      { id: "cat-m-1-c2-sp", label: "Screen Protectors", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c2-sp-1", label: "Tempered glass", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2-sp" },
      { id: "cat-m-1-c2-sp-2", label: "Polycarbonate protector", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2-sp" },
      { id: "cat-m-1-c2-cov", label: "Covers For Phones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c2-cov-1", label: "Cavers-overlays", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2-cov" },
      { id: "cat-m-1-c2-cov-2", label: "Covers-cases", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c2-cov" },

      // Column 3
      { id: "cat-m-1-c3-hp", label: "Headphones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c3-hp-1", label: "In-ear headphones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-hp" },
      { id: "cat-m-1-c3-hp-2", label: "Wired headphones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-hp" },
      { id: "cat-m-1-c3-hp-3", label: "Wireless headphones", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-hp" },
      { id: "cat-m-1-c3-hp-4", label: "Bluetooth headsets", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-hp" },
      { id: "cat-m-1-c3-pd", label: "Power Devices", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1" },
      { id: "cat-m-1-c3-pd-1", label: "Mains chargers", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-pd" },
      { id: "cat-m-1-c3-pd-2", label: "Data cables", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-pd" },
      { id: "cat-m-1-c3-pd-3", label: "Wireless chargers", url: "/category/smart-gadgets", type: "CATEGORY", parentId: "cat-m-1-c3-pd" },

      // Category 2: Desk Setup & Workspace
      { id: "cat-m-2", label: "Desk Setup & Workspace", url: "/category/desk-setup", type: "CATEGORY" },
      { id: "cat-m-2-c1", label: "Desk Lighting", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2" },
      { id: "cat-m-2-c1-1", label: "Screenbar Monitor Lights", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c1" },
      { id: "cat-m-2-c1-2", label: "RGB Ambient Backlights", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c1" },
      { id: "cat-m-2-c1-3", label: "Magnetic Gooseneck Lamps", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c1" },
      { id: "cat-m-2-c2", label: "Stands & Risers", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2" },
      { id: "cat-m-2-c2-1", label: "Aluminum Laptop Risers", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c2" },
      { id: "cat-m-2-c2-2", label: "Dual Gas-Spring Monitor Arms", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c2" },
      { id: "cat-m-2-c3", label: "Desk Accessories", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2" },
      { id: "cat-m-2-c3-1", label: "Leather Full-Desk Mats", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c3" },
      { id: "cat-m-2-c3-2", label: "Under-desk Cable Trays", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c3" },
      { id: "cat-m-2-c3-3", label: "Memory Foam Wrist Rests", url: "/category/desk-setup", type: "CATEGORY", parentId: "cat-m-2-c3" },

      // Category 3: Smart Home & Living
      { id: "cat-m-3", label: "Smart Home & Living", url: "/category/home-living", type: "CATEGORY" },
      { id: "cat-m-3-c1", label: "Aesthetic Living", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3" },
      { id: "cat-m-3-c1-1", label: "Flame LED Aroma Diffusers", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c1" },
      { id: "cat-m-3-c1-2", label: "Anti-Gravity Humidifiers", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c1" },
      { id: "cat-m-3-c2", label: "Smart Sensors", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3" },
      { id: "cat-m-3-c2-1", label: "Motion Sensor Lights", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c2" },
      { id: "cat-m-3-c2-2", label: "Digital Thermo-Hygrometers", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c2" },
      { id: "cat-m-3-c3", label: "Home Organization", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3" },
      { id: "cat-m-3-c3-1", label: "Magnetic Key Holders", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c3" },
      { id: "cat-m-3-c3-2", label: "Space-saving Shelf Clips", url: "/category/home-living", type: "CATEGORY", parentId: "cat-m-3-c3" },

      // Category 4: Lifestyle & Travel
      { id: "cat-m-4", label: "Lifestyle & Travel", url: "/category/lifestyle-travel", type: "CATEGORY" },
      { id: "cat-m-4-c1", label: "Portable Cooling", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4" },
      { id: "cat-m-4-c1-1", label: "Turbo Handheld Mini Fans", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4-c1" },
      { id: "cat-m-4-c1-2", label: "Neck Band Fans", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4-c1" },
      { id: "cat-m-4-c2", label: "Travel Essentials", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4" },
      { id: "cat-m-4-c2-1", label: "Compressible Packing Cubes", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4-c2" },
      { id: "cat-m-4-c2-2", label: "Universal Travel Adapters", url: "/category/lifestyle-travel", type: "CATEGORY", parentId: "cat-m-4-c2" },

      // Category 5: Car Accessories
      { id: "cat-m-5", label: "Car Accessories", url: "/category/car-accessories", type: "CATEGORY" },
      { id: "cat-m-5-c1", label: "In-Car Gadgets", url: "/category/car-accessories", type: "CATEGORY", parentId: "cat-m-5" },
      { id: "cat-m-5-c1-1", label: "MagSafe Auto Mounts", url: "/category/car-accessories", type: "CATEGORY", parentId: "cat-m-5-c1" },
      { id: "cat-m-5-c1-2", label: "Cordless Car Vacuums", url: "/category/car-accessories", type: "CATEGORY", parentId: "cat-m-5-c1" },

      // Category 6: Kitchen Gadgets
      { id: "cat-m-6", label: "Kitchen Gadgets", url: "/category/kitchen-gadgets", type: "CATEGORY" },
      { id: "cat-m-6-c1", label: "Smart Tools", url: "/category/kitchen-gadgets", type: "CATEGORY", parentId: "cat-m-6" },
      { id: "cat-m-6-c1-1", label: "Portable USB Blenders", url: "/category/kitchen-gadgets", type: "CATEGORY", parentId: "cat-m-6-c1" },
      { id: "cat-m-6-c1-2", label: "Rechargeable Bag Sealers", url: "/category/kitchen-gadgets", type: "CATEGORY", parentId: "cat-m-6-c1" },
    ],
  },
  {
    id: "menu-footer",
    name: "Other Menu (Footer)",
    autoAddPages: true,
    locations: {
      header: false,
      categories: false,
      footer: true,
      topBar: false,
      mobile: false,
    },
    items: [
      { id: "f-1", label: "About Raifa's Mart", url: "/pages/about-us", type: "PAGE" },
      { id: "f-2", label: "Delivery & Shipping Policy", url: "/pages/delivery", type: "PAGE" },
      { id: "f-3", label: "7-Day Return & Refund Guarantee", url: "/pages/refund", type: "PAGE" },
      { id: "f-4", label: "Contact Us & Hotline", url: "/pages/contact", type: "PAGE" },
      { id: "f-5", label: "Privacy Policy", url: "/pages/privacy-policy", type: "PAGE" },
      { id: "f-6", label: "Terms & Conditions", url: "/pages/terms", type: "PAGE" },
    ],
  },
];

import { triggerSoftAction } from "./useSoftLoadingStore";

export const useMenuStore = create<MenuStoreState>()(
  persist(
    (set, get) => ({
      menus: DEFAULT_MENUS,
      activeMenuId: "menu-header",

      getActiveMenu: () => {
        const { menus, activeMenuId } = get();
        return menus.find((m) => m.id === activeMenuId) || menus[0] || DEFAULT_MENUS[0];
      },

      setActiveMenuId: (id) => set({ activeMenuId: id }),

      createMenu: (name) => {
        triggerSoftAction("Creating new custom menu...", 350);
        const newMenu: MenuDefinition = {
          id: `menu-${Date.now()}`,
          name: name.trim() || "New Custom Menu",
          autoAddPages: false,
          locations: {
            header: false,
            categories: false,
            footer: false,
            topBar: false,
            mobile: false,
          },
          items: [],
        };
        set({
          menus: [...get().menus, newMenu],
          activeMenuId: newMenu.id,
        });
        return newMenu;
      },

      deleteMenu: (id) => {
        const remaining = get().menus.filter((m) => m.id !== id);
        if (remaining.length === 0) {
          remaining.push(DEFAULT_MENUS[0]);
        }
        set({
          menus: remaining,
          activeMenuId: remaining[0].id,
        });
      },

      updateActiveMenu: (updated) => {
        const { menus, activeMenuId } = get();
        set({
          menus: menus.map((m) => (m.id === activeMenuId ? { ...m, ...updated } : m)),
        });
      },

      setItems: (newItems) => {
        const { menus, activeMenuId } = get();
        set({
          menus: menus.map((m) => (m.id === activeMenuId ? { ...m, items: newItems } : m)),
        });
      },

      addItem: (item) => {
        const currentMenu = get().getActiveMenu();
        const newItem: MenuItemData = {
          ...item,
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };
        get().setItems([...currentMenu.items, newItem]);
      },

      addMultipleItems: (newItems) => {
        const currentMenu = get().getActiveMenu();
        const prepared = newItems.map((item, idx) => ({
          ...item,
          id: `m-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        }));
        get().setItems([...currentMenu.items, ...prepared]);
      },

      updateItem: (id, updated) => {
        const currentMenu = get().getActiveMenu();
        get().setItems(
          currentMenu.items.map((it) => (it.id === id ? { ...it, ...updated } : it))
        );
      },

      removeItem: (id) => {
        const currentMenu = get().getActiveMenu();
        get().setItems(
          currentMenu.items.filter((it) => it.id !== id && it.parentId !== id)
        );
      },

      indentItem: (id, direction) => {
        const currentMenu = get().getActiveMenu();
        const items = [...currentMenu.items];
        const idx = items.findIndex((it) => it.id === id);
        if (idx === -1) return;

        if (direction === "indent" && idx > 0) {
          const prevItem = items[idx - 1];
          items[idx] = {
            ...items[idx],
            parentId: prevItem.parentId || prevItem.id,
          };
        } else if (direction === "outdent") {
          items[idx] = {
            ...items[idx],
            parentId: null,
          };
        }
        get().setItems(items);
      },

      makeSubItemOf: (itemId, parentId) => {
        const currentMenu = get().getActiveMenu();
        get().setItems(
          currentMenu.items.map((it) =>
            it.id === itemId ? { ...it, parentId: parentId === "none" ? null : parentId } : it
          )
        );
      },

      getMenuByLocation: (loc) => {
        return get().menus.find((m) => m.locations[loc]);
      },
    }),
    {
      name: "raifas_mart_multi_menu_store_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
