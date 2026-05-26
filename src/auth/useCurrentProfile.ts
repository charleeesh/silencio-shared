import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/auth/useSession";

export type UserRole = "admin" | "producer" | "viewer";
export type SubAppKey = "budgeting" | "cashflow" | "voicehub";

export interface CurrentProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  sub_apps: SubAppKey[];
  must_change_password: boolean;
  theme_preference: "dark" | "light";
}

export interface UseCurrentProfileResult {
  profile: CurrentProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Načte `public.profiles` row pro aktuální session. Vrací `null`, dokud
 * nemáme session. Reload přes `refresh()` po mutacích (změna hesla, update
 * vlastního profile, …).
 */
export function useCurrentProfile(): UseCurrentProfileResult {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user.id ?? null;

  const load = async (uid: string) => {
    setLoading(true);
    setError(null);
    const { data, error: dbErr } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, sub_apps, must_change_password, theme_preference",
      )
      .eq("id", uid)
      .maybeSingle();
    if (dbErr) {
      setError(dbErr.message);
      setProfile(null);
    } else {
      setProfile((data as CurrentProfile | null) ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    void load(userId);
  }, [userId, sessionLoading]);

  const refresh = async () => {
    if (userId) await load(userId);
  };

  return { profile, loading: loading || sessionLoading, error, refresh };
}
