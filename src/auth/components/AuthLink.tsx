import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthLinkProps {
  to: string;
  children: ReactNode;
  variant?: "forward" | "back";
  className?: string;
}

export function AuthLink({
  to,
  children,
  variant = "forward",
  className,
}: AuthLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-sm text-[14px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      {variant === "back" && (
        <span
          aria-hidden="true"
          className="translate-x-0 transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
        >
          ←
        </span>
      )}
      <span>{children}</span>
      {variant === "forward" && (
        <span
          aria-hidden="true"
          className="translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        >
          →
        </span>
      )}
    </Link>
  );
}
