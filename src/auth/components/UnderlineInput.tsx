import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface UnderlineInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
}

export const UnderlineInput = forwardRef<HTMLInputElement, UnderlineInputProps>(
  function UnderlineInput(
    { label, error, hint, rightSlot, className, ...inputProps },
    ref,
  ) {
    const reactId = useId();
    const inputId = inputProps.name
      ? `auth-input-${inputProps.name}`
      : reactId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [hintId, errorId, inputProps["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="group relative">
        <label
          htmlFor={inputId}
          className={cn(
            "block text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-150",
            error
              ? "text-silencio-magenta"
              : "text-muted-foreground group-focus-within:text-silencio-lime",
          )}
        >
          {label}
        </label>
        <div className="relative mt-2 flex items-center">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...inputProps}
            className={cn(
              "w-full appearance-none border-0 bg-transparent px-0 py-2 text-[16px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
              "[&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]",
              rightSlot && "pr-10",
              className,
            )}
          />
          {rightSlot && (
            <div className="absolute right-0 flex items-center">
              {rightSlot}
            </div>
          )}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-colors duration-150",
              error ? "bg-silencio-magenta" : "bg-border",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-silencio-lime transition-transform duration-200 ease-out group-focus-within:scale-x-100",
              error && "hidden",
            )}
          />
        </div>
        {hint && !error && (
          <p
            id={hintId}
            className="mt-2 text-[12px] leading-relaxed text-muted-foreground"
          >
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="mt-2 text-[12px] leading-relaxed text-silencio-magenta"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
