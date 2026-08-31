"use client";

import React, { Suspense } from "react";
import { AuthComponent } from "@/app/signup/page";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <AuthComponent initialMode="SIGNIN" />
    </Suspense>
  );
}
