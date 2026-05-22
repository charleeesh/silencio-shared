import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/auth/components/AuthLayout";
import { AuthHeading } from "@/auth/components/AuthHeading";
import { UnderlineInput } from "@/auth/components/UnderlineInput";
import { AuthLink } from "@/auth/components/AuthLink";
import { FormError } from "@/auth/components/FormError";
import { PrimaryButton } from "@/components/PrimaryButton";
import { requestPasswordReset } from "@/auth/api";
import { mapAuthError } from "@/auth/errors";

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Zadejte e-mail.")
    .email("Neplatný formát e-mailu."),
});

type ForgotValues = z.infer<typeof forgotSchema>;

interface ForgotPasswordPageProps {
  appWordmark: string;
}

export function ForgotPasswordPage({ appWordmark }: ForgotPasswordPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(mapAuthError(err).message);
    }
  });

  if (submitted) {
    return (
      <AuthLayout appWordmark={appWordmark}>
        <div className="space-y-10">
          <AuthHeading
            title="Zkontrolujte schránku"
            helper="Pokud e-mail existuje, poslali jsme na něj odkaz na reset hesla."
          />
          <AuthLink to="/login" variant="back">
            Zpět na přihlášení
          </AuthLink>
        </div>
      </AuthLayout>
    );
  }

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
          title="Zapomenuté heslo"
          helper="Pošleme vám odkaz na reset hesla."
        />

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

        <FormError message={submitError} />

        <div className="space-y-6 pt-2">
          <PrimaryButton loading={isSubmitting} loadingLabel="Odesílání…">
            Poslat odkaz
          </PrimaryButton>
          <div className="flex justify-start">
            <AuthLink to="/login" variant="back">
              Zpět na přihlášení
            </AuthLink>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
