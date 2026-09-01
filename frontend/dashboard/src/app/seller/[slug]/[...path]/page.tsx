"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// Redirect /seller/:slug/:path → /admin/:path so the existing admin pages handle it.
// The admin layout then immediately redirects back to /seller/:slug/:path once the slug is known.
export default function SellerCatchAll() {
  const params = useParams();
  const router = useRouter();
  const path = Array.isArray(params.path) ? params.path.join("/") : (params.path ?? "");

  useEffect(() => {
    router.replace(`/admin/${path}`);
  }, [path, router]);

  return null;
}
