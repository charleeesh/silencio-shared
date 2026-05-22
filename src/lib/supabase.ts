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
 * Env vars (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
 *
 * **Lazy init přes Proxy** — bez tohoto by `throw new Error(...)` na
 * top-level při buildu sub-app (kdy shared dist je už předbuildnutý a
 * env vars nejsou ve scope) způsobil dead-code elimination za throwem,
 * což rozbije named exports z bundle (Rolldown/Vite 8 chování).
 */

let _client: SupabaseClient | undefined;

function ensureClient(): SupabaseClient {
  if (_client) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
    | string
    | undefined;
  if (!url || !publishableKey) {
    throw new Error(
      "silencio-shared: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment.",
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
