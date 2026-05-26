import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentProfile, type SubAppKey } from "@/auth/useCurrentProfile";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { HUB_HOME_URL } from "@/lib/constants";

interface RequireSubAppAccessProps {
  /**
   * Klíč sub-appky, do které tento route patří (`'budgeting' | 'cashflow' |
   * 'voicehub'`). Komponent ověří, že `profile.sub_apps` ho obsahuje. Admin
   * (role='admin') projde vždy.
   */
  subApp: SubAppKey;
  /**
   * `appName` v AppShell pro "Přístup zamítnut" obrazovku. Defaultně se
   * odvodí z `subApp` klíče: budgeting → "Budgeting", cashflow → "Cashflow",
   * voicehub → "VoiceHub".
   */
  appName?: string;
  children: ReactNode;
}

const DEFAULT_APP_NAMES: Record<SubAppKey, string> = {
  budgeting: "Budgeting",
  cashflow: "Cashflow",
  voicehub: "VoiceHub",
};

/**
 * Gate pro sub-app routes: ověří, že current user má `subApp` v
 * `profile.sub_apps` arrayi. Pokud ne, zobrazí "Přístup zamítnut" page s
 * odkazem zpět na hub.
 *
 * Admin (role='admin') projde vždy bez ohledu na sub_apps.
 *
 * Použití v sub-app:
 *
 *   <RequireAuth>
 *     <RequirePasswordReady>
 *       <RequireSubAppAccess subApp="budgeting">
 *         <BudgetingApp />
 *       </RequireSubAppAccess>
 *     </RequirePasswordReady>
 *   </RequireAuth>
 */
export function RequireSubAppAccess({
  subApp,
  appName,
  children,
}: RequireSubAppAccessProps) {
  const { profile, loading } = useCurrentProfile();
  const resolvedName = appName ?? DEFAULT_APP_NAMES[subApp];

  // Aby user nezahlédl obsah, dokud profile load doběhne (default state =
  // "loading", ne "no access").
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!loading) setSettled(true);
  }, [loading]);

  if (!settled || loading) {
    return (
      <AppShell appName={resolvedName}>
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Ověřuji přístup…</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    // Bez profile nedáváme přístup. RequireAuth by ho měl už chytit, ale
    // pojistka pro race condition.
    return (
      <AppShell appName={resolvedName}>
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
          <PageHeader title="Přístup zamítnut" />
        </div>
      </AppShell>
    );
  }

  const hasAccess =
    profile.role === "admin" || profile.sub_apps.includes(subApp);

  if (!hasAccess) {
    return (
      <AppShell appName={resolvedName}>
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
          <PageHeader
            title="Přístup zamítnut"
            description={`Nemáte přiřazený přístup k aplikaci ${resolvedName}. Pokud si myslíte, že by tomu tak mělo být, obraťte se na administrátora.`}
          />
          <a
            href={HUB_HOME_URL}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
          >
            ← Zpět na Hub
          </a>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
