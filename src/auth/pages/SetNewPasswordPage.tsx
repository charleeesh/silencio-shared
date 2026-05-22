import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/auth/components/AuthLayout";
import { AuthHeading } from "@/auth/components/AuthHeading";
import { PasswordInput } from "@/auth/components/PasswordInput";
import { FormError } from "@/auth/components/FormError";
import { PrimaryButton } from "@/components/PrimaryButton";
import { updatePassword } from "@/auth/api";
import { mapAuthError } from "@/auth/errors";
import { cn } from "@/lib/cn";

const setNewSchema = z
  .object({
    newPassword: z
      .string()
      .min(12, "Heslo musí mít alespoň 12 znaků.")
      .regex(/[a-z]/, "Heslo musí obsahovat malé písmeno.")
      .regex(/[A-Z]/, "Heslo musí obsahovat velké písmeno.")
      .regex(/\d/, "Heslo musí obsahovat číslici.")
      .regex(/[^a-zA-Z0-9]/, "Heslo musí obsahovat symbol."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hesla se neshodují.",
    path: ["confirmPassword"],
  });

type SetNewValues = z.infer<typeof setNewSchema>;

function countMetRequirements(password: string): number {
  if (!password) return 0;
  let met = 0;
  if (password.length >= 12) met++;
  if (/[a-z]/.test(password)) met++;
  if (/[A-Z]/.test(password)) met++;
  if (/\d/.test(password)) met++;
  if (/[^a-zA-Z0-9]/.test(password)) met++;
  return met;
}

interface StrengthMeterProps {
  password: string;
}

function StrengthMeter({ password }: StrengthMeterProps) {
  const met = countMetRequirements(password);
  const total = 5;
  const segmentColor = useMemo(() => {
    if (met === 0) return "bg-border";
    if (met <= 2) return "bg-silencio-magenta";
    if (met <= 4) return "bg-silencio-blue";
    return "bg-silencio-lime";
  }, [met]);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={met}
      aria-label={`Síla hesla: ${met} z ${total} požadavků splněno`}
      className="mt-3 flex gap-1.5"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "h-[3px] flex-1 rounded-[1px] transition-colors duration-200 ease-out",
            i < met ? segmentColor : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

interface SetNewPasswordPageProps {
  appWordmark: string;
}

export function SetNewPasswordPage({ appWordmark }: SetNewPasswordPageProps) {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const search = window.location.search.slice(1);
    const combined = `${hash}&${search}`;
    if (/(?:^|&)error=/.test(combined) || /(?:^|&)error_code=/.test(combined)) {
      navigate("/auth/expired", { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetNewValues>({
    resolver: zodResolver(setNewSchema),
    mode: "onBlur",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updatePassword(values.newPassword);
      navigate("/", { replace: true });
    } catch (err) {
      const failure = mapAuthError(err);
      if (failure.code === "session_missing" || failure.code === "expired_link") {
        navigate("/auth/expired", { replace: true });
        return;
      }
      setSubmitError(failure.message);
    }
  });

  return (
    <AuthLayout appWordmark={appWordmark}>
      <form
        onSubmit={onSubmit}
        onChange={() => {
          if (submitError) setSubmitError(null);
        }}
        className="space-y-10"
        noValidate
      >
        <AuthHeading
          title="Nastavit nové heslo"
          helper="Min. 12 znaků, velká i malá písmena, číslice, symbol."
        />

        <div>
          <PasswordInput
            label="Nové heslo"
            autoComplete="new-password"
            autoFocus
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
          <StrengthMeter password={newPassword} />
        </div>

        <PasswordInput
          label="Potvrdit heslo"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <FormError message={submitError} />

        <div className="pt-2">
          <PrimaryButton loading={isSubmitting} loadingLabel="Ukládání…">
            Uložit a přihlásit
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>
  );
}
