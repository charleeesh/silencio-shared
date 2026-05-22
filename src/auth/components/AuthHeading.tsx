import type { ReactNode } from "react";

interface AuthHeadingProps {
  title: string;
  helper?: ReactNode;
}

export function AuthHeading({ title, helper }: AuthHeadingProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-[24px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      {helper && (
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          {helper}
        </p>
      )}
    </div>
  );
}
