/**
 * URL produkčního hubu, na který sub-app v produkci redirectne při kliku na
 * logo / sign-outu. V dev modu (`import.meta.env.DEV`) sub-app zůstává v
 * lokálním routeru.
 */
export const HUB_HOME_URL = "https://hub.silencio.cz/";

/**
 * Identifikuje sub-app podle Vite `BASE_URL` (`"/budget/"`, `"/cashflow/"`,
 * `"/voice/"`, `"/"` pro hub). Užitečné pro brand barvy / accent volby v
 * sdílených komponentech, které chtějí vědět, kde se vykreslují.
 */
export type SubApp = "hub" | "budget" | "cashflow" | "voice" | "unknown";

function readEnv(): Record<string, unknown> {
  return ((import.meta as unknown as { env?: Record<string, unknown> })[
    "env"
  ]) ?? {};
}

export function getCurrentSubApp(): SubApp {
  // BASE_URL přes bracket-access — dot-access by shared library build replacnul
  // konstantou ze shared kontextu (kde BASE_URL='/'), což by maskovalo sub-app
  // (kde BASE_URL='/budget/'). Bracket-access ponechává runtime expression.
  const base = readEnv()["BASE_URL"] as string | undefined;
  if (!base || base === "/") return "hub";
  const trimmed = base.replace(/^\/+|\/+$/g, "");
  if (trimmed === "budget") return "budget";
  if (trimmed === "cashflow") return "cashflow";
  if (trimmed === "voice") return "voice";
  return "unknown";
}

/**
 * `import.meta.env.DEV` (dot-access) shared library mode build inlinuje na
 * `false`, protože shared build nemá Vite dev kontext (stejný DCE bug jako
 * u env vars, viz `supabase.ts`). Bracket-access ponechává runtime expression
 * → sub-app dev/prod kontext se vyhodnotí až when sub-app runs.
 */
export function isDevMode(): boolean {
  return readEnv()["DEV"] === true;
}
