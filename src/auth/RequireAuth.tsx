import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSession } from "@/auth/useSession";

interface RequireAuthProps {
  children: ReactNode;
  /**
   * Cesta na login, kam se redirectne, když není session.
   * Default `/login` — sub-app prod variant může passnout třeba `/`,
   * pokud má mít vlastní guard logiku.
   */
  loginPath?: string;
}

export function RequireAuth({ children, loginPath = "/login" }: RequireAuthProps) {
  const location = useLocation();
  const { session, loading } = useSession();

  if (loading) {
    return <SessionSplash />;
  }

  if (!session) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
}

interface RedirectIfAuthedProps {
  children: ReactNode;
  /**
   * Kam jít, pokud je uživatel přihlášený. Default `/` (rozcestník).
   */
  homePath?: string;
}

export function RedirectIfAuthed({ children, homePath = "/" }: RedirectIfAuthedProps) {
  const { session, loading } = useSession();

  if (loading) {
    return <SessionSplash />;
  }

  if (session) {
    return <Navigate to={homePath} replace />;
  }

  return <>{children}</>;
}

// Historický alias.
export const AuthRoute = RedirectIfAuthed;

function SessionSplash() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      aria-busy="true"
      aria-label="Načítání"
    >
      <Loader2
        className="h-5 w-5 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
