import type { ReactNode } from "react";
import { Logo } from "@/auth/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  /**
   * Slovo za "Silencio" v hero wordmarku. Sub-app passne svůj název:
   * - hub: `"Hub"`
   * - budgeting: `"Budget"`
   * - cashflow: `"Cashflow"`
   * - voicehub: `"VoiceHub"`
   */
  appWordmark: string;
}

export function AuthLayout({ children, appWordmark }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center px-8 py-8 sm:px-16 lg:px-24">
        <Logo />
      </header>

      <main className="flex flex-1 items-start px-8 pb-24 sm:px-16 lg:px-24 lg:items-center">
        <div className="w-full max-w-3xl">
          <h1 className="font-display text-[clamp(48px,7vw,88px)] font-bold leading-[0.95] tracking-[-0.02em] text-foreground">
            Silencio
            <br />
            {appWordmark}
            <span className="text-silencio-lime">.</span>
          </h1>

          <div className="mt-12 w-full max-w-[420px] sm:mt-16">{children}</div>
        </div>
      </main>
    </div>
  );
}
