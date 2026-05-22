import type { AuthError } from "@supabase/supabase-js";

export type AuthFailureCode =
  | "invalid_creds"
  | "rate_limit"
  | "network"
  | "weak_password"
  | "expired_link"
  | "session_missing"
  | "unknown";

export interface AuthFailure {
  code: AuthFailureCode;
  message: string;
}

const COPY: Record<AuthFailureCode, string> = {
  invalid_creds: "Přihlášení se nepodařilo. Zkontrolujte e-mail a heslo.",
  rate_limit: "Příliš mnoho pokusů. Zkuste to znovu za chvíli.",
  network: "Připojení selhalo. Zkontrolujte síť a zkuste to znovu.",
  weak_password:
    "Heslo nesplňuje požadavky. Zkontrolujte délku a požadované znaky.",
  expired_link: "Tento odkaz už neplatí. Požádejte o nový.",
  session_missing:
    "Relace pro reset hesla již není aktivní. Požádejte o nový odkaz.",
  unknown: "Něco se pokazilo. Zkuste to prosím znovu.",
};

function isAuthError(err: unknown): err is AuthError {
  return (
    err !== null &&
    typeof err === "object" &&
    "status" in err &&
    "message" in err
  );
}

export function mapAuthError(err: unknown): AuthFailure {
  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return { code: "network", message: COPY.network };
  }

  if (isAuthError(err)) {
    if (err.status === 429) {
      return { code: "rate_limit", message: COPY.rate_limit };
    }

    const code =
      "code" in err && typeof err.code === "string" ? err.code : undefined;
    const lowerMessage = err.message?.toLowerCase() ?? "";

    if (
      code === "weak_password" ||
      lowerMessage.includes("password should be")
    ) {
      return { code: "weak_password", message: COPY.weak_password };
    }
    if (
      code === "otp_expired" ||
      code === "expired_token" ||
      lowerMessage.includes("expired") ||
      lowerMessage.includes("invalid token")
    ) {
      return { code: "expired_link", message: COPY.expired_link };
    }
    if (
      code === "session_not_found" ||
      lowerMessage.includes("auth session missing") ||
      lowerMessage.includes("session not found")
    ) {
      return { code: "session_missing", message: COPY.session_missing };
    }

    if (err.status === 400 || err.status === 401) {
      return { code: "invalid_creds", message: COPY.invalid_creds };
    }
  }

  return { code: "unknown", message: COPY.unknown };
}
