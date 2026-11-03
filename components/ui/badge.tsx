import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "brand";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
    secondary:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    outline:
      "border border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200",
    success:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    danger:
      "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800",
    brand:
      "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold tracking-wider uppercase text-[10px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
