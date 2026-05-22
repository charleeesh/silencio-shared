import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Interní Supabase klient pro sdílené komponenty (auth, theme persist do
 * `public.profiles`). Default schema `public` — auth + profile lookup
 * nepotřebuje sub-app specifický namespace.
 *
 * Sub-app si nadále vytváří **vlastní** klienta pro doménová data
 * (`cashflow.*`, `voicehub.*` schema). Oba klienti sdílí session přes
 * localStorage (stejná hub.silencio.cz doména).
 *
 * **Dvě cesty inicializace** (v0.1.3+):
 *
 * 1. **Explicitní (preferované):** sub-app v `main.tsx` zavolá
 *    `setSupabaseClient(myClient)` se svým vlastním klientem. Tím se
 *    `public.profiles` + `auth.*` čte přes ten samý klient jako
 *    doménová data — jeden session, jedna instance.
 *
 * 2. **Implicitní (fallback):** pokud sub-app `setSupabaseClient` nezavolá,
 *    shared si vytvoří vlastní klient z `import.meta.env.VITE_SUPABASE_URL`
 *    a `VITE_SUPABASE_PUBLISHABLE_KEY`. Env vars se čtou přes **bracket
 *    access** (`(import.meta as any)["env"]`), aby Vite/Rollup při build
 *    library mode NEpropagoval `undefined` (Vite static analyzer matchuje
 *    jen `import.meta.env.NAME`, dot-access). Tím zůstává reference
 *    runtime → sub-app's env vars se resolvnou až when sub-app runs.
 *
 * **Historie chyby (v0.1.0–v0.1.2):** `import.meta.env.VITE_SUPABASE_URL`
 * v shared zdroji se při shared build (kde `.env` chybí) replacoval na
 * `undefined`, Rollup tree-shaknul celý `createClient` blok do dead-code,
 * výsledný dist obsahoval jen `throw new Error("missing VITE_...")`.
 * Sub-app at runtime tedy nikdy nedostala funkční Supabase klient ze shared.
 */

let _client: SupabaseClient | undefined;
let _externalClient: SupabaseClient | undefined;

/**
 * Předá sub-appův Supabase klient sharedu. Volej JEDNOU v `main.tsx`
 * před prvním renderem, aby auth + theme persist používaly stejnou
 * instanci jako doménová data.
 */
export function setSupabaseClient(client: SupabaseClient): void {
  _externalClient = client;
}

function ensureClient(): SupabaseClient {
  if (_externalClient) return _externalClient;
  if (_client) return _client;
  // Bracket access bypasses Vite static replacement at shared build time —
  // ponecháno jako runtime expression, sub-app dostane své env vars.
  const env =
    ((import.meta as unknown as { env?: Record<string, string | undefined> })[
      "env"
    ]) ?? {};
  const url = env["VITE_SUPABASE_URL"];
  const publishableKey = env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishableKey) {
    throw new Error(
      "silencio-shared: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment. " +
        "Either set these vars in sub-app's .env, or call setSupabaseClient() with your own client.",
    );
  }
  _client = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = ensureClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
