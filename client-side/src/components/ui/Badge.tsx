import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "trending" | "hot" | "new" | "sale" | "outline" | "stock";
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    trending: "bg-teal-50 text-teal-800 border-teal-200/60 font-semibold",
    hot: "bg-rose-50 text-rose-700 border-rose-200/60 font-semibold",
    new: "bg-indigo-50 text-indigo-700 border-indigo-200/60 font-semibold",
    sale: "bg-amber-50 text-amber-800 border-amber-200/60 font-semibold",
    outline: "bg-transparent text-slate-700 border-slate-300",
    stock: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs tracking-wide transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
