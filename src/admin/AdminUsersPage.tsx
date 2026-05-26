import { useEffect, useState, type FormEvent } from "react";
import {
  Copy,
  KeyRound,
  Mail,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UnderlineInput } from "@/auth/components/UnderlineInput";
import { FormError } from "@/auth/components/FormError";
import { useCurrentProfile, type SubAppKey, type UserRole } from "@/auth/useCurrentProfile";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  type AdminUserRow,
} from "@/admin/adminApi";
import { cn } from "@/lib/cn";

const SUB_APP_OPTIONS: { key: SubAppKey; label: string }[] = [
  { key: "budgeting", label: "Budgeting" },
  { key: "cashflow", label: "Cashflow" },
  { key: "voicehub", label: "VoiceHub" },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "producer", label: "Standardní" },
  { value: "admin", label: "Admin" },
];

interface AdminUsersPageProps {
  /**
   * `appName` v AppShell. Hub passne `"Hub"`. Doporučuju nechat default,
   * aby admin sekce v hubu byla vizuálně součástí Hubu.
   */
  appName?: string;
}

/**
 * Plnoformátová admin page. Použít:
 *
 *   <Route path="/admin/users" element={
 *     <RequireAuth><AdminUsersPage /></RequireAuth>
 *   } />
 *
 * Sama si guarduje admin role (non-admin uvidí "Forbidden" message).
 */
export function AdminUsersPage({ appName = "Hub" }: AdminUsersPageProps) {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listAdminUsers();
      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileLoading) return;
    if (profile?.role !== "admin") {
      setLoading(false);
      return;
    }
    void refresh();
  }, [profile?.role, profileLoading]);

  const showFlash = (kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 4000);
  };

  // Guarding —————————————————————————————————————————————————————————————
  if (profileLoading) {
    return (
      <AppShell appName={appName}>
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
          <p className="text-muted-foreground">Načítám…</p>
        </div>
      </AppShell>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <AppShell appName={appName}>
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
          <PageHeader
            title="Přístup zamítnut"
            description="Tato sekce je dostupná pouze administrátorům."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell appName={appName}>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <PageHeader
          title="Správa uživatelů"
          description="Přidávejte, upravujte a resetujte přístupy k sub-aplikacím."
          rightSlot={
            <PrimaryButton
              type="button"
              className="!w-auto px-5"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
              Přidat uživatele
            </PrimaryButton>
          }
        />

        {flash && (
          <div
            className={cn(
              "mb-6 rounded-lg border px-4 py-3 text-[13px]",
              flash.kind === "ok"
                ? "border-silencio-lime/40 bg-silencio-lime/10 text-foreground"
                : "border-silencio-magenta/40 bg-silencio-magenta/10 text-silencio-magenta",
            )}
            role="status"
          >
            {flash.text}
          </div>
        )}

        {error && (
          <div className="mb-6">
            <FormError message={error} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Načítám uživatele…</span>
          </div>
        ) : (
          <UsersTable
            users={users}
            currentUserId={profile.id}
            onEdit={(u) => setEditTarget(u)}
            onResetPassword={(u) => setResetTarget(u)}
            onDelete={(u) => setDeleteTarget(u)}
          />
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await refresh();
            showFlash("ok", "Uživatel vytvořen. Předejte mu dočasné heslo.");
          }}
          onError={(msg) => showFlash("err", msg)}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          isSelf={editTarget.id === profile.id}
          onClose={() => setEditTarget(null)}
          onSaved={async () => {
            setEditTarget(null);
            await refresh();
            showFlash("ok", "Změny uloženy.");
          }}
          onError={(msg) => showFlash("err", msg)}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onDone={async (msg) => {
            setResetTarget(null);
            await refresh();
            showFlash("ok", msg);
          }}
          onError={(msg) => showFlash("err", msg)}
        />
      )}

      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={async () => {
            setDeleteTarget(null);
            await refresh();
            showFlash("ok", "Uživatel smazán.");
          }}
          onError={(msg) => showFlash("err", msg)}
        />
      )}
    </AppShell>
  );
}

// ============================================================================
// Users table
// ============================================================================

interface UsersTableProps {
  users: AdminUserRow[];
  currentUserId: string;
  onEdit: (u: AdminUserRow) => void;
  onResetPassword: (u: AdminUserRow) => void;
  onDelete: (u: AdminUserRow) => void;
}

