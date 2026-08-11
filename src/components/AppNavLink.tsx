import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

interface AppNavLinkProps {
  to: string;
  /** `true` u rootu (`/`), jinak by zůstal aktivní na všech podstránkách. */
  end?: boolean;
  children: ReactNode;
}

/**
 * Položka navigace v hlavičce AppShellu. Existuje proto, aby navigace
 * vypadala ve všech sub-appkách stejně — jinak si ji každá naštyluje
 * po svém a rozjede se to.
 *
 * Použití:
 *
 *   <AppShell
 *     appName="Set"
 *     nav={
 *       <>
 *         <AppNavLink to="/" end>Projekty</AppNavLink>
 *         <AppNavLink to="/adresar">Adresář</AppNavLink>
 *       </>
 *     }
 *   >
 *
 * Aktivní položka se odlišuje jen tučností a plnou barvou textu, žádné
 * podtržení ani pozadí — drží to hlavičku klidnou.
 */
export function AppNavLink({ to, end = false, children }: AppNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "rounded-sm px-3 py-1.5 text-[13px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {children}
    </NavLink>
  );
}
