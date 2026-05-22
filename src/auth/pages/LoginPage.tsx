import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/auth/components/AuthLayout";
import { UnderlineInput } from "@/auth/components/UnderlineInput";
import { PasswordInput } from "@/auth/components/PasswordInput";
import { AuthLink } from "@/auth/components/AuthLink";
import { FormError } from "@/auth/components/FormError";
import { PrimaryButton } from "@/components/PrimaryButton";
import { signInWithPassword } from "@/auth/api";
import { mapAuthError } from "@/auth/errors";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Zadejte e-mail.")
    .email("Neplatný formát e-mailu."),
  password: z.string().min(1, "Zadejte heslo."),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginPageProps {
  appWordmark: string;
}

export function LoginPage({ appWordmark }: LoginPageProps) {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signInWithPassword(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      setSubmitError(mapAuthError(err).message);
    }
  });

  return (
    <AuthLayout appWordmark={appWordmark}>
      <form
        onSubmit={onSubmit}
        onChange={() => {
          if (submitError) setSubmitError(null);
        }}
        className="space-y-8"
        noValidate
      >
        <UnderlineInput
          label="E-mail"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          {...register("email")}
          error={errors.email?.message}
        />

        <PasswordInput
          label="Heslo"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <FormError message={submitError} />

        <div className="space-y-6 pt-2">
          <PrimaryButton loading={isSubmitting} loadingLabel="Přihlašování…">
            Přihlásit
          </PrimaryButton>
          <div className="flex justify-start">
            <AuthLink to="/auth/forgot">Zapomenuté heslo</AuthLink>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
