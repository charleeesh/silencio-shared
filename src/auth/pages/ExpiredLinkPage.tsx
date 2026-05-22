import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/auth/components/AuthLayout";
import { AuthHeading } from "@/auth/components/AuthHeading";
import { AuthLink } from "@/auth/components/AuthLink";
import { PrimaryButton } from "@/components/PrimaryButton";

interface ExpiredLinkPageProps {
  appWordmark: string;
}

export function ExpiredLinkPage({ appWordmark }: ExpiredLinkPageProps) {
  const navigate = useNavigate();

  return (
    <AuthLayout appWordmark={appWordmark}>
      <div className="space-y-10">
        <AuthHeading
          title="Tento odkaz už neplatí"
          helper="Reset link expiroval nebo byl použit. Můžeme vám poslat nový."
        />

        <div className="space-y-6">
          <PrimaryButton
            type="button"
            onClick={() => navigate("/auth/forgot")}
          >
            Požádat o nový odkaz
          </PrimaryButton>
          <div className="flex justify-start">
            <AuthLink to="/login" variant="back">
              Zpět na přihlášení
            </AuthLink>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
