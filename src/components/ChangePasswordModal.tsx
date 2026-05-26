import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updatePassword } from "@/auth/api";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/auth/useSession";
import { UnderlineInput } from "@/auth/components/UnderlineInput";
import { FormError } from "@/auth/components/FormError";
import { PrimaryButton } from "@/components/PrimaryButton";
import { cn } from "@/lib/cn";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Když `true`, modal nelze zavřít křížkem ani backdropem — používá se pro
   * `must_change_password` forced flow. User musí heslo změnit, jinak ho
   * nepustí dál.
   */
  forced?: boolean;
  /**
   * Callback po úspěšné změně hesla. Sub-app může v něm refetchnout profile,
   * skrýt forced gate atd. Defaultně se modal jen zavře.
   */
  onSuccess?: () => void | Promise<void>;
}

export function ChangePasswordModal({
  open,
  onClose,
  forced = false,
  onSuccess,
}: ChangePasswordModalProps) {
  const { session } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirm("");
      setError(null);
      setSuccess(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků.");
      return;
    }
    if (password !== confirm) {
      setError("Hesla se neshodují.");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      // Pokud user měl must_change_password=true, shodím flag
      if (session?.user.id) {
        await supabase
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", session.user.id);
      }
      setSuccess(true);
      if (onSuccess) await onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Něco se pokazilo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = () => {
    if (forced || submitting) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!forced && (
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-silencio-lime"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <h2
          id="change-password-title"
          className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em] text-foreground"
        >
          {forced ? "Nastavte si nové heslo" : "Změna hesla"}
        </h2>
        {forced && (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Před vstupem do aplikace si nastavte vlastní heslo. Po uložení
            budete pokračovat.
          </p>
        )}

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="text-[14px] leading-relaxed text-foreground">
              Heslo bylo úspěšně změněno.
            </p>
            {!forced && (
              <PrimaryButton onClick={onClose} className="!w-full">
                Zavřít
              </PrimaryButton>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <UnderlineInput
              type="password"
              name="new-password"
              label="Nové heslo"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              hint="Minimálně 8 znaků."
              required
            />
            <UnderlineInput
              type="password"
              name="confirm-password"
              label="Potvrzení hesla"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              required
            />
            <FormError message={error} />
            <PrimaryButton
              type="submit"
              loading={submitting}
              loadingLabel="Ukládám…"
              className={cn("!w-full")}
            >
              Uložit nové heslo
            </PrimaryButton>
          </form>
        )}
      </div>
    </div>
  );
}
