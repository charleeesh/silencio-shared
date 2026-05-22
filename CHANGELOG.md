# Changelog

Verzování podle [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Distribuce přes git tagy (`vX.Y.Z`), žádný npm registry.

## v0.1.1 — 2026-05-22

### Fixed

- **`prepare` script** přidán do `scripts` → npm automaticky spustí `npm run build` po `npm install` v sub-app. Bez toho sub-app dostala package bez `dist/` adresáře (git deps neberou v potaz `files` field jako `npm publish`), takže `import { AppShell } from "silencio-shared"` selhalo s "Cannot find module". Nyní instalace přes git dep funguje out-of-the-box.

## v0.1.0 — 2026-05-22

Initial extract z hub canonical zdroje + voicehub. Plánovaná Fáze 6 z hub progressu.

### Added

- **Design tokens** (`tokens.css`) — Tailwind v4 `@theme` s Inter / Space Grotesk / Archivo Black fonty, lime/blue/magenta brand barvami, dark default `:root` + `.light` custom variant. Plus border-color fix v `@layer base` (Tailwind v4 + shadcn compat).
- **Komponenty**: `AppShell` (s interním `HubHomeLink` pro dev/prod větvení), `SpotlightCard`, `MetricCard` (generic `ReactNode` value + `children` slot + `onClick`/`active`/`accent`), `PageHeader`, `PrimaryButton`.
- **Auth**: `RequireAuth` + `RedirectIfAuthed` (`AuthRoute` alias), `useSession` (`useAuth` alias), full pages `LoginPage` / `ForgotPasswordPage` / `SetNewPasswordPage` / `ExpiredLinkPage` (každá přes `appWordmark` prop), `mapAuthError` s česky lokalizovanými hláškami.
- **Auth primitives**: `AuthLayout` (s `appWordmark` propem), `AuthHeading`, `AuthLink`, `FormError`, `Logo`, `UnderlineInput`, `PasswordInput`.
- **Theme**: `ThemeProvider`, `useTheme`/`useThemePreference`, `ThemeToggle`, persist do `public.profiles.theme_preference` přes interní Supabase client.
- **Chips**: `NeutralChip`, `SignalChip` (text-only lime/blue/magenta), `BrandChip` (bg/15 + brand text).
- **Lib**: `cn()`, `HUB_HOME_URL`, `getCurrentSubApp()`, expose `supabase` (interní klient pro `public.*` schema).
- **Assety**: `silencio-{white,black}.png` logo, canonical `favicon.ico`.

### Notes

- Vite library mode, ESM only.
- Sub-app musí nastavit env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` — bez nich balíček hodí error při startu.
- Sub-app si nadále nese vlastní Supabase client pro per-schema doménová data (cashflow/voicehub). Session sdílena přes localStorage.
