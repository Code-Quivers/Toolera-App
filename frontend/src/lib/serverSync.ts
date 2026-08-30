/**
 * Client-side Server Synchronization Service
 * Automatically pushes updates to the server DB and pulls fresh data on initial load
 */

export type SyncDataType =
  | "products"
  | "categories"
  | "cms"
  | "header"
  | "footer"
  | "menus"
  | "reviews"
  | "customers"
  | "orders"
  | "coupons"
  | "attributes"
  | "adminAuth"
  | "adminProfile"
  | "adminNotifications"
  | "shippingSettings";

export async function syncToServer(type: SyncDataType, data: any) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
  } catch (err) {
    console.warn("Failed to sync with server DB:", err);
  }
}

export async function fetchServerData() {
  try {
    const res = await fetch("/api/sync", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn("Failed to fetch server DB:", err);
  }
  return null;
}
