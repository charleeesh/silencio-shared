import { supabase } from "@/lib/supabase";

export type ThemePreference = "dark" | "light";

const STORAGE_KEY = "silencio.theme";

export function readCachedTheme(): ThemePreference {
  if (typeof localStorage === "undefined") return "dark";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
}

export function writeCachedTheme(theme: ThemePreference): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
  root.setAttribute("data-theme", theme);
}

export async function fetchThemePreference(): Promise<ThemePreference> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return readCachedTheme();
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("theme_preference")
    .eq("id", userData.user.id)
    .single();
  if (error || !data) {
    return readCachedTheme();
  }
  const theme = (data.theme_preference as ThemePreference) ?? "dark";
  writeCachedTheme(theme);
  return theme;
}

export async function persistThemePreference(
  theme: ThemePreference,
): Promise<void> {
  writeCachedTheme(theme);
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return;
  const { error } = await supabase
    .from("profiles")
    .update({ theme_preference: theme })
    .eq("id", userData.user.id);
  if (error) {
    console.warn("Theme persist failed (cached locally):", error.message);
  }
}
