import { StateStorage } from "zustand/middleware";

const DB_NAME = "RaifasMartDB";
const STORE_NAME = "store_cache";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * High-Capacity IndexedDB storage adapter for Zustand
 * Eliminates the 5MB browser localStorage QuotaExceededError
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    // Fast synchronous path: check localStorage first for 0ms instant hydration
    try {
      const cached = localStorage.getItem(name);
      if (cached) {
        // Asynchronously sync from IndexedDB in background if needed
        return cached;
      }
    } catch {}

    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(name);
        req.onsuccess = () => {
          if (req.result !== undefined) {
            try {
              localStorage.setItem(name, req.result);
            } catch {}
            resolve(req.result);
          } else {
            try {
              resolve(localStorage.getItem(name));
            } catch {
              resolve(null);
            }
          }
        };
        req.onerror = () => {
          try {
            resolve(localStorage.getItem(name));
          } catch {
            resolve(null);
          }
        };
      });
    } catch {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return;

    // Fast save to localStorage for instant hydration on next page load
    try {
      localStorage.setItem(name, value);
    } catch {}

    try {
      const db = await getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, name);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn("IndexedDB write error:", err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === "undefined") return;
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(name);
    } catch {}
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};
