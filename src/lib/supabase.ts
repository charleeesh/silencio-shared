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
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

if (!url || !publishableKey) {
  throw new Error(
    "silencio-shared: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment.",
  );
}

export const supabase: SupabaseClient = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
