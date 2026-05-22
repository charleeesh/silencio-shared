import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  /**
   * Pre-formátovaná hodnota (např. `formatCZK(amount)` nebo `count`).
   * Sub-app si formátování volá v call-site.
   */
  value: ReactNode;
  subLabel?: string;
  accent?: "lime" | "blue" | "magenta";
  /**
   * Když je `true`, karta dostane lime ring jako visual indicator (aktivní filter).
   */
  active?: boolean;
  /**
   * Když je předán, karta se renderuje jako `<button>` s focus / hover styly.
   */
  onClick?: () => void;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  /**
   * Sub-app může vložit cokoliv dovnitř karty pod value (např. currency badge,
   * mini chart, status řádek).
   */
  children?: ReactNode;
  className?: string;
}

const accentBorder: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  lime: "border-l-silencio-lime",
  blue: "border-l-silencio-blue",
  magenta: "border-l-silencio-magenta",
};

export function MetricCard({
  label,
  value,
  subLabel,
  accent,
  active = false,
  onClick,
  icon,
  rightSlot,
  children,
  className,
}: MetricCardProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full text-left rounded-md border border-border bg-card p-5 transition-colors",
        accent && `border-l-2 ${accentBorder[accent]}`,
        onClick &&
          "cursor-pointer hover:bg-card/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active && "ring-1 ring-silencio-lime/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {(icon || rightSlot) && (
          <span className="text-muted-foreground">{rightSlot ?? icon}</span>
        )}
      </div>
      <p className="mt-3 font-display text-[26px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {subLabel && (
        <p className="mt-2 text-[12px] text-muted-foreground">{subLabel}</p>
      )}
      {children}
    </Component>
  );
}
