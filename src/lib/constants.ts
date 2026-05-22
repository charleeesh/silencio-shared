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

export function getCurrentSubApp(): SubApp {
  const base =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.BASE_URL as string | undefined)
      : undefined;
  if (!base || base === "/") return "hub";
  const trimmed = base.replace(/^\/+|\/+$/g, "");
  if (trimmed === "budget") return "budget";
  if (trimmed === "cashflow") return "cashflow";
  if (trimmed === "voice") return "voice";
  return "unknown";
}
