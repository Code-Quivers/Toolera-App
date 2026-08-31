"use client";
// GlobalDataSyncProvider has been removed — storefront fetches data directly from the API.
export function GlobalDataSyncProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
