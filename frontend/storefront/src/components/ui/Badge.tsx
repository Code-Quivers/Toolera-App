import { cn } from "@/lib/utils";

const VARIANTS: Record<string, string> = {
  default:  "bg-gray-100 text-gray-700",
  trending: "bg-orange-100 text-orange-700",
  hot:      "bg-rose-100 text-rose-700",
  new:      "bg-emerald-100 text-emerald-700",
  sale:     "bg-purple-100 text-purple-700",
};

interface BadgeProps {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        VARIANTS[variant] ?? VARIANTS.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
