import type { ReactNode } from "react";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { useCurrentProfile } from "@/auth/useCurrentProfile";

interface RequirePasswordReadyProps {
  children: ReactNode;
}

/**
 * Globální gate: pokud má current user `must_change_password=true` (admin ho
 * vytvořil nebo resetoval), zobrazí forced ChangePasswordModal přes celou
 * sub-app. Children se renderují vespod, ale forced modal zabraňuje
 * interakci, dokud user heslo nezmění.
 *
 * Použití (typicky kolem všech protected routes):
 *
 *   <RequireAuth>
 *     <RequirePasswordReady>
 *       <MyApp />
 *     </RequirePasswordReady>
 *   </RequireAuth>
 *
 * Po úspěšné změně hesla modal volá `refresh()`, profile se aktualizuje a
 * gate se sám otevře.
 */
export function RequirePasswordReady({ children }: RequirePasswordReadyProps) {
  const { profile, refresh } = useCurrentProfile();
  const forced = profile?.must_change_password === true;

  return (
    <>
      {children}
      <ChangePasswordModal
        open={forced}
        forced
        onClose={() => {}}
        onSuccess={refresh}
      />
    </>
  );
}
