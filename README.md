# silencio-shared

Sdílený design system pro **Silencio Finance Hub** ekosystém — `hub`, `budgeting`, `cashflow`, `voicehub`. Jeden zdroj pravdy pro AppShell, auth flow, theme provider a design tokeny.

## Proč existuje

Před extrakcí žil identický kód ve čtyřech repech — `AppShell.tsx`, `ThemeProvider.tsx`, login/forgot/reset stránky, `index.css` s brand tokeny. Když se v jedné z nich opravil bug, ostatní zdrojily, dokud se to nepropsalo manuálním copy-paste. `silencio-shared` ten copy-paste řez.

Hub repo (`silencio/hub/src/`) je nadále **canonical zdroj** designu. Tento balíček je extrahovaný snapshot, který sub-apps konzumují jako git dependency.

## Instalace

V `package.json` sub-app:

```json
{
  "dependencies": {
    "silencio-shared": "github:charleeesh/silencio-shared#v0.1.0"
  }
}
```

```bash
npm install
```

Bumpování verze: změň tag (`#v0.1.0` → `#v0.2.0`) a `npm update silencio-shared`.

## Použití

### 1. Importuj CSS tokeny

V hlavním globálním CSS sub-app (`src/index.css`):

```css
@import "tailwindcss";
@import "silencio-shared/tokens.css";
```

⚠️ **Tailwind v4 quirk:** `silencio-shared/tokens.css` **neimportuje** `tailwindcss` — sub-app si Tailwind taháт sama. Tokens jen rozšiřují `@theme` o brand barvy/fonty a hlídají `border-color` v `@layer base`.

### 2. Mountuj ThemeProvider

V `App.tsx`:

```tsx
import { ThemeProvider } from "silencio-shared";

export function App() {
  return (
    <ThemeProvider>
      {/* router … */}
    </ThemeProvider>
  );
}
```

### 3. AppShell + Auth

```tsx
import { Routes, Route } from "react-router-dom";
import {
  AppShell,
  RequireAuth,
  RedirectIfAuthed,
  LoginPage,
  ForgotPasswordPage,
  SetNewPasswordPage,
  ExpiredLinkPage,
} from "silencio-shared";

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthed><LoginPage appWordmark="Cashflow" /></RedirectIfAuthed>} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage appWordmark="Cashflow" />} />
      <Route path="/auth/reset" element={<SetNewPasswordPage appWordmark="Cashflow" />} />
      <Route path="/auth/expired" element={<ExpiredLinkPage appWordmark="Cashflow" />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell appName="Cashflow">
              <Dashboard />
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
```

`appName` v `AppShell` = wordmark vedle loga (`[silencio] CASHFLOW`). `appWordmark` v auth pages = hero text na login screenu (`Silencio\nCashflow.`).

### 4. UI primitives

```tsx
import {
  MetricCard,
  PageHeader,
  PrimaryButton,
  SpotlightCard,
  NeutralChip,
  SignalChip,
  BrandChip,
  cn,
} from "silencio-shared";
```

### 5. Favicon

Sub-app `public/favicon.ico` musí být canonical Silencio favicon. Buď jednorázové překopírování z `node_modules/silencio-shared/public/favicon.ico` do `<sub-app>/public/favicon.ico`, nebo postscript v `package.json`:

```json
{
  "scripts": {
    "postinstall": "cp node_modules/silencio-shared/public/favicon.ico public/favicon.ico"
  }
}
```

## Peer dependencies

Balíček nic nebundluje. Sub-app musí mít nainstalované:

| Package | Verze |
|---|---|
| `react`, `react-dom` | `^19.0.0` |
| `react-router-dom` | `^7.0.0` |
| `tailwindcss` | `^4.0.0` |
| `@supabase/supabase-js` | `^2.0.0` |
| `lucide-react` | `>=0.400.0` |
| `clsx`, `tailwind-merge` | `^2 / ^3` |
| `react-hook-form` | `^7.0.0` |
| `@hookform/resolvers` | `^3 / ^4 / ^5` |
| `zod` | `^3 / ^4` |

Sub-app si nadále drží **vlastní Supabase client** v `src/lib/supabase.ts` pro schema-specific dotazy (`cashflow.*`, `voicehub.*`). Sdílený balíček si **interně** dělá vlastní `public.*` client z env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` pro auth + profiles (theme). Oba klienti sdílí session přes localStorage.

## Co balíček NEobsahuje

- **Per-app pages** (Dashboard, Projects, Transactions, atd.) — sub-app si vlastní.
- **Supabase typy** — každá sub-app má `database.types.ts` ze svého schema namespace.
- **Per-app routing** — sub-app má vlastní React Router config.
- **Per-app `.env` / Supabase client** — env vars jsou per-projekt v Vercelu.

## Žít s tím

Pokud chceš v jedné sub-app jiný styl než ve sdíleném:
- **Drobná odchylka** → override přes Tailwind classes (předej `className` propu) nebo wrapper komponent.
- **Větší změna** → otevři PR do `silencio-shared`. Pravidlo: změny se dělají **nejdřív v hub canonical zdroji**, pak portované sem.

## Workflow pro update

1. Změna kódu v `silencio/shared/src/...`
2. Bump verze v `package.json` (`0.1.0` → `0.2.0`) a doplň `CHANGELOG.md`
3. Commit + tag + push:
   ```bash
   git commit -am "v0.2.0: …"
   git tag v0.2.0
   git push origin main --tags
   ```
4. V každé sub-app updatuj `package.json` (`#v0.1.0` → `#v0.2.0`) + `npm install`

## Build

```bash
npm install
npm run build
```

Produkuje:
- `dist/index.js` — ESM bundle
- `dist/index.d.ts` — TypeScript typy
- `dist/tokens.css` — design tokeny
- `dist/assets/logo/silencio-{white,black}.png` — branding
- `public/favicon.ico` — canonical favicon (mimo `dist`)

## Licence

Private. Silencio FX s.r.o.
