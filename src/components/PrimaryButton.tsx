import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

/**
 * Hlavní CTA tlačítko (lime, bold, šipka). Použití:
 * - Auth flow (Přihlásit, Poslat odkaz, Uložit heslo) — full width.
 * - Page header rightSlot — předej `className="!w-auto px-5"` pro inline.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    { loading = false, loadingLabel, children, className, disabled, ...rest },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={rest.type ?? "submit"}
        aria-busy={loading || undefined}
        disabled={isDisabled}
        {...rest}
        className={cn(
          "group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[4px] bg-silencio-lime px-6 text-[15px] font-semibold tracking-[-0.005em] text-primary-foreground transition-all duration-200 ease-out",
          "hover:brightness-105 active:brightness-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{loadingLabel ?? "Načítání…"}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            <span
              aria-hidden="true"
              className="translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            >
              →
            </span>
          </>
        )}
      </button>
    );
  },
);
