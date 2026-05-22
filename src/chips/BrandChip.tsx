import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BrandChipProps {
  color: "lime" | "blue" | "magenta";
  children: ReactNode;
  className?: string;
}

const tintClass: Record<BrandChipProps["color"], string> = {
  lime: "bg-silencio-lime/15 text-silencio-lime",
  blue: "bg-silencio-blue/15 text-silencio-blue",
  magenta: "bg-silencio-magenta/15 text-silencio-magenta",
};

/**
 * Brand-tinted chip pro emphasis (aktivní filter, primary akce). Background
 * `/15` + brand text. Před nasazením do Light modu ověř čitelnost — lime
 * text na světlém pozadí může blendnout.
 */
export function BrandChip({ color, children, className }: BrandChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tintClass[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
