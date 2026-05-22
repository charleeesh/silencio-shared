import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /**
   * Pravý slot (typicky `<PrimaryButton className="!w-auto px-5">` nebo
   * sekundární akce). Maximálně jedna primární akce per page header.
   */
  rightSlot?: ReactNode;
}

export function PageHeader({ title, description, rightSlot }: PageHeaderProps) {
  return (
    <header className="mb-10 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>
        )}
      </div>
      {rightSlot && (
        <div className="flex flex-col items-end gap-1">{rightSlot}</div>
      )}
    </header>
  );
}
