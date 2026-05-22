import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 text-[13px] leading-relaxed text-silencio-magenta"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}
