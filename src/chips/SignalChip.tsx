import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SignalChipProps {
  color: "lime" | "blue" | "magenta";
  children: ReactNode;
  className?: string;
}

const colorClass: Record<SignalChipProps["color"], string> = {
  lime: "text-silencio-lime",
  blue: "text-silencio-blue",
  magenta: "text-silencio-magenta",
};

/**
 * Text-only barevný chip (status / signal). Bez backgroundu, jen brand color
 * na text. Pozor: v Light mode může být lime obtížně čitelná — zvaž
 * `<NeutralChip>` nebo prefix s tečkou. Sparingly.
 */
export function SignalChip({ color, children, className }: SignalChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold",
        colorClass[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
