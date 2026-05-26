import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut, User as UserIcon, Users } from "lucide-react";
import { signOut } from "@/auth/api";
import { useCurrentProfile } from "@/auth/useCurrentProfile";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { HUB_HOME_URL, getCurrentSubApp, isDevMode } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface UserMenuProps {
  /**
   * Kam jít po sign-outu. Default `/login`. Sub-app v produkci může passnout
   * `/`, ať RequireAuth redirectne na hub.silencio.cz.
   */
  signOutRedirect?: string;
  /**
   * Override URL pro položku "Správa uživatelů" (admin). Default:
   * - dev hub (BASE_URL='/') → `/admin/users` (lokální router)
   * - produkce / sub-app → `https://hub.silencio.cz/admin/users`
   */
  adminUrl?: string;
}

export function UserMenu({ signOutRedirect = "/login", adminUrl }: UserMenuProps) {
  const navigate = useNavigate();
  const { profile, loading, refresh } = useCurrentProfile();
  const [open, setOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch {
      // navigujem stejně pryč
    }
    navigate(signOutRedirect, { replace: true });
  };

  const resolvedAdminUrl =
    adminUrl ??
    (getCurrentSubApp() === "hub" && isDevMode()
      ? "/admin/users"
      : `${HUB_HOME_URL}admin/users`);

  // Label v buttonu
  const label = loading
    ? "Uživatel"
    : profile?.full_name && profile.full_name !== profile.email
      ? profile.full_name.split(" ")[0]
      : "Uživatel";

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-2 rounded-sm px-2 py-1 text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          )}
        >
          <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            {profile && (
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {profile.full_name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {profile.email}
                </p>
                {profile.role === "admin" && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-silencio-lime/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-silencio-lime">
                    Admin
                  </span>
                )}
              </div>
            )}

            <div className="py-1">
              <MenuItem
                icon={<KeyRound className="h-3.5 w-3.5" />}
                onClick={() => {
                  setOpen(false);
                  setShowPwd(true);
                }}
              >
                Změnit heslo
              </MenuItem>

              {profile?.role === "admin" && (
                <MenuItem
                  icon={<Users className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setOpen(false);
                    if (resolvedAdminUrl.startsWith("http")) {
                      window.location.href = resolvedAdminUrl;
                    } else {
                      navigate(resolvedAdminUrl);
                    }
                  }}
                >
                  Správa uživatelů
                </MenuItem>
              )}

              <div className="my-1 border-t border-border" />

              <MenuItem
                icon={<LogOut className="h-3.5 w-3.5" />}
                onClick={handleSignOut}
              >
                Odhlásit se
              </MenuItem>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        open={showPwd}
        onClose={() => setShowPwd(false)}
        onSuccess={refresh}
      />
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

function MenuItem({ icon, onClick, children }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </button>
  );
}