function UsersTable({
  users,
  currentUserId,
  onEdit,
  onResetPassword,
  onDelete,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="text-muted-foreground">Žádní uživatelé.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Jméno
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Přístup
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Akce
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{u.full_name}</span>
                    {isSelf && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Vy
                      </span>
                    )}
                    {u.must_change_password && (
                      <span className="rounded-full bg-silencio-blue/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-silencio-blue">
                        Musí změnit heslo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      u.role === "admin"
                        ? "bg-silencio-lime/15 text-silencio-lime"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {u.role === "admin" ? "Admin" : "Standardní"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.sub_apps.length === 0 ? (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    ) : (
                      u.sub_apps.map((key) => (
                        <span
                          key={key}
                          className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {SUB_APP_OPTIONS.find((o) => o.key === key)?.label ?? key}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn
                      title="Upravit"
                      onClick={() => onEdit(u)}
                      icon={<Pencil className="h-3.5 w-3.5" />}
                    />
                    <IconBtn
                      title="Resetovat heslo"
                      onClick={() => onResetPassword(u)}
                      icon={<KeyRound className="h-3.5 w-3.5" />}
                    />
                    <IconBtn
                      title={isSelf ? "Nelze smazat sám sebe" : "Smazat"}
                      onClick={() => onDelete(u)}
                      disabled={isSelf}
                      danger
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface IconBtnProps {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

function IconBtn({ title, onClick, icon, disabled, danger }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime",
        disabled
          ? "cursor-not-allowed text-muted-foreground/40"
          : danger
            ? "text-muted-foreground hover:bg-silencio-magenta/10 hover:text-silencio-magenta"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// Modal primitive
// ============================================================================

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}

function Modal({ title, onClose, children, size = "md" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-border bg-card p-8 shadow-2xl",
          size === "sm" ? "max-w-sm" : "max-w-lg",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
          aria-label="Zavřít"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// CreateUserModal
// ============================================================================

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
  onError: (msg: string) => void;
}

function CreateUserModal({ onClose, onCreated, onError }: CreateUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generateInitialPassword());
  const [role, setRole] = useState<UserRole>("producer");
  const [subApps, setSubApps] = useState<SubAppKey[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleApp = (key: SubAppKey) => {
    setSubApps((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await createAdminUser({
        email: email.trim(),
        full_name: fullName.trim(),
        password,
        sub_apps: subApps,
        role,
      });
      await onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Vytvoření selhalo.";
      setLocalError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Přidat uživatele" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <UnderlineInput
          name="full_name"
          label="Jméno"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={submitting}
          required
          autoFocus
        />
        <UnderlineInput
          type="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Počáteční heslo
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-[14px] text-foreground focus:border-silencio-lime focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={submitting}
              className="rounded-md border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Zkopírováno
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Kopírovat
                </span>
              )}
            </button>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Uživatel si heslo po prvním přihlášení musí změnit.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Role
          </p>
          <div className="mt-2 flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                disabled={submitting}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  role === opt.value
                    ? "border-silencio-lime bg-silencio-lime/15 text-silencio-lime"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Přístup k sub-aplikacím
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUB_APP_OPTIONS.map((opt) => {
              const active = subApps.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleApp(opt.key)}
                  disabled={submitting}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "border-silencio-lime bg-silencio-lime/15 text-silencio-lime"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <FormError message={localError} />

        <PrimaryButton
          type="submit"
          loading={submitting}
          loadingLabel="Vytvářím…"
          className="!w-full"
        >
          Vytvořit uživatele
        </PrimaryButton>
      </form>
    </Modal>
  );
}

function generateInitialPassword(): string {
  // Klientská strana — jen UX prefill. Edge function dovolí libovolné heslo
  // ≥ 8 znaků. Tohle je čistě convenience, admin může přepsat.
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const sym = "!@#$%&*";
  const all = upper + lower + digits + sym;
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  const chars: string[] = [
    upper[arr[0] % upper.length],
    lower[arr[1] % lower.length],
    digits[arr[2] % digits.length],
    sym[arr[3] % sym.length],
  ];
  for (let i = 4; i < arr.length; i++) chars.push(all[arr[i] % all.length]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// ============================================================================
// EditUserModal
// ============================================================================

interface EditUserModalProps {
  user: AdminUserRow;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onError: (msg: string) => void;
}

function EditUserModal({ user, isSelf, onClose, onSaved, onError }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [subApps, setSubApps] = useState<SubAppKey[]>(user.sub_apps);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleApp = (key: SubAppKey) => {
    setSubApps((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await updateAdminUser({
        user_id: user.id,
        full_name: fullName.trim(),
        role,
        sub_apps: subApps,
      });
      await onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Uložení selhalo.";
      setLocalError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Upravit uživatele" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <UnderlineInput
          name="full_name"
          label="Jméno"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={submitting}
          required
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Email
          </p>
          <p className="mt-2 text-[14px] text-foreground">{user.email}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Email lze změnit jen v Supabase Auth dashboardu.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Role
          </p>
          <div className="mt-2 flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                disabled={submitting || (isSelf && opt.value !== "admin")}
                title={
                  isSelf && opt.value !== "admin"
                    ? "Sám sebe nemůžete degradovat z admin"
                    : undefined
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  role === opt.value
                    ? "border-silencio-lime bg-silencio-lime/15 text-silencio-lime"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                  isSelf && opt.value !== "admin" && "cursor-not-allowed opacity-50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Přístup k sub-aplikacím
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUB_APP_OPTIONS.map((opt) => {
              const active = subApps.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleApp(opt.key)}
                  disabled={submitting}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "border-silencio-lime bg-silencio-lime/15 text-silencio-lime"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <FormError message={localError} />

        <PrimaryButton
          type="submit"
          loading={submitting}
          loadingLabel="Ukládám…"
          className="!w-full"
        >
          Uložit změny
        </PrimaryButton>
      </form>
    </Modal>
  );
}

// ============================================================================
// ResetPasswordModal
// ============================================================================

interface ResetPasswordModalProps {
  user: AdminUserRow;
  onClose: () => void;
  onDone: (msg: string) => Promise<void> | void;
  onError: (msg: string) => void;
}

function ResetPasswordModal({ user, onClose, onDone, onError }: ResetPasswordModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async (mode: "temp" | "email") => {
    setSubmitting(true);
    try {
      const result = await resetAdminUserPassword(user.id, mode);
      if (mode === "temp" && result.temp_password) {
        setTempPassword(result.temp_password);
      } else {
        await onDone(`Reset link odeslán na ${user.email}.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset selhal.";
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal title="Resetovat heslo" onClose={onClose}>
      {tempPassword ? (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-foreground">
            Nové dočasné heslo pro <strong>{user.full_name}</strong>:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-[14px] text-foreground">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  OK
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Kopírovat
                </span>
              )}
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Předejte heslo uživateli osobně. Po prvním přihlášení si ho bude
            muset změnit.
          </p>
          <PrimaryButton type="button" onClick={onClose} className="!w-full">
            Hotovo
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-foreground">
            Vyberte způsob resetu hesla pro <strong>{user.full_name}</strong>:
          </p>
          <button
            type="button"
            onClick={() => handleReset("temp")}
            disabled={submitting}
            className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-silencio-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
          >
            <KeyRound className="mt-0.5 h-4 w-4 text-silencio-lime" />
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Vygenerovat dočasné heslo
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Zobrazí se vám nové heslo, které předáte uživateli osobně.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleReset("email")}
            disabled={submitting}
            className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-silencio-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
          >
            <Mail className="mt-0.5 h-4 w-4 text-silencio-blue" />
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Poslat reset link emailem
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Uživatel obdrží email s odkazem na nastavení nového hesla.
              </p>
            </div>
          </button>
          {submitting && (
            <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Probíhá…
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

// ============================================================================
// DeleteUserModal
// ============================================================================

interface DeleteUserModalProps {
  user: AdminUserRow;
  onClose: () => void;
  onDeleted: () => Promise<void> | void;
  onError: (msg: string) => void;
}

function DeleteUserModal({ user, onClose, onDeleted, onError }: DeleteUserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canDelete = confirmText.trim().toLowerCase() === user.email.toLowerCase();

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteAdminUser(user.id);
      await onDeleted();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Smazání selhalo.";
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Smazat uživatele" onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-foreground">
          Opravdu chcete smazat uživatele <strong>{user.full_name}</strong>?
        </p>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Smazání je nevratné. Pro potvrzení napište email uživatele:
        </p>
        <UnderlineInput
          name="confirm-email"
          label={user.email}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={submitting}
        />
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || submitting}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-magenta",
              canDelete && !submitting
                ? "bg-silencio-magenta text-white hover:brightness-110"
                : "bg-muted text-muted-foreground",
            )}
          >
            {submitting ? "Mažu…" : "Smazat"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
