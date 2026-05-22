import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface NeutralChipProps {
  children: ReactNode;
  className?: string;
}

/**
 * Defaultní chip pro metadata (jazyky, region, tags). Čitelný v Light i Dark.
 */
export function NeutralChip({ children, className }: NeutralChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
