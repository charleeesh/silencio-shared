import logoWhite from "@/assets/logo/silencio-white.png";
import { HUB_HOME_URL } from "@/lib/constants";

interface LogoProps {
  /**
   * Aria label pro odkaz. Sub-app může customizovat (např. "Silencio Budget — úvod").
   */
  homeAriaLabel?: string;
}

/**
 * Login screen logo. V dev modu vede na `import.meta.env.BASE_URL` (sub-app
 * root, např. `/budget/`), v produkci na hub. Hub appka má BASE_URL = `"/"`
 * → dev i prod vedou na hub home.
 */
export function Logo({ homeAriaLabel }: LogoProps = {}) {
  const baseUrl =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.BASE_URL as string | undefined) ?? "/"
      : "/";
  const href = import.meta.env.DEV ? baseUrl : HUB_HOME_URL;
  const label =
    homeAriaLabel ??
    (import.meta.env.DEV
      ? "Silencio — úvod"
      : "Silencio Hub — zpět na rozcestník");

  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <img
        src={logoWhite}
        alt="Silencio"
        className="h-5 w-auto select-none"
        draggable={false}
      />
    </a>
  );
}
