import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  fetchThemePreference,
  persistThemePreference,
  readCachedTheme,
  type ThemePreference,
} from "@/theme/api";

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (next: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Single global Light/Dark source of truth pro celou appku. Mountuje se v App.tsx,
 * žádný re-mount při SPA navigaci. Tím se vyhneme race condition kdy stránka
 * po klik toggle fetchla z DB starou hodnotu před tím, než persist proběhl.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(() =>
    readCachedTheme(),
  );
  const userTouched = useRef(false);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchThemePreference().then((dbTheme) => {
      if (cancelled || userTouched.current) return;
      if (dbTheme !== theme) {
        setThemeState(dbTheme);
        applyTheme(dbTheme);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    userTouched.current = true;
    setThemeState(next);
    applyTheme(next);
    void persistThemePreference(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

// Re-export pod historickým názvem (cashflow / voicehub kód používá oba).
export const useThemePreference = useTheme;
