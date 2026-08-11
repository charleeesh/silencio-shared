import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import logoWhite from "@/assets/logo/silencio-white.png";
import logoBlack from "@/assets/logo/silencio-black.png";
import { HUB_HOME_URL, isDevMode } from "@/lib/constants";

interface AppShellProps {
  children: ReactNode;
  /**
   * Slovo vykreslené v headeru vedle loga (`[logo] APPNAME`). Brand pattern
   * napříč sub-apps — hub: `"Hub"`, budgeting: `"Budgeting"`, atd.
   */
  appName?: string;
  /**
   * Navigace sub-appky, vykreslená v hlavičce **vedle wordmarku**
   * (`[logo] SET  Projekty  Adresář`). Tam navigace v téhle rodině patří —
   * ne do druhého řádku pod hlavičkou.
   *
   * Předávej rovnou `<NavLink>`y z react-router-dom; AppShell je jen obalí
   * `<nav className="flex items-center gap-1">`, styl si drží sub-app.
   *
   * Přidáno v v0.5.0. Do té doby slot chyběl a cashflow si kvůli němu celý
   * AppShell naforkovalo (`cashflow/src/components/AppShell.tsx`) — což je
   * přesně ten copy-paste drift, kvůli kterému tenhle balíček vznikl.
   */
  nav?: ReactNode;
  /**
   * Kam jít po sign-outu. Default `/login`. Sub-app v produkci může passnout
   * `/` (RequireAuth pak redirectne na hub.silencio.cz).
   */
  signOutRedirect?: string;
  /**
   * Override URL pro "Správa uživatelů" v UserMenu (admin only). Default:
   * - dev hub → `/admin/users`
   * - sub-app / prod → `https://hub.silencio.cz/admin/users`
   */
  adminUrl?: string;
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
  if (isDevMode()) {
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
  nav,
  signOutRedirect = "/login",
  adminUrl,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4 sm:px-12">
        <div className="flex items-center gap-8">
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
          {nav ? <nav className="flex items-center gap-1">{nav}</nav> : null}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu signOutRedirect={signOutRedirect} adminUrl={adminUrl} />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
