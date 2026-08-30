import { create } from 'zustand';
import { GlobalAttribute, GlobalAttributeValue, AttributeType } from '@/types';

interface AttributeStoreState {
  attributes: GlobalAttribute[];
  isLoading: boolean;
  searchQuery: string;
  typeFilter: string;
  
  // Actions
  setAttributes: (attributes: GlobalAttribute[]) => void;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (type: string) => void;
  
  // CRUD Attribute
  addAttribute: (attr: Omit<GlobalAttribute, 'id' | 'position' | 'isActive' | 'values'>) => Promise<GlobalAttribute>;
  updateAttribute: (id: string, data: Partial<GlobalAttribute>) => Promise<void>;
  deleteAttribute: (id: string) => Promise<void>;
  toggleAttributeActive: (id: string) => Promise<void>;
  
  // CRUD Attribute Values
  addAttributeValue: (attributeId: string, val: Omit<GlobalAttributeValue, 'id' | 'attributeId' | 'position' | 'isActive'>) => Promise<GlobalAttributeValue>;
  updateAttributeValue: (attributeId: string, valueId: string, data: Partial<GlobalAttributeValue>) => Promise<void>;
  deleteAttributeValue: (attributeId: string, valueId: string) => Promise<void>;
  reorderAttributeValues: (attributeId: string, newValues: GlobalAttributeValue[]) => Promise<void>;
  
  // Sync
  fetchAttributes: () => Promise<void>;
  saveToServer: () => Promise<void>;
}

export const useAttributeStore = create<AttributeStoreState>((set, get) => ({
  attributes: [],
  isLoading: false,
  searchQuery: '',
  typeFilter: 'ALL',

  setAttributes: (attributes) => set({ attributes }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),

  fetchAttributes: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/sync');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.attributes) {
          set({ attributes: json.data.attributes });
        }
      }
    } catch (err) {
      console.error('Failed to fetch attributes:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveToServer: async () => {
    try {
      const attributes = get().attributes;
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'attributes', data: attributes }),
      });
    } catch (err) {
      console.error('Failed to save attributes to server:', err);
    }
  },

  addAttribute: async (attrData) => {
    const slug = attrData.slug || attrData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newAttr: GlobalAttribute = {
      id: `attr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: attrData.name.trim(),
      slug: slug,
      type: attrData.type,
      position: get().attributes.length,
      isActive: true,
      values: [],
    };
    const updated = [...get().attributes, newAttr];
    set({ attributes: updated });
    await get().saveToServer();
    return newAttr;
  },

  updateAttribute: async (id, data) => {
    const updated = get().attributes.map((a) => (a.id === id ? { ...a, ...data } : a));
    set({ attributes: updated });
    await get().saveToServer();
  },

  deleteAttribute: async (id) => {
    const updated = get().attributes.filter((a) => a.id !== id);
    set({ attributes: updated });
    await get().saveToServer();
  },

  toggleAttributeActive: async (id) => {
    const updated = get().attributes.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a));
    set({ attributes: updated });
    await get().saveToServer();
  },

  addAttributeValue: async (attributeId, valData) => {
    const slug = valData.slug || valData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const targetAttr = get().attributes.find((a) => a.id === attributeId);
    const newVal: GlobalAttributeValue = {
      id: `val-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      attributeId,
      name: valData.name.trim(),
      slug: slug,
      colorHex: valData.colorHex,
      imageUrl: valData.imageUrl,
      position: targetAttr ? targetAttr.values.length : 0,
      isActive: true,
    };
    const updated = get().attributes.map((a) => {
      if (a.id === attributeId) {
        return { ...a, values: [...a.values, newVal] };
      }
      return a;
    });
    set({ attributes: updated });
    await get().saveToServer();
    return newVal;
  },

  updateAttributeValue: async (attributeId, valueId, data) => {
    const updated = get().attributes.map((a) => {
      if (a.id === attributeId) {
        const values = a.values.map((v) => (v.id === valueId ? { ...v, ...data } : v));
        return { ...a, values };
      }
      return a;
    });
    set({ attributes: updated });
    await get().saveToServer();
  },

  deleteAttributeValue: async (attributeId, valueId) => {
    const updated = get().attributes.map((a) => {
      if (a.id === attributeId) {
        return { ...a, values: a.values.filter((v) => v.id !== valueId) };
      }
      return a;
    });
    set({ attributes: updated });
    await get().saveToServer();
  },

  reorderAttributeValues: async (attributeId, newValues) => {
    const updated = get().attributes.map((a) => {
      if (a.id === attributeId) {
        return { ...a, values: newValues };
      }
      return a;
    });
    set({ attributes: updated });
    await get().saveToServer();
  },
}));
