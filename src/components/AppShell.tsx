import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "@/auth/api";
import { ThemeToggle } from "@/theme/ThemeToggle";
import logoWhite from "@/assets/logo/silencio-white.png";
import logoBlack from "@/assets/logo/silencio-black.png";
import { HUB_HOME_URL } from "@/lib/constants";

interface AppShellProps {
  children: ReactNode;
  /**
   * Slovo vykreslené v headeru vedle loga (`[logo] APPNAME`). Brand pattern
   * napříč sub-apps — hub: `"Hub"`, budgeting: `"Budgeting"`, atd.
   */
  appName?: string;
  /**
   * Kam jít po sign-outu. Default `/login`. Sub-app v produkci může passnout
   * `/` (RequireAuth pak redirectne na hub.silencio.cz).
   */
  signOutRedirect?: string;
}

interface HubHomeLinkProps {
  children: ReactNode;
  className: string;
  ariaLabel: string;
}

/**
 * Logo wrapper. V dev modu vede na `/` (sub-app/hub vlastní router root),
 * v produkci na `https://hub.silencio.cz/`. Hub má BASE_URL = `/`, takže
 * dev i prod prakticky vedou na hub home.
 */
function HubHomeLink({ children, className, ariaLabel }: HubHomeLinkProps) {
  if (import.meta.env.DEV) {
    return (
      <Link to="/" aria-label={ariaLabel} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={HUB_HOME_URL} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}

export function AppShell({
  children,
  appName,
  signOutRedirect = "/login",
}: AppShellProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // navigujem stejně pryč
    }
    navigate(signOutRedirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-12">
        <HubHomeLink
          ariaLabel={appName ? `Silencio ${appName} — domů` : "Domů"}
          className="flex items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <img
            src={logoWhite}
            alt="Silencio"
            className="h-5 w-auto select-none light:hidden"
            draggable={false}
          />
          <img
            src={logoBlack}
            alt="Silencio"
            className="hidden h-5 w-auto select-none light:block"
            draggable={false}
          />
          {appName ? (
            <span className="font-wordmark text-[17px] uppercase leading-none tracking-[0.04em] text-foreground">
              {appName}
            </span>
          ) : null}
        </HubHomeLink>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-sm px-2 text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            Odhlásit se
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
