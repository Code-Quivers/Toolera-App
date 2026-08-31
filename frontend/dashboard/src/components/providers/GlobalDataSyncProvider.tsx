"use client";
// GlobalDataSyncProvider has been removed — all data is fetched directly from the API
// by each page/component via hooks. This component is kept as a no-op to avoid import errors.
export function GlobalDataSyncProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
